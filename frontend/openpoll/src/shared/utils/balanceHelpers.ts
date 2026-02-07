import { getSession } from "@/shared/utils/localAuth";
import type {
  SessionLike,
  AuthorLike,
  BalanceDetail,
  BalanceDetailWithComments,
  VoteState,
  VoteOption,
} from "@/types/balance.types";

export const ADMIN_EMAILS = new Set<string>([
  "oct95@naver.com",
  "admin@test.com",
]);

export function getSessionLike(): SessionLike {
  const raw = getSession();
  if (typeof raw === "object" && raw !== null) return raw as SessionLike;
  return {};
}

export function keyOf(v: string | number): string {
  return String(v);
}

export function getMyLabelFromSession(): string {
  const s = getSessionLike();
  return (
    s.user?.nickname ||
    s.user?.email ||
    (s.user?.id != null ? String(s.user.id) : undefined) ||
    s.nickname ||
    s.email ||
    (s.id != null ? String(s.id) : undefined) ||
    "me"
  );
}

export function getMyUserIdFromSession(): string | null {
  const s = getSessionLike();
  const id = s.user?.id ?? s.id;
  return id != null ? String(id) : null;
}

export function getMyNicknameFromSession(): string | null {
  const s = getSessionLike();
  return s.user?.nickname || s.nickname || null;
}

export function getAuthorLabel(c: AuthorLike): string {
  if (c.user?.nickname) return c.user.nickname;
  if (c.user?.id != null) return String(c.user.id);
  if (c.author === "me") return getMyLabelFromSession();
  if (typeof c.author === "string" && c.author.trim() !== "") return c.author;
  if (c.nickname) return c.nickname;
  return "익명";
}

export function pickIdentityFromAnywhere(): { email?: string } {
  const s = getSessionLike();
  const sessionEmail =
    s.user?.email || s.email || s.userEmail || s.profile?.email;
  return { email: sessionEmail || undefined };
}

export function isAdminByIdentity(input: { email?: string }): boolean {
  const email = (input.email ?? "").toLowerCase().trim();
  return !!email && ADMIN_EMAILS.has(email);
}

export function fromMyVote(v: boolean | null | undefined): VoteState {
  if (v === true) return "agree";
  if (v === false) return "disagree";
  return null;
}

export function toApiVote(option: VoteOption): VoteOption {
  return option;
}

export function getAgreeCountSafe(issue: BalanceDetail): number {
  const total = Number(issue.totalVotes ?? 0);
  if (typeof issue.agreeCount === "number") return issue.agreeCount;
  const p = Number(issue.agreePercent ?? 0);
  return Math.round((total * p) / 100);
}

export function getDisagreeCountSafe(issue: BalanceDetail): number {
  const total = Number(issue.totalVotes ?? 0);
  if (typeof issue.disagreeCount === "number") return issue.disagreeCount;
  const agree = getAgreeCountSafe(issue);
  return Math.max(0, total - agree);
}

export function getTotalVotesSafe(issue: BalanceDetail): number {
  if (typeof issue.totalVotes === "number") return issue.totalVotes;
  const agree = typeof issue.agreeCount === "number" ? issue.agreeCount : 0;
  const disagree =
    typeof issue.disagreeCount === "number" ? issue.disagreeCount : 0;
  return Math.max(0, agree + disagree);
}

export function applyVoteOptimistic(
  issue: BalanceDetail,
  prevVote: VoteState,
  nextVote: VoteState
): BalanceDetail {
  let totalVotes = getTotalVotesSafe(issue);
  let agreeCount = getAgreeCountSafe(issue);
  let disagreeCount = getDisagreeCountSafe(issue);

  if (prevVote === "agree") {
    agreeCount -= 1;
    totalVotes -= 1;
  }
  if (prevVote === "disagree") {
    disagreeCount -= 1;
    totalVotes -= 1;
  }
  if (nextVote === "agree") {
    agreeCount += 1;
    totalVotes += 1;
  }
  if (nextVote === "disagree") {
    disagreeCount += 1;
    totalVotes += 1;
  }

  agreeCount = Math.max(0, agreeCount);
  disagreeCount = Math.max(0, disagreeCount);
  totalVotes = Math.max(0, totalVotes);

  const agreePercent =
    totalVotes === 0 ? 0 : Math.round((agreeCount / totalVotes) * 100);
  const disagreePercent =
    totalVotes === 0 ? 0 : Math.max(0, 100 - agreePercent);

  return {
    ...issue,
    totalVotes,
    agreeCount,
    disagreeCount,
    agreePercent,
    disagreePercent,
  };
}

export function ensureCommentsShape(
  issue: BalanceDetail
): BalanceDetailWithComments {
  return {
    ...issue,
    comments: Array.isArray(issue.comments) ? issue.comments : [],
  };
}

export function countAllComments<
  T extends { replies?: T[] }
>(nodes: T[]): number {
  let count = 0;
  for (const n of nodes ?? []) {
    count += 1;
    count += countAllComments(n.replies ?? []);
  }
  return count;
}
