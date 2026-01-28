import * as dashboardService from './dashboard.service.js';
import { successResponse } from '../../utils/response.js';
import catchAsyncError from '../../utils/catchAsyncError.js';


// SSE라서 catchAsyncError 안씀(SSE는 에러나도 연결 끊기면 안됨)
export const streamDashboard = async (req, res) => {
  // SSE 헤더 설정
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // nginx 버퍼링 비활성화
  res.flushHeaders();

  // 클라이언트 등록
  dashboardService.addClient(res);

  // 초기 데이터 전송
  try {
    const stats = await dashboardService.getOverallStats();
    res.write(`data: ${JSON.stringify({ type: 'init', stats })}\n\n`);
  } catch (err) {
    console.error('SSE initial data error:', err);
  }

  // 연결 유지를 위한 heartbeat(30초마다 빈 메세지 보내서 연결 유지)
  const heartbeatInterval = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  // 연결 종료 시 정리
  req.on('close', () => {
    clearInterval(heartbeatInterval);
    dashboardService.removeClient(res);
  });
};


export const getOverallStats = catchAsyncError(async (req, res) => {
  const stats = await dashboardService.getOverallStats();
  successResponse(res, stats);
});


export const getStatsByAge = catchAsyncError(async (req, res) => {
  const stats = await dashboardService.getStatsByAge();
  successResponse(res, stats);
});


export const getStatsByRegion = catchAsyncError(async (req, res) => {
  const stats = await dashboardService.getStatsByRegion();
  successResponse(res, stats);
});
