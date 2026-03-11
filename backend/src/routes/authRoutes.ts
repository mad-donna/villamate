import { Router } from 'express';
import * as authController from '../controllers/authController';

const router = Router();

router.post('/login', authController.login);
router.post('/email-login', authController.emailLogin);
router.post('/register', authController.register);
router.get('/proxy', authController.proxy);
router.post('/social-login', authController.socialLogin);

export default router;
