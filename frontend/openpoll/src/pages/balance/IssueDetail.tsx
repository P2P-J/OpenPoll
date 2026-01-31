import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ChevronLeft,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Send,
  TrendingUp,
  Check,
} from "lucide-react";

import { issueApi, getErrorMessage } from "@/api";
import type { IssueDetail as IssueDetailType } from "@/types/issue.types";
import type { IssueVoteOption } from "@/api/issue.api";

function applyVoteOptimistic(
  issue: IssueDetailType,
  prevVote: IssueVoteOption | null,
  nextVote: IssueVoteOption | null
): IssueDetailType {
  // 현재 퍼센트 기반으로 대략적인 인원 수를 복원
  let agreeCount = Math.round((issue.totalVotes * issue.agreePercent) / 100);
  let disagreeCount = issue.totalVotes - agreeCount;
  let totalVotes = issue.totalVotes;

  // 이전 선택 제거
  if (prevVote === "agree") {
    agreeCount -= 1;
    totalVotes -= 1;
  }
  if (prevVote === "disagree") {
    disagreeCount -= 1;
    totalVotes -= 1;
  }

  // 다음 선택 추가
  if (nextVote === "agree") {
    agreeCount += 1;
    totalVotes += 1;
  }
  if (nextVote === "disagree") {
    disagreeCount += 1;
    totalVotes += 1;
  }

  // 안전장치
  agreeCount = Math.max(0, agreeCount);
  disagreeCount = Math.max(0, disagreeCount);
  totalVotes = Math.max(0, totalVotes);

  const agreePercent = totalVotes === 0 ? 0 : Math.round((agreeCount / totalVotes) * 100);
  const disagreePercent = 100 - agreePercent;

  return {
    ...issue,
    totalVotes,
    agreePercent,
    disagreePercent,
  };
}

