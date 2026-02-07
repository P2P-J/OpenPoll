import { Sparkles, Newspaper } from "lucide-react";

export function LoadingState() {
  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-4 animate-pulse dark:text-white" />
        <p className="text-gray-600 dark:text-gray-400">뉴스를 불러오는 중...</p>
      </div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="text-center py-16">
      <Newspaper className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
      <p className="text-gray-500 dark:text-gray-400 font-medium">해당 카테고리의 뉴스가 없습니다.</p>
      <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">다른 카테고리를 선택해보세요.</p>
    </div>
  );
}
