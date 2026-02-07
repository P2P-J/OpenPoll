// src/api/balance.api.ts
import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api.types";
import { getSession } from "@/shared/utils/localAuth";
import type {
  BalanceComment,
  BalanceDetail,
  BalanceListItem,
  BalanceVoteOption,
} from "@/types/balance.types";

const apiMode = (import.meta.env.VITE_API_MODE ?? "mock") as "mock" | "http";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function getMyLabelFromSession() {
  const s = getSession() as any;
  return (
    s?.user?.nickname ||
    s?.user?.email ||
    s?.user?.id ||
    s?.nickname ||
    s?.email ||
    s?.id ||
    "me"
  );
}

function calcAgreePercent(agreeCount: number, totalVotes: number) {
  if (totalVotes <= 0) return 0;
  return Math.round((agreeCount / totalVotes) * 100);
}
function calcDisagreePercent(agreeCount: number, totalVotes: number) {
  return 100 - calcAgreePercent(agreeCount, totalVotes);
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

function mapBalanceCommentsToTree(items: BalanceCommentRes[]): BalanceComment[] {
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

async function getBalanceListHttp(): Promise<BalanceListItem[]> {
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
    } as BalanceListItem;
  });
}

async function getBalanceDetailHttp(balanceId: number): Promise<BalanceDetail> {
  const detailRes = await apiClient.get<ApiResponse<BalanceDetailRes>>(
    `/balance/${balanceId}`
  );
  const detail = detailRes.data.data;

  const commentsRes = await apiClient.get<ApiResponse<BalanceCommentRes[]>>(
    `/balance/${balanceId}/comments`
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
  } as BalanceDetail;
}

/**
 * 명세: POST /balance/:id/vote body { isAgree: boolean }
 * - 취소(null)는 명세에 없음 -> http 모드에서는 호출 스킵
 */
async function voteBalanceHttp(balanceId: number, option: BalanceVoteOption | null) {
  if (option === null) return { skipped: true } as unknown;

  const res = await apiClient.post<ApiResponse<BalanceVoteRes>>(
    `/balance/${balanceId}/vote`,
    { isAgree: option === "agree" }
  );

  return res.data.data;
}

/**
 * 명세: POST /balance/:id/comments body { content, parentId }
 */
export type CreateBalanceCommentPayload = {
  content: string;
  parentId?: string | number | null;
  option?: BalanceVoteOption; // mock 표시용
};

