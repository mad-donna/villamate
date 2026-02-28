import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Villamate API is running' });
});

// File upload endpoint — returns a public URL for the uploaded file
app.post('/api/upload', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const fileUrl = `http://192.168.219.178:3000/uploads/${req.file.filename}`;
  res.json({ fileUrl });
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

// Get residents by villa ID (ordered by roomNumber asc, includes recordId + joinedAt)
app.get('/api/villas/:villaId/residents', async (req: Request, res: Response) => {
  const villaId = parseInt(String(req.params.villaId), 10);
  if (isNaN(villaId)) return res.status(400).json({ error: 'villaId must be a number' });

  try {
    const records = await prisma.residentRecord.findMany({
      where: { villaId },
      include: { user: true },
      orderBy: { roomNumber: 'asc' },
    });
    const result = records.map((r) => ({
      recordId: r.id,
      userId: r.userId,
      name: r.user.name,
      roomNumber: r.roomNumber,
      joinedAt: r.joinedAt,
    }));
    res.json(result);
  } catch (error) {
    console.error('Fetch residents error:', error);
    res.status(500).json({ error: 'Failed to fetch residents' });
  }
});

// Move-out: delete a resident's ResidentRecord for this villa (keeps payment history)
app.post('/api/villas/:villaId/residents/:residentId/move-out', async (req: Request, res: Response) => {
  const villaId = parseInt(String(req.params.villaId), 10);
  const residentId = String(req.params.residentId);
  if (isNaN(villaId)) return res.status(400).json({ error: 'villaId must be a number' });

  try {
    await prisma.residentRecord.deleteMany({
      where: {
        villaId,
        userId: residentId,
      },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Move-out error:', error);
    res.status(500).json({ error: 'Failed to process move-out' });
  }
});

// Get all vehicles registered in a villa (includes owner name + roomNumber)
app.get('/api/villas/:villaId/vehicles', async (req: Request, res: Response) => {
  const { villaId } = req.params;
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { villaId: Number(villaId) },
      include: {
        owner: {
          include: {
            residentRecords: {
              where: { villaId: Number(villaId) },
              select: { roomNumber: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = vehicles.map((v) => ({
      id: v.id,
      plateNumber: v.plateNumber,
      modelName: (v as any).modelName ?? null,
      isVisitor: v.isVisitor,
      expectedDeparture: v.expectedDeparture ?? null,
      owner: {
        name: v.owner.name,
        roomNumber: v.owner.residentRecords[0]?.roomNumber ?? null,
      },
    }));

    res.json(result);
  } catch (error) {
    console.error('Fetch villa vehicles error:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Search vehicles by plate number within a villa (includes owner name + roomNumber)
// NOTE: This route MUST be registered before /api/villas/:adminId to avoid wildcard shadowing.
app.get('/api/villas/:villaId/vehicles/search', async (req: Request, res: Response) => {
  try {
    const villaId = parseInt(String(req.params.villaId), 10);
    if (isNaN(villaId)) {
      return res.status(400).json({ message: '빌라 ID가 올바르지 않습니다.' });
    }
    const query = String(req.query.query ?? '');
    const vehicles = await prisma.vehicle.findMany({
      where: {
        villaId,
        plateNumber: { contains: query },
      },
      include: { owner: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const result = await Promise.all(vehicles.map(async (v) => {
      const record = await prisma.residentRecord.findFirst({
        where: { userId: v.ownerId, villaId },
        select: { roomNumber: true },
      });
      return { ...v, owner: { name: v.owner.name, roomNumber: record?.roomNumber ?? null } };
    }));
    res.json(result);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Create a building event for a villa (history/contract record)
app.post('/api/villas/:villaId/building-events', async (req: Request, res: Response) => {
  const { villaId } = req.params;
  const { title, description, category, eventDate, contractorName, contactNumber, creatorId, attachmentUrl } = req.body;
  if (!title || !category || !eventDate || !creatorId) {
    return res.status(400).json({ error: 'title, category, eventDate, creatorId are required' });
  }
  try {
    const event = await prisma.buildingEvent.create({
      data: {
        title,
        description: description || null,
        category,
        eventDate,
        contractorName: contractorName || null,
        contactNumber: contactNumber || null,
        villaId: Number(villaId),
        creatorId: String(creatorId),
        attachmentUrl: attachmentUrl || null,
      },
    });
    res.status(201).json(event);
  } catch (error) {
    console.error('Create building event error:', error);
    res.status(500).json({ error: 'Failed to create building event' });
  }
});

// Get all building events for a villa (ordered by eventDate desc)
app.get('/api/villas/:villaId/building-events', async (req: Request, res: Response) => {
  const { villaId } = req.params;
  try {
    const events = await prisma.buildingEvent.findMany({
      where: { villaId: Number(villaId) },
      orderBy: { eventDate: 'desc' },
    });
    res.json(events);
  } catch (error) {
    console.error('Fetch building events error:', error);
    res.status(500).json({ error: 'Failed to fetch building events' });
  }
});

// Get villa details by villaId (numeric ID) — placed before wildcard :adminId to avoid shadowing
app.get('/api/villas/:villaId/detail', async (req: Request, res: Response) => {
  const villaId = parseInt(String(req.params.villaId), 10);
  if (isNaN(villaId)) return res.status(400).json({ error: 'Invalid villaId' });

  try {
    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
    });
    if (!villa) return res.status(404).json({ error: 'Villa not found' });
    res.json(villa);
  } catch (error) {
    console.error('Fetch villa detail error:', error);
    res.status(500).json({ error: 'Failed to fetch villa' });
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

// Get all posts for a villa (notices first, then by most recent)
app.get('/api/villas/:villaId/posts', async (req: Request, res: Response) => {
  const villaId = parseInt(String(req.params.villaId), 10);
  if (isNaN(villaId)) return res.status(400).json({ error: 'Invalid villaId' });

  try {
    const posts = await prisma.post.findMany({
      where: { villaId },
      include: {
        author: { select: { name: true } },
      },
      orderBy: [{ isNotice: 'desc' }, { createdAt: 'desc' }],
    });

    // Resolve roomNumber from ResidentRecord since it lives there, not on User
    const postsWithRoomNumber = await Promise.all(
      posts.map(async (post) => {
        const record = await prisma.residentRecord.findFirst({
          where: { userId: post.authorId, villaId },
          select: { roomNumber: true },
        });
        return {
          ...post,
          author: {
            name: post.author.name,
            roomNumber: record?.roomNumber ?? null,
          },
        };
      })
    );

    res.status(200).json(postsWithRoomNumber);
  } catch (error) {
    console.error('Fetch posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Create a new post for a villa
app.post('/api/villas/:villaId/posts', async (req: Request, res: Response) => {
  const villaId = parseInt(String(req.params.villaId), 10);
  if (isNaN(villaId)) return res.status(400).json({ error: 'Invalid villaId' });

  const { title, content, authorId, isNotice } = req.body;

  if (!title || !content || !authorId) {
    return res.status(400).json({ error: 'title, content, and authorId are required' });
  }

  try {
    const post = await prisma.post.create({
      data: {
        title: String(title),
        content: String(content),
        isNotice: Boolean(isNotice) || false,
        authorId: String(authorId),
        villaId,
      },
    });
    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Toggle notice (pin/unpin) for a post — max 3 pinned notices per villa
app.put('/api/posts/:postId/notice', async (req: Request, res: Response) => {
  const postId = String(req.params.postId);
  const { isNotice, villaId } = req.body;

  if (typeof isNotice !== 'boolean' || !villaId) {
    return res.status(400).json({ error: 'isNotice (boolean) and villaId are required' });
  }

  try {
    if (isNotice === true) {
      const count = await prisma.post.count({
        where: { villaId: parseInt(String(villaId), 10), isNotice: true },
      });
      if (count >= 3) {
        return res.status(400).json({ message: '공지사항은 최대 3개까지만 등록할 수 있습니다.' });
      }
    }

    const updated = await prisma.post.update({
      where: { id: postId },
      data: { isNotice },
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error('Toggle notice error:', error);
    res.status(500).json({ error: 'Failed to update notice status' });
  }
});

// Get a single post by ID (with author name + roomNumber)
app.get('/api/posts/:postId', async (req: Request, res: Response) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: String(req.params.postId) },
      include: { author: { select: { name: true } } },
    });
    if (!post) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });

    // Resolve roomNumber via ResidentRecord (it lives there, not on User)
    const record = await prisma.residentRecord.findFirst({
      where: { userId: post.authorId, villaId: post.villaId },
      select: { roomNumber: true },
    });

    res.json({
      ...post,
      author: { name: post.author.name, roomNumber: record?.roomNumber ?? null },
    });
  } catch (err: any) {
    console.error('Fetch post error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get all comments for a post (with author name + roomNumber)
app.get('/api/posts/:postId/comments', async (req: Request, res: Response) => {
  try {
    const postId = String(req.params.postId);
    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { name: true } } },
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { villaId: true },
    });
    const villaId = post?.villaId;

    const result = await Promise.all(
      comments.map(async (c) => {
        const record = await prisma.residentRecord.findFirst({
          where: { userId: c.authorId, villaId },
          select: { roomNumber: true },
        });
        return { ...c, author: { name: c.author.name, roomNumber: record?.roomNumber ?? null } };
      })
    );

    res.json(result);
  } catch (err: any) {
    console.error('Fetch comments error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Post a new comment on a post
app.post('/api/posts/:postId/comments', async (req: Request, res: Response) => {
  try {
    const { content, authorId } = req.body;
    if (!content || !authorId) {
      return res.status(400).json({ message: 'content and authorId are required' });
    }
    const comment = await prisma.comment.create({
      data: { content, authorId, postId: String(req.params.postId) },
    });
    res.status(201).json(comment);
  } catch (err: any) {
    console.error('Create comment error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Delete a post by ID — only the author may delete
app.delete('/api/posts/:postId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const post = await prisma.post.findUnique({ where: { id: String(req.params.postId) } });
    if (!post) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    if (post.authorId !== userId) return res.status(403).json({ message: '삭제 권한이 없습니다.' });
    await prisma.post.delete({ where: { id: String(req.params.postId) } });
    res.json({ message: '게시글이 삭제되었습니다.' });
  } catch (err: any) {
    console.error('Delete post error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Register a vehicle (resident or visitor)
app.post('/api/vehicles', async (req: Request, res: Response) => {
  const { plateNumber, ownerId, villaId, isVisitor, expectedDeparture, modelName } = req.body;
  if (!plateNumber || !ownerId || !villaId) {
    return res.status(400).json({ message: '필수 항목이 누락되었습니다.' });
  }
  const parsedVillaId = parseInt(String(villaId), 10);
  if (isNaN(parsedVillaId)) {
    return res.status(400).json({ message: '빌라 정보가 올바르지 않습니다.' });
  }
  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        plateNumber,
        modelName: modelName || null,
        ownerId,
        villaId: parsedVillaId,
        isVisitor: Boolean(isVisitor),
        expectedDeparture: expectedDeparture || null,
      },
    });
    res.status(201).json(vehicle);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get all vehicles registered by a specific user
app.get('/api/users/:userId/vehicles', async (req: Request, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { ownerId: String(req.params.userId) },
      orderBy: { createdAt: 'desc' },
    });
    res.json(vehicles);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Delete a vehicle by ID
app.delete('/api/vehicles/:vehicleId', async (req: Request, res: Response) => {
  try {
    await prisma.vehicle.delete({ where: { id: String(req.params.vehicleId) } });
    res.json({ message: '차량이 삭제되었습니다.' });
  } catch (err: any) {
    console.error(err);
    if (err.code === 'P2025') {
      return res.status(404).json({ message: '차량을 찾을 수 없습니다.' });
    }
    res.status(500).json({ message: err.message });
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

// Create an external bill for a villa (non-resident target — e.g. contractors, visitors)
app.post('/api/villas/:villaId/external-bills', async (req: Request, res: Response) => {
  const villaId = parseInt(String(req.params.villaId), 10);
  if (isNaN(villaId)) return res.status(400).json({ error: 'Invalid villaId' });

  const { targetName, phoneNumber, amount, description, dueDate } = req.body;
  if (!targetName || !phoneNumber || !amount || !description || !dueDate) {
    return res.status(400).json({ error: 'targetName, phoneNumber, amount, description, dueDate are all required' });
  }

  try {
    const bill = await prisma.externalBilling.create({
      data: {
        targetName: String(targetName),
        phoneNumber: String(phoneNumber),
        amount: Number(amount),
        description: String(description),
        dueDate: String(dueDate),
        villaId,
      },
    });
    res.status(201).json(bill);
  } catch (error) {
    console.error('Create external bill error:', error);
    res.status(500).json({ error: 'Failed to create external bill' });
  }
});

// Get all external bills for a villa (newest first)
app.get('/api/villas/:villaId/external-bills', async (req: Request, res: Response) => {
  const villaId = parseInt(String(req.params.villaId), 10);
  if (isNaN(villaId)) return res.status(400).json({ error: 'Invalid villaId' });

  try {
    const bills = await prisma.externalBilling.findMany({
      where: { villaId },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(bills);
  } catch (error) {
    console.error('Fetch external bills error:', error);
    res.status(500).json({ error: 'Failed to fetch external bills' });
  }
});

// Confirm an external bill — mark it as COMPLETED
app.patch('/api/villas/:villaId/external-bills/:billId/confirm', async (req: Request, res: Response) => {
  const billId = String(req.params.billId);

  try {
    const bill = await prisma.externalBilling.update({
      where: { id: billId },
      data: { status: 'COMPLETED' },
    });
    res.status(200).json(bill);
  } catch (error) {
    console.error('Confirm external bill error:', error);
    res.status(500).json({ error: 'Failed to confirm external bill' });
  }
});

// Public payment page for an external bill (mobile-friendly Korean HTML)
app.get('/pay/:billId', async (req: Request, res: Response) => {
  const billId = String(req.params.billId);

  try {
    const bill = await prisma.externalBilling.findUnique({
      where: { id: billId },
      include: {
        villa: { select: { accountNumber: true, bankName: true } },
      },
    });

    if (!bill) {
      return res.status(404).send('<html><body><h2>청구서를 찾을 수 없습니다.</h2></body></html>');
    }

    const formattedAmount = bill.amount.toLocaleString('ko-KR');
    const statusLabel =
      bill.status === 'COMPLETED' ? '납부 완료'
      : bill.status === 'PENDING_CONFIRMATION' ? '납부 확인 중'
      : '미납';

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <title>빌라메이트 청구서</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F2F2F7; min-height: 100vh; }
    .container { max-width: 480px; margin: 0 auto; padding: 24px 16px 40px; }
    .header { text-align: center; padding: 32px 0 24px; }
    .header h1 { font-size: 22px; font-weight: 700; color: #1C1C1E; }
    .header p { font-size: 14px; color: #8E8E93; margin-top: 6px; }
    .card { background: #FFFFFF; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .card-title { font-size: 12px; font-weight: 600; color: #8E8E93; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px; }
    .row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #F2F2F7; }
    .row:last-child { border-bottom: none; }
    .row-label { font-size: 15px; color: #3C3C43; }
    .row-value { font-size: 15px; font-weight: 500; color: #1C1C1E; text-align: right; max-width: 60%; }
    .amount-value { font-size: 22px; font-weight: 700; color: #007AFF; }
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .status-PENDING { background: #FFF3CD; color: #856404; }
    .status-PENDING_CONFIRMATION { background: #D1ECF1; color: #0C5460; }
    .status-COMPLETED { background: #D4EDDA; color: #155724; }
    .btn { display: block; width: 100%; padding: 16px; background: #4CAF50; color: #FFFFFF; border: none; border-radius: 14px; font-size: 17px; font-weight: 700; cursor: pointer; text-align: center; margin-top: 8px; transition: opacity 0.15s; }
    .btn:active { opacity: 0.8; }
    .btn:disabled { background: #C7C7CC; cursor: not-allowed; }
    .notice { font-size: 13px; color: #8E8E93; text-align: center; margin-top: 16px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>빌라메이트 청구서</h1>
      <p>${bill.targetName}님께 발송된 청구서입니다</p>
    </div>

    <div class="card">
      <div class="card-title">청구 내용</div>
      <div class="row">
        <span class="row-label">내용</span>
        <span class="row-value">${bill.description}</span>
      </div>
      <div class="row">
        <span class="row-label">금액</span>
        <span class="row-value amount-value">${formattedAmount}원</span>
      </div>
      <div class="row">
        <span class="row-label">납부 기한</span>
        <span class="row-value">${bill.dueDate}</span>
      </div>
      <div class="row">
        <span class="row-label">상태</span>
        <span class="status-badge status-${bill.status}">${statusLabel}</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">입금 계좌</div>
      <div class="row">
        <span class="row-label">은행</span>
        <span class="row-value">${bill.villa.bankName}</span>
      </div>
      <div class="row">
        <span class="row-label">계좌번호</span>
        <span class="row-value">${bill.villa.accountNumber}</span>
      </div>
    </div>

    <button class="btn" id="notifyBtn" onclick="sendNotify()" ${bill.status === 'COMPLETED' ? 'disabled' : ''}>
      ${bill.status === 'COMPLETED' ? '납부가 완료되었습니다' : '입금 완료 알림 보내기'}
    </button>
    <p class="notice">입금 후 위 버튼을 눌러 관리자에게 알려주세요.<br>관리자가 확인 후 납부 처리됩니다.</p>
  </div>

  <script>
    async function sendNotify() {
      const btn = document.getElementById('notifyBtn');
      btn.disabled = true;
      btn.textContent = '전송 중...';
      try {
        const res = await fetch('/api/public/pay/${billId}/notify', { method: 'POST' });
        if (res.ok) {
          alert('알림이 전송되었습니다! 관리자가 확인 후 처리합니다.');
          btn.textContent = '알림 전송 완료';
        } else {
          throw new Error('서버 오류');
        }
      } catch (e) {
        alert('알림 전송에 실패했습니다. 다시 시도해주세요.');
        btn.disabled = false;
        btn.textContent = '입금 완료 알림 보내기';
      }
    }
  </script>
</body>
</html>`);
  } catch (error) {
    console.error('External bill pay page error:', error);
    res.status(500).send('<html><body><h2>오류가 발생했습니다. 잠시 후 다시 시도해주세요.</h2></body></html>');
  }
});

// Resident notifies payment — sets bill to PENDING_CONFIRMATION for admin review
app.post('/api/public/pay/:billId/notify', async (req: Request, res: Response) => {
  const billId = String(req.params.billId);

  try {
    await prisma.externalBilling.update({
      where: { id: billId },
      data: { status: 'PENDING_CONFIRMATION' },
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('External bill notify error:', error);
    res.status(500).json({ error: 'Failed to update bill status' });
  }
});

// Dashboard summary data — returns role-specific stats for a user in a villa
app.get('/api/dashboard/:userId', async (req: Request, res: Response) => {
  const villaId = parseInt(String(req.query.villaId), 10);
  const role = String(req.query.role ?? '');

  if (isNaN(villaId)) {
    return res.status(400).json({ error: 'villaId is required' });
  }

  try {
    if (role === 'RESIDENT') {
      const unpaidAggregate = await prisma.invoicePayment.aggregate({
        where: { residentId: String(req.params.userId), status: 'PENDING' },
        _sum: { amount: true },
      });
      const myUnpaidAmount = unpaidAggregate._sum.amount ?? 0;

      const latestNotice = await prisma.post.findFirst({
        where: { villaId, isNotice: true },
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, createdAt: true },
      });

      const myVehicleCount = await prisma.vehicle.count({
        where: { ownerId: String(req.params.userId), villaId },
      });

      const votedPollIds = (await prisma.vote.findMany({
        where: { voterId: String(req.params.userId) },
        select: { pollId: true },
      })).map((v: { pollId: string }) => v.pollId);

      const activePollsCount = await prisma.poll.count({
        where: {
          villaId,
          endDate: { gt: new Date() },
          id: { notIn: votedPollIds },
        },
      });

      return res.json({ myUnpaidAmount, latestNotice, myVehicleCount, activePollsCount });
    }

    if (role === 'ADMIN') {
      const totalUnpaidCount = await prisma.invoicePayment.count({
        where: { invoice: { villaId }, status: 'PENDING' },
      });

      const pendingExternalBillsCount = await prisma.externalBilling.count({
        where: { villaId, status: 'PENDING_CONFIRMATION' },
      });

      const latestNotice = await prisma.post.findFirst({
        where: { villaId, isNotice: true },
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, createdAt: true },
      });

      const activePollsCount = await prisma.poll.count({
        where: { villaId, endDate: { gt: new Date() } },
      });

      return res.json({ totalUnpaidCount, pendingExternalBillsCount, latestNotice, activePollsCount });
    }

    return res.status(400).json({ error: 'role must be ADMIN or RESIDENT' });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Create a poll for a villa (with at least 2 options)
app.post('/api/villas/:villaId/polls', async (req: Request, res: Response) => {
  const villaId = parseInt(String(req.params.villaId), 10);
  if (isNaN(villaId)) return res.status(400).json({ error: 'Invalid villaId' });

  const { title, description, endDate, isAnonymous, creatorId, options } = req.body;

  if (!title || !endDate || !creatorId) {
    return res.status(400).json({ error: 'title, endDate, and creatorId are required' });
  }
  if (!Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: 'options must be an array with at least 2 items' });
  }

  try {
    const poll = await prisma.poll.create({
      data: {
        title,
        description: description || null,
        endDate: new Date(endDate),
        isAnonymous: Boolean(isAnonymous),
        villaId,
        creatorId: String(creatorId),
        options: {
          create: (options as string[]).map((text: string) => ({ text })),
        },
      },
      include: { options: true },
    });
    res.status(201).json(poll);
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

// Get all polls for a villa (with options and vote counts)
app.get('/api/villas/:villaId/polls', async (req: Request, res: Response) => {
  const villaId = parseInt(String(req.params.villaId), 10);
  if (isNaN(villaId)) return res.status(400).json({ error: 'Invalid villaId' });

  try {
    const polls = await prisma.poll.findMany({
      where: { villaId },
      include: {
        options: {
          include: {
            _count: { select: { votes: true } },
            votes: { select: { roomNumber: true, voterId: true } },
          },
        },
        _count: { select: { votes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(polls);
  } catch (error) {
    console.error('Fetch polls error:', error);
    res.status(500).json({ error: 'Failed to fetch polls' });
  }
});

// Cast a vote — enforces 1-house-1-vote and checks poll is still active
app.post('/api/villas/:villaId/polls/:pollId/vote', async (req: Request, res: Response) => {
  const villaId = parseInt(String(req.params.villaId), 10);
  if (isNaN(villaId)) return res.status(400).json({ error: 'Invalid villaId' });
  const pollId = String(req.params.pollId);

  const { voterId, optionId } = req.body;
  if (!voterId || !optionId) {
    return res.status(400).json({ error: 'voterId and optionId are required' });
  }

  try {
    // Verify the voter is a resident of this villa and retrieve their roomNumber
    const record = await prisma.residentRecord.findFirst({
      where: { userId: String(voterId), villaId },
    });
    if (!record) return res.status(403).json({ error: '해당 빌라의 입주민이 아닙니다.' });
    const roomNumber = record.roomNumber;

    // Verify the poll exists and is still active
    const poll = await prisma.poll.findUnique({ where: { id: pollId } });
    if (!poll) return res.status(404).json({ error: '투표를 찾을 수 없습니다.' });
    if (new Date() > poll.endDate) return res.status(400).json({ error: '투표 기간이 종료되었습니다.' });

    // Enforce 1-house-1-vote constraint
    const existing = await prisma.vote.findUnique({
      where: { pollId_roomNumber: { pollId, roomNumber } },
    });
    if (existing) return res.status(409).json({ error: '이미 투표한 세대입니다. (1세대 1표)' });

    // Create the vote
    const vote = await prisma.vote.create({
      data: { pollId, optionId: String(optionId), voterId: String(voterId), roomNumber },
    });
    res.status(201).json(vote);
  } catch (error) {
    console.error('Cast vote error:', error);
    res.status(500).json({ error: 'Failed to cast vote' });
  }
});

export { app };

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
