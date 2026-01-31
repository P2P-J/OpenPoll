// Initial party configuration
export const INITIAL_PARTIES = {
  demoparty: { name: '더불어민주당', color: '#004EA2', logo: '🔵' },
  powerparty: { name: '국민의힘', color: '#E61E2B', logo: '🔴' },
  justiceparty: { name: '정의당', color: '#FFCC00', logo: '🟡' },
  basicincomeparty: { name: '기본소득당', color: '#00A0E9', logo: '🔷' },
  others: { name: '기타/무당층', color: '#9CA3AF', logo: '⚪' }
} as const;

export type PartyId = keyof typeof INITIAL_PARTIES;
