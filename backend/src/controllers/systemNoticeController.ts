import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'villamate-super-secret-2024';

export async function listSystemNotices(req: Request, res: Response) {
  try {
    const notices = await prisma.systemNotice.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(notices);
  } catch (error) {
    console.error('Fetch notices error:', error);
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
}

export async function createSystemNotice(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    if (decoded.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'title and content are required' });

    const notice = await prisma.systemNotice.create({ data: { title, content } });
    res.status(201).json(notice);
  } catch (error) {
    console.error('Create notice error:', error);
    res.status(500).json({ error: 'Failed to create notice' });
  }
}

export async function deleteSystemNotice(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    if (decoded.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

    await prisma.systemNotice.delete({ where: { id: String(req.params.id) } });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete notice error:', error);
    res.status(500).json({ error: 'Failed to delete notice' });
  }
}
