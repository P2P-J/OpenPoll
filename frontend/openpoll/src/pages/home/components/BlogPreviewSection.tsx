import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { blogPosts } from "@/pages/blog/blogData";

export const BlogPreviewSection = memo(function BlogPreviewSection() {
  const latestPosts = useMemo(
    () =>
      [...blogPosts]
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 3),
    [],
  );

  return (
    <section
      className="py-16 sm:py-20 bg-background"
      aria-labelledby="blog-preview-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2 text-foreground-muted">
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              <span className="text-xs font-bold tracking-[0.3em] uppercase">
                BLOG
              </span>
            </div>
            <h2
              id="blog-preview-heading"
              className="text-2xl sm:text-3xl font-bold text-foreground"
            >
              정치 교양과 가이드
            </h2>
            <p className="mt-2 text-sm sm:text-base text-foreground-muted">
              복잡한 정치 개념을 쉽게 풀어 설명합니다.
            </p>
          </div>
          <Link
            to="/blog"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-foreground hover:opacity-70 transition-opacity whitespace-nowrap"
          >
            전체 글 보기
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {latestPosts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group flex flex-col p-5 sm:p-6 rounded-2xl bg-surface border border-default hover:border-foreground transition-colors"
            >
              <span className="self-start text-[11px] font-bold tracking-widest uppercase text-foreground-muted mb-3">
                {post.category}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug line-clamp-2 mb-2 group-hover:opacity-80 transition-opacity">
                {post.title}
              </h3>
              <p className="text-sm text-foreground-muted leading-relaxed line-clamp-3 mb-4 flex-1">
                {post.description}
              </p>
              <div className="flex items-center justify-between text-xs text-foreground-subtle">
                <time dateTime={post.date}>{post.date}</time>
                <span>{post.readTime}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 sm:hidden">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1 text-sm font-semibold text-foreground"
          >
            전체 글 보기
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
});
