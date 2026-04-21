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
  const isOg = variant === 'og'
  return (
    <div
      style={{
        width: w,
        height: h,
        display: 'flex',
        fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
        background: '#FFF9E6',
        color: '#1a1a1a',
        borderRadius: isOg ? 24 : 0,
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
        padding: isOg ? '32px 24px' : '48px 40px',
        color: 'white',
      }}
    >
      {/* 이모지: 상단~중앙 영역을 flex:1 로 차지해 시각적으로 중앙 정렬 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          fontSize: isOg ? 240 : 380,
          lineHeight: 1,
        }}
      >
        {type.animal.emoji}
      </div>
      {/* CMFD + 사자: 하단 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: isOg ? 4 : 10,
        }}
      >
        <div style={{ fontSize: isOg ? 56 : 88, fontWeight: 900, letterSpacing: -3, lineHeight: 1 }}>
          {type.id}
        </div>
        <div style={{ fontSize: isOg ? 18 : 26, opacity: 0.9, fontWeight: 700 }}>
          {type.animal.name}
        </div>
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
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: isOg ? '48px 52px' : '64px 60px',
        gap: isOg ? 26 : 34,
        background: '#FFF9E6',
      }}
    >
      <div style={{ fontSize: isOg ? 16 : 22, fontWeight: 700, letterSpacing: 4, color: '#666' }}>
        나의 DOS 유형
      </div>
      <div
        style={{
          fontSize: isOg ? 44 : 60,
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: -2,
        }}
      >
        {type.name}
      </div>
      <div
        style={{
          alignSelf: 'flex-start',
          maxWidth: '100%',
          fontSize: isOg ? 20 : 26,
          fontWeight: 600,
          padding: isOg ? '11px 18px' : '14px 20px',
          background: 'white',
          border: '2px solid #1a1a1a',
          borderRadius: 14,
          color: '#333',
        }}
      >
        "{type.tagline}"
      </div>
      {scores && renderAxes(scores, type.color, isOg)}
      {keywords.length > 0 && renderKeywords(keywords, type.color, isOg)}
      {!isOg && type.description && (
        <div
          style={{
            fontSize: 22,
            lineHeight: 1.55,
            color: '#444',
            fontWeight: 500,
            wordBreak: 'keep-all',
          }}
        >
          {type.description}
        </div>
      )}
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: isOg ? 15 : 18, fontWeight: 800, letterSpacing: 3, color: '#666' }}>
          OPENPOLL.CO.KR
        </span>
        {showCTA && (
          <span
            style={{
              fontSize: isOg ? 16 : 20,
              fontWeight: 800,
              background: '#1a1a1a',
              color: 'white',
              padding: isOg ? '8px 14px' : '8px 16px',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: isOg ? 12 : 14 }}>
      {items.map((it) => (
        <div
          key={it.label}
          style={{
            display: 'grid',
            gridTemplateColumns: isOg ? '52px minmax(0, 1fr) 56px' : '60px minmax(0, 1fr) 60px',
            gap: isOg ? 14 : 14,
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: isOg ? 18 : 20, fontWeight: 700, color: '#1a1a1a' }}>{it.label}</span>
          <div style={{ height: isOg ? 14 : 16, background: '#E5E1D6', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${it.value}%`, background: accent, borderRadius: 100 }} />
          </div>
          <span
            style={{
              fontSize: isOg ? 16 : 18,
              fontWeight: 700,
              color: '#666',
              textAlign: 'right',
              whiteSpace: 'nowrap',
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
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: isOg ? 10 : 8 }}>
      {keywords.map((kw) => (
        <span
          key={kw}
          style={{
            fontSize: isOg ? 16 : 18,
            fontWeight: 700,
            color: accent,
            background: 'white',
            border: `2px solid ${accent}`,
            padding: isOg ? '7px 14px' : '6px 14px',
            borderRadius: 100,
          }}
        >
          #{kw}
        </span>
      ))}
    </div>
  )
}
