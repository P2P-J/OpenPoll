import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Users, MessageCircle, ChevronRight, CheckCircle } from 'lucide-react';
import { Card, Badge, ProgressBar } from '@/components/atoms';

export interface IssueCardProps {
  id: number;
  emoji: string;
  title: string;
  description: string;
  participants: number;
  comments: number;
  agreePercent: number;
  voted: boolean;
  animationDelay?: number;
}

export function IssueCard({
  id,
  emoji,
  title,
  description,
  participants,
  comments,
  agreePercent,
  voted,
  animationDelay = 0,
}: IssueCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
    >
      <Link to={`/balance/${id}`} className="block group">
        <Card variant="gradient" hoverable className="shadow-lg">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            {/* Left: Emoji + Title */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-2 sm:mb-3">
                <span className="text-4xl sm:text-5xl">{emoji}</span>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 group-hover:text-gray-600 transition-colors">
                    {title}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                    {description}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Status Badge */}
            {voted && (
              <div className="flex-shrink-0 ml-2 sm:ml-4">
                <Badge variant="success" size="md">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">참여완료</span>
                  <span className="sm:hidden">완료</span>
                </Badge>
              </div>
            )}
          </div>

          {/* Vote Preview Bar */}
          <div className="mb-3 sm:mb-4">
            <div className="h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                style={{ width: `${agreePercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5 sm:mt-2 text-xs sm:text-sm font-semibold">
              <span className="text-blue-600">찬성 {agreePercent}%</span>
              <span className="text-red-600">반대 {100 - agreePercent}%</span>
            </div>
          </div>

          {/* Stats + CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pt-3 sm:pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4 sm:space-x-6 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-semibold">{participants.toLocaleString()}명</span>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-semibold">{comments}개</span>
              </div>
            </div>

            <button className="flex items-center justify-center space-x-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-black text-white rounded-lg sm:rounded-xl font-bold text-sm sm:text-base hover:bg-gray-800 transition-all group-hover:scale-105">
              <span>{voted ? '결과 보기' : '투표하기'}</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
