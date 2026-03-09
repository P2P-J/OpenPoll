import { useState, useEffect, useCallback } from "react";
import { attendanceApi } from "@/api";
import type {
  AttendanceStatus,
  CheckAttendanceResult,
} from "@/api/attendance.api";

export function useAttendance() {
  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<CheckAttendanceResult | null>(
    null,
  );
  const [isChecking, setIsChecking] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await attendanceApi.getAttendanceStatus();
      setStatus(data);
      setError(null);
    } catch {
      setError("출석 상태를 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkIn = useCallback(async () => {
    try {
      setIsChecking(true);
      const result = await attendanceApi.checkAttendance();
      setCheckResult(result);
      await fetchStatus();
      return result;
    } catch {
      setError("출석 체크에 실패했습니다.");
      throw new Error("출석 체크 실패");
    } finally {
      setIsChecking(false);
    }
  }, [fetchStatus]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    isLoading,
    error,
    checkResult,
    isChecking,
    checkIn,
    fetchStatus,
  };
}
