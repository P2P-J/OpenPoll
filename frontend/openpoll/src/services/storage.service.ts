import type { VoteRecord } from '@/types/party.types';

// localStorage keys
const KEYS = {
  USER_ID: 'openpoll_user_id',
  USER_POINTS: 'openpoll_user_points',
  LAST_RECHARGE: 'openpoll_last_recharge',
  PARTY_VOTES: 'openpoll_party_votes',
  VOTE_HISTORY: 'openpoll_user_vote_history',
} as const;

// Generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

class StorageService {
  // ============ User Management ============

  getUserId(): string {
    let userId = localStorage.getItem(KEYS.USER_ID);

    if (!userId) {
      userId = generateUUID();
      localStorage.setItem(KEYS.USER_ID, userId);
    }

    return userId;
  }

  initializeUser(): { userId: string; points: number } {
    const userId = this.getUserId();

    // Initialize points if not exists
    const points = localStorage.getItem(KEYS.USER_POINTS);
    if (points === null) {
      this.setPoints(500);
      localStorage.setItem(KEYS.LAST_RECHARGE, new Date().toISOString());
    }

    // Initialize party votes if not exists
    this.initializePartyVotes();

    // Initialize vote history if not exists
    if (!localStorage.getItem(KEYS.VOTE_HISTORY)) {
      localStorage.setItem(KEYS.VOTE_HISTORY, JSON.stringify([]));
    }

    return {
      userId,
      points: this.getPoints(),
    };
  }

  // ============ Points Management ============

  getPoints(): number {
    const points = localStorage.getItem(KEYS.USER_POINTS);
    return points ? parseInt(points, 10) : 500;
  }

  setPoints(points: number): void {
    localStorage.setItem(KEYS.USER_POINTS, points.toString());
  }

  deductPoints(amount: number): boolean {
    const currentPoints = this.getPoints();

    if (currentPoints < amount) {
      return false;
    }

    this.setPoints(currentPoints - amount);
    return true;
  }

  // ============ Voting ============

  getPartyVotes(): Record<string, number> {
    const votesStr = localStorage.getItem(KEYS.PARTY_VOTES);

    if (!votesStr) {
      return {};
    }

    try {
      return JSON.parse(votesStr);
    } catch {
      return {};
    }
  }

  incrementPartyVote(partyId: string): void {
    const votes = this.getPartyVotes();
    votes[partyId] = (votes[partyId] || 0) + 1;
    localStorage.setItem(KEYS.PARTY_VOTES, JSON.stringify(votes));
  }

  getUserVoteHistory(): VoteRecord[] {
    const historyStr = localStorage.getItem(KEYS.VOTE_HISTORY);

    if (!historyStr) {
      return [];
    }

    try {
      return JSON.parse(historyStr);
    } catch {
      return [];
    }
  }

  addVoteRecord(partyId: string, pointsSpent: number): void {
    const history = this.getUserVoteHistory();
    const newRecord: VoteRecord = {
      partyId,
      pointsSpent,
      timestamp: new Date().toISOString(),
    };

    history.push(newRecord);
    localStorage.setItem(KEYS.VOTE_HISTORY, JSON.stringify(history));
  }

  // ============ Initialization ============

  initializePartyVotes(): void {
    const votes = localStorage.getItem(KEYS.PARTY_VOTES);

    if (!votes) {
      const initialVotes = {
        demoparty: 0,
        powerparty: 0,
        justiceparty: 0,
        basicincomeparty: 0,
        others: 0,
      };
      localStorage.setItem(KEYS.PARTY_VOTES, JSON.stringify(initialVotes));
    }
  }

  // ============ Utilities ============

  clearAllData(): void {
    Object.values(KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  getLastRecharge(): string | null {
    return localStorage.getItem(KEYS.LAST_RECHARGE);
  }

  setLastRecharge(date: string): void {
    localStorage.setItem(KEYS.LAST_RECHARGE, date);
  }
}

// Export singleton instance
export const storageService = new StorageService();
