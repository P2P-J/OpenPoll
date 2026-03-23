import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import type { ChatMessage } from "@/types/api.types";

interface ChatMessageListProps {
  messages: ChatMessage[];
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}

function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "방금 전";
  if (diff < 120) return "1분 전";
  if (diff < 180) return "2분 전";
  if (diff < 300) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 600) return "5분 전";
  if (diff < 1800) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;

  // 1시간 이상이면 날짜+시간 표시
  const d = new Date(dateString);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();

  if (isToday) {
    return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  }

  return d.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatMessageList({
  messages,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: ChatMessageListProps) {
  const { isDark } = useTheme();
  const listRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const prevScrollHeightRef = useRef(0);

  // 스크롤 위치 추적
  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;

    // 맨 아래 근처인지 확인 (30px 여유)
    isAtBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 30;

    // 위로 스크롤하여 상단 도달 시 이전 메시지 로드
    if (el.scrollTop < 40 && hasMore && !isLoadingMore) {
      prevScrollHeightRef.current = el.scrollHeight;
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  // 이전 메시지 로드 후 스크롤 위치 보정
  useEffect(() => {
    const el = listRef.current;
    if (!el || prevScrollHeightRef.current === 0) return;

    const newScrollHeight = el.scrollHeight;
    const diff = newScrollHeight - prevScrollHeightRef.current;
    if (diff > 0) {
      el.scrollTop += diff;
    }
    prevScrollHeightRef.current = 0;
  }, [messages.length]);

  // 새 메시지 도착 시 자동 스크롤 (맨 아래일 때만)
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    if (isAtBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  // 초기 로드 시 맨 아래로
  useEffect(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  return (
    <div
      ref={listRef}
      onScroll={handleScroll}
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "8px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {isLoadingMore && (
        <div
          className="flex items-center justify-center"
          style={{
            padding: "8px 0",
            color: "var(--color-foreground-muted)",
            fontSize: 12,
          }}
        >
          불러오는 중...
        </div>
      )}

      {messages.length === 0 && (
        <div
          className="flex items-center justify-center"
          style={{
            flex: 1,
            color: "var(--color-foreground-muted)",
            fontSize: 13,
          }}
        >
          아직 메시지가 없습니다
        </div>
      )}

      {messages.map((msg) => (
        <div
          key={msg.id}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            backgroundColor: isDark
              ? "rgba(255,255,255,0.04)"
              : "rgba(0,0,0,0.02)",
            transition: "background-color 0.15s",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "var(--color-foreground-subtle)",
              marginBottom: 2,
            }}
          >
            {formatRelativeTime(msg.createdAt)}
          </div>
          <div
            style={{
              fontSize: 14,
              color: "var(--color-foreground)",
              lineHeight: 1.5,
              wordBreak: "break-word",
            }}
          >
            <span
              className="font-bold"
              style={{ color: "var(--color-foreground)" }}
            >
              [{msg.nickname}]
            </span>
            {" : "}
            {msg.content}
          </div>
        </div>
      ))}
    </div>
  );
}
