import { apiClient } from "./client";
import type { Party, ApiResponse } from "@/types/api.types";

/**
 * 정당 목록 조회
 * GET /parties
 */
export const getParties = async (): Promise<Party[]> => {
  const response = await apiClient.get<ApiResponse<Party[]>>("/parties");
  return response.data.data;
};
