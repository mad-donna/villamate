import { PrismaClient, Role, ResidentType, ResidentStatus, InvoiceType, PaymentStatus, ExternalBillingStatus, PostCategory, TicketCategory, TicketStatus, LedgerType, BuildingEventCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 예시 데이터 시드 시작...');

  // ── 1. 사용자 생성 ──────────────────────────────────────────
  const pw = await bcrypt.hash('demo1234!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@villamate.demo' },
    update: {},
    create: {
      email: 'admin@villamate.demo',
      password: pw,
      name: '김관리',
      phone: '010-1234-5678',
      role: Role.ADMIN,
    },
  });

  const residents = await Promise.all([
    prisma.user.upsert({
      where: { email: 'r101@villamate.demo' },
      update: {},
      create: { email: 'r101@villamate.demo', password: pw, name: '이민준', phone: '010-2222-1111', role: Role.RESIDENT },
    }),
    prisma.user.upsert({
      where: { email: 'r102@villamate.demo' },
      update: {},
      create: { email: 'r102@villamate.demo', password: pw, name: '박서연', phone: '010-3333-2222', role: Role.RESIDENT },
    }),
    prisma.user.upsert({
      where: { email: 'r201@villamate.demo' },
      update: {},
      create: { email: 'r201@villamate.demo', password: pw, name: '정하늘', phone: '010-4444-3333', role: Role.RESIDENT },
    }),
    prisma.user.upsert({
      where: { email: 'r202@villamate.demo' },
      update: {},
      create: { email: 'r202@villamate.demo', password: pw, name: '최지우', phone: '010-5555-4444', role: Role.RESIDENT },
    }),
  ]);

  // ── 2. 빌라 생성 ──────────────────────────────────────────
  const villa = await prisma.villa.upsert({
    where: { inviteCode: 'DEMO-VILLA' },
    update: {},
    create: {
      name: '햇살 빌라',
      address: '서울특별시 마포구 연남로 12길 34',
      totalUnits: 8,
      inviteCode: 'DEMO-VILLA',
      roomNumbers: ['101', '102', '103', '201', '202', '203', '301', '302'],
      accountBank: '국민은행',
      accountNumber: '123-456-789012',
      subscriptionStatus: 'ACTIVE',
      subscriptionExpiry: new Date('2026-12-31'),
      autoPublishDay: 1,
      adminId: admin.id,
    },
  });

  // ── 3. 입주자 등록 ──────────────────────────────────────────
  const roomMap = ['101', '102', '201', '202'];
  const records = await Promise.all(
    residents.map((u, i) =>
      prisma.residentRecord.upsert({
        where: { villaId_roomNumber_userId: { villaId: villa.id, roomNumber: roomMap[i], userId: u.id } },
        update: {},
        create: {
          userId: u.id,
          villaId: villa.id,
          roomNumber: roomMap[i],
          residentType: ResidentType.HEAD,
          status: ResidentStatus.APPROVED,
        },
      })
    )
  );

  // ── 4. 건물 이력 (BuildingEvent) ────────────────────────────
  const buildingEventData = [
    {
      title: '엘리베이터 정기점검',
      description: '연 2회 법정 의무 점검. 점검 당일 오전 9시~12시 운행 중단 예정입니다.',
      category: BuildingEventCategory.INSPECTION,
      eventDate: new Date('2026-03-15'),
      contractorName: '(주)한국승강기',
      contactNumber: '02-987-6543',
    },
    {
      title: '옥상 방수공사',
      description: '누수 발생으로 인한 긴급 방수 처리. 302호 천장 누수 원인 제거 완료.',
      category: BuildingEventCategory.REPAIR,
      eventDate: new Date('2026-02-20'),
      contractorName: '대림방수',
      contactNumber: '010-8765-4321',
    },
    {
      title: '공용 청소 업체 계약 갱신',
      description: '2026년 1월부터 청소 업체를 깨끗한서울로 변경. 주 3회 공용 복도·계단 청소.',
      category: BuildingEventCategory.CONTRACT,
      eventDate: new Date('2026-01-02'),
      contractorName: '깨끗한서울',
      contactNumber: '02-111-2233',
    },
    {
      title: '소화기·소방시설 점검',
      description: '소방청 법정 반기 점검 완료. 101호 소화기 교체, 복도 유도등 정상 확인.',
      category: BuildingEventCategory.INSPECTION,
      eventDate: new Date('2026-04-05'),
      contractorName: '서울소방안전',
      contactNumber: '02-555-7890',
    },
    {
      title: '지하 주차장 도색',
      description: '주차 구획선 재도색 및 번호 표시 작업. 작업 중 차량 이동 요청.',
      category: BuildingEventCategory.CLEANING,
      eventDate: new Date('2026-04-18'),
      contractorName: '라인페인팅',
      contactNumber: '010-2233-4455',
    },
  ];

  for (const ev of buildingEventData) {
    const exists = await prisma.buildingEvent.findFirst({ where: { villaId: villa.id, title: ev.title } });
    if (!exists) {
      await prisma.buildingEvent.create({ data: { ...ev, villaId: villa.id, creatorId: admin.id } });
    }
  }

  // ── 5. 청구서 (Invoice) ─────────────────────────────────────
  const invoiceMarch = await prisma.invoice.findFirst({ where: { villaId: villa.id, billingMonth: '2026-03' } });
  let marchInvoice = invoiceMarch;
  if (!marchInvoice) {
    marchInvoice = await prisma.invoice.create({
      data: {
        villaId: villa.id,
        type: InvoiceType.FIXED,
        billingMonth: '2026-03',
        memo: '3월 관리비 청구서입니다. 납부 기한은 3월 20일까지입니다.',
        totalAmount: 320000,
        items: {
          create: [
            { name: '관리비', amount: 80000 },
            { name: '청소비', amount: 30000 },
            { name: '승강기 유지비', amount: 10000 },
          ],
        },
      },
    });
    await Promise.all(
      records.map((r, i) =>
        prisma.invoicePayment.create({
          data: {
            invoiceId: marchInvoice!.id,
            residentRecordId: r.id,
            roomNumber: roomMap[i],
            amount: 120000,
            status: i < 2 ? PaymentStatus.PAID : PaymentStatus.PENDING,
            paidAt: i < 2 ? new Date('2026-03-12') : null,
          },
        })
      )
    );
  }

  const invoiceApril = await prisma.invoice.findFirst({ where: { villaId: villa.id, billingMonth: '2026-04' } });
  if (!invoiceApril) {
    const aprilInv = await prisma.invoice.create({
      data: {
        villaId: villa.id,
        type: InvoiceType.VARIABLE,
        billingMonth: '2026-04',
        memo: '4월 관리비 + 옥상 방수공사 분담금이 포함되어 있습니다.',
        totalAmount: 580000,
        items: {
          create: [
            { name: '관리비', amount: 80000 },
            { name: '청소비', amount: 30000 },
            { name: '승강기 유지비', amount: 10000 },
            { name: '옥상 방수공사 분담금', amount: 25000 },
          ],
        },
      },
    });
    await Promise.all(
      records.map((r, i) =>
        prisma.invoicePayment.create({
          data: {
            invoiceId: aprilInv.id,
            residentRecordId: r.id,
            roomNumber: roomMap[i],
            amount: 145000,
            status: PaymentStatus.PENDING,
          },
        })
      )
    );
  }

  // ── 6. 외부 청구서 (ExternalBilling) ───────────────────────
  const externalData = [
    {
      targetName: '김영식',
      phoneNumber: '010-9999-8888',
      amount: 250000,
      description: '103호 퇴거 후 원상복구 미이행 — 벽지 훼손 복구비 청구',
      dueDate: new Date('2026-04-30'),
      status: ExternalBillingStatus.PENDING,
    },
    {
      targetName: '에이스보험',
      phoneNumber: '1588-4567',
      amount: 1200000,
      description: '2025년 11월 배관 누수 피해 보험금 청구 (201호 천장 피해)',
      dueDate: new Date('2026-05-15'),
      status: ExternalBillingStatus.PENDING_CONFIRMATION,
    },
    {
      targetName: '대림방수',
      phoneNumber: '010-8765-4321',
      amount: 800000,
      description: '옥상 방수공사 잔금 (계약금 200,000원 기납부)',
      dueDate: new Date('2026-04-25'),
      status: ExternalBillingStatus.COMPLETED,
    },
  ];

  for (const eb of externalData) {
    const exists = await prisma.externalBilling.findFirst({ where: { villaId: villa.id, description: eb.description } });
    if (!exists) {
      await prisma.externalBilling.create({ data: { ...eb, villaId: villa.id } });
    }
  }

  // ── 7. 커뮤니티 (Post + Comment) ───────────────────────────
  const postData = [
    {
      authorId: admin.id,
      title: '[공지] 4월 엘리베이터 점검 안내',
      content: `안녕하세요, 관리사무소입니다.\n\n4월 15일(화) 오전 9시부터 12시까지 엘리베이터 정기점검이 진행됩니다.\n\n점검 중에는 엘리베이터 이용이 불가하오니, 계단을 이용해 주시기 바랍니다.\n\n불편을 드려 죄송합니다.`,
      category: PostCategory.NOTICE,
      isNotice: true,
    },
    {
      authorId: residents[0].id,
      title: '이번 주 토요일 공용 BBQ 해도 될까요?',
      content: `안녕하세요 101호 이민준입니다.\n\n날씨가 좋아져서 이번 주 토요일(4월 22일) 오후에 옥상에서 간단한 BBQ 모임을 하려고 합니다.\n\n관심 있으신 분은 댓글 달아주세요 😊`,
      category: PostCategory.GENERAL,
      isNotice: false,
    },
    {
      authorId: residents[1].id,
      title: '분리수거 제대로 해주세요 (플라스틱 쓰레기통에 음식물이..)',
      content: `재활용 분리수거함에 음식물 쓰레기가 섞여서 배출되는 경우가 계속 있습니다.\n\n각자 조금만 신경 써주시면 감사하겠습니다. 관리사무소에서도 안내 스티커를 붙여주시면 좋겠습니다.`,
      category: PostCategory.ISSUE,
      isNotice: false,
    },
    {
      authorId: residents[2].id,
      title: '주차장 불법 주차 차량 신고',
      content: `201호 앞 지정 주차 구역에 외부 차량(12가3456)이 3일째 주차 중입니다.\n\n관리사무소에 연락해 견인 조치 부탁드립니다.`,
      category: PostCategory.ISSUE,
      isNotice: false,
    },
  ];

  const createdPosts = [];
  for (const p of postData) {
    const exists = await prisma.post.findFirst({ where: { villaId: villa.id, title: p.title } });
    if (!exists) {
      const post = await prisma.post.create({ data: { ...p, villaId: villa.id } });
      createdPosts.push(post);
    }
  }

  if (createdPosts.length > 0) {
    const bbqPost = createdPosts.find(p => p.title.includes('BBQ'));
    if (bbqPost) {
      await prisma.comment.createMany({
        data: [
          { postId: bbqPost.id, authorId: residents[1].id, content: '저도 참여할게요! 몇 시부터인가요?' },
          { postId: bbqPost.id, authorId: residents[2].id, content: '오후 4시쯤 좋을 것 같아요 ☀️' },
          { postId: bbqPost.id, authorId: admin.id, content: '옥상 이용은 사전에 관리사무소에 알려주세요 :)' },
        ],
      });
    }
  }

  // ── 8. 장부 (LedgerTransaction) ─────────────────────────────
  const ledgerData = [
    { type: LedgerType.INCOME, amount: 480000, description: '3월 관리비 수납 (101~202호)', transactionDate: new Date('2026-03-12') },
    { type: LedgerType.INCOME, amount: 80000, description: '3월 관리비 수납 (203호 지연)', transactionDate: new Date('2026-03-22') },
    { type: LedgerType.EXPENSE, amount: 200000, description: '옥상 방수공사 계약금 (대림방수)', transactionDate: new Date('2026-02-18') },
    { type: LedgerType.EXPENSE, amount: 800000, description: '옥상 방수공사 잔금 (대림방수)', transactionDate: new Date('2026-04-20') },
    { type: LedgerType.EXPENSE, amount: 45000, description: '공용 복도 전구 교체 (10개)', transactionDate: new Date('2026-03-05') },
    { type: LedgerType.EXPENSE, amount: 150000, description: '청소용품 구입 (분기)', transactionDate: new Date('2026-04-01') },
    { type: LedgerType.INCOME, amount: 120000, description: '101호 4월 관리비 선납', transactionDate: new Date('2026-04-10') },
    { type: LedgerType.EXPENSE, amount: 30000, description: '우편·서류 발송비', transactionDate: new Date('2026-04-15') },
  ];

  for (const ld of ledgerData) {
    const exists = await prisma.ledgerTransaction.findFirst({
      where: { villaId: villa.id, description: ld.description },
    });
    if (!exists) {
      await prisma.ledgerTransaction.create({
        data: { ...ld, villaId: villa.id, createdBy: admin.name },
      });
    }
  }

  // ── 9. 민원 (Ticket) ────────────────────────────────────────
  const ticketData = [
    {
      reporterId: residents[0].id,
      title: '101호 세면대 수압이 너무 약해요',
      description: '최근 1달 사이 세면대 수압이 현저히 낮아졌습니다. 샤워기도 같이 약한 것 같아요. 확인 부탁드립니다.',
      category: TicketCategory.COMMON_FACILITY,
      status: TicketStatus.IN_PROGRESS,
    },
    {
      reporterId: residents[1].id,
      title: '지하주차장 112구역 조명이 꺼져 있어요',
      description: '지하 1층 112구역 형광등이 며칠째 꺼져 있어 밤에 매우 어둡고 위험합니다. 빠른 조치 부탁드립니다.',
      category: TicketCategory.COMMON_FACILITY,
      status: TicketStatus.RESOLVED,
    },
    {
      reporterId: residents[2].id,
      title: '203호 앞 불법 주차 반복 발생',
      description: '매주 금요일 저녁마다 외부 차량이 203호 전용 주차 구역을 점유합니다. 차량번호: 34나 5678.',
      category: TicketCategory.PARKING,
      status: TicketStatus.PENDING,
    },
    {
      reporterId: residents[3].id,
      title: '윗집(301호) 새벽 발소리 소음',
      description: '매일 새벽 1~2시에 301호에서 쿵쿵 뛰는 소리가 심합니다. 주의 요청 부탁드립니다.',
      category: TicketCategory.NOISE_COMPLAINT,
      status: TicketStatus.IN_PROGRESS,
    },
  ];

  for (const t of ticketData) {
    const exists = await prisma.ticket.findFirst({ where: { villaId: villa.id, title: t.title } });
    if (!exists) {
      await prisma.ticket.create({ data: { ...t, villaId: villa.id } });
    }
  }

  // ── 10. 전자투표 (Poll) ─────────────────────────────────────
  const pollData = [
    {
      title: '공용 무선인터넷(Wi-Fi) 설치에 찬성하시나요?',
      description: '공용 복도 및 주차장에 무선인터넷을 설치하는 안건입니다. 월 관리비 5,000원 추가 예정.',
      isAnonymous: false,
      endDate: new Date('2026-05-10'),
      options: ['찬성', '반대', '보류 (추가 논의 필요)'],
    },
    {
      title: '외벽 도색 색상 선택 투표',
      description: '노후화된 외벽을 도색할 예정입니다. 선호하시는 색상에 투표해 주세요.',
      isAnonymous: true,
      endDate: new Date('2026-04-28'),
      options: ['아이보리 (현행 유지)', '연한 회색', '베이지 계열', '흰색'],
    },
    {
      title: '택배 보관함 설치 여부 결정',
      description: '현관 입구에 무인 택배 보관함(10칸) 설치를 검토 중입니다. 설치 비용 50만원은 공용 적립금에서 지출 예정.',
      isAnonymous: false,
      endDate: new Date('2026-05-01'),
      options: ['설치 찬성', '설치 반대'],
    },
  ];

  for (const poll of pollData) {
    const exists = await prisma.poll.findFirst({ where: { villaId: villa.id, title: poll.title } });
    if (!exists) {
      const { options, ...pollFields } = poll;
      const createdPoll = await prisma.poll.create({
        data: {
          ...pollFields,
          villaId: villa.id,
          creatorId: admin.id,
          options: { create: options.map(text => ({ text })) },
        },
        include: { options: true },
      });

      // 샘플 투표 결과 (첫 번째 투표만)
      if (poll.title.includes('무선인터넷')) {
        const voteMap = [
          { voter: residents[0], room: '101', optionIndex: 0 },
          { voter: residents[1], room: '102', optionIndex: 0 },
          { voter: residents[2], room: '201', optionIndex: 2 },
          { voter: residents[3], room: '202', optionIndex: 1 },
        ];
        for (const v of voteMap) {
          await prisma.vote.create({
            data: {
              pollId: createdPoll.id,
              optionId: createdPoll.options[v.optionIndex].id,
              voterId: v.voter.id,
              roomNumber: v.room,
            },
          });
        }
      }
    }
  }

  // ── 11. 에너지 사용량 (EnergyUsage) ────────────────────────
  const energyData = [
    { year: 2026, month: 1, electricKwh: 1240, electricFee: 185000, waterTon: 42, waterFee: 63000, gasMj: 980, gasFee: 122000 },
    { year: 2026, month: 2, electricKwh: 1180, electricFee: 174000, waterTon: 38, waterFee: 58000, gasMj: 1050, gasFee: 131000 },
    { year: 2026, month: 3, electricKwh: 1090, electricFee: 161000, waterTon: 40, waterFee: 60000, gasMj: 870, gasFee: 109000 },
    { year: 2025, month: 10, electricKwh: 1150, electricFee: 170000, waterTon: 39, waterFee: 59000, gasMj: 760, gasFee: 95000 },
    { year: 2025, month: 11, electricKwh: 1200, electricFee: 178000, waterTon: 41, waterFee: 62000, gasMj: 920, gasFee: 115000 },
    { year: 2025, month: 12, electricKwh: 1310, electricFee: 195000, waterTon: 45, waterFee: 68000, gasMj: 1100, gasFee: 138000 },
  ];

  for (const e of energyData) {
    await prisma.energyUsage.upsert({
      where: { villaId_year_month: { villaId: villa.id, year: e.year, month: e.month } },
      update: {},
      create: { ...e, villaId: villa.id },
    });
  }

  console.log('✅ 예시 데이터 시드 완료!');
  console.log(`\n빌라: ${villa.name} (초대코드: ${villa.inviteCode})`);
  console.log(`관리자 계정: admin@villamate.demo / demo1234!`);
  console.log(`입주자 계정: r101@villamate.demo ~ r202@villamate.demo / demo1234!`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
