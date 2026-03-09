import { motion } from "motion/react";
import { useTheme } from "@/contexts/ThemeContext";
import type { BalanceDetail } from "@/types/balance.types";

interface BalanceDetailHeroProps {
  issue: BalanceDetail;
}

export function BalanceDetailHero({ issue }: BalanceDetailHeroProps) {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl sm:rounded-3xl p-8 sm:p-12 border-2 mb-8 overflow-hidden ${isDark ? 'bg-gradient-to-br from-gray-900 to-black border-white/10' : 'bg-gradient-to-br from-gray-100 to-white border-black/10'}`}
    >
      <div className="relative text-center">
        <div className="text-7xl sm:text-8xl lg:text-9xl mb-6 leading-none">
          {issue.emoji}
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
          {issue.title}
        </h1>
        <p className={`text-base sm:text-lg leading-relaxed max-w-3xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {issue.description}
        </p>
      </div>
    </motion.div>
  );
}
