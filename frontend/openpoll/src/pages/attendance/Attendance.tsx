import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CalendarCheck } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useUser } from "@/contexts/UserContext";
import { useAttendance } from "./hooks";
import { WeeklyStampCard, RewardInfo } from "./components";
import { LoginModal } from "@/components/molecules/loginModal";
import { Toast } from "@/components/molecules/toast/Toast";
import { LoadingSpinner } from "@/components/atoms/loadingSpinner/LoadingSpinner";

export function Attendance() {
  usePageMeta("출석체크", "매일 출석하고 포인트를 받으세요. 7일 연속 출석 시 보너스 포인트!");
  const { isAuthenticated, refreshUser } = useUser();
  const { status, isLoading, isChecking, checkIn } = useAttendance();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  // 출석 완료 후 포인트 팝업 표시
  const [earnedPoints, setEarnedPoints] = useState<number | null>(null);
  const [isStreakBonus, setIsStreakBonus] = useState(false);
  const pointsTimer = useRef<number | null>(null);
  useEffect(() => () => { if (pointsTimer.current) clearTimeout(pointsTimer.current); }, []);

  const handleCheckIn = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    try {
      const result = await checkIn();
      setEarnedPoints(result.pointsEarned);
      setIsStreakBonus(result.isStreakBonus);
      await refreshUser();

      // 3초 후 포인트 팝업 숨기기
      if (pointsTimer.current) clearTimeout(pointsTimer.current);
      pointsTimer.current = window.setTimeout(() => setEarnedPoints(null), 3000);
    } catch {
      setToastMessage("출석 체크에 실패했습니다.");
      setToastType("error");
      setShowToast(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-16 min-h-screen bg-background text-foreground">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
          <CalendarCheck className="w-16 h-16 mx-auto mb-6 text-foreground-subtle" />
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">출석체크</h1>
          <p className="text-foreground-muted mb-8">로그인 후 출석체크를 할 수 있습니다.</p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-8 py-3 bg-primary text-primary-fg rounded-full font-bold hover:opacity-90 transition-colors"
          >
            로그인하기
          </button>
          <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        </div>
      </div>
    );
  }

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <div className="pt-16 min-h-screen bg-background text-foreground pb-24 sm:pb-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* 헤더 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-10"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl mb-4">
              <CalendarCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">출석체크</h1>
            <p className="text-foreground-muted">매일 출석하고 포인트를 받으세요</p>
          </motion.div>

          {/* 오늘 출석 상태 배지 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-6"
          >
            {status?.checkedInToday ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-sm font-semibold text-emerald-400">
                <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                오늘 출석 완료
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-surface-elevated border border-default rounded-full text-sm font-semibold text-foreground-muted">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-foreground-subtle)' }} />
                출석 대기 중
              </span>
            )}
          </motion.div>

          {/* 포인트 획득 팝업 */}
          <AnimatePresence>
            {earnedPoints !== null && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.8 }}
                className="text-center mb-6"
              >
                <div
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-lg ${
                    isStreakBonus
                      ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 text-yellow-300"
                      : "bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 text-emerald-300"
                  }`}
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.3, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    +{earnedPoints}P
                  </motion.span>
                  {isStreakBonus && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-sm text-yellow-400"
                    >
                      7일 보너스 포함!
                    </motion.span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 주간 스탬프 카드 */}
          <div className="mb-6 sm:mb-8">
            <WeeklyStampCard
              streakCycle={status?.streakCycle ?? 0}
              checkedInToday={status?.checkedInToday ?? false}
              onCheckIn={handleCheckIn}
              isChecking={isChecking}
            />
          </div>

          {/* 출석하기 버튼 (미출석 시) */}
          {!status?.checkedInToday && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <button
                onClick={handleCheckIn}
                disabled={isChecking}
                className="px-10 py-4 bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-full font-bold text-lg hover:shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChecking ? "출석 중..." : "출석하기"}
              </button>
            </motion.div>
          )}

          {/* 보상 정보 */}
          <RewardInfo />

          {/* 안내 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-xs text-foreground-subtle mt-8"
          >
            출석은 매일 00:00에 초기화됩니다
          </motion.p>
        </div>
      </div>
    </>
  );
}
