import { Request, Response } from 'express';
import { Expo } from 'expo-server-sdk';
import prisma from '../prisma';

const expo = new Expo();

export async function getVillaPosts(req: Request, res: Response) {
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
}

export async function createPost(req: Request, res: Response) {
  const villaId = parseInt(String(req.params.villaId), 10);
  if (isNaN(villaId)) return res.status(400).json({ error: 'Invalid villaId' });

  const { title, content, authorId, isNotice, category } = req.body;

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
        category: category === 'ISSUE' ? 'ISSUE' : 'GENERAL',
        status: category === 'ISSUE' ? 'PENDING' : null,
      },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
}

export async function sendPostPush(req: Request, res: Response) {
  const villaId = parseInt(String(req.params.villaId), 10);
  const postId = String(req.params.postId);
  if (isNaN(villaId)) return res.status(400).json({ error: 'Invalid villaId' });

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const records = await prisma.residentRecord.findMany({
      where: { villaId },
      include: { user: true },
    });
    const tokens = records
      .map((r: any) => r.user.expoPushToken)
      .filter((t: any): t is string => !!t && Expo.isExpoPushToken(t));

    if (tokens.length > 0) {
      const messages = tokens.map((pushToken: string) => ({
        to: pushToken,
        sound: 'default' as const,
        title: '새롭게 공지사항 등록된 글이 있습니다. 확인해보실까요?',
        body: post.title,
        data: { postId: post.id, villaId },
      }));
      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        await expo.sendPushNotificationsAsync(chunk);
      }
    }

    // Save in-app notifications for all residents
    const userIds = records.map((r: any) => r.userId);
    if (userIds.length > 0) {
      await prisma.notification.createMany({
        data: userIds.map((uid: string) => ({
          userId: uid,
          title: '새롭게 공지사항 등록된 글이 있습니다. 확인해보실까요?',
          body: post.title,
        })),
      });
    }

    res.status(200).json({ success: true, sent: tokens.length });
  } catch (error) {
    console.error('Send push error:', error);
    res.status(500).json({ error: 'Failed to send push notifications' });
  }
}

export async function toggleNotice(req: Request, res: Response) {
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
}

export async function updatePostStatus(req: Request, res: Response) {
  const postId = String(req.params.postId);
  const { status, userRole } = req.body;

  const validStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be PENDING, IN_PROGRESS, or RESOLVED' });
  }
  if (userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can update issue status' });
  }

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.category !== 'ISSUE') return res.status(400).json({ error: 'Only ISSUE posts have a status' });

    const updated = await prisma.post.update({
      where: { id: postId },
      data: { status },
    });
    res.json(updated);
  } catch (err: any) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
}

export async function getPost(req: Request, res: Response) {
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
}

export async function getComments(req: Request, res: Response) {
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
}

export async function createComment(req: Request, res: Response) {
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
}

export async function deletePost(req: Request, res: Response) {
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
}
