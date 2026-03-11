import { Request, Response } from 'express';
import prisma from '../prisma';
import { sendPushToTokens } from '../utils/push';

export async function createPoll(req: Request, res: Response) {
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
}

export async function getPolls(req: Request, res: Response) {
  const villaId = parseInt(String(req.params.villaId), 10);
  if (isNaN(villaId)) return res.status(400).json({ error: 'Invalid villaId' });

  const userId = req.query.userId ? String(req.query.userId) : null;

  try {
    // Determine the requesting user's roomNumber for hasVoted checks
    let userRoom: string | null = null;
    if (userId) {
      const record = await prisma.residentRecord.findFirst({
        where: { userId, villaId },
      });
      if (record) {
        userRoom = record.roomNumber;
      } else {
        // Check if the user is the villa admin
        const villa = await prisma.villa.findFirst({
          where: { id: villaId, adminId: userId },
        });
        if (villa) userRoom = 'admin';
      }
    }

    const [polls, totalEligibleVoters] = await Promise.all([
      prisma.poll.findMany({
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
      }),
      prisma.residentRecord.count({ where: { villaId, residentType: 'HEAD' } }),
    ]);

    // Batch-fetch all votes cast by this user's roomNumber to avoid N+1 queries
    let votedPollIds = new Set<string>();
    if (userRoom) {
      const userVotes = await prisma.vote.findMany({
        where: { roomNumber: userRoom, poll: { villaId } },
        select: { pollId: true },
      });
      votedPollIds = new Set(userVotes.map(v => v.pollId));
    }

    const result = polls.map(poll => {
      const totalVotes = poll._count.votes;
      const options = poll.isAnonymous
        ? poll.options.map(opt => ({
            ...opt,
            votes: opt.votes.map(() => ({ roomNumber: '익명', voterId: null })),
          }))
        : poll.options;
      const hasVoted = userRoom ? votedPollIds.has(poll.id) : false;
      return { ...poll, options, totalVotes, totalEligibleVoters, hasVoted };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Fetch polls error:', error);
    res.status(500).json({ error: 'Failed to fetch polls' });
  }
}

export async function castVote(req: Request, res: Response) {
  const villaId = parseInt(String(req.params.villaId), 10);
  if (isNaN(villaId)) return res.status(400).json({ error: 'Invalid villaId' });
  const pollId = String(req.params.pollId);

  const { voterId, optionId } = req.body;
  if (!voterId || !optionId) {
    return res.status(400).json({ error: 'voterId and optionId are required' });
  }

  try {
    // Verify the voter is a resident of this villa and retrieve their roomNumber.
    // Admins (villa owners) are also allowed to vote — they use 'admin' as their roomNumber
    // so the 1-house-1-vote constraint still applies to them as a single seat.
    const record = await prisma.residentRecord.findFirst({
      where: { userId: String(voterId), villaId },
    });

    let roomNumber: string;
    if (record) {
      // Block MEMBER from voting (1-house-1-vote applies only to HEAD)
      if (record.residentType === 'MEMBER') {
        return res.status(403).json({ error: '투표권은 세대주에게만 있습니다.' });
      }
      roomNumber = record.roomNumber;
    } else {
      // Check if the voter is the admin of this villa
      const villa = await prisma.villa.findFirst({
        where: { id: villaId, adminId: String(voterId) },
      });
      if (!villa) return res.status(403).json({ error: '해당 빌라의 입주민이 아닙니다.' });
      // Admin uses a fixed sentinel roomNumber for deduplication
      roomNumber = 'admin';
    }

    // Verify the poll exists and is still active
    const poll = await prisma.poll.findUnique({ where: { id: pollId } });
    if (!poll) return res.status(404).json({ error: '투표를 찾을 수 없습니다.' });
    if (new Date() > poll.endDate) return res.status(400).json({ error: '투표 기간이 종료되었습니다.' });

    // Find existing vote for this roomNumber on this poll
    const existingVote = await prisma.vote.findFirst({
      where: { pollId, roomNumber },
    });

    let vote;
    if (existingVote) {
      // Update existing vote (vote modification)
      vote = await prisma.vote.update({
        where: { id: existingVote.id },
        data: { optionId: String(optionId) },
      });
    } else {
      // Create new vote
      vote = await prisma.vote.create({
        data: { pollId, optionId: String(optionId), voterId: String(voterId), roomNumber },
      });
    }
    res.status(201).json(vote);
  } catch (error) {
    console.error('Cast vote error:', error);
    res.status(500).json({ error: 'Failed to cast vote' });
  }
}

export async function remindPoll(req: Request, res: Response) {
  const pollId = String(req.params.pollId);
  const { adminId } = req.body;

  if (!adminId) {
    return res.status(400).json({ error: 'adminId is required' });
  }

  try {
    // 1. Find the poll and verify it belongs to a villa managed by adminId
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { villa: true },
    });
    if (!poll) return res.status(404).json({ error: '투표를 찾을 수 없습니다.' });
    if (poll.villa.adminId !== String(adminId)) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }
    if (new Date() > poll.endDate) {
      return res.status(400).json({ error: '이미 종료된 투표입니다.' });
    }

    // 2. Get all residents of the villa
    const residents = await prisma.residentRecord.findMany({
      where: { villaId: poll.villaId },
      include: { user: true },
    });

    // 3. Get userIds who already voted
    const votes = await prisma.vote.findMany({
      where: { pollId },
      select: { voterId: true },
    });
    const voterIds = new Set(votes.map((v) => v.voterId));

    // 4. Filter non-voters and collect their push tokens
    const nonVoters = residents.filter((r) => !voterIds.has(r.userId));
    const tokens = nonVoters
      .map((r) => r.user.expoPushToken)
      .filter((t): t is string => !!t);

    // 5. Send push notifications
    const sent = await sendPushToTokens(
      tokens,
      '투표 마감 임박!',
      '아직 참여하지 않은 투표가 있습니다. 앱을 열어 투표해 주세요!',
      { pollId, villaId: poll.villaId }
    );

    // 6. Save in-app notifications for non-voters
    const nonVoterUserIds = nonVoters.map((r) => r.userId);
    if (nonVoterUserIds.length > 0) {
      await prisma.notification.createMany({
        data: nonVoterUserIds.map((uid) => ({
          userId: uid,
          title: '투표 마감 임박!',
          body: `[${poll.title}] 아직 참여하지 않은 투표가 있습니다. 앱을 열어 투표해 주세요!`,
        })),
      });
    }

    res.status(200).json({ success: true, nonVoterCount: nonVoters.length, sent });
  } catch (error) {
    console.error('Poll remind error:', error);
    res.status(500).json({ error: 'Failed to send reminders' });
  }
}
