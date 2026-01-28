import { Router } from 'express';
import * as dashboardController from './dashboard.controller.js';

const router = Router();

router.get('/stream', dashboardController.streamDashboard);

router.get('/stats', dashboardController.getOverallStats);

router.get('/stats/by-age', dashboardController.getStatsByAge);

router.get('/stats/by-region', dashboardController.getStatsByRegion);

export default router;
