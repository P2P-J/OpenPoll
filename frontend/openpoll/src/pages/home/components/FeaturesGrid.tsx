import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, type LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  link: string;
  color: string;
}

interface FeaturesGridProps {
  features: readonly Feature[];
}

export const FeaturesGrid = memo(function FeaturesGrid({ features }: FeaturesGridProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-8 sm:mb-12 lg:mb-16"
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 dark:text-white">주요 기능</h2>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
          오픈폴과 함께 정치에 참여하는 새로운 방법
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <Link
              to={feature.link}
              className="group block h-full"
            >
              <div className={`relative h-full p-6 sm:p-8 rounded-2xl bg-gradient-to-br ${feature.color} text-white overflow-hidden transition-transform hover:scale-[1.02]`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12" />

                <div className="relative">
                  <feature.icon className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4" />
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-white/80 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold">
                    <span>시작하기</span>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
});
