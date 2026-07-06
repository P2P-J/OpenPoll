import AppError from '../utils/AppError.js';
import config from '../config/index.js';

// Prisma known request error(P####) → 적절한 HTTP 상태로 매핑
const mapPrismaError = (err) => {
  switch (err.code) {
    case 'P2002': // unique 제약 위반
      return AppError.conflict('이미 존재하는 값입니다.');
    case 'P2025': // 대상 레코드 없음
      return AppError.notFound('대상 리소스를 찾을 수 없습니다.');
    case 'P2003': // foreign key 제약 위반
      return AppError.badRequest('참조 무결성 제약을 위반했습니다.');
    default:
      return null;
  }
};

// 프레임워크/라이브러리 에러를 운영용 AppError로 정규화
const normalizeError = (err) => {
  if (err instanceof AppError) return err;

  // Prisma
  if (typeof err.code === 'string' && err.code.startsWith('P')) {
    const mapped = mapPrismaError(err);
    if (mapped) return mapped;
  }
  if (err.name === 'PrismaClientValidationError') {
    return AppError.badRequest('잘못된 요청 데이터입니다.');
  }

  // express.json 본문 파싱 실패 / 페이로드 초과
  if (err.type === 'entity.parse.failed') {
    return AppError.badRequest('요청 본문(JSON) 형식이 올바르지 않습니다.');
  }
  if (err.type === 'entity.too.large') {
    return new AppError('요청 본문이 너무 큽니다.', 413);
  }

  // JWT (라우트에서 미처리된 경우 대비)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return AppError.unauthorized('유효하지 않은 토큰입니다.');
  }

  return err;
};

const errorMiddleware = (err, req, res, next) => {
  const error = normalizeError(err);

  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';

  // 예상치 못한(비운영) 에러만 로깅 — 4xx 운영 에러 로그 노이즈 방지
  if (!error.isOperational) {
    console.error('[UnhandledError]', req.method, req.originalUrl, err);
  }

  if (config.isDev) {
    return res.status(statusCode).json({
      success: false,
      status,
      message: error.message,
      stack: error.stack,
    });
  }

  if (error.isOperational) {
    return res.status(statusCode).json({
      success: false,
      status,
      message: error.message,
    });
  }

  // 비운영 에러는 내부 정보 노출 방지
  return res.status(500).json({
    success: false,
    status: 'error',
    message: '서버 오류가 발생했습니다.',
  });
};

export default errorMiddleware;
