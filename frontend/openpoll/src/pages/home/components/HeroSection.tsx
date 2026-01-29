import { motion } from 'motion/react';

export function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-8 sm:mb-12 lg:mb-16 max-w-4xl mx-auto"
    >
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
        정치,
        <br />
        <span className="text-gray-400">이제는 쉽게</span>
      </h1>
      <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
        복잡한 정치 뉴스 대신, 중립적이고 순화된 정보를.
        <br className="hidden sm:block" />
        게임처럼 즐기며 정치 참여의 첫 걸음을 내딛어보세요.
      </p>
    </motion.div>
  );
}
