import { Router } from 'express';
import * as invoiceController from '../controllers/invoiceController';

const router = Router();

router.get('/:residentId/payments', invoiceController.getResidentPayments);

export default router;
