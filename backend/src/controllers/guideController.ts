import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'villamate-super-secret-2024';

export async function listGuides(req: Request, res: Response) {
  const { category } = req.query;
  try {
    const guides = await prisma.guide.findMany({
      where: category ? { category: String(category) } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(guides);
  } catch (error) {
    console.error('Fetch guides error:', error);
    res.status(500).json({ error: 'Failed to fetch guides' });
  }
}

export async function getGuide(req: Request, res: Response) {
  try {
    const guide = await prisma.guide.findUnique({ where: { id: String(req.params.id) } });
    if (!guide) return res.status(404).json({ error: 'Guide not found' });
    res.status(200).json(guide);
  } catch (error) {
    console.error('Fetch guide error:', error);
    res.status(500).json({ error: 'Failed to fetch guide' });
  }
}

export async function createGuide(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    if (decoded.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const { category, title, content, thumbnailUrl } = req.body;
    if (!category || !title || !content) return res.status(400).json({ error: 'category, title, and content are required' });

    const guide = await prisma.guide.create({
      data: {
        category: String(category),
        title: String(title),
        content: String(content),
        thumbnailUrl: thumbnailUrl ? String(thumbnailUrl) : null,
      },
    });
    res.status(201).json(guide);
  } catch (error) {
    console.error('Create guide error:', error);
    res.status(500).json({ error: 'Failed to create guide' });
  }
}

export async function updateGuide(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    if (decoded.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const { category, title, content, thumbnailUrl } = req.body;
    const guide = await prisma.guide.update({
      where: { id: String(req.params.id) },
      data: {
        ...(category && { category: String(category) }),
        ...(title && { title: String(title) }),
        ...(content && { content: String(content) }),
        thumbnailUrl: thumbnailUrl !== undefined ? (thumbnailUrl ? String(thumbnailUrl) : null) : undefined,
      },
    });
    res.status(200).json(guide);
  } catch (error) {
    console.error('Update guide error:', error);
    res.status(500).json({ error: 'Failed to update guide' });
  }
}

export async function deleteGuide(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    if (decoded.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

    await prisma.guide.delete({ where: { id: String(req.params.id) } });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete guide error:', error);
    res.status(500).json({ error: 'Failed to delete guide' });
  }
}
