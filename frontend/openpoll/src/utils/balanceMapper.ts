import type { BalanceComment, BalanceDetail, BalanceListItem } from "@/types/balance.types";

type UnknownRecord = Record<string, unknown>;

function asRecord(v: unknown): UnknownRecord {
  return (typeof v === "object" && v !== null ? v : {}) as UnknownRecord;
}

function toStr(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function toOptionalStr(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

function toNum(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function toBoolOrNull(v: unknown): boolean | null {
  if (v === true) return true;
  if (v === false) return false;
  return null;
}

function splitEmojiTitle(rawTitle: string): { emoji: string; title: string } {
  const s = rawTitle.trim();
  if (!s) return { emoji: "💬", title: "" };

  const m = s.match(/^(\S+)\s+(.+)$/);
  if (!m) return { emoji: "💬", title: s };

  const firstToken = m[1]?.trim() ?? "";
  const rest = m[2]?.trim() ?? "";
  if (!firstToken || !rest) return { emoji: "💬", title: s };

  return { emoji: firstToken, title: rest };
}

function mapBalanceComment(input: unknown): BalanceComment {
  const r = asRecord(input);
  const userRaw = asRecord(r.user);

  const user =
    Object.keys(userRaw).length > 0
      ? {
          id: userRaw.id as string | number | undefined,
          nickname: toOptionalStr(userRaw.nickname),
          isAgree: toBoolOrNull(userRaw.isAgree),
        }
      : undefined;

  return {
    id: r.id as string | number,
    content: toStr(r.content),
    createdAt: toOptionalStr(r.createdAt),
    likes: toNum(r.likes ?? r.likeCount, 0),
    likeCount: toNum(r.likeCount ?? r.likes, 0),
    isLiked: Boolean(r.isLiked),
    author: toOptionalStr(r.author),
    nickname: toOptionalStr(r.nickname),
    user,
    replies: Array.isArray(r.replies) ? r.replies.map(mapBalanceComment) : [],
  } as BalanceComment;
}

export function mapBalanceListItem(input: unknown): BalanceListItem {
  const r = asRecord(input);

  const rawTitle = toStr(r.title);
  const parsed = splitEmojiTitle(rawTitle);

  const agreeCount = toNum(r.agreeCount, 0);
  const disagreeCount = toNum(r.disagreeCount, 0);
  const totalVotes = toNum(r.totalVotes, agreeCount + disagreeCount);

  return {
    id: toNum(r.id),
    emoji: typeof r.emoji === "string" ? r.emoji : parsed.emoji,
    title: parsed.title || rawTitle,
    subtitle: toStr(r.subtitle),
    description: toStr(r.subtitle ?? r.description),
    agreeCount,
    disagreeCount,
    totalVotes,
    participants: toNum(r.participants, totalVotes),
    agreePercent:
      totalVotes > 0 ? toNum(r.agreePercent, Math.round((agreeCount / totalVotes) * 100)) : 0,
    disagreePercent:
      totalVotes > 0
        ? toNum(r.disagreePercent, 100 - Math.round((agreeCount / totalVotes) * 100))
        : 0,
    myVote: toBoolOrNull(r.myVote),
    createdAt: toOptionalStr(r.createdAt),
  };
}

export function mapBalanceDetail(input: unknown): BalanceDetail {
  const r = asRecord(input);

  const rawTitle = toStr(r.title);
  const parsed = splitEmojiTitle(rawTitle);

  const agreeCount = toNum(r.agreeCount, 0);
  const disagreeCount = toNum(r.disagreeCount, 0);
  const totalVotes = toNum(r.totalVotes, agreeCount + disagreeCount);

  return {
    id: toNum(r.id),
    emoji: typeof r.emoji === "string" ? r.emoji : parsed.emoji,
    title: parsed.title || rawTitle,
    subtitle: toStr(r.subtitle),
    description: toStr(r.description ?? r.subtitle),
    agreeCount,
    disagreeCount,
    totalVotes,
    agreePercent:
      totalVotes > 0 ? toNum(r.agreePercent, Math.round((agreeCount / totalVotes) * 100)) : 0,
    disagreePercent:
      totalVotes > 0
        ? toNum(r.disagreePercent, 100 - Math.round((agreeCount / totalVotes) * 100))
        : 0,
    commentCount: toNum(r.commentCount, 0),
    myVote: toBoolOrNull(r.myVote),
    createdAt: toOptionalStr(r.createdAt),
    comments: Array.isArray(r.comments) ? r.comments.map(mapBalanceComment) : [],
  } as BalanceDetail;
}