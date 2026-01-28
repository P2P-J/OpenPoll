import { storageService } from '@/services/storage.service';

class PointsService {
  // Check if midnight has passed since last recharge
  shouldRecharge(): boolean {
    const lastRecharge = storageService.getLastRecharge();

    if (!lastRecharge) {
      return true;
    }

    const lastDate = new Date(lastRecharge);
    const now = new Date();

    // Check if we've crossed midnight (compare date strings)
    return now.toDateString() !== lastDate.toDateString();
  }

  // Recharge points if needed (called on app initialization)
  checkAndRecharge(): { recharged: boolean; points: number } {
    const currentPoints = storageService.getPoints();

    if (this.shouldRecharge() && currentPoints < 500) {
      storageService.setPoints(500);
      storageService.setLastRecharge(new Date().toISOString());
      return { recharged: true, points: 500 };
    }

    return { recharged: false, points: currentPoints };
  }
}

// Export singleton instance
export const pointsService = new PointsService();
