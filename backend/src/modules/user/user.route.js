import { Router } from 'express';
import * as userController from './user.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/me', userController.getMe);

router.patch('/me', userController.updateMe);

router.get('/me/points', userController.getPointHistory);

router.get('/me/votes', userController.getMyVoteStats);

export default router;
