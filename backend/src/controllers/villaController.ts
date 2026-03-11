import { Request, Response } from 'express';
import prisma from '../prisma';
import { normalizeRoom } from '../helpers';
import { sendPushToTokens } from '../utils/push';

export async function createVilla(req: Request, res: Response) {
  const { name, address, totalUnits, adminId, accountNumber, bankName, adminRoomNumber, roomNumbers } = req.body;

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
        roomNumbers: Array.isArray(roomNumbers) ? roomNumbers.map(String) : [],
      },
    });

    // If admin provides their own room number, create a ResidentRecord for them
    if (adminRoomNumber) {
      const existingRecord = await prisma.residentRecord.findFirst({
        where: { userId: adminId, villaId: villa.id },
      });
      if (!existingRecord) {
        await prisma.residentRecord.create({
          data: {
            userId: adminId,
            villaId: villa.id,
            roomNumber: normalizeRoom(String(adminRoomNumber)),
            residentType: 'HEAD',
          },
        });
      }
    }

    res.status(201).json(villa);
  } catch (error) {
    console.error('Villa registration error:', error);
    res.status(500).json({ error: 'Failed to register villa' });
  }
}

export async function getJoinRooms(req: Request, res: Response) {
  const inviteCode = String(req.query.inviteCode || '').trim().toUpperCase();
  if (!inviteCode) return res.status(400).json({ error: 'inviteCode is required' });

  try {
    const villa = await prisma.villa.findFirst({
      where: { inviteCode },
      select: { id: true, name: true, roomNumbers: true },
    });
    if (!villa) return res.status(404).json({ error: '유효하지 않은 초대 코드입니다.' });
    res.json({ villaId: villa.id, villaName: villa.name, roomNumbers: villa.roomNumbers });
  } catch (error) {
    console.error('Fetch room list error:', error);
    res.status(500).json({ error: 'Failed to fetch room list' });
  }
}

export async function joinVillaByCode(req: Request, res: Response) {
  const { userId, inviteCode, roomNumber } = req.body;

  if (!userId || !inviteCode || !roomNumber) {
    return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
  }

  try {
    const normalizedCode = String(inviteCode).trim().toUpperCase();
    const normalizedRoom = normalizeRoom(String(roomNumber));
    const villa = await prisma.villa.findFirst({
      where: { inviteCode: normalizedCode },
    });

    if (!villa) {
      return res.status(404).json({ error: '유효하지 않은 초대 코드입니다.' });
    }

    const existingRecord = await prisma.residentRecord.findFirst({ where: { userId, villaId: villa.id } });
    const headRecord = await prisma.residentRecord.findFirst({ where: { villaId: villa.id, roomNumber: normalizedRoom, residentType: 'HEAD' } });
    const residentType = (!headRecord || headRecord.userId === userId) ? 'HEAD' : 'MEMBER';

    await prisma.residentRecord.upsert({
      where: { id: existingRecord?.id ?? 0 },
      update: { roomNumber: normalizedRoom, residentType },
      create: { userId, villaId: villa.id, roomNumber: normalizedRoom, residentType },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    res.status(200).json({ user, villa, residentType });
  } catch (error) {
    console.error('Villa join error:', error);
    res.status(500).json({ error: 'Failed to join villa' });
  }
}

export async function joinVillaById(req: Request, res: Response) {
  const villaId = parseInt(String(req.params.villaId), 10);
  if (isNaN(villaId)) return res.status(400).json({ error: 'Invalid villaId' });

  const { userId, roomNumber } = req.body;
  if (!userId || !roomNumber) {
    return res.status(400).json({ error: 'userId and roomNumber are required' });
  }

  try {
    const normalizedRoom = normalizeRoom(String(roomNumber));
    const villa = await prisma.villa.findUnique({ where: { id: villaId } });
    if (!villa) return res.status(404).json({ error: '빌라를 찾을 수 없습니다.' });

    const existingRecord = await prisma.residentRecord.findFirst({
      where: { userId: String(userId), villaId },
    });

    const headRecord = await prisma.residentRecord.findFirst({ where: { villaId, roomNumber: normalizedRoom, residentType: 'HEAD' } });
    const residentType = (!headRecord || headRecord.userId === String(userId)) ? 'HEAD' : 'MEMBER';

    if (existingRecord) {
      await prisma.residentRecord.update({
        where: { id: existingRecord.id },
        data: { roomNumber: normalizedRoom, residentType },
      });
    } else {
      await prisma.residentRecord.create({
        data: { userId: String(userId), villaId, roomNumber: normalizedRoom, residentType },
      });
    }

    const user = await prisma.user.update({
      where: { id: String(userId) },
      data: { role: 'RESIDENT' },
    });

    res.status(200).json({ user, villa, residentType });
  } catch (error) {
    console.error('Villa join by ID error:', error);
    res.status(500).json({ error: 'Failed to join villa' });
  }
}

export async function getResidents(req: Request, res: Response) {
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
      residentType: r.residentType,
    }));
    res.json(result);
  } catch (error) {
    console.error('Fetch residents error:', error);
    res.status(500).json({ error: 'Failed to fetch residents' });
  }
}

