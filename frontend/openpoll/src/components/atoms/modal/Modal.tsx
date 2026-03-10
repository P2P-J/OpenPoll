import { type ReactNode, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

type ModalSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: ModalSize;
  className?: string;
  title?: string;
  showCloseButton?: boolean;
}

const sizeStyles: Record<ModalSize, { width: string; maxWidth: string }> = {
  xs: { width: "280px", maxWidth: "calc(100vw - 32px)" },
  sm: { width: "350px", maxWidth: "calc(100vw - 32px)" },
  md: { width: "420px", maxWidth: "calc(100vw - 32px)" },
  lg: { width: "520px", maxWidth: "calc(100vw - 32px)" },
  xl: { width: "720px", maxWidth: "calc(100vw - 32px)" },
  "2xl": { width: "960px", maxWidth: "calc(100vw - 32px)" },
};

export function Modal({
  isOpen,
  onClose,
  children,
  size = "md",
  className = "",
  title,
  showCloseButton = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [onClose]
  );

  // body 스크롤 차단
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // 초기 포커스 & 복원 — isOpen 전환 시에만 실행
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => {
        const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      });
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // 키보드 핸들러 등록 — handleKeyDown 변경 시에도 리스너 갱신
  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex items-center justify-center px-4"
          style={{ zIndex: 'var(--z-modal-backdrop)' }}
          onClick={onClose}
          role="presentation"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className={`relative rounded-3xl border bg-surface border-default text-foreground shadow-lg overflow-hidden ${className}`}
            style={sizeStyles[size]}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute z-10 w-10 h-10 flex items-center justify-center rounded-full transition-all text-foreground-muted hover:text-foreground hover:bg-secondary"
                style={{ top: 10, right: 10 }}
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="overflow-y-auto" style={{ maxHeight: "90vh" }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
