import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

/**
 * Middleware: verify the villa's subscription status.
 *
 * Expects `req.params.villaId` to be present (used on routes like
 * POST /api/villas/:villaId/invoices, etc.).
 *
 * The subscription status field is the single source of truth.
 * Blocks with 403 SUBSCRIPTION_EXPIRED if subscriptionStatus is not
 * 'ACTIVE' or 'FREE_TRIAL'. The expiry date is NOT checked here —
 * a background job is responsible for transitioning status to 'EXPIRED'.
 * Otherwise calls next().
 */
export async function checkSubscription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const villaId = parseInt(String(req.params.villaId), 10);
  if (isNaN(villaId)) {
    // Let the route handler deal with the bad villaId
    return next();
  }

  try {
    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { subscriptionStatus: true },
    });

    if (!villa) {
      // Villa not found — let the route handler return 404
      return next();
    }

    // Status is the single source of truth — do not check expiry date here
    const ALLOWED_STATUSES = ['ACTIVE', 'FREE_TRIAL'];
    const isAllowed = ALLOWED_STATUSES.includes(villa.subscriptionStatus);

    if (!isAllowed) {
      return res.status(403).json({
        error: 'SUBSCRIPTION_EXPIRED',
        message: '구독이 만료되었습니다. 결제 후 이용해 주세요.',
      });
    }

    return next();
  } catch (err) {
    console.error('[checkSubscription] DB error:', err);
    // On DB error, allow the request through — do not block users due to infra issues
    return next();
  }
}
