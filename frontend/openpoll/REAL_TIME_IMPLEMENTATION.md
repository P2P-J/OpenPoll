# 프론트엔드 실시간 투표 구현 가이드

## 개요

백엔드 없이 **프론트엔드 단독**으로 실시간처럼 보이는 투표 기능을 구현했습니다.
같은 브라우저의 여러 탭 간 투표 데이터가 동기화됩니다.

---

## 🏗️ 구현 아키텍처

### 2가지 기법 조합:
1. **localStorage Polling** - 1초마다 데이터 확인
2. **BroadcastChannel API** - 같은 브라우저 탭 간 즉시 통신

```
┌─────────────────────────────────────────────┐
│         사용자가 투표를 함                      │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  voting.service.ts - localStorage 업데이트   │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  VotingContext - broadcastVotingUpdate()    │
│  다른 탭에 메시지 전송                        │
└────────────┬────────────────────────────────┘
             │
        ┌────┴────┐
        ▼         ▼
    ┌─────┐  ┌──────────────┐
    │같은 │  │BroadcastChannel
    │탭   │  │수신 대기
    └─────┘  └──────┬───────┘
                    │
              ┌─────▼─────────┐
              │상태 업데이트   │
              │UI 재렌더링     │
              └────────────────┘
```

---

## 📁 구현된 파일

### 1. `src/hooks/useRealTimeVoting.ts` ✨ NEW
실시간 투표 감시 Hook

```typescript
// 기능 1: 폴링 및 BroadcastChannel 감시
useRealTimeVoting(onUpdate, pollingInterval);

// 기능 2: 다른 탭에 투표 브로드캐스트
broadcastVotingUpdate(parties, totalVotes);
```

### 2. `src/contexts/VotingContext.tsx` ✏️ UPDATED
- BroadcastChannel 채널 초기화
- 1초 폴링 추가 (`setInterval`)
- 투표 후 자동 브로드캐스트

---

## 🔄 동작 흐름

### 같은 탭에서의 동작:
```
1. 사용자가 투표 클릭
   ↓
2. castVote() 호출
   ↓
3. localStorage 업데이트 (voting.service)
   ↓
4. VotingContext에서 broadcastVotingUpdate() 실행
   ↓
5. 1초 폴링으로 다시 확인
   ↓
6. UI 업데이트 (motion 애니메이션)
```

### 다른 탭에서의 동작:
```
탭 A에서 투표 중...
   ↓
   └─→ BroadcastChannel로 메시지 전송
       ↓
       탭 B가 메시지 수신
       ↓
       상태 업데이트
       ↓
       UI 자동 갱신
```

---

## 💻 코드 예시

### VotingContext의 주요 부분:

```typescript
export function VotingProvider({ children }: { children: ReactNode }) {
  const [parties, setParties] = useState<PartyData[]>([]);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // 1. localStorage 폴링 + BroadcastChannel 설정
  useEffect(() => {
    // BroadcastChannel 초기화
    if (typeof BroadcastChannel !== 'undefined') {
      channelRef.current = new BroadcastChannel('voting-channel');
      channelRef.current.onmessage = (event) => {
        if (event.data.type === 'VOTING_UPDATE') {
          // 다른 탭에서 받은 업데이트 적용
          setParties(event.data.parties);
          setTotalVotes(event.data.totalVotes);
        }
      };
    }

    // 1초마다 폴링
    const pollingInterval = setInterval(() => {
      loadStats();
    }, 1000);

    return () => {
      clearInterval(pollingInterval);
      channelRef.current?.close();
    };
  }, [loadStats]);

  // 2. 투표 후 브로드캐스트
  const castVote = useCallback(async (partyId: string) => {
    votingService.castVote(partyId);
    loadStats();
    
    // ✨ 다른 탭에 자동으로 전송
    const updatedStats = votingService.getPartyStats();
    broadcastVotingUpdate(updatedStats.parties, updatedStats.totalVotes);
  }, [loadStats]);
}
```

---

## ✅ 장점

| 특징 | 설명 |
|------|------|
| **백엔드 불필요** | 프론트엔드 단독 구현 |
| **같은 탭 동기화** | 같은 브라우저의 여러 탭에서 실시간 동기화 |
| **자동 폴링** | 1초마다 자동으로 데이터 확인 |
| **즉시 반영** | BroadcastChannel로 즉시 전송 |
| **간단한 구현** | 복잡한 WebSocket 불필요 |

---

## ⚠️ 제한사항

| 제한 | 설명 |
|------|------|
| **다른 사용자** | 🔴 다른 컴퓨터의 투표는 볼 수 없음 |
| **동일 브라우저 탭만** | 🔴 다른 브라우저나 기기는 동기화 안 됨 |
| **BroadcastChannel 미지원** | 🔴 구형 브라우저에서 폴링만 작동 |
| **실시간성 제한** | 🟡 폴링은 1초 지연 |

---

## 🚀 실제 테스트 방법

### 1️⃣ 같은 탭에서 테스트:
```
1. 브라우저에서 홈페이지 열기
2. 정당에 투표
3. UI가 실시간으로 업데이트됨을 확인
```

### 2️⃣ 여러 탭에서 테스트:
```
1. 같은 URL을 여러 탭으로 열기
2. 한 탭에서 투표
3. 다른 탭들도 동시에 업데이트됨 확인 ✨
```

---

## 🔄 향후 개선: 백엔드 SSE 추가 시

현재 이 구현은 폴링 + BroadcastChannel을 사용합니다.
**진정한 실시간 기능**(다른 사용자의 투표 반영)을 위해서는 백엔드 SSE 구현이 필요합니다:

```typescript
// 향후 업그레이드 (백엔드 SSE 추가 시):
useEffect(() => {
  const eventSource = new EventSource('/api/voting/stats/stream');
  
  eventSource.onmessage = (event) => {
    const stats = JSON.parse(event.data);
    setParties(stats.parties);      // 서버 데이터로 업데이트
    setTotalVotes(stats.totalVotes);
  };

  return () => eventSource.close();
}, []);
```

---

## 📊 성능 최적화 팁

### 폴링 빈도 조정:
```typescript
// 1초마다 폴링 (기본값)
setInterval(loadStats, 1000);

// 더 자주: 500ms마다 (높은 CPU 사용)
setInterval(loadStats, 500);

// 덜 자주: 2초마다 (낮은 정확도)
setInterval(loadStats, 2000);
```

### 불필요한 렌더링 방지:
```typescript
// 데이터가 실제로 변경될 때만 상태 업데이트
if (JSON.stringify(oldParties) !== JSON.stringify(newParties)) {
  setParties(newParties);
}
```

---

## 🎯 요약

이 구현은 **백엔드 없이**:
- ✅ 같은 브라우저 탭 간 실시간 동기화
- ✅ localStorage 폴링으로 자동 갱신
- ✅ BroadcastChannel로 즉시 통신
- ✅ 간단하고 유지보수 가능한 코드

**하지만** 진정한 다중 사용자 실시간 기능을 원하면 백엔드 SSE 구현이 필수입니다! 🚀
