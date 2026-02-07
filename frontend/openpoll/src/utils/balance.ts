import type { BalanceDetail, BalanceListItem } from "@/types/balance.types";

type RawBalanceListItem = {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  agreeCount?: number;
  disagreeCount?: number;
  totalVotes?: number;
  participants?: number;
  myVote?: boolean | null;
  createdAt?: string;
};

type RawBalanceDetail = {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  agreeCount?: number;
  disagreeCount?: number;
  totalVotes?: number;
  commentCount?: number;
  myVote?: boolean | null;
  createdAt?: string;
};

export function splitEmojiTitle(rawTitle: string): { emoji: string; title: string } {
  const text = (rawTitle ?? "").trim();
  if (!text) return { emoji: "🗳️", title: "" };

  const m = text.match(/^(\S+)\s+(.+)$/);
  if (!m) return { emoji: "🗳️", title: text };

  const first = (m[1] ?? "").trim();
  const rest = (m[2] ?? "").trim();
  const emojiRe = /\p{Extended_Pictographic}/u;

  if (emojiRe.test(first) && rest) return { emoji: first, title: rest };
  return { emoji: "🗳️", title: text };
}

export function mergeEmojiTitle(emoji: string, title: string): string {
  const e = (emoji ?? "").trim();
  const t = (title ?? "").trim();
  if (!e) return t;
  if (!t) return e;
  return `${e} ${t}`;
}

export function toBalanceListItem(raw: RawBalanceListItem): BalanceListItem {
  const { emoji, title } = splitEmojiTitle(raw.title ?? "");
  const totalVotes = Number(raw.totalVotes ?? raw.participants ?? 0);
  const agreeCount = Number(raw.agreeCount ?? 0);
  const disagreeCount = Number(raw.disagreeCount ?? 0);

  return {
    id: Number(raw.id),
    emoji,
    title,
    description: (raw.subtitle ?? raw.description ?? "").trim(),
    agreeCount,
    disagreeCount,
    totalVotes,
    participants: totalVotes,
    agreePercent: totalVotes > 0 ? Math.round((agreeCount / totalVotes) * 100) : 0,
    myVote: raw.myVote ?? null,
    createdAt: raw.createdAt,
  };
}

export function toBalanceDetail(raw: RawBalanceDetail): BalanceDetail {
  const { emoji, title } = splitEmojiTitle(raw.title ?? "");
  const totalVotes = Number(raw.totalVotes ?? 0);
  const agreeCount = Number(raw.agreeCount ?? 0);
  const disagreeCount = Number(raw.disagreeCount ?? 0);

  return {
    id: Number(raw.id),
    emoji,
    title,
    subtitle: (raw.subtitle ?? "").trim(),
    description: (raw.description ?? "").trim(),
    agreeCount,
    disagreeCount,
    totalVotes,
    commentCount: Number(raw.commentCount ?? 0),
    myVote: raw.myVote ?? null,
    agreePercent: totalVotes > 0 ? Math.round((agreeCount / totalVotes) * 100) : 0,
    disagreePercent: totalVotes > 0 ? Math.round((disagreeCount / totalVotes) * 100) : 0,
    createdAt: raw.createdAt,
  };
}