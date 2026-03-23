import { body } from 'express-validator';

export const sendMessageValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('메시지 내용을 입력해주세요.')
    .isLength({ min: 1, max: 300 })
    .withMessage('메시지는 1~300자여야 합니다.'),
];
