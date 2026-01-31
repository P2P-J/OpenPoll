import { body } from 'express-validator';

export const castVoteValidation = [
  body('partyId')
    .isInt({ min: 1 })
    .withMessage('유효한 정당 ID를 입력해주세요.'),
];
