import { memo } from 'react';
import { motion } from 'motion/react';

interface Stat {
  label: string;
  value: string;
}

interface StatsSectionProps {
  stats: readonly Stat[];
}

export const StatsSection = memo(function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section className="bg-gray-50 dark:bg-gray-950 py-12 sm:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2 dark:text-white">{stat.value}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});
