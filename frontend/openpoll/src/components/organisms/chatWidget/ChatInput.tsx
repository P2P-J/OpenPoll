import { useState, useRef } from "react";
import { Send } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useTheme } from "@/contexts/ThemeContext";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

const MAX_LENGTH = 300;

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const { isAuthenticated } = useUser();
  const { isDark } = useTheme();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        className="flex items-center justify-center"
        style={{
          padding: "12px 16px",
          borderTop: `1px solid var(--color-border)`,
          color: "var(--color-foreground-muted)",
          fontSize: 13,
        }}
      >
        로그인 후 채팅에 참여하세요
      </div>
    );
  }

  return (
    <div
      className="flex items-center"
      style={{
        padding: "8px 12px",
        borderTop: `1px solid var(--color-border)`,
        gap: 8,
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          if (e.target.value.length <= MAX_LENGTH) {
            setValue(e.target.value);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder="메시지를 입력하세요..."
        disabled={disabled}
        style={{
          flex: 1,
          padding: "8px 12px",
          borderRadius: 8,
          border: `1px solid var(--color-border)`,
          backgroundColor: isDark
            ? "rgba(255,255,255,0.05)"
            : "rgba(0,0,0,0.03)",
          color: "var(--color-foreground)",
          fontSize: 14,
          outline: "none",
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={!value.trim() || disabled}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          borderRadius: 8,
          border: "none",
          cursor: value.trim() && !disabled ? "pointer" : "default",
          backgroundColor:
            value.trim() && !disabled
              ? "var(--color-primary)"
              : isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.08)",
          color:
            value.trim() && !disabled
              ? "var(--color-primary-foreground)"
              : "var(--color-foreground-muted)",
          transition: "background-color 0.15s, color 0.15s",
          flexShrink: 0,
        }}
      >
        <Send size={16} />
      </button>
    </div>
  );
}
