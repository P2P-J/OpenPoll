import { apiClient } from "./client";
import type {
  DosQuestion,
  DosCalculateRequest,
  DosResult,
  DosResultType,
  DosStatistics,
  ApiResponse,
} from "@/types/api.types";

/**
 * DOS 질문 목록 조회
 * GET /dos/questions
 */
export const getQuestions = async (): Promise<DosQuestion[]> => {
  const response =
    await apiClient.get<ApiResponse<DosQuestion[]>>("/dos/questions");
  return response.data.data;
};

/**
 * DOS 결과 계산
 * POST /dos/calculate
 * 로그인 시 최초 1회 +300P
 */
export const calculateResult = async (
  data: DosCalculateRequest,
): Promise<DosResult> => {
  const response = await apiClient.post<ApiResponse<DosResult>>(
    "/dos/calculate",
    data,
  );
  return response.data.data;
};

/**
 * DOS 유형 설명 조회
 * GET /dos/result/:resultType
 */
export const getResultType = async (
  resultType: string,
): Promise<DosResultType> => {
  const response = await apiClient.get<ApiResponse<DosResultType>>(
    `/dos/result/${resultType}`,
  );
  return response.data.data;
};

/**
 * DOS 통계
 * GET /dos/statistics
 */
export const getStatistics = async (): Promise<DosStatistics> => {
  const response =
    await apiClient.get<ApiResponse<DosStatistics>>("/dos/statistics");
  return response.data.data;
};
