import { body } from 'express-validator';

export const createGameValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('제목을 입력해주세요.')
    .isLength({ max: 100 })
    .withMessage('제목은 100자 이하여야 합니다.'),
  body('subtitle')
    .trim()
    .notEmpty()
    .withMessage('소제목을 입력해주세요.')
    .isLength({ max: 200 })
    .withMessage('소제목은 200자 이하여야 합니다.'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('설명을 입력해주세요.'),
];

export const updateGameValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('제목을 입력해주세요.')
    .isLength({ max: 100 })
    .withMessage('제목은 100자 이하여야 합니다.'),
  body('subtitle')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('소제목을 입력해주세요.')
    .isLength({ max: 200 })
    .withMessage('소제목은 200자 이하여야 합니다.'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('설명을 입력해주세요.'),
];

export const voteValidation = [
  body('isAgree')
    .isBoolean()
    .withMessage('isAgree는 boolean이어야 합니다.'),
];

export const commentValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('댓글 내용을 입력해주세요.')
    .isLength({ max: 500 })
    .withMessage('댓글은 500자 이하여야 합니다.'),
  body('parentId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('유효한 parentId가 필요합니다.'),
];

export const updateCommentValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('댓글 내용을 입력해주세요.')
    .isLength({ max: 500 })
    .withMessage('댓글은 500자 이하여야 합니다.'),
];
