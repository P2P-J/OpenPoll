import { apiClient } from "./client";
import type { VoteRequest, VoteResponse, ApiResponse } from "@/types/api.types";

/**
 * 정당 지지 투표
 * POST /votes
 * 비용: 5P
 */
export const castVote = async (data: VoteRequest): Promise<VoteResponse> => {
  const response = await apiClient.post<ApiResponse<VoteResponse>>(
    "/votes",
    data,
  );
  return response.data.data;
};
