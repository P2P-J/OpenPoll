import { body } from 'express-validator';

export const contactValidation = [
  body('subject')
    .trim()
    .notEmpty().withMessage('제목을 입력해주세요.')
    .isLength({ min: 2, max: 100 }).withMessage('제목은 2~100자 사이로 입력해주세요.'),
  body('message')
    .trim()
    .notEmpty().withMessage('내용을 입력해주세요.')
    .isLength({ min: 10, max: 2000 }).withMessage('내용은 10~2000자 사이로 입력해주세요.'),
];
