import { memo } from 'react';
import { motion } from 'motion/react';
import { useTheme } from '@/contexts/ThemeContext';

interface Stat {
  label: string;
  value: string;
}

interface StatsSectionProps {
  stats: readonly Stat[] | Stat[];
}

export const StatsSection = memo(function StatsSection({ stats }: StatsSectionProps) {
  const { isDark } = useTheme();

  return (
    <section className={`py-12 sm:py-16 lg:py-24 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="text-center"
            >
              <div className={`text-3xl sm:text-4xl font-bold mb-1 sm:mb-2 ${isDark ? 'text-white' : 'text-black'}`}>{stat.value}</div>
              <div className={`text-xs sm:text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});
