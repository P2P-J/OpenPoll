import { apiClient } from "./client";
import type {
  DashboardStats,
  AgeGroupStats,
  RegionStats,
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
 * 나이별 지지율 통계
 * GET /dashboard/stats/by-age
 */
export const getStatsByAge = async (): Promise<AgeGroupStats[]> => {
  const response = await apiClient.get<ApiResponse<AgeGroupStats[]>>(
    "/dashboard/stats/by-age",
  );
  return response.data.data;
};

/**
 * 지역별 지지율 통계
 * GET /dashboard/stats/by-region
 */
export const getStatsByRegion = async (): Promise<RegionStats[]> => {
  const response = await apiClient.get<ApiResponse<RegionStats[]>>(
    "/dashboard/stats/by-region",
  );
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
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
  const eventSource = new EventSource(
    `${API_BASE_URL}/dashboard/stream`,
  );

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "init" || data.type === "vote_update") {
        onMessage(data.stats);
      }
    } catch (error) {
      console.error("Failed to parse SSE data:", error);
    }
  };

  if (onError) {
    eventSource.onerror = onError;
  }

  return eventSource;
};
