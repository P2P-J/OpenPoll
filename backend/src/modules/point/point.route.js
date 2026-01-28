import { Router } from 'express';
import * as pointController from './point.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/attendance', pointController.checkAttendance); // 여기 연속출석도 포함

export default router;
