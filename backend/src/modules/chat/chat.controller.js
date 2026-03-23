import * as chatService from './chat.service.js';
import { successResponse, createdResponse } from '../../utils/response.js';
import catchAsyncError from '../../utils/catchAsyncError.js';

/**
 * GET /api/chat/messages
 * 최근 메시지 조회 (커서 기반 페이지네이션)
 */
export const getMessages = catchAsyncError(async (req, res) => {
  const cursor = req.query.cursor ? parseInt(req.query.cursor, 10) : null;
  const limit = req.query.limit ? Math.min(parseInt(req.query.limit, 10), 100) : 50;

  const result = await chatService.getMessages(cursor, limit);
  successResponse(res, result);
});

/**
 * POST /api/chat/messages
 * 메시지 전송 (로그인 필수)
 */
export const sendMessage = catchAsyncError(async (req, res) => {
  const { content } = req.body;
  const message = await chatService.sendMessage(req.user.id, content);
  createdResponse(res, message);
});

/**
 * GET /api/chat/stream
 * SSE 스트림 (공개)
 */
export const streamChat = async (req, res) => {
  // SSE 헤더 설정
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // 클라이언트 등록
  chatService.addClient(res);

  // 초기 연결 확인 메시지
  try {
    res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
  } catch (err) {
    console.error('SSE initial message error:', err);
  }

  // 연결 유지를 위한 heartbeat (30초마다)
  const heartbeatInterval = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (err) {
      clearInterval(heartbeatInterval);
      chatService.removeClient(res);
    }
  }, 30000);

  // 연결 종료 시 정리 (req.close + res.close 모두 핸들링)
  const cleanup = () => {
    clearInterval(heartbeatInterval);
    chatService.removeClient(res);
  };

  req.on('close', cleanup);
  res.on('close', cleanup);
};
