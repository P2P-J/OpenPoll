import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Flame, Clock, CheckCircle, Plus } from "lucide-react";
import { getMe } from "@/api/user.api";
import { getSession } from "@/shared/utils/localAuth";
import { BalanceFormModal } from "@/pages/balance/BalanceFormModal";
import { BalanceCard } from "@/components/balance/BalanceCard";
import { useBalanceList } from "@/hooks/useBalanceList";
import type { BalanceListItem } from "@/types/balance.types";

const adminEmails = new Set<string>(["oct95@naver.com", "admin@test.com"]);
const adminNicknames = new Set<string>(["로운"].map((x) => x.toLowerCase()));
const adminUserIds = new Set<string>(["62968fae-154c-4d4f-91f4-abf4b67fd7c0"]);

type JwtPayload = {
  userId?: string;
  sub?: string;
  email?: string;
  nickname?: string;
  user?: { id?: string; email?: string; nickname?: string };
  data?: { userId?: string; email?: string; nickname?: string };
};

type SessionLike = {
  user?: {
    id?: string;
    userId?: string;
    email?: string;
    nickname?: string;
  };
  profile?: {
    id?: string;
    email?: string;
    nickname?: string;
  };
  userId?: string;
  id?: string;
  email?: string;
  nickname?: string;
  userEmail?: string;
  userNickname?: string;
};

type Identity = {
  userId?: string;
  email?: string;
  nickname?: string;
};

type MeLike = {
  id?: string;
  email?: string;
  nickname?: string;
};

function decodeJwtPayload(token?: string | null): JwtPayload | null {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function pickIdentityFromAnywhere(): Identity {
  const s = getSession() as SessionLike | null;

  const sessionUserId = s?.user?.id || s?.userId || s?.id || s?.user?.userId || s?.profile?.id;
  const sessionEmail = s?.user?.email || s?.email || s?.userEmail || s?.profile?.email;
  const sessionNickname = s?.user?.nickname || s?.nickname || s?.userNickname || s?.profile?.nickname;

  if (sessionUserId || sessionEmail || sessionNickname) {
    return { userId: sessionUserId, email: sessionEmail, nickname: sessionNickname };
  }

  const token = localStorage.getItem("accessToken");
  const payload = decodeJwtPayload(token);

  const jwtUserId = payload?.userId || payload?.sub || payload?.user?.id || payload?.data?.userId;
  const jwtEmail = payload?.email || payload?.user?.email || payload?.data?.email;
  const jwtNickname = payload?.nickname || payload?.user?.nickname || payload?.data?.nickname;

  return { userId: jwtUserId, email: jwtEmail, nickname: jwtNickname };
}

function isAdminByIdentity(input: Identity): boolean {
  const uid = (input.userId ?? "").trim();
  const e = (input.email ?? "").toLowerCase().trim();
  const n = (input.nickname ?? "").toLowerCase().trim();

  if (uid && adminUserIds.has(uid)) return true;
  if (e && adminEmails.has(e)) return true;
  if (n && adminNicknames.has(n)) return true;

  return false;
}

export function BalanceList() {
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
  } = useBalanceList(isLoggedIn);

  const filters = [
    { key: "hot" as const, label: "HOT", icon: Flame },
    { key: "recent" as const, label: "최신", icon: Clock },
    { key: "completed" as const, label: "참여완료", icon: CheckCircle },
  ];

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const fallback = pickIdentityFromAnywhere();
        if (!mounted) return;

        setIsAdmin(isAdminByIdentity(fallback));

        if (isLoggedIn) {
          try {
            const me = (await getMe()) as MeLike;
            if (!mounted) return;

            const merged: Identity = {
              userId: me?.id ?? fallback.userId,
              email: me?.email ?? fallback.email,
              nickname: me?.nickname ?? fallback.nickname,
            };

            setIsAdmin(isAdminByIdentity(merged));
          } catch {
            // noop
          }
        }
      } catch {
        // noop
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isLoggedIn]);

  return (
    <div className="pt-16 min-h-screen bg-black text-white">
      <BalanceFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        initial={initialForModal}
        isSubmitting={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">밸런스 게임</h1>
          <p className="text-gray-400 text-base sm:text-lg lg:text-xl">정치 이슈에 대한 당신의 생각을 투표로 표현하세요</p>

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

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex justify-center space-x-2 sm:space-x-3 mb-8 sm:mb-12">
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

        {isLoading && <div className="text-center text-gray-400 py-16">불러오는 중...</div>}
        {!isLoading && errorMessage && <div className="text-center text-gray-400 py-16">{errorMessage}</div>}

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
              {filteredIssues.map((issue: BalanceListItem, index: number) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  style={{ minHeight: "280px" }}
                >
                  <BalanceCard
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

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-12 pt-3 text-center text-gray-500 text-sm">
          <p>💡 카드에 마우스를 올리면 투표 결과를 미리 볼 수 있어요</p>
        </motion.div>
      </div>
    </div>
  );
}