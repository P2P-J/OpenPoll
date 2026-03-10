export type SessionUser = {
  nickname: string;
  email: string;
  points: number;
};

const sessionKey = 'openpoll_session_v1';

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const getSession = () => readJson<SessionUser | null>(sessionKey, null);
