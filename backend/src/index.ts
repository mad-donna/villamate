import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Villamate API is running' });
});

// Auth login (Simple version: Find or Create)
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { phone, name, role } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: name || 'New User',
          role: role || 'RESIDENT',
        },
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Email/Password Login (MVP - no password hashing)
app.post('/api/auth/email-login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: email.split('@')[0],
        provider: 'LOCAL',
      },
    });
    res.status(200).json(user);
  } catch (error) {
    console.error('Email login error:', error);
    res.status(500).json({ error: 'Email login failed' });
  }
});

// Auth Proxy for Social Login (Redirects back to exp://)
app.get('/api/auth/proxy', (req, res) => {
  res.send(`
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family:sans-serif;text-align:center;padding:48px 24px;background:#fff;">
  <div style="font-size:48px;">✅</div>
  <h2 style="margin:16px 0 8px;color:#1C1C1E;">카카오 로그인 완료!</h2>
  <p style="color:#8E8E93;margin-bottom:32px;">앱으로 돌아가는 중...</p>
  <button id="btn"
    style="padding:16px 40px;background:#FEE500;border:none;border-radius:14px;font-size:17px;font-weight:700;cursor:pointer;color:#191919;">
    앱으로 돌아가기
  </button>
  <script>
    function goBack() {
      const host = window.location.hostname;
      const url = "exp://" + host + ":8081" + window.location.search + window.location.hash;
      window.location.href = url;
    }
    // iOS: 자동 리다이렉트 (ASWebAuthenticationSession이 가로챔)
    goBack();
    // Android: 자동 리다이렉트가 막힌 경우 버튼으로 처리
    document.getElementById('btn').addEventListener('click', goBack);
  </script>
</body>
</html>
`);
});

