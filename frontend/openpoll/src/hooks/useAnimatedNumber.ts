import { useState, useEffect, useRef } from "react";

interface UseAnimatedNumberOptions {
  duration?: number;
  decimals?: number;
}

/**
 * 숫자가 변경될 때 카운트업 애니메이션을 적용하는 훅
 * 코인/주식 호가창처럼 부드럽게 숫자가 올라가는 효과
 */
export function useAnimatedNumber(
  targetValue: number,
  options: UseAnimatedNumberOptions = {}
) {
  const { duration = 500, decimals = 0 } = options;
  const [displayValue, setDisplayValue] = useState(targetValue);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousValue = useRef(targetValue);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // 값이 변경되지 않았으면 무시
    if (previousValue.current === targetValue) {
      return;
    }

    const startValue = previousValue.current;
    const diff = targetValue - startValue;
    const startTime = performance.now();

    setIsAnimating(true);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutCubic 이징 함수
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const currentValue = startValue + diff * easeProgress;
      setDisplayValue(
        decimals > 0
          ? parseFloat(currentValue.toFixed(decimals))
          : Math.round(currentValue)
      );

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
        setIsAnimating(false);
        previousValue.current = targetValue;
      }
    };

    // 이전 애니메이션 취소
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration, decimals]);

  // 초기값 설정 (마운트 시 한 번만 실행)
  useEffect(() => {
    previousValue.current = targetValue;
    setDisplayValue(targetValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { displayValue, isAnimating };
}

/**
 * 이전 값을 추적하는 훅
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
