/**
 * seo-prerender.mjs
 *
 * Post-build script that reads dist/index.html and generates per-route HTML
 * files with customized <head> tags (title, description, canonical, OG,
 * Twitter, JSON-LD structured data).
 *
 * Usage: node scripts/seo-prerender.mjs
 * (Runs automatically after `vite build` via package.json build script)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = resolve(__dirname, '..', 'dist');
const BASE_URL = 'https://www.openpoll.co.kr';

// ---------------------------------------------------------------------------
// DOS type data
// IMPORTANT: Keep in sync with src/shared/constants/dosResultTypes.ts
// ---------------------------------------------------------------------------
const DOS_TYPES = {
  CMFD: { name: '진보적 자유주의자', desc: '변화를 추구하며 개인의 자유와 경쟁을 중시하고, 발전을 위한 개발에 긍정적인 유형입니다.' },
  CMFN: { name: '녹색 진보주의자', desc: '변화와 자유를 중시하되, 환경 보존에 높은 가치를 두는 유형입니다.' },
  CMOD: { name: '진보적 권위주의자', desc: '변화와 경쟁을 지지하면서 사회 질서를 중시하고, 개발에 적극적인 유형입니다.' },
  CMON: { name: '진보적 보존주의자', desc: '변화를 추구하지만 규율을 중시하며, 환경 보존에 관심이 높은 유형입니다.' },
  CEFD: { name: '진보적 평등주의자', desc: '변화와 평등, 자유를 중시하며 발전을 위한 개발에 긍정적인 유형입니다.' },
  CEFN: { name: '녹색 평등주의자', desc: '변화와 평등, 자유를 추구하면서 환경 보존을 중요시하는 유형입니다.' },
  CEOD: { name: '진보적 사회주의자', desc: '변화와 평등을 지지하며 질서를 중시하고, 개발에 긍정적인 유형입니다.' },
  CEON: { name: '생태 사회주의자', desc: '변화와 평등을 추구하며 질서를 존중하고, 환경 보존에 높은 가치를 두는 유형입니다.' },
  SMFD: { name: '자유주의적 보수', desc: '안정을 선호하며 개인의 자유와 경쟁을 중시하고, 개발에 긍정적인 유형입니다.' },
  SMFN: { name: '녹색 보수주의자', desc: '안정과 자유를 중시하면서 경쟁을 지지하고, 환경 보존에 관심이 높은 유형입니다.' },
  SMOD: { name: '전통적 보수주의자', desc: '안정과 경쟁, 질서를 중시하며 발전을 위한 개발에 적극적인 유형입니다.' },
  SMON: { name: '온건 보수주의자', desc: '안정과 질서를 중시하며 경쟁을 지지하고, 환경 보존에도 관심을 가지는 유형입니다.' },
  SEFD: { name: '사회민주주의자', desc: '안정을 선호하며 평등과 자유를 중시하고, 개발에 긍정적인 유형입니다.' },
  SEFN: { name: '녹색 사민주의자', desc: '안정과 평등, 자유를 중시하면서 환경 보존에 높은 가치를 두는 유형입니다.' },
  SEOD: { name: '온건 사회주의자', desc: '안정과 평등, 질서를 중시하며 발전을 위한 개발에 긍정적인 유형입니다.' },
  SEON: { name: '생태 보수주의자', desc: '안정과 평등, 질서를 중시하며 환경 보존을 우선시하는 유형입니다.' },
};

// ---------------------------------------------------------------------------
// Route definitions
// ---------------------------------------------------------------------------
const DEFAULT_DESC = '정치 성향 DOS 테스트, 밸런스 게임 투표, AI 중립 뉴스를 한 곳에서. 나의 정치적 좌표를 찾고 이슈에 참여하세요.';

const ROUTES = [
  // ── Static pages ────────────────────────────────────────────────────
  {
    path: '/',
    title: 'OpenPoll - 열린 여론조사 | 정치 성향 테스트 · 밸런스 게임 · 중립 뉴스',
    description: DEFAULT_DESC,
  },
  {
    path: '/dos',
    title: '정치 성향 테스트 - 나의 정치 좌표 찾기 | OpenPoll',
    description: '32개 질문으로 나의 정치 성향을 분석하세요. 4가지 축 기반 16유형 정치 성향 테스트. 무료로 지금 바로 시작하세요.',
  },
  {
    path: '/balance',
    title: '정치 밸런스 게임 - 이슈 투표로 의견 나누기 | OpenPoll',
    description: '정치 이슈에 대한 찬반 투표로 당신의 생각을 표현하세요. 다른 사람들의 의견도 확인해보세요.',
  },
  {
    path: '/news',
    title: 'AI 중립 뉴스 - 편향 없는 정치 뉴스 | OpenPoll',
    description: 'AI가 편향과 자극적 표현을 제거한 중립적 정치 뉴스를 읽어보세요. 사실 중심의 객관적 뉴스.',
  },
  {
    path: '/blog',
    title: '정치 교양 블로그 | OpenPoll',
    description: '정치 성향 테스트 가이드, 좌우 정치 스펙트럼 이해, 미디어 리터러시 등 정치 교양 콘텐츠.',
  },
  {
    path: '/about',
    title: 'OpenPoll 소개 - 열린 여론조사 플랫폼 | OpenPoll',
    description: DEFAULT_DESC,
  },
  {
    path: '/privacy',
    title: '개인정보처리방침 | OpenPoll',
    description: DEFAULT_DESC,
  },
  {
    path: '/terms',
    title: '이용약관 | OpenPoll',
    description: DEFAULT_DESC,
  },
  {
    path: '/disclaimer',
    title: '면책조항 | OpenPoll',
    description: DEFAULT_DESC,
  },

  // ── Blog posts ─────────────────────────────────────────────────────
  // IMPORTANT: Keep in sync with src/pages/blog/blogData.ts
  {
    path: '/blog/political-orientation-test-guide',
    title: '정치 성향 테스트란? DOS 테스트로 나의 정치적 좌표 찾기 | OpenPoll 블로그',
    description: '정치 성향 테스트의 개념과 DOS 테스트가 어떻게 작동하는지 알아봅니다. 4가지 축으로 분석하는 나만의 정치적 좌표를 이해해 보세요.',
    blog: { date: '2026-03-15' },
  },
  {
    path: '/blog/left-right-political-spectrum',
    title: '좌파와 우파, 진보와 보수의 차이 쉽게 이해하기 | OpenPoll 블로그',
    description: '좌파, 우파, 진보, 보수라는 용어의 기원과 의미를 알기 쉽게 설명합니다. 한국 정치에서 이 개념들이 어떻게 적용되는지 알아보세요.',
    blog: { date: '2026-03-18' },
  },
  {
    path: '/blog/ai-neutral-news-explained',
    title: 'AI 중립 뉴스란? OpenPoll의 뉴스 중립화 기술 소개 | OpenPoll 블로그',
    description: 'OpenPoll이 AI를 활용해 뉴스를 어떻게 중립적으로 재구성하는지, 그 기술과 원칙을 상세히 설명합니다.',
    blog: { date: '2026-03-22' },
  },
  {
    path: '/blog/balance-game-political-issues',
    title: '밸런스 게임으로 보는 정치 이슈: 참여형 여론조사의 가치 | OpenPoll 블로그',
    description: 'OpenPoll 밸런스 게임이 정치 이슈를 어떻게 쉽게 풀어내는지, 참여형 여론조사가 왜 중요한지 알아봅니다.',
    blog: { date: '2026-03-25' },
  },
  {
    path: '/blog/why-political-participation-matters',
    title: '정치 참여는 왜 중요한가? 민주주의와 시민의 역할 | OpenPoll 블로그',
    description: '민주주의에서 시민의 정치 참여가 왜 중요한지, 일상에서 실천할 수 있는 정치 참여 방법을 알아봅니다.',
    blog: { date: '2026-03-28' },
  },
  {
    path: '/blog/understanding-polls-and-surveys',
    title: '여론조사 제대로 읽는 법: 숫자 뒤에 숨겨진 이야기 | OpenPoll 블로그',
    description: '여론조사 결과를 올바르게 해석하는 방법과, 주의해야 할 함정들을 알아봅니다.',
    blog: { date: '2026-04-01' },
  },
  {
    path: '/blog/media-literacy-fake-news',
    title: '미디어 리터러시: 가짜 뉴스 구별하고 정보 편식 줄이기 | OpenPoll 블로그',
    description: '가짜 뉴스를 구별하는 방법과, 확증 편향에서 벗어나 균형 잡힌 정보를 소비하는 방법을 알아봅니다.',
    blog: { date: '2026-04-03' },
  },
  {
    path: '/blog/korean-political-party-system',
    title: '한국의 정당 체계 이해하기: 다당제와 양당제 사이에서 | OpenPoll 블로그',
    description: '한국 정당 정치의 특징과 역사를 알기 쉽게 설명합니다. 정당 지지율 투표에 참여하기 전에 읽어보세요.',
    blog: { date: '2026-04-05' },
  },
  {
    path: '/blog/how-to-discuss-politics',
    title: '정치 대화를 건설적으로 하는 방법: 토론의 기술 | OpenPoll 블로그',
    description: '정치적 의견이 다른 사람과 감정 싸움 없이 건설적으로 대화하는 방법을 알아봅니다.',
    blog: { date: '2026-04-07' },
  },

  // ── DOS share pages ─────────────────────────────────────────────────
  ...Object.entries(DOS_TYPES).map(([code, { name, desc }]) => ({
    path: `/dos/share/${code}`,
    title: `정치 성향: ${name} (${code}) | OpenPoll DOS 테스트`,
    description: desc,
    dosType: { code, name, desc },
  })),
];

// ---------------------------------------------------------------------------
// Shared JSON-LD schemas (present on every page)
// ---------------------------------------------------------------------------
function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'OpenPoll',
    alternateName: '열린 여론조사',
    url: `${BASE_URL}/`,
    description: '정치 성향 DOS 테스트, 밸런스 게임 투표, AI 중립 뉴스를 한 곳에서.',
    inLanguage: 'ko',
  };
}

function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'OpenPoll',
    url: `${BASE_URL}/`,
    logo: `${BASE_URL}/OPENPOLL-LARGE.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'openpoll2026@gmail.com',
      contactType: 'customer service',
    },
    sameAs: [],
  };
}

// ---------------------------------------------------------------------------
// Page-specific JSON-LD schemas
// ---------------------------------------------------------------------------
function breadcrumbSchema(route) {
  const segments = route.path.split('/').filter(Boolean);
  const items = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
  ];

  let accumulated = '';
  for (let i = 0; i < segments.length; i++) {
    accumulated += `/${segments[i]}`;
    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name: segments[i],
      item: `${BASE_URL}${accumulated}`,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

function quizSchema(route) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: 'DOS 정치 성향 테스트',
    description: '32개 질문으로 나의 정치적 좌표를 분석하는 테스트입니다. 변화, 분배, 권리, 발전의 4가지 축을 기반으로 16가지 정치 성향 유형을 진단합니다.',
    url: `${BASE_URL}${route.path}`,
    provider: {
      '@type': 'Organization',
      name: 'OpenPoll',
      url: `${BASE_URL}/`,
    },
  };

  if (route.dosType) {
    schema.result = {
      '@type': 'Thing',
      name: `${route.dosType.name} (${route.dosType.code})`,
      description: route.dosType.desc,
    };
  }

  return schema;
}

function blogPostingSchema(route) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: route.title.replace(/ \| OpenPoll 블로그$/, ''),
    description: route.description,
    datePublished: route.blog.date,
    author: {
      '@type': 'Organization',
      name: 'OpenPoll',
      url: `${BASE_URL}/`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'OpenPoll',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/OPENPOLL-LARGE.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}${route.path}`,
    },
  };
}

// ---------------------------------------------------------------------------
// HTML template manipulation
// ---------------------------------------------------------------------------
function replaceTag(html, regex, replacement) {
  let matched = false;
  const result = html.replace(regex, () => {
    matched = true;
    return replacement;
  });
  if (!matched) {
    console.warn(`[seo-prerender] WARNING: regex did not match: ${regex}`);
  }
  return result;
}

function generateHTML(template, route) {
  let html = template;

  const fullUrl = route.path === '/'
    ? `${BASE_URL}/`
    : `${BASE_URL}${route.path}`;

  // Title
  html = replaceTag(html, /<title>[^<]*<\/title>/, `<title>${route.title}</title>`);

  // Meta description
  html = replaceTag(
    html,
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${route.description}" />`,
  );

  // Canonical
  html = replaceTag(
    html,
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${fullUrl}" />`,
  );

  // OG tags
  html = replaceTag(
    html,
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${route.title}" />`,
  );
  html = replaceTag(
    html,
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${route.description}" />`,
  );
  html = replaceTag(
    html,
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${fullUrl}" />`,
  );

  // Twitter tags
  html = replaceTag(
    html,
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${route.title}" />`,
  );
  html = replaceTag(
    html,
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${route.description}" />`,
  );

  // og:image & twitter:image 유형별 분기 (DOS 공유 페이지만)
  if (route.dosType) {
    const ogImageUrl = `${BASE_URL}/og/dos/${route.dosType.code}-og.png`;
    const ogImageAlt = `${route.dosType.name} (${route.dosType.code}) - OpenPoll DOS 정치 성향 테스트 결과`;
    html = replaceTag(
      html,
      /<meta property="og:image" content="[^"]*" \/>/,
      `<meta property="og:image" content="${ogImageUrl}" />`,
    );
    html = replaceTag(
      html,
      /<meta property="og:image:alt" content="[^"]*" \/>/,
      `<meta property="og:image:alt" content="${ogImageAlt}" />`,
    );
    html = replaceTag(
      html,
      /<meta name="twitter:image" content="[^"]*" \/>/,
      `<meta name="twitter:image" content="${ogImageUrl}" />`,
    );
    html = replaceTag(
      html,
      /<meta name="twitter:image:alt" content="[^"]*" \/>/,
      `<meta name="twitter:image:alt" content="${ogImageAlt}" />`,
    );
  }

  // ── JSON-LD: remove ALL existing blocks + their HTML comment labels ──
  html = html.replace(
    /\s*<!--\s*Structured Data:[^>]*-->\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g,
    '',
  );
  // Also remove any standalone JSON-LD blocks without comment labels
  html = html.replace(
    /\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g,
    '',
  );

  // ── Build new JSON-LD blocks ─────────────────────────────────────────
  const schemas = [websiteSchema(), organizationSchema()];

  // Homepage: keep FAQPage
  if (route.path === '/') {
    schemas.push(faqPageSchema());
  }

  // Non-homepage: add BreadcrumbList
  if (route.path !== '/') {
    schemas.push(breadcrumbSchema(route));
  }

  // DOS pages: Quiz schema
  if (route.path === '/dos' || route.dosType) {
    schemas.push(quizSchema(route));
  }

  // Blog posts: BlogPosting schema
  if (route.blog) {
    schemas.push(blogPostingSchema(route));
  }

  const ldJsonBlocks = schemas
    .map((s) => `    <script type="application/ld+json">\n    ${JSON.stringify(s, null, 2).replace(/\n/g, '\n    ')}\n    </script>`)
    .join('\n\n');

  // Insert JSON-LD right before </head>
  html = html.replace('</head>', `\n${ldJsonBlocks}\n  </head>`);

  return html;
}

// ---------------------------------------------------------------------------
// FAQPage schema (homepage only)
// ---------------------------------------------------------------------------
function faqPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'OpenPoll은 어떤 서비스인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'OpenPoll은 정치 성향 테스트(DOS), AI 중립 뉴스, 밸런스 게임, 정당 지지율 투표를 제공하는 열린 여론조사 플랫폼입니다.',
        },
      },
      {
        '@type': 'Question',
        name: 'DOS 테스트는 무엇인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'DOS 테스트는 32개의 질문을 통해 나의 정치적 좌표를 분석하는 테스트입니다. 변화, 분배, 권리, 발전의 4가지 축을 기반으로 16가지 정치 성향 유형 중 자신에게 맞는 유형을 찾아줍니다.',
        },
      },
      {
        '@type': 'Question',
        name: 'AI 중립 뉴스는 어떻게 만들어지나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AI가 국내 언론사의 정치 뉴스에서 자극적·편향적 표현을 자동 감지하여 제거하고, 사실 중심으로 기사를 재구성합니다. 원본 기사 출처를 항상 명시합니다.',
        },
      },
      {
        '@type': 'Question',
        name: 'OpenPoll은 특정 정당을 지지하나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '아니요. OpenPoll은 어떤 정당이나 정치적 입장도 지지하지 않습니다. 모든 콘텐츠는 중립성과 객관성을 최우선 원칙으로 제작됩니다.',
        },
      },
      {
        '@type': 'Question',
        name: '포인트는 어떻게 사용하나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '회원가입(+500P), DOS 테스트(+300P), 밸런스 게임 투표(+50P), 일일 출석(+30P) 등으로 포인트를 획득할 수 있습니다. 정당 지지율 투표 시 5P가 소모됩니다.',
        },
      },
      {
        '@type': 'Question',
        name: '밸런스 게임 투표 결과는 공식 여론조사인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '아니요. OpenPoll의 투표 결과는 사용자 참여 데이터를 집계한 것으로, 과학적 표본 추출에 기반한 공식 여론조사가 아닙니다.',
        },
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  const templatePath = resolve(DIST_DIR, 'index.html');

  if (!existsSync(templatePath)) {
    console.error('[seo-prerender] dist/index.html not found. Run vite build first.');
    process.exit(1);
  }

  const template = readFileSync(templatePath, 'utf-8');
  let generated = 0;

  for (const route of ROUTES) {
    const html = generateHTML(template, route);

    if (route.path === '/') {
      // Overwrite dist/index.html itself
      writeFileSync(templatePath, html, 'utf-8');
      console.log(`  [seo-prerender] / -> dist/index.html (overwritten)`);
    } else {
      // e.g. /dos -> dist/dos/index.html
      const dir = resolve(DIST_DIR, route.path.slice(1));
      mkdirSync(dir, { recursive: true });
      writeFileSync(resolve(dir, 'index.html'), html, 'utf-8');
      console.log(`  [seo-prerender] ${route.path} -> dist${route.path}/index.html`);
    }

    generated++;
  }

  console.log(`\n[seo-prerender] Done! Generated ${generated} pages.`);
}

main();
