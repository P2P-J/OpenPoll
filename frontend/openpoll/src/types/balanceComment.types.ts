export type VoteSide = "agree" | "disagree" | null;

export interface BalanceCommentUser {
  id?: string | number;
  nickname?: string;
  isAgree?: boolean | null;
}

export interface BalanceCommentNodeModel {
  id: string | number;
  content: string;
  createdAt?: string;
  likes?: number;
  likeCount?: number;
  isLiked?: boolean;
  user?: BalanceCommentUser;
  author?: string;
  replies?: BalanceCommentNodeModel[];
}