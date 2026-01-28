import * as voteService from './vote.service.js';
import { createdResponse } from '../../utils/response.js';
import catchAsyncError from '../../utils/catchAsyncError.js';


export const castVote = catchAsyncError(async (req, res) => {
  const { partyId } = req.body;
  const vote = await voteService.castVote(req.user.id, partyId);
  createdResponse(res, vote);
});
