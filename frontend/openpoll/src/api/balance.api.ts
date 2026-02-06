import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api.types";
import type {
  IssueComment,
  IssueDetail,
  IssueListItem,
  IssueVoteOption,
} from "@/types/balance.types";



function calcAgreePercent(agreeCount: number, totalVotes: number) {
  if (totalVotes <= 0) return 0;
  return Math.round((agreeCount / totalVotes) * 100);
}

function mapMyVoteToOption(myVote?: boolean): IssueVoteOption | null {
  if (myVote === true) return "agree";
  if (myVote === false) return "disagree";
  return null;
}

function pickEmojiById(id: number) {
  const emojis = ["💼", "💰", "🎓", "🚗", "📱", "🪖", "🏠", "🌏", "⚖️", "🧑‍⚕️"];
  return emojis[(id - 1) % emojis.length];
}

function formatIso(iso: string) {
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return iso;
  return t.toLocaleString();
}

/**
 * 제목 규칙 파싱:
 * - 입력: "🔥 주 4일제 도입"
 * - 결과: { hasEmojiPrefix:true, emoji:"🔥", title:"주 4일제 도입" }
 * - 이모지 접두가 없으면 hasEmojiPrefix:false
 */
function splitEmojiTitle(rawTitle: string): {
  hasEmojiPrefix: boolean;
  emoji: string;
  title: string;
} {
  const s = (rawTitle ?? "").trim();
  if (!s) return { hasEmojiPrefix: false, emoji: "💬", title: "" };

  const m = s.match(/^(\S+)\s+(.+)$/);
  if (!m) return { hasEmojiPrefix: false, emoji: "💬", title: s };

  const firstToken = (m[1] ?? "").trim();
  const rest = (m[2] ?? "").trim();
  if (!firstToken || !rest) return { hasEmojiPrefix: false, emoji: "💬", title: s };

  return { hasEmojiPrefix: true, emoji: firstToken, title: rest };
}

/**
 * =========================
 * HTTP (명세 기반)
 * =========================
 */

type BalanceListItemRes = {
  id: number;
  title: string;
  subtitle: string;
  agreeCount: number;
  disagreeCount: number;
  totalVotes: number;
  myVote?: boolean;
  createdAt: string;
};

type BalanceDetailRes = {
  id: number;
  title: string;
  description: string;
  agreeCount: number;
  disagreeCount: number;
  totalVotes: number;
  commentCount: number;
  myVote?: boolean;
  createdAt: string;
};

type BalanceVoteRes = {
  id: number;
  title: string;
  agreeCount: number;
  disagreeCount: number;
  totalVotes: number;
  agreePercent: number;
  disagreePercent: number;
  myVote: boolean;
  pointsEarned: number;
  remainingPoints: number;
};

type BalanceCommentUserRes = {
  id: string;
  nickname: string;
  isAgree: boolean;
};

type BalanceCommentRes = {
  id: number;
  content: string;
  createdAt: string;
  likeCount?: number;
  isLiked?: boolean | null;
  user: BalanceCommentUserRes;
  replies?: BalanceCommentRes[];
};

function mapBalanceCommentsToTree(items: BalanceCommentRes[]): IssueComment[] {
  return (items ?? []).map((c) => ({
    id: c.id,
    author: c.user?.nickname ?? c.user?.id ?? "unknown",
    option: c.user?.isAgree ? "agree" : "disagree",
    content: c.content,
    likes: c.likeCount ?? 0,
    createdAt: formatIso(c.createdAt),
    replies: mapBalanceCommentsToTree(c.replies ?? []),

    // UI에서 그대로 쓰는 확장 필드들(타입에 없어도 as any로 씀)
    user: c.user,
    likeCount: c.likeCount,
    isLiked: c.isLiked ?? null,
  })) as any;
}

async function getIssueListHttp(): Promise<IssueListItem[]> {
  const res = await apiClient.get<ApiResponse<BalanceListItemRes[]>>("/balance");
  const list = res.data.data ?? [];

  return list.map((x) => {
    const agreePercent = calcAgreePercent(x.agreeCount, x.totalVotes);
    const myVote = mapMyVoteToOption(x.myVote);

    const parsed = splitEmojiTitle(x.title);
    const emoji = parsed.hasEmojiPrefix ? parsed.emoji : pickEmojiById(x.id);
    const title = parsed.hasEmojiPrefix ? parsed.title : x.title;

    return {
      id: x.id,
      emoji,

      title,
      description: x.subtitle,
      participants: x.totalVotes,

      agreePercent,
      voted: myVote !== null,
      myVote,
      createdAt: x.createdAt,

      totalVotes: x.totalVotes,
      agreeCount: x.agreeCount,
      disagreeCount: x.disagreeCount,
    } as IssueListItem;
  });
}

