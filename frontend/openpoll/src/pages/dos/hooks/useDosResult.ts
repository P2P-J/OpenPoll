import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dosApi } from "@/api";
import type { DosResult, DosResultType } from "@/types/api.types";

const ERROR_REDIRECT_DELAY_MS = 2000;

export interface AxisResult {
  label: string;
  left: string;
  right: string;
  leftScore: number;
  rightScore: number;
}

export interface UseResultDataReturn {
  resultTypeInfo: DosResultType | null;
  isLoading: boolean;
}

export const useResultData = (
  type: string | undefined,
  navigate: ReturnType<typeof useNavigate>
): UseResultDataReturn => {
  const [resultTypeInfo, setResultTypeInfo] = useState<DosResultType | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResultType = async () => {
      if (!type) {
        navigate("/dos");
        return;
      }

      try {
        const data = await dosApi.getResultType(type);
        setResultTypeInfo(data);
      } catch {
        setTimeout(() => navigate("/dos"), ERROR_REDIRECT_DELAY_MS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResultType();
  }, [type, navigate]);

  return { resultTypeInfo, isLoading };
};

export const createAxisResults = (
  resultData: DosResult | undefined
): AxisResult[] => {
  if (!resultData) return [];

  return [
    {
      label: "변화 인식",
      left: "안정",
      right: "변화",
      leftScore: Math.round(100 - resultData.axisPercentages.change),
      rightScore: Math.round(resultData.axisPercentages.change),
    },
    {
      label: "분배 인식",
      left: "경쟁",
      right: "평등",
      leftScore: Math.round(100 - resultData.axisPercentages.distribution),
      rightScore: Math.round(resultData.axisPercentages.distribution),
    },
    {
      label: "권리 인식",
      left: "자유",
      right: "규율",
      leftScore: Math.round(100 - resultData.axisPercentages.rights),
      rightScore: Math.round(resultData.axisPercentages.rights),
    },
    {
      label: "발전 인식",
      left: "환경",
      right: "개발",
      leftScore: Math.round(100 - resultData.axisPercentages.development),
      rightScore: Math.round(resultData.axisPercentages.development),
    },
  ];
};
