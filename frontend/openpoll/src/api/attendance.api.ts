import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api.types";

export interface AttendanceStatus {
  checkedInToday: boolean;
  consecutiveDays: number;
  totalAttendanceDays: number;
  streakCycle: number; // 현재 7일 주기 내 위치 (1~7)
  recentAttendances: Array<{
    date: string;
    consecutiveDays: number;
  }>;
}

export interface CheckAttendanceResult {
  attendance: {
    id: number;
    userId: string;
    date: string;
    consecutiveDays: number;
  };
  pointsEarned: number;
  consecutiveDays: number;
  isStreakBonus: boolean;
}

export const getAttendanceStatus = async (): Promise<AttendanceStatus> => {
  const response = await apiClient.get<ApiResponse<AttendanceStatus>>(
    "/points/attendance/status",
  );
  return response.data.data;
};

export const checkAttendance = async (): Promise<CheckAttendanceResult> => {
  const response = await apiClient.post<ApiResponse<CheckAttendanceResult>>(
    "/points/attendance",
  );
  return response.data.data;
};
