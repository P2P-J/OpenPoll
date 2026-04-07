import { usePageMeta } from "@/hooks/usePageMeta";
import { useTheme } from "@/contexts/ThemeContext";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export function Disclaimer() {
  usePageMeta(
    "면책조항 - OpenPoll",
    "OpenPoll 서비스의 면책조항 및 법적 고지사항을 확인하세요.",
  );
  const { isDark } = useTheme();

  const sectionClass = `mb-8 ${isDark ? "text-gray-300" : "text-gray-700"}`;
  const headingClass = `text-xl font-bold mb-3 ${isDark ? "text-white" : "text-black"}`;
  const listClass = "list-disc list-inside space-y-1 ml-2";

  return (
    <div className="pt-16 min-h-screen pb-12 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link
          to="/"
          className={`inline-flex items-center space-x-2 mb-8 transition-colors ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-black"}`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">홈으로</span>
        </Link>

        <h1 className={`text-3xl sm:text-4xl font-bold mb-4 ${isDark ? "text-white" : "text-black"}`}>
          면책조항
        </h1>
        <p className={`mb-8 text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          최종 수정일: 2026년 4월 8일
        </p>

        <div className={sectionClass}>
          <h2 className={headingClass}>1. 서비스 일반</h2>
          <p className="mb-3 leading-relaxed">
            OpenPoll(이하 "서비스")이 제공하는 모든 콘텐츠는 정보 제공 목적으로만 제작됩니다.
            서비스에서 제공하는 정보는 전문적인 정치 분석, 법률 자문, 투자 조언 등을 대체하지 않으며,
            사용자는 자신의 판단과 책임하에 정보를 활용해야 합니다.
          </p>
          <p className="leading-relaxed">
            OpenPoll은 서비스의 정확성, 완전성, 적시성을 보장하기 위해 최선을 다하지만,
            이에 대한 명시적 또는 묵시적 보증을 하지 않습니다.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>2. 정치 성향 테스트 (DOS)</h2>
          <p className="mb-3 leading-relaxed">
            DOS 테스트 결과는 학술적·교육적 목적의 참고 자료이며,
            개인의 정치적 성향을 완벽하게 대변하지 않습니다.
            테스트 결과가 특정 정당이나 정치적 입장에 대한 지지를 의미하지 않습니다.
          </p>
          <ul className={listClass}>
            <li>테스트 결과는 응답 시점의 인식을 반영하며, 시간에 따라 달라질 수 있습니다.</li>
            <li>32개 질문으로 복잡한 정치 성향을 완전히 파악하는 것은 불가능하며, 대략적인 경향성만 보여줍니다.</li>
            <li>결과를 절대적 기준으로 받아들이지 마시고, 자기 이해를 위한 참고 도구로 활용해 주세요.</li>
          </ul>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>3. AI 중립 뉴스</h2>
          <p className="mb-3 leading-relaxed">
            OpenPoll의 뉴스 콘텐츠는 국내 언론사의 원본 기사를 AI(인공지능)가 중립적 어조로
            재구성한 것입니다. 다음 사항을 이해해 주시기 바랍니다.
          </p>
          <ul className={listClass}>
            <li>AI가 처리한 콘텐츠에는 의도하지 않은 오류나 누락이 포함될 수 있습니다.</li>
            <li>중립화 과정에서 원본 기사의 맥락이나 뉘앙스가 일부 변경될 수 있습니다.</li>
            <li>모든 기사에 원본 출처를 명시하고 있으며, 정확한 정보 확인을 위해 원문 기사를 함께 참고하시길 권장합니다.</li>
            <li>원본 기사의 저작권은 해당 언론사에 있으며, OpenPoll은 중립화된 재구성 콘텐츠에 대해서만 책임을 집니다.</li>
            <li>OpenPoll은 뉴스를 직접 취재하거나 생산하는 언론사가 아니며, 원본 기사의 사실 여부에 대한 책임은 해당 언론사에 있습니다.</li>
          </ul>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>4. 밸런스 게임 및 투표</h2>
          <p className="mb-3 leading-relaxed">
            밸런스 게임의 투표 결과와 정당 지지율은 OpenPoll 사용자의 참여 데이터를 집계한 것으로,
            과학적 표본 추출에 기반한 공식 여론조사 결과가 아닙니다.
          </p>
          <ul className={listClass}>
            <li>투표 결과를 전체 국민 여론으로 해석해서는 안 됩니다.</li>
            <li>사용자 구성의 편향(연령, 지역 등)이 결과에 영향을 줄 수 있습니다.</li>
            <li>댓글과 토론 내용은 개별 사용자의 의견이며, OpenPoll의 공식 입장이 아닙니다.</li>
          </ul>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>5. 광고</h2>
          <p className="mb-3 leading-relaxed">
            서비스는 운영 비용 충당을 위해 Google AdSense를 통한 광고를 게재합니다.
          </p>
          <ul className={listClass}>
            <li>광고 콘텐츠는 Google의 광고 네트워크에서 자동으로 제공되며, OpenPoll이 직접 선택하지 않습니다.</li>
            <li>광고 내용은 OpenPoll의 의견이나 추천을 반영하지 않습니다.</li>
            <li>광고를 통한 외부 사이트 이동 시, 해당 사이트의 정책과 약관이 적용됩니다.</li>
          </ul>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>6. 외부 링크</h2>
          <p className="leading-relaxed">
            서비스 내 외부 링크(원문 기사, 광고 등)를 통해 이동하는 제3자 웹사이트의 콘텐츠, 개인정보 보호 정책,
            서비스 품질 등에 대해 OpenPoll은 책임을 지지 않습니다.
            외부 사이트 이용 시 해당 사이트의 이용약관과 개인정보처리방침을 확인해 주세요.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>7. 서비스 변경 및 중단</h2>
          <p className="leading-relaxed">
            OpenPoll은 사전 통지 없이 서비스의 내용을 변경하거나 중단할 수 있습니다.
            서비스 중단으로 인해 발생하는 손해에 대해 별도의 보상 의무를 부담하지 않습니다.
            다만, 사용자에게 불이익이 발생하지 않도록 합리적인 범위 내에서 사전 공지를 위해 노력합니다.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>8. 지적 재산권</h2>
          <p className="leading-relaxed">
            OpenPoll의 로고, 디자인, UI/UX, DOS 테스트 문항 및 결과 유형, 밸런스 게임 콘텐츠 등
            서비스 내 자체 제작 콘텐츠의 저작권은 OpenPoll에 있습니다.
            무단 복제, 배포, 상업적 이용은 금지됩니다.
            뉴스 원본 기사의 저작권은 각 언론사에 있습니다.
          </p>
        </div>

        <div className={`pt-6 border-t text-sm ${isDark ? "border-gray-800 text-gray-500" : "border-gray-200 text-gray-400"}`}>
          <p className="mb-2">
            본 면책조항에 대한 문의는 openpoll2026@gmail.com으로 연락해 주세요.
          </p>
          <p>
            본 면책조항은 대한민국 법률에 따라 해석되며, 관련 분쟁은 대한민국 법원의 관할로 합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
