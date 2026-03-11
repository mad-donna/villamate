import { Router } from 'express';
import * as invoiceController from '../controllers/invoiceController';

const router = Router();

router.get('/:invoiceId/payments', invoiceController.getInvoicePayments);
router.put('/:invoiceId', invoiceController.updateInvoice);
router.patch('/:invoiceId/transfer', invoiceController.transferInvoice);
router.patch('/:invoiceId/confirm', invoiceController.confirmInvoice);

export default router;
