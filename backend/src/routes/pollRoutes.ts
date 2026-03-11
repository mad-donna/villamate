import { Router } from 'express';
import * as pollController from '../controllers/pollController';

const router = Router();

router.post('/:pollId/remind', pollController.remindPoll);

export default router;