// Social Login (Google, Kakao, Naver)
app.post('/api/auth/social-login', async (req: Request, res: Response) => {
  const { email, provider, providerId, name } = req.body;

  if (!provider || !providerId) {
    return res.status(400).json({ error: 'Provider and providerId are required' });
  }

  try {
    // 1. Find user by providerId (primary key for social login)
    const existingUser = await prisma.user.findFirst({
      where: { provider, providerId },
    });

    if (existingUser) {
      return res.status(200).json(existingUser);
    }

    // 2. If email provided, check for account collision
    if (email) {
      const emailUser = await prisma.user.findUnique({ where: { email } });
      if (emailUser) {
        return res.status(409).json({
          error: `이미 ${emailUser.provider || '다른'} 계정으로 가입된 이메일입니다.`,
        });
      }
    }

    // 3. Create new social user
    const newUser = await prisma.user.create({
      data: {
        email: email || null,
        provider,
        providerId,
        name: name || 'Social User',
        role: 'RESIDENT',
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ error: 'Social login failed' });
  }
});

// Update User Info (Profile Setup)
app.put('/api/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { phone, role, name } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: String(id) },
      data: {
        phone: phone || undefined,
        role: role || undefined,
        name: name || undefined,
      },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Villa registration
app.post('/api/villas', async (req: Request, res: Response) => {
  const { name, address, totalUnits, adminId, accountNumber, bankName } = req.body;

  if (!name || !address || !adminId) {
    return res.status(400).json({ error: 'Name, address, and adminId are required' });
  }

  try {
    const inviteCode = Math.random().toString(36).toUpperCase().substring(2, 8);

    const villa = await prisma.villa.create({
      data: {
        name,
        address,
        totalUnits: Number(totalUnits) || 0,
        adminId,
        accountNumber: accountNumber || '',
        bankName: bankName || '',
        inviteCode,
      },
    });

    res.status(201).json(villa);
  } catch (error) {
    console.error('Villa registration error:', error);
    res.status(500).json({ error: 'Failed to register villa' });
  }
});

// Resident joins villa by invite code
app.post('/api/villas/join', async (req: Request, res: Response) => {
  const { userId, inviteCode, roomNumber } = req.body;

  if (!userId || !inviteCode || !roomNumber) {
    return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
  }

  try {
    const normalizedCode = String(inviteCode).trim().toUpperCase();
    const villa = await prisma.villa.findFirst({
      where: { inviteCode: normalizedCode },
    });

    if (!villa) {
      return res.status(404).json({ error: '유효하지 않은 초대 코드입니다.' });
    }

    await prisma.residentRecord.upsert({
      where: {
        id: (await prisma.residentRecord.findFirst({ where: { userId, villaId: villa.id } }))?.id ?? 0,
      },
      update: { roomNumber },
      create: { userId, villaId: villa.id, roomNumber },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    res.status(200).json({ user, villa });
  } catch (error) {
    console.error('Villa join error:', error);
    res.status(500).json({ error: 'Failed to join villa' });
  }
});

// Create invoice — supports FIXED (per-resident amount) and VARIABLE (itemised split)
app.post('/api/villas/:villaId/invoices', async (req: Request, res: Response) => {
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
      where: { villaId },
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

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Get invoices for a villa (with payment breakdown per resident)
app.get('/api/villas/:villaId/invoices', async (req: Request, res: Response) => {
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
});

// Get payment records for a specific resident (with nested invoice + villa info)
app.get('/api/residents/:residentId/payments', async (req: Request, res: Response) => {
  const residentId = String(req.params.residentId);
  try {
    const payments = await prisma.invoicePayment.findMany({
      where: { residentId },
      include: {
        invoice: {
          include: {
            villa: { select: { name: true } },
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
});

// Update payment status (e.g. PENDING -> COMPLETED)
app.put('/api/payments/:paymentId/status', async (req: Request, res: Response) => {
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
});

// Get all payment records for a specific invoice (with resident name + room number)
app.get('/api/invoices/:invoiceId/payments', async (req: Request, res: Response) => {
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
});

// Update invoice — blocked if any payment is already COMPLETED
app.put('/api/invoices/:invoiceId', async (req: Request, res: Response) => {
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
});

// Set auto-billing day for a villa (1-28)
app.post('/api/villas/:villaId/auto-billing', async (req: Request, res: Response) => {
  const villaId = parseInt(String(req.params.villaId), 10);
  if (isNaN(villaId)) return res.status(400).json({ error: 'Invalid villaId' });

  const { autoBillingDay } = req.body;
  if (!autoBillingDay || autoBillingDay < 1 || autoBillingDay > 28) {
    return res.status(400).json({ error: 'autoBillingDay must be between 1 and 28' });
  }

  try {
    const villa = await prisma.villa.update({
      where: { id: villaId },
      data: { autoBillingDay: Number(autoBillingDay) },
    });
    res.status(200).json(villa);
  } catch (error) {
    console.error('Auto-billing setup error:', error);
    res.status(500).json({ error: 'Failed to set auto-billing' });
  }
});

// Get the villa a resident belongs to (via ResidentRecord)
app.get('/api/users/:userId/villa', async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const record = await prisma.residentRecord.findFirst({
      where: { userId: String(userId) },
      include: {
        villa: true,
      },
    });

    if (!record) {
      return res.status(404).json({ villa: null });
    }

    res.status(200).json({ villa: record.villa });
  } catch (error) {
    console.error('Fetch resident villa error:', error);
    res.status(500).json({ error: 'Failed to fetch resident villa' });
  }
});

// Get residents by villa ID
app.get('/api/villas/:villaId/residents', async (req: Request, res: Response) => {
  const villaId = parseInt(String(req.params.villaId), 10);

  if (isNaN(villaId)) {
    return res.status(400).json({ error: 'villaId must be a number' });
  }

  try {
    const records = await prisma.residentRecord.findMany({
      where: { villaId },
      include: {
        user: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    const residents = records.map((record) => ({
      id: record.user.id,
      name: record.user.name,
      phone: record.user.phone,
      roomNumber: record.roomNumber,
    }));

    res.status(200).json(residents);
  } catch (error) {
    console.error('Fetch residents error:', error);
    res.status(500).json({ error: 'Failed to fetch residents' });
  }
});

// Get villas by admin ID
app.get('/api/villas/:adminId', async (req: Request, res: Response) => {
  const { adminId } = req.params;

  try {
    const villas = await prisma.villa.findMany({
      where: { adminId: String(adminId) },
      include: {
        residents: {
          include: { user: true },
        },
        _count: {
          select: { residents: true },
        },
      },
    });
    res.status(200).json(villas);
  } catch (error) {
    console.error('Fetch villas error:', error);
    res.status(500).json({ error: 'Failed to fetch villas' });
  }
});

// Daily at 9 AM: auto-generate invoices for villas with autoBillingDay matching today
cron.schedule('0 9 * * *', async () => {
  const today = new Date().getDate();
  console.log(`[CRON] Running auto-billing check for day ${today}`);

  try {
    const villas = await prisma.villa.findMany({
      where: { autoBillingDay: today },
      include: {
        residents: { include: { user: true } },
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
