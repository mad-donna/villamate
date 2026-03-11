import { Request, Response } from 'express';
import prisma from '../prisma';
import { sendPushToTokens } from '../utils/push';

export async function createInvoice(req: Request, res: Response) {
  const villaId = parseInt(String(req.params.villaId), 10);
  if (isNaN(villaId)) return res.status(400).json({ error: 'Invalid villaId' });

  const { billingMonth, memo, type, fixedAmount, items } = req.body;

  if (!billingMonth || !type) {
    return res.status(400).json({ error: 'billingMonth and type are required' });
  }
  if (!/^\d{4}-\d{2}$/.test(billingMonth)) {
    return res.status(400).json({ error: 'billingMonth must be in YYYY-MM format' });
  }
  if (type !== 'FIXED' && type !== 'VARIABLE') {
    return res.status(400).json({ error: 'type must be FIXED or VARIABLE' });
  }
  if (type === 'FIXED' && !fixedAmount) {
    return res.status(400).json({ error: 'fixedAmount is required for FIXED invoices' });
  }
  if (type === 'VARIABLE' && (!items || !Array.isArray(items) || items.length === 0)) {
    return res.status(400).json({ error: 'items array is required for VARIABLE invoices' });
  }

  try {
    const residentRecords = await prisma.residentRecord.findMany({
      where: { villaId, residentType: 'HEAD' },
      include: { user: { select: { expoPushToken: true } } },
    });

    if (residentRecords.length === 0) {
      return res.status(400).json({ error: '빌라에 등록된 입주민이 없습니다.' });
    }

    const residentCount = residentRecords.length;
    let totalAmount: number;
    let amountPerResident: number;

    if (type === 'FIXED') {
      amountPerResident = Number(fixedAmount);
      totalAmount = amountPerResident * residentCount;
    } else {
      // VARIABLE: sum all item amounts
      totalAmount = (items as { name: string; amount: number }[]).reduce(
        (sum, item) => sum + Number(item.amount), 0
      );
      amountPerResident = Math.ceil(totalAmount / residentCount);
    }

    const invoice = await prisma.invoice.create({
      data: {
        billingMonth,
        memo: memo || undefined,
        type,
        totalAmount,
        amountPerResident,
        items: type === 'VARIABLE' ? items : undefined,
        villaId,
        payments: {
          create: residentRecords.map((r) => ({
            residentId: r.userId,
            amount: amountPerResident,
            status: 'PENDING',
          })),
        },
      },
      include: { payments: true },
    });

    // Send push notification to all HEAD residents about the new invoice
    try {
      const tokens = residentRecords
        .map((r) => r.user.expoPushToken)
        .filter((t): t is string => !!t);

      if (tokens.length > 0) {
        await sendPushToTokens(
          tokens,
          '새 관리비 청구서 도착 📋',
          `${billingMonth} 관리비가 청구되었습니다. ${amountPerResident.toLocaleString()}원`
        );
      }
    } catch (pushErr) {
      // Push failure must not block the invoice creation response
      console.error('[INVOICE PUSH] Failed to send new invoice notification:', pushErr);
    }

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
}

export async function getInvoices(req: Request, res: Response) {
  const villaId = parseInt(String(req.params.villaId), 10);
  if (isNaN(villaId)) return res.status(400).json({ error: 'Invalid villaId' });

  try {
    const invoices = await prisma.invoice.findMany({
      where: { villaId },
      include: {
        payments: {
          include: { resident: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(invoices);
  } catch (error) {
    console.error('Fetch invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
}

export async function getResidentPayments(req: Request, res: Response) {
  const residentId = String(req.params.residentId);
  try {
    // MEMBER residents are sub-residents of a household — they have no invoice payments
    const record = await prisma.residentRecord.findFirst({
      where: { userId: residentId },
      select: { residentType: true },
    });
    if (record && record.residentType === 'MEMBER') {
      return res.status(200).json([]);
    }

    const payments = await prisma.invoicePayment.findMany({
      where: { residentId },
      include: {
        invoice: {
          include: {
            villa: { select: { name: true, bankName: true, accountNumber: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(payments);
  } catch (error) {
    console.error('Fetch payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
}

export async function updatePaymentStatus(req: Request, res: Response) {
  const paymentId = String(req.params.paymentId);
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });

  try {
    const payment = await prisma.invoicePayment.update({
      where: { id: paymentId },
      data: { status },
    });
    res.status(200).json(payment);
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
}

export async function transferPayment(req: Request, res: Response) {
  const paymentId = String(req.params.paymentId);
  try {
    const payment = await prisma.invoicePayment.update({
      where: { id: paymentId },
      data: { status: 'TRANSFERRED' },
    });
    res.status(200).json(payment);
  } catch (error) {
    console.error('Transfer payment error:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
}

export async function confirmPayment(req: Request, res: Response) {
  const paymentId = String(req.params.paymentId);
  try {
    const payment = await prisma.invoicePayment.update({
      where: { id: paymentId },
      data: { status: 'COMPLETED' },
    });
    res.status(200).json(payment);
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
}

export async function transferInvoice(req: Request, res: Response) {
  const invoiceId = String(req.params.invoiceId);
  const { residentId } = req.body;
  if (!residentId) return res.status(400).json({ error: 'residentId is required' });
  try {
    const payment = await prisma.invoicePayment.updateMany({
      where: { invoiceId, residentId },
      data: { status: 'TRANSFERRED' },
    });
    // Also update Invoice.status to TRANSFERRED if not already PAID
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'TRANSFERRED' },
    }).catch(() => {}); // ignore if already PAID
    res.json({ updated: payment.count });
  } catch (error) {
    console.error('Invoice transfer error:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
}

export async function confirmInvoice(req: Request, res: Response) {
  const invoiceId = String(req.params.invoiceId);
  const { paymentId } = req.body;
  if (!paymentId) return res.status(400).json({ error: 'paymentId is required' });
  try {
    // Mark this specific payment as COMPLETED
    await prisma.invoicePayment.update({
      where: { id: paymentId },
      data: { status: 'COMPLETED' },
    });

    // Check if ALL payments for this invoice are COMPLETED → mark invoice as PAID
    const allPayments = await prisma.invoicePayment.findMany({ where: { invoiceId } });
    const allDone = allPayments.length > 0 && allPayments.every((p) => p.status === 'COMPLETED');
    if (allDone) {
      await prisma.invoice.update({ where: { id: invoiceId }, data: { status: 'PAID' } });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Invoice confirm error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
}

export async function getInvoicePayments(req: Request, res: Response) {
  const invoiceId = String(req.params.invoiceId);

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { villaId: true },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const payments = await prisma.invoicePayment.findMany({
      where: { invoiceId },
      include: {
        resident: {
          select: {
            name: true,
            residentRecords: {
              where: { villaId: invoice.villaId },
              select: { roomNumber: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const result = payments.map((p) => ({
      id: p.id,
      invoiceId: p.invoiceId,
      residentId: p.residentId,
      amount: p.amount,
      status: p.status,
      createdAt: p.createdAt,
      user: {
        name: p.resident.name,
        roomNumber: p.resident.residentRecords[0]?.roomNumber ?? '',
      },
    }));

    res.json(result);
  } catch (error) {
    console.error('Fetch invoice payments error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice payments' });
  }
}

export async function updateInvoice(req: Request, res: Response) {
  const invoiceId = String(req.params.invoiceId);

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    if (!invoice) {
      return res.status(404).json({ error: '청구서를 찾을 수 없습니다.' });
    }

    const hasCompletedPayment = invoice.payments.some((p) => p.status === 'COMPLETED');
    if (hasCompletedPayment) {
      return res.status(400).json({ error: '이미 납부한 세대가 있어 수정할 수 없습니다' });
    }

    const { billingMonth, memo, type, fixedAmount } = req.body;

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        billingMonth: billingMonth || undefined,
        memo: memo !== undefined ? memo : undefined,
        type: type || undefined,
        totalAmount: fixedAmount ? Number(fixedAmount) : undefined,
        amountPerResident: fixedAmount ? Number(fixedAmount) : undefined,
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
}
