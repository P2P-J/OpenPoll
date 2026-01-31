import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api.types";
import type { IssueDetail, IssueListItem, IssueComment } from "@/types/issue.types";

export type IssueVoteOption = "agree" | "disagree";

const apiMode = (import.meta.env.VITE_API_MODE ?? "mock") as "mock" | "http";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const mockIssues: IssueListItem[] = [
  {
    id: 1,
    emoji: "💼",
    title: "주 4일제 도입",
    description: "근로시간을 주 32시간으로 단축하는 제도",
    participants: 2340,
    comments: 156,
    agreePercent: 62,
    voted: false,
    myVote: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    emoji: "💰",
    title: "기본소득제 도입",
    description: "모든 국민에게 기본소득을 지급하는 제도",
    participants: 1892,
    comments: 203,
    agreePercent: 45,
    voted: true,
    myVote: "agree",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 3,
    emoji: "🎓",
    title: "대학 등록금 동결 연장",
    description: "대학 등록금 동결 정책을 계속 이어가는 것",
    participants: 3104,
    comments: 284,
    agreePercent: 71,
    voted: false,
    myVote: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: 4,
    emoji: "🚗",
    title: "전기차 보조금 축소",
    description: "전기차 구매 시 지급하는 보조금을 줄이는 것",
    participants: 1567,
    comments: 98,
    agreePercent: 38,
    voted: false,
    myVote: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },
  {
    id: 5,
    emoji: "📱",
    title: "SNS 실명제 도입",
    description: "SNS 사용 시 실명 인증을 의무화하는 제도",
    participants: 2891,
    comments: 412,
    agreePercent: 53,
    voted: true,
    myVote: "disagree",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 44).toISOString(),
  },
  {
    id: 6,
    emoji: "🪖",
    title: "병역 의무 기간 단축",
    description: "군 복무 기간을 현재보다 단축하는 것",
    participants: 4203,
    comments: 534,
    agreePercent: 79,
    voted: false,
    myVote: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
  },
];

const mockCommentStore: Record<number, IssueComment[]> = {};

/**
 * =========================
 * LIST
 * =========================
 */
async function getIssueListMock(): Promise<IssueListItem[]> {
  await sleep(150);
  return mockIssues;
}

// 백엔드 명세 오면 여기만 맞추면 됨
async function getIssueListHttp(): Promise<IssueListItem[]> {
  const res = await apiClient.get<ApiResponse<IssueListItem[]>>("/issues");
  return res.data.data;
}

export const getIssueList = async (): Promise<IssueListItem[]> => {
  return apiMode === "mock" ? getIssueListMock() : getIssueListHttp();
};

/**
 * =========================
 * DETAIL
 * =========================
 */
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
      },
      {
        id: 2,
        author: "user456",
        option: "disagree",
        content: "업종별로 현실 적용이 어려운 곳도 많습니다. 비용 부담도요.",
        likes: 18,
        createdAt: "3시간 전",
      },
      {
        id: 3,
        author: "user789",
        option: "agree",
        content: "단계적으로 도입하면 충분히 가능하다고 봅니다.",
        likes: 15,
        createdAt: "5시간 전",
      },
    ];
  }

  return [
    {
      id: 1,
      author: "guest",
      option: "agree",
      content: "상세/댓글은 백엔드 연동 후 실제 데이터로 교체됩니다.",
      likes: 4,
      createdAt: "방금 전",
    },
  ];
}

async function getIssueDetailMock(issueId: number): Promise<IssueDetail> {
  await sleep(150);

  const base = mockIssues.find((x) => x.id === issueId);
  if (!base) throw new Error("이슈를 찾을 수 없습니다.");

  const longDescription =
    base.id === 1
      ? "주 4일 근무제는 근로시간을 주 32시간으로 단축하여 근로자의 삶의 질을 개선하고, 생산성 향상을 도모하는 제도입니다. 일부 국가/기업에서 시범 운영 사례가 있으며, 업종별 적용 난이도와 비용 부담에 대한 논쟁이 있습니다."
      : `${base.description} (상세는 백엔드 연동 후 실제 데이터로 교체됩니다.)`;

  return {
    id: base.id,
    emoji: base.emoji,
    title: base.title,
    description: longDescription,
    totalVotes: base.participants,
    agreePercent: base.agreePercent,
    disagreePercent: 100 - base.agreePercent,

    myVote: base.myVote ?? null,

    comments: [...(mockCommentStore[base.id] ?? []), ...buildMockComments(base.id)],
  };
}


