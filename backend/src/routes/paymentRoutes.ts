import { Router } from 'express';
import * as invoiceController from '../controllers/invoiceController';

const router = Router();

router.put('/:paymentId/status', invoiceController.updatePaymentStatus);
router.patch('/:paymentId/transfer', invoiceController.transferPayment);
router.patch('/:paymentId/confirm', invoiceController.confirmPayment);

export default router;
