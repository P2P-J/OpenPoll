import * as newsService from './news.service.js';
import { successResponse } from '../../utils/response.js';
import catchAsyncError from '../../utils/catchAsyncError.js';

export const refreshArticles = catchAsyncError(async (req, res) => {
    const result = await newsService.refreshArticles();
    successResponse(res, result);
});

export const getArticles = catchAsyncError(async (req, res) => {
    const result = await newsService.getArticles();
    successResponse(res, result);
});