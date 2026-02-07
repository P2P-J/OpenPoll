// src/types/balance.types.ts

export type BalanceVoteOption = "agree" | "disagree";

/**
 * 리스트 카드에서 쓰는 타입
 * - 기존 UI/컴포넌트들이 다양한 키를 참조할 수 있어서 optional을 넉넉하게 둠
 */
export type BalanceListItem = {
  id: number;
  emoji: string;

  // 화면에서 title/subtitle/description 섞어서 쓰는 경우가 많아서 둘 다 둠
  title: string;
  subtitle?: string;
  description?: string;

  // 투표 요약
  agreeCount?: number;
  disagreeCount?: number;
  totalVotes?: number;

  // 퍼센트 표시용
  agreePercent: number;
  disagreePercent?: number;

  // 참여자/댓글수
  participants?: number; // 일부 UI에서 totalVotes 대신 사용
  commentCount?: number;

  // 내 투표
  voted?: boolean;
  myVote: BalanceVoteOption | null;

  // 생성일
  createdAt?: string;

  // 확장 필드 허용(백엔드/목 데이터 혼합 대응)
  [key: string]: any;
};

export type BalanceComment = {
  id: number | string;
  author: string;

  // 댓글이 어느 진영인지 표시(UI 배지 등)
  option: BalanceVoteOption;

  content: string;
  likes: number;
  createdAt: string;

  // 대댓글 트리
  replies: BalanceComment[];

  // 백엔드 확장 필드(좋아요 여부/유저 객체 등)
  user?: any;
  likeCount?: number;
  isLiked?: boolean | null;

  [key: string]: any;
};

export type BalanceDetail = {
  id: number;
  emoji: string;
  title: string;
  description: string;

  agreeCount?: number;
  disagreeCount?: number;
  totalVotes?: number;

  agreePercent: number;
  disagreePercent?: number;

  commentCount?: number;
  comments: BalanceComment[];

  myVote: BalanceVoteOption | null;

  createdAt?: string;

  [key: string]: any;
};
