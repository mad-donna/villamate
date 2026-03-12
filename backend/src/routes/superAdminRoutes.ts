import { Router } from 'express';
import * as superAdminController from '../controllers/superAdminController';

const router = Router();

router.post('/login', superAdminController.adminLogin);
router.get('/me', superAdminController.adminMe);
router.get('/users', superAdminController.listUsers);
router.get('/villas', superAdminController.listVillas);
router.patch('/villas/:villaId/status', superAdminController.updateVillaStatus);
router.patch('/villas/:villaId/subscription', superAdminController.updateVillaSubscription);
router.get('/villas/:villaId/users', superAdminController.getVillaUsers);
router.get('/stats', superAdminController.getStats);

export default router;
