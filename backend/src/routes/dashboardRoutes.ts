import { Router } from 'express';
import * as villaController from '../controllers/villaController';

const router = Router();

router.get('/:userId', villaController.getDashboard);

export default router;
