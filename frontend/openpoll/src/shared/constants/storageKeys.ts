/**
 * LocalStorage 키 상수
 * 매직 스트링 대신 이 상수를 사용하여 오타로 인한 런타임 에러를 방지합니다.
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  SESSION: "openpoll_session_v1",
  OAUTH_PROVIDER: "oauthProvider",
  IS_OAUTH_USER: "isOAuthUser",
  SOCIAL_PROFILE_PENDING: "social_profile_pending",
  THEME: "theme",
} as const;
