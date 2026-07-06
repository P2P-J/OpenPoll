import { describe, it, expect, jest, beforeEach, afterAll } from '@jest/globals';
import errorMiddleware from '../../src/middlewares/error.middleware.js';
import AppError from '../../src/utils/AppError.js';

// NODE_ENV=test 이므로 config.isDev === false → 프로덕션 응답 경로를 검증한다.

const mockRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};
const mockReq = () => ({ method: 'POST', originalUrl: '/api/test' });

// 비운영 에러는 console.error 를 호출하므로 노이즈 억제
let errSpy;
beforeEach(() => {
  errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => errSpy?.mockRestore());

const run = (err) => {
  const res = mockRes();
  errorMiddleware(err, mockReq(), res, () => {});
  return res;
};

describe('errorMiddleware', () => {
  it('AppError 는 상태코드와 메시지를 그대로 전달한다', () => {
    const res = run(AppError.notFound('없음'));
    expect(res.status).toHaveBeenCalledWith(404);
    const body = res.json.mock.calls[0][0];
    expect(body).toMatchObject({ success: false, status: 'fail', message: '없음' });
  });

  it('Prisma P2002(unique) → 409 로 매핑', () => {
    const res = run({ code: 'P2002', message: 'unique fail' });
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json.mock.calls[0][0].success).toBe(false);
  });

  it('Prisma P2025(not found) → 404 로 매핑', () => {
    const res = run({ code: 'P2025', message: 'not found' });
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('Prisma P2003(fk) → 400 으로 매핑', () => {
    const res = run({ code: 'P2003', message: 'fk fail' });
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('본문 파싱 실패(entity.parse.failed) → 400', () => {
    const res = run({ type: 'entity.parse.failed', message: 'bad json' });
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('페이로드 초과(entity.too.large) → 413', () => {
    const res = run({ type: 'entity.too.large', message: 'too big' });
    expect(res.status).toHaveBeenCalledWith(413);
  });

  it('알 수 없는 에러는 500 + 일반 메시지로 내부 정보를 숨긴다', () => {
    const res = run(new Error('DB 커넥션 문자열 유출 위험 정보'));
    expect(res.status).toHaveBeenCalledWith(500);
    const body = res.json.mock.calls[0][0];
    expect(body.message).toBe('서버 오류가 발생했습니다.');
    expect(body.message).not.toContain('유출');
    // 비운영 에러는 로깅되어야 한다
    expect(errSpy).toHaveBeenCalled();
  });

  it('운영 에러(4xx)는 로깅하지 않는다', () => {
    run(AppError.badRequest('입력값 오류'));
    expect(errSpy).not.toHaveBeenCalled();
  });
});
