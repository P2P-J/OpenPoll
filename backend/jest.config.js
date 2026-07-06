// ESM 네이티브 실행 (babel 변환 없이). test 스크립트에서
// node --experimental-vm-modules 로 jest 를 구동한다.
export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/tests/**/*.test.js'],
  clearMocks: true,
};
