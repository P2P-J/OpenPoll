import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import { CalendarCheck, Check, X as XIcon, Sparkles } from "lucide-react";
import { attendanceApi } from "@/api";
import type {
  AttendanceStatus,
  CheckAttendanceResult,
} from "@/api/attendance.api";
import { useUser } from "@/contexts/UserContext";
import { Modal } from "@/components/atoms/modal/Modal";
import { SectionHeader } from "@/components/atoms/sectionHeader/SectionHeader";
import { StatsRow } from "@/components/atoms/statsRow/StatsRow";
import { Divider } from "@/components/atoms/divider/Divider";
import { Button } from "@/components/atoms/button/Button";
import { Badge } from "@/components/atoms/badge/Badge";

const COLORS = {
  emerald500: "#10b981",
  emerald400: "#34d399",
  emeraldBg: "rgba(16, 185, 129, 0.08)",
  emeraldBorder: "rgba(16, 185, 129, 0.3)",
  emeraldText: "rgb(52, 211, 153)",
  red500: "#ef4444",
  redBg: "rgba(239, 68, 68, 0.05)",
  redText: "#f87171",
  violet500: "#8b5cf6",
  violet400: "#a78bfa",
  blue400: "#60a5fa",
  yellow500: "#eab308",
};

const DAY_HEADERS = ["일", "월", "화", "수", "목", "금", "토"];

