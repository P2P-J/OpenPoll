# 백엔드 배포 준비 — 수정 사항 정리


**일단 프론트엔드 쪽은 백엔드가 수정되어야 수정할 수 있는 것 빼고는 거의 다 해뒀습니다.**

**하지만**

**배포 하기 전 리팩토링을 전체적으로 해본 결과, 배포는 가능하지만, 최대한 빠른 시일 내로 수정이 되어야 하는 것들이 백엔드 쪽에서 많이 발견됩니다.**

**그래서 꼭 필요한 것들만 조금 해뒀습니다.** 
 
**아래에 자세히 작성해뒀으니 꼬오옥! 읽어주세요**

**프로덕션 배포를 앞두고 보안·안정성·성능을 점검한 결과입니다.**

---

## 배포 전 해야 할 것

### 1. PM2 프로세스 매니저 설치 및 실행

현재 `node src/server.js`로 단일 프로세스를 실행하고 있습니다.
이 상태에서는 예외가 발생해 프로세스가 죽으면 서버가 영구적으로 다운되며, 수동으로 재시작해야 합니다.

PM2는 Node.js 프로세스 매니저로, 크래시 시 자동 재시작과 서버 재부팅 시 자동 실행을 지원합니다.

```bash
npm install -g pm2
pm2 start ecosystem.config.cjs    # 프로젝트 루트에 설정 파일이 이미 있음
pm2 save                           # 현재 프로세스 목록 저장
pm2 startup                        # OS 부팅 시 자동 실행 등록
```

### 2. DB 마이그레이션 실행

아래 "성능" 섹션에서 설명하는 DB 인덱스가 `schema.prisma`에 추가되었습니다.
배포 서버에서 마이그레이션을 실행해야 실제 DB에 인덱스가 반영됩니다.

```bash
cd backend
npx prisma migrate deploy          # 프로덕션에서는 deploy 사용 (dev 아님)
```

---

## 미완료 — 여유 있을 때 진행

### Refresh Token을 httpOnly 쿠키로 전환

**문제:**
현재 Access Token과 Refresh Token 모두 `localStorage`에 저장하고 있습니다.
`localStorage`는 JavaScript로 자유롭게 접근 가능하기 때문에, XSS(Cross-Site Scripting) 공격이 발생하면 공격자가 Refresh Token을 탈취하여 사용자 계정을 장기간 도용할 수 있습니다.

**해결 방향:**
Refresh Token을 `localStorage` 대신 `httpOnly` 쿠키에 저장하면, JavaScript에서 접근이 불가능해져 XSS로부터 안전합니다.

**백엔드 수정 필요:**

- 로그인/토큰갱신 응답에서 Refresh Token을 `Set-Cookie` 헤더로 전달
  - `httpOnly: true` — JS 접근 차단
  - `Secure: true` — HTTPS에서만 전송
  - `SameSite: Strict` — CSRF 방지
- `/api/auth/refresh` 엔드포인트에서 요청 본문 대신 쿠키에서 Refresh Token을 읽도록 변경

**프론트엔드 수정 필요 (동시에 해야 함):**

- `localStorage`에서 Refresh Token을 저장/읽기하는 코드 제거
- Access Token만 `localStorage` 또는 메모리에 보관
- Axios 요청에 `withCredentials: true` 설정 (쿠키 자동 전송)

> 프론트·백 동시 배포가 필요한 작업이라 별도 일정에 진행하는 것을 권장합니다.

---

## 완료된 항목

### 1. 보안 헤더 — Helmet 적용

**문제:** Express 기본 설정은 보안 관련 HTTP 헤더를 전혀 설정하지 않습니다. 이로 인해 클릭재킹(X-Frame-Options 미설정), MIME 스니핑(X-Content-Type-Options 미설정), XSS 필터 미활성화 등의 공격에 노출됩니다.

**해결:** `helmet` 미들웨어를 적용하여 `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security` 등 주요 보안 헤더를 자동으로 설정합니다.

**수정 파일:** `app.js`

---

### 2. Trust Proxy 설정

**문제:** AWS EC2 + 로드밸런서/Nginx 환경에서 Express는 클라이언트의 실제 IP 대신 프록시(127.0.0.1)의 IP를 인식합니다. 이 상태에서 Rate Limiting을 적용하면 모든 사용자가 같은 IP로 인식되어, 한 명이 제한에 걸리면 전체 사용자가 차단됩니다.

