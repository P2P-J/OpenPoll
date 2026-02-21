import { apiClient, API_BASE_URL } from "./client";
import type {
  DashboardStats,
  ApiResponse,
} from "@/types/api.types";

/**
 * 전체 지지율 통계
 * GET /dashboard/stats
 */
export const getStats = async (): Promise<DashboardStats> => {
  const response =
    await apiClient.get<ApiResponse<DashboardStats>>("/dashboard/stats");
  return response.data.data;
};

/**
 * 실시간 지지율 스트림 (SSE)
 * GET /dashboard/stream
 */
export const subscribeToStream = (
  onMessage: (data: DashboardStats) => void,
  onError?: (error: Event) => void,
): EventSource => {
  const eventSource = new EventSource(
    `${API_BASE_URL}/dashboard/stream`,
  );

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "init" || data.type === "vote_update") {
        onMessage(data.stats);
      }
    } catch {
      // SSE 데이터 파싱 실패는 무시
    }
  };

  if (onError) {
    eventSource.onerror = onError;
  }

  return eventSource;
};
