import { body } from 'express-validator';
import { REGIONS } from '../../constants/regions.js';

export const signupValidation = [
  body('email')
    .isEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('비밀번호는 최소 8자 이상이어야 합니다.')
    .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])/)
    .withMessage('비밀번호는 영문과 숫자를 포함해야 합니다.'),
  body('nickname')
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('닉네임은 2~20자 사이여야 합니다.'),
  body('age')
    .isInt({ min: 18, max: 150 })
    .withMessage('나이는 18세 이상이어야 합니다.'),
  body('region')
    .isIn(REGIONS)
    .withMessage('유효한 지역을 선택해주세요.'),
  body('gender')
    .isIn(['MALE', 'FEMALE'])
    .withMessage('유효한 성별을 선택해주세요.'),
];

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('비밀번호를 입력해주세요.'),
];

export const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh Token이 필요합니다.'),
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('현재 비밀번호를 입력해주세요.'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('새 비밀번호는 최소 8자 이상이어야 합니다.')
    .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])/)
    .withMessage('새 비밀번호는 영문과 숫자를 포함해야 합니다.'),
];
