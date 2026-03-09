import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import type { BalanceFormPayload } from "@/types/balance.types";

interface BalanceFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initial?: BalanceFormPayload;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: BalanceFormPayload) => void;
}

export function BalanceFormModal({
  isOpen,
  mode,
  initial,
  isSubmitting,
  onClose,
  onSubmit,
}: BalanceFormModalProps) {
  const { isDark } = useTheme();
  const [draft, setDraft] = useState<BalanceFormPayload>({
    title: initial?.title ?? "",
    subtitle: initial?.subtitle ?? "",
    description: initial?.description ?? "",
  });

  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    },
    [isSubmitting, onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, handleEsc]);

  if (!isOpen) return null;

  const title = draft.title;
  const subtitle = draft.subtitle;
  const description = draft.description;

  const disabled =
    isSubmitting || !title.trim() || !subtitle.trim() || !description.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "create" ? "밸런스게임 등록" : "밸런스게임 수정"}
    >
      <div
        className="absolute inset-0 bg-black/50"
        style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", overscrollBehavior: "contain" }}
        aria-hidden="true"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />

      <div className={`relative w-full max-w-2xl rounded-2xl border shadow-xl ${isDark ? 'border-white/10 bg-gradient-to-br from-gray-900 to-black' : 'border-black/10 bg-white'}`}>
        <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
          <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>
            {mode === "create" ? "밸런스게임 등록" : "밸런스게임 수정"}
          </div>
          <button
            type="button"
            aria-label="닫기"
            onClick={() => {
              if (!isSubmitting) onClose();
            }}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
          >
            <X className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label htmlFor="balance-title" className={`text-sm font-semibold mb-2 block ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>제목</label>
            <input
              id="balance-title"
              value={title}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, title: e.target.value }))
              }
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none placeholder-gray-500 ${isDark ? 'bg-white/5 border-white/10 focus:border-white/30 text-white' : 'bg-black/5 border-black/10 focus:border-black/30 text-black'}`}
              placeholder="예) 💼 주 4일제 도입"
            />
          </div>

          <div>
            <label htmlFor="balance-subtitle" className={`text-sm font-semibold mb-2 block ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              소제목
            </label>
            <input
              id="balance-subtitle"
              value={subtitle}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, subtitle: e.target.value }))
              }
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none placeholder-gray-500 ${isDark ? 'bg-white/5 border-white/10 focus:border-white/30 text-white' : 'bg-black/5 border-black/10 focus:border-black/30 text-black'}`}
              placeholder="예) 근로시간을 주 32시간으로 단축하는 제도"
            />
          </div>

          <div>
            <label htmlFor="balance-description" className={`text-sm font-semibold mb-2 block ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              상세 설명
            </label>
            <textarea
              id="balance-description"
              value={description}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, description: e.target.value }))
              }
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none placeholder-gray-500 resize-none ${isDark ? 'bg-white/5 border-white/10 focus:border-white/30 text-white' : 'bg-black/5 border-black/10 focus:border-black/30 text-black'}`}
              placeholder="상세 설명을 입력하세요"
              rows={6}
            />
          </div>
        </div>

        <div className={`p-5 border-t flex justify-end gap-2 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
          <button
            type="button"
            onClick={() => {
              if (!isSubmitting) onClose();
            }}
            className={`px-4 py-2 rounded-lg border transition-colors ${isDark ? 'border-white/10 text-gray-300 hover:text-white hover:border-white/20' : 'border-black/10 text-gray-600 hover:text-black hover:border-black/20'}`}
          >
            취소
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              onSubmit({
                title: title.trim(),
                subtitle: subtitle.trim(),
                description: description.trim(),
              })
            }
            className={`px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
          >
            {mode === "create" ? "등록" : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
