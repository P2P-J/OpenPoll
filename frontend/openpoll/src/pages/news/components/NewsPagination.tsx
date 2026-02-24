import { useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const { isDark } = useTheme();

  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("ellipsis", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, "ellipsis");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, "ellipsis");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push("ellipsis", totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  const handlePrevious = useCallback(
    () => onPageChange(currentPage - 1),
    [currentPage, onPageChange]
  );
  const handleNext = useCallback(
    () => onPageChange(currentPage + 1),
    [currentPage, onPageChange]
  );

  return (
    <div className="flex items-center justify-center space-x-2">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={`p-2.5 rounded-xl border transition-all ${
          currentPage === 1
            ? isDark
              ? "border-gray-700 text-gray-600 cursor-not-allowed"
              : "border-gray-200 text-gray-300 cursor-not-allowed"
            : isDark
              ? "border-gray-600 text-gray-300 hover:bg-gray-800"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {pageNumbers.map((page, index) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className={`px-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[44px] h-11 px-3 rounded-xl font-semibold transition-all ${
              currentPage === page
                ? isDark
                  ? "bg-white text-black shadow-lg"
                  : "bg-black text-white shadow-lg"
                : isDark
                  ? "bg-gray-800 border border-gray-700 text-gray-300 hover:border-gray-500"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-gray-400"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`p-2.5 rounded-xl border transition-all ${
          currentPage === totalPages
            ? isDark
              ? "border-gray-700 text-gray-600 cursor-not-allowed"
              : "border-gray-200 text-gray-300 cursor-not-allowed"
            : isDark
              ? "border-gray-600 text-gray-300 hover:bg-gray-800"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
        }`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
