function IssueFormModal({
  isOpen,
  mode,
  initial,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  mode: "create" | "edit";
  initial?: { title: string; subtitle: string; description: string };
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: { title: string; subtitle: string; description: string }) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  useEffect(() => {
    if (!isOpen) return;
    setTitle(initial?.title ?? "");
    setSubtitle(initial?.subtitle ?? "");
    setDescription(initial?.description ?? "");
  }, [isOpen, initial]);

  if (!isOpen) return null;

  // ✅ 제목 형식 검사: "이모지 + 공백 + 내용"
  const titleTrimmed = title.trim();
  const isEmojiTitle = (() => {
    if (!titleTrimmed) return false;
    const parts = titleTrimmed.split(/\s+/);
    if (parts.length < 2) return false;

    const emojiToken = parts[0] ?? "";
    const rest = titleTrimmed.slice(emojiToken.length).trim(); // 공백 이후 내용

    // 이모지 판별 (현대 브라우저 지원)
    // - Extended_Pictographic 포함 여부로 1차 판별
    const emojiRegex = /\p{Extended_Pictographic}/u;
    if (!emojiRegex.test(emojiToken)) return false;

    // 내용은 최소 1글자
    return rest.length > 0;
  })();

  const disabled =
    isSubmitting ||
    !isEmojiTitle ||
    !subtitle.trim() ||
    !description.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* ✅ 뒤 비침 제거: 오버레이 더 진하게 */}
      <div
        className="absolute inset-0 bg-black"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />

      {/* ✅ 모달 배경도 완전 불투명 */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-gray-950 shadow-xl">
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

            {/* ✅ 규칙 안내 문구 */}
            <div className="text-xs text-gray-500 mb-2">
              형식: <span className="text-gray-300">이모지 + 공백 1칸 + 제목</span>{" "}
              (예: <span className="text-gray-300">🔥 주 4일제 도입</span>)
            </div>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-white placeholder-gray-500"
              placeholder="예) 🔥 주 4일제 도입"
            />

            {/* ✅ 형식이 틀렸을 때만 보이는 경고 (UI 크게 안 건드리고 텍스트만 추가) */}
            {!isEmojiTitle && titleTrimmed.length > 0 && (
              <div className="mt-2 text-xs text-red-400">
                제목은 “이모지 + 공백 1칸 + 내용” 형식으로 작성해줘.
              </div>
            )}
          </div>

          <div>
            <div className="text-sm text-gray-300 font-semibold mb-2">
              소제목(리스트용)
            </div>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-white placeholder-gray-500"
              placeholder="예) 근로시간을 주 32시간으로 단축하는 제도"
            />
          </div>

          <div>
            <div className="text-sm text-gray-300 font-semibold mb-2">상세 설명</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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