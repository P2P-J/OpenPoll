import { memo, useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "motion/react";

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  showChange?: boolean;
  changeColor?: string;
}

/**
 * 코인/주식 호가창 스타일의 실시간 숫자 애니메이션 컴포넌트
 *
 * - 숫자가 부드럽게 카운트업/다운
 * - 변화 시 하이라이트 효과
 * - 변화량 표시 옵션
 */
export const AnimatedNumber = memo(function AnimatedNumber({
  value,
  decimals = 0,
  duration = 0.5,
  className = "",
  suffix = "",
  prefix = "",
  showChange = false,
  changeColor,
}: AnimatedNumberProps) {
  const prevValue = useRef(value);
  const isFirstRender = useRef(true);
  const [changeAmount, setChangeAmount] = useState(0);
  const [hasChanged, setHasChanged] = useState(false);

  // framer-motion spring 애니메이션
  const spring = useSpring(value, {
    stiffness: 100,
    damping: 20,
    duration: duration,
  });

  // 값 포맷팅
  const displayValue = useTransform(spring, (latest) =>
    decimals > 0
      ? latest.toFixed(decimals)
      : Math.round(latest).toLocaleString()
  );

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      const diff = value - prevValue.current;
      setChangeAmount(diff);
      setHasChanged(diff !== 0);
      prevValue.current = value;
    }
  }, [value]);

  return (
    <span className={`relative inline-flex items-center ${className}`}>
      {/* 메인 숫자 */}
      <motion.span
        key={`value-${value}`}
        initial={hasChanged ? { scale: 1 } : false}
        animate={
          hasChanged
            ? {
                scale: [1, 1.15, 1],
                textShadow: [
                  "0 0 0px transparent",
                  `0 0 20px ${changeColor || (changeAmount > 0 ? "#22c55e" : "#ef4444")}`,
                  "0 0 0px transparent",
                ],
              }
            : {}
        }
        transition={{ duration: 0.4 }}
      >
        {prefix}
        <motion.span>{displayValue}</motion.span>
        {suffix}
      </motion.span>

      {/* 변화량 표시 */}
      {showChange && hasChanged && (
        <motion.span
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10], scale: 1 }}
          transition={{ duration: 1.5, times: [0, 0.1, 0.7, 1] }}
          className={`absolute -right-8 text-xs font-bold ${
            changeAmount > 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {changeAmount > 0 ? "+" : ""}
          {changeAmount}
        </motion.span>
      )}
    </span>
  );
});
