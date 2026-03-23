import { useState, useEffect, useCallback, useRef } from "react";
import { MessageCircle, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "@/contexts/ThemeContext";
import * as chatApi from "@/api/chat.api";
import type { ChatMessage } from "@/types/api.types";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";

export function ChatWidget() {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const isOpenRef = useRef(isOpen);

  // isOpenRef를 동기화
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // 초기 메시지 로드
  useEffect(() => {
    const loadInitial = async () => {
      try {
        const result = await chatApi.getMessages(undefined, 50);
        setMessages(result.messages);
        setNextCursor(result.nextCursor);
      } catch {
        // 초기 로드 실패 무시
      }
    };
    loadInitial();
  }, []);

  // SSE 구독 (자동 재연결 포함)
  useEffect(() => {
    const subscription = chatApi.subscribeToChatStream((newMessage) => {
      setMessages((prev) => {
        // 중복 방지
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });

      // 닫혀있으면 unread 증가
      if (!isOpenRef.current) {
        setUnreadCount((c) => c + 1);
      }
    });

    return () => {
      subscription.close();
    };
  }, []);

  // 열면 unread 초기화
  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setUnreadCount(0);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // 이전 메시지 로드
  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const result = await chatApi.getMessages(nextCursor, 30);
      setMessages((prev) => [...result.messages, ...prev]);
      setNextCursor(result.nextCursor);
    } catch {
      // 로드 실패 무시
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, isLoadingMore]);

  // 메시지 전송
  const handleSend = useCallback(async (content: string) => {
    setIsSending(true);
    setSendError(null);
    try {
      const sent = await chatApi.sendMessage(content);
      setMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "전송에 실패했습니다";
      setSendError(msg);
      setTimeout(() => setSendError(null), 3000);
    } finally {
      setIsSending(false);
    }
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        zIndex: 50,
      }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              width: 420,
              height: 480,
              maxWidth: "calc(100vw - 48px)",
              maxHeight: "60vh",
              borderRadius: 16,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              marginBottom: 12,
              backgroundColor: isDark
                ? "var(--color-surface)"
                : "var(--color-surface)",
              border: `1px solid var(--color-border)`,
              boxShadow: isDark
                ? "0 8px 32px rgba(0,0,0,0.5)"
                : "0 8px 32px rgba(0,0,0,0.12)",
            }}
          >
            {/* 헤더 */}
            <div
              className="flex items-center justify-between"
              style={{
                padding: "12px 16px",
                borderBottom: `1px solid var(--color-border)`,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(0,0,0,0.02)",
              }}
            >
              <div className="flex items-center" style={{ gap: 8 }}>
                <MessageCircle size={18} style={{ color: "var(--color-foreground)" }} />
                <span
                  className="font-bold"
                  style={{
                    fontSize: 15,
                    color: "var(--color-foreground)",
                  }}
                >
                  실시간 전체 채팅
                </span>
              </div>
              <button
                onClick={handleClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: "transparent",
                  color: "var(--color-foreground-muted)",
                  cursor: "pointer",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <ChevronDown size={18} />
              </button>
            </div>

            {/* 메시지 목록 */}
            <ChatMessageList
              messages={messages}
              onLoadMore={handleLoadMore}
              hasMore={nextCursor !== null}
              isLoadingMore={isLoadingMore}
            />

            {/* 에러 메시지 */}
            {sendError && (
              <div style={{
                padding: "6px 16px",
                fontSize: 12,
                color: "var(--color-error)",
                backgroundColor: isDark ? "rgba(255,50,50,0.1)" : "rgba(255,50,50,0.06)",
              }}>
                {sendError}
              </div>
            )}

            {/* 입력 */}
            <ChatInput onSend={handleSend} disabled={isSending} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 토글 버튼 */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpen}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            backgroundColor: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
            boxShadow: isDark
              ? "0 4px 16px rgba(0,0,0,0.4)"
              : "0 4px 16px rgba(0,0,0,0.15)",
            transition: "background-color 0.15s",
          }}
        >
          <MessageCircle size={22} />

          {/* 읽지 않은 메시지 뱃지 */}
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                minWidth: 20,
                height: 20,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                padding: "0 6px",
                backgroundColor: "var(--color-error)",
                color: "#fff",
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </motion.button>
      )}
    </div>
  );
}
