import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { storageService } from '@/services/storage.service';
import { pointsService } from '@/services/points.service';

interface UserContextType {
  userId: string;
  points: number;
  isInitialized: boolean;
  updatePoints: (points: number) => void;
  deductPoints: (amount: number) => boolean;
  checkRecharge: () => { recharged: boolean; points: number };
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string>('');
  const [points, setPoints] = useState<number>(500);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize user on mount
    const { userId: id, points: initialPoints } = storageService.initializeUser();
    setUserId(id);
    setPoints(initialPoints);

    // Check if recharge is needed
    const { recharged, points: newPoints } = pointsService.checkAndRecharge();
    if (recharged) {
      setPoints(newPoints);
    }

    setIsInitialized(true);

    // Check for recharge every minute
    const interval = setInterval(() => {
      const { recharged: wasRecharged, points: updatedPoints } = pointsService.checkAndRecharge();
      if (wasRecharged) {
        setPoints(updatedPoints);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const updatePoints = useCallback((newPoints: number) => {
    setPoints(newPoints);
    storageService.setPoints(newPoints);
  }, []);

  const deductPoints = useCallback((amount: number) => {
    const success = storageService.deductPoints(amount);
    if (success) {
      setPoints(storageService.getPoints());
    }
    return success;
  }, []);

  const checkRecharge = useCallback(() => {
    const result = pointsService.checkAndRecharge();
    if (result.recharged) {
      setPoints(result.points);
    }
    return result;
  }, []);

  return (
    <UserContext.Provider
      value={{
        userId,
        points,
        isInitialized,
        updatePoints,
        deductPoints,
        checkRecharge,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
