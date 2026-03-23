import { useState } from "react";
import {
  Sparkles,
  CalendarCheck,
  Search,
  Mail,
  Lock,
  Bell,
  Shield,
  Users,
  TrendingUp,
  Inbox,
  Heart,
  AlertTriangle,
  LogIn,
  Newspaper,
  LayoutList,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { usePageMeta } from "@/hooks/usePageMeta";

// Atoms
import { Button } from "@/components/atoms/button/Button";
import { Badge } from "@/components/atoms/badge/Badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/atoms/card/Card";
import { ProgressBar } from "@/components/atoms/progressBar/ProgressBar";
import { Avatar } from "@/components/atoms/avatar/Avatar";
import { Divider } from "@/components/atoms/divider/Divider";
import { EmptyState } from "@/components/atoms/emptyState/EmptyState";
import { Input } from "@/components/atoms/input/Input";
import { Modal } from "@/components/atoms/modal/Modal";
import { SectionHeader } from "@/components/atoms/sectionHeader/SectionHeader";
import { StatsRow } from "@/components/atoms/statsRow/StatsRow";

function DemoSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { isDark } = useTheme();
  return (
    <section className="mb-12">
      <h2
        className={`text-xl sm:text-2xl font-bold mb-6 pb-3 border-b ${isDark ? "border-gray-800 text-white" : "border-gray-200 text-black"}`}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function DemoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const { isDark } = useTheme();
  return (
    <div className="mb-6">
      <p
        className={`text-sm font-semibold mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}
      >
        {label}
      </p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export function Components() {
  usePageMeta("디자인 컴포넌트");
  const { isDark } = useTheme();
  const [modalXs, setModalXs] = useState(false);
  const [modalSm, setModalSm] = useState(false);
  const [modalMd, setModalMd] = useState(false);
  const [modalLg, setModalLg] = useState(false);
  const [modalXl, setModalXl] = useState(false);

  return (
    <div
      className={`pt-16 pb-24 sm:pb-0 min-h-screen bg-background`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1
            className={`text-3xl sm:text-4xl font-bold mb-2 ${isDark ? "text-white" : "text-black"}`}
          >
            OpenPoll 디자인 시스템
          </h1>
          <p
            className={`text-base ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            프로젝트 전반에서 사용하는 공통 컴포넌트
          </p>
        </div>

        {/* ===== Button ===== */}
        <DemoSection title="Button">
          <DemoRow label="Variants">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
          </DemoRow>
          <DemoRow label="Sizes">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </DemoRow>
          <DemoRow label="States">
            <Button isLoading>로딩 중...</Button>
            <Button disabled>비활성화</Button>
            <Button variant="primary" rounded="full">
              Rounded Full
            </Button>
          </DemoRow>
          <DemoRow label="Full Width">
            <div className="w-full max-w-sm">
              <Button fullWidth>전체 너비 버튼</Button>
            </div>
          </DemoRow>
        </DemoSection>

        {/* ===== Badge ===== */}
        <DemoSection title="Badge">
          <DemoRow label="Variants">
            <Badge>Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="outline">Outline</Badge>
          </DemoRow>
          <DemoRow label="Sizes">
            <Badge size="sm">Small</Badge>
            <Badge size="md">Medium</Badge>
            <Badge size="lg">Large</Badge>
          </DemoRow>
        </DemoSection>

        {/* ===== Card ===== */}
        <DemoSection title="Card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card variant="default" padding="md">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  기본 카드 컴포넌트입니다. padding, variant 등을 조절할 수
                  있습니다.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="primary" size="sm">
                  Action
                </Button>
              </CardFooter>
            </Card>

            <Card variant="outline" padding="md" hoverable>
              <CardHeader>
                <CardTitle>Outline + Hoverable</CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  hover 시 elevation이 올라가며 scale이 커집니다.
                </p>
              </CardContent>
            </Card>

            <Card variant="glass" padding="md">
              <CardHeader>
                <CardTitle>Glass Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  반투명 유리 효과가 적용된 카드입니다.
                </p>
              </CardContent>
            </Card>

            <Card variant="gradient" padding="md">
              <CardHeader>
                <CardTitle>Gradient Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  그라디언트 배경이 적용된 카드입니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </DemoSection>

        {/* ===== Avatar ===== */}
        <DemoSection title="Avatar (New)">
          <DemoRow label="Sizes">
            <Avatar size="sm" />
            <Avatar size="md" />
            <Avatar size="lg" />
            <Avatar size="xl" />
          </DemoRow>
          <DemoRow label="With Initials">
            <Avatar size="sm" name="김" />
            <Avatar size="md" name="이민수" />
            <Avatar size="lg" name="박지현" />
          </DemoRow>
        </DemoSection>

        {/* ===== Input ===== */}
        <DemoSection title="Input (New)">
          <div className="max-w-md space-y-4">
            <Input placeholder="기본 입력" />
            <Input label="이메일" placeholder="email@example.com" icon={Mail} />
            <Input
              label="비밀번호"
              type="password"
              placeholder="비밀번호를 입력하세요"
              icon={Lock}
            />
            <Input
              label="에러 상태"
              placeholder="잘못된 입력"
              error="이메일 형식이 올바르지 않습니다."
              icon={Mail}
            />
            <Input
              label="검색"
              placeholder="검색어를 입력하세요"
              icon={Search}
              inputSize="sm"
            />
            <Input
              label="큰 입력"
              placeholder="Large input"
              inputSize="lg"
            />
          </div>
        </DemoSection>

        {/* ===== SectionHeader ===== */}
        <DemoSection title="SectionHeader (New)">
          <div className="space-y-6">
            <SectionHeader
              icon={CalendarCheck}
              title="출석체크"
              subtitle="매일 출석하고 포인트를 받으세요"
            />
            <SectionHeader
              icon={Shield}
              title="보안 설정"
              subtitle="계정 보안을 관리합니다"
              badge="필수"
            />
            <SectionHeader
              icon={Sparkles}
              title="구분선 포함"
              subtitle="withDivider 옵션"
              withDivider
            />
            <SectionHeader
              icon={Bell}
              title="중앙 정렬"
              subtitle="centered 옵션을 사용한 헤더"
              centered
            />
          </div>
        </DemoSection>

        {/* ===== StatsRow ===== */}
        <DemoSection title="StatsRow (New)">
          <div
            className={`rounded-2xl p-6 border ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
          >
            <StatsRow
              items={[
                { label: "누적 출석", value: 42, suffix: "일" },
                { label: "연속 출석", value: 7, suffix: "일" },
                { label: "보유 포인트", value: 1250, suffix: "P" },
              ]}
            />
          </div>
          <div
            className={`rounded-2xl p-6 border mt-4 ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
          >
            <StatsRow
              items={[
                { label: "총 투표", value: "3,482", suffix: "명" },
                { label: "오늘 참여", value: 156, suffix: "명" },
              ]}
            />
          </div>
        </DemoSection>

        {/* ===== Divider ===== */}
        <DemoSection title="Divider (New)">
          <div
            className={`rounded-2xl p-6 border ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
          >
            <p className={isDark ? "text-gray-300" : "text-gray-700"}>
              위 콘텐츠
            </p>
            <Divider spacing="sm" />
            <p
              className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              spacing=&quot;sm&quot;
            </p>
            <Divider spacing="md" />
            <p
              className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              spacing=&quot;md&quot; (기본)
            </p>
            <Divider spacing="lg" />
            <p
              className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              spacing=&quot;lg&quot;
            </p>
          </div>
        </DemoSection>

        {/* ===== ProgressBar ===== */}
        <DemoSection title="ProgressBar">
          <div className="space-y-4 max-w-lg">
            <ProgressBar value={75} max={100} showLabel labelPosition="inside" />
            <ProgressBar
              value={45}
              max={100}
              color="success"
              height="md"
              showLabel
              animated
            />
            <ProgressBar
              value={20}
              max={100}
              color="warning"
              height="sm"
            />
            <ProgressBar
              value={90}
              max={100}
              color="error"
              height="lg"
              showLabel
              showGlow
            />
          </div>
        </DemoSection>

        {/* ===== Modal ===== */}
        <DemoSection title="Modal (New)">
          <p
            className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            실제 프로젝트에서 사용하는 모달 크기를 기준으로 5가지 사이즈를
            제공합니다.
          </p>
          <DemoRow label="세로형 · 로그인모달형 · 기본형 · 가로형 · 뉴스카드형">
            <Button variant="outline" size="sm" onClick={() => setModalXs(true)}>
              세로형 (xs)
            </Button>
            <Button variant="outline" size="sm" onClick={() => setModalSm(true)}>
              로그인모달형 (sm)
            </Button>
            <Button variant="outline" size="sm" onClick={() => setModalMd(true)}>
              기본형 (md)
            </Button>
            <Button variant="outline" size="sm" onClick={() => setModalLg(true)}>
              가로형 (lg)
            </Button>
            <Button variant="outline" size="sm" onClick={() => setModalXl(true)}>
              뉴스카드형 (xl)
            </Button>
          </DemoRow>

          {/* xs: 세로형 — 280px, 컴팩트 알림/확인 팝업 */}
          <Modal isOpen={modalXs} onClose={() => setModalXs(false)} size="xs">
            <div className="px-6 pt-10 pb-6">
              <div className="flex justify-center mb-5">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    isDark ? "bg-red-500/10" : "bg-red-50"
                  }`}
                >
                  <AlertTriangle
                    className={`w-7 h-7 ${isDark ? "text-red-400" : "text-red-500"}`}
                  />
                </div>
              </div>
              <h3
                className={`text-xl font-bold text-center mb-2 ${isDark ? "text-white" : "text-black"}`}
              >
                삭제할까요?
              </h3>
              <p
                className={`text-sm text-center mb-8 leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="space-y-2.5">
                <button
                  onClick={() => setModalXs(false)}
                  className="w-full h-12 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors"
                >
                  삭제
                </button>
                <button
                  onClick={() => setModalXs(false)}
                  className={`w-full h-12 rounded-2xl font-bold text-sm border transition-colors ${
                    isDark
                      ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  취소
                </button>
              </div>
            </div>
          </Modal>

          {/* sm: 로그인모달형 — 350px */}
          <Modal isOpen={modalSm} onClose={() => setModalSm(false)} size="sm">
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isDark ? "bg-blue-500/15" : "bg-blue-50"
                  }`}
                >
                  <LogIn
                    className={`w-6 h-6 ${isDark ? "text-blue-400" : "text-blue-600"}`}
                  />
                </div>
              </div>
              <h3
                className={`text-xl font-bold text-center mb-1 ${isDark ? "text-white" : "text-black"}`}
              >
                로그인
              </h3>
              <p
                className={`text-sm text-center mb-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                실제 로그인 모달과 동일한 350px
              </p>
              <div className="space-y-4 mb-6">
                <Input
                  placeholder="your@email.com"
                  icon={Mail}
                  inputSize="md"
                />
                <Input
                  placeholder="비밀번호"
                  type="password"
                  icon={Lock}
                  inputSize="md"
                />
              </div>
              <Button
                fullWidth
                variant="primary"
                size="md"
                onClick={() => setModalSm(false)}
              >
                로그인
              </Button>
              <p
                className={`text-xs text-center mt-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                아직 계정이 없으신가요?{" "}
                <span
                  className={`font-semibold ${isDark ? "text-white" : "text-black"}`}
                >
                  회원가입
                </span>
              </p>
            </div>
          </Modal>

          {/* md: 기본형 — 420px */}
          <Modal isOpen={modalMd} onClose={() => setModalMd(false)} size="md">
            <div className="p-6">
              <SectionHeader
                icon={Shield}
                title="설정 변경"
                subtitle="420px — 기본 폼/설정용"
                withDivider
              />
              <div className="space-y-4 mb-6">
                <Input
                  label="닉네임"
                  placeholder="새로운 닉네임을 입력하세요"
                  icon={Users}
                />
                <Input
                  label="이메일"
                  placeholder="email@example.com"
                  icon={Mail}
                />
              </div>
              <StatsRow
                items={[
                  { label: "가입일", value: "30", suffix: "일째" },
                  { label: "보유 포인트", value: 1250, suffix: "P" },
                ]}
                className="mb-6"
              />
              <div className="flex gap-3">
                <Button
                  fullWidth
                  variant="primary"
                  size="md"
                  onClick={() => setModalMd(false)}
                >
                  저장
                </Button>
                <Button
                  fullWidth
                  variant="outline"
                  size="md"
                  onClick={() => setModalMd(false)}
                >
                  취소
                </Button>
              </div>
            </div>
          </Modal>

          {/* lg: 가로형 — 520px */}
          <Modal isOpen={modalLg} onClose={() => setModalLg(false)} size="lg">
            <div className="p-6">
              <SectionHeader
                icon={LayoutList}
                title="참여자 목록"
                subtitle="520px — 리스트/테이블용"
                withDivider
              />
              <div className="space-y-3 mb-6">
                {["김민수", "이지현", "박준영", "최서연"].map((name, i) => (
                  <div
                    key={name}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      isDark ? "bg-gray-800" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar size="sm" name={name} />
                      <div>
                        <p
                          className={`font-semibold text-sm ${isDark ? "text-white" : "text-black"}`}
                        >
                          {name}
                        </p>
                        <p
                          className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          {i === 0 ? "활동 중" : `${i * 3}시간 전`}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={i === 0 ? "success" : "outline"}
                      size="sm"
                    >
                      {i === 0 ? "온라인" : "오프라인"}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button
                fullWidth
                variant="primary"
                size="md"
                onClick={() => setModalLg(false)}
              >
                확인
              </Button>
            </div>
          </Modal>

          {/* xl: 뉴스카드형 — 720px, 실제 NewsCard와 동일한 비율 */}
          <Modal isOpen={modalXl} onClose={() => setModalXl(false)} size="xl">
            <div className="p-8 sm:p-10">
              <div className="mb-6 sm:mb-7">
                <div
                  className={`flex items-center justify-between pb-6 sm:pb-7 border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: isDark ? "#e5e7eb" : "#1f2937",
                      }}
                    >
                      <Newspaper
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        style={{ color: isDark ? "#1f2937" : "#ffffff" }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-base sm:text-lg ${isDark ? "text-white" : "text-black"}`}
                        >
                          OpenPoll 뉴스
                        </span>
                        <div className="w-4 h-4 min-w-4 rounded-full bg-blue-500 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      </div>
                      <span
                        className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        2시간 전
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-1.5 text-sm font-bold rounded-full ${isDark ? "bg-white text-black" : "bg-black text-white"}`}
                  >
                    정치
                  </span>
                </div>
              </div>

              <div className="py-6 sm:py-7">
                <h2
                  className={`text-xl sm:text-2xl font-bold mb-6 sm:mb-7 leading-tight ${isDark ? "text-white" : "text-black"}`}
                >
                  2026년 지방선거 사전투표율 역대 최고 기록
                </h2>

                <div className="space-y-3 mb-6 sm:mb-7">
                  {[
                    "전국 사전투표율이 32.5%를 기록하며 역대 최고치를 경신했습니다.",
                    "MZ세대 투표율이 전체 평균을 상회하는 것으로 나타났습니다.",
                    "정치 참여에 대한 관심이 높아지고 있다는 분석입니다.",
                  ].map((line, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 text-base ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      <span
                        className={`font-bold text-lg flex-shrink-0 ${isDark ? "text-gray-600" : "text-gray-400"}`}
                        style={{ lineHeight: "1.625" }}
                      >
                        ·
                      </span>
                      <span className="leading-relaxed">{line}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {["#선거", "#사전투표", "#MZ세대", "#민주주의"].map((tag) => (
                    <span
                      key={tag}
                      className={`text-sm sm:text-base font-medium ${isDark ? "text-blue-400" : "text-blue-600"}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <hr
                  className={`border-t mb-6 sm:mb-7 ${isDark ? "border-gray-800" : "border-gray-100"}`}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setModalXl(false)}
                    className={`flex-1 py-3 rounded-xl font-semibold text-base text-center transition-colors ${
                      isDark
                        ? "bg-white text-black hover:bg-gray-200"
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    전문 보기
                  </button>
                  <button
                    onClick={() => setModalXl(false)}
                    className={`px-6 py-3 rounded-xl font-semibold text-base transition-colors ${
                      isDark
                        ? "bg-gray-800 text-gray-100 hover:bg-gray-700"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        </DemoSection>

        {/* ===== EmptyState ===== */}
        <DemoSection title="EmptyState (New)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`rounded-2xl border ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
            >
              <EmptyState
                icon={Inbox}
                title="데이터가 없습니다"
                description="아직 등록된 항목이 없습니다."
              />
            </div>
            <div
              className={`rounded-2xl border ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
            >
              <EmptyState
                icon={Heart}
                title="즐겨찾기가 비어있어요"
                description="관심있는 항목을 추가해보세요."
                action={{
                  label: "둘러보기",
                  onClick: () => alert("Action!"),
                }}
              />
            </div>
          </div>
        </DemoSection>

        {/* ===== Composition Example ===== */}
        <DemoSection title="컴포넌트 조합 예시">
          <p
            className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            위 컴포넌트들을 조합하여 실제 UI 패턴을 구성하는 예시입니다.
          </p>

          {/* Example: Profile-like card */}
          <div
            className={`rounded-3xl border p-8 ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
          >
            <SectionHeader
              icon={TrendingUp}
              title="투표 통계"
              subtitle="이번 달 참여 현황"
              withDivider
            />

            <StatsRow
              items={[
                { label: "총 투표", value: 28, suffix: "회" },
                { label: "정확도", value: "72%", },
                { label: "포인트 획득", value: 840, suffix: "P" },
              ]}
              className="mb-6"
            />

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  이번 달 목표 달성률
                </span>
                <Badge variant="success">72%</Badge>
              </div>
              <ProgressBar value={72} max={100} color="success" height="sm" animated />
            </div>

            <Divider spacing="md" />

            <div className="flex gap-3">
              <Button variant="primary" fullWidth>
                자세히 보기
              </Button>
              <Button variant="ghost">공유</Button>
            </div>
          </div>
        </DemoSection>
      </div>
    </div>
  );
}
