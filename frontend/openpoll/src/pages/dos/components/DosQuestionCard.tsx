import { motion } from "motion/react";
import type { DosQuestion } from "@/types/api.types";

const SCALE_LABELS = [
  "전혀 그렇지 않다",
  "그렇지 않다",
  "약간 그렇지 않다",
  "보통이다",
  "약간 그렇다",
  "그렇다",
  "매우 그렇다",
] as const;

interface DosQuestionCardProps {
  question: DosQuestion;
  answer: number | undefined;
  onAnswer: (questionId: number, value: number) => void;
  isActive: boolean;
}

export function DosQuestionCard({
  question,
  answer,
  onAnswer,
  isActive,
}: DosQuestionCardProps) {
  return (
    <div className="w-full h-full flex items-center justify-center px-2 sm:px-4">
      <div
        className={`question-card ${isActive ? "question-card-active" : ""}`}
      >
        <h2 className="question-text">{question.question}</h2>

        <div className="answer-buttons-container">
          {SCALE_LABELS.map((label, labelIndex) => {
            const value = labelIndex - 3;
            const isSelected = answer === value;

            return (
              <button
                key={labelIndex}
                onClick={() => isActive && onAnswer(question.id, value)}
                disabled={!isActive}
                className={`answer-button ${isSelected ? "answer-button-selected" : "answer-button-default"} ${!isActive ? "cursor-default" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="answer-label">{label}</span>
                  <div
                    className={`answer-radio ${isSelected ? "answer-radio-selected" : "answer-radio-default"}`}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-full h-full rounded-full bg-black flex items-center justify-center"
                      >
                        <div className="answer-radio-dot" />
                      </motion.div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
