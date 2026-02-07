import type { BalanceDetail } from "@/types/balance.types";
import type { BalanceCommentNodeModel } from "@/types/balanceComment.types";

export type VoteOption = "agree" | "disagree";
export type VoteState = VoteOption | null;

export interface UseBalanceDetailResult {
  issue: BalanceDetail | null;
  isLoading: boolean;
  errorMessage: string | null;

  isVoting: boolean;
  selectedOption: VoteState;
  setSelectedOption: React.Dispatch<React.SetStateAction<VoteState>>;

  comment: string;
  setComment: React.Dispatch<React.SetStateAction<string>>;

  replyToId: string | null;
  setReplyToId: React.Dispatch<React.SetStateAction<string | null>>;
  replyContent: string;
  setReplyContent: React.Dispatch<React.SetStateAction<string>>;

  editingCommentId: string | null;
  setEditingCommentId: React.Dispatch<React.SetStateAction<string | null>>;
  editingContent: string;
  setEditingContent: React.Dispatch<React.SetStateAction<string>>;

  expandedComments: Set<string>;
  setExpandedComments: React.Dispatch<React.SetStateAction<Set<string>>>;

  isLoginModalOpen: boolean;
  setIsLoginModalOpen: React.Dispatch<React.SetStateAction<boolean>>;

  isLoggedIn: boolean;
  isLoggedInNow: () => boolean;

  comments: BalanceCommentNodeModel[];

  handleVote: (option: VoteOption) => Promise<void>;
  handleSubmitComment: () => Promise<void>;
  handleDeleteComment: (commentId: string | number) => Promise<void>;
  handleStartReply: (commentId: string | number, depth: number) => void;
  handleSubmitReply: (parentId: string | number) => Promise<void>;
  handleStartEdit: (c: BalanceCommentNodeModel) => void;
  handleSubmitEdit: (commentId: string | number) => Promise<void>;
  handleToggleLike: (commentId: string | number) => Promise<void>;
}