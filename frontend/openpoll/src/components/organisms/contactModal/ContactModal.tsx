import { useEffect, useRef, useState } from "react";
import { Send, MessageSquarePlus } from "lucide-react";
import { Modal } from "@/components/atoms/modal/Modal";
import { contactApi, getErrorMessage } from "@/api";
import { useUser } from "@/contexts/UserContext";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = "var(--color-primary)";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)";
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = "var(--color-border)";
    e.currentTarget.style.boxShadow = "none";
  },
};

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const { isAuthenticated } = useUser();
  const autoCloseTimer = useRef<number | null>(null);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<
    { type: "idle" } | { type: "success" } | { type: "error"; message: string }
  >({ type: "idle" });

  const subjectLength = subject.trim().length;
  const messageLength = message.trim().length;
  const isSubjectValid = subjectLength >= 3 && subjectLength <= 100;
  const isMessageValid = messageLength >= 10 && messageLength <= 2000;
  const canSubmit = isSubjectValid && isMessageValid && !isSubmitting;

  const clearAutoClose = () => {
    if (autoCloseTimer.current !== null) {
      window.clearTimeout(autoCloseTimer.current);
      autoCloseTimer.current = null;
    }
  };

  const resetForm = () => {
    setSubject("");
    setMessage("");
    setSubmitState({ type: "idle" });
  };

  const handleClose = () => {
    clearAutoClose();
    resetForm();
    onClose();
  };

  // 언마운트 시 타이머 정리
  useEffect(() => clearAutoClose, []);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setSubmitState({ type: "idle" });

    try {
      await contactApi.sendContact({
        subject: subject.trim(),
        message: message.trim(),
      });
      setSubmitState({ type: "success" });
      clearAutoClose();
      autoCloseTimer.current = window.setTimeout(() => {
        handleClose();
      }, 1800);
    } catch (err) {
      setSubmitState({ type: "error", message: getErrorMessage(err) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" title="문의하기">
      <div style={{ padding: "32px 28px 28px" }}>
        {/* Header */}
        <div className="flex items-center gap-3" style={{ marginBottom: 8 }}>
          <div
            className="flex items-center justify-center rounded-2xl"
            style={{
              width: 44,
              height: 44,
              background: "var(--color-primary)",
            }}
          >
            <MessageSquarePlus
              style={{
                width: 22,
                height: 22,
                color: "var(--color-primary-foreground)",
              }}
            />
          </div>
          <div>
            <h2
              className="text-foreground font-bold"
              style={{ fontSize: 20, lineHeight: 1.3 }}
            >
              문의하기
            </h2>
            <p
              className="text-foreground-muted"
              style={{ fontSize: 13, marginTop: 2 }}
            >
              OpenPoll 팀에게 직접 전달됩니다
            </p>
          </div>
        </div>

        {!isAuthenticated && (
          <div
            className="rounded-xl text-sm"
            style={{
              marginTop: 16,
              padding: "12px 16px",
              background: "var(--color-warning-bg, rgba(234,179,8,0.1))",
              color: "var(--color-warning, #ca8a04)",
              border: "1px solid var(--color-warning-border, rgba(234,179,8,0.2))",
            }}
          >
            로그인 후 문의하기를 이용하실 수 있습니다.
          </div>
        )}

        {isAuthenticated && (
          <>
            {/* Subject */}
            <div style={{ marginTop: 20 }}>
              <label
                className="text-foreground font-semibold"
                style={{ fontSize: 14, display: "block", marginBottom: 8 }}
              >
                제목
                <span
                  className="text-foreground-subtle font-normal"
                  style={{ fontSize: 12, marginLeft: 8 }}
                >
                  {subjectLength}/100
                </span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="[건의사항] 건의 제목 - 형식으로 작성하면 더 빠른 대처가 가능합니다!"
                maxLength={100}
                className="text-foreground border-default"
                style={{
                  width: "100%",
                  height: 48,
                  borderRadius: 14,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-secondary)",
                  padding: "0 16px",
                  fontSize: 14,
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                {...focusHandlers}
              />
            </div>

            {/* Message */}
            <div style={{ marginTop: 16 }}>
              <label
                className="text-foreground font-semibold"
                style={{ fontSize: 14, display: "block", marginBottom: 8 }}
              >
                내용
                <span
                  className="text-foreground-subtle font-normal"
                  style={{ fontSize: 12, marginLeft: 8 }}
                >
                  {messageLength}/2000
                </span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="건의사항, 개선 아이디어, 기능 요청, 오류 제보 등 무엇이든 자유롭게 작성해주세요. 구체적으로 작성할수록 더 빠르고 정확한 답변을 드릴 수 있습니다!"
                maxLength={2000}
                className="text-foreground"
                style={{
                  width: "100%",
                  height: 180,
                  borderRadius: 14,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-secondary)",
                  padding: "14px 16px",
                  fontSize: 14,
                  lineHeight: 1.6,
                  outline: "none",
                  resize: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                {...focusHandlers}
              />
              {messageLength > 0 && messageLength < 10 && (
                <p
                  style={{
                    fontSize: 12,
                    marginTop: 6,
                    color: "var(--color-error, #ef4444)",
                  }}
                >
                  내용은 10자 이상 작성해주세요.
                </p>
              )}
            </div>

            {/* Status messages */}
            {submitState.type === "success" && (
              <div
                className="rounded-xl text-sm font-medium"
                style={{
                  marginTop: 16,
                  padding: "12px 16px",
                  background: "var(--color-success-bg, rgba(34,197,94,0.1))",
                  color: "var(--color-success, #16a34a)",
                  border: "1px solid var(--color-success-border, rgba(34,197,94,0.2))",
                }}
              >
                문의가 성공적으로 전송되었습니다! 빠른 시일 내에 답변 드리겠습니다.
              </div>
            )}

            {submitState.type === "error" && (
              <div
                className="rounded-xl text-sm"
                style={{
                  marginTop: 16,
                  padding: "12px 16px",
                  background: "var(--color-error-bg, rgba(239,68,68,0.1))",
                  color: "var(--color-error, #ef4444)",
                  border: "1px solid var(--color-error-border, rgba(239,68,68,0.2))",
                }}
              >
                {submitState.message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex items-center justify-center gap-2 font-bold"
              style={{
                width: "100%",
                height: 50,
                marginTop: 20,
                borderRadius: 14,
                border: "none",
                background: canSubmit ? "var(--color-primary)" : "var(--color-secondary)",
                color: canSubmit
                  ? "var(--color-primary-foreground)"
                  : "var(--color-foreground-subtle)",
                fontSize: 15,
                cursor: canSubmit ? "pointer" : "not-allowed",
                transition: "all 0.2s",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? (
                <>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      border: "2px solid currentColor",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  전송 중...
                </>
              ) : (
                <>
                  <Send style={{ width: 16, height: 16 }} />
                  제출하기
                </>
              )}
            </button>

            <p
              className="text-foreground-subtle text-center"
              style={{ fontSize: 12, marginTop: 12 }}
            >
              15분 내 최대 3회까지 문의할 수 있습니다
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}
