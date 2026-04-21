import { usePageMeta } from "@/hooks/usePageMeta";
import { useTheme } from "@/contexts/ThemeContext";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export function About() {
  usePageMeta(
    "OpenPoll 소개 - 열린 여론조사 플랫폼",
    "OpenPoll은 정치 성향 테스트, AI 중립 뉴스, 밸런스 게임을 제공하는 열린 여론조사 플랫폼입니다.",
  );
  const { isDark } = useTheme();

  const sectionClass = `mb-10 ${isDark ? "text-gray-300" : "text-gray-700"}`;
  const headingClass = `text-xl font-bold mb-4 ${isDark ? "text-white" : "text-black"}`;
  const subHeadingClass = `text-lg font-semibold mb-2 ${isDark ? "text-gray-100" : "text-gray-900"}`;

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
          OpenPoll 소개
        </h1>
        <p className={`text-lg mb-10 leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          정치, 이제는 쉽게. 누구나 참여하는 열린 여론조사 플랫폼.
        </p>

        {/* 미션 */}
        <div className={sectionClass}>
          <h2 className={headingClass}>우리의 미션</h2>
          <p className="mb-4 leading-relaxed">
            OpenPoll은 정치에 대한 관심과 참여의 문턱을 낮추기 위해 만들어졌습니다.
            복잡하고 어렵게 느껴지는 정치 이슈를 쉽고 재미있게 접근할 수 있도록,
            다양한 참여형 콘텐츠를 제공합니다.
          </p>
          <p className="mb-4 leading-relaxed">
            우리는 특정 정당이나 정치적 입장을 지지하지 않습니다.
            모든 콘텐츠는 중립성과 객관성을 최우선 원칙으로 제작되며,
            사용자가 스스로 판단하고 생각할 수 있는 환경을 만드는 것이 목표입니다.
          </p>
          <p className="leading-relaxed">
            정치적 성향은 틀린 것이 아니라 다른 것입니다.
            OpenPoll은 다양한 관점이 공존하는 건강한 여론 문화를 만들어 가고자 합니다.
          </p>
        </div>

        {/* 서비스 소개 */}
        <div className={sectionClass}>
          <h2 className={headingClass}>서비스 소개</h2>

          <div className="space-y-6">
            <div>
              <h3 className={subHeadingClass}>정치 성향 DOS 테스트</h3>
              <p className="leading-relaxed">
                32개의 질문을 통해 나의 정치적 좌표를 찾아보는 테스트입니다.
                변화 인식, 분배 인식, 권리 인식, 발전 인식의 4가지 축을 기반으로
                16가지 정치 성향 유형 중 자신에게 맞는 유형을 분석합니다.
                약 10분 소요되며, 결과를 친구와 공유할 수 있습니다.
                모든 질문은 특정 정답이 없으며, 편향을 최소화하도록 설계되었습니다.
              </p>
            </div>

            <div>
              <h3 className={subHeadingClass}>AI 중립 뉴스</h3>
              <p className="leading-relaxed">
                뉴스 기사의 자극적이고 편향된 표현을 AI가 자동으로 감지하여
                중립적이고 객관적인 어조로 재구성합니다.
                원본 기사의 의견, 추측, 감정적 표현은 모두 제거되고,
                사실 중심의 정보만 전달합니다.
                모든 기사에는 원본 출처가 명시되며,
                중립화 과정을 투명하게 공개합니다.
                이를 통해 독자는 편향 없이 뉴스의 핵심 내용을 파악할 수 있습니다.
              </p>
            </div>

            <div>
              <h3 className={subHeadingClass}>밸런스 게임</h3>
              <p className="leading-relaxed">
                정치적 이슈를 찬성과 반대로 나누어 투표하고 토론하는 공간입니다.
                실시간 투표 결과를 확인하고, 다른 사용자들과 의견을 나눌 수 있습니다.
                복잡한 정치 이슈를 단순한 선택으로 풀어내어,
                누구나 쉽게 정치적 의사를 표현할 수 있도록 돕습니다.
              </p>
            </div>

            <div>
              <h3 className={subHeadingClass}>정당 지지율 투표</h3>
              <p className="leading-relaxed">
                실시간으로 정당 지지율을 투표하고 결과를 확인할 수 있습니다.
                공식 여론조사와는 다른, 사용자 참여 기반의 열린 지지율 데이터를 제공합니다.
                투표 결과는 실시간으로 업데이트되며, 누구나 자유롭게 참여할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 핵심 가치 */}
        <div className={sectionClass}>
          <h2 className={headingClass}>핵심 가치</h2>
          <div className="space-y-4">
            {[
              {
                title: "중립성",
                desc: "특정 정치적 입장을 지지하거나 반대하지 않습니다. 모든 콘텐츠는 균형 잡힌 시각으로 제작됩니다.",
              },
              {
                title: "투명성",
                desc: "AI 중립화 과정을 공개하고, 원본 출처를 항상 명시합니다. 사용자가 직접 판단할 수 있는 정보를 제공합니다.",
              },
              {
                title: "접근성",
                desc: "정치에 관심이 없는 사람도 쉽게 참여할 수 있도록 재미있고 직관적인 인터페이스를 제공합니다.",
              },
              {
                title: "개인정보 보호",
                desc: "사용자의 정치적 성향과 투표 데이터는 통계 목적으로만 활용되며, 개인을 식별할 수 없는 형태로 처리됩니다.",
              },
            ].map(({ title, desc }) => (
              <div key={title}>
                <h3 className={subHeadingClass}>{title}</h3>
                <p className="leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 기술 스택 & 신뢰성 */}
        <div className={sectionClass}>
          <h2 className={headingClass}>기술과 신뢰성</h2>
          <p className="mb-4 leading-relaxed">
            OpenPoll은 최신 웹 기술을 기반으로 안정적이고 빠른 서비스를 제공합니다.
            React 기반의 프론트엔드와 Node.js 백엔드로 구성되어 있으며,
            AWS 클라우드 인프라에서 운영됩니다.
          </p>
          <p className="mb-4 leading-relaxed">
            뉴스 중립화에는 OpenAI의 GPT 모델을 활용하며,
            일관된 품질의 중립적 콘텐츠를 제공하기 위해
            엄격한 프롬프트 규칙을 적용하고 있습니다.
            AI가 생성한 모든 콘텐츠는 사실 확인과 중립성 검증 기준을 통과해야 합니다.
          </p>
          <p className="leading-relaxed">
            사용자 데이터는 SSL 암호화를 통해 안전하게 전송되며,
            비밀번호는 bcrypt 해시 알고리즘으로 암호화하여 저장합니다.
            Google Analytics와 Microsoft Clarity를 통해
            서비스 품질을 지속적으로 모니터링하고 개선하고 있습니다.
          </p>
        </div>

        {/* 편집팀과 편집 원칙 */}
        <div className={sectionClass}>
          <h2 className={headingClass}>편집팀과 편집 원칙</h2>
          <p className="mb-4 leading-relaxed">
            OpenPoll의 블로그 글과 DOS 테스트 문항, 밸런스 게임 주제는 <strong>OpenPoll 편집팀</strong>이
            작성·검토합니다. 편집팀은 특정 정당이나 이익 집단과 관계없이 독립적으로 운영되며,
            공개 자료·통계·법령을 근거로 중립적 관점의 콘텐츠를 제작합니다.
          </p>

          <h3 className={subHeadingClass}>편집 원칙</h3>
          <ul className="list-disc list-inside space-y-2 ml-2 mb-4">
            <li>
              <strong>사실 기반:</strong> 모든 글은 공개된 법령·통계청 자료·공신력 있는 매체 보도를
              근거로 작성합니다. 확인되지 않은 주장은 명시적 출처와 함께 인용 형식으로만 다룹니다.
            </li>
            <li>
              <strong>중립성:</strong> 특정 정당·후보·정책을 지지하거나 반대하는 표현을 쓰지 않습니다.
              찬반이 갈리는 이슈는 양쪽 입장을 균형 있게 정리합니다.
            </li>
            <li>
              <strong>투명성:</strong> AI 도구를 활용한 경우 그 사실을 명시하고, 최종 검토는 편집팀이
              책임집니다. 공유하는 이미지·통계는 원본 출처를 유지합니다.
            </li>
            <li>
              <strong>수정·정정:</strong> 사실 오류가 확인되면 빠르게 수정하고, 중요한 변경은 업데이트
              일자와 함께 표시합니다. 독자 제보는 이메일로 언제든 받습니다.
            </li>
            <li>
              <strong>개인정보 보호:</strong> 사용자 개별 답변·투표 기록은 집계 목적으로만 활용되며,
              개인을 식별할 수 없는 형태로 처리합니다.
            </li>
          </ul>

          <h3 className={subHeadingClass}>교정·수정 요청</h3>
          <p className="leading-relaxed">
            사실 관계 오류, 용어 사용 문제, 누락된 관점 등에 대한 지적은 운영팀 이메일로 제보해 주세요.
            검토 후 수정 사항은 해당 페이지 하단에 업데이트 이력으로 기록됩니다.
          </p>
        </div>

        {/* 포인트 시스템 */}
        <div className={sectionClass}>
          <h2 className={headingClass}>포인트 시스템</h2>
          <p className="mb-4 leading-relaxed">
            OpenPoll은 사용자 참여를 장려하기 위해 포인트 시스템을 운영하고 있습니다.
            다양한 활동을 통해 포인트를 획득할 수 있습니다.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>회원가입: +500P</li>
            <li>DOS 테스트 완료: +300P</li>
            <li>밸런스 게임 투표: +50P</li>
            <li>일일 출석 체크: +30P</li>
            <li>연속 출석 보너스: +20P (추가)</li>
            <li>정당 지지율 투표: -5P (소모)</li>
          </ul>
        </div>

        {/* 연락처 */}
        <div className={sectionClass}>
          <h2 className={headingClass}>문의 및 연락처</h2>
          <p className="mb-4 leading-relaxed">
            OpenPoll에 대한 문의, 제안, 버그 리포트 등은 아래 이메일로 연락해 주세요.
            서비스 개선에 큰 도움이 됩니다.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>서비스명: OpenPoll (열린 여론조사)</li>
            <li>운영: OpenPoll 운영팀</li>
            <li>이메일: openpoll2026@gmail.com</li>
            <li>
              웹사이트:{" "}
              <a
                href="https://www.openpoll.co.kr"
                className={`underline ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"}`}
              >
                www.openpoll.co.kr
              </a>
            </li>
          </ul>
        </div>

        <div className={`pt-6 border-t text-sm ${isDark ? "border-gray-800 text-gray-500" : "border-gray-200 text-gray-400"}`}>
          <p>
            OpenPoll은 대한민국에서 운영되는 서비스이며,
            관련 법령을 준수합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
