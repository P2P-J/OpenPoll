import { describe, it, expect } from '@jest/globals';
import { getAgeGroup } from '../../src/constants/ageGroups.js';

describe('getAgeGroup', () => {
  it.each([
    [18, '20대'],
    [29, '20대'],
    [30, '30대'],
    [45, '40대'],
    [59, '50대'],
    [60, '60대 이상'],
    [99, '60대 이상'],
  ])('나이 %d → %s', (age, label) => {
    expect(getAgeGroup(age)).toBe(label);
  });

  it('경계 미만(18세 미만)은 기타로 분류된다', () => {
    expect(getAgeGroup(17)).toBe('기타');
  });
});