export function IssueDetail() {
  const { id } = useParams();

  const [selectedOption, setSelectedOption] = useState<IssueVoteOption | null>(null);
  const [comment, setComment] = useState("");

  const [issue, setIssue] = useState<IssueDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const issueId = Number(id);
        if (!id || Number.isNaN(issueId)) throw new Error("잘못된 이슈 ID 입니다.");

        const data = await issueApi.getIssueDetail(issueId);
        if (!mounted) return;

        setIssue(data);
        // TODO: 백엔드 연동 후 "내가 이미 투표했는지"가 오면 여기서 selectedOption도 세팅
        setSelectedOption(data.myVote);
      } catch (e) {
        if (!mounted) return;
        setErrorMessage(getErrorMessage(e));
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleVote = async (option: IssueVoteOption) => {
    if (!issue || isVoting) return;

    const prevVote = selectedOption;
    const nextVote: IssueVoteOption | null = prevVote === option ? null : option;

    const prevIssue = issue;
    const nextIssue = applyVoteOptimistic(prevIssue, prevVote, nextVote);

    // ✅ optimistic UI: 먼저 반영
    setSelectedOption(nextVote);
    setIssue(nextIssue);

    try {
      setIsVoting(true);
      setErrorMessage(null);
      await issueApi.voteIssue(prevIssue.id, nextVote);
    } catch (e) {
      // ❌ 실패하면 롤백
      setSelectedOption(prevVote);
      setIssue(prevIssue);
      setErrorMessage(getErrorMessage(e));
    } finally {
      setIsVoting(false);
    }
  };

  const handleSubmitComment = async () => {
  if (!issue) return;
  if (!selectedOption) return;

  const content = comment.trim();
  if (!content) return;

  setComment("");

  try {
    const newComment = await issueApi.createComment(issue.id, {
      option: selectedOption,
      content,
    });

    setIssue((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        comments: [newComment, ...prev.comments],
      };
    });
  } catch (e) {
    setErrorMessage(getErrorMessage(e));
  }
};

  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen bg-black text-white pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-gray-400">
          불러오는 중...
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="pt-16 min-h-screen bg-black text-white pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            to="/balance"
            className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">목록으로</span>
          </Link>
          <div className="text-gray-400">{errorMessage}</div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="pt-16 min-h-screen bg-black text-white pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-gray-400">
          이슈를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-black text-white pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Button */}
        <Link
          to="/balance"
          className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">목록으로</span>
        </Link>

        {/* Issue Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl sm:rounded-3xl p-8 sm:p-12 border-2 border-white/10 mb-8 overflow-hidden"
        >
          <div className="relative text-center">
            <div className="text-6xl sm:text-7xl mb-6">{issue.emoji}</div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">{issue.title}</h1>
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
              {issue.description}
            </p>
          </div>
        </motion.div>

        {/* Voting + Results Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl sm:rounded-3xl p-8 sm:p-12 border-2 border-white/10 mb-8 overflow-hidden"
        >
          <div className="relative">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <TrendingUp className="w-6 h-6" />
              <h2 className="text-2xl sm:text-3xl font-bold">투표 현황</h2>
            </div>

            {/* Results Visualization */}
            <div className="mb-8">
              <div className="relative h-20 sm:h-24 bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                {/* Agree Side */}
                <div
                  className="absolute left-0 top-0 h-full bg-white flex items-center justify-start px-6 sm:px-8 transition-all duration-500"
                  style={{ width: `${issue.agreePercent}%` }}
                >
                  <div className="text-black">
                    <div className="flex items-center space-x-2 mb-1">
                      <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-bold text-sm sm:text-lg">찬성</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold">{issue.agreePercent}%</div>
                  </div>
                </div>

                {/* Disagree Side */}
                <div
                  className="absolute right-0 top-0 h-full bg-gray-800 flex items-center justify-end px-6 sm:px-8 transition-all duration-500"
                  style={{ width: `${issue.disagreePercent}%` }}
                >
                  <div className="text-white text-right">
                    <div className="flex items-center justify-end space-x-2 mb-1">
                      <span className="font-bold text-sm sm:text-lg">반대</span>
                      <ThumbsDown className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold">{issue.disagreePercent}%</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-4 sm:p-6 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-sm text-gray-400 font-semibold mb-2">찬성 인원</div>
                  <div className="text-2xl sm:text-3xl font-bold">
                    {Math.round((issue.agreePercent / 100) * issue.totalVotes).toLocaleString()}명
                  </div>
                </div>
                <div className="text-center p-4 sm:p-6 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-sm text-gray-400 font-semibold mb-2">반대 인원</div>
                  <div className="text-2xl sm:text-3xl font-bold">
                    {Math.round((issue.disagreePercent / 100) * issue.totalVotes).toLocaleString()}명
                  </div>
                </div>
              </div>
            </div>

            {/* Vote Buttons */}
            <div className="pt-6 border-t border-white/10">
              <h3 className="text-xl font-bold mb-4 text-center">당신의 선택은?</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleVote("agree")}
                  disabled={isVoting}
                  className={`relative p-6 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                    selectedOption === "agree"
                      ? "bg-white text-black border-2 border-white"
                      : "bg-white/10 text-white border-2 border-white/20 hover:bg-white/20"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <ThumbsUp className="w-8 h-8" />
                    <span className="font-bold text-lg">찬성</span>
                    {selectedOption === "agree" && (
                      <div className="flex items-center space-x-1 text-sm">
                        <Check className="w-4 h-4" />
                        <span>선택됨</span>
                      </div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => handleVote("disagree")}
                  disabled={isVoting}
                  className={`relative p-6 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                    selectedOption === "disagree"
                      ? "bg-white text-black border-2 border-white"
                      : "bg-white/10 text-white border-2 border-white/20 hover:bg-white/20"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <ThumbsDown className="w-8 h-8" />
                    <span className="font-bold text-lg">반대</span>
                    {selectedOption === "disagree" && (
                      <div className="flex items-center space-x-1 text-sm">
                        <Check className="w-4 h-4" />
                        <span>선택됨</span>
                      </div>
                    )}
                  </div>
                </button>
              </div>

              {selectedOption && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center"
                >
                  <p className="text-sm text-gray-400">
                    💡 다시 클릭하면 투표를 취소할 수 있어요
                  </p>
                </motion.div>
              )}
            </div>

            <div className="text-center py-4 mt-6 border-t border-white/10">
              <p className="text-gray-400">
                총{" "}
                <span className="font-bold text-white text-lg">
                  {issue.totalVotes.toLocaleString()}명
                </span>
                이 참여했습니다
              </p>
            </div>
          </div>
        </motion.div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl sm:rounded-3xl p-8 border-2 border-white/10 overflow-hidden"
        >
          <div className="relative">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">댓글 {issue.comments.length}개</h2>

            {/* Comment Input */}
            <div className="mb-8">
              <div className="flex items-start space-x-3">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedOption === "agree"
                      ? "bg-white/20 border border-white/30"
                      : selectedOption === "disagree"
                      ? "bg-white/10 border border-white/20"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  {selectedOption === "agree" ? (
                    <ThumbsUp className="w-5 h-5" />
                  ) : selectedOption === "disagree" ? (
                    <ThumbsDown className="w-5 h-5" />
                  ) : (
                    <span className="text-xs">?</span>
                  )}
                </div>

                <div className="flex-1">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={selectedOption ? "의견을 남겨주세요..." : "투표 후 댓글을 작성할 수 있어요"}
                    disabled={!selectedOption}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 resize-none text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    rows={3}
                  />

                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">{!selectedOption && "⚠️ 투표를 먼저 해주세요"}</span>
                    <button
                      onClick={handleSubmitComment}
                      disabled={!comment.trim() || !selectedOption}
                      className="flex items-center space-x-2 px-6 py-2.5 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                      <span>댓글 작성</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {issue.comments.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 sm:p-5 bg-white/5 border border-white/10 rounded-xl"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        c.option === "agree"
                          ? "bg-white/10 border border-white/20"
                          : "bg-white/5 border border-white/10"
                      }`}
                    >
                      {c.option === "agree" ? (
                        <ThumbsUp className="w-5 h-5" />
                      ) : (
                        <ThumbsDown className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold">{c.author}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            c.option === "agree"
                              ? "bg-white/10 text-white"
                              : "bg-white/5 text-gray-400"
                          }`}
                        >
                          {c.option === "agree" ? "찬성" : "반대"}
                        </span>
                        <span className="text-sm text-gray-500">{c.createdAt}</span>
                      </div>

                      <p className="text-gray-300 leading-relaxed mb-3 text-sm sm:text-base">
                        {c.content}
                      </p>

                      <button className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors">
                        <Heart className="w-4 h-4" />
                        <span className="font-medium">{c.likes}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}