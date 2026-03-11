import * as contactService from './contact.service.js';
import { successResponse } from '../../utils/response.js';
import catchAsyncError from '../../utils/catchAsyncError.js';

export const sendContact = catchAsyncError(async (req, res) => {
  const { subject, message } = req.body;
  const userEmail = req.user.email;

  await contactService.sendContactEmail(subject, message, userEmail);
  successResponse(res, { message: '건의사항이 성공적으로 전송되었습니다.' });
});
