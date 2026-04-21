import { useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useStructuredData } from "@/hooks/useStructuredData";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { ChevronLeft, Clock, Calendar } from "lucide-react";
import { getBlogPost, blogPosts } from "./blogData";
import { AdBanner } from "@/components/atoms/adBanner/AdBanner";
import { Breadcrumb } from "@/components/molecules/breadcrumb";

export function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const post = getBlogPost(slug || "");

  usePageMeta(
    post ? `${post.title} - OpenPoll 블로그` : "블로그 - OpenPoll",
    post?.description,
  );
  useStructuredData(post ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: "OpenPoll 편집팀",
      url: "https://www.openpoll.co.kr/about",
    },
    publisher: {
      "@type": "Organization",
      name: "OpenPoll",
      logo: { "@type": "ImageObject", url: "https://www.openpoll.co.kr/OPENPOLL-LARGE.png" },
    },
    mainEntityOfPage: `https://www.openpoll.co.kr/blog/${post.slug}`,
    inLanguage: "ko-KR",
    articleSection: post.category,
  } : null);

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return blogPosts
      .filter((p) => p.slug !== post.slug && p.category === post.category)
      .slice(0, 3);
  }, [post]);

  const MARKDOWN_COMPONENTS: Components = useMemo(
    () => ({
      h2: ({ children }) => (
        <h2 className={`text-xl sm:text-2xl font-bold mt-8 mb-4 ${isDark ? "text-white" : "text-black"}`}>
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3 className={`text-lg sm:text-xl font-bold mt-6 mb-3 ${isDark ? "text-gray-100" : "text-gray-900"}`}>
          {children}
        </h3>
      ),
      p: ({ children }) => (
        <p className={`mb-4 leading-relaxed text-base sm:text-lg ${isDark ? "text-gray-300" : "text-gray-700"}`}>
          {children}
        </p>
      ),
      ul: ({ children }) => (
        <ul className="list-disc list-inside mb-4 space-y-2 ml-2">{children}</ul>
      ),
      ol: ({ children }) => (
        <ol className="list-decimal list-inside mb-4 space-y-2 ml-2">{children}</ol>
      ),
      li: ({ children }) => (
        <li className={`leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>{children}</li>
      ),
    }),
    [isDark],
  );

  if (!post) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className={`mb-4 text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            글을 찾을 수 없습니다.
          </p>
          <button
            type="button"
            onClick={() => navigate("/blog")}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
              isDark ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            블로그 목록으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen pb-12 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Breadcrumb
          className="mb-4"
          items={[
            { label: "홈", href: "/" },
            { label: "블로그", href: "/blog" },
            { label: post.title },
          ]}
        />

        <Link
          to="/blog"
          className={`inline-flex items-center space-x-2 mb-8 transition-colors ${
            isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-black"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">블로그 목록</span>
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                isDark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"
              }`}
            >
              {post.category}
            </span>
            <span className={`flex items-center gap-1 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              <Clock className="w-3 h-3" />
              {post.readTime}
            </span>
            <span className={`flex items-center gap-1 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              <Calendar className="w-3 h-3" />
              {post.date}
            </span>
          </div>

          <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 leading-tight ${isDark ? "text-white" : "text-black"}`}>
            {post.title}
          </h1>

          <p className={`text-base sm:text-lg mb-8 leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {post.description}
          </p>

          <hr className={`mb-8 ${isDark ? "border-gray-800" : "border-gray-200"}`} />

          <div className="prose prose-base sm:prose-lg max-w-none">
            <ReactMarkdown components={MARKDOWN_COMPONENTS}>
              {post.content}
            </ReactMarkdown>
          </div>

          <AdBanner className="mt-8" />

          {/* 저자 박스 */}
          <aside
            className={`mt-10 p-5 sm:p-6 rounded-2xl border ${
              isDark ? "border-gray-800 bg-gray-900/40" : "border-gray-200 bg-gray-50"
            }`}
            aria-label="작성자 정보"
          >
            <div className="flex items-start gap-4">
              <img
                src={isDark ? "/OPENPOLL-LARGE.png" : "/openpoll-black.png"}
                alt="OpenPoll 로고"
                className="w-12 h-12 rounded-lg object-contain flex-shrink-0"
                loading="lazy"
              />
              <div className="min-w-0">
                <p className={`font-bold text-base ${isDark ? "text-white" : "text-black"}`}>
                  OpenPoll 편집팀
                </p>
                <p className={`mt-1 text-sm leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  정치·선거·민주주의를 쉽게 풀어 쓰는 OpenPoll 편집팀입니다.
                  어떤 정당이나 입장도 지지하지 않으며, 공개된 자료와 제도를 근거로 중립적인 관점에서 글을 작성합니다.
                </p>
                <div className={`mt-2 text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                  <span>발행일 {post.date}</span>
                  <span className="mx-2">·</span>
                  <Link
                    to="/about"
                    className={`underline-offset-2 hover:underline ${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    OpenPoll 소개
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* 관련 글 */}
          {relatedPosts.length > 0 && (
            <section
              className="mt-10"
              aria-labelledby="related-posts-heading"
            >
              <h2
                id="related-posts-heading"
                className={`text-lg sm:text-xl font-bold mb-4 ${isDark ? "text-white" : "text-black"}`}
              >
                관련 글
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {relatedPosts.map((p) => (
                  <Link
                    key={p.slug}
                    to={`/blog/${p.slug}`}
                    className={`group flex flex-col p-4 rounded-xl border transition-colors ${
                      isDark
                        ? "border-gray-800 hover:border-gray-600 bg-gray-900/30"
                        : "border-gray-200 hover:border-gray-400 bg-white"
                    }`}
                  >
                    <span
                      className={`self-start text-[11px] font-bold tracking-widest uppercase mb-2 ${
                        isDark ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      {p.category}
                    </span>
                    <span
                      className={`text-sm sm:text-base font-semibold leading-snug line-clamp-2 mb-2 ${
                        isDark ? "text-white" : "text-black"
                      }`}
                    >
                      {p.title}
                    </span>
                    <span
                      className={`text-xs leading-relaxed line-clamp-2 mb-3 flex-1 ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {p.description}
                    </span>
                    <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                      {p.date} · {p.readTime}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className={`mt-10 pt-6 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
            <p className={`text-sm mb-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              이 글이 도움이 되셨나요? OpenPoll에서 직접 참여해 보세요.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/dos"
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isDark ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                DOS 테스트 하기
              </Link>
              <Link
                to="/balance"
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isDark ? "bg-gray-800 text-gray-200 hover:bg-gray-700" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                밸런스 게임 참여
              </Link>
              <Link
                to="/news"
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isDark ? "bg-gray-800 text-gray-200 hover:bg-gray-700" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                AI 중립 뉴스 읽기
              </Link>
            </div>
          </div>
        </motion.article>
      </div>
    </div>
  );
}
