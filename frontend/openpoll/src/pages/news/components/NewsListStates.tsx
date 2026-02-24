import { Sparkles, Newspaper } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function LoadingState() {
  const { isDark } = useTheme();
  return (
    <div className={`pt-16 min-h-screen flex items-center justify-center ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
      <div className="text-center">
        <Sparkles className={`w-12 h-12 mx-auto mb-4 animate-pulse ${isDark ? 'text-white' : 'text-black'}`} />
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>뉴스를 불러오는 중...</p>
      </div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  const { isDark } = useTheme();
  return (
    <div className={`pt-16 min-h-screen flex items-center justify-center ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
      <div className="text-center">
        <p className={`mb-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{message}</p>
        <button
          onClick={() => window.location.reload()}
          className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
            isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}

export function EmptyState() {
  const { isDark } = useTheme();
  return (
    <div className="text-center py-16">
      <Newspaper className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
      <p className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>해당 카테고리의 뉴스가 없습니다.</p>
      <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>다른 카테고리를 선택해보세요.</p>
    </div>
  );
}
