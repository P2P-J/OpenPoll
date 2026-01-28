import { Router } from 'express';
import * as voteController from './vote.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { castVoteValidation } from './vote.validation.js';
import validate from '../../middlewares/validate.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', castVoteValidation, validate, voteController.castVote);

export default router;
