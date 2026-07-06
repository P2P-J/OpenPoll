import { describe, it, expect } from '@jest/globals';
import { validationResult } from 'express-validator';
import { completeProfileValidation } from '../../src/modules/auth/auth.validation.js';

// 소셜 가입 프로필 완료 검증 체인을 서버 없이 직접 구동한다.
// (과거 이 엔드포인트는 validate 미들웨어 누락으로 검증이 우회되던 버그가 있었음)
const runValidation = async (body) => {
  const req = { body };
  for (const chain of completeProfileValidation) {
    await chain.run(req);
  }
  return validationResult(req);
};

const validBody = {
  nickname: '홍길동',
  age: 25,
  region: '서울',
  gender: 'MALE',
};

describe('completeProfileValidation', () => {
  it('정상 입력은 통과한다', async () => {
    const result = await runValidation(validBody);
    expect(result.isEmpty()).toBe(true);
  });

  it('닉네임이 너무 짧으면 거부', async () => {
    const result = await runValidation({ ...validBody, nickname: 'a' });
    expect(result.isEmpty()).toBe(false);
  });

  it('18세 미만 나이는 거부', async () => {
    const result = await runValidation({ ...validBody, age: 15 });
    expect(result.isEmpty()).toBe(false);
  });

  it('허용되지 않은 지역은 거부', async () => {
    const result = await runValidation({ ...validBody, region: '평양' });
    expect(result.isEmpty()).toBe(false);
  });

  it('허용되지 않은 성별은 거부', async () => {
    const result = await runValidation({ ...validBody, gender: 'X' });
    expect(result.isEmpty()).toBe(false);
  });

  it('필수 필드 누락은 거부', async () => {
    const result = await runValidation({ nickname: '홍길동' });
    expect(result.isEmpty()).toBe(false);
  });
});
