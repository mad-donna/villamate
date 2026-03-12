import { Router } from 'express';
import * as villaController from '../controllers/villaController';
import * as invoiceController from '../controllers/invoiceController';
import * as postController from '../controllers/postController';
import * as pollController from '../controllers/pollController';
import { authenticateUser } from '../middlewares/authenticateUser';
import { checkSubscription } from '../middlewares/checkSubscription';

const router = Router();

// NOTE: Static/specific routes MUST be registered before wildcard routes (:adminId, :villaId)
// to avoid shadowing conflicts.

// Static routes (no dynamic segments at the top level)
router.post('/', villaController.createVilla);

// /api/villas/join/* — must be before /api/villas/:adminId
router.get('/join/rooms', villaController.getJoinRooms);
router.post('/join', villaController.joinVillaByCode);

// /api/villas/search — must be before /api/villas/:adminId
router.get('/search', villaController.searchVillas);

// /api/villas/:villaId/invoices
router.post('/:villaId/invoices', authenticateUser, checkSubscription, invoiceController.createInvoice);
router.get('/:villaId/invoices', invoiceController.getInvoices);

// /api/villas/:villaId/residents
router.get('/:villaId/residents', villaController.getResidents);
router.post('/:villaId/residents/:residentId/move-out', villaController.moveOut);

// /api/villas/:villaId/vehicles — full list must be before /search
router.get('/:villaId/vehicles', villaController.getVillaVehicles);
router.get('/:villaId/vehicles/search', villaController.searchVillaVehicles);

// /api/villas/:villaId/building-events
router.post('/:villaId/building-events', authenticateUser, checkSubscription, villaController.createBuildingEvent);
router.get('/:villaId/building-events', villaController.getBuildingEvents);

// /api/villas/:villaId/posts — must be before /:adminId wildcard
router.get('/:villaId/posts', postController.getVillaPosts);
router.post('/:villaId/posts', authenticateUser, checkSubscription, postController.createPost);
router.post('/:villaId/posts/:postId/send-push', postController.sendPostPush);
router.patch('/:villaId/posts/:postId/status', postController.updatePostStatus);

// /api/villas/:villaId/polls
router.post('/:villaId/polls', authenticateUser, checkSubscription, pollController.createPoll);
router.get('/:villaId/polls', pollController.getPolls);
router.post('/:villaId/polls/:pollId/vote', pollController.castVote);

// /api/villas/:villaId/external-bills
router.post('/:villaId/external-bills', authenticateUser, checkSubscription, villaController.createExternalBill);
router.get('/:villaId/external-bills', villaController.getExternalBills);
router.patch('/:villaId/external-bills/:billId/confirm', villaController.confirmExternalBill);

// /api/villas/:villaId/tickets
router.post('/:villaId/tickets', villaController.createTicket);
router.get('/:villaId/tickets', villaController.getTickets);
router.patch('/:villaId/tickets/:ticketId/status', villaController.updateTicketStatus);

// /api/villas/:villaId/billing
router.post('/:villaId/billing', authenticateUser, villaController.registerBilling);
router.get('/:villaId/billing', authenticateUser, villaController.getBilling);

// /api/villas/:villaId/rooms
router.put('/:villaId/rooms', villaController.updateRooms);

// /api/villas/:villaId/auto-billing
router.post('/:villaId/auto-billing', villaController.setAutoBilling);

// /api/villas/:villaId/subscribe — authenticated, SUPER_ADMIN only
router.patch('/:villaId/subscribe', authenticateUser, villaController.subscribe);

// /api/villas/:villaId/join
router.post('/:villaId/join', villaController.joinVillaById);

// /api/villas/:villaId/detail — must be before /:adminId wildcard
router.get('/:villaId/detail', villaController.getVillaDetail);

// /api/villas/:villaId/ledger — must be before /:adminId wildcard
router.get('/:villaId/ledger', villaController.getLedger);
router.post('/:villaId/ledger', authenticateUser, villaController.createLedgerTransaction);

// Dashboard — must be before /:adminId wildcard (placed at top of this section for clarity)
// Note: dashboard is at /api/dashboard, not /api/villas — handled in app separately

// /api/villas/:adminId — wildcard, must be last
router.get('/:adminId', villaController.getVillasByAdmin);

export default router;
