import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { dosApi } from "@/api";
import type { DosQuestion } from "@/types/api.types";

const ERROR_REDIRECT_DELAY_MS = 2000;
const FOCUS_DELAY_MS = 100;

export interface ToastState {
  show: boolean;
  message: string;
  type: "info" | "success" | "error";
}

export interface UseDosQuestionsReturn {
  questions: DosQuestion[];
  isLoading: boolean;
  showErrorToast: (message: string) => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const useDosQuestions = (
  navigate: ReturnType<typeof useNavigate>,
  setToast: (state: ToastState) => void
): UseDosQuestionsReturn => {
  const [questions, setQuestions] = useState<DosQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const showErrorToast = useCallback(
    (message: string) => {
      setToast({ show: true, message, type: "error" });
    },
    [setToast]
  );

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await dosApi.getQuestions();
        setQuestions(shuffleArray(data));
      } catch {
        showErrorToast("질문을 불러오는데 실패했습니다");
        setTimeout(() => navigate("/dos"), ERROR_REDIRECT_DELAY_MS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [navigate, showErrorToast]);

  return { questions, isLoading, showErrorToast };
};

export const useScrollLock = () => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);
};

export const useAutoFocus = (isLoading: boolean, hasQuestions: boolean) => {
  useEffect(() => {
    if (!isLoading && hasQuestions) {
      const focusableDiv = document.getElementById("dos-test-container");
      if (focusableDiv) {
        setTimeout(() => focusableDiv.focus(), FOCUS_DELAY_MS);
      }
    }
  }, [isLoading, hasQuestions]);
};

export const useKeyboardShortcuts = (
  questions: DosQuestion[],
  currentQuestion: number,
  canGoNext: boolean,
  handlePrev: () => void,
  handleNext: () => void,
  handleAnswer: (questionId: number, value: number) => void
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!questions.length || currentQuestion >= questions.length) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        if (canGoNext) handleNext();
      } else if (event.key >= "1" && event.key <= "7") {
        event.preventDefault();
        const answerValue = parseInt(event.key) - 4;
        handleAnswer(questions[currentQuestion].id, answerValue);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentQuestion,
    canGoNext,
    questions,
    handlePrev,
    handleNext,
    handleAnswer,
  ]);
};

export const convertAnswerToBackendFormat = (value: number): number =>
  value + 4;
