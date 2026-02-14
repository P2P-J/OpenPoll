import { useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { getCategoryFromTags } from "@/shared/utils/newsHelpers";
import { useArticleDetail } from "./hooks";
import {
  NewsDetailLoadingState,
  NewsDetailErrorState,
  BackButton,
  ArticleHeader,
  AINotice,
  SummarySection,
  TagList,
  Timestamp,
  OriginalLinkButton,
} from "./components";

const MARKDOWN_COMPONENTS: Components = {
  h3: ({ children }) => (
    <h3 className="text-xl sm:text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-gray-100">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 text-gray-800 dark:text-gray-200 leading-relaxed">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-gray-800 dark:text-gray-200 leading-relaxed">{children}</li>
  ),
};

export function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { article, isLoading, error } = useArticleDetail(id);
  usePageMeta(
    article ? article.refinedTitle : "뉴스 상세",
    article ? article.shortSummary : undefined
  );

  const handleGoBack = useCallback(() => navigate("/news"), [navigate]);

  const category = useMemo(
    () => (article ? getCategoryFromTags(article.relatedTags) : ""),
    [article]
  );

  if (isLoading) return <NewsDetailLoadingState />;
  if (error || !article) {
    return (
      <NewsDetailErrorState
        message={error || "뉴스를 찾을 수 없습니다."}
        onBack={handleGoBack}
      />
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      <div className="max-w-3xl mx-auto">
        <BackButton />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg mx-4 sm:mx-0 p-8 sm:p-10"
        >
          <ArticleHeader
            press={article.press}
            createdAt={article.createdAt}
            category={category}
          />

          <div className="py-8 sm:py-9">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 leading-tight dark:text-white">
              {article.refinedTitle}
            </h1>

            <AINotice />

            <article className="prose prose-base sm:prose-lg max-w-none text-gray-800 dark:text-gray-200 mb-8">
              <ReactMarkdown components={MARKDOWN_COMPONENTS}>
                {article.refinedSummary}
              </ReactMarkdown>
            </article>

            <SummarySection shortSummary={article.shortSummary} />
            <TagList tags={article.relatedTags} />
            <Timestamp createdAt={article.createdAt} />
            <OriginalLinkButton url={article.originalUrl} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
