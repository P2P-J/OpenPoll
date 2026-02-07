import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";

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

type MeLike = {
  email?: string;
};

export function BalanceList() {
  usePageMeta("밸런스 게임", "정치 이슈에 대한 찬반 투표로 당신의 생각을 표현하세요.");
  const hasToken = !!localStorage.getItem("accessToken");
  const isLoggedIn = !!getSession() || hasToken;
  const [isAdmin, setIsAdmin] = useState(false);

  const {
    filter,
    setFilter,
    isLoading,
    errorMessage,
    filteredIssues,
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
    <div className="pt-16 min-h-screen bg-black text-white">
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

        <BalanceFilter filter={filter} onFilterChange={setFilter} />

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl sm:rounded-3xl border-2 border-white/10 bg-gradient-to-br from-gray-900 to-black p-6 sm:p-8 animate-pulse"
                style={{ minHeight: "280px" }}
              >
                <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-6 bg-white/10 rounded-lg w-3/4" />
                    <div className="h-4 bg-white/5 rounded-lg w-1/2" />
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="h-4 bg-white/5 rounded w-full" />
                  <div className="h-4 bg-white/5 rounded w-5/6" />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="h-8 bg-white/10 rounded-lg w-24" />
                  <div className="h-4 bg-white/10 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!isLoading && errorMessage && (
          <div className="text-center text-gray-400 py-16">{errorMessage}</div>
        )}

        {!isLoading &&
          !errorMessage &&
          (filteredIssues.length === 0 ? (
            <div className="text-center text-gray-400 py-16">
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 pt-3 text-center text-gray-500 text-sm"
        >
          <p>카드에 마우스를 올리면 투표 결과를 미리 볼 수 있어요</p>
        </motion.div>
      </div>
    </div>
  );
}
