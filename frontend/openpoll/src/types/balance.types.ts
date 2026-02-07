import type { Dispatch, SetStateAction } from "react";

export type BalanceVoteOption = "agree" | "disagree" | "AGREE" | "DISAGREE";
export type VoteOption = "agree" | "disagree";
export type VoteState = VoteOption | null;
export type VoteSide = VoteOption | null;

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

export interface BalanceListItemExtended extends BalanceListItem {
  subtitle?: string;
  voted?: boolean | null;
}

export interface BalanceCommentUser {
  id?: string | number;
  nickname?: string;
  isAgree?: boolean | null;
}

export interface BalanceComment {
  id: string | number;
  content: string;
  createdAt?: string;
  likes?: number;
  likeCount?: number;
  isLiked?: boolean;
  option?: string;
  user?: BalanceCommentUser;
  author?: string;
  nickname?: string;
  replies?: BalanceComment[];
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
  comments?: BalanceComment[];
}

export type BalanceDetailWithComments = BalanceDetail & {
  comments: BalanceComment[];
};

export type SessionLike = {
  user?: {
    id?: string | number;
    email?: string;
    nickname?: string;
  };
  id?: string | number;
  email?: string;
  nickname?: string;
  userEmail?: string;
  profile?: {
    id?: string | number;
    email?: string;
    nickname?: string;
  };
};

export type AuthorLike = {
  user?: {
    id?: string | number;
    nickname?: string;
  };
  author?: string;
  nickname?: string;
};

export interface UseBalanceDetailResult {
  issue: BalanceDetail | null;
  isLoading: boolean;
  errorMessage: string | null;

  isVoting: boolean;
  selectedOption: VoteState;
  setSelectedOption: Dispatch<SetStateAction<VoteState>>;

  comment: string;
  setComment: Dispatch<SetStateAction<string>>;

  replyToId: string | null;
  setReplyToId: Dispatch<SetStateAction<string | null>>;
  replyContent: string;
  setReplyContent: Dispatch<SetStateAction<string>>;

  editingCommentId: string | null;
  setEditingCommentId: Dispatch<SetStateAction<string | null>>;
  editingContent: string;
  setEditingContent: Dispatch<SetStateAction<string>>;

  expandedComments: Set<string>;
  setExpandedComments: Dispatch<SetStateAction<Set<string>>>;

  isLoginModalOpen: boolean;
  setIsLoginModalOpen: Dispatch<SetStateAction<boolean>>;

  isLoggedIn: boolean;
  isLoggedInNow: () => boolean;

  comments: BalanceComment[];

  handleVote: (option: VoteOption) => Promise<void>;
  handleSubmitComment: () => Promise<void>;
  handleDeleteComment: (commentId: string | number) => Promise<void>;
  handleStartReply: (commentId: string | number, depth: number) => void;
  handleSubmitReply: (parentId: string | number) => Promise<void>;
  handleStartEdit: (c: BalanceComment) => void;
  handleSubmitEdit: (commentId: string | number) => Promise<void>;
  handleToggleLike: (commentId: string | number) => Promise<void>;
}

export type BalanceFormPayload = {
  title: string;
  subtitle: string;
  description: string;
};
