// src/api/issue.api.ts
import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api.types";
import { getSession } from "@/shared/utils/localAuth";
import type {
  IssueComment,
  IssueDetail,
  IssueListItem,
  IssueVoteOption,
} from "@/types/issue.types";

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

/**
 * 명세: POST /balance/:id/vote body { isAgree: boolean }
 * - 취소(null)는 명세에 없음 -> http 모드에서는 호출 스킵
 */
async function voteIssueHttp(issueId: number, option: IssueVoteOption | null) {
  if (option === null) return { skipped: true } as unknown;

  const res = await apiClient.post<ApiResponse<BalanceVoteRes>>(
    `/balance/${issueId}/vote`,
    { isAgree: option === "agree" }
  );

  return res.data.data;
}

/**
 * 명세: POST /balance/:id/comments body { content, parentId }
 */
export type CreateIssueCommentPayload = {
  content: string;
  parentId?: string | number | null;
  option?: IssueVoteOption; // mock 표시용
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

/**
 * ✅ 댓글 좋아요 토글 (HTTP + MOCK 둘 다 지원)
 * 명세: POST /balance/:id/comments/:commentId/like
 */
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

/**
 * ✅ 댓글 수정 (HTTP)
 * 명세: PATCH /balance/:id/comments/:commentId body { content }
 */
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

/**
 * ✅ 댓글 삭제 (HTTP)
 * 명세: DELETE /balance/:id/comments/:commentId
 */
async function deleteCommentHttp(issueId: number, commentId: number): Promise<void> {
  await apiClient.delete(`/balance/${issueId}/comments/${commentId}`);
}

/**
 * =========================
 * MOCK (기존 유지)
 * =========================
 */
type MockIssue = IssueListItem & { description: string };

let mockIssues: MockIssue[] = [
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

const mockCommentStore: Record<number, IssueComment[]> = {};
let mockCommentIdSeq = 1000;

function nextMockCommentId() {
  mockCommentIdSeq += 1;
  return mockCommentIdSeq;
}

const keyOf = (v: string | number) => String(v);

function findCommentById(
  nodes: IssueComment[],
  commentId: string | number
): IssueComment | null {
  const target = keyOf(commentId);
  for (const c of nodes) {
    if (keyOf(c.id) === target) return c;
    const found = findCommentById(c.replies ?? [], commentId);
    if (found) return found;
  }
  return null;
}

function buildMockComments(issueId: number): IssueComment[] {
  if (issueId === 1) {
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

function getOrInitMockComments(issueId: number): IssueComment[] {
  if (!mockCommentStore[issueId]) {
    mockCommentStore[issueId] = buildMockComments(issueId);
  }
  return mockCommentStore[issueId];
}

async function getIssueListMock(): Promise<IssueListItem[]> {
  await sleep(150);
  return mockIssues.map(({ description: _desc, ...rest }) => rest);
}

async function getIssueDetailMock(issueId: number): Promise<IssueDetail> {
  await sleep(150);

  const base = mockIssues.find((x) => x.id === issueId);
  if (!base) throw new Error("이슈를 찾을 수 없습니다.");

  const rawComments = getOrInitMockComments(issueId);
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
  } as IssueDetail;
}

async function voteIssueMock(issueId: number, nextVote: IssueVoteOption | null) {
  await sleep(150);

  const idx = mockIssues.findIndex((x) => x.id === issueId);
  if (idx === -1) throw new Error("이슈를 찾을 수 없습니다.");

  const current = mockIssues[idx];
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

  mockIssues[idx] = {
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
  issueId: number,
  payload: CreateIssueCommentPayload
): Promise<IssueComment> {
  await sleep(150);

  const newComment: IssueComment = {
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

  const roots = getOrInitMockComments(issueId);

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

function toggleCommentLikeMock(issueId: number, commentId: number) {
  const roots = getOrInitMockComments(issueId);

  const dfs = (nodes: IssueComment[]): IssueComment | null => {
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
function deleteCommentMock(issueId: number, commentId: number): void {
  const roots = getOrInitMockComments(issueId);

  const remove = (nodes: IssueComment[]): IssueComment[] => {
    return (nodes ?? [])
      .filter((n) => keyOf(n.id) !== keyOf(commentId))
      .map((n) => ({ ...n, replies: remove(n.replies ?? []) }));
  };

  mockCommentStore[issueId] = remove(roots);
}

/**
 * 관리자 CRUD (명세)
 */
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
  if (apiMode === "mock") return getIssueListMock();
  return getIssueListHttp();
};

export const getIssueDetail = async (issueId: number): Promise<IssueDetail> => {
  if (apiMode === "mock") return getIssueDetailMock(issueId);
  return getIssueDetailHttp(issueId);
};

export const voteIssue = async (
  issueId: number,
  option: IssueVoteOption | null
) => {
  if (apiMode === "mock") return voteIssueMock(issueId, option);
  return voteIssueHttp(issueId, option);
};

export const createComment = async (
  issueId: number,
  payload: CreateIssueCommentPayload
): Promise<IssueComment> => {
  if (apiMode === "mock") return createCommentMock(issueId, payload);
  return createCommentHttp(issueId, payload);
};

export const toggleCommentLike = async (issueId: number, commentId: number) => {
  if (apiMode === "mock") return toggleCommentLikeMock(issueId, commentId);
  return toggleCommentLikeHttp(issueId, commentId);
};

export const updateComment = async (
  issueId: number,
  commentId: number,
  payload: { content: string }
) => {
  // mock 수정은 현재 필요 없어서 http만
  return updateCommentHttp(issueId, commentId, payload);
};

export const deleteComment = async (
  issueId: number,
  commentId: number
): Promise<void> => {
  if (apiMode === "mock") return deleteCommentMock(issueId, commentId);
  return deleteCommentHttp(issueId, commentId);
};

export const createIssue = async (payload: CreateIssuePayload) => {
  if (apiMode === "mock")
    throw new Error("mock 모드에서는 createIssue를 지원하지 않습니다.");
  return createIssueHttp(payload);
};

export const updateIssue = async (issueId: number, payload: UpdateIssuePayload) => {
  if (apiMode === "mock")
    throw new Error("mock 모드에서는 updateIssue를 지원하지 않습니다.");
  return updateIssueHttp(issueId, payload);
};

export const deleteIssue = async (issueId: number) => {
  if (apiMode === "mock")
    throw new Error("mock 모드에서는 deleteIssue를 지원하지 않습니다.");
  return deleteIssueHttp(issueId);
};

/**
 * ✅ 단일 issueApi 객체 (중복 선언 금지)
 */
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