import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Home, Brain, Scale, Newspaper, BookOpen, ArrowRight } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useTheme } from "@/contexts/ThemeContext";
import { blogPosts } from "@/pages/blog/blogData";

const MAIN_SECTIONS = [
  { icon: Brain, label: "정치 DOS 테스트", path: "/dos", desc: "32문항으로 나의 정치적 좌표 찾기" },
  { icon: Scale, label: "밸런스 게임", path: "/balance", desc: "찬반 투표와 토론" },
  { icon: Newspaper, label: "AI 중립 뉴스", path: "/news", desc: "편향 없는 정치 뉴스" },
  { icon: BookOpen, label: "블로그", path: "/blog", desc: "정치 교양과 가이드" },
];

export function NotFound() {
  usePageMeta(
    "페이지를 찾을 수 없습니다",
    "요청하신 페이지가 존재하지 않습니다. OpenPoll의 주요 메뉴와 최신 글을 확인해 보세요.",
  );
  const { isDark } = useTheme();

  const latestPosts = useMemo(
    () =>
      [...blogPosts]
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 3),
    [],
  );

  const surfaceBorder = isDark ? "border-gray-800" : "border-gray-200";
  const surfaceBg = isDark ? "bg-gray-900/40" : "bg-white";
  const hoverBorder = isDark ? "hover:border-gray-500" : "hover:border-gray-400";
  const textMuted = isDark ? "text-gray-400" : "text-gray-600";
  const textSubtle = isDark ? "text-gray-500" : "text-gray-500";

  return (
    <div className="pt-16 min-h-screen pb-12 bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-10">
          <p className="text-7xl sm:text-8xl font-bold mb-3" style={{ opacity: 0.15 }}>
            404
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">
            페이지를 찾을 수 없습니다
          </h1>
          <p className={`text-base mb-6 ${textMuted}`}>
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
            아래의 주요 메뉴로 이동해 보세요.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
            style={{
              backgroundColor: isDark ? "#fff" : "#000",
              color: isDark ? "#000" : "#fff",
            }}
          >
            <Home className="w-4 h-4" />
            홈으로 돌아가기
          </Link>
        </div>

        {/* 주요 섹션 */}
        <section aria-labelledby="notfound-main-heading" className="mb-10">
          <h2
            id="notfound-main-heading"
            className="text-sm font-bold tracking-widest uppercase mb-4 text-foreground-muted"
          >
            주요 메뉴
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MAIN_SECTIONS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-start gap-3 p-4 rounded-xl border ${surfaceBorder} ${surfaceBg} ${hoverBorder} transition-colors`}
              >
                <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm sm:text-base">
                    {item.label}
                  </p>
                  <p className={`mt-0.5 text-xs sm:text-sm ${textMuted}`}>
                    {item.desc}
                  </p>
                </div>
                <ArrowRight
                  className={`w-4 h-4 mt-1 ${textSubtle} group-hover:translate-x-0.5 transition-transform`}
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </section>

        {/* 최신 블로그 글 */}
        <section aria-labelledby="notfound-latest-heading">
          <h2
            id="notfound-latest-heading"
            className="text-sm font-bold tracking-widest uppercase mb-4 text-foreground-muted"
          >
            최근 블로그 글
          </h2>
          <ul className={`border ${surfaceBorder} rounded-xl overflow-hidden ${surfaceBg}`}>
            {latestPosts.map((post, idx) => (
              <li key={post.slug} className={idx > 0 ? `border-t ${surfaceBorder}` : ""}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="flex items-center justify-between gap-3 p-4 hover:bg-foreground/5 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm sm:text-base truncate">
                      {post.title}
                    </p>
                    <p className={`mt-1 text-xs ${textSubtle}`}>
                      {post.category} · {post.date} · {post.readTime}
                    </p>
                  </div>
                  <ArrowRight className={`w-4 h-4 flex-shrink-0 ${textSubtle}`} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
