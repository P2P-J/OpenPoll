export type BalanceVoteOption = "agree" | "disagree" | "AGREE" | "DISAGREE";

export interface BalanceListItem {
  id: number;
  emoji?: string;
  title: string;
  subtitle?: string;
  description?: string;
  agreeCount?: number;
  disagreeCount?: number;
  totalVotes?: number;
  participants?: number;
  agreePercent?: number;
  disagreePercent?: number;
  myVote: boolean | null;
  createdAt?: string;
}

export interface BalanceDetail {
  id: number;
  emoji?: string;
  title: string;
  subtitle?: string;
  description: string;
  agreeCount: number;
  disagreeCount: number;
  totalVotes: number;
  agreePercent?: number;
  disagreePercent?: number;
  commentCount?: number;
  myVote: boolean | null;
  createdAt?: string;
}

export interface BalanceCommentUser {
  id: string;
  nickname: string;
  isAgree?: boolean;
}

export interface BalanceComment {
  id: number;
  content: string;
  createdAt: string;
  likeCount?: number;
  isLiked?: boolean | null;
  user: BalanceCommentUser;
  replies?: BalanceComment[];
}