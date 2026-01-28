import { Router } from 'express';
import * as partyController from './party.controller.js';

const router = Router();

router.get('/', partyController.getAllParties);

export default router;
