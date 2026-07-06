import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dosApi } from "@/api";
import type { DosResultType } from "@/types/api.types";

const ERROR_REDIRECT_DELAY_MS = 2000;

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
