import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { ContactModal } from "@/components/organisms/contactModal/ContactModal";

export function Footer() {
  const { isDark } = useTheme();
  const [isContactOpen, setIsContactOpen] = useState(false);
  return (
    <>
    <footer
      className="border-t py-8 px-4 sm:px-6 bg-surface border-default"
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src={isDark ? "/OPENPOLL-LARGE.png" : "/openpoll-black.png"}
              alt="OpenPoll 로고"
              className="w-8 h-8 object-contain"
              draggable={false}
            />
            <div>
              <p className="font-bold text-lg text-foreground">
                OpenPoll
              </p>
              <p className="text-sm text-foreground-muted">
                열린 여론조사 플랫폼
              </p>
            </div>
          </div>

          <nav
            className="flex flex-wrap text-sm"
            style={{ gap: "12px 24px" }}
            aria-label="푸터 링크"
          >
            <Link
              to="/privacy"
              className="transition-colors text-foreground-muted hover:text-foreground"
            >
              개인정보처리방침
            </Link>
            <Link
              to="/terms"
              className="transition-colors text-foreground-muted hover:text-foreground"
            >
              이용약관
            </Link>
            <button
              type="button"
              onClick={() => setIsContactOpen(true)}
              className="transition-colors text-foreground-muted hover:text-foreground"
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit" }}
            >
              문의하기
            </button>
          </nav>
        </div>

        <p className="text-xs mt-6 text-foreground-subtle">
          &copy; {new Date().getFullYear()} OpenPoll. All rights reserved.
        </p>
      </div>
    </footer>

      {isContactOpen && (
        <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      )}
    </>
  );
}
