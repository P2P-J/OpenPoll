import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Coins, ChevronDown, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/atoms/themeToggle/ThemeToggle";
import { ROUTES } from "@/shared/constants";
import { useUser } from "@/contexts/UserContext";
import { useTheme } from "@/contexts/ThemeContext";

export function Header() {
  const { user, isAuthenticated, logout } = useUser();
  const { isDark } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 및 Escape 키 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  // Get user data from context
  const points = user?.points ?? 500;
  const userNickname = user?.nickname;

  // Color coding based on points
  const isLowPoints = points < 25;
  const isCriticalPoints = points < 5;

  const getPointsColor = () => {
    if (isCriticalPoints) return isDark ? "text-red-400" : "text-red-600";
    if (isLowPoints) return isDark ? "text-yellow-400" : "text-yellow-600";
    return "";
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    const overlay = document.createElement("div");
    overlay.setAttribute("aria-hidden", "true");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "#fff";
    overlay.style.zIndex = "99999";
    document.body.appendChild(overlay);

    try {
      // 흰 화면 오버레이를 먼저 페인트한 뒤 로그아웃 처리
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      await logout();
    } catch {
      // 로그아웃 실패는 무시
    } finally {
      window.location.replace(ROUTES.HOME);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to={ROUTES.HOME}
            className="flex items-center space-x-2 group"
            aria-label="OpenPoll 홈으로 이동"
          >
            <img
              src={isDark ? "/OPENPOLL-LARGE.png" : "/openpoll-black.png"}
              alt="OpenPoll"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform duration-300 group-hover:scale-110"
            />
            <span className="text-lg sm:text-xl font-bold tracking-tight transition-colors duration-300">
              OpenPoll
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            {!isAuthenticated ? (
              <>
                {/* 로그인 전: 로그인, 회원가입 버튼 */}
                <Link
                  to={ROUTES.LOGIN}
                  className="text-sm font-semibold hover:opacity-80 transition-opacity"
                >
                  로그인
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    isDark
                      ? 'bg-white text-black hover:bg-gray-100'
                      : 'bg-black text-white hover:bg-gray-900'
                  }`}
                >
                  회원가입
                </Link>
              </>
            ) : (
              <>
                {/* 로그인 후: 닉네임 드롭다운, 포인트 */}
                <div className="relative" ref={dropdownRef}>
                  <motion.button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                      isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: isDark ? '#e5e7eb' : '#1f2937' }}
                      >
                        <User className="w-4 h-4" style={{ color: isDark ? '#1f2937' : '#ffffff' }} />
                      </div>
                      <span className="inline-block max-w-[100px] truncate align-bottom">{userNickname}님</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{
                          duration: 0.2,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                        className={`absolute right-0 top-full mt-3 rounded-2xl shadow-xl border overflow-hidden z-50 ${
                          isDark
                            ? 'bg-gray-800 border-gray-700'
                            : 'bg-white border-gray-200'
                        }`}
                        style={{
                          boxShadow:
                            "0 10px 40px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06)",
                          minWidth: "320px",
                        }}
                      >
                        {/* 사용자 정보 헤더와 메뉴를 가로로 배치 */}
                        <div className="flex items-center gap-4 px-4 py-3">
                          {/* 사용자 정보 */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                              style={{ backgroundColor: isDark ? '#e5e7eb' : '#1f2937' }}
                            >
                              <User className="w-5 h-5" style={{ color: isDark ? '#1f2937' : '#ffffff' }} />
                            </div>
                            <div>
                              <p className={`font-bold text-sm whitespace-nowrap ${isDark ? 'text-white' : 'text-black'}`}>
                                {userNickname}
                              </p>
                              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {points.toLocaleString()}P
                              </p>
                            </div>
                          </div>

                          {/* 세로 구분선 */}
                          <div className={`h-10 w-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />

                          {/* 메뉴 아이템 - 가로 배치 */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Link
                              to="/profile"
                              onClick={() => setIsDropdownOpen(false)}
                              className={`group flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                                isDark
                                  ? 'text-gray-200 hover:bg-gray-700/50'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <div className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                                isDark
                                  ? 'bg-gray-700 group-hover:bg-gray-600'
                                  : 'bg-gray-100 group-hover:bg-gray-200'
                              }`}>
                                <User className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                              </div>
                              <span className="text-xs font-medium whitespace-nowrap">
                                프로필
                              </span>
                            </Link>

                            <button
                              type="button"
                              onClick={handleLogout}
                              className={`group flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                                isDark
                                  ? 'text-red-400 hover:bg-red-900/20'
                                  : 'text-red-600 hover:bg-red-50'
                              }`}
                            >
                              <div className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                                isDark
                                  ? 'bg-red-900/20 group-hover:bg-red-900/30'
                                  : 'bg-red-50 group-hover:bg-red-100'
                              }`}>
                                <LogOut className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                              </div>
                              <span className="text-xs font-medium whitespace-nowrap">
                                로그아웃
                              </span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.div
                  className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-300 hover-lift ${
                    isCriticalPoints
                      ? isDark
                        ? "bg-red-900/20 border border-red-700"
                        : "bg-red-100 border border-red-300"
                      : isLowPoints
                        ? isDark
                          ? "bg-yellow-900/20 border border-yellow-700"
                          : "bg-yellow-100 border border-yellow-300"
                        : ""
                  }`}
                  style={
                    !isLowPoints && !isCriticalPoints
                      ? {
                          backgroundColor: "var(--color-secondary)",
                          color: "var(--color-secondary-foreground)",
                        }
                      : {}
                  }
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Coins
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 hover:rotate-12 ${getPointsColor()}`}
                  />
                  <motion.span
                    key={points}
                    className={`text-xs sm:text-sm font-semibold ${getPointsColor()}`}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    {points.toLocaleString()}P
                  </motion.span>
                </motion.div>
              </>
            )}

            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
