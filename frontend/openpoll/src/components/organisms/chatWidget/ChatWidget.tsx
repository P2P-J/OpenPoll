import { useState, useEffect, useCallback, useRef } from "react";
import { MessageCircle, ChevronDown, GripVertical } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "@/contexts/ThemeContext";
import * as chatApi from "@/api/chat.api";
import type { ChatMessage } from "@/types/api.types";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";

// 최대/최소 크기
const MAX_W = 560;
const MAX_H = 420;
const MIN_W = 280;
const MIN_H = 260;

function getResponsiveSize() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // 모바일 (<640): 화면 거의 꽉 채움
  if (vw < 640) {
    return {
      w: Math.min(MAX_W, vw - 32),
      h: Math.min(MAX_H, vh * 0.5),
    };
  }
  // 태블릿 (640~1024): 중간 크기
  if (vw < 1024) {
    return {
      w: Math.min(MAX_W, vw * 0.55),
      h: Math.min(MAX_H, vh * 0.45),
    };
  }
  // 데스크톱: 최대
  return { w: MAX_W, h: MAX_H };
}

export function ChatWidget() {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(true); // 처음에 열린 상태
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const isOpenRef = useRef(isOpen);

  // 반응형 기본 크기
  const [size, setSize] = useState(getResponsiveSize);

  // 리사이즈 상태
  const isResizingRef = useRef(false);
  const resizeStartRef = useRef({ x: 0, y: 0, w: 0, h: 0 });

  // 화면 리사이즈 시 최대 크기 재계산
  useEffect(() => {
    const handleResize = () => {
      setSize((prev) => {
        const resp = getResponsiveSize();
        return {
          w: Math.min(prev.w, resp.w),
          h: Math.min(prev.h, resp.h),
        };
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // isOpenRef 동기화
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
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
      if (!isOpenRef.current) {
        setUnreadCount((c) => c + 1);
      }
    });
    return () => {
      subscription.close();
    };
  }, []);

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
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "전송에 실패했습니다";
      setSendError(msg);
      setTimeout(() => setSendError(null), 3000);
    } finally {
      setIsSending(false);
    }
  }, []);

  // 리사이즈 드래그 핸들러 (좌상단 코너에서 드래그)
  const handleResizeStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isResizingRef.current = true;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      resizeStartRef.current = {
        x: clientX,
        y: clientY,
        w: size.w,
        h: size.h,
      };

      const handleMove = (ev: MouseEvent | TouchEvent) => {
        if (!isResizingRef.current) return;
        const cx = "touches" in ev ? ev.touches[0].clientX : ev.clientX;
        const cy = "touches" in ev ? ev.touches[0].clientY : ev.clientY;

        const dx = resizeStartRef.current.x - cx; // 왼쪽으로 갈수록 커짐
        const dy = resizeStartRef.current.y - cy; // 위로 갈수록 커짐

        const resp = getResponsiveSize();
        const newW = Math.max(MIN_W, Math.min(resp.w, resizeStartRef.current.w + dx));
        const newH = Math.max(MIN_H, Math.min(resp.h, resizeStartRef.current.h + dy));

        setSize({ w: newW, h: newH });
      };

      const handleEnd = () => {
        isResizingRef.current = false;
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleEnd);
        document.removeEventListener("touchmove", handleMove);
        document.removeEventListener("touchend", handleEnd);
      };

      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleMove, { passive: false });
      document.addEventListener("touchend", handleEnd);
    },
    [size],
  );

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
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
              width: size.w,
              height: size.h,
              borderRadius: 16,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              marginBottom: 12,
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              boxShadow: isDark
                ? "0 8px 32px rgba(0,0,0,0.5)"
                : "0 8px 32px rgba(0,0,0,0.12)",
              position: "relative",
            }}
          >
            {/* 리사이즈 핸들 (좌상단) */}
            <div
              onMouseDown={handleResizeStart}
              onTouchStart={handleResizeStart}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 24,
                height: 24,
                cursor: "nw-resize",
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.3,
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.7";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0.3";
              }}
            >
              <GripVertical
                size={12}
                style={{
                  color: "var(--color-foreground-muted)",
                  transform: "rotate(-45deg)",
                }}
              />
            </div>

            {/* 헤더 */}
            <div
              className="flex items-center justify-between"
              style={{
                padding: "10px 16px",
                borderBottom: "1px solid var(--color-border)",
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(0,0,0,0.02)",
                flexShrink: 0,
              }}
            >
              <div className="flex items-center" style={{ gap: 8 }}>
                <MessageCircle
                  size={18}
                  style={{ color: "var(--color-foreground)" }}
                />
                <span
                  className="font-bold"
                  style={{
                    fontSize: 14,
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
              <div
                style={{
                  padding: "6px 16px",
                  fontSize: 12,
                  color: "var(--color-error)",
                  backgroundColor: isDark
                    ? "rgba(255,50,50,0.1)"
                    : "rgba(255,50,50,0.06)",
                  flexShrink: 0,
                }}
              >
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
