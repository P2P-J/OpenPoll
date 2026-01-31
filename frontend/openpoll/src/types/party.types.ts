export interface PartyData {
  id: string;
  name: string;
  color: string;
  logo: string;
  totalVotes: number;
  percentage: number;
}

export interface VoteRecord {
  partyId: string;
  pointsSpent: number;
  timestamp: string;
}

export interface PartyStats {
  parties: PartyData[];
  totalVotes: number;
}

export interface VoteResult {
  success: boolean;
  pointsRemaining: number;
  partyId: string;
  timestamp: string;
}
