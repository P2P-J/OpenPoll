export type StoredUser = {
  nickname: string;
  email: string;
  password: string;
  age: number;
  gender: 'male' | 'female';
  region: string;
  points: number;
  createdAt: string;
  updatedAt: string;
};

export type SessionUser = {
  nickname: string;
  email: string;
  points: number;
};

const usersKey = 'openpoll_users_v1';
const sessionKey = 'openpoll_session_v1';

const signupBonusPoints = 500;
const loginBonusPoints = 500;

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getUsers = () => readJson<StoredUser[]>(usersKey, []);

export const getSession = () => readJson<SessionUser | null>(sessionKey, null);

export const logout = () => {
  localStorage.removeItem(sessionKey);
};

export const registerUser = (payload: Omit<StoredUser, 'points' | 'createdAt' | 'updatedAt'>) => {
  const users = getUsers();

  const emailExists = users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase());
  if (emailExists) {
    return { ok: false as const, errorField: 'email' as const, message: '이미 사용 중인 이메일입니다.' };
  }

  const nicknameExists = users.some(
    (u) => u.nickname.toLowerCase() === payload.nickname.toLowerCase()
  );
  if (nicknameExists) {
    return { ok: false as const, errorField: 'nickname' as const, message: '이미 사용 중인 닉네임입니다.' };
  }

  const now = new Date().toISOString();

  const newUser: StoredUser = {
    ...payload,
    points: signupBonusPoints,
    createdAt: now,
    updatedAt: now,
  };

  users.push(newUser);
  writeJson(usersKey, users);

  const session: SessionUser = {
    email: newUser.email,
    nickname: newUser.nickname,
    points: newUser.points,
  };
  writeJson(sessionKey, session);

  return { ok: true as const, session, awardedPoints: signupBonusPoints };
};

export const loginUser = (email: string, password: string) => {
  const users = getUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());

  if (idx === -1) {
    return { ok: false as const, message: '이메일 또는 비밀번호가 올바르지 않습니다.' };
  }

  const user = users[idx];
  if (user.password !== password) {
    return { ok: false as const, message: '이메일 또는 비밀번호가 올바르지 않습니다.' };
  }

  const updatedUser: StoredUser = {
    ...user,
    points: user.points + loginBonusPoints,
    updatedAt: new Date().toISOString(),
  };

  users[idx] = updatedUser;
  writeJson(usersKey, users);

  const session: SessionUser = {
    email: updatedUser.email,
    nickname: updatedUser.nickname,
    points: updatedUser.points,
  };
  writeJson(sessionKey, session);

  return { ok: true as const, session, awardedPoints: loginBonusPoints };
};