import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import {
  Flame,
  Clock,
  CheckCircle,
  Users,
  ArrowRight,
  X,
  Pencil,
  Plus,
} from "lucide-react";

import { issueApi, userApi, getErrorMessage } from "@/api";
import { getSession } from "@/shared/utils/localAuth";
import type { IssueListItem } from "@/types/balance.types";

const adminEmailList = [
  "oct95@naver.com",
  "admin@test.com",
] as const;


const adminEmails = new Set<string>(
  adminEmailList.map((email) => email.trim().toLowerCase())
);

function isAdminEmail(email?: string | null): boolean {
  return adminEmails.has((email ?? "").trim().toLowerCase());
}

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
  onSubmit: (payload: {
    title: string;
    subtitle: string;
    description: string;
  }) => void;
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
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-white placeholder-gray-500"
              placeholder="예) 💼 주 4일제 도입"
            />
            <div className="mt-2 text-xs text-gray-500">
              제목은{" "}
              <span className="text-gray-300 font-semibold">
                이모지 + 공백 1칸 + 내용
              </span>{" "}
              형식으로 작성해주세요.
            </div>
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
            <div className="text-sm text-gray-300 font-semibold mb-2">
              상세 설명
            </div>
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

function IssueCard({
  issue,
  isLoggedIn,
  isAdmin,
  hideAdminActions,
  onEdit,
  onDelete,
}: {
  issue: IssueListItem;
  isLoggedIn: boolean;
  isAdmin: boolean;
  hideAdminActions: boolean;
  onEdit: (issue: IssueListItem) => void;
  onDelete: (issue: IssueListItem) => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFlipAnimating, setIsFlipAnimating] = useState(false);
  const flipTimerRef = useRef<number | null>(null);

  const participantsSafe = (issue.participants ?? issue.totalVotes ?? 0) as number;

  const agreePercentSafe =
    participantsSafe <= 0 ? 0 : Number(issue.agreePercent ?? 0);
  const disagreePercentSafe =
    participantsSafe <= 0 ? 0 : Math.max(0, 100 - agreePercentSafe);

  const isHotIssue = participantsSafe >= 3000;
  const showCompleted =
    isLoggedIn && ((issue as any).voted || issue.myVote !== null);

  const agreeCountSafe =
    participantsSafe <= 0
      ? 0
      : Math.round((agreePercentSafe / 100) * participantsSafe);
  const disagreeCountSafe =
    participantsSafe <= 0 ? 0 : participantsSafe - agreeCountSafe;

  const startFlip = (next: boolean) => {
    if (flipTimerRef.current) window.clearTimeout(flipTimerRef.current);

    setIsFlipAnimating(true);
    setIsFlipped(next);

    flipTimerRef.current = window.setTimeout(() => {
      setIsFlipAnimating(false);
      flipTimerRef.current = null;
    }, 650);
  };

  useEffect(() => {
    return () => {
      if (flipTimerRef.current) window.clearTimeout(flipTimerRef.current);
    };
  }, []);


  const showAdminActions = isAdmin && !hideAdminActions && !isFlipAnimating;

  const isBackFace = isFlipped && !isFlipAnimating;

  const adminBtnClass = isBackFace
    ? "w-9 h-9 bg-transparent border-0 rounded-none shadow-none hover:bg-transparent transition-all flex items-center justify-center"
    : "w-9 h-9 rounded-full bg-black/80 border border-white/25 hover:border-white/50 hover:bg-black transition-all flex items-center justify-center";

  const adminIconClass = isBackFace ? "text-black" : "text-white";

  return (
    <div
      className="relative group h-full"
      onMouseEnter={() => startFlip(true)}
      onMouseLeave={() => startFlip(false)}
      style={{ isolation: "isolate" }}
    >
      {showAdminActions && (
        <div
          className="pointer-events-auto flex gap-0.5"
          style={{
            position: "absolute",
            top: 4,
            right: 6,
            zIndex: 99999,
            isolation: "isolate",
            pointerEvents: "auto",
          }}
        >
          <button
            type="button"
            title="수정"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(issue);
            }}
            className={adminBtnClass}
            style={{
              transform: "translateX(8px)", 
            }}
          >
            <Pencil className={`w-4 h-4 ${adminIconClass}`} />
          </button>

          <button
            type="button"
            title="삭제"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(issue);
            }}
            className={adminBtnClass}
          >
            <X className={`w-5 h-5 ${adminIconClass}`} />
          </button>
        </div>
      )}

      <Link to={`/balance/${issue.id}`} className="block h-full">
        <div
          className="relative h-full preserve-3d"
          style={{ perspective: "1000px" }}
        >
          <motion.div
            className="relative w-full h-full"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/10 group-hover:border-white/30 transition-all shadow-lg"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="relative p-6 sm:p-8 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                    <span className="text-4xl sm:text-5xl">{issue.emoji}</span>
                    <div className="flex-1">
                      <h3 className="text-xl sm:text-2xl font-bold mb-1 group-hover:text-gray-300 transition-colors">
                        {issue.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-2 flex flex-col items-end space-y-2">
                    {isHotIssue && (
                      <div
                        className="flex items-center space-x-1 px-3 py-1.5 text-white rounded-full text-xs font-bold animate-pulse border border-white/25 shadow-[0_10px_22px_rgba(239,68,68,0.45)]"
                        style={{ backgroundColor: "#ef4444" }}
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>핫이슈!</span>
                      </div>
                    )}

                    {showCompleted && (
                      <div className="flex items-center space-x-1 px-3 py-1.5 bg-white/10 border border-white/20 text-white rounded-full text-xs font-bold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>완료</span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-gray-400 text-sm sm:text-base mb-6 leading-relaxed flex-1">
                  {issue.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">참여 인원</span>
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-white" />
                      <span className="font-bold text-2xl sm:text-3xl text-white">
                        {participantsSafe.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-400 font-semibold">
                        명
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-white font-bold text-sm group-hover:translate-x-1 transition-transform">
                    <span>투표하기</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>


            <div
              className="absolute inset-0 bg-white rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-black shadow-lg"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="relative p-6 sm:p-8 h-full flex flex-col">
                <div className="flex items-center space-x-3 sm:space-x-4 mb-6">
                  <span className="text-4xl sm:text-5xl">{issue.emoji}</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-black">
                    {issue.title}
                  </h3>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-black rounded-full" />
                        <span className="text-sm font-semibold text-black">
                          찬성
                        </span>
                        <span className="text-2xl font-bold text-black">
                          {agreePercentSafe}%
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-600">
                          {disagreePercentSafe}%
                        </span>
                        <span className="text-sm font-semibold text-gray-600">
                          반대
                        </span>
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      </div>
                    </div>

                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                      <div
                        className="absolute left-0 top-0 h-full bg-black rounded-full transition-all duration-500"
                        style={{ width: `${agreePercentSafe}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-black/5 rounded-xl">
                      <div className="text-xs text-gray-600 font-semibold mb-1">
                        찬성
                      </div>
                      <div className="text-lg font-bold text-black">
                        {agreeCountSafe.toLocaleString()}명
                      </div>
                    </div>

                    <div className="text-center p-3 bg-black/5 rounded-xl">
                      <div className="text-xs text-gray-600 font-semibold mb-1">
                        반대
                      </div>
                      <div className="text-lg font-bold text-gray-600">
                        {disagreeCountSafe.toLocaleString()}명
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-300 mt-4">
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">
                    마우스를 떼면 다시 뒤집혀요
                  </div>
                  <div className="flex items-center space-x-2 text-black font-bold text-sm">
                    <span>클릭해서 투표</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Link>
    </div>
  );
}

export function IssueList() {
  const location = useLocation();

  const [filter, setFilter] = useState<"hot" | "recent" | "completed">("hot");
  const [issues, setIssues] = useState<IssueListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasToken = !!localStorage.getItem("accessToken");
  const isLoggedIn = !!getSession() || hasToken;

  const [isAdmin, setIsAdmin] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<IssueListItem | null>(null);
  const [editingDetailDescription, setEditingDetailDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filters = [
    { key: "hot" as const, label: "HOT", icon: Flame },
    { key: "recent" as const, label: "최신", icon: Clock },
    { key: "completed" as const, label: "참여완료", icon: CheckCircle },
  ];

  const refresh = async () => {
    const data = await issueApi.getIssueList();
    setIssues(data);
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (!isLoggedIn) {
          if (mounted) setIsAdmin(false);
          return;
        }

        const me = await userApi.getMe();
        if (!mounted) return;
        setIsAdmin(isAdminEmail(me?.email));
      } catch (e) {
        if (!mounted) return;
        setIsAdmin(false);
        console.warn("[users/me] failed:", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const data = await issueApi.getIssueList();
        if (!mounted) return;
        setIssues(data);
      } catch (e) {
        if (!mounted) return;
        setErrorMessage(getErrorMessage(e));
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [location.key]);

  const filteredIssues = useMemo(() => {
    if (filter === "completed") {
      if (!isLoggedIn) return [];
      return issues.filter((x) => x.myVote !== null);
    }

    if (filter === "recent") {
      return [...issues].sort((a, b) => {
        const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bt - at;
      });
    }

    return [...issues].sort((a, b) => {
      const ap = a.participants ?? a.totalVotes ?? 0;
      const bp = b.participants ?? b.totalVotes ?? 0;
      return bp - ap;
    });
  }, [issues, filter, isLoggedIn]);

  const openCreate = () => {
    setErrorMessage(null);
    setModalMode("create");
    setEditing(null);
    setEditingDetailDescription("");
    setIsModalOpen(true);
  };

  const openEdit = async (issue: IssueListItem) => {
    try {
      setErrorMessage(null);
      setModalMode("edit");

      const detail = await issueApi.getIssueDetail(issue.id);

      setEditing(issue);
      setEditingDetailDescription(detail.description ?? "");
      setIsModalOpen(true);
    } catch (e) {
      setErrorMessage(getErrorMessage(e));
    }
  };

  const handleDelete = async (issue: IssueListItem) => {
    const ok = window.confirm(`"${issue.title}" 이슈를 삭제할까요?`);
    if (!ok) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await issueApi.deleteIssue(issue.id);
      await refresh();
    } catch (e) {
      setErrorMessage(getErrorMessage(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (payload: {
    title: string;
    subtitle: string;
    description: string;
  }) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      if (modalMode === "create") {
        await issueApi.createIssue(payload);
      } else {
        if (!editing) throw new Error("수정 대상을 찾을 수 없습니다.");
        await issueApi.updateIssue(editing.id, payload);
      }

      setIsModalOpen(false);
      setEditing(null);
      setEditingDetailDescription("");
      await refresh();
    } catch (e) {
      setErrorMessage(getErrorMessage(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  const initialForModal:
    | { title: string; subtitle: string; description: string }
    | undefined =
    modalMode === "create"
      ? undefined
      : editing
      ? {
          title: String(editing.title ?? ""),
          subtitle: String(editing.description ?? ""),
          description: String(editingDetailDescription ?? ""),
        }
      : undefined;

  const hideAdminActions = isModalOpen;

  return (
    <div className="pt-16 min-h-screen bg-black text-white">
      <IssueFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        initial={initialForModal}
        isSubmitting={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
            밸런스 게임
          </h1>
          <p className="text-gray-400 text-base sm:text-lg lg:text-xl">
            정치 이슈에 대한 당신의 생각을 투표로 표현하세요
          </p>

          {isAdmin && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={openCreate}
                className="flex items-center space-x-2 px-6 py-3 rounded-full font-semibold text-sm sm:text-base transition-all bg-white text-black hover:bg-gray-200"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>밸런스게임 등록</span>
              </button>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center space-x-2 sm:space-x-3 mb-8 sm:mb-12"
        >
          {filters.map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`flex items-center space-x-1.5 sm:space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all ${
                filter === item.key
                  ? "bg-white text-black"
                  : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
              }`}
            >
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </motion.div>

        {isLoading && (
          <div className="text-center text-gray-400 py-16">불러오는 중...</div>
        )}

        {!isLoading && errorMessage && (
          <div className="text-center text-gray-400 py-16">{errorMessage}</div>
        )}

        {!isLoading && !errorMessage &&
          (filteredIssues.length === 0 ? (
            <div className="text-center text-gray-400 py-16">
              {filter === "completed"
                ? isLoggedIn
                  ? "아직 참여한 이슈가 없어요."
                  : "로그인 후 참여완료를 확인할 수 있어요."
                : "표시할 이슈가 없어요."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {filteredIssues.map((issue, index) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  style={{ minHeight: "280px" }}
                >
                  <IssueCard
                    issue={issue}
                    isLoggedIn={isLoggedIn}
                    isAdmin={isAdmin}
                    hideAdminActions={hideAdminActions}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </div>
          ))}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 pt-3 text-center text-gray-500 text-sm"
        >
          <p>💡 카드에 마우스를 올리면 투표 결과를 미리 볼 수 있어요</p>
        </motion.div>
      </div>
    </div>
  );
}