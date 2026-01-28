import { useEffect, useCallback } from 'react';

/**
 * 실시간 투표 기능을 위한 Hook
 * 
 * 같은 브라우저의 여러 탭 간 투표 데이터 동기화를 지원합니다.
 * (참고: 다른 사용자/컴퓨터의 데이터는 백엔드 SSE가 필요합니다)
 */

interface VotingUpdate {
  parties: any[];
  totalVotes: number;
  timestamp: number;
}

export function useRealTimeVoting(
  onUpdate: (data: VotingUpdate) => void,
  pollingInterval: number = 1000
) {
  const broadcastChannelSupported = typeof BroadcastChannel !== 'undefined';

  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    let intervalId: NodeJS.Timeout | null = null;

    // BroadcastChannel을 지원하면 같은 탭 간 통신
    if (broadcastChannelSupported) {
      try {
        channel = new BroadcastChannel('voting-updates');

        channel.onmessage = (event) => {
          if (event.data.type === 'VOTING_UPDATE') {
            onUpdate({
              parties: event.data.parties,
              totalVotes: event.data.totalVotes,
              timestamp: event.data.timestamp,
            });
          }
        };
      } catch (error) {
        console.warn('BroadcastChannel 초기화 실패:', error);
      }
    }

    // 폴링으로 정기적으로 localStorage 확인
    intervalId = setInterval(() => {
      const lastUpdate = localStorage.getItem('voting-last-update');
      const currentTime = Date.now();

      // 마지막 업데이트 이후 변경 감지
      if (lastUpdate) {
        const lastTime = parseInt(lastUpdate);
        if (currentTime - lastTime < 2000) {
          // 2초 내에 업데이트가 있었으면 리로드
          // (이는 같은 탭이나 다른 탭에서의 변경을 감지)
          const votingData = localStorage.getItem('voting-stats');
          if (votingData) {
            try {
              const parsed = JSON.parse(votingData);
              onUpdate({
                parties: parsed.parties,
                totalVotes: parsed.totalVotes,
                timestamp: currentTime,
              });
            } catch (error) {
              console.error('투표 데이터 파싱 오류:', error);
            }
          }
        }
      }
    }, pollingInterval);

    // 정리
    return () => {
      if (channel) {
        channel.close();
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [onUpdate, pollingInterval, broadcastChannelSupported]);
}

/**
 * BroadcastChannel을 이용해 다른 탭에 투표 정보 브로드캐스트
 */
export function broadcastVotingUpdate(parties: any[], totalVotes: number) {
  if (typeof BroadcastChannel === 'undefined') {
    return;
  }

  try {
    const channel = new BroadcastChannel('voting-updates');
    channel.postMessage({
      type: 'VOTING_UPDATE',
      parties,
      totalVotes,
      timestamp: Date.now(),
    });
    channel.close();
  } catch (error) {
    console.warn('투표 브로드캐스트 실패:', error);
  }
}
