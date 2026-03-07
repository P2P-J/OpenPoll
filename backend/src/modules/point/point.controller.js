import * as pointService from './point.service.js';
import { successResponse } from '../../utils/response.js';
import catchAsyncError from '../../utils/catchAsyncError.js';


export const getAttendanceStatus = catchAsyncError(async (req, res) => {
  const result = await pointService.getAttendanceStatus(req.user.id);
  successResponse(res, result);
});

export const checkAttendance = catchAsyncError(async (req, res) => {
  const result = await pointService.checkAttendance(req.user.id);
  successResponse(res, result);
});

