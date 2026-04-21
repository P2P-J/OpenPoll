import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const FONT_DIR = join(__dirname, 'fonts')
const EMOJI_DIR = join(__dirname, 'twemoji')
const OUT_DIR = join(ROOT, 'dist/og/dos')

const TWEMOJI_VERSION = '14.0.2'
const FONT_URL = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/Pretendard-Bold.otf'
const FONT_PATH = join(FONT_DIR, 'Pretendard-Bold.otf')

const EMOJI_MAP = {
  '🦁': '1f981', '🦋': '1f98b', '🐺': '1f43a', '🦉': '1f989',
  '🐝': '1f41d', '🦦': '1f9a6', '🐘': '1f418', '🐳': '1f433',
  '🦅': '1f985', '🦌': '1f98c', '🐅': '1f405', '🐢': '1f422',
  '🐬': '1f42c', '🐑': '1f411', '🐻': '1f43b', '🐼': '1f43c',
}

// 주의: 이 매핑은 src/shared/constants/dosResultTypes.ts의 animal/color/tagline/description과 동일하게 유지해야 한다.
// 스펙 문서 docs/superpowers/specs/2026-04-18-dos-result-card-design.md가 단일 진실 원천.
const TYPES = [
  { id: 'CMFD', name: '진보적 자유주의자', emoji: '🦁', animal: '사자',   color: '#FF7A59', tagline: '변화 속에서 기회를 포착하는 불꽃', keywords: ['자유시장', '규제완화', '스타트업'],  description: '변화를 추구하며 개인의 자유와 경쟁을 중시하고, 발전을 위한 개발에 긍정적인 유형입니다.' },
  { id: 'CMFN', name: '녹색 진보주의자',   emoji: '🦋', animal: '나비',   color: '#4ADE80', tagline: '자유롭게 변화하는 생태의 수호자', keywords: ['지속가능성', '친환경혁신', '그린뉴딜'], description: '변화와 자유를 중시하되, 환경 보존에 높은 가치를 두는 유형입니다.' },
  { id: 'CMOD', name: '진보적 권위주의자', emoji: '🐺', animal: '늑대',   color: '#8B5CF6', tagline: '조직된 힘으로 세상을 바꾸는 전략가', keywords: ['국가주도', '강력한리더', '체제개혁'], description: '변화와 경쟁을 지지하면서 사회 질서를 중시하고, 개발에 적극적인 유형입니다.' },
  { id: 'CMON', name: '진보적 보존주의자', emoji: '🦉', animal: '올빼미', color: '#0EA5E9', tagline: '변화 속에서 균형을 찾는 현자', keywords: ['온건개혁', '사회질서', '친환경'], description: '변화를 추구하지만 규율을 중시하며, 환경 보존에 관심이 높은 유형입니다.' },
  { id: 'CEFD', name: '진보적 평등주의자', emoji: '🐝', animal: '벌',     color: '#F59E0B', tagline: '연대로 움직이는 진보의 일꾼', keywords: ['사회연대', '평등분배', '공동체'], description: '변화를 추구하고 분배를 중시하며, 개인 자유와 발전을 지지하는 유형입니다.' },
  { id: 'CEFN', name: '녹색 평등주의자',   emoji: '🦦', animal: '수달',   color: '#65A30D', tagline: '함께 살아가는 자연의 친구', keywords: ['생태공존', '평등분배', '지역공동체'], description: '변화와 분배, 자유를 중시하면서 환경 가치를 지키려는 유형입니다.' },
  { id: 'CEOD', name: '진보적 사회주의자', emoji: '🐘', animal: '코끼리', color: '#EC4899', tagline: '공동체를 이끄는 든든한 기둥', keywords: ['사회주의', '국가복지', '산업재편'], description: '변화와 분배, 질서를 모두 중시하고 적극적으로 개발에 관여하는 유형입니다.' },
  { id: 'CEON', name: '생태 사회주의자',   emoji: '🐳', animal: '고래',   color: '#0D9488', tagline: '깊고 넓은 연대의 바다', keywords: ['생태사회', '연대경제', '탈성장'], description: '변화와 분배, 질서를 중시하되 환경 보존에 깊은 관심을 가진 유형입니다.' },
  { id: 'SMFD', name: '자유주의적 보수',   emoji: '🦅', animal: '독수리', color: '#D97706', tagline: '높은 곳에서 기회를 노리는 개척자', keywords: ['자유시장', '개인책임', '기업가정신'], description: '안정 속에서 개인의 자유와 경쟁을 강조하며, 개발에 긍정적인 유형입니다.' },
  { id: 'SMFN', name: '녹색 보수주의자',   emoji: '🦌', animal: '사슴',   color: '#16A34A', tagline: '숲을 지키는 조용한 수호자', keywords: ['전통보전', '친환경', '지역주의'], description: '안정과 자유를 중시하면서 환경 가치를 지키려는 유형입니다.' },
  { id: 'SMOD', name: '전통적 보수주의자', emoji: '🐅', animal: '호랑이', color: '#6366F1', tagline: '당당한 원칙의 수호자', keywords: ['전통가치', '질서존중', '강한국가'], description: '안정과 질서를 중시하며, 경쟁과 개발에 적극적인 전통적 유형입니다.' },
  { id: 'SMON', name: '온건 보수주의자',   emoji: '🐢', animal: '거북이', color: '#64748B', tagline: '신중하게 지켜내는 균형의 달인', keywords: ['안정우선', '점진적변화', '환경보호'], description: '안정과 질서를 중시하면서 환경 보호에도 관심을 두는 신중한 유형입니다.' },
  { id: 'SEFD', name: '사회민주주의자',    emoji: '🐬', animal: '돌고래', color: '#DC2626', tagline: '따뜻한 연대의 항해자',           keywords: ['사회복지', '개인자유', '포용사회'], description: '안정 속에서 분배와 자유를 중시하며, 발전에도 긍정적인 유형입니다.' },
  { id: 'SEFN', name: '녹색 사민주의자',   emoji: '🐑', animal: '양',     color: '#059669', tagline: '평화로운 공동체의 일원',         keywords: ['평화연대', '공공복지', '환경우선'], description: '안정과 분배, 자유를 존중하면서 환경 보존을 중요시하는 유형입니다.' },
  { id: 'SEOD', name: '온건 사회주의자',   emoji: '🐻', animal: '곰',     color: '#A855F7', tagline: '든든하게 함께 걷는 동반자',       keywords: ['공공주도', '안정복지', '공정분배'], description: '안정과 분배, 질서를 중시하며, 발전 방향에도 관심이 많은 유형입니다.' },
  { id: 'SEON', name: '생태 보수주의자',   emoji: '🐼', animal: '판다',   color: '#78716C', tagline: '자연과 함께하는 평온의 상징',     keywords: ['자연보전', '공동체', '지속가능'], description: '안정과 분배, 질서를 중시하면서 환경 가치를 지키려는 유형입니다.' },
]