interface CalendarCell {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

function buildCalendar(): CalendarCell[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDate = now.getDate();

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevLastDay = new Date(year, month, 0).getDate();

  const cells: CalendarCell[] = [];

  for (let i = firstDow - 1; i >= 0; i--) {
    cells.push({ day: prevLastDay - i, isCurrentMonth: false, isToday: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrentMonth: true, isToday: d === todayDate });
  }

  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay++, isCurrentMonth: false, isToday: false });
  }

  return cells;
}

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AttendanceModal({ isOpen, onClose }: AttendanceModalProps) {
  const { user, refreshUser } = useUser();
  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<CheckAttendanceResult | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await attendanceApi.getAttendanceStatus();
      setStatus(data);
    } catch {
      // 조회 실패 시 무시
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setResult(null);
      setShowSuccess(false);
      setIsChecking(false);
      setErrorMsg(null);
    }
  }, [isOpen, fetchStatus]);

  const handleCheckIn = async () => {
    try {
      setIsChecking(true);
      setErrorMsg(null);
      const checkResult = await attendanceApi.checkAttendance();
      setResult(checkResult);
      setShowSuccess(true);
      refreshUser();
    } catch {
      setErrorMsg("출석 처리에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsChecking(false);
    }
  };

  const calendarCells = useMemo(() => buildCalendar(), []);

  const attendedDays = useMemo(() => {
    if (!status?.recentAttendances) return new Set<number>();
    return new Set(
      status.recentAttendances.map((a) => new Date(a.date).getUTCDate()),
    );
  }, [status?.recentAttendances]);

  const consecutiveDays = status?.consecutiveDays ?? 0;
  const totalAttendance = status?.totalAttendanceDays ?? 0;
  const alreadyChecked = status?.checkedInToday ?? false;
  const points = user?.points ?? 0;

  const now = new Date();
  const todayDate = now.getDate();
  const monthLabel = `${now.getMonth() + 1}월 출석표`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="출석체크">
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div
            className="w-7 h-7 border-2 rounded-full animate-spin border-default"
            style={{ borderTopColor: "var(--color-foreground)" }}
          />
        </div>
      ) : showSuccess && result ? (
        /* ===== 출석 성공 화면 ===== */
        <div className="p-8 sm:p-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: [0, 1.3, 1], rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 12,
              }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5"
              style={{
                backgroundColor: COLORS.emerald500,
                boxShadow: `0 10px 15px -3px ${COLORS.emerald500}40`,
              }}
            >
              <CalendarCheck className="w-8 h-8" style={{ color: "white" }} />
            </motion.div>

            <h2 className="text-xl font-bold mb-3">출석 완료!</h2>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center mb-3"
            >
              <Badge
                variant={result.isStreakBonus ? "warning" : "success"}
                size="lg"
                className="text-lg font-bold gap-2"
              >
                +{result.pointsEarned}P
                {result.isStreakBonus && <Sparkles className="w-5 h-5" />}
              </Badge>
            </motion.div>

            {result.isStreakBonus && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm font-medium mb-1"
                style={{ color: COLORS.yellow500 }}
              >
                7일 연속 출석 보너스 포함!
              </motion.p>
            )}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm mt-2 text-foreground-muted"
            >
              연속 {result.consecutiveDays}일째 출석 중
            </motion.p>

            <Divider spacing="md" />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                variant="primary"
                fullWidth
                size="lg"
                rounded="lg"
                onClick={onClose}
              >
                확인
              </Button>
            </motion.div>
          </motion.div>
        </div>
      ) : (
        /* ===== 달력 메인 화면 ===== */
        <div className="p-4 sm:p-6">
          {/* 헤더 */}
          <SectionHeader
            icon={CalendarCheck}
            title={monthLabel}
            subtitle="매일 출석하고 포인트를 받으세요"
            withDivider
          />

          {/* 통계 */}
          <StatsRow
            items={[
              { label: "누적 출석", value: totalAttendance, suffix: "일" },
              { label: "연속 출석", value: consecutiveDays, suffix: "일" },
              { label: "보유 포인트", value: points, suffix: "P" },
            ]}
            className="mb-4 sm:mb-6"
          />

          {/* 요일 헤더 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 0 }}>
            {DAY_HEADERS.map((day, i) => (
              <div
                key={day}
                className="text-center text-xs sm:text-sm font-semibold py-2"
                style={{
                  color:
                    i === 0
                      ? COLORS.redText
                      : i === 6
                        ? COLORS.blue400
                        : "var(--color-foreground-muted)",
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 달력 그리드 */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              border: "1px solid var(--color-border)",
            }}
          >
            {calendarCells.map((cell, i) => {
              const attended =
                cell.isCurrentMonth && attendedDays.has(cell.day);
              const isPast =
                cell.isCurrentMonth && cell.day < todayDate && !cell.isToday;
              const isMissed = isPast && !attended;
              const isFuture = cell.isCurrentMonth && cell.day > todayDate;

              const cellBg = attended
                ? COLORS.emeraldBg
                : isMissed
                  ? COLORS.redBg
                  : undefined;

              const dayColor = !cell.isCurrentMonth
                ? "var(--color-foreground-subtle)"
                : cell.isToday
                  ? COLORS.violet400
                  : isFuture
                    ? "var(--color-foreground-subtle)"
                    : "var(--color-foreground)";

              return (
                <div
                  key={i}
                  className="relative flex flex-col items-center justify-center"
                  style={{
                    aspectRatio: "1 / 1",
                    borderRight: "1px solid var(--color-border)",
                    borderBottom: "1px solid var(--color-border)",
                    opacity: !cell.isCurrentMonth ? 0.3 : 1,
                    backgroundColor: cellBg,
                    boxShadow: cell.isToday
                      ? `inset 0 0 0 2px ${COLORS.violet500}`
                      : undefined,
                    zIndex: cell.isToday ? 1 : undefined,
                  }}
                >
                  {/* 날짜 숫자 - 좌상단 */}
                  <span
                    className="absolute top-1 left-1.5 sm:top-1.5 sm:left-2 text-xs sm:text-sm font-bold"
                    style={{ color: dayColor }}
                  >
                    {cell.day}
                  </span>

                  {/* 출석/결석 뱃지 - 우상단 */}
                  {cell.isCurrentMonth && !isFuture && (
                    <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1">
                      {attended ? (
                        <motion.div
                          initial={cell.isToday ? { scale: 0 } : false}
                          animate={{ scale: 1 }}
                          transition={
                            cell.isToday
                              ? {
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 15,
                                }
                              : undefined
                          }
                          className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: COLORS.emerald500 }}
                        >
                          <Check
                            className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                            style={{ color: "white" }}
                            strokeWidth={3}
                          />
                        </motion.div>
                      ) : isMissed ? (
                        <div
                          className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: COLORS.red500 }}
                        >
                          <XIcon
                            className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                            style={{ color: "white" }}
                            strokeWidth={3}
                          />
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* 오늘 미출석 펄스 */}
                  {cell.isToday && !alreadyChecked && !attended && (
                    <motion.div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-1"
                      style={{ backgroundColor: COLORS.violet400 }}
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* 에러 메시지 */}
          {errorMsg && (
            <p className="text-center text-sm font-medium mt-3" style={{ color: COLORS.redText }}>
              {errorMsg}
            </p>
          )}

          {/* 하단 출석하기 버튼 */}
          <div className="mt-4 sm:mt-6">
            {alreadyChecked ? (
              <div
                className="w-full py-3 sm:py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm sm:text-base"
                style={{
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  border: `1px solid ${COLORS.emeraldBorder}`,
                  color: COLORS.emeraldText,
                }}
              >
                <Check className="w-5 h-5" strokeWidth={3} />
                오늘 출석 완료
              </div>
            ) : (
              <Button
                variant="primary"
                fullWidth
                size="lg"
                rounded="lg"
                onClick={handleCheckIn}
                isLoading={isChecking}
                disabled={isChecking}
              >
                {isChecking ? "출석 중..." : "출석하기"}
              </Button>
            )}
          </div>

          {/* 안내 */}
          <p className="text-center text-xs text-foreground-subtle mt-3">
            출석은 매일 00:00에 초기화됩니다
          </p>
        </div>
      )}
    </Modal>
  );
}
