import { Router } from 'express';
import * as userController from '../controllers/userController';

const router = Router();

// NOTE: Route ordering matters — specific paths must precede wildcard patterns
router.get('/:userId/villa', userController.getUserVilla);
router.get('/:userId/posts', userController.getUserPosts);
router.get('/:userId/vehicles', userController.getUserVehicles);
router.get('/:userId/notifications', userController.getNotifications);
router.patch('/:userId/notifications/read-all', userController.markNotificationsRead);
router.patch('/:userId/push-token', userController.updatePushToken);
router.patch('/:userId/password', userController.changePassword);
router.put('/:userId', userController.updateUser);
router.put('/:id', userController.updateUserById);
router.delete('/:userId', userController.deleteUser);

export default router;
