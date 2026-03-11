import cron from 'node-cron';
import prisma from './prisma';
import { sendPushToTokens } from './utils/push';

/** Daily at 9 AM: auto-generate invoices for villas with autoBillingDay matching today */
export function startAutoBillingCron() {
  cron.schedule('0 9 * * *', async () => {
    const today = new Date().getDate();
    console.log(`[CRON] Running auto-billing check for day ${today}`);

    try {
      const villas = await prisma.villa.findMany({
        where: { autoBillingDay: today },
        include: {
          residents: { where: { residentType: 'HEAD' }, include: { user: true } },
        },
      });

      for (const villa of villas) {
        if (villa.residents.length === 0) continue;

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const billingMonth = `${year}-${month}`;
        const defaultAmount = 50000; // Default; can be customized later
        const perPerson = Math.ceil(defaultAmount / villa.residents.length);

        await prisma.invoice.create({
          data: {
            billingMonth,
            type: 'FIXED',
            totalAmount: defaultAmount,
            amountPerResident: perPerson,
            items: undefined,
            villaId: villa.id,
            payments: {
              create: villa.residents.map((r) => ({
                residentId: r.userId,
                amount: perPerson,
                status: 'PENDING',
              })),
            },
          },
        });

        console.log(`[CRON] Auto-invoice created for villa: ${villa.name}`);
      }
    } catch (error) {
      console.error('[CRON] Auto-billing error:', error);
    }
  });
}

/** Daily at 10 AM: send dunning push notifications for overdue (PENDING) invoice payments */
export function startDunningCron() {
  cron.schedule('0 10 * * *', async () => {
    console.log('[CRON] Running dunning check');

    try {
      const now = new Date();

      // Fetch all PENDING payments together with their invoice and the resident's push token
      const pendingPayments = await prisma.invoicePayment.findMany({
        where: { status: 'PENDING' },
        include: {
          invoice: { select: { createdAt: true, billingMonth: true, amountPerResident: true } },
          resident: { select: { expoPushToken: true } },
        },
      });

      // Separate into 3-day and 7-day buckets
      const tokens3day: string[] = [];
      const tokens7day: string[] = [];
      const billingMonths3day: string[] = [];
      const billingMonths7day: string[] = [];

      for (const payment of pendingPayments) {
        const token = payment.resident.expoPushToken;
        if (!token) continue;

        const daysSince = Math.floor(
          (now.getTime() - payment.invoice.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSince === 3) {
          tokens3day.push(token);
          billingMonths3day.push(payment.invoice.billingMonth);
        } else if (daysSince === 7) {
          tokens7day.push(token);
          billingMonths7day.push(payment.invoice.billingMonth);
        }
        // No reminders beyond 7 days
      }

      // 3-day reminders — send individually so each message carries the correct billingMonth
      for (let i = 0; i < tokens3day.length; i++) {
        try {
          await sendPushToTokens(
            [tokens3day[i]],
            '관리비 미납 안내 ⚠️',
            `${billingMonths3day[i]} 관리비가 아직 미납 상태입니다. 기한 내 납부 부탁드립니다.`
          );
        } catch (err) {
          console.error('[DUNNING] 3-day push error:', err);
        }
      }

      // 7-day final reminders
      for (let i = 0; i < tokens7day.length; i++) {
        try {
          await sendPushToTokens(
            [tokens7day[i]],
            '관리비 미납 안내 ⚠️',
            `[최종 안내] ${billingMonths7day[i]} 관리비 납부를 확인해주세요.`
          );
        } catch (err) {
          console.error('[DUNNING] 7-day push error:', err);
        }
      }

      console.log(
        `[CRON] Dunning complete — 3-day: ${tokens3day.length}, 7-day: ${tokens7day.length}`
      );
    } catch (error) {
      console.error('[CRON] Dunning error:', error);
    }
  });
}
