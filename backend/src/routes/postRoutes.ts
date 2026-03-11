import { Router } from 'express';
import * as postController from '../controllers/postController';

const router = Router();

router.get('/:postId', postController.getPost);
router.delete('/:postId', postController.deletePost);
router.put('/:postId/notice', postController.toggleNotice);
router.get('/:postId/comments', postController.getComments);
router.post('/:postId/comments', postController.createComment);

export default router;
