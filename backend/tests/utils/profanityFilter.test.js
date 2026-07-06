import { describe, it, expect } from '@jest/globals';
import { containsProfanity } from '../../src/utils/profanityFilter.js';

describe('containsProfanity', () => {
  it('일반 문장은 욕설로 판정하지 않는다', () => {
    expect(containsProfanity('안녕하세요 좋은 하루 되세요')).toBe(false);
    expect(containsProfanity('이 정책에 찬성합니다')).toBe(false);
  });

  it('초성 욕설(ㅅㅂ)을 탐지한다', () => {
    expect(containsProfanity('ㅅㅂ')).toBe(true);
  });

  it('공백/특수문자로 우회한 욕설도 탐지한다', () => {
    expect(containsProfanity('ㅅ.ㅂ')).toBe(true);
  });

  it('빈 값·비문자열은 false 를 반환한다', () => {
    expect(containsProfanity('')).toBe(false);
    expect(containsProfanity(null)).toBe(false);
    expect(containsProfanity(undefined)).toBe(false);
    expect(containsProfanity(123)).toBe(false);
  });
});
