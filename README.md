# OpenPoll

> 정치 참여를 쉽고 재미있게 - 실시간 투표, 정치 성향 테스트, 밸런스 게임, AI 뉴스 요약을 제공하는 정치 참여 플랫폼

---

## 목차

- [프로젝트 소개](#프로젝트-소개)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
- [환경 변수](#환경-변수)
- [API 엔드포인트](#api-엔드포인트)
- [디자인 시스템](#디자인-시스템)
- [배포](#배포)

---

## 프로젝트 소개

OpenPoll은 MZ세대의 정치 참여를 유도하기 위한 웹 플랫폼입니다. 정당 지지율 투표, 정치 성향 테스트(DOS), 밸런스 게임, AI 기반 중립 뉴스 요약 등 다양한 콘텐츠를 통해 정치를 게이미피케이션 요소와 결합했습니다.

### 핵심 가치

- **접근성** - 복잡한 정치를 간단한 인터랙션으로
- **중립성** - AI 기반 뉴스 요약으로 편향 최소화
- **참여 동기** - 포인트 시스템과 출석체크로 꾸준한 방문 유도
- **실시간성** - SSE 기반 실시간 투표 현황 업데이트

---

## 주요 기능

### 1. 정당 지지율 투표

- 실시간 SSE(Server-Sent Events) 기반 투표 현황
- 연령대별 / 지역별 통계
- 포인트 차감 방식 (신중한 투표 유도)

### 2. DOS (정치 성향 테스트)

- 8축 기반 정치 성향 분석
- 결과 공유 (QR코드, SNS)
- 전체 통계 비교

### 3. 밸런스 게임

- 정치 관련 이분법 토론
- 찬반 투표 + 댓글/대댓글
- 댓글 좋아요

### 4. AI 뉴스

- 네이버 뉴스 자동 크롤링
- OpenAI 기반 중립 요약
- BullMQ 비동기 큐 처리

### 5. 포인트 & 출석체크

- 일일 출석체크 (달력 기반 UI)
- 연속 출석 보너스
- 회원가입, 투표, 테스트 등 활동별 포인트 지급

### 6. 인증

- 이메일/비밀번호 로그인
- Google / Naver OAuth 2.0
- JWT 기반 토큰 관리 (Access + Refresh)

---

## 기술 스택

### Frontend

| 기술         | 버전    | 용도                 |
| ------------ | ------- | -------------------- |
| React        | 19.2.0  | UI 라이브러리        |
| TypeScript   | 5.9.3   | 정적 타입            |
| Vite         | 7.2.5   | 빌드 도구            |
| Tailwind CSS | 4.1.3   | 스타일링 (정적 빌드) |
| React Router | 7.1.3   | 클라이언트 라우팅    |
| motion/react | 12.29.0 | 애니메이션           |
| CVA          | 0.7.1   | 컴포넌트 변형 관리   |
| Axios        | 1.13.4  | HTTP 클라이언트      |
| Lucide React | 0.563.0 | 아이콘               |

### Backend

| 기술            | 버전   | 용도             |
| --------------- | ------ | ---------------- |
| Express         | 4.18.2 | 웹 프레임워크    |
| Prisma          | 5.0.0  | ORM              |
| PostgreSQL      | -      | 데이터베이스     |
| Redis (ioredis) | -      | 캐싱 / 세션 / 큐 |
| BullMQ          | 5.67.2 | 백그라운드 잡 큐 |
| JWT             | -      | 인증             |
| bcrypt          | -      | 비밀번호 해싱    |
| OpenAI API      | -      | 뉴스 AI 요약     |
| Nodemailer      | -      | 이메일 발송      |
| Cheerio         | -      | 웹 크롤링        |

### Infra & CI/CD

| 기술           | 용도                         |
| -------------- | ---------------------------- |
| AWS EC2        | 서버 호스팅 (ap-northeast-2) |
| GitHub Actions | CI/CD 파이프라인             |
| AWS IAM OIDC   | GitHub Actions 인증          |

---

## 프로젝트 구조

```
OpenPoll/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # DB 스키마
│   │   └── seed.js                # 시드 데이터
│   └── src/
│       ├── config/                # 설정 (DB, Redis, 환경변수)
│       ├── constants/             # 상수 (포인트, 연령대, 지역)
│       ├── middlewares/           # 인증, 에러, 검증, 관리자
│       ├── modules/               # 기능 모듈 (MVC 패턴)
│       │   ├── auth/              #   인증 (로그인, OAuth)
│       │   ├── user/              #   사용자
│       │   ├── vote/              #   정당 투표
│       │   ├── point/             #   포인트 & 출석
│       │   ├── balance/           #   밸런스 게임
│       │   ├── party/             #   정당 정보
│       │   ├── dos/               #   정치 성향 테스트
│       │   ├── dashboard/         #   실시간 대시보드 (SSE)
│       │   └── news/              #   뉴스 (크롤러, AI 요약)
│       ├── utils/                 # 유틸리티
│       ├── app.js                 # Express 앱 설정
│       └── server.js              # 서버 진입점
│
├── frontend/openpoll/
│   └── src/
│       ├── api/                   # API 통신 레이어
│       ├── components/            # Atomic Design
│       │   ├── atoms/             #   기본 UI (Button, Badge, Modal...)
│       │   ├── molecules/         #   조합 (LoginModal, AttendanceModal...)
│       │   ├── organisms/         #   복합 (Header, Navigation, Footer)
│       │   └── templates/         #   레이아웃 (MainLayout)
│       ├── contexts/              # React Context (User, Theme, Voting, News)
│       ├── hooks/                 # 커스텀 훅
│       ├── pages/                 # 페이지 컴포넌트
│       │   ├── home/              #   홈 (실시간 투표)
│       │   ├── dos/               #   정치 성향 테스트
│       │   ├── balance/           #   밸런스 게임
│       │   ├── news/              #   뉴스
│       │   ├── attendance/        #   출석체크
│       │   ├── profile/           #   프로필
│       │   ├── auth/              #   인증
│       │   └── legal/             #   이용약관, 개인정보처리방침
│       ├── shared/                # 상수, 유틸리티, 타입
│       └── styles/                # 디자인 토큰, 유틸리티 CSS, 애니메이션
│
├── docs/                          # 프로젝트 문서
└── .github/workflows/             # CI/CD (GitHub Actions)
```

---

## 시작하기

### 사전 요구사항

- Node.js 20+
- PostgreSQL
- Redis

### Backend 설정

```bash
cd backend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일 편집 (아래 환경 변수 섹션 참고)

# DB 마이그레이션
npx prisma migrate dev

# 시드 데이터 (선택)
npx prisma db seed

# 개발 서버 실행
npm run dev
```

### Frontend 설정

```bash
cd frontend/openpoll

# 의존성 설치
npm install

# 개발 서버 실행 (localhost:5173)
npm run dev
```

### 스크립트 목록

**Backend:**

| 명령어               | 설명                   |
| -------------------- | ---------------------- |
| `npm run dev`        | 개발 서버 (nodemon)    |
| `npm start`          | 프로덕션 서버          |
| `npm run db:migrate` | Prisma 마이그레이션    |
| `npm run db:push`    | 스키마 동기화          |
| `npm run db:seed`    | 시드 데이터 생성       |
| `npm run db:studio`  | Prisma Studio (DB GUI) |
| `npm test`           | 테스트 실행            |

**Frontend:**

| 명령어              | 설명                        |
| ------------------- | --------------------------- |
| `npm run dev`       | 개발 서버 (Vite, 5173 포트) |
| `npm run build`     | 프로덕션 빌드               |
| `npm run typecheck` | TypeScript 타입 검사        |
| `npm run lint`      | ESLint 검사                 |
| `npm run preview`   | 빌드 미리보기               |

---

## 환경 변수

### Backend (.env)

```env
# 서버
PORT=3000
NODE_ENV=development

# 데이터베이스
DATABASE_URL=postgresql://user:password@localhost:5432/openpoll

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# SMTP (이메일 인증)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@openpoll.kr

# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/oauth/callback

# OAuth - Naver
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
NAVER_REDIRECT_URI=http://localhost:5173/auth/oauth/callback

# OpenAI (뉴스 AI 요약)
OPENAI_API_KEY=your-openai-api-key

# 뉴스 크롤링
NEWS_INTERVAL_MS=600000
COOLDOWN_SEC=590
```

---

## API 엔드포인트

### 인증 (`/api/auth`)

| Method | Endpoint                    | 설명             | 인증 |
| ------ | --------------------------- | ---------------- | ---- |
| POST   | `/signup`                   | 회원가입         | -    |
| POST   | `/login`                    | 로그인           | -    |
| POST   | `/refresh`                  | 토큰 갱신        | -    |
| POST   | `/logout`                   | 로그아웃         | O    |
| PATCH  | `/password`                 | 비밀번호 변경    | O    |
| GET    | `/oauth/:provider`          | OAuth 리다이렉트 | -    |
| GET    | `/oauth/:provider/callback` | OAuth 콜백       | -    |
| POST   | `/email/send-code`          | 인증 코드 발송   | -    |
| POST   | `/email/verify-code`        | 인증 코드 확인   | -    |
| DELETE | `/withdraw`                 | 회원 탈퇴        | O    |

### 사용자 (`/api/users`)

| Method | Endpoint     | 설명         | 인증 |
| ------ | ------------ | ------------ | ---- |
| GET    | `/me`        | 내 정보 조회 | O    |
| PATCH  | `/me`        | 프로필 수정  | O    |
| GET    | `/me/points` | 포인트 내역  | O    |
| GET    | `/me/votes`  | 투표 통계    | O    |

### 투표 (`/api/votes`)

| Method | Endpoint | 설명      | 인증 |
| ------ | -------- | --------- | ---- |
| POST   | `/`      | 정당 투표 | O    |

### 포인트 & 출석 (`/api/points`)

| Method | Endpoint             | 설명      | 인증 |
| ------ | -------------------- | --------- | ---- |
| GET    | `/attendance/status` | 출석 현황 | O    |
| POST   | `/attendance`        | 출석체크  | O    |

### 밸런스 게임 (`/api/balance`)

| Method | Endpoint                        | 설명        | 인증 |
| ------ | ------------------------------- | ----------- | ---- |
| GET    | `/`                             | 게임 목록   | -    |
| GET    | `/:id`                          | 게임 상세   | -    |
| POST   | `/:id/vote`                     | 투표        | O    |
| GET    | `/:id/comments`                 | 댓글 목록   | -    |
| POST   | `/:id/comments`                 | 댓글 작성   | O    |
| PATCH  | `/:id/comments/:commentId`      | 댓글 수정   | O    |
| DELETE | `/:id/comments/:commentId`      | 댓글 삭제   | O    |
| POST   | `/:id/comments/:commentId/like` | 좋아요 토글 | O    |

### DOS - 정치 성향 테스트 (`/api/dos`)

| Method | Endpoint              | 설명      | 인증 |
| ------ | --------------------- | --------- | ---- |
| GET    | `/questions`          | 질문 목록 | -    |
| POST   | `/calculate`          | 결과 계산 | 선택 |
| GET    | `/result/:resultType` | 유형 상세 | -    |
| GET    | `/statistics`         | 전체 통계 | -    |

### 대시보드 (`/api/dashboard`)

| Method | Endpoint           | 설명              | 인증 |
| ------ | ------------------ | ----------------- | ---- |
| GET    | `/stream`          | SSE 실시간 스트림 | -    |
| GET    | `/stats`           | 전체 투표 통계    | -    |
| GET    | `/stats/by-age`    | 연령별 통계       | -    |
| GET    | `/stats/by-region` | 지역별 통계       | -    |

### 뉴스 (`/api/news`)

| Method | Endpoint    | 설명          | 인증 |
| ------ | ----------- | ------------- | ---- |
| GET    | `/articles` | 기사 목록     | -    |
| POST   | `/refresh`  | 크롤링 트리거 | -    |

---

## 디자인 시스템

### 아키텍처: Atomic Design

```
Atoms → Molecules → Organisms → Templates → Pages
```

- **Atoms**: Button, Badge, Card, Modal, Input, Avatar 등 기본 컴포넌트
- **Molecules**: LoginModal, AttendanceModal, PartyVoteItem 등 조합 컴포넌트
- **Organisms**: Header, Navigation, Footer 등 복합 컴포넌트
- **Templates**: MainLayout (공통 레이아웃)
- **Pages**: Home, DOS, Balance, News, Profile 등

### CSS 구조

| 파일                | 역할                                                          |
| ------------------- | ------------------------------------------------------------- |
| `design-tokens.css` | CSS 변수 (색상, 타이포그래피, 간격, 그림자, z-index)          |
| `utilities.css`     | 시맨틱 유틸리티 클래스 (`.bg-surface`, `.text-foreground` 등) |
| `animations.css`    | 키프레임 애니메이션 & 호버 효과                               |
| `index.css`         | Tailwind v4 사전 컴파일 CSS                                   |

### 다크 모드

- CSS 변수 기반 자동 전환 (`.dark` 클래스)
- 시스템 설정 감지 + 수동 토글
- localStorage 저장

### 폰트

- **Pretendard Variable** (한글 최적화 가변 폰트)
- 시스템 폰트 폴백

---

## 배포

### CI/CD 파이프라인 (GitHub Actions)

`main` 브랜치 push/PR 시 자동 실행:

```
1. backend-ci   → Prisma 검증 → Jest 테스트
2. frontend-ci  → TypeScript 타입체크 → ESLint → Vite 빌드
3. deploy-backend  → AWS SSM → EC2 배포 스크립트 실행
4. deploy-frontend → AWS SSM → EC2 배포 스크립트 실행
```

### 인프라

- **리전**: ap-northeast-2 (서울)
- **서버**: AWS EC2 (백엔드/프론트엔드 분리)
- **인증**: GitHub OIDC → AWS IAM Role

---

## 포인트 시스템

| 활동                 | 포인트  |
| -------------------- | ------- |
| 회원가입             | +500P   |
| 일일 출석            | +30P    |
| 연속 출석 보너스     | +20P/일 |
| DOS 정치 성향 테스트 | +300P   |
| 밸런스 게임 투표     | +50P    |
| 정당 투표            | -5P     |

---

## Rate Limiting

| 대상                   | 제한        |
| ---------------------- | ----------- |
| 로그인 / 비밀번호 변경 | 15분당 10회 |
| 회원가입               | 1시간당 5회 |
| 이메일 인증 코드 발송  | 1분당 3회   |
| 뉴스 크롤링 트리거     | 1분당 1회   |

---

## 라이선스

MIT LISENSE
