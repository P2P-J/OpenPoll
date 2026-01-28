import * as dosService from './dos.service.js';
import { successResponse, createdResponse } from '../../utils/response.js';
import catchAsyncError from '../../utils/catchAsyncError.js';

export const getQuestions = catchAsyncError(async (req, res) => {
  const questions = await dosService.getQuestions();
  successResponse(res, questions);
});

export const calculateResult = catchAsyncError(async (req, res) => {
  const { answers } = req.body;
  const userId = req.user?.id || null;
  const result = await dosService.calculateResult(answers, userId);
  createdResponse(res, result);
});

export const getResultTypeInfo = catchAsyncError(async (req, res) => {
  const { resultType } = req.params;
  const info = await dosService.getResultTypeInfo(resultType);
  successResponse(res, info);
});

export const getStatistics = catchAsyncError(async (req, res) => {
  const stats = await dosService.getStatistics();
  successResponse(res, stats);
});
