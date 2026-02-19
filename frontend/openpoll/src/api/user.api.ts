import { apiClient } from "./client";
import type {
  User,
  UpdateUserRequest,
  PointRecord,
  UserVoteStats,
  ApiResponse,
  PaginatedResponse,
  PaginatedApiResponse,
  PaginationParams,
} from "@/types/api.types";

/**
 * 내 정보 조회
 * GET /users/me
 */
export const getMe = async (): Promise<User> => {
  const response = await apiClient.get<ApiResponse<User>>("/users/me");
  return response.data.data;
};

/**
 * 내 정보 수정
 * PATCH /users/me
 */
export const updateMe = async (data: UpdateUserRequest): Promise<User> => {
  const response = await apiClient.patch<ApiResponse<User>>("/users/me", data);
  return response.data.data;
};

/**
 * 포인트 내역 조회
 * GET /users/me/points
 */
export const getPointHistory = async (
  params?: PaginationParams,
): Promise<PaginatedResponse<PointRecord>> => {
  const response = await apiClient.get<PaginatedApiResponse<PointRecord>>(
    "/users/me/points",
    { params },
  );
  return {
    data: response.data.data,
    pagination: response.data.pagination,
  };
};

/**
 * 내 투표 집계 조회
 * GET /users/me/votes
 */
export const getMyVotes = async (): Promise<UserVoteStats> => {
  const response =
    await apiClient.get<ApiResponse<UserVoteStats>>("/users/me/votes");
  return response.data.data;
};

/**
 * 회원탈퇴
 * DELETE /users/me
 *
 * TODO: 백엔드 구현 후 아래 주석을 해제하고 목업 코드를 삭제하세요.
 */
export const deleteAccount = async (): Promise<void> => {
  // --- 실제 API (백엔드 구현 후 주석 해제) ---
  // await apiClient.delete("/users/me");

  // --- 목업 (백엔드 구현 후 삭제) ---
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("[MOCK] 회원탈퇴 처리 완료");
};

/**
 * 비밀번호 변경
 * PATCH /auth/password
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  await apiClient.patch("/auth/password", {
    currentPassword,
    newPassword,
  });
  return;
};
