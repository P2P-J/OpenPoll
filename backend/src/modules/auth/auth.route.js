import { Router } from 'express';
import * as authController from './auth.controller.js';
import { signupValidation, loginValidation, refreshTokenValidation } from './auth.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/signup', signupValidation, validate, authController.signup);
router.post('/login', loginValidation, validate, authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', refreshTokenValidation, validate, authController.refresh);

export default router;
