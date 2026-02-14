export const ROUTES = {
  HOME: '/',

  // DOS (정치 성향 테스트)
  DOS: '/dos',
  DOS_TEST: '/dos/test',
  DOS_RESULT: '/dos/result/:type',

  // Balance Game
  BALANCE: '/balance',
  BALANCE_DETAIL: '/balance/:id',

  // News
  NEWS: '/news',
  NEWS_DETAIL: '/news/:id',

  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
} as const;

export type RouteKey = keyof typeof ROUTES;
