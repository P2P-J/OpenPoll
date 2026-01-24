import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ThumbsUp, ThumbsDown, Heart, Send, TrendingUp } from 'lucide-react';

export function IssueDetail() {
  const { id } = useParams();
  const [voted, setVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'agree' | 'disagree' | null>(null);
  const [comment, setComment] = useState('');

  const issue = {
    emoji: '💼',
    title: '주 4일제 도입',
    description: '주 4일 근무제는 근로시간을 주 32시간으로 단축하여 근로자의 삶의 질을 개선하고, 생산성 향상을 도모하는 제도입니다. 이미 일부 국가와 기업에서 시범 운영 중이며, 긍정적인 결과가 보고되고 있습니다.',
    agreeReason: '워라밸 개선과 생산성 향상',
    disagreeReason: '경영 부담과 현실적 어려움',
    totalVotes: 2340,
    agreePercent: 62,
    disagreePercent: 38,
  };

  const comments = [
    {
      id: 1,
      author: 'user123',
      option: 'agree',
      content: '실제로 도입한 기업들의 사례를 보면 생산성이 오히려 증가했다는 연구 결과가 많습니다. 근로자의 만족도도 크게 올라갔고요.',
      likes: 24,
      createdAt: '2시간 전',
    },
    {
      id: 2,
      author: 'user456',
      option: 'disagree',
      content: '제조업 특성상 현실적으로 어렵다고 봅니다. 교대 근무를 어떻게 운영할지, 인건비는 어떻게 처리할지 해결해야 할 문제가 너무 많아요.',
      likes: 18,
      createdAt: '3시간 전',
    },
    {
      id: 3,
      author: 'user789',
      option: 'agree',
      content: '장기적으로 보면 출산율 증가, 일자리 창출 등 긍정적 효과가 더 클 것 같습니다. 단계적으로 도입하면 충분히 가능하다고 생각해요.',
      likes: 15,
      createdAt: '5시간 전',
    },
  ];

  const handleVote = (option: 'agree' | 'disagree') => {
    setSelectedOption(option);
    setVoted(true);
    // Scroll to results smoothly
    setTimeout(() => {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }, 500);
  };

  const handleSubmitComment = () => {
    if (!comment.trim()) return;
    // Submit comment logic
    setComment('');
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50 pb-24">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to="/balance"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-black mb-8 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">목록으로</span>
        </Link>

        {/* Issue Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 mb-8"
        >
          <div className="text-center">
            <div className="text-7xl mb-6">{issue.emoji}</div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">{issue.title}</h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
              {issue.description}
            </p>
          </div>
        </motion.div>

        {/* Voting Section */}
        <AnimatePresence mode="wait">
          {!voted ? (
            <motion.div
              key="voting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold mb-6 text-center">
                당신의 선택은?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Agree Button */}
                <motion.button
                  onClick={() => handleVote('agree')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 sm:p-12 text-white transition-all hover:shadow-2xl"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12" />
                  
                  <div className="relative text-center">
                    <ThumbsUp className="w-16 h-16 mb-6 mx-auto" />
                    <h3 className="text-3xl sm:text-4xl font-bold mb-4">찬성</h3>
                    <p className="text-lg text-blue-100 leading-relaxed">
                      {issue.agreeReason}
                    </p>
                    <div className="mt-6 text-sm font-semibold opacity-75">
                      현재 {issue.agreePercent}%가 찬성 중
                    </div>
                  </div>
                </motion.button>

                {/* Disagree Button */}
                <motion.button
                  onClick={() => handleVote('disagree')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-8 sm:p-12 text-white transition-all hover:shadow-2xl"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12" />
                  
                  <div className="relative text-center">
                    <ThumbsDown className="w-16 h-16 mb-6 mx-auto" />
                    <h3 className="text-3xl sm:text-4xl font-bold mb-4">반대</h3>
                    <p className="text-lg text-red-100 leading-relaxed">
                      {issue.disagreeReason}
                    </p>
                    <div className="mt-6 text-sm font-semibold opacity-75">
                      현재 {issue.disagreePercent}%가 반대 중
                    </div>
                  </div>
                </motion.button>
              </div>
              <p className="text-center text-gray-500 mt-6 text-sm">
                💡 투표하면 결과와 다른 사람들의 의견을 볼 수 있어요
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 mb-8"
            >
              <div className="flex items-center justify-center space-x-3 mb-6">
                <TrendingUp className="w-6 h-6 text-gray-600" />
                <h2 className="text-3xl font-bold">투표 결과</h2>
              </div>
              
              {/* Results Visualization */}
              <div className="mb-8">
                <div className="relative h-24 bg-gray-100 rounded-2xl overflow-hidden">
                  {/* Agree Side */}
                  <motion.div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-start px-8"
                    initial={{ width: 0 }}
                    animate={{ width: `${issue.agreePercent}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  >
                    <div className="text-white">
                      <div className="flex items-center space-x-2 mb-1">
                        <ThumbsUp className="w-5 h-5" />
                        <span className="font-bold text-lg">찬성</span>
                      </div>
                      <div className="text-3xl font-bold">{issue.agreePercent}%</div>
                    </div>
                  </motion.div>

                  {/* Disagree Side */}
                  <motion.div
                    className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-500 to-red-600 flex items-center justify-end px-8"
                    initial={{ width: 0 }}
                    animate={{ width: `${issue.disagreePercent}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  >
                    <div className="text-white text-right">
                      <div className="flex items-center justify-end space-x-2 mb-1">
                        <span className="font-bold text-lg">반대</span>
                        <ThumbsDown className="w-5 h-5" />
                      </div>
                      <div className="text-3xl font-bold">{issue.disagreePercent}%</div>
                    </div>
                  </motion.div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-sm text-blue-600 font-semibold mb-1">찬성 인원</div>
                    <div className="text-2xl font-bold text-blue-700">
                      {Math.round((issue.agreePercent / 100) * issue.totalVotes).toLocaleString()}명
                    </div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-xl">
                    <div className="text-sm text-red-600 font-semibold mb-1">반대 인원</div>
                    <div className="text-2xl font-bold text-red-700">
                      {Math.round((issue.disagreePercent / 100) * issue.totalVotes).toLocaleString()}명
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center py-4 border-t border-gray-100">
                <p className="text-gray-600">
                  총 <span className="font-bold text-black text-lg">{issue.totalVotes.toLocaleString()}명</span>이 참여했습니다
                </p>
                {selectedOption && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full"
                  >
                    {selectedOption === 'agree' ? (
                      <>
                        <ThumbsUp className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-blue-600">나는 찬성에 투표했어요</span>
                      </>
                    ) : (
                      <>
                        <ThumbsDown className="w-4 h-4 text-red-600" />
                        <span className="font-semibold text-red-600">나는 반대에 투표했어요</span>
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comments Section */}
        {voted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-8 border border-gray-100"
          >
            <h2 className="text-2xl font-bold mb-6">
              댓글 {comments.length}개
            </h2>

            {/* Comment Input */}
            <div className="mb-8">
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedOption === 'agree' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {selectedOption === 'agree' ? (
                    <ThumbsUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <ThumbsDown className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="의견을 남겨주세요..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleSubmitComment}
                      disabled={!comment.trim()}
                      className="flex items-center space-x-2 px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      comment.option === 'agree' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {comment.option === 'agree' ? (
                        <ThumbsUp className="w-5 h-5 text-green-600" />
                      ) : (
                        <ThumbsDown className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold">{comment.author}</span>
                        <span className="text-sm text-gray-500">
                          {comment.createdAt}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        {comment.content}
                      </p>
                      <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-black transition-colors">
                        <Heart className="w-4 h-4" />
                        <span className="font-medium">{comment.likes}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}