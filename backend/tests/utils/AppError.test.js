import { describe, it, expect } from '@jest/globals';
import AppError from '../../src/utils/AppError.js';

describe('AppError', () => {
  it('4xx 는 status 가 fail 이다', () => {
    const err = new AppError('bad', 400);
    expect(err.statusCode).toBe(400);
    expect(err.status).toBe('fail');
    expect(err.isOperational).toBe(true);
    expect(err).toBeInstanceOf(Error);
  });

  it('5xx 는 status 가 error 이다', () => {
    const err = new AppError('boom', 500);
    expect(err.status).toBe('error');
  });

  it.each([
    ['badRequest', 400],
    ['unauthorized', 401],
    ['forbidden', 403],
    ['notFound', 404],
    ['conflict', 409],
    ['internal', 500],
  ])('팩토리 %s 는 %d 상태코드를 만든다', (factory, code) => {
    const err = AppError[factory]();
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(code);
    expect(typeof err.message).toBe('string');
    expect(err.message.length).toBeGreaterThan(0);
  });

  it('팩토리에 커스텀 메시지를 전달할 수 있다', () => {
    expect(AppError.notFound('없어요').message).toBe('없어요');
  });
});
