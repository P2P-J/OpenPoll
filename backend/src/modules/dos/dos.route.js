import { Router } from 'express';
import * as dosController from './dos.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { calculateResultValidation } from './dos.validation.js';
import validate from '../../middlewares/validate.middleware.js';

const router = Router();

router.get('/questions', dosController.getQuestions);

router.post('/calculate', authenticate, calculateResultValidation, validate, dosController.calculateResult);

router.get('/result/:resultType', dosController.getResultTypeInfo);

router.get('/statistics', dosController.getStatistics);

export default router;
