import { useState, useEffect, useCallback, useRef } from "react";
import { MessageCircle, ChevronDown, GripVertical } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "@/contexts/ThemeContext";
import * as chatApi from "@/api/chat.api";
import type { ChatMessage } from "@/types/api.types";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";

const MAX_W = 560;
const MAX_H = 420;
const MIN_W = 280;
const MIN_H = 220;
const STORAGE_KEY = "openpoll-chat-size";
const OPEN_KEY = "openpoll-chat-open";
const UNREAD_KEY = "openpoll-chat-unread";

function loadSavedOpen(): boolean {
  try {
    const saved = localStorage.getItem(OPEN_KEY);
    if (saved === null) return true; // 최초 방문은 열림
    return saved === "true";
  } catch {
    return true;
  }
}

function saveOpen(open: boolean) {
  try {
    localStorage.setItem(OPEN_KEY, String(open));
  } catch {
    // ignore
  }
}

function loadSavedUnread(): number {
  try {
    const saved = localStorage.getItem(UNREAD_KEY);
    if (!saved) return 0;
    const n = parseInt(saved, 10);
    return isNaN(n) ? 0 : n;
  } catch {
    return 0;
  }
}

function saveUnread(count: number) {
  try {
    localStorage.setItem(UNREAD_KEY, String(count));
  } catch {
    // ignore
  }
}

function getMaxSize() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (vw < 640) {
    return { w: Math.min(MAX_W, vw - 32), h: Math.min(MAX_H, vh * 0.5) };
  }
  if (vw < 1024) {
    return { w: Math.min(MAX_W, vw * 0.5), h: Math.min(MAX_H, vh * 0.45) };
  }
  // 데스크톱 — 큰 모니터도 최대 560x420
  return { w: MAX_W, h: MAX_H };
}

function getDefaultSize() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (vw < 640) {
    return { w: Math.min(360, vw - 32), h: Math.min(340, vh * 0.45) };
  }
  if (vw < 1024) {
    return { w: Math.min(420, vw * 0.45), h: Math.min(380, vh * 0.4) };
  }
  if (vw < 1440) {
    return { w: 480, h: 380 };
  }
  // 1440+ (27인치, 32인치, UHD 등)
  return { w: MAX_W, h: MAX_H };
}

function loadSavedSize(): { w: number; h: number } | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (typeof parsed.w === "number" && typeof parsed.h === "number") {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

function saveSize(size: { w: number; h: number }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(size));
  } catch {
    // ignore
  }
}

function clampSize(size: { w: number; h: number }) {
  const max = getMaxSize();
  return {
    w: Math.max(MIN_W, Math.min(max.w, size.w)),
    h: Math.max(MIN_H, Math.min(max.h, size.h)),
  };
}

export function ChatWidget() {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(loadSavedOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(loadSavedUnread);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const isOpenRef = useRef(isOpen);

  const [size, setSize] = useState(() => {
    const saved = loadSavedSize();
    return saved ? clampSize(saved) : getDefaultSize();
  });

  const isResizingRef = useRef(false);
  const resizeStartRef = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);

  // 화면 리사이즈 시 크기 제한 + 모바일 감지
  useEffect(() => {
    const handleResize = () => {
      setSize((prev) => clampSize(prev));
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const result = await chatApi.getMessages(undefined, 50);
        setMessages(result.messages);
        setNextCursor(result.nextCursor);
      } catch {
        // ignore
      }
    };
    loadInitial();
  }, []);

  useEffect(() => {
    const subscription = chatApi.subscribeToChatStream((newMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
      if (!isOpenRef.current) {
        setUnreadCount((c) => {
          const next = c + 1;
          saveUnread(next);
          return next;
        });
      }
    });
    return () => {
      subscription.close();
    };
  }, []);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setUnreadCount(0);
    saveOpen(true);
    saveUnread(0);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    saveOpen(false);
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const result = await chatApi.getMessages(nextCursor, 30);
      setMessages((prev) => [...result.messages, ...prev]);
      setNextCursor(result.nextCursor);
    } catch {
      // ignore
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, isLoadingMore]);

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

  // 리사이즈: 우상단 코너에서 드래그
  const handleResizeStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isResizingRef.current = true;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      resizeStartRef.current = { x: clientX, y: clientY, w: size.w, h: size.h };

      const handleMove = (ev: MouseEvent | TouchEvent) => {
        if (!isResizingRef.current) return;
        const cx = "touches" in ev ? ev.touches[0].clientX : ev.clientX;
        const cy = "touches" in ev ? ev.touches[0].clientY : ev.clientY;

        // 오른쪽으로 드래그 → 넓어짐, 위로 드래그 → 높아짐
        const dx = cx - resizeStartRef.current.x;
        const dy = resizeStartRef.current.y - cy;

        const newSize = clampSize({
          w: resizeStartRef.current.w + dx,
          h: resizeStartRef.current.h + dy,
        });
        setSize(newSize);
      };

      const handleEnd = () => {
        isResizingRef.current = false;
        // 크기 저장
        setSize((current) => {
          saveSize(current);
          return current;
        });
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
    <div style={{ position: "fixed", bottom: isMobile ? 72 : 16, left: 16, zIndex: 50 }}>
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
            {/* 리사이즈 핸들 (우상단) */}
            <div
              onMouseDown={handleResizeStart}
              onTouchStart={handleResizeStart}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 28,
                height: 28,
                cursor: "ne-resize",
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
                  transform: "rotate(45deg)",
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
                  style={{ fontSize: 14, color: "var(--color-foreground)" }}
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
                  marginRight: 24,
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
