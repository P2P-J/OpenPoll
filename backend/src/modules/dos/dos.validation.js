import { body } from 'express-validator';

export const calculateResultValidation = [
  body('answers')
    .isArray({ min: 1 })
    .withMessage('최소 1개 이상의 답변이 필요합니다.'),
  body('answers.*.questionId')
    .isInt({ min: 1 })
    .withMessage('유효한 질문 ID가 필요합니다.'),
  body('answers.*.score')
    .isInt({ min: 1, max: 7 })
    .withMessage('점수는 1에서 7 사이여야 합니다.'),
];
