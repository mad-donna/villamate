import { Router } from 'express';
import * as systemNoticeController from '../controllers/systemNoticeController';

const router = Router();

router.get('/', systemNoticeController.listSystemNotices);
router.post('/', systemNoticeController.createSystemNotice);
router.delete('/:id', systemNoticeController.deleteSystemNotice);

export default router;