**해결:** `app.set('trust proxy', 1)`을 설정하여 `X-Forwarded-For` 헤더에서 실제 클라이언트 IP를 읽도록 했습니다. `1`은 프록시가 1단계임을 의미합니다.

**수정 파일:** `app.js`

---

### 3. Rate Limiting 추가 (4개 엔드포인트)

**문제:** 기존에는 `auth`, `contact`, `news` 라우트에만 Rate Limiting이 적용되어 있었습니다. 나머지 엔드포인트는 제한이 없어서 다음과 같은 공격이 가능했습니다:

| 위험             | 엔드포인트                       | 공격 시나리오                         |
| ---------------- | -------------------------------- | ------------------------------------- |
| 밸런스 게임 스팸 | `POST /api/balance/:id/vote`     | 한쪽에 대량 투표로 결과 왜곡          |
| 댓글 스팸        | `POST /api/balance/:id/comments` | 자동화된 댓글 도배                    |
| 출석 어뷰징      | `POST /api/points/attendance`    | 포인트 부정 획득 시도                 |
| 닉네임 열거      | `GET /api/auth/check-nickname`   | 전체 닉네임 목록 수집 (개인정보 유출) |

**해결:** 각 엔드포인트에 `express-rate-limit` 미들웨어를 추가했습니다. 기존 auth 라우트와 동일한 패턴을 사용합니다.

| 엔드포인트                       | 제한       | 수정 파일          |
| -------------------------------- | ---------- | ------------------ |
| `POST /api/balance/:id/vote`     | 1분당 20회 | `balance.route.js` |
| `POST /api/balance/:id/comments` | 1분당 20회 | `balance.route.js` |
| `POST /api/points/attendance`    | 1분당 6회  | `point.route.js`   |
| `GET /api/auth/check-nickname`   | 1분당 60회 | `auth.route.js`    |

> `POST /api/votes`(정당 투표)는 Rate Limit을 적용하지 않았습니다. 투표 시 포인트(-5P)가 차감되는 시스템이 이미 설계되어 있어, 포인트가 소진되면 자연스럽게 투표가 불가능해집니다. 포인트 시스템이 Rate Limiting 역할을 대체합니다.

> SSE(`GET /api/dashboard/stream`)는 페이지 접속·새로고침 시마다 재연결이 필요하므로 rate limit을 적용하지 않았습니다.

제한에 걸리면 `{ success: false, message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' }` 응답을 반환합니다.

---

### 4. 뉴스 크롤링 엔드포인트 인증 추가

**문제:** `POST /api/news/refresh`는 네이버 뉴스를 크롤링하고 OpenAI API로 요약을 생성하는 엔드포인트입니다. 인증 없이 누구나 호출할 수 있었기 때문에, 외부인이 반복 호출하면 OpenAI API 비용이 무제한으로 발생할 수 있었습니다.

**해결:** `authenticate`(로그인 필수) + `requireAdmin`(관리자 권한 필수) 미들웨어를 추가했습니다. 일반 사용자는 호출할 수 없고, 관리자만 수동으로 크롤링을 트리거할 수 있습니다.

> 참고: 자동 크롤링은 `setInterval`로 서버 내부에서 실행되므로(`refreshJob.js`), 이 변경의 영향을 받지 않습니다.

**수정 파일:** `news.route.js`

---

### 5. 비밀번호 최대 길이 제한

**문제:** 비밀번호 유효성 검사에 최소 길이(8자)만 있고 최대 길이 제한이 없었습니다. bcrypt 해싱 알고리즘은 입력이 길수록 연산 시간이 증가하며, 72바이트 이후는 잘립니다. 공격자가 수만 자의 비밀번호를 반복 전송하면 서버 CPU를 소진시키는 DoS 공격이 가능합니다.

**해결:** 회원가입과 비밀번호 변경 모두에 `max: 128` 제한을 추가했습니다. 128자는 실사용에 충분하면서 bcrypt 부하를 합리적으로 제한합니다.

**수정 파일:** `auth.validation.js` (`signupValidation`, `changePasswordValidation`)

---

### 6. 전역 에러 핸들러

**문제:** Node.js에서 처리되지 않은 Promise rejection이나 예외가 발생하면 프로세스가 경고 없이 종료됩니다. 에러 로그도 남지 않아 원인 파악이 불가능합니다.

**해결:** `process.on('unhandledRejection')`, `process.on('uncaughtException')` 핸들러를 추가하여 에러를 로그에 기록합니다. `uncaughtException`은 복구가 불가능한 상태이므로 로그 후 프로세스를 종료합니다 (PM2가 자동 재시작).

