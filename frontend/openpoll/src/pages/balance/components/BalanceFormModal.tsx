import { useState } from "react";
import { X } from "lucide-react";
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
  const [draft, setDraft] = useState<BalanceFormPayload>({
    title: initial?.title ?? "",
    subtitle: initial?.subtitle ?? "",
    description: initial?.description ?? "",
  });

  if (!isOpen) return null;

  const title = draft.title;
  const subtitle = draft.subtitle;
  const description = draft.description;

  const disabled =
    isSubmitting || !title.trim() || !subtitle.trim() || !description.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black opacity-95"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />

      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 to-black shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="text-lg font-bold text-white">
            {mode === "create" ? "밸런스게임 등록" : "밸런스게임 수정"}
          </div>
          <button
            type="button"
            onClick={() => {
              if (!isSubmitting) onClose();
            }}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <div className="text-sm text-gray-300 font-semibold mb-2">제목</div>
            <input
              value={title}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-white placeholder-gray-500"
              placeholder="예) 💼 주 4일제 도입"
            />
          </div>

          <div>
            <div className="text-sm text-gray-300 font-semibold mb-2">
              소제목
            </div>
            <input
              value={subtitle}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, subtitle: e.target.value }))
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-white placeholder-gray-500"
              placeholder="예) 근로시간을 주 32시간으로 단축하는 제도"
            />
          </div>

          <div>
            <div className="text-sm text-gray-300 font-semibold mb-2">
              상세 설명
            </div>
            <textarea
              value={description}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-white placeholder-gray-500 resize-none"
              placeholder="상세 설명을 입력하세요"
              rows={6}
            />
          </div>
        </div>

        <div className="p-5 border-t border-white/10 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              if (!isSubmitting) onClose();
            }}
            className="px-4 py-2 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-colors"
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
            className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {mode === "create" ? "등록" : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
