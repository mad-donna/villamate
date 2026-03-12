import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'villamate-super-secret-2024';

export async function adminLogin(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== 'SUPER_ADMIN') {
      return res.status(401).json({ error: '관리자 계정이 아닙니다.' });
    }
    if (!user.password) {
      return res.status(401).json({ error: '비밀번호가 설정되지 않은 계정입니다.' });
    }
    const match = await bcrypt.compare(String(password), user.password);
    if (!match) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(200).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Admin login failed' });
  }
}

export async function adminMe(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user || user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.status(200).json(user);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export async function listUsers(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    if (decoded.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(users);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export async function listVillas(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    if (decoded.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const villas = await prisma.villa.findMany({
      include: {
        admin: { select: { id: true, name: true, email: true } },
        _count: { select: { residents: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(villas);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export async function updateVillaStatus(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    if (decoded.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const villaId = parseInt(String(req.params.villaId), 10);
    if (isNaN(villaId)) return res.status(400).json({ error: 'Invalid villaId' });

    const { status } = req.body;
    if (status !== 'APPROVED' && status !== 'REJECTED') {
      return res.status(400).json({ error: 'status must be APPROVED or REJECTED' });
    }

    const villa = await prisma.villa.update({
      where: { id: villaId },
      data: { status },
    });
    res.status(200).json(villa);
  } catch (error) {
    console.error('Villa status update error:', error);
    res.status(500).json({ error: 'Failed to update villa status' });
  }
}

export async function getVillaUsers(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    if (decoded.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const villaId = parseInt(String(req.params.villaId), 10);
    if (isNaN(villaId)) return res.status(400).json({ error: 'Invalid villaId' });

    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { id: true, name: true, address: true, totalUnits: true, accountNumber: true, bankName: true },
    });
    if (!villa) return res.status(404).json({ error: 'Villa not found' });

    const residents = await prisma.residentRecord.findMany({
      where: { villaId },
      orderBy: { roomNumber: 'asc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, status: true, phone: true },
        },
      },
    });

    res.status(200).json({
      villa,
      users: residents.map((r) => ({
        recordId: r.id,
        roomNumber: r.roomNumber,
        joinedAt: r.joinedAt,
        ...r.user,
      })),
    });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export async function updateVillaSubscription(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    if (decoded.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const villaId = parseInt(String(req.params.villaId), 10);
    if (isNaN(villaId)) return res.status(400).json({ error: 'Invalid villaId' });

    const { status } = req.body;
    const ALLOWED_STATUSES = ['ACTIVE', 'FREE_TRIAL', 'EXPIRED', 'NONE'];
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${ALLOWED_STATUSES.join(', ')}` });
    }

    let subscriptionExpiry: Date | null = null;
    if (status === 'ACTIVE') {
      subscriptionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    const villa = await prisma.villa.update({
      where: { id: villaId },
      data: {
        subscriptionStatus: status,
        subscriptionExpiry,
      },
      select: {
        id: true,
        name: true,
        address: true,
        totalUnits: true,
        status: true,
        subscriptionStatus: true,
        subscriptionExpiry: true,
        createdAt: true,
      },
    });
    res.status(200).json(villa);
  } catch (error) {
    console.error('Villa subscription update error:', error);
    res.status(500).json({ error: 'Failed to update villa subscription' });
  }
}

export async function getStats(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    if (decoded.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const [totalUsers, usersByRole, totalVillas, villasBySubscription] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({ by: ['role'], _count: { role: true } }),
      prisma.villa.count(),
      prisma.villa.groupBy({ by: ['subscriptionStatus'], _count: { subscriptionStatus: true } }),
    ]);

    res.status(200).json({
      totalUsers,
      usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count.role })),
      totalVillas,
      villasBySubscription: villasBySubscription.map((r) => ({
        status: r.subscriptionStatus,
        count: r._count.subscriptionStatus,
      })),
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
