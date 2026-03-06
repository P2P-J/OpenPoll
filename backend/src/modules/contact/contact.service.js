import nodemailer from 'nodemailer';
import config from '../../config/index.js';
import AppError from '../../utils/AppError.js';

// nodemailer transporter (기존 SMTP config 재사용)
const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

/**
 * 건의사항 이메일 전송 (일단 단방향)
 * @param {string} subject - 건의 제목
 * @param {string} message - 건의 내용
 * @param {string} userEmail - 발신자 이메일 (req.user에서 가져옴)
 */
export const sendContactEmail = async (subject, message, userEmail) => {
  try {
    await transporter.sendMail({
      from: `"OpenPoll 고객센터" <${config.smtp.from}>`,
      to: config.smtp.user,
      subject: `[고객센터 건의] ${subject}`,
      html: `
        <div style="font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #fff; margin: 0 0 8px 0; font-size: 20px;">📩 새 건의사항이 접수되었습니다</h2>
            <p style="color: #a0aec0; margin: 0; font-size: 14px;">OpenPoll 고객센터</p>
          </div>

          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 16px; border-left: 4px solid #3182ce;">
            <p style="color: #718096; font-size: 13px; margin: 0 0 4px 0;">발신자</p>
            <p style="color: #2d3748; font-size: 15px; font-weight: 600; margin: 0;">${userEmail}</p>
          </div>

          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 16px; border-left: 4px solid #48bb78;">
            <p style="color: #718096; font-size: 13px; margin: 0 0 4px 0;">제목</p>
            <p style="color: #2d3748; font-size: 15px; font-weight: 600; margin: 0;">${subject}</p>
          </div>

          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; border-left: 4px solid #ed8936;">
            <p style="color: #718096; font-size: 13px; margin: 0 0 8px 0;">내용</p>
            <p style="color: #2d3748; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>

          <p style="color: #a0aec0; font-size: 12px; text-align: center; margin-top: 24px;">
            이 메일은 OpenPoll 고객센터를 통해 자동 발송되었습니다.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('건의사항 이메일 전송 실패:', error);
    throw AppError.internal('이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
};
