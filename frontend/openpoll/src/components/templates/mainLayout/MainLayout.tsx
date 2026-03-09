import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/components/organisms/header';
import { Navigation } from '@/components/organisms/navigation';
import { Footer } from '@/components/organisms/footer';
import { AttendanceModal } from '@/components/molecules/attendanceModal';
import { LoginModal } from '@/components/molecules/loginModal';
import { useScrollToTop } from '@/hooks';
import { useUser } from '@/contexts/UserContext';
import { attendanceApi } from '@/api';

const ATTENDANCE_POPUP_KEY = 'attendancePopupShown';

export function MainLayout() {
  const location = useLocation();
  const { isAuthenticated } = useUser();
  useScrollToTop();

  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const checkedRef = useRef(false);

  // 로그인 세션당 1회 자동 팝업
  useEffect(() => {
    if (!isAuthenticated || checkedRef.current) return;
    if (sessionStorage.getItem(ATTENDANCE_POPUP_KEY)) return;

    checkedRef.current = true;
    let cancelled = false;

    attendanceApi.getAttendanceStatus().then((status) => {
      if (cancelled) return;
      if (!status.checkedInToday) {
        setShowAttendanceModal(true);
      }
      sessionStorage.setItem(ATTENDANCE_POPUP_KEY, '1');
    }).catch(() => {
      // 출석 상태 조회 실패 시 무시
    });

    return () => { cancelled = true; };
  }, [isAuthenticated]);

  // 헤더 출석 탭 클릭 핸들러
  const handleAttendanceClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setShowAttendanceModal(true);
  };

  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className={`min-h-screen ${isAuthPage ? 'bg-black' : 'bg-background'}`}>
      {!isAuthPage && (
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-3 focus:bg-black focus:text-white focus:rounded-br-lg"
        >
          본문으로 건너뛰기
        </a>
      )}

      {!isAuthPage && <Header onAttendanceClick={handleAttendanceClick} />}
      {!isAuthPage && location.pathname !== '/dos' && <Navigation />}

      <main
        id="main-content"
        className=""
      >
        <Outlet />
      </main>

      {!isAuthPage && <Footer />}

      <AttendanceModal
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
      />
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
