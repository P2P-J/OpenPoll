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

// 주의: 이 매핑은 src/shared/constants/dosResultTypes.ts의 animal/color/tagline과 동일하게 유지해야 한다.
// 스펙 문서 docs/superpowers/specs/2026-04-18-dos-result-card-design.md가 단일 진실 원천.
const TYPES = [
  { id: 'CMFD', name: '진보적 자유주의자', emoji: '🦁', animal: '사자',   color: '#FF7A59', tagline: '변화 속에서 기회를 포착하는 불꽃' },
  { id: 'CMFN', name: '녹색 진보주의자',   emoji: '🦋', animal: '나비',   color: '#4ADE80', tagline: '자유롭게 변화하는 생태의 수호자' },
  { id: 'CMOD', name: '진보적 권위주의자', emoji: '🐺', animal: '늑대',   color: '#8B5CF6', tagline: '조직된 힘으로 세상을 바꾸는 전략가' },
  { id: 'CMON', name: '진보적 보존주의자', emoji: '🦉', animal: '올빼미', color: '#0EA5E9', tagline: '변화 속에서 균형을 찾는 현자' },
  { id: 'CEFD', name: '진보적 평등주의자', emoji: '🐝', animal: '벌',     color: '#F59E0B', tagline: '연대로 움직이는 진보의 일꾼' },
  { id: 'CEFN', name: '녹색 평등주의자',   emoji: '🦦', animal: '수달',   color: '#65A30D', tagline: '함께 살아가는 자연의 친구' },
  { id: 'CEOD', name: '진보적 사회주의자', emoji: '🐘', animal: '코끼리', color: '#EC4899', tagline: '공동체를 이끄는 든든한 기둥' },
  { id: 'CEON', name: '생태 사회주의자',   emoji: '🐳', animal: '고래',   color: '#0D9488', tagline: '깊고 넓은 연대의 바다' },
  { id: 'SMFD', name: '자유주의적 보수',   emoji: '🦅', animal: '독수리', color: '#D97706', tagline: '높은 곳에서 기회를 노리는 개척자' },
  { id: 'SMFN', name: '녹색 보수주의자',   emoji: '🦌', animal: '사슴',   color: '#16A34A', tagline: '숲을 지키는 조용한 수호자' },
  { id: 'SMOD', name: '전통적 보수주의자', emoji: '🐅', animal: '호랑이', color: '#6366F1', tagline: '당당한 원칙의 수호자' },
  { id: 'SMON', name: '온건 보수주의자',   emoji: '🐢', animal: '거북이', color: '#64748B', tagline: '신중하게 지켜내는 균형의 달인' },
  { id: 'SEFD', name: '사회민주주의자',    emoji: '🐬', animal: '돌고래', color: '#DC2626', tagline: '따뜻한 연대의 항해자' },
  { id: 'SEFN', name: '녹색 사민주의자',   emoji: '🐑', animal: '양',     color: '#059669', tagline: '평화로운 공동체의 일원' },
  { id: 'SEOD', name: '온건 사회주의자',   emoji: '🐻', animal: '곰',     color: '#A855F7', tagline: '든든하게 함께 걷는 동반자' },
  { id: 'SEON', name: '생태 보수주의자',   emoji: '🐼', animal: '판다',   color: '#78716C', tagline: '자연과 함께하는 평온의 상징' },
]

const CFG_OG = { w: 1200, h: 630,  leftRatio: 40, pad: 48, gap: 16, emoji: 240, code: 80,  animal: 22, label: 16, name: 48, tagline: 20, logo: 14 }
const CFG_SQ = { w: 1080, h: 1080, leftRatio: 45, pad: 60, gap: 24, emoji: 360, code: 100, animal: 28, label: 20, name: 56, tagline: 24, logo: 16 }

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
  return {
    type: 'div',
    props: {
      style: { width: cfg.w, height: cfg.h, display: 'flex', fontFamily: 'Pretendard', background: '#FFF9E6', color: '#1a1a1a' },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex', flexDirection: 'column',
              width: `${cfg.leftRatio}%`, background: type.color,
              alignItems: 'center', justifyContent: 'center',
              padding: cfg.pad, color: 'white', gap: cfg.gap,
            },
            children: [
              { type: 'img', props: { src: emojiDataUrl, width: cfg.emoji, height: cfg.emoji, style: { display: 'block' } } },
              { type: 'div', props: { style: { display: 'flex', fontSize: cfg.code, fontWeight: 900, letterSpacing: -4 }, children: type.id } },
              { type: 'div', props: { style: { display: 'flex', fontSize: cfg.animal, opacity: 0.9, fontWeight: 700 }, children: type.animal } },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex', flexDirection: 'column',
              flexGrow: 1, padding: cfg.pad, gap: cfg.gap, background: '#FFF9E6',
            },
            children: [
              { type: 'div', props: { style: { display: 'flex', fontSize: cfg.label, fontWeight: 700, letterSpacing: 4, color: '#666' }, children: '나의 DOS 유형' } },
              { type: 'div', props: { style: { display: 'flex', fontSize: cfg.name, fontWeight: 900 }, children: type.name } },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: cfg.tagline, padding: '12px 16px', background: 'white',
                    border: '2px solid #1a1a1a', borderRadius: 10, color: '#333',
                  },
                  children: `"${type.tagline}"`,
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', marginTop: 'auto', fontSize: cfg.logo, fontWeight: 800, letterSpacing: 3, color: '#666' },
                  children: 'OPENPOLL.CO.KR',
                },
              },
            ],
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