async function getIssueDetailHttp(issueId: number): Promise<IssueDetail> {
  const res = await apiClient.get<ApiResponse<IssueDetail>>(`/issues/${issueId}`);
  return res.data.data;
}

export const getIssueDetail = async (issueId: number): Promise<IssueDetail> => {
  return apiMode === "mock" ? getIssueDetailMock(issueId) : getIssueDetailHttp(issueId);
};

/**
 * =========================
 * VOTE
 * =========================
 */
async function voteIssueMock(issueId: number, nextVote: IssueVoteOption | null) {
  await sleep(150);

  const idx = mockIssues.findIndex((x) => x.id === issueId);
  if (idx === -1) throw new Error("이슈를 찾을 수 없습니다.");

  const current = mockIssues[idx];
  const prevVote: IssueVoteOption | null = current.myVote ?? null;

  // participants == totalVotes 라고 가정
  let totalVotes = current.participants;
  let agreeCount = Math.round((totalVotes * current.agreePercent) / 100);
  let disagreeCount = totalVotes - agreeCount;

  // 이전 투표 제거
  if (prevVote === "agree") {
    agreeCount -= 1;
    totalVotes -= 1;
  } else if (prevVote === "disagree") {
    disagreeCount -= 1;
    totalVotes -= 1;
  }

  // 새 투표 반영
  if (nextVote === "agree") {
    agreeCount += 1;
    totalVotes += 1;
  } else if (nextVote === "disagree") {
    disagreeCount += 1;
    totalVotes += 1;
  }

  // 안전장치
  agreeCount = Math.max(0, agreeCount);
  disagreeCount = Math.max(0, disagreeCount);
  totalVotes = Math.max(0, totalVotes);

  const agreePercent = totalVotes === 0 ? 0 : Math.round((agreeCount / totalVotes) * 100);

  mockIssues[idx] = {
    ...current,
    voted: nextVote !== null,
    myVote: nextVote,
    participants: totalVotes,
    agreePercent,
  };

  return { success: true };
}

// 백엔드 명세 오면 여기만 맞추면 됨
async function voteIssueHttp(issueId: number, option: IssueVoteOption | null) {
  // 예시안:
  // - 투표: POST /issues/:id/vote  body: { option }
  // - 취소: DELETE /issues/:id/vote
  if (option === null) {
    const res = await apiClient.delete<ApiResponse<unknown>>(`/issues/${issueId}/vote`);
    return res.data.data;
  }
  const res = await apiClient.post<ApiResponse<unknown>>(`/issues/${issueId}/vote`, { option });
  return res.data.data;
}

export const voteIssue = async (issueId: number, option: IssueVoteOption | null) => {
  return apiMode === "mock" ? voteIssueMock(issueId, option) : voteIssueHttp(issueId, option);
};

export type CreateIssueCommentPayload = {
  option: IssueVoteOption; // agree/disagree
  content: string;
};

async function createCommentMock(issueId: number, payload: CreateIssueCommentPayload): Promise<IssueComment> {
  await sleep(150);

  const newComment: IssueComment = {
    id: Date.now(), // mock용 임시 id
    author: "me",
    option: payload.option,
    content: payload.content,
    likes: 0,
    createdAt: "방금 전",
  };

  mockCommentStore[issueId] = [newComment, ...(mockCommentStore[issueId] ?? [])];

  // (선택) 목록 카드의 댓글 수 증가도 반영
  const idx = mockIssues.findIndex((x) => x.id === issueId);
  if (idx !== -1) {
    mockIssues[idx] = {
      ...mockIssues[idx],
      comments: mockIssues[idx].comments + 1,
    };
  }

  return newComment;
}

// 백엔드 명세 오면 여기만 바꾸면 됨
async function createCommentHttp(issueId: number, payload: CreateIssueCommentPayload): Promise<IssueComment> {
  const res = await apiClient.post<ApiResponse<IssueComment>>(`/issues/${issueId}/comments`, payload);
  return res.data.data;
}

export const createComment = async (issueId: number, payload: CreateIssueCommentPayload): Promise<IssueComment> => {
  return apiMode === "mock" ? createCommentMock(issueId, payload) : createCommentHttp(issueId, payload);
};
