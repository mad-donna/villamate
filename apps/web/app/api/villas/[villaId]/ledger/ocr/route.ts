import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

const OCR_MONTHLY_LIMIT = 900;

function currentYearMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function parseReceiptText(text: string): {
  date?: string;
  description?: string;
  amount?: number;
} {
  let date: string | undefined;
  const datePatterns = [
    /(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/,
    /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/,
  ];
  for (const pattern of datePatterns) {
    const m = text.match(pattern);
    if (m) {
      date = `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
      break;
    }
  }

  let amount: number | undefined;
  const amountPatterns = [
    /(?:합\s*계|결제\s*금액|총\s*금액|총액|금액|TOTAL)[^\d]*([\d,]+)/gi,
    /([\d,]+)\s*원/g,
  ];
  for (const pattern of amountPatterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      const val = parseInt(matches[matches.length - 1][1].replace(/,/g, ''), 10);
      if (!isNaN(val) && val > 0) {
        amount = val;
        break;
      }
    }
  }

  let description: string | undefined;
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length >= 2);
  for (const line of lines) {
    if (!/^[\d\s.,:\-/\\()\[\]]+$/.test(line)) {
      description = line.slice(0, 50);
      break;
    }
  }

  return { date, description, amount };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId } = await params;

    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { adminId: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
    if (villa.adminId !== user.sub) return err('관리자만 사용할 수 있습니다.', 403);

    const yearMonth = currentYearMonth();
    const usageLog = await prisma.ocrUsageLog.findUnique({ where: { yearMonth } });
    if (usageLog && usageLog.count >= OCR_MONTHLY_LIMIT) {
      return err(`이번 달 OCR 사용 한도(${OCR_MONTHLY_LIMIT}회)에 도달했습니다. 직접 입력해주세요.`, 429);
    }

    const body = (await req.json()) as { imageUrl?: string };
    if (!body.imageUrl) return err('imageUrl이 필요합니다.', 400);

    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    if (!apiKey) return err('OCR 서비스를 사용할 수 없습니다.', 503);

    const visionRes = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { source: { imageUri: body.imageUrl } },
              features: [{ type: 'TEXT_DETECTION' }],
            },
          ],
        }),
      },
    );

    if (!visionRes.ok) return err('OCR 처리에 실패했습니다.', 502);

    const visionData = (await visionRes.json()) as {
      responses: Array<{
        textAnnotations?: Array<{ description: string }>;
        error?: { message: string };
      }>;
    };

    const response = visionData.responses?.[0];
    if (response?.error || !response?.textAnnotations?.length) {
      return err('영수증에서 텍스트를 인식하지 못했습니다.', 422);
    }

    const fullText = response.textAnnotations[0].description;
    const parsed = parseReceiptText(fullText);

    await prisma.ocrUsageLog.upsert({
      where: { yearMonth },
      create: { yearMonth, count: 1 },
      update: { count: { increment: 1 } },
    });

    return ok(parsed);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}
