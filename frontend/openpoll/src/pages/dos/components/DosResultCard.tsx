import type { DosResultTypeData } from '@/shared/constants/dosResultTypes'

export interface DosCardScores {
  change: number        // 0-100
  distribution: number
  rights: number
  development: number
}

interface Props {
  type: DosResultTypeData
  scores?: DosCardScores
  variant: 'square' | 'og'
  showCTA?: boolean
}

const SIZE = {
  square: { w: 1080, h: 1080 },
  og:     { w: 1200, h: 630  },
}

export function DosResultCard({ type, scores, variant, showCTA }: Props) {
  const { w, h } = SIZE[variant]
  const showScores = variant === 'square' && !!scores
  return (
    <div
      style={{
        width: w,
        height: h,
        display: 'flex',
        fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
        background: '#FFF9E6',
        color: '#1a1a1a',
        borderRadius: variant === 'og' ? 0 : 24,
        overflow: 'hidden',
      }}
    >
      {renderLeft(type, variant)}
      {renderRight(type, scores, showScores, showCTA)}
    </div>
  )
}

function renderLeft(type: DosResultTypeData, variant: 'square' | 'og') {
  const isOg = variant === 'og'
  return (
    <div
      style={{
        flex: isOg ? '0 0 40%' : '0 0 45%',
        background: type.color,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isOg ? 48 : 60,
        color: 'white',
        gap: isOg ? 16 : 24,
      }}
    >
      <div style={{ fontSize: isOg ? 280 : 360, lineHeight: 1 }}>
        {type.animal.emoji}
      </div>
      <div style={{ fontSize: isOg ? 80 : 100, fontWeight: 900, letterSpacing: -4, lineHeight: 1 }}>
        {type.id}
      </div>
      <div style={{ fontSize: isOg ? 22 : 28, opacity: 0.9, fontWeight: 700 }}>
        {type.animal.name}
      </div>
    </div>
  )
}

function renderRight(
  type: DosResultTypeData,
  scores: DosCardScores | undefined,
  showScores: boolean,
  showCTA: boolean | undefined,
) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: 60,
        gap: 24,
        background: '#FFF9E6',
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 4, color: '#666' }}>
        나의 DOS 유형
      </div>
      <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.1, letterSpacing: -2 }}>
        {type.name}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 600,
          padding: '16px 20px',
          background: 'white',
          border: '2px solid #1a1a1a',
          borderRadius: 12,
          color: '#333',
        }}
      >
        "{type.tagline}"
      </div>
      {showScores && scores && renderAxes(scores, type.color)}
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: 3, color: '#666' }}>
          OPENPOLL.CO.KR
        </span>
        {showCTA && (
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              background: '#1a1a1a',
              color: 'white',
              padding: '8px 16px',
              borderRadius: 100,
            }}
          >
            나도 테스트 →
          </span>
        )}
      </div>
    </div>
  )
}

function renderAxes(scores: DosCardScores, accent: string) {
  const items = [
    { label: '변화', value: scores.change },
    { label: '경쟁', value: scores.distribution },
    { label: '자유', value: scores.rights },
    { label: '개발', value: scores.development },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((it) => (
        <div key={it.label} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 60px', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>{it.label}</span>
          <div style={{ height: 12, background: '#E5E1D6', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${it.value}%`, background: accent, borderRadius: 100 }} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#666', textAlign: 'right' }}>{Math.round(it.value)}%</span>
        </div>
      ))}
    </div>
  )
}
