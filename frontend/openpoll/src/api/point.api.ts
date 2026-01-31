import { apiClient } from "./client";
import type { AttendanceResponse, ApiResponse } from "@/types/api.types";

/**
 * 출석 체크
 * POST /points/attendance
 * 일일 출석 +30P, 7일 연속 출석 시 +20P 추가
 */
export const checkAttendance = async (): Promise<AttendanceResponse> => {
  const response =
    await apiClient.post<ApiResponse<AttendanceResponse>>("/points/attendance");
  return response.data.data;
};
