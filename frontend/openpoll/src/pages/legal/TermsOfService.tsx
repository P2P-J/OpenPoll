import { usePageMeta } from "@/hooks/usePageMeta";
import { useTheme } from "@/contexts/ThemeContext";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export function TermsOfService() {
  usePageMeta("이용약관", "OpenPoll 서비스 이용약관을 확인하세요.");
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
          이용약관
        </h1>

        <p className={`mb-6 text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          시행일: 2026년 3월 10일 | 최종 수정일: 2026년 3월 10일
        </p>

        <div className={sectionClass}>
          <h2 className={headingClass}>제1조 (목적)</h2>
          <p>
            본 약관은 OpenPoll(이하 "서비스")이 제공하는 온라인 여론조사 및 정치 참여 플랫폼의
            이용에 관한 기본적인 사항을 규정함을 목적으로 합니다.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>제2조 (서비스의 내용)</h2>
          <p className="mb-2">서비스는 다음의 기능을 제공합니다.</p>
          <ul className={listClass}>
            <li>정치 성향 테스트(DOS 테스트)</li>
            <li>실시간 정당 지지율 투표</li>
            <li>밸런스 게임 투표 및 토론</li>
            <li>AI 기반 중립 뉴스 제공</li>
            <li>포인트 시스템 운영</li>
          </ul>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>제3조 (회원가입 및 계정)</h2>
          <ul className={listClass}>
            <li>이용자는 이메일 또는 소셜 로그인(Google, Naver)을 통해 회원가입할 수 있습니다.</li>
            <li>회원은 정확하고 최신의 정보를 제공해야 하며, 타인의 정보를 도용해서는 안 됩니다.</li>
            <li>계정 정보의 관리 책임은 회원 본인에게 있습니다.</li>
          </ul>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>제4조 (포인트 시스템)</h2>
          <ul className={listClass}>
            <li>회원가입 시 500P가 지급됩니다.</li>
            <li>정치 성향 테스트 완료 시 300P가 지급됩니다.</li>
            <li>밸런스 게임 참여 시 50P가 지급됩니다.</li>
            <li>일일 출석 시 30P, 7일 연속 출석 시 보너스 20P가 지급됩니다.</li>
            <li>정당 지지 투표 시 5P가 차감됩니다.</li>
            <li>포인트는 현금으로 환전할 수 없으며, 서비스 내에서만 사용됩니다.</li>
          </ul>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>제5조 (이용자의 의무)</h2>
          <p className="mb-2">이용자는 다음 행위를 해서는 안 됩니다.</p>
          <ul className={listClass}>
            <li>타인의 개인정보를 무단으로 수집·이용하는 행위</li>
            <li>서비스의 정상적인 운영을 방해하는 행위</li>
            <li>허위 정보를 등록하거나 부정한 방법으로 포인트를 획득하는 행위</li>
            <li>다른 이용자에 대한 비방, 혐오 발언, 욕설 등의 행위</li>
            <li>서비스를 이용하여 불법 행위를 하는 행위</li>
          </ul>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>제6조 (서비스의 중단)</h2>
          <p>
            서비스는 시스템 점검, 설비 교체, 천재지변 등의 사유로 일시적으로 중단될 수 있으며,
            이 경우 사전에 공지합니다. 다만, 긴급한 경우에는 사후에 공지할 수 있습니다.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>제7조 (면책사항)</h2>
          <ul className={listClass}>
            <li>서비스에서 제공하는 정치 성향 테스트 결과는 참고용이며, 특정 정당이나 정치적 입장을 대변하지 않습니다.</li>
            <li>뉴스 콘텐츠는 AI에 의해 요약·순화된 것으로, 원문의 의미와 다를 수 있습니다.</li>
            <li>투표 결과는 서비스 이용자의 참여에 기반한 것으로, 공식적인 여론조사가 아닙니다.</li>
          </ul>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>제8조 (광고 게재)</h2>
          <p>
            서비스는 운영을 위해 Google AdSense 등을 통한 광고를 게재할 수 있습니다.
            광고와 관련된 거래는 이용자와 광고주 간의 문제이며, 서비스는 이에 대해 책임지지 않습니다.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>제9조 (회원 탈퇴 및 자격 상실)</h2>
          <ul className={listClass}>
            <li>회원은 언제든지 프로필 페이지에서 탈퇴를 요청할 수 있습니다.</li>
            <li>탈퇴 시 개인정보 및 포인트는 즉시 삭제되며 복구할 수 없습니다.</li>
            <li>제5조를 위반한 경우 서비스는 사전 통보 없이 회원 자격을 제한할 수 있습니다.</li>
          </ul>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>제10조 (약관의 변경)</h2>
          <p>
            서비스는 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통해 7일 전에 안내합니다.
            변경된 약관에 동의하지 않는 회원은 탈퇴할 수 있으며, 공지 후 7일 이내에 거부 의사를
            표시하지 않으면 동의한 것으로 간주합니다.
          </p>
        </div>

        <div className={`pt-6 border-t text-sm ${isDark ? "border-gray-800 text-gray-500" : "border-gray-200 text-gray-400"}`}>
          <p>본 약관에 명시되지 않은 사항은 관련 법령 및 상관례에 따릅니다.</p>
        </div>
      </div>
    </div>
  );
}
