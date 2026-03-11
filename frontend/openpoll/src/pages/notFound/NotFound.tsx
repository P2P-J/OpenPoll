import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useTheme } from "@/contexts/ThemeContext";

export function NotFound() {
  usePageMeta("페이지를 찾을 수 없습니다", "요청하신 페이지가 존재하지 않습니다.");
  const { isDark } = useTheme();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: isDark ? "#000" : "#fff", color: isDark ? "#fff" : "#000" }}
    >
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold mb-4" style={{ opacity: 0.15 }}>404</p>
        <h1 className="text-2xl sm:text-3xl font-bold mb-3">
          페이지를 찾을 수 없습니다
        </h1>
        <p
          className="text-base mb-8"
          style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
        >
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
          style={{
            backgroundColor: isDark ? "#fff" : "#000",
            color: isDark ? "#000" : "#fff",
          }}
        >
          <Home className="w-4 h-4" />
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
