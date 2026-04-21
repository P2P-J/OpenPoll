import type { DosResultTypeData } from '@/shared/constants/dosResultTypes'

export interface DosCardScores {
  change: number
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
  return (
    <div
      style={{
        width: w,
        height: h,
        display: 'flex',
        fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
        background: '#FFF9E6',
        color: '#1a1a1a',
        borderRadius: 24,
        overflow: 'hidden',
      }}
    >
      {renderLeft(type, variant)}
      {renderRight(type, scores, variant, showCTA)}
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
        padding: isOg ? 40 : 60,
        color: 'white',
        gap: isOg ? 12 : 24,
      }}
    >
      <div style={{ fontSize: isOg ? 220 : 360, lineHeight: 1 }}>
        {type.animal.emoji}
      </div>
      <div style={{ fontSize: isOg ? 72 : 100, fontWeight: 900, letterSpacing: -4, lineHeight: 1 }}>
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
  variant: 'square' | 'og',
  showCTA: boolean | undefined,
) {
  const isOg = variant === 'og'
  const keywords = type.tag.slice(0, 3)
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: isOg ? 40 : 60,
        gap: isOg ? 14 : 24,
        background: '#FFF9E6',
      }}
    >
      <div style={{ fontSize: isOg ? 14 : 20, fontWeight: 700, letterSpacing: 4, color: '#666' }}>
        나의 DOS 유형
      </div>
      <div
        style={{
          fontSize: isOg ? 38 : 56,
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: -2,
        }}
      >
        {type.name}
      </div>
      <div
        style={{
          fontSize: isOg ? 18 : 24,
          fontWeight: 600,
          padding: isOg ? '10px 14px' : '16px 20px',
          background: 'white',
          border: '2px solid #1a1a1a',
          borderRadius: 12,
          color: '#333',
        }}
      >
        "{type.tagline}"
      </div>
      {scores && renderAxes(scores, type.color, isOg)}
      {keywords.length > 0 && renderKeywords(keywords, type.color, isOg)}
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: isOg ? 13 : 16, fontWeight: 800, letterSpacing: 3, color: '#666' }}>
          OPENPOLL.CO.KR
        </span>
        {showCTA && (
          <span
            style={{
              fontSize: isOg ? 14 : 18,
              fontWeight: 800,
              background: '#1a1a1a',
              color: 'white',
              padding: isOg ? '6px 12px' : '8px 16px',
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

function renderAxes(scores: DosCardScores, accent: string, isOg: boolean) {
  const items = [
    { label: '변화', value: scores.change },
    { label: '경쟁', value: scores.distribution },
    { label: '자유', value: scores.rights },
    { label: '개발', value: scores.development },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isOg ? 6 : 12 }}>
      {items.map((it) => (
        <div
          key={it.label}
          style={{
            display: 'grid',
            gridTemplateColumns: isOg ? '46px 1fr 46px' : '60px 1fr 60px',
            gap: isOg ? 10 : 12,
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: isOg ? 14 : 18, fontWeight: 700, color: '#1a1a1a' }}>{it.label}</span>
          <div style={{ height: isOg ? 8 : 12, background: '#E5E1D6', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${it.value}%`, background: accent, borderRadius: 100 }} />
          </div>
          <span
            style={{
              fontSize: isOg ? 14 : 18,
              fontWeight: 700,
              color: '#666',
              textAlign: 'right',
            }}
          >
            {Math.round(it.value)}%
          </span>
        </div>
      ))}
    </div>
  )
}

function renderKeywords(keywords: string[], accent: string, isOg: boolean) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: isOg ? 6 : 8 }}>
      {keywords.map((kw) => (
        <span
          key={kw}
          style={{
            fontSize: isOg ? 13 : 16,
            fontWeight: 700,
            color: accent,
            background: 'white',
            border: `1.5px solid ${accent}`,
            padding: isOg ? '4px 10px' : '6px 14px',
            borderRadius: 100,
          }}
        >
          #{kw}
        </span>
      ))}
    </div>
  )
}
