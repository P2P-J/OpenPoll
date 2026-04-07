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
  SOCIAL_SIGNUP: '/auth/social-signup',
  OAUTH_CALLBACK: '/auth/oauth/callback',
  PROFILE: '/profile',

  // Attendance
  ATTENDANCE: '/attendance',

  // Legal
  PRIVACY: '/privacy',
  TERMS: '/terms',
  ABOUT: '/about',
  DISCLAIMER: '/disclaimer',

  // Blog
  BLOG: '/blog',
  BLOG_DETAIL: '/blog/:slug',
} as const;

export type RouteKey = keyof typeof ROUTES;
