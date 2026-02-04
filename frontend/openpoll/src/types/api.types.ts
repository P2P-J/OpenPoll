// ============ Common Types ============

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Paginated API response (success + data + pagination at root level)
export interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============ Auth Types ============

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
  age: number;
  region: string;
  gender: "MALE" | "FEMALE";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// ============ User Types ============

export interface User {
  id: string;
  email: string;
  nickname: string;
  age: number;
  region: string;
  gender: "MALE" | "FEMALE";
  points: number;
  hasTakenDos: boolean;
  createdAt: string;
  totalEarnedPoints?: number;
}

export interface UpdateUserRequest {
  nickname?: string;
  age?: number;
  region?: string;
  gender?: "MALE" | "FEMALE";
}

// ============ Point Types ============

export interface PointRecord {
  id: number;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface AttendanceResponse {
  attendance: {
    id: number;
    date: string;
    consecutiveDays: number;
  };
  pointsEarned: number;
  consecutiveDays: number;
  isStreakBonus: boolean;
}

// ============ Party Types ============

export interface Party {
  id: number;
  name: string;
  color: string;
  logoUrl: string | null;
  voteCount: number;
}

// ============ Vote Types ============

export interface VoteRequest {
  partyId: number;
}

export interface VoteResponse {
  id: number;
  userId: string;
  partyId: number;
  createdAt: string;
  party: {
    name: string;
    color: string;
  };
  remainingPoints: number;
}

export interface UserVoteStats {
  totalVotes: number;
  stats: Array<{
    partyId: number;
    partyName: string;
    color: string;
    count: number;
  }>;
}

// ============ Dashboard Types ============

export interface DashboardStats {
  totalVotes: number;
  stats: Array<{
    partyId: number;
    partyName: string;
    color: string;
    count: number;
    percentage: number;
  }>;
  updatedAt: string;
}

export interface AgeGroupStats {
  ageGroup: string;
  total: number;
  stats: Array<{
    partyId: number;
    partyName: string;
    count: number;
    percentage: number;
  }>;
}

export interface RegionStats {
  region: string;
  total: number;
  stats: Array<{
    partyId: number;
    partyName: string;
    count: number;
    percentage: number;
  }>;
}

// ============ DOS Types ============

export interface DosQuestion {
  id: number;
  question: string;
  axis: "change" | "distribution" | "rights" | "development";
}

export interface DosAnswer {
  questionId: number;
  score: number; // 1-7
}

export interface DosCalculateRequest {
  answers: DosAnswer[];
}

export interface DosResult {
  resultType: string;
  axisPercentages: {
    change: number;
    distribution: number;
    rights: number;
    development: number;
  };
  resultTypeInfo: {
    id: string;
    name: string;
    description: string;
    traits: string;
  };
  pointsEarned: number;
}

export interface DosResultType {
  id: string;
  name: string;
  description: string;
  traits: string;
}

export interface DosStatistics {
  total: number;
  stats: Array<{
    resultType: string;
    count: number;
    percentage: string;
  }>;
}
