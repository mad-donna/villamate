import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';
import { sanitizeUser } from '../helpers';

export async function updateUser(req: Request, res: Response) {
  const userId = String(req.params.userId);
  const { name, phone, role } = req.body;

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name: String(name) }),
        ...(phone && { phone: String(phone) }),
        ...(role && { role: String(role) }),
      },
    });
    res.status(200).json(sanitizeUser(updated));
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
}

export async function updatePushToken(req: Request, res: Response) {
  const userId = String(req.params.userId);
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'token is required' });
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { expoPushToken: String(token) },
    });
    res.status(200).json(sanitizeUser(user));
  } catch (error) {
    console.error('Push token update error:', error);
    res.status(500).json({ error: 'Failed to update push token' });
  }
}

export async function deleteUser(req: Request, res: Response) {
  const userId = String(req.params.userId);
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: '탈퇴한 사용자',
        email: null,
        phone: null,
        profileImage: null,
        expoPushToken: null,
        status: 'DELETED',
      },
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}

export async function getUserPosts(req: Request, res: Response) {
  const userId = String(req.params.userId);
  try {
    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { name: true },
        },
      },
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Fetch user posts error:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
}

export async function changePassword(req: Request, res: Response) {
  const userId = String(req.params.userId);
  const { oldPassword, newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: 'newPassword is required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // If user has an existing password, verify the old one
    if (user.password) {
      if (!oldPassword) return res.status(400).json({ error: 'oldPassword is required' });
      const match = await bcrypt.compare(String(oldPassword), user.password);
      if (!match) return res.status(401).json({ error: '현재 비밀번호가 올바르지 않습니다.' });
    }

    const hashed = await bcrypt.hash(String(newPassword), 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
}

export async function updateUserById(req: Request, res: Response) {
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
    res.status(200).json(sanitizeUser(updatedUser));
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
}

export async function getUserVehicles(req: Request, res: Response) {
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
}

export async function getUserVilla(req: Request, res: Response) {
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
}

export async function getNotifications(req: Request, res: Response) {
  const userId = String(req.params.userId);
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

export async function markNotificationsRead(req: Request, res: Response) {
  const userId = String(req.params.userId);
  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Mark notifications read error:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
}