export async function moveOut(req: Request, res: Response) {
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
}

export async function subscribe(req: Request, res: Response) {
  if ((req as any).user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const villaId = Number(req.params.villaId);
  if (isNaN(villaId)) return res.status(400).json({ error: 'Invalid villaId' });
  try {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    const villa = await prisma.villa.update({
      where: { id: villaId },
      data: {
        subscriptionStatus: 'ACTIVE',
        subscriptionExpiry: expiry,
      },
    });
    res.json(villa);
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Failed to activate subscription' });
  }
}

export async function registerBilling(req: Request, res: Response) {
  const villaId = parseInt(String(req.params.villaId), 10);
  if (isNaN(villaId)) return res.status(400).json({ error: 'Invalid villaId' });

  const { cardNumber, expireMonth, expireYear, password, adminId } = req.body;
  if (!cardNumber || !expireMonth || !expireYear || !password || !adminId) {
    return res.status(400).json({ error: 'cardNumber, expireMonth, expireYear, password, adminId are required' });
  }

  try {
    const villa = await prisma.villa.findUnique({ where: { id: villaId } });
    if (!villa) return res.status(404).json({ error: 'Villa not found' });
    if (villa.adminId !== String(adminId)) {
      return res.status(403).json({ error: 'Not the admin of this villa' });
    }

    const fakeBillingKey = `bk_mock_${Date.now()}`;
    const rawCard = String(cardNumber).replace(/\s/g, '');
    const last4 = rawCard.slice(-4);
    const maskedCard = `****-****-****-${last4}`;
    const subscriptionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.villa.update({
      where: { id: villaId },
      data: {
        isAutoBilling: true,
        billingKey: fakeBillingKey,
        maskedCard,
        subscriptionStatus: 'ACTIVE',
        subscriptionExpiry,
      },
    });

    res.json({ success: true, maskedCard, subscriptionExpiry });
  } catch (error) {
    console.error('Billing registration error:', error);
    res.status(500).json({ error: 'Failed to register billing' });
  }
}

export async function getBilling(req: Request, res: Response) {
  const villaId = parseInt(String(req.params.villaId), 10);
  if (isNaN(villaId)) return res.status(400).json({ error: 'Invalid villaId' });

  try {
    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { isAutoBilling: true, maskedCard: true, subscriptionExpiry: true, subscriptionStatus: true },
    });
    if (!villa) return res.status(404).json({ error: 'Villa not found' });
    res.json(villa);
  } catch (error) {
    console.error('Billing fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch billing info' });
  }
}

export async function updateRooms(req: Request, res: Response) {
  const villaId = parseInt(String(req.params.villaId), 10);
  if (isNaN(villaId)) return res.status(400).json({ error: 'Invalid villaId' });

  const { roomNumbers } = req.body;
  if (!Array.isArray(roomNumbers)) return res.status(400).json({ error: 'roomNumbers must be an array' });

  try {
    const villa = await prisma.villa.update({
      where: { id: villaId },
      data: { roomNumbers: roomNumbers.map((r: any) => normalizeRoom(String(r))) },
    });
    res.json({ roomNumbers: villa.roomNumbers });
  } catch (error) {
    console.error('Update room numbers error:', error);
    res.status(500).json({ error: 'Failed to update room numbers' });
  }
}

