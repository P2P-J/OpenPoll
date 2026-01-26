import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { Button } from '@/components/atoms';
import { ProgressBar } from '@/components/atoms';

export interface PartyData {
  id: string;
  name: string;
  value: number;
  color: string;
  logo: string;
}

export interface PartyVoteItemProps {
  party: PartyData;
  totalParticipants: number;
  isSelected: boolean;
  isLoggedIn: boolean;
  onVote: (partyId: string) => void;
  animationDelay?: number;
}

export function PartyVoteItem({
  party,
  totalParticipants,
  isSelected,
  isLoggedIn,
  onVote,
  animationDelay = 0,
}: PartyVoteItemProps) {
  const participantCount = Math.round((party.value / 100) * totalParticipants);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: animationDelay }}
      className="group"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3 gap-2">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="text-2xl sm:text-3xl lg:text-4xl">{party.logo}</div>
          <div>
            <div className="font-bold text-sm sm:text-base lg:text-lg">{party.name}</div>
            <div className="text-xs sm:text-sm text-gray-400">
              약 {participantCount.toLocaleString()}명
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
          <span 
            className="text-2xl sm:text-3xl font-bold" 
            style={{ color: party.color }}
          >
            {party.value}%
          </span>
          {isLoggedIn && (
            <Button
              onClick={() => onVote(party.id)}
              variant={isSelected ? 'primary' : 'outline'}
              size="sm"
              className={isSelected ? 'bg-white text-black' : ''}
            >
              {isSelected ? (
                <span className="flex items-center space-x-1">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>선택됨</span>
                </span>
              ) : (
                '투표하기'
              )}
            </Button>
          )}
        </div>
      </div>

      <ProgressBar
        value={party.value}
        color={`bg-[${party.color}]`}
        bgColor="bg-white/10"
        height="sm"
        animated
      />
    </motion.div>
  );
}
