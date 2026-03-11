import { Router } from 'express';
import * as faqController from '../controllers/faqController';

const router = Router();

router.get('/', faqController.listFaqs);
router.post('/', faqController.createFaq);
router.delete('/:id', faqController.deleteFaq);

export default router;
