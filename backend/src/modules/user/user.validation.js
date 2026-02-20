import { body } from 'express-validator';
import { REGIONS } from '../../constants/regions.js';

export const updateMeValidation = [
  body('nickname')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('닉네임은 2~20자 사이여야 합니다.'),
  body('age')
    .optional()
    .isInt({ min: 18, max: 150 })
    .withMessage('나이는 18세 이상이어야 합니다.'),
  body('region')
    .optional()
    .isIn(REGIONS)
    .withMessage('유효한 지역을 선택해주세요.'),
  body('gender')
    .optional()
    .isIn(['MALE', 'FEMALE'])
    .withMessage('유효한 성별을 선택해주세요.'),
];
