import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Flame, Clock, CheckCircle, Users, ArrowRight } from "lucide-react";

import { issueApi } from "@/api";
import type { IssueListItem } from "@/types/issue.types";

function IssueCard({ issue }: { issue: IssueListItem }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // 핫이슈 판단 로직 (참여자 3000명 이상 또는 댓글 300개 이상)
  const isHotIssue = issue.participants >= 3000 || issue.comments >= 300;

  return (
    <Link
      to={`/balance/${issue.id}`}
      className="block group h-full"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div className="relative h-full preserve-3d" style={{ perspective: "1000px" }}>
        <motion.div
          className="relative w-full h-full"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front Side */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/10 group-hover:border-white/30 transition-all shadow-lg"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="relative p-6 sm:p-8 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                  <span className="text-4xl sm:text-5xl">{issue.emoji}</span>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold mb-1 group-hover:text-gray-300 transition-colors">
                      {issue.title}
                    </h3>
                  </div>
                </div>

                <div className="flex-shrink-0 ml-2 flex flex-col items-end space-y-2">
                  {isHotIssue && (
                    <div className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full text-xs font-bold animate-pulse">
                      <Flame className="w-3.5 h-3.5" />
                      <span>핫이슈!</span>
                    </div>
                  )}
                  {issue.voted && (
                    <div className="flex items-center space-x-1 px-3 py-1.5 bg-white/10 border border-white/20 text-white rounded-full text-xs font-bold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>완료</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-gray-400 text-sm sm:text-base mb-6 leading-relaxed flex-1">
                {issue.description}
              </p>

              {/* Stats - 강조된 참여자 수 */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">참여 인원</span>
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-white" />
                    <span className="font-bold text-2xl sm:text-3xl text-white">
                      {issue.participants.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-400 font-semibold">명</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-white font-bold text-sm group-hover:translate-x-1 transition-transform">
                  <span>투표하기</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Back Side */}
          <div
            className="absolute inset-0 bg-white rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-black shadow-lg"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="relative p-6 sm:p-8 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center space-x-3 sm:space-x-4 mb-6">
                <span className="text-4xl sm:text-5xl">{issue.emoji}</span>
                <h3 className="text-xl sm:text-2xl font-bold text-black">{issue.title}</h3>
              </div>

              {/* Vote Results */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-black rounded-full" />
                      <span className="text-sm font-semibold text-black">찬성</span>
                      <span className="text-2xl font-bold text-black">{issue.agreePercent}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-600">
                        {100 - issue.agreePercent}%
                      </span>
                      <span className="text-sm font-semibold text-gray-600">반대</span>
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    </div>
                  </div>

                  <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-black rounded-full transition-all duration-500"
                      style={{ width: `${issue.agreePercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-black/5 rounded-xl">
                    <div className="text-xs text-gray-600 font-semibold mb-1">찬성</div>
                    <div className="text-lg font-bold text-black">
                      {Math.round((issue.agreePercent / 100) * issue.participants).toLocaleString()}명
                    </div>
                  </div>
                  <div className="text-center p-3 bg-black/5 rounded-xl">
                    <div className="text-xs text-gray-600 font-semibold mb-1">반대</div>
                    <div className="text-lg font-bold text-gray-600">
                      {Math.round(((100 - issue.agreePercent) / 100) * issue.participants).toLocaleString()}명
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-300 mt-4">
                <div className="text-xs sm:text-sm text-gray-600 font-medium">
                  마우스를 떼면 다시 뒤집혀요
                </div>
                <div className="flex items-center space-x-2 text-black font-bold text-sm">
                  <span>클릭해서 투표</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Link>
  );
}

export function IssueList() {
  const location = useLocation();

  const [filter, setFilter] = useState<"hot" | "recent" | "completed">("hot");

  const [issues, setIssues] = useState<IssueListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filters = [
    { key: "hot" as const, label: "HOT", icon: Flame },
    { key: "recent" as const, label: "최신", icon: Clock },
    { key: "completed" as const, label: "참여완료", icon: CheckCircle },
  ];

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const data = await issueApi.getIssueList();
        if (!mounted) return;
        setIssues(data);
      } catch (e) {
        if (!mounted) return;
        setErrorMessage(e instanceof Error ? e.message : "이슈 목록을 불러오지 못했습니다.");
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [location.key]);

  const filteredIssues = useMemo(() => {
    if (filter === "completed") {
      return issues.filter((x) => x.voted);
    }

    if (filter === "recent") {
      // createdAt 있으면 최신순, 없으면 id 역순
      return [...issues].sort((a, b) => {
        const at = a.createdAt ? new Date(a.createdAt).getTime() : a.id;
        const bt = b.createdAt ? new Date(b.createdAt).getTime() : b.id;
        return bt - at;
      });
    }

    // hot
    return [...issues].sort((a, b) => {
      const aHot = (a.participants >= 3000 ? 100000 : 0) + a.participants + a.comments * 10;
      const bHot = (b.participants >= 3000 ? 100000 : 0) + b.participants + b.comments * 10;
      return bHot - aHot;
    });
  }, [issues, filter]);

  return (
    <div className="pt-16 min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
            밸런스 게임
          </h1>
          <p className="text-gray-400 text-base sm:text-lg lg:text-xl">
            정치 이슈에 대한 당신의 생각을 투표로 표현하세요
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center space-x-2 sm:space-x-3 mb-8 sm:mb-12"
        >
          {filters.map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`flex items-center space-x-1.5 sm:space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all ${
                filter === item.key
                  ? "bg-white text-black"
                  : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
              }`}
            >
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Loading / Error */}
        {isLoading && <div className="text-center text-gray-400 py-16">불러오는 중...</div>}
        {!isLoading && errorMessage && (
          <div className="text-center text-gray-400 py-16">{errorMessage}</div>
        )}

        {/* Issues Grid */}
        {!isLoading && !errorMessage && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredIssues.map((issue, index) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                style={{ minHeight: "280px" }}
              >
                <IssueCard issue={issue} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center text-gray-500 text-sm"
        >
          <p>💡 카드에 마우스를 올리면 투표 결과를 미리 볼 수 있어요</p>
        </motion.div>
      </div>
    </div>
  );
}