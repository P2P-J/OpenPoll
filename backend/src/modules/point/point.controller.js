import * as pointService from './point.service.js';
import { successResponse } from '../../utils/response.js';
import catchAsyncError from '../../utils/catchAsyncError.js';


export const checkAttendance = catchAsyncError(async (req, res) => {
  const result = await pointService.checkAttendance(req.user.id);
  successResponse(res, result);
});