// 현재 DosResultCard.tsx와 시각 언어 동기화: 폰트 크기 업, 키워드/태그라인 스타일 조정,
// square variant는 저장용으로 borderRadius 0 + description 포함.
const CFG_OG = { w: 1200, h: 630,  leftRatio: 40, padY: 48, padX: 52, gap: 26, emoji: 240, code: 56, animal: 18, label: 16, name: 44, tagline: 20, logo: 15, kw: 16, codeBottom: 36, borderRadius: 24, kwPad: '7px 14px', kwGap: 10, tlPad: '11px 18px', tlRadius: 14, showDesc: false, desc: 0 }
const CFG_SQ = { w: 1080, h: 1080, leftRatio: 45, padY: 64, padX: 60, gap: 34, emoji: 380, code: 88, animal: 26, label: 22, name: 60, tagline: 26, logo: 18, kw: 18, codeBottom: 56, borderRadius: 0,  kwPad: '7px 14px', kwGap: 10, tlPad: '14px 20px', tlRadius: 14, showDesc: true,  desc: 22 }

async function ensureFont() {
  await mkdir(FONT_DIR, { recursive: true })
  if (existsSync(FONT_PATH)) return readFile(FONT_PATH)
  console.log('[og-generator] Pretendard Bold 다운로드 중...')
  const res = await fetch(FONT_URL)
  if (!res.ok) throw new Error(`폰트 다운로드 실패: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(FONT_PATH, buf)
  return buf
}

async function ensureEmojiSvg(unicode) {
  await mkdir(EMOJI_DIR, { recursive: true })
  const path = join(EMOJI_DIR, `${unicode}.svg`)
  if (existsSync(path)) return readFile(path, 'utf8')
  const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@${TWEMOJI_VERSION}/assets/svg/${unicode}.svg`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`이모지 다운로드 실패 (${unicode}): ${res.status}`)
  const svg = await res.text()
  await writeFile(path, svg)
  return svg
}

