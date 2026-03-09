import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export const CTASection = memo(function CTASection() {
  const { isDark } = useTheme();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
      <div className={`${isDark ? 'bg-white text-black' : 'bg-black text-white'} rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center`}>
        <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">
          지금 바로 시작해보세요
        </h2>
        <p className={`text-lg sm:text-xl ${isDark ? 'text-gray-600' : 'text-gray-300'} mb-6 sm:mb-8`}>
          10분이면 나의 정치 성향을 알 수 있어요
        </p>
        <Link
          to="/dos"
          className={`inline-flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 ${isDark ? 'bg-black text-white hover:bg-gray-900' : 'bg-white text-black hover:bg-gray-100'} rounded-full font-semibold text-base sm:text-lg transition-colors`}
        >
          <span>DOS 테스트 시작</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </Link>
      </div>
    </section>
  );
});
