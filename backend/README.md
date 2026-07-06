# OpenPoll Backend

정치 참여 플랫폼 **OpenPoll** 의 백엔드 API 서버입니다.
실시간 지지율 집계, AI 뉴스 요약, 정치 성향 테스트, 밸런스 게임, 소셜 로그인, 포인트/출석 등
정치 콘텐츠 플랫폼의 서버 사이드 전반을 담당합니다.

> 상세 엔드포인트 명세는 [API.md](./API.md) 참고.

---

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| 런타임 / 언어 | Node.js (ESM), JavaScript |
| 웹 프레임워크 | Express 4 |
| 데이터베이스 | PostgreSQL + Prisma ORM |
| 캐시 / 인메모리 | Redis (ioredis) |
| 비동기 작업 | BullMQ (뉴스 AI 요약 큐) |
| 인증 | JWT (access/refresh 분리 + 로테이션), bcrypt, OAuth 2.0 (Google · Naver) |
| 실시간 | SSE (Server-Sent Events) |
| 외부 연동 | OpenAI (뉴스 요약), Nodemailer (이메일 인증) |
| 보안 | helmet, CORS, express-rate-limit, express-validator |
| 운영 | PM2 (ecosystem), graceful shutdown, health check |

---

## 아키텍처

### 레이어드 모듈 구조

기능(도메인) 단위로 모듈을 나누고, 각 모듈 내부를 **route → controller → service** 로 분리했습니다.
횡단 관심사(인증, 검증, 에러 처리)는 미들웨어로, 공통 로직은 `utils`/`config` 로 분리했습니다.

```
요청
  │
  ▼
route  ─ 라우팅 + 미들웨어 조립(rate-limit → auth → validation)
  │
  ▼
controller ─ HTTP 입출력 파싱 / 응답 포맷팅 (catchAsyncError 로 감쌈)
  │
  ▼
service ─ 비즈니스 로직 + 트랜잭션 + DB/Redis 접근
  │
  ▼
Prisma / Redis
```

- **controller 는 얇게**: 요청 파싱과 응답 포맷팅만 담당하고 로직은 service 로 위임.
- **service 는 순수 비즈니스 로직**: HTTP(req/res)를 모르게 유지 → 테스트·재사용 용이.
- **에러는 던지고, 한곳에서 처리**: service 는 `AppError` 를 throw 하고
  `catchAsyncError` → 전역 `error.middleware` 로 흘려보내 응답을 일원화.

### 디렉터리 구조

```
src/
├── app.js                 # Express 앱 조립 (미들웨어, 라우터, 에러 핸들러)
├── server.js              # 부팅/graceful shutdown/프로세스 시그널 처리
├── config/                # 환경설정, DB/Redis 클라이언트, 캐시 키·TTL 정의
├── constants/             # 도메인 상수 (포인트 타입, 연령대, 지역)
├── middlewares/           # auth / admin / validate / error
├── utils/                 # AppError, catchAsyncError, response, profanityFilter
└── modules/               # 도메인 모듈
    ├── auth/              #   인증 · OAuth (oauth/ 하위에 provider 전략)
    ├── user/ point/ party/ vote/
    ├── dashboard/         #   실시간 지지율 (SSE)
    ├── dos/               #   정치 성향 테스트
    ├── balance/           #   밸런스 게임 (투표 + 댓글/대댓글/좋아요)
    ├── news/              #   뉴스 크롤링 + AI 요약 (AI/, jobs/)
    ├── chat/ contact/
```

### 주요 설계 결정 (why)

- **JWT access/refresh 분리 + 로테이션**
  access(단기)·refresh(장기)를 분리하고, refresh 토큰은 `jti` 를 담아 발급하되
  **Redis 에 화이트리스트로 저장**한다. 비밀번호 변경·로그아웃·재발급 시 서버에서 무효화가 가능해
  stateless JWT 의 약점(강제 만료 불가)을 보완했다.

- **Redis 의 역할 구분**
  단순 캐시(지지율 통계 TTL 캐싱)뿐 아니라 ▲refresh 토큰 저장 ▲이메일 인증 코드(5분 TTL)
  ▲뉴스 갱신 **분산 락**(중복 크롤링 방지)까지 용도별로 키 네임스페이스(`config/redis.js`)를 분리해 사용.

- **뉴스 파이프라인을 BullMQ 로 비동기화**
  크롤링→본문 파싱→OpenAI 요약은 지연이 크고 실패 가능성이 있어, 요청 흐름과 분리해
  큐 워커에서 처리한다. API 응답 지연과 외부 API 장애 전파를 차단.

- **실시간 지지율은 SSE**
  단방향 서버 푸시(지지율 갱신)에는 WebSocket 대신 SSE 를 채택해 구현·운영 복잡도를 낮췄다.

- **트랜잭션으로 정합성 보장**
  포인트 증감은 항상 `pointHistory` 기록과 함께 일어나야 하므로
  투표/가입/밸런스 투표 등에서 `prisma.$transaction` 으로 원자적으로 처리.

- **일관된 에러 처리**
  `AppError`(운영 에러) + 전역 에러 미들웨어에서 Prisma 에러(P2002→409, P2025→404 등)를
  HTTP 상태로 매핑하고, 프로덕션에서는 비운영 에러의 내부 정보를 숨긴다.

---

## 시작하기

### 사전 요구사항
- Node.js 18+
- PostgreSQL, Redis (로컬은 Docker 권장)

```bash
# 예: 로컬 인프라 (Docker)
docker run -d --name openpoll-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres
docker run -d --name openpoll-redis -p 6379:6379 redis
```

### 설정 & 실행

```bash
# 1) 의존성 설치
npm install

# 2) 환경변수 준비 (.env.example 참고)
cp .env.example .env   # 값 채우기

# 3) DB 스키마 반영 + 시드
npx prisma migrate dev
npm run db:seed

# 4) 개발 서버 실행
npm run dev
```

서버 기동 후 헬스 체크:
```bash
curl http://localhost:3000/api/health
# { "status": "ok", "timestamp": "..." }
```

---

## npm 스크립트

| 스크립트 | 설명 |
|---|---|
| `npm run dev` | nodemon 개발 서버 |
| `npm start` | 프로덕션 실행 |
| `npm run lint` | ESLint 검사 |
| `npm test` | Jest 테스트 |
| `npm run db:migrate` | Prisma 마이그레이션 (dev) |
| `npm run db:push` | 스키마 DB 반영 (마이그레이션 없이) |
| `npm run db:seed` | 시드 데이터 삽입 |
| `npm run db:studio` | Prisma Studio |

---

## 데이터 모델

Prisma 스키마(`prisma/schema.prisma`)에 16개 모델 정의:

- **사용자/인증** — `User`, `OAuthAccount`, `WithdrawnOauth`
- **정치 투표** — `Party`, `Vote`, `PointHistory`, `Attendance`
- **성향 테스트** — `DosQuestion`, `DosResultType`, `DosStatistics`
- **밸런스 게임** — `BalanceGame`, `BalanceVote`, `BalanceComment`, `BalanceCommentLike`
- **콘텐츠** — `Article`(뉴스), `ChatMessage`

---

## 보안 / 운영

- **인증·인가**: JWT 검증 미들웨어(`authenticate`/`optionalAuth`) + 역할 기반 `requireAdmin`
- **입력 검증**: express-validator 기반 모듈별 validation 체인
- **Rate limiting**: 로그인·회원가입·투표·댓글 등 민감 엔드포인트별 제한
- **보안 헤더 / CORS**: helmet, origin 화이트리스트, body 크기 제한(10kb)
- **graceful shutdown**: SIGTERM/SIGINT 수신 시 뉴스 잡 중단 → HTTP 서버 종료 → DB/Redis 정리
- **health check**: `/api/health` 에서 PostgreSQL·Redis 연결 확인 (503 on failure)
- **프로세스 관리**: PM2 (`ecosystem.config.cjs`) — autorestart, max_restarts

---

## 참고

- API 명세: [API.md](./API.md)
- 프로젝트 전체 소개 / 운영 종료 안내: 루트 [README](../README.md)
