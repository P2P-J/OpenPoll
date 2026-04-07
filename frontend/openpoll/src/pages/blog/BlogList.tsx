import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "motion/react";
import { Clock, ChevronRight } from "lucide-react";
import { blogPosts } from "./blogData";

const CATEGORIES = ["전체", "가이드", "정치 교양", "기술"];

export function BlogList() {
  usePageMeta(
    "블로그 - OpenPoll 가이드",
    "정치 성향, 여론조사, 미디어 리터러시 등 정치 참여에 도움이 되는 가이드와 교양 콘텐츠를 제공합니다.",
  );
  const { isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const filteredPosts = useMemo(
    () =>
      selectedCategory === "전체"
        ? blogPosts
        : blogPosts.filter((p) => p.category === selectedCategory),
    [selectedCategory],
  );

  return (
    <div className="pt-16 min-h-screen pb-12 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className={`text-3xl sm:text-4xl font-bold mb-3 ${isDark ? "text-white" : "text-black"}`}>
          블로그
        </h1>
        <p className={`text-base sm:text-lg mb-8 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          정치 참여에 도움이 되는 가이드와 교양 콘텐츠
        </p>

        {/* 카테고리 필터 */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                selectedCategory === cat
                  ? isDark
                    ? "bg-white text-black"
                    : "bg-black text-white"
                  : isDark
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 글 목록 */}
        <div className="space-y-4">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/blog/${post.slug}`}
                className={`block rounded-2xl p-6 sm:p-8 border transition-shadow hover:shadow-lg ${
                  isDark
                    ? "bg-gray-900 border-gray-800 hover:border-gray-700"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
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
                </div>

                <h2 className={`text-lg sm:text-xl font-bold mb-2 ${isDark ? "text-white" : "text-black"}`}>
                  {post.title}
                </h2>
                <p className={`text-sm sm:text-base leading-relaxed mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {post.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    {post.date}
                  </span>
                  <span className={`flex items-center gap-1 text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    읽기
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
