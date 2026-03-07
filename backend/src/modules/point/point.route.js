import { Router } from 'express';
import * as pointController from './point.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/attendance/status', pointController.getAttendanceStatus);
router.post('/attendance', pointController.checkAttendance);

export default router;
