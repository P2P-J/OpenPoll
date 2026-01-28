import * as partyService from './party.service.js';
import { successResponse } from '../../utils/response.js';
import catchAsyncError from '../../utils/catchAsyncError.js';

export const getAllParties = catchAsyncError(async (req, res) => {
  const parties = await partyService.getAllParties();
  successResponse(res, parties);
});
