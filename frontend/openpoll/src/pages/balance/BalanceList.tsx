import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useTheme } from "@/contexts/ThemeContext";
import { STORAGE_KEYS } from "@/shared/constants";

import { getMe } from "@/api/user.api";
import { getSession } from "@/shared/utils/localAuth";
import { ADMIN_EMAILS } from "@/shared/utils/balanceHelpers";
import { useBalanceList } from "./hooks/useBalanceList";
import {
  BalanceFormModal,
  BalanceFilter,
  BalanceGameCard,
} from "./components";
import type { BalanceListItem } from "@/types/balance.types";
import { AdBanner } from "@/components/atoms/adBanner/AdBanner";

type MeLike = {
  email?: string;
};

export function BalanceList() {
  usePageMeta("정치 밸런스 게임 - 이슈 투표", "정치 이슈에 대한 찬반 투표로 당신의 생각을 표현하세요. 다른 사람들의 의견도 확인해보세요.");
  const hasToken = !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const isLoggedIn = !!getSession() || hasToken;
  const [isAdmin, setIsAdmin] = useState(false);
  const { isDark } = useTheme();

  const {
    filter,
    setFilter,
    isLoading,
    errorMessage,
    filteredIssues,
    hotRankMap,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    isSubmitting,
    openCreate,
    openEdit,
    handleDelete,
    handleSubmit,
    initialForModal,
    hideAdminActions,
    editingId,
  } = useBalanceList(isLoggedIn);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!isLoggedIn) {
        if (mounted) setIsAdmin(false);
        return;
      }

      try {
        const me = (await getMe()) as MeLike;
        if (!mounted) return;

        const email = (me?.email ?? "").toLowerCase().trim();
        setIsAdmin(!!email && ADMIN_EMAILS.has(email));
      } catch {
        if (!mounted) return;
        setIsAdmin(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isLoggedIn]);

  return (
    <div className={`pt-16 min-h-screen bg-background text-foreground`}>
      <BalanceFormModal
        key={`${modalMode}-${editingId ?? "new"}-${isModalOpen ? "open" : "close"}`}
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
          <p className={`text-base sm:text-lg lg:text-xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            정치 이슈에 대한 당신의 생각을 투표로 표현하세요
          </p>
          <div className={`mt-5 max-w-3xl mx-auto text-sm sm:text-base leading-relaxed text-left ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>
              밸런스 게임은 찬반으로 나뉘는 정치·사회 이슈에 대해 가볍게 자신의 의견을 표현하는 참여형 투표입니다. 매일 새로운 주제가 올라오며, 선택 후에는 다양한 관점의 토론 댓글을 통해 서로 다른 생각을 접하고 자신의 입장을 정리해 볼 수 있습니다.
            </p>
            <p className="mt-3">
              OpenPoll은 표본 추출 기반의 공식 여론조사가 아니라, 참여자들의 의견을 투명하게 집계하는 열린 플랫폼입니다. 어떤 정당이나 특정 입장도 지지하지 않으며, 결과는 참고 자료로만 활용해 주세요.
            </p>
          </div>

          {isAdmin && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={openCreate}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-semibold text-sm sm:text-base transition-all ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>밸런스게임 등록</span>
              </button>
            </div>
          )}
        </motion.div>

        <BalanceFilter filter={filter} onFilterChange={setFilter} />

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-2xl sm:rounded-3xl border-2 p-6 sm:p-8 animate-pulse ${isDark ? 'border-white/10 bg-gradient-to-br from-gray-900 to-black' : 'border-black/10 bg-gradient-to-br from-gray-100 to-white'}`}
                style={{ minHeight: "280px" }}
              >
                <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
                  <div className={`w-12 h-12 rounded-lg ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                  <div className="flex-1 space-y-2">
                    <div className={`h-6 rounded-lg w-3/4 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                    <div className={`h-4 rounded-lg w-1/2 ${isDark ? 'bg-white/5' : 'bg-black/5'}`} />
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  <div className={`h-4 rounded w-full ${isDark ? 'bg-white/5' : 'bg-black/5'}`} />
                  <div className={`h-4 rounded w-5/6 ${isDark ? 'bg-white/5' : 'bg-black/5'}`} />
                </div>
                <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                  <div className={`h-8 rounded-lg w-24 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                  <div className={`h-4 rounded w-16 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                </div>
              </div>
            ))}
          </div>
        )}
        {!isLoading && errorMessage && (
          <div className={`text-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{errorMessage}</div>
        )}

        {!isLoading &&
          !errorMessage &&
          (filteredIssues.length === 0 ? (
            <div className={`text-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {filter === "completed"
                ? isLoggedIn
                  ? "아직 참여한 이슈가 없어요."
                  : "로그인 후 참여완료를 확인할 수 있어요."
                : "표시할 이슈가 없어요."}
            </div>
          ) : (
            <section aria-label="밸런스 게임 목록" className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {filteredIssues.map((issue: BalanceListItem, index: number) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  style={{ minHeight: "280px" }}
                >
                  <BalanceGameCard
                    issue={issue}
                    hotRank={hotRankMap[issue.id] ?? null}
                    isLoggedIn={isLoggedIn}
                    isAdmin={isAdmin}
                    hideAdminActions={hideAdminActions}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </section>
          ))}

        <AdBanner className="mt-8" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className={`mt-12 pt-3 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
        >
          <p>카드에 마우스를 올리면 투표 결과를 미리 볼 수 있어요</p>
        </motion.div>
      </div>
    </div>
  );
}
