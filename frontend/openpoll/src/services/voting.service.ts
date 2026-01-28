import { storageService } from '@/services/storage.service';
import type { VoteResult, PartyStats, PartyData } from '@/types/party.types';
import { INITIAL_PARTIES } from '@/constants/parties';

class VotingService {
  castVote(partyId: string): VoteResult {
    // 1. Check points
    const currentPoints = storageService.getPoints();
    if (currentPoints < 5) {
      throw new Error('포인트가 부족합니다. 투표하려면 5포인트가 필요합니다.');
    }

    // 2. Deduct points
    const success = storageService.deductPoints(5);
    if (!success) {
      throw new Error('포인트 차감에 실패했습니다.');
    }

    // 3. Increment party vote
    storageService.incrementPartyVote(partyId);

    // 4. Record vote history
    storageService.addVoteRecord(partyId, 5);

    // 5. Return result
    return {
      success: true,
      pointsRemaining: currentPoints - 5,
      partyId,
      timestamp: new Date().toISOString(),
    };
  }

  getPartyStats(): PartyStats {
    const partyVotes = storageService.getPartyVotes();
    const totalVotes = Object.values(partyVotes).reduce((a, b) => a + b, 0);

    const parties: PartyData[] = Object.entries(INITIAL_PARTIES).map(([id, config]) => ({
      id,
      name: config.name,
      color: config.color,
      logo: config.logo,
      totalVotes: partyVotes[id] || 0,
      percentage: totalVotes > 0 ? ((partyVotes[id] || 0) / totalVotes) * 100 : 0,
    }));

    return {
      parties,
      totalVotes,
    };
  }
}

// Export singleton instance
export const votingService = new VotingService();