export async function setAutoBilling(req: Request, res: Response) {
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
}

export async function getVillaDetail(req: Request, res: Response) {
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
}

export async function searchVillas(req: Request, res: Response) {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) {
    return res.status(400).json({ error: '검색어를 2자 이상 입력해주세요.' });
  }
  try {
    const villas = await prisma.villa.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, address: true, totalUnits: true },
      take: 20,
    });
    res.status(200).json(villas);
  } catch (error) {
    console.error('Villa search error:', error);
    res.status(500).json({ error: 'Failed to search villas' });
  }
}

export async function getVillasByAdmin(req: Request, res: Response) {
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
}

export async function getVillaVehicles(req: Request, res: Response) {
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
}

export async function searchVillaVehicles(req: Request, res: Response) {
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
}

export async function createBuildingEvent(req: Request, res: Response) {
  const { villaId } = req.params;
  const { title, description, category, eventDate, contractorName, contactNumber, creatorId, attachmentUrl, isPublic, cost } = req.body;
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
        isPublic: Boolean(isPublic) ?? false,
        cost: cost !== undefined ? Number(cost) : 0,
      },
    });
    res.status(201).json(event);
  } catch (error) {
    console.error('Create building event error:', error);
    res.status(500).json({ error: 'Failed to create building event' });
  }
}

export async function getBuildingEvents(req: Request, res: Response) {
  const { villaId } = req.params;
  const role = String(req.query.role || '').toUpperCase();
  try {
    const where: any = { villaId: Number(villaId) };
    if (role === 'RESIDENT') {
      where.isPublic = true;
    }
    const events = await prisma.buildingEvent.findMany({
      where,
      orderBy: { eventDate: 'desc' },
    });
    res.json(events);
  } catch (error) {
    console.error('Fetch building events error:', error);
    res.status(500).json({ error: 'Failed to fetch building events' });
  }
}

export async function createExternalBill(req: Request, res: Response) {
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
}

export async function getExternalBills(req: Request, res: Response) {
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
}

export async function confirmExternalBill(req: Request, res: Response) {
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
}

export async function createTicket(req: Request, res: Response) {
  const villaId = parseInt(String(req.params.villaId), 10);
  const { title, description, imageUrl, creatorId } = req.body;
  if (!title || !description || !creatorId) {
    return res.status(400).json({ error: '제목, 내용, 작성자는 필수입니다.' });
  }
  try {
    const ticket = await prisma.ticket.create({
      data: {
        title: String(title),
        description: String(description),
        imageUrl: imageUrl ? String(imageUrl) : undefined,
        creatorId: String(creatorId),
        villaId,
      },
    });
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
}

export async function getTickets(req: Request, res: Response) {
  const villaId = parseInt(String(req.params.villaId), 10);
  try {
    const tickets = await prisma.ticket.findMany({
      where: { villaId },
      orderBy: { createdAt: 'desc' },
      include: { creator: { select: { name: true } } },
    });

    // Efficiently attach roomNumber: build a userId→roomNumber map from ResidentRecords
    const records = await prisma.residentRecord.findMany({
      where: { villaId },
      select: { userId: true, roomNumber: true },
    });
    const roomMap: Record<string, string> = {};
    for (const r of records) {
      roomMap[r.userId] = r.roomNumber;
    }

    const result = tickets.map((t) => ({
      ...t,
      roomNumber: roomMap[t.creatorId] ?? null,
    }));

    res.json(result);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
}

export async function updateTicketStatus(req: Request, res: Response) {
  const villaId = parseInt(String(req.params.villaId), 10);
  const ticketId = String(req.params.ticketId);
  const { status } = req.body;

  const VALID_STATUSES = ['PENDING', 'IN_PROGRESS', 'RESOLVED'];
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `유효하지 않은 상태입니다. 허용: ${VALID_STATUSES.join(', ')}` });
  }

  try {
    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: String(status) },
    });
    res.json(ticket);
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
}

export async function getDashboard(req: Request, res: Response) {
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
}
