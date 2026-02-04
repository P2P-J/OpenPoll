import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  User,
  Mail,
  MapPin,
  Users,
  Calendar,
  Coins,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Vote,
  History,
  Award,
  Info,
  Plus,
  Minus,
  Lock,
  X,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { userApi } from "@/api";
import type { PointRecord, UserVoteStats } from "@/types/api.types";
import { ROUTES } from "@/shared/constants";

export function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useUser();

  const [pointHistory, setPointHistory] = useState<PointRecord[]>([]);
  const [voteStats, setVoteStats] = useState<UserVoteStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 비밀번호 변경 상태
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(ROUTES.LOGIN);
    }
  }, [authLoading, isAuthenticated, navigate]);

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) return;

      try {
        setIsLoading(true);
        const [pointHistoryRes, voteStatsRes] = await Promise.all([
          userApi.getPointHistory({ limit: 20 }),
          userApi.getMyVotes(),
        ]);

        setPointHistory(pointHistoryRes.data);
        setVoteStats(voteStatsRes);
      } catch (error) {
        console.error("Failed to load profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  if (authLoading || isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white" />
      </div>
    );
  }

  const getGenderText = (gender: string) => {
    switch (gender) {
      case "MALE":
        return "남성";
      case "FEMALE":
        return "여성";
      default:
        return gender;
    }
  };

  const getPointTypeText = (type: string, amount: number) => {
    const typeMap: Record<string, string> = {
      SIGNUP: "회원가입 완료",
      DOS: "정치 MBTI 완료",
      BALANCE_GAME: "밸런스 게임 참여",
      NEWS_READ: "뉴스 읽기",
      DAILY_ATTENDANCE: "일일 출석",
      CONSECUTIVE_ATTENDANCE_BONUS: "연속 출석 보너스 (7일 연속)",
      PARTY_VOTE: "정당 지지 투표",
    };

    const pointInfo: Record<string, string> = {
      SIGNUP: "+500P",
      DOS: "+300P",
      BALANCE_GAME: "+50P",
      NEWS_READ: "+10P",
      DAILY_ATTENDANCE: "+30P",
      CONSECUTIVE_ATTENDANCE_BONUS: "+20P",
      PARTY_VOTE: "-5P",
    };

    const baseName = typeMap[type] || type;
    const expectedPoints = pointInfo[type];

    // 포인트 정보가 있고 실제 금액과 다른 경우 둘 다 표시
    if (expectedPoints && Math.abs(amount).toString() !== expectedPoints.replace(/[+\-P]/g, '')) {
      return `${baseName} (${expectedPoints})`;
    }

    return baseName;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    // 유효성 검사
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("모든 필드를 입력해주세요.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("새 비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    if (!/^(?=.*[a-zA-Z])(?=.*[0-9])/.test(newPassword)) {
      setPasswordError("새 비밀번호는 영문과 숫자를 포함해야 합니다.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setIsChangingPassword(true);
      await userApi.changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // 3초 후 모달 닫기
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (error: any) {
      setPasswordError(
        error?.response?.data?.message || "비밀번호 변경에 실패했습니다."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-white dark:bg-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(ROUTES.HOME)}
          className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">홈으로</span>
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 dark:text-white">
            내 프로필
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            회원 정보 및 활동 내역을 확인하세요
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8 mb-6"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-16 h-16 text-white dark:text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1 dark:text-white">
                {user.nickname}
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {user.points.toLocaleString()} 포인트
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Award className="w-4 h-4" />
                  <span>총 {(user.totalEarnedPoints || 0).toLocaleString()}P 획득</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                  이메일
                </p>
                <p className="font-semibold dark:text-white">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                  나이
                </p>
                <p className="font-semibold dark:text-white">{user.age}세</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                  성별
                </p>
                <p className="font-semibold dark:text-white">
                  {getGenderText(user.gender)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                  지역
                </p>
                <p className="font-semibold dark:text-white">{user.region}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Party Votes Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8 mb-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Vote className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <h3 className="text-xl font-bold dark:text-white">
              정당별 투표 통계
            </h3>
          </div>

          {voteStats && voteStats.stats.length > 0 ? (
            <>
              <div className="space-y-4">
                {voteStats.stats
                  .filter((item) => item.count > 0)
                  .sort((a, b) => b.count - a.count)
                  .map((item, index) => (
                    <div key={item.partyId} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-semibold dark:text-white">
                            {item.partyName}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-lg dark:text-white">
                            {item.count}회
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                            ({item.count * -5}P)
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: item.color }}
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(item.count / voteStats.totalVotes) * 100}%`,
                          }}
                          transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                        />
                      </div>
                    </div>
                  ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    총 투표 횟수
                  </span>
                  <span className="font-bold text-xl dark:text-white">
                    {voteStats.totalVotes}회
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Vote className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>아직 투표 내역이 없습니다</p>
              <p className="text-sm mt-1">홈에서 정당 투표에 참여해보세요!</p>
            </div>
          )}
        </motion.div>

        {/* Point Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8 mb-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Info className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <h3 className="text-xl font-bold dark:text-white">
              포인트 가이드
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 포인트 획득 */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-bold text-lg dark:text-white">포인트 획득</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm dark:text-gray-300">회원가입 완료</span>
                  <span className="font-bold text-green-600 dark:text-green-400">+500P</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm dark:text-gray-300">정치 MBTI 완료</span>
                  <span className="font-bold text-green-600 dark:text-green-400">+300P</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm dark:text-gray-300">밸런스 게임 참여 (1회)</span>
                  <span className="font-bold text-green-600 dark:text-green-400">+50P</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm dark:text-gray-300">일일 출석</span>
                  <span className="font-bold text-green-600 dark:text-green-400">+30P</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm dark:text-gray-300">연속 출석 보너스 (7일)</span>
                  <span className="font-bold text-green-600 dark:text-green-400">+20P</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm dark:text-gray-300">뉴스 읽기 (1개)</span>
                  <span className="font-bold text-green-600 dark:text-green-400">+10P</span>
                </div>
              </div>
            </div>

            {/* 포인트 사용 */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <Minus className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h4 className="font-bold text-lg dark:text-white">포인트 사용</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm dark:text-gray-300">정당 지지 투표</span>
                  <span className="font-bold text-red-600 dark:text-red-400">-5P</span>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    💡 포인트가 부족하신가요? 위의 활동들을 통해 포인트를 획득하세요!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Point History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8 mb-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <History className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <h3 className="text-xl font-bold dark:text-white">
              포인트 내역
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              (최근 20개)
            </span>
          </div>

          {pointHistory.length > 0 ? (
            <div className="space-y-3">
              {pointHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {item.amount > 0 ? (
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold dark:text-white">
                        {item.description || getPointTypeText(item.type, item.amount)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`font-bold text-lg ${
                      item.amount > 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {item.amount > 0 ? "+" : ""}
                    {item.amount}P
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>아직 포인트 내역이 없습니다</p>
            </div>
          )}
        </motion.div>

        {/* Password Change Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Lock className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <h3 className="text-xl font-bold dark:text-white">보안</h3>
          </div>

          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2"
          >
            <Lock className="w-5 h-5" />
            <span>비밀번호 변경</span>
          </button>
        </motion.div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Lock className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                <h3 className="text-xl font-bold dark:text-white">
                  비밀번호 변경
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError("");
                  setPasswordSuccess(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="현재 비밀번호를 입력하세요"
                  disabled={isChangingPassword}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="새 비밀번호 (영문+숫자, 8자 이상)"
                  disabled={isChangingPassword}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="새 비밀번호를 다시 입력하세요"
                  disabled={isChangingPassword}
                />
              </div>

              {passwordError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {passwordError}
                  </p>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    비밀번호가 성공적으로 변경되었습니다.
                  </p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError("");
                    setPasswordSuccess(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  disabled={isChangingPassword}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? "변경 중..." : "변경하기"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
