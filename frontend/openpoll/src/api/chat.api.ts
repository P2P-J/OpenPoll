import { apiClient, API_BASE_URL } from "./client";
import type { ChatMessage, ApiResponse } from "@/types/api.types";

/**
 * 채팅 메시지 목록 조회 (cursor 기반 페이지네이션)
 * GET /chat/messages?cursor={cursor}&limit={limit}
 */
export const getMessages = async (
  cursor?: number,
  limit: number = 50,
): Promise<{ messages: ChatMessage[]; nextCursor: number | null }> => {
  const params: Record<string, number> = { limit };
  if (cursor !== undefined) {
    params.cursor = cursor;
  }
  const response = await apiClient.get<
    ApiResponse<{ messages: ChatMessage[]; nextCursor: number | null }>
  >("/chat/messages", { params });
  return response.data.data;
};

/**
 * 채팅 메시지 전송
 * POST /chat/messages
 */
export const sendMessage = async (content: string): Promise<ChatMessage> => {
  const response = await apiClient.post<ApiResponse<ChatMessage>>(
    "/chat/messages",
    { content },
  );
  return response.data.data;
};

/**
 * 실시간 채팅 스트림 (SSE)
 * GET /chat/stream
 */
/**
 * 실시간 채팅 스트림 (SSE) - 자동 재연결 포함
 * GET /chat/stream
 * @returns cleanup 함수
 */
export const subscribeToChatStream = (
  onMessage: (message: ChatMessage) => void,
  onError?: (error: Event) => void,
): { close: () => void } => {
  let eventSource: EventSource | null = null;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  let closed = false;

  const connect = () => {
    if (closed) return;
    eventSource = new EventSource(`${API_BASE_URL}/chat/stream`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "new_message" && data.message) {
          onMessage(data.message);
        }
      } catch {
        // SSE 데이터 파싱 실패는 무시
      }
    };

    eventSource.onerror = (e) => {
      if (onError) onError(e);
      eventSource?.close();
      // 3초 후 자동 재연결
      if (!closed) {
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };
  };

  connect();

  return {
    close: () => {
      closed = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      eventSource?.close();
    },
  };
};
