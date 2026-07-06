import { describe, it, expect, jest } from '@jest/globals';
import {
  successResponse,
  createdResponse,
  noContentResponse,
  paginatedResponse,
} from '../../src/utils/response.js';

// Express res 목 객체
const mockRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.send = jest.fn(() => res);
  return res;
};

describe('response helpers', () => {
  it('successResponse 는 기본 200 + { success, data }', () => {
    const res = mockRes();
    successResponse(res, { a: 1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { a: 1 } });
  });

  it('successResponse 는 상태코드를 커스터마이즈할 수 있다', () => {
    const res = mockRes();
    successResponse(res, 'x', 202);
    expect(res.status).toHaveBeenCalledWith(202);
  });

  it('createdResponse 는 201', () => {
    const res = mockRes();
    createdResponse(res, { id: 1 });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 1 } });
  });

  it('noContentResponse 는 204 + 빈 본문', () => {
    const res = mockRes();
    noContentResponse(res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledWith();
  });

  it('paginatedResponse 는 totalPages 를 올림 계산한다', () => {
    const res = mockRes();
    paginatedResponse(res, [1, 2], { page: 1, limit: 10, total: 25 });
    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.data).toEqual([1, 2]);
    expect(payload.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3, // ceil(25 / 10)
    });
  });
});
