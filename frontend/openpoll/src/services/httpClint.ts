const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

function getAccessToken() {
  // 나중에 로그인 붙이면 여기만 바꿔도 됨
  return localStorage.getItem("accessToken");
}

export async function request<T>(
  path: string,
  options: {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const method = options.method ?? "GET";
  const token = getAccessToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // 에러 처리(백엔드 응답 규격 몰라도 안전하게)
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    let code: string | undefined;

    try {
      const data = await res.json();
      message = data?.message ?? message;
      code = data?.code;
    } catch {
      // json 아니면 무시
    }

    throw new ApiError(message, res.status, code);
  }

  // 204 No Content 같은 경우
  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}