async function getEmojiDataUrl(emoji) {
  const unicode = EMOJI_MAP[emoji]
  if (!unicode) throw new Error(`매핑 없음: ${emoji}`)
  const svg = await ensureEmojiSvg(unicode)
  const b64 = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${b64}`
}

async function buildNode(type, cfg) {
  const emojiDataUrl = await getEmojiDataUrl(type.emoji)
  const rightChildren = [
    { type: 'div', props: { style: { display: 'flex', fontSize: cfg.label, fontWeight: 700, letterSpacing: 4, color: '#666' }, children: '나의 DOS 유형' } },
    { type: 'div', props: { style: { display: 'flex', fontSize: cfg.name, fontWeight: 900, letterSpacing: -2, lineHeight: 1.1 }, children: type.name } },
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          alignSelf: 'flex-start',
          maxWidth: '100%',
          fontSize: cfg.tagline, fontWeight: 600,
          padding: cfg.tlPad, background: 'white',
          border: '2px solid #1a1a1a', borderRadius: cfg.tlRadius, color: '#333',
        },
        children: `"${type.tagline}"`,
      },
    },
    {
      type: 'div',
      props: {
        style: { display: 'flex', flexWrap: 'wrap', gap: cfg.kwGap },
        children: type.keywords.map((kw) => ({
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontSize: cfg.kw, fontWeight: 700, color: type.color,
              background: 'white', border: `2px solid ${type.color}`,
              padding: cfg.kwPad, borderRadius: 100,
            },
            children: `#${kw}`,
          },
        })),
      },
    },
  ]

  if (cfg.showDesc && type.description) {
    rightChildren.push({
      type: 'div',
      props: {
        style: {
          display: 'flex',
          width: '100%',
          fontSize: cfg.desc, fontWeight: 500,
          lineHeight: 1.55, color: '#444',
          wordBreak: 'keep-all',
        },
        children: type.description,
      },
    })
  }

  rightChildren.push({
    type: 'div',
    props: {
      style: { display: 'flex', marginTop: 'auto', fontSize: cfg.logo, fontWeight: 800, letterSpacing: 3, color: '#666' },
      children: 'OPENPOLL.CO.KR',
    },
  })

  return {
    type: 'div',
    props: {
      style: {
        width: cfg.w, height: cfg.h, display: 'flex',
        fontFamily: 'Pretendard', background: '#FFF9E6', color: '#1a1a1a',
        borderRadius: cfg.borderRadius, overflow: 'hidden',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              width: `${cfg.leftRatio}%`, background: type.color,
              position: 'relative', color: 'white',
            },
            children: [
              // 이모지: 패널 정중앙
              {
                type: 'img',
                props: {
                  src: emojiDataUrl,
                  width: cfg.emoji,
                  height: cfg.emoji,
                  style: {
                    display: 'block',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  },
                },
              },
              // ID + 동물명: 하단
              {
                type: 'div',
                props: {
                  style: {
                    position: 'absolute',
                    bottom: cfg.codeBottom,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: Math.max(4, Math.round(cfg.gap / 4)),
                  },
                  children: [
                    { type: 'div', props: { style: { display: 'flex', fontSize: cfg.code, fontWeight: 900, letterSpacing: -3 }, children: type.id } },
                    { type: 'div', props: { style: { display: 'flex', fontSize: cfg.animal, opacity: 0.9, fontWeight: 700 }, children: type.animal } },
                  ],
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex', flexDirection: 'column',
              width: `${100 - cfg.leftRatio}%`,
              padding: `${cfg.padY}px ${cfg.padX}px`,
              gap: cfg.gap, background: '#FFF9E6',
              boxSizing: 'border-box',
            },
            children: rightChildren,
          },
        },
      ],
    },
  }
}

async function main() {
  const fontBuf = await ensureFont()
  await mkdir(OUT_DIR, { recursive: true })

  const variants = [
    { name: 'og', cfg: CFG_OG },
    { name: 'sq', cfg: CFG_SQ },
  ]

  let count = 0
  for (const type of TYPES) {
    for (const v of variants) {
      const node = await buildNode(type, v.cfg)
      const svg = await satori(node, {
        width: v.cfg.w,
        height: v.cfg.h,
        fonts: [{ name: 'Pretendard', data: fontBuf, weight: 700, style: 'normal' }],
      })
      const resvg = new Resvg(svg)
      const pngBuf = resvg.render().asPng()
      const outPath = join(OUT_DIR, `${type.id}-${v.name}.png`)
      await writeFile(outPath, pngBuf)
      count++
      process.stdout.write(`\r[og-generator] ${count}/32 생성 중... (${type.id}-${v.name})`)
    }
  }
  console.log(`\n[og-generator] ${count}개 PNG 생성 완료 → ${OUT_DIR}`)
}

main().catch((err) => {
  console.error('[og-generator] 실패:', err)
  process.exit(1)
})
