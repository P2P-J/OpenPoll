export const ROUTES = {
  HOME: '/',
  
  // MBTI
  MBTI: '/mbti',
  MBTI_TEST: '/mbti/test',
  MBTI_RESULT: '/mbti/result/:type',
  
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
