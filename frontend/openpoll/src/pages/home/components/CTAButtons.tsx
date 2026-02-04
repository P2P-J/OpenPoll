import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export const CTAButtons = memo(function CTAButtons() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4"
    >
      <Link
        to="/dos"
        className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-black rounded-full font-semibold text-base sm:text-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
      >
        <span>정치 DOS 시작하기</span>
        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
      </Link>
      <Link
        to="/balance"
        className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold text-base sm:text-lg hover:bg-white hover:text-black transition-colors"
      >
        밸런스 게임 참여하기
      </Link>
    </motion.div>
  );
});