async function createCommentHttp(
  balanceId: number,
  payload: CreateBalanceCommentPayload
): Promise<BalanceComment> {
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
    `/balance/${balanceId}/comments`,
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

/**
 * ✅ 댓글 좋아요 토글 (HTTP + MOCK 둘 다 지원)
 * 명세: POST /balance/:id/comments/:commentId/like
 */
async function toggleCommentLikeHttp(balanceId: number, commentId: number) {
  const res = await apiClient.post(
    `/balance/${balanceId}/comments/${commentId}/like`
  );
  return (res.data?.data ?? res.data) as {
    commentId: number;
    likeCount: number;
    isLiked: boolean;
  };
}

/**
 * ✅ 댓글 수정 (HTTP)
 * 명세: PATCH /balance/:id/comments/:commentId body { content }
 */
async function updateCommentHttp(
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

/**
 * ✅ 댓글 삭제 (HTTP)
 * 명세: DELETE /balance/:id/comments/:commentId
 */
async function deleteCommentHttp(balanceId: number, commentId: number): Promise<void> {
  await apiClient.delete(`/balance/${balanceId}/comments/${commentId}`);
}

/**
 * =========================
 * MOCK (기존 유지)
 * =========================
 */
type MockBalance = BalanceListItem & { description: string };

let mockBalances: MockBalance[] = [
  {
    id: 1,
    emoji: "💼",
    title: "🔥 주 4일제 도입",
    subtitle: "근로시간을 주 32시간으로 단축하는 제도",
    description: "주 4일 근무제는 근로시간을 주 32시간으로..... (mock 상세)",
    agreeCount: 1450,
    disagreeCount: 890,
    totalVotes: 2340,
    agreePercent: calcAgreePercent(1450, 2340),
    disagreePercent: calcDisagreePercent(1450, 2340),
    commentCount: 156,
    myVote: null,
    createdAt: new Date().toISOString(),
  },
];

const mockCommentStore: Record<number, BalanceComment[]> = {};
let mockCommentIdSeq = 1000;

function nextMockCommentId() {
  mockCommentIdSeq += 1;
  return mockCommentIdSeq;
}

const keyOf = (v: string | number) => String(v);

function findCommentById(
  nodes: BalanceComment[],
  commentId: string | number
): BalanceComment | null {
  const target = keyOf(commentId);
  for (const c of nodes) {
    if (keyOf(c.id) === target) return c;
    const found = findCommentById(c.replies ?? [], commentId);
    if (found) return found;
  }
  return null;
}

function buildMockComments(balanceId: number): BalanceComment[] {
  if (balanceId === 1) {
    return [
      {
        id: 1,
        author: "user123",
        option: "agree",
        content: "도입 사례를 보면 생산성이 오히려 증가했다는 얘기도 많아요.",
        likes: 24,
        createdAt: "2시간 전",
        replies: [],
        // mock에서도 like 토글이 되게
        isLiked: false,
        likeCount: 24,
      } as any,
    ];
  }
  return [];
}

function getOrInitMockComments(balanceId: number): BalanceComment[] {
  if (!mockCommentStore[balanceId]) {
    mockCommentStore[balanceId] = buildMockComments(balanceId);
  }
  return mockCommentStore[balanceId];
}

async function getBalanceListMock(): Promise<BalanceListItem[]> {
  await sleep(150);
  return mockBalances.map(({ description: _desc, ...rest }) => rest);
}

async function getBalanceDetailMock(balanceId: number): Promise<BalanceDetail> {
  await sleep(150);

  const base = mockBalances.find((x) => x.id === balanceId);
  if (!base) throw new Error("이슈를 찾을 수 없습니다.");

  const rawComments = getOrInitMockComments(balanceId);
  const comments =
    typeof structuredClone === "function"
      ? structuredClone(rawComments)
      : JSON.parse(JSON.stringify(rawComments));

  return {
    id: base.id,
    emoji: base.emoji,
    title: base.title,
    description: base.description,

    agreeCount: base.agreeCount ?? 0,
    disagreeCount: base.disagreeCount ?? 0,
    totalVotes: base.totalVotes ?? 0,

    agreePercent: base.agreePercent ?? 0,
    disagreePercent: base.disagreePercent ?? 0,

    commentCount: base.commentCount ?? 0,
    myVote: base.myVote ?? null,
    comments,

    createdAt: base.createdAt,
  } as BalanceDetail;
}

async function voteBalanceMock(balanceId: number, nextVote: BalanceVoteOption | null) {
  await sleep(150);

  const idx = mockBalances.findIndex((x) => x.id === balanceId);
  if (idx === -1) throw new Error("이슈를 찾을 수 없습니다.");

  const current = mockBalances[idx];
  const prevVote = current.myVote;

  let agreeCount = current.agreeCount ?? 0;
  let disagreeCount = current.disagreeCount ?? 0;
  let totalVotes = current.totalVotes ?? 0;

  if (prevVote === "agree") {
    agreeCount -= 1;
    totalVotes -= 1;
  } else if (prevVote === "disagree") {
    disagreeCount -= 1;
    totalVotes -= 1;
  }

  if (nextVote === "agree") {
    agreeCount += 1;
    totalVotes += 1;
  } else if (nextVote === "disagree") {
    disagreeCount += 1;
    totalVotes += 1;
  }

  agreeCount = Math.max(0, agreeCount);
  disagreeCount = Math.max(0, disagreeCount);
  totalVotes = Math.max(0, totalVotes);

  const agreePercent = calcAgreePercent(agreeCount, totalVotes);
  const disagreePercent = 100 - agreePercent;

  mockBalances[idx] = {
    ...current,
    agreeCount,
    disagreeCount,
    totalVotes,
    agreePercent,
    disagreePercent,
    myVote: nextVote,
  };

  return { success: true };
}

async function createCommentMock(
  balanceId: number,
  payload: CreateBalanceCommentPayload
): Promise<BalanceComment> {
  await sleep(150);

  const newComment: BalanceComment = {
    id: nextMockCommentId(),
    author: getMyLabelFromSession(),
    option: payload.option ?? "agree",
    content: payload.content,
    likes: 0,
    createdAt: "방금 전",
    replies: [],
    isLiked: false,
    likeCount: 0,
  } as any;

  const roots = getOrInitMockComments(balanceId);

  if (payload.parentId != null) {
    const parent = findCommentById(roots, payload.parentId);
    if (!parent) throw new Error("부모 댓글을 찾을 수 없습니다.");
    parent.replies = [newComment, ...(parent.replies ?? [])];
  } else {
    roots.unshift(newComment);
  }

  return typeof structuredClone === "function"
    ? structuredClone(newComment)
    : JSON.parse(JSON.stringify(newComment));
}

function toggleCommentLikeMock(balanceId: number, commentId: number) {
  const roots = getOrInitMockComments(balanceId);

  const dfs = (nodes: BalanceComment[]): BalanceComment | null => {
    for (const n of nodes) {
      if (keyOf(n.id) === keyOf(commentId)) return n;
      const found = dfs(n.replies ?? []);
      if (found) return found;
    }
    return null;
  };

  const target = dfs(roots);
  if (!target) throw new Error("댓글을 찾을 수 없습니다.");

  const prevLiked = !!(target as any).isLiked;
  const nextLiked = !prevLiked;

  const prevCount = (target.likes ?? (target as any).likeCount ?? 0) as number;
  const nextCount = Math.max(0, prevCount + (nextLiked ? 1 : -1));

  (target as any).isLiked = nextLiked;
  (target as any).likeCount = nextCount;
  (target as any).likes = nextCount;

  return {
    commentId: Number(target.id),
    likeCount: nextCount,
    isLiked: nextLiked,
  };
}

/**
 * ✅ 댓글 삭제 (MOCK)
 */
function deleteCommentMock(balanceId: number, commentId: number): void {
  const roots = getOrInitMockComments(balanceId);

  const remove = (nodes: BalanceComment[]): BalanceComment[] => {
    return (nodes ?? [])
      .filter((n) => keyOf(n.id) !== keyOf(commentId))
      .map((n) => ({ ...n, replies: remove(n.replies ?? []) }));
  };

  mockCommentStore[balanceId] = remove(roots);
}

/**
 * 관리자 CRUD (명세)
 */
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

async function createBalanceHttp(payload: CreateBalancePayload) {
  const res = await apiClient.post<ApiResponse<any>>("/balance", payload);
  return res.data.data;
}

async function updateBalanceHttp(balanceId: number, payload: UpdateBalancePayload) {
  const res = await apiClient.patch<ApiResponse<any>>(
    `/balance/${balanceId}`,
    payload
  );
  return res.data.data;
}

async function deleteBalanceHttp(balanceId: number): Promise<void> {
  await apiClient.delete(`/balance/${balanceId}`);
}

/**
 * =========================
 * EXPORTED FUNCTIONS
 * =========================
 */
export const getBalanceList = async (): Promise<BalanceListItem[]> => {
  if (apiMode === "mock") return getBalanceListMock();
  return getBalanceListHttp();
};

export const getBalanceDetail = async (balanceId: number): Promise<BalanceDetail> => {
  if (apiMode === "mock") return getBalanceDetailMock(balanceId);
  return getBalanceDetailHttp(balanceId);
};

export const voteBalance = async (
  balanceId: number,
  option: BalanceVoteOption | null
) => {
  if (apiMode === "mock") return voteBalanceMock(balanceId, option);
  return voteBalanceHttp(balanceId, option);
};

export const createComment = async (
  balanceId: number,
  payload: CreateBalanceCommentPayload
): Promise<BalanceComment> => {
  if (apiMode === "mock") return createCommentMock(balanceId, payload);
  return createCommentHttp(balanceId, payload);
};

export const toggleCommentLike = async (balanceId: number, commentId: number) => {
  if (apiMode === "mock") return toggleCommentLikeMock(balanceId, commentId);
  return toggleCommentLikeHttp(balanceId, commentId);
};

export const updateComment = async (
  balanceId: number,
  commentId: number,
  payload: { content: string }
) => {
  // mock 수정은 현재 필요 없어서 http만
  return updateCommentHttp(balanceId, commentId, payload);
};

export const deleteComment = async (
  balanceId: number,
  commentId: number
): Promise<void> => {
  if (apiMode === "mock") return deleteCommentMock(balanceId, commentId);
  return deleteCommentHttp(balanceId, commentId);
};

export const createBalance = async (payload: CreateBalancePayload) => {
  if (apiMode === "mock")
    throw new Error("mock 모드에서는 createBalance를 지원하지 않습니다.");
  return createBalanceHttp(payload);
};

export const updateBalance = async (balanceId: number, payload: UpdateBalancePayload) => {
  if (apiMode === "mock")
    throw new Error("mock 모드에서는 updateBalance를 지원하지 않습니다.");
  return updateBalanceHttp(balanceId, payload);
};

export const deleteBalance = async (balanceId: number) => {
  if (apiMode === "mock")
    throw new Error("mock 모드에서는 deleteBalance를 지원하지 않습니다.");
  return deleteBalanceHttp(balanceId);
};

/**
 * ✅ 단일 balanceApi 객체 (중복 선언 금지)
 */
export const balanceApi = {
  getBalanceList,
  getBalanceDetail,
  voteBalance,
  createComment,
  createBalance,
  updateBalance,
  deleteBalance,
  toggleCommentLike,
  updateComment,
  deleteComment,
};