async function getIssueDetailHttp(issueId: number): Promise<IssueDetail> {
  const detailRes = await apiClient.get<ApiResponse<BalanceDetailRes>>(
    `/balance/${issueId}`
  );
  const detail = detailRes.data.data;

  const commentsRes = await apiClient.get<ApiResponse<BalanceCommentRes[]>>(
    `/balance/${issueId}/comments`
  );
  const comments = mapBalanceCommentsToTree(commentsRes.data.data ?? []);

  const agreePercent = calcAgreePercent(detail.agreeCount, detail.totalVotes);
  const disagreePercent = 100 - agreePercent;

  const parsed = splitEmojiTitle(detail.title);
  const emoji = parsed.hasEmojiPrefix ? parsed.emoji : pickEmojiById(detail.id);
  const title = parsed.hasEmojiPrefix ? parsed.title : detail.title;

  return {
    id: detail.id,
    emoji,
    title,
    description: detail.description,

    agreeCount: detail.agreeCount,
    disagreeCount: detail.disagreeCount,
    totalVotes: detail.totalVotes,

    agreePercent,
    disagreePercent,

    commentCount: detail.commentCount,
    myVote: mapMyVoteToOption(detail.myVote),
    comments,
    createdAt: detail.createdAt,
  } as IssueDetail;
}

async function voteIssueHttp(issueId: number, option: IssueVoteOption | null) {
  if (option === null) return { skipped: true } as unknown;

  const res = await apiClient.post<ApiResponse<BalanceVoteRes>>(
    `/balance/${issueId}/vote`,
    { isAgree: option === "agree" }
  );

  return res.data.data;
}

export type CreateIssueCommentPayload = {
  content: string;
  parentId?: string | number | null;
};

async function createCommentHttp(
  issueId: number,
  payload: CreateIssueCommentPayload
): Promise<IssueComment> {
  // ✅ 루트 댓글이면 parentId를 "아예" 보내지 않는다
  const body: { content: string; parentId?: number } = {
    content: payload.content,
  };

  if (payload.parentId != null) {
    const parentIdNum = Number(payload.parentId);
    if (!Number.isFinite(parentIdNum)) throw new Error("잘못된 parentId 입니다.");
    body.parentId = parentIdNum;
  }

  const res = await apiClient.post<ApiResponse<BalanceCommentRes>>(
    `/balance/${issueId}/comments`,
    body
  );

  const c = res.data.data;
  return {
    id: c.id,
    author: c.user?.nickname ?? c.user?.id ?? "unknown",
    option: c.user?.isAgree ? "agree" : "disagree",
    content: c.content,
    likes: c.likeCount ?? 0,
    createdAt: formatIso(c.createdAt),
    replies: [],
    user: c.user,
    likeCount: c.likeCount,
    isLiked: c.isLiked ?? null,
  } as any;
}


async function toggleCommentLikeHttp(issueId: number, commentId: number) {
  const res = await apiClient.post(
    `/balance/${issueId}/comments/${commentId}/like`
  );
  return (res.data?.data ?? res.data) as {
    commentId: number;
    likeCount: number;
    isLiked: boolean;
  };
}


async function updateCommentHttp(
  issueId: number,
  commentId: number,
  payload: { content: string }
) {
  const res = await apiClient.patch(
    `/balance/${issueId}/comments/${commentId}`,
    payload
  );
  return (res.data?.data ?? res.data) as {
    id: number;
    content: string;
  };
}

async function deleteCommentHttp(issueId: number, commentId: number): Promise<void> {
  await apiClient.delete(`/balance/${issueId}/comments/${commentId}`);
}

export type CreateIssuePayload = {
  title: string;
  subtitle: string;
  description: string;
};

export type UpdateIssuePayload = {
  title?: string;
  subtitle?: string;
  description?: string;
};

async function createIssueHttp(payload: CreateIssuePayload) {
  const res = await apiClient.post<ApiResponse<any>>("/balance", payload);
  return res.data.data;
}

async function updateIssueHttp(issueId: number, payload: UpdateIssuePayload) {
  const res = await apiClient.patch<ApiResponse<any>>(
    `/balance/${issueId}`,
    payload
  );
  return res.data.data;
}

async function deleteIssueHttp(issueId: number): Promise<void> {
  await apiClient.delete(`/balance/${issueId}`);
}

/**
 * =========================
 * EXPORTED FUNCTIONS
 * =========================
 */
export const getIssueList = async (): Promise<IssueListItem[]> => {
  return getIssueListHttp();
};

export const getIssueDetail = async (issueId: number): Promise<IssueDetail> => {
  return getIssueDetailHttp(issueId);
};

export const voteIssue = async (
  issueId: number,
  option: IssueVoteOption | null
) => {
  return voteIssueHttp(issueId, option);
};

export const createComment = async (
  issueId: number,
  payload: CreateIssueCommentPayload
): Promise<IssueComment> => {
  return createCommentHttp(issueId, payload);
};

export const toggleCommentLike = async (issueId: number, commentId: number) => {
  return toggleCommentLikeHttp(issueId, commentId);
};

export const updateComment = async (
  issueId: number,
  commentId: number,
  payload: { content: string }
) => {
  return updateCommentHttp(issueId, commentId, payload);
};

export const deleteComment = async (
  issueId: number,
  commentId: number
): Promise<void> => {
  return deleteCommentHttp(issueId, commentId);
};

export const createIssue = async (payload: CreateIssuePayload) => {
  return createIssueHttp(payload);
};

export const updateIssue = async (issueId: number, payload: UpdateIssuePayload) => {
  return updateIssueHttp(issueId, payload);
};

export const deleteIssue = async (issueId: number) => {
  return deleteIssueHttp(issueId);
};


export const issueApi = {
  getIssueList,
  getIssueDetail,
  voteIssue,
  createComment,
  createIssue,
  updateIssue,
  deleteIssue,
  toggleCommentLike,
  updateComment,
  deleteComment,
};