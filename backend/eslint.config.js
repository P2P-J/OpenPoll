import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/**', 'prisma/migrations/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // 서버 로깅은 console 사용을 허용
      'no-console': 'off',
      // 미사용 변수는 경고. _ 접두사 및 Express next 인자는 예외
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_|^next$',
          varsIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],
      eqeqeq: ['error', 'smart'],
      'no-var': 'error',
      'prefer-const': 'warn',
    },
  },
  {
    // 테스트 파일: jest 전역 허용
    files: ['**/*.test.js', '**/__tests__/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
];
