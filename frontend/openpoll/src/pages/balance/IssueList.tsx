import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Flame, Clock, CheckCircle, Users, MessageCircle, ChevronRight } from 'lucide-react';

const issues = [
  {
    id: 1,
    emoji: '💼',
    title: '주 4일제 도입',
    description: '근로시간을 주 32시간으로 단축하는 제도',
    participants: 2340,
    comments: 156,
    agreePercent: 62,
    voted: false,
  },
  {
    id: 2,
    emoji: '💰',
    title: '기본소득제 도입',
    description: '모든 국민에게 기본소득을 지급하는 제도',
    participants: 1892,
    comments: 203,
    agreePercent: 45,
    voted: true,
  },
  {
    id: 3,
    emoji: '🎓',
    title: '대학 등록금 동결 연장',
    description: '대학 등록금 동결 정책을 계속 이어가는 것',
    participants: 3104,
    comments: 284,
    agreePercent: 71,
    voted: false,
  },
  {
    id: 4,
    emoji: '🚗',
    title: '전기차 보조금 축소',
    description: '전기차 구매 시 지급하는 보조금을 줄이는 것',
    participants: 1567,
    comments: 98,
    agreePercent: 38,
    voted: false,
  },
  {
    id: 5,
    emoji: '📱',
    title: 'SNS 실명제 도입',
    description: 'SNS 사용 시 실명 인증을 의무화하는 제도',
    participants: 2891,
    comments: 412,
    agreePercent: 53,
    voted: true,
  },
  {
    id: 6,
    emoji: '🪖',
    title: '병역 의무 기간 단축',
    description: '군 복무 기간을 현재보다 단축하는 것',
    participants: 4203,
    comments: 534,
    agreePercent: 79,
    voted: false,
  },
];

export function IssueList() {
  const [filter, setFilter] = useState<'hot' | 'recent' | 'completed'>('hot');

  const filters = [
    { key: 'hot' as const, label: 'HOT', icon: Flame },
    { key: 'recent' as const, label: '최신', icon: Clock },
    { key: 'completed' as const, label: '참여완료', icon: CheckCircle },
  ];

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3">밸런스 게임</h1>
          <p className="text-gray-600 text-base sm:text-lg lg:text-xl">
            정치 이슈에 대한 당신의 생각을 투표로 표현하세요
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex space-x-2 mb-6 sm:mb-8 overflow-x-auto pb-2"
        >
          {filters.map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`flex-shrink-0 flex items-center space-x-1.5 sm:space-x-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-semibold text-sm sm:text-base transition-all ${
                filter === item.key
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Issues Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {issues.map((issue, index) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <Link
                to={`/balance/${issue.id}`}
                className="block group"
              >
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-black hover:border-gray-800 transition-all hover:shadow-2xl shadow-lg">
                  <div className="p-5 sm:p-6 lg:p-8">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      {/* Left: Emoji + Title */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-2 sm:mb-3">
                          <span className="text-4xl sm:text-5xl">{issue.emoji}</span>
                          <div className="flex-1">
                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 group-hover:text-gray-600 transition-colors">
                              {issue.title}
                            </h3>
                            <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                              {issue.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Status Badge */}
                      {issue.voted && (
                        <div className="flex-shrink-0 ml-2 sm:ml-4">
                          <div className="flex items-center space-x-1 sm:space-x-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-50 text-green-600 rounded-full text-xs sm:text-sm font-bold">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">참여완료</span>
                            <span className="sm:hidden">완료</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Vote Preview Bar */}
                    <div className="mb-3 sm:mb-4">
                      <div className="h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                          style={{ width: `${issue.agreePercent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1.5 sm:mt-2 text-xs sm:text-sm font-semibold">
                        <span className="text-blue-600">찬성 {issue.agreePercent}%</span>
                        <span className="text-red-600">반대 {100 - issue.agreePercent}%</span>
                      </div>
                    </div>

                    {/* Stats + CTA */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pt-3 sm:pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4 sm:space-x-6 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center space-x-1.5 sm:space-x-2">
                          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="font-semibold">
                            {issue.participants.toLocaleString()}명
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5 sm:space-x-2">
                          <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="font-semibold">
                            {issue.comments}개
                          </span>
                        </div>
                      </div>

                      <button className="flex items-center justify-center space-x-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-black text-white rounded-lg sm:rounded-xl font-bold text-sm sm:text-base hover:bg-gray-800 transition-all group-hover:scale-105">
                        <span>{issue.voted ? '결과 보기' : '투표하기'}</span>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}