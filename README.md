<p align="center">
  <img src="frontend/openpoll/public/og-image.png" alt="OpenPoll" width="420" />
</p>

<h1 align="center">OpenPoll</h1>

<p align="center">
  <b>정치 참여를 쉽고 재미있게</b><br/>
  실시간 투표 · 정치 성향 테스트 · 밸런스 게임 · AI 뉴스 요약
</p>

<p align="center">
  <a href="https://openpoll.co.kr"><s>openpoll.co.kr</s></a> &nbsp;·&nbsp; <i>운영 종료</i>
</p>

---

> ## 프로젝트 종료 안내
>
> **OpenPoll 서비스는 2026년 5월을 끝으로 운영을 종료했습니다.**
> 본 저장소는 학습 / 포트폴리오 목적으로 보존됩니다.
>
> | | |
> |---|---|
> | **운영 기간** | 2026-01-24 ~ 2026-05-11 (약 3.5개월) |
> | **종료 사유** | AWS 인프라 운영비 부담 (월 약 $200) + Google AdSense 수익화 미승인 |
> | **데이터 처리** | RDS 최종 스냅샷 보관, 사용자 식별 정보 분리 보관 |
> | **재배포 가이드** | [docs/OpenPoll_AWS_종료_가이드.pdf](docs/OpenPoll_AWS_종료_가이드.pdf) |
>
> 라이브 URL `www.openpoll.co.kr` 은 더 이상 응답하지 않습니다.
> 로컬 개발 환경에서는 여전히 풀스택으로 구동 가능합니다 — 하단 [시작하기](#시작하기) 참조.

---

## 한 줄 요약

MZ세대의 정치 참여를 게이미피케이션으로 유도한 풀스택 웹 플랫폼.
회원·투표·SSE 실시간 통계·AI 뉴스 요약·정치 성향 테스트(DOS)·밸런스 게임·포인트·출석·공유 카드까지 — 정치 콘텐츠 플랫폼의 풀세트를 약 3.5개월에 구축하고 4개월간 실서비스로 운영했습니다.

---

## 프로젝트 정보

| 항목 | 내용 |
|---|---|
| 프로젝트 유형 | 데브코스 풀스택 8기 팀 프로젝트 → 이후 단독 운영 |
| 개발 기간 | 2026-01-24 ~ 2026-04-23 |
| 운영 기간 | ~ 2026-05-11 |
| 총 커밋 수 | 233 (no-merge 기준) |
| 기여자 | 5명, 3월부턴 2명이 운영 (팀 프로젝트 기간) |
| 도메인 | https://www.openpoll.co.kr (종료) |
| 인프라 | AWS (ap-northeast-2) |
| 라이선스 | MIT |

### 팀 구성 / 역할

OpenPoll 은 **데브코스 풀스택 8기의 팀 프로젝트로 시작**해 MVP 를 만들어냈고, 그 이후의 **운영·인프라·다크모드 전환·SEO·분석 도구 연동·결과 카드 리디자인·종료까지 모든 작업은 단독으로 진행**했습니다.

본인 (조보근, [@Aen](https://github.com/Aen)) 의 담당 영역:

- **풀스택 개발** — Frontend (React 19 + TypeScript) 와 Backend (Node.js + Express + Prisma) 전반
- **AWS 인프라 직접 운영** — EC2 / RDS / ALB / NAT Gateway / Route 53 / SSM Parameter Store
- **CI/CD 파이프라인** — GitHub Actions + AWS OIDC + SSM Send Command (키 없는 인증)
- **다크모드 전면 도입** — CSS 변수 기반 design-tokens + 시맨틱 utilities + `.dark` 클래스 swap
- **디자인 시스템 구축** — CVA + Atomic Design + Tailwind v4 정적 빌드 환경 위에 자체 토큰 시스템
- **실시간 시스템** — SSE 기반 투표 대시보드, BullMQ 비동기 뉴스 요약 큐, 전체 채팅
- **분석 / SEO / 광고** — GTM, GA4, MS Clarity, AdSense, sitemap, OG 이미지 동적 생성
- **비용 절감** — ElastiCache Serverless → 로컬 Redis6 (AOF) 전환

---

## 목표

> 투표율은 매년 떨어지고, 정치 콘텐츠는 점점 어렵거나 자극적으로 변합니다.
> 특히 MZ세대는 정치를 "복잡하다" "관심 없다" 로 회피하기 쉽습니다.
> OpenPoll 은 그 거리를 좁히기 위해 만들어졌습니다.

### 핵심 가치

| | |
|---|---|
| **접근성** | 복잡한 정치를 단순한 인터랙션으로 — DOS 8축 테스트, 밸런스 게임 |
| **중립성** | AI 기반 요약으로 정보 편향 최소화, 정당 노출 알파벳 순서 |
| **참여 동기** | 포인트·출석·공유 가능한 결과 카드로 자발적 방문 유도 |
| **실시간성** | SSE 기반 투표 현황 — "참여하고 있다" 는 감각 제공 |

---

## 주요 기능

### 정당 지지율 투표
실시간 SSE 기반 투표 현황. 연령대별·지역별 통계를 시각화하고, 포인트 차감 방식으로 신중한 투표를 유도합니다.

### DOS 정치 성향 테스트
8축 기반 정치 성향 분석. 결과를 SNS · QR 코드 · 결과 카드 이미지로 공유 가능하며, 전체 응답자 통계와 비교할 수 있습니다.

### 밸런스 게임
정치 관련 이분법 질문에 찬반 투표를 하고, 댓글 · 대댓글 · 좋아요로 토론에 참여합니다.

### AI 뉴스
네이버 뉴스를 자동 크롤링한 뒤 OpenAI API 로 중립적 요약을 생성합니다. BullMQ 비동기 큐로 처리합니다.

### 포인트 & 출석체크
달력 기반 출석 UI, 연속 출석 보너스, 활동별 포인트 지급으로 참여를 유도합니다.

| 활동 | 포인트 |
|---|---|
| 회원가입 | +500P |
| 일일 출석 | +30P |
| 연속 출석 보너스 | +20P/일 |
| DOS 정치 성향 테스트 | +300P |
| 밸런스 게임 투표 | +50P |
| 정당 투표 | -5P |

### 실시간 전체 채팅
SSE 기반 실시간 채팅 위젯. 한국어 욕설 필터, 운영자 메시지 강조, 읽지 않은 메시지 배지(99+) 지원.

### 인증
이메일/비밀번호 로그인과 Google · Naver OAuth 2.0 을 지원합니다. JWT 기반 Access + Refresh 토큰으로 세션을 관리합니다.

---

## 개발 과정 / 마일스톤

```
2026-01  ┃ 데브코스 8기 팀 프로젝트 킥오프 — FE/BE 디렉터리 분리, Vite + Express 초기 셋업
2026-02  ┃ 인증(JWT + OAuth), 정당 투표, 포인트 시스템, DOS 8축 테스트 기본형
2026-03  ┃ 밸런스 게임 + 댓글/대댓글/좋아요, 뉴스 크롤러 + OpenAI 요약 BullMQ 큐
   ↓     ┃ MVP 완성, 데브코스 팀 프로젝트 종료
   ↓
2026-04  ┃ [단독 운영 시작]
   ↓     ┃ AWS 인프라 안정화 — ALB 헬스체크 경로 수정, nginx default block 충돌 해결
         ┃ SSE 대시보드, 출석체크 달력, OG 이미지 satori 동적 생성
         ┃ 다크모드 전면 도입 — CSS 변수 기반 design tokens + 시맨틱 utilities
         ┃ ElastiCache Serverless → 로컬 Redis6 AOF 전환 (비용 절감)
         ┃ GA4 / GTM / MS Clarity / AdSense 연동, sitemap.xml, ads.txt
2026-05  ┃ 결과 카드 리디자인, FAQ 섹션, 공유 페이지 다크모드 충돌 수정
   ↓     ┃ AdSense 최종 거절 + AWS 약 $200/월 청구 → 운영 종료 결정
2026-05-11 ┃ 종료 가이드 PDF 작성, README 회고 정리, 운영 중단
```

---

## 주요 도전과 해결

### 1. 비용 출혈 인지 → 인프라 다이어트
첫 AWS 청구서가 예상보다 컸다. ElastiCache Serverless 가 사이드 프로젝트 규모 대비 과다 비용. 동일 BE EC2 에 **로컬 Redis6 (AOF 활성화)** 를 띄워 외부 의존을 끊고, 부수적으로 네트워크 레이턴시까지 개선했다. 단일 인스턴스 스케일링 포기라는 트레이드오프를 의식적으로 받아들였다.

### 2. Tailwind v4 정적 빌드 환경에서의 디자인 시스템
Tailwind v4 정적 빌드 특성상 런타임 임의 클래스 생성이 불가하다. 처음엔 제약처럼 느껴졌지만, 정공법으로 받아들이고 CSS 변수 기반 `design-tokens.css` + 시맨틱 `utilities.css` 를 별도 구축했다. 결과적으로 다크모드 전환을 `.dark` 클래스 한 줄로 처리할 수 있는 깔끔한 구조가 되었다.

### 3. 다크모드 전면 도입
이미 라이트모드 가정으로 만들어진 페이지가 수십 개였다. 페이지별로 하드코딩된 `bg-black` / `text-white` 를 시맨틱 토큰으로 교체. 가장 마지막에 발견된 이슈가 **DOS 결과 공유 페이지의 강제 다크 배경 + 자식 컴포넌트의 라이트 분기 충돌** — 종료 직전까지 잡아내어 마무리했다.

### 4. 정치 콘텐츠의 중립성
좌/우 어느 한쪽으로 기울지 않게 하는 것은 기술 문제가 아니라 콘텐츠 설계 문제다. OpenAI 요약 프롬프트, DOS 8축 설계, 밸런스 게임 문제 작성, 정당 UI 노출 순서 (알파벳 순) 등 곳곳에서 의도적으로 중립을 유지하려 노력했다.

### 5. SSM 기반 운영
EC2 를 private subnet 에 격납해 일반 SSH 가 불가능했다. 모든 운영 명령을 **AWS SSM Session Manager** 로 수행하는 데 적응. CI/CD 는 **GitHub OIDC → IAM Role → SSM Send Command** 로 비밀키 없이 배포되도록 구성했다.

### 6. 투표 이중카운트 버그
대시보드에서 `Party.voteCount` 컬럼과 `Vote` 테이블 집계가 동시에 더해져 수치가 두 배로 나타나던 버그가 있었다. 데이터 일관성을 위해 집계 책임을 한 쪽으로 통일하는 식으로 수정했다.

### 7. ALB 헬스체크 오타 이슈
초기에 `/api/healthy` 라는 오타로 ALB 헬스체크가 장기간 404 를 쌓고 있었다. 발견 후 `/api/health` 로 수정 — 사소해 보이지만 ALB 의 비정상 응답 누적은 장기적으로 비용과 모니터링 신뢰도 모두에 영향을 준다는 교훈을 남겼다.

---

## 성과 / 결과물

- 정치 콘텐츠 풀스택 플랫폼의 **MVP 완성 → 실서비스 배포 → 약 4개월 운영** 사이클 완주
- 도메인 `openpoll.co.kr` 위에 **HTTPS + Route 53 + ALB + GitHub Actions 자동 배포** 구성
- GA4 / GTM / MS Clarity 연동으로 트래픽 분석 환경 구축
- OpenAI API 기반 뉴스 자동 요약 파이프라인 (BullMQ 워커, 동시성 3) 운영
- 다크모드 + 시맨틱 디자인 토큰 시스템 직접 설계 및 전체 페이지에 적용
- 외부 노출: **EO Planet 아티클 게재**, 데브코스 멘토 피드백 수렴
- **학습 자산 보존** — AWS 비용 구조, private subnet 운영, SSE / BullMQ / Prisma 운영 노하우, 다크모드 전환 경험이 모두 본 저장소 내 코드 / 커밋 / 문서로 남아 있다

---

## 종료 결정과 회고

AdSense 신청이 거절되면서 수익화 경로가 흐려졌고, 매월 AWS **약 $200** 의 고정 출혈을 학습 비용으로만 부담하기에는 과하다고 판단해 운영 종료를 결정했다.

종료 결정 자체보다 더 중요한 것은 **종료의 방식**이었다. 단순히 인스턴스를 꺼버리면 EBS · EIP · Detached 리소스가 보이지 않는 곳에서 계속 과금된다. 그래서 종료 전 마지막 작업으로 [docs/OpenPoll_AWS_종료_가이드.pdf](docs/OpenPoll_AWS_종료_가이드.pdf) 를 작성했다. 무엇을 왜 삭제해야 하는지, 무엇을 백업해야 하는지, 그리고 **언제든 다시 같은 인프라로 올릴 수 있는 12단계 재배포 가이드**까지 포함했다.

서비스는 종료되지만 자산은 남는다. 코드와 인프라 운영 노하우는 본 저장소에, 회고는 이 문서에, 비용 구조 학습은 PDF 가이드에 — 다음 프로젝트에서 같은 비용 함정에 빠지지 않기 위한 기록으로 남긴다.

— 2026-05-11, 조보근

---

## 종료 후 자료

- [AWS 종료 / 재배포 가이드 (PDF)](docs/OpenPoll_AWS_종료_가이드.pdf) — 현재 인프라 / 삭제 절차 / 재배포 가이드 / 비용 알람
- [AWS 종료 / 재배포 가이드 (HTML)](docs/OpenPoll_AWS_종료_가이드.html) — 위 PDF 원본 (편집 가능)
- [Backend TODO 회고](docs/backend-todo.md) — 백엔드 작업 메모

---

## 기술 스택

### Frontend

| 기술 | 버전 | 용도 |
|---|---|---|
| React | 19.2 | UI 라이브러리 |
| TypeScript | 5.9 | 정적 타입 |
| Vite (rolldown-vite) | 7.2.5 | 빌드 도구 |
| Tailwind CSS | 4.1 | 스타일링 (정적 빌드) |
| React Router | 7.1 | 클라이언트 라우팅 |
| motion/react | 12.29 | 애니메이션 |
| CVA | 0.7 | 컴포넌트 변형 관리 |
| Axios | 1.13 | HTTP 클라이언트 |
| Lucide React | 0.563 | 아이콘 |
| Swiper | 12.1 | 캐러셀 |
| satori + resvg | — | OG 이미지 동적 생성 |
| html-to-image | 1.11 | 결과 카드 이미지 저장 |

### Backend

| 기술 | 버전 | 용도 |
|---|---|---|
| Express | 4.18 | 웹 프레임워크 |
| Prisma | 5.0 | ORM |
| PostgreSQL | — | 데이터베이스 |
| Redis (ioredis) | 5.9 | 캐싱·세션·큐 |
| BullMQ | 5.67 | 백그라운드 잡 큐 |
| JWT | 9.0 | 인증 |
| bcrypt | 6.0 | 비밀번호 해싱 |
| OpenAI API | 6.17 | 뉴스 AI 요약 |
| Nodemailer | 8.0 | 이메일 발송 |
| Cheerio | 1.2 | 웹 크롤링 |
| Helmet | 8.1 | 보안 헤더 |
| express-rate-limit | 8.2 | Rate Limiting |

### Infra & CI/CD

| 기술 | 용도 |
|---|---|
| AWS EC2 (ap-northeast-2) | 서버 호스팅 (BE + FE 분리) |
| AWS RDS PostgreSQL | 메인 DB |
| AWS ALB | 80/443 수신 + EC2 포워딩 |
| AWS Route 53 | DNS |
| AWS SSM Parameter Store | 환경변수 / Secret 관리 |
| AWS SSM Session Manager | private subnet EC2 접속 |
| GitHub Actions | CI/CD 파이프라인 |
| AWS IAM OIDC | GitHub Actions → AWS 인증 (키 없는) |
| nginx | FE 정적 파일 서빙 + SPA 라우팅 |
| PM2 | Node 프로세스 매니저 |

---

## 아키텍처

### 시스템 다이어그램

```
[사용자]
   ↓ HTTPS
[Route 53 — openpoll.co.kr / www]
   ↓
[ALB (public subnet, 80→443 리다이렉트)]
   ↓
[EC2 FE — nginx + SPA]   [EC2 BE — Node + Express + PM2 + 로컬 Redis6]
                                ↓
                          [RDS PostgreSQL (private subnet)]

[Parameter Store: /openpoll/prod/*] → EC2 (IAM Role 로 읽기)
[GitHub Actions] → AWS OIDC → SSM Send Command → EC2 배포 스크립트
```

### Frontend — Atomic Design

```
Atoms → Molecules → Organisms → Templates → Pages
```

- **Atoms** — Button, Badge, Card, Modal, Input, Avatar 등 기본 컴포넌트
- **Molecules** — LoginModal, AttendanceModal, PartyVoteItem 등 조합 컴포넌트
- **Organisms** — Header, Navigation, Footer 등 복합 컴포넌트
- **Templates** — MainLayout (공통 레이아웃)
- **Pages** — Home, DOS, Balance, News, Profile 등

### CSS 구조

| 파일 | 역할 |
|---|---|
| `design-tokens.css` | CSS 변수 (색상, 타이포그래피, 간격, 그림자, z-index) |
| `utilities.css` | 시맨틱 유틸리티 클래스 (`.bg-surface`, `.text-foreground` 등) |
| `animations.css` | 키프레임 애니메이션 & 호버 효과 |
| `index.css` | Tailwind v4 사전 컴파일 CSS |

다크 모드는 CSS 변수 기반 자동 전환 (`.dark` 클래스) 을 사용하며, 시스템 설정 감지 + 수동 토글 + localStorage 저장을 지원합니다.

### Backend — 모듈 기반 MVC

```
src/modules/
├── auth/        # 인증 (로그인, OAuth)
├── user/        # 사용자
├── vote/        # 정당 투표
├── point/       # 포인트 & 출석
├── balance/     # 밸런스 게임
├── party/       # 정당 정보
├── dos/         # 정치 성향 테스트
├── dashboard/   # 실시간 대시보드 (SSE)
├── chat/        # 실시간 전체 채팅 (SSE)
└── news/        # 뉴스 (크롤러, AI 요약)
```

---

## 프로젝트 구조

```
OpenPoll/
├── backend/
│   ├── prisma/                # DB 스키마 & 시드
│   └── src/
│       ├── config/            # DB, Redis, 환경변수 설정
│       ├── constants/         # 포인트, 연령대, 지역 상수
│       ├── middlewares/       # 인증, 에러, 검증, 관리자
│       ├── modules/           # 기능 모듈 (MVC)
│       ├── utils/             # 유틸리티
│       ├── app.js             # Express 앱 설정
│       └── server.js          # 서버 진입점
│
├── frontend/openpoll/
│   ├── public/                # 정적 파일, OG 이미지, sitemap.xml
│   ├── scripts/               # OG 생성, SEO 프리렌더
│   └── src/
│       ├── api/               # API 통신 레이어
│       ├── components/        # Atomic Design
│       ├── contexts/          # React Context (User, Theme, Voting, News)
│       ├── hooks/             # 커스텀 훅
│       ├── pages/             # 페이지 컴포넌트
│       ├── shared/            # 상수, 유틸리티, 타입
│       └── styles/            # 디자인 토큰, 유틸리티 CSS, 애니메이션
│
├── docs/                      # 종료 가이드, 백엔드 회고
└── .github/workflows/         # CI/CD (GitHub Actions)
```

---

## 시작하기

> 라이브 서비스는 종료되었지만, 로컬에서 풀스택을 띄워볼 수 있습니다.

### 사전 요구사항

- Node.js 20+
- PostgreSQL
- Redis

### Backend

```bash
cd backend
npm install
# backend/.env 파일을 직접 생성 후 필요한 키 입력
npx prisma migrate dev
npx prisma db seed     # 시드 데이터 (선택)
npm run dev
```

### Frontend

```bash
cd frontend/openpoll
npm install
npm run dev            # localhost:5173
```

### 스크립트

**Backend:**

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 (nodemon) |
| `npm start` | 프로덕션 서버 |
| `npm run db:migrate` | Prisma 마이그레이션 |
| `npm run db:push` | 스키마 동기화 |
| `npm run db:seed` | 시드 데이터 생성 |
| `npm run db:studio` | Prisma Studio (DB GUI) |
| `npm test` | 테스트 실행 |

**Frontend:**

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 (Vite, 5173 포트) |
| `npm run build` | 프로덕션 빌드 |
| `npm run typecheck` | TypeScript 타입 검사 |
| `npm run lint` | ESLint 검사 |
| `npm run preview` | 빌드 미리보기 |

---

## 환경 변수

운영에 사용된 실제 환경 변수 값은 본 저장소에 포함되어 있지 않으며, 운영자가 별도로 안전하게 보관합니다.
필요한 키와 값은 종료된 프로젝트 특성상 외부에 공개하지 않습니다 — 로컬에서 직접 띄워볼 경우, 코드 내 `process.env.*` 참조를 따라 필요한 항목만 채우면 됩니다.

`backend/.env` 파일은 `.gitignore` 로 추적에서 제외되어 있으므로 실수로도 커밋되지 않습니다.

---

## API

### 인증 — `/api/auth`

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| POST | `/signup` | 회원가입 | - |
| POST | `/login` | 로그인 | - |
| POST | `/refresh` | 토큰 갱신 | - |
| POST | `/logout` | 로그아웃 | O |
| PATCH | `/password` | 비밀번호 변경 | O |
| GET | `/oauth/:provider` | OAuth 리다이렉트 | - |
| GET | `/oauth/:provider/callback` | OAuth 콜백 | - |
| POST | `/email/send-code` | 인증 코드 발송 | - |
| POST | `/email/verify-code` | 인증 코드 확인 | - |
| DELETE | `/withdraw` | 회원 탈퇴 | O |

### 사용자 — `/api/users`

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| GET | `/me` | 내 정보 조회 | O |
| PATCH | `/me` | 프로필 수정 | O |
| GET | `/me/points` | 포인트 내역 | O |
| GET | `/me/votes` | 투표 통계 | O |

### 투표 — `/api/votes`

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| POST | `/` | 정당 투표 | O |

### 포인트 & 출석 — `/api/points`

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| GET | `/attendance/status` | 출석 현황 | O |
| POST | `/attendance` | 출석체크 | O |

### 밸런스 게임 — `/api/balance`

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| GET | `/` | 게임 목록 | - |
| GET | `/:id` | 게임 상세 | - |
| POST | `/:id/vote` | 투표 | O |
| GET | `/:id/comments` | 댓글 목록 | - |
| POST | `/:id/comments` | 댓글 작성 | O |
| PATCH | `/:id/comments/:commentId` | 댓글 수정 | O |
| DELETE | `/:id/comments/:commentId` | 댓글 삭제 | O |
| POST | `/:id/comments/:commentId/like` | 좋아요 토글 | O |

### DOS 정치 성향 테스트 — `/api/dos`

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| GET | `/questions` | 질문 목록 | - |
| POST | `/calculate` | 결과 계산 | 선택 |
| GET | `/result/:resultType` | 유형 상세 | - |
| GET | `/statistics` | 전체 통계 | - |

### 대시보드 — `/api/dashboard`

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| GET | `/stream` | SSE 실시간 스트림 | - |
| GET | `/stats` | 전체 투표 통계 | - |
| GET | `/stats/by-age` | 연령별 통계 | - |
| GET | `/stats/by-region` | 지역별 통계 | - |

### 채팅 — `/api/chat`

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| GET | `/stream` | SSE 채팅 스트림 | - |
| GET | `/messages` | 최근 메시지 목록 | - |
| POST | `/messages` | 메시지 전송 | O |

### 뉴스 — `/api/news`

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| GET | `/articles` | 기사 목록 | - |
| POST | `/refresh` | 크롤링 트리거 | - |

### Rate Limiting

| 대상 | 제한 |
|---|---|
| 로그인 · 비밀번호 변경 | 15분당 10회 |
| 회원가입 | 1시간당 5회 |
| 이메일 인증 코드 발송 | 1분당 3회 |
| 뉴스 크롤링 트리거 | 1분당 1회 |
| 채팅 메시지 전송 | 1분당 10회 |
| 채팅 메시지 읽기 | 1분당 30회 |

---

## 배포 (운영 종료 전 기준)

`main` 브랜치에 push 하면 GitHub Actions 가 자동으로 CI/CD 파이프라인을 실행했습니다.

```
1. backend-ci   → Prisma 검증 → Jest 테스트
2. frontend-ci  → TypeScript 타입체크 → ESLint → Vite 빌드
3. deploy-backend  → AWS SSM → EC2 배포
4. deploy-frontend → AWS SSM → EC2 배포
```

- **리전**: ap-northeast-2 (서울)
- **인증**: GitHub OIDC → AWS IAM Role (키 없는 인증)
- **배포 방식**: AWS SSM Send Command → EC2 배포 스크립트 실행

> 다시 같은 인프라로 올리는 방법은 [docs/OpenPoll_AWS_종료_가이드.pdf](docs/OpenPoll_AWS_종료_가이드.pdf) 5장 "재배포 가이드" 를 참고하세요.

---

## 라이선스

MIT License

---

<p align="center"><sub>OpenPoll — 2026.01 ~ 2026.05</sub></p>
