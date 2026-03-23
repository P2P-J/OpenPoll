import { usePageMeta } from "@/hooks/usePageMeta";
import { useTheme } from "@/contexts/ThemeContext";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export function PrivacyPolicy() {
  usePageMeta("개인정보처리방침", "OpenPoll의 개인정보처리방침을 확인하세요.");
  const { isDark } = useTheme();

  const sectionClass = `mb-8 ${isDark ? "text-gray-300" : "text-gray-700"}`;
  const headingClass = `text-xl font-bold mb-3 ${isDark ? "text-white" : "text-black"}`;
  const listClass = "list-disc list-inside space-y-1 ml-2";

  return (
    <div className={`pt-16 min-h-screen pb-12 bg-background`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link
          to="/"
          className={`inline-flex items-center space-x-2 mb-8 transition-colors ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-black"}`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">홈으로</span>
        </Link>

        <h1 className={`text-3xl sm:text-4xl font-bold mb-8 ${isDark ? "text-white" : "text-black"}`}>
          개인정보처리방침
        </h1>

        <p className={`mb-6 text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          시행일: 2026년 3월 10일 | 최종 수정일: 2026년 3월 10일
        </p>

        <div className={sectionClass}>
          <h2 className={headingClass}>1. 개인정보의 수집 및 이용 목적</h2>
          <p className="mb-2">OpenPoll(이하 "서비스")은 다음 목적을 위해 개인정보를 수집·이용합니다.</p>
          <ul className={listClass}>
            <li>회원 가입 및 로그인 인증</li>
            <li>서비스 제공 및 맞춤형 콘텐츠 제공</li>
            <li>투표 참여 및 결과 통계 분석</li>
            <li>포인트 시스템 운영</li>
            <li>서비스 개선 및 통계 분석</li>
          </ul>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>2. 수집하는 개인정보 항목</h2>
          <p className="mb-2">서비스는 다음 항목의 개인정보를 수집합니다.</p>
          <ul className={listClass}>
            <li><strong>필수항목:</strong> 이메일, 비밀번호(암호화 저장), 닉네임</li>
            <li><strong>선택항목:</strong> 연령, 성별, 거주 지역</li>
            <li><strong>자동수집항목:</strong> 서비스 이용 기록, 접속 로그</li>
          </ul>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>3. 개인정보의 보유 및 이용 기간</h2>
          <p className="mb-2">
            회원 탈퇴 시 즉시 파기하며, 관계 법령에 따라 보존이 필요한 경우 해당 법령에서 정한 기간 동안 보관합니다.
          </p>
          <ul className={listClass}>
            <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
            <li>소비자 불만 또는 분쟁처리에 관한 기록: 3년</li>
            <li>웹사이트 방문 기록: 3개월</li>
          </ul>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>4. 개인정보의 제3자 제공</h2>
          <p>
            서비스는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다. 다만, 이용자의 동의가 있거나
            법령에 의해 요구되는 경우에는 예외로 합니다.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>5. 개인정보의 파기</h2>
          <p>
            이용 목적이 달성된 개인정보는 지체 없이 파기합니다. 전자적 파일 형태의 정보는 복구 불가능한 방법으로
            삭제하며, 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각합니다.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>6. 이용자의 권리</h2>
          <p className="mb-2">이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
          <ul className={listClass}>
            <li>개인정보 열람 요구</li>
            <li>오류 등의 정정 요구</li>
            <li>삭제 요구</li>
            <li>처리 정지 요구</li>
            <li>회원 탈퇴(프로필 페이지에서 직접 가능)</li>
          </ul>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>7. 쿠키 및 광고</h2>
          <p className="mb-2">
            서비스는 Google AdSense를 통해 광고를 게재하며, 이를 위해 쿠키를 사용할 수 있습니다.
            Google은 사용자의 관심사에 기반한 광고를 게재하기 위해 쿠키를 사용합니다.
          </p>
          <ul className={listClass}>
            <li>
              사용자는{" "}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-400 hover:text-blue-300"
              >
                Google 광고 설정
              </a>
              에서 맞춤 광고를 비활성화할 수 있습니다.
            </li>
            <li>브라우저 설정에서 쿠키 사용을 거부할 수 있으나, 일부 서비스 이용이 제한될 수 있습니다.</li>
          </ul>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>8. 개인정보 보호책임자</h2>
          <p className="mb-2">
            개인정보 처리에 관한 업무를 담당하는 책임자는 다음과 같습니다.
          </p>
          <ul className={listClass}>
            <li>담당자: OpenPoll 운영팀</li>
            <li>이메일: openpoll2026@gmail.com</li>
          </ul>
        </div>

        <div className={`pt-6 border-t text-sm ${isDark ? "border-gray-800 text-gray-500" : "border-gray-200 text-gray-400"}`}>
          <p>본 개인정보처리방침은 시행일로부터 적용되며, 변경 사항이 있을 경우 서비스 내 공지사항을 통해 안내합니다.</p>
        </div>
      </div>
    </div>
  );
}
