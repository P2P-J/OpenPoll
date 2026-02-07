import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api.types";
import type {
  BalanceComment,
  BalanceDetail,
  BalanceListItem,
  BalanceVoteOption,
} from "@/types/balance.types";

// --- Helper functions ---

function calcAgreePercent(agreeCount: number, totalVotes: number) {
  if (totalVotes <= 0) return 0;
  return Math.round((agreeCount / totalVotes) * 100);
}

function mapMyVoteToOption(myVote?: boolean): BalanceVoteOption | null {
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

function splitEmojiTitle(rawTitle: string) {
  const s = (rawTitle ?? "").trim();
  if (!s) return { hasEmojiPrefix: false, emoji: "💬", title: "" };

  const m = s.match(/^(\S+)\s+(.+)$/);
  if (!m) return { hasEmojiPrefix: false, emoji: "💬", title: s };

  const firstToken = (m[1] ?? "").trim();
  const rest = (m[2] ?? "").trim();
  if (!firstToken || !rest) return { hasEmojiPrefix: false, emoji: "💬", title: s };

  return { hasEmojiPrefix: true, emoji: firstToken, title: rest };
}

// --- Backend response types ---

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

// --- Response mappers ---

function mapCommentsToTree(items: BalanceCommentRes[]): BalanceComment[] {
  return (items ?? []).map((c) => ({
    id: c.id,
    author: c.user?.nickname ?? c.user?.id ?? "unknown",
    option: c.user?.isAgree ? "agree" : "disagree",
    content: c.content,
    likes: c.likeCount ?? 0,
    createdAt: formatIso(c.createdAt),
    replies: mapCommentsToTree(c.replies ?? []),
    user: c.user,
    likeCount: c.likeCount,
    isLiked: c.isLiked ?? undefined,
  }));
}

function mapListItem(x: BalanceListItemRes): BalanceListItem {
  const agreePercent = calcAgreePercent(x.agreeCount, x.totalVotes);
  const myVote = mapMyVoteToOption(x.myVote);
  const parsed = splitEmojiTitle(x.title);

  return {
    id: x.id,
    emoji: parsed.hasEmojiPrefix ? parsed.emoji : pickEmojiById(x.id),
    title: parsed.hasEmojiPrefix ? parsed.title : x.title,
    description: x.subtitle,
    participants: x.totalVotes,
    agreePercent,
    voted: myVote !== null,
    myVote,
    createdAt: x.createdAt,
    totalVotes: x.totalVotes,
    agreeCount: x.agreeCount,
    disagreeCount: x.disagreeCount,
  } as BalanceListItem;
}

function mapDetail(detail: BalanceDetailRes): BalanceDetail {
  const agreePercent = calcAgreePercent(detail.agreeCount, detail.totalVotes);
  const parsed = splitEmojiTitle(detail.title);

  return {
    id: detail.id,
    emoji: parsed.hasEmojiPrefix ? parsed.emoji : pickEmojiById(detail.id),
    title: parsed.hasEmojiPrefix ? parsed.title : detail.title,
    description: detail.description,
    agreeCount: detail.agreeCount,
    disagreeCount: detail.disagreeCount,
    totalVotes: detail.totalVotes,
    agreePercent,
    disagreePercent: 100 - agreePercent,
    commentCount: detail.commentCount,
    myVote: mapMyVoteToOption(detail.myVote),
    createdAt: detail.createdAt,
  } as BalanceDetail;
}

function mapComment(c: BalanceCommentRes): BalanceComment {
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
    isLiked: c.isLiked ?? undefined,
  };
}

// --- Exported API functions ---

export async function getBalanceList(): Promise<BalanceListItem[]> {
  const res = await apiClient.get<ApiResponse<BalanceListItemRes[]>>("/balance");
  return (res.data.data ?? []).map(mapListItem);
}

export async function getBalanceDetail(balanceId: number): Promise<BalanceDetail> {
  const res = await apiClient.get<ApiResponse<BalanceDetailRes>>(`/balance/${balanceId}`);
  return mapDetail(res.data.data);
}

export async function getBalanceComments(balanceId: number): Promise<BalanceComment[]> {
  const res = await apiClient.get<ApiResponse<BalanceCommentRes[]>>(
    `/balance/${balanceId}/comments`
  );
  return mapCommentsToTree(res.data.data ?? []);
}

export async function voteBalance(balanceId: number, option: BalanceVoteOption | null) {
  if (option === null) return { skipped: true } as unknown;

  const res = await apiClient.post<ApiResponse<BalanceVoteRes>>(
    `/balance/${balanceId}/vote`,
    { isAgree: option === "agree" }
  );
  return res.data.data;
}

export type CreateBalanceCommentPayload = {
  content: string;
  parentId?: string | number | null;
};

export async function createComment(
  balanceId: number,
  payload: CreateBalanceCommentPayload
): Promise<BalanceComment> {
  const body: { content: string; parentId?: number } = {
    content: payload.content,
  };

  if (payload.parentId != null) {
    const parentIdNum = Number(payload.parentId);
    if (!Number.isFinite(parentIdNum)) throw new Error("잘못된 parentId 입니다.");
    body.parentId = parentIdNum;
  }

  const res = await apiClient.post<ApiResponse<BalanceCommentRes>>(
    `/balance/${balanceId}/comments`,
    body
  );
  return mapComment(res.data.data);
}

export async function toggleCommentLike(balanceId: number, commentId: number) {
  const res = await apiClient.post(
    `/balance/${balanceId}/comments/${commentId}/like`
  );
  return (res.data?.data ?? res.data) as {
    commentId: number;
    likeCount: number;
    isLiked: boolean;
  };
}

export async function updateComment(
  balanceId: number,
  commentId: number,
  payload: { content: string }
) {
  const res = await apiClient.patch(
    `/balance/${balanceId}/comments/${commentId}`,
    payload
  );
  return (res.data?.data ?? res.data) as {
    id: number;
    content: string;
  };
}

export async function deleteComment(balanceId: number, commentId: number): Promise<void> {
  await apiClient.delete(`/balance/${balanceId}/comments/${commentId}`);
}

// --- Admin CRUD ---

export type CreateBalancePayload = {
  title: string;
  subtitle: string;
  description: string;
};

export type UpdateBalancePayload = {
  title?: string;
  subtitle?: string;
  description?: string;
};

export async function createBalance(payload: CreateBalancePayload) {
  const res = await apiClient.post<ApiResponse<unknown>>("/balance", payload);
  return res.data.data;
}

export async function updateBalance(balanceId: number, payload: UpdateBalancePayload) {
  const res = await apiClient.patch<ApiResponse<unknown>>(
    `/balance/${balanceId}`,
    payload
  );
  return res.data.data;
}

export async function deleteBalance(balanceId: number): Promise<void> {
  await apiClient.delete(`/balance/${balanceId}`);
}
