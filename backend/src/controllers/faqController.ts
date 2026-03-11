import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'villamate-super-secret-2024';

export async function listFaqs(req: Request, res: Response) {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(faqs);
  } catch (error) {
    console.error('Fetch FAQs error:', error);
    res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
}

export async function createFaq(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    if (decoded.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const { question, answer } = req.body;
    if (!question || !answer) return res.status(400).json({ error: 'question and answer are required' });

    const faq = await prisma.faq.create({ data: { question, answer } });
    res.status(201).json(faq);
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({ error: 'Failed to create FAQ' });
  }
}

export async function deleteFaq(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    if (decoded.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

    await prisma.faq.delete({ where: { id: String(req.params.id) } });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
}