**수정 파일:** `server.js`

---

### 7. Graceful Shutdown 타임아웃

**문제:** 서버 종료 시 진행 중인 요청을 기다리지만, DB 연결 해제가 실패하거나 무한 대기 상태에 빠지면 프로세스가 영원히 종료되지 않습니다.

**해결:** 10초 타임아웃을 추가하여 정상 종료가 시간 내에 완료되지 않으면 강제 종료합니다. DB(Prisma)와 Redis 연결 해제 코드에도 try/catch를 추가하여 한쪽 실패가 다른 쪽 정리를 방해하지 않도록 했습니다.

**수정 파일:** `server.js`

---

### 8. 프로덕션 로깅 포맷 변경

**문제:** 개발 환경용 morgan `dev` 포맷은 짧고 색상이 있어 읽기 편하지만, 프로덕션에서는 IP 주소, 날짜, User-Agent 등의 정보가 빠져 있어 문제 추적이 어렵습니다.

**해결:** `NODE_ENV`가 `production`일 때 `combined` 포맷을 사용하도록 변경했습니다. Apache 표준 로그 포맷으로 IP, 날짜, HTTP 메서드, URL, 상태 코드, User-Agent가 모두 기록됩니다.

**수정 파일:** `app.js`

---

### 9. 환경변수 파싱 안전 처리

**문제:** `process.env.NEWS_INTERVAL_MS`와 `COOLDOWN_SEC`가 문자열 그대로 사용되고 있었습니다. 환경변수가 설정되지 않으면 `undefined`가 되어 `setInterval(fn, undefined)`가 호출되고, 이는 매 1ms마다 실행되어 서버 리소스를 소진합니다.

**해결:** `parseInt()`로 명시적 파싱하고, `||` 연산자로 기본값을 지정했습니다. (`newsIntervalMs: 600000`, `cooldownSec: 590`)

**수정 파일:** `config/index.js`

---

### 10. PM2 설정 파일 생성

**문제:** PM2를 사용하더라도 매번 CLI 옵션을 수동 입력해야 하고, 설정이 코드로 관리되지 않아 팀원 간 환경이 달라질 수 있습니다.

**해결:** `ecosystem.config.cjs` 파일을 프로젝트 루트에 생성했습니다. `autorestart: true`, `max_restarts: 10`, `restart_delay: 5000` 등의 설정이 포함되어 있습니다.

**생성 파일:** `ecosystem.config.cjs`

---

### 11. Health Check 개선

**문제:** 기존 `/api/health`는 단순히 `{ status: 'ok' }`를 반환했습니다. 서버 프로세스는 살아있지만 DB나 Redis가 다운된 경우에도 "정상"으로 응답하여, 로드밸런서가 장애를 감지하지 못합니다.

**해결:** Health Check에서 DB(`SELECT 1`)와 Redis(`ping`)를 실제로 호출하여 연결 상태를 확인합니다. 둘 중 하나라도 실패하면 `503 Service Unavailable`을 반환하여 로드밸런서가 해당 인스턴스를 트래픽에서 제외할 수 있습니다.

**수정 파일:** `app.js`

---

### 12. DB 인덱스 추가

**문제:** 자주 조회되는 컬럼에 인덱스가 없으면 DB가 전체 테이블을 스캔(Full Table Scan)합니다. 데이터가 적을 때는 문제가 없지만, 사용자가 늘어나면 응답 시간이 급격히 증가합니다.

**해결:** 쿼리 패턴을 분석하여 3개 테이블에 인덱스를 추가했습니다.

| 테이블               | 인덱스                 | 용도                                              |
| -------------------- | ---------------------- | ------------------------------------------------- |
| `BalanceVote`        | `@@index([gameId])`    | 게임별 투표 수 집계 쿼리 (`WHERE gameId = ?`)     |
| `BalanceCommentLike` | `@@index([commentId])` | 댓글별 좋아요 수 집계 (`WHERE commentId = ?`)     |
| `Article`            | `@@index([createdAt])` | 뉴스 목록 최신순 정렬 (`ORDER BY createdAt DESC`) |

> 인덱스는 `schema.prisma`에만 추가된 상태입니다. 실제 DB에 반영하려면 배포 서버에서 `npx prisma migrate deploy`를 실행해야 합니다.

**수정 파일:** `prisma/schema.prisma`
