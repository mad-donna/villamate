import { Router } from 'express';
import * as guideController from '../controllers/guideController';

const router = Router();

router.get('/', guideController.listGuides);
router.get('/:id', guideController.getGuide);
router.post('/', guideController.createGuide);
router.put('/:id', guideController.updateGuide);
router.delete('/:id', guideController.deleteGuide);

export default router;
