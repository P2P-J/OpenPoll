# OpenPoll API 명세서

Base URL: `http://localhost:3000/api`

---

## 인증 (Auth)

### 회원가입
`POST /auth/signup`

회원가입 시 500P 자동 지급

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "닉네임",
  "age": 25,
  "region": "서울",
  "gender": "MALE"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| email | string | O | 이메일 (아이디) |
| password | string | O | 비밀번호 (8자 이상, 영문+숫자) |
| nickname | string | O | 닉네임 (2~20자, 중복 불가) |
| age | number | O | 나이 (18세 이상) |
| region | string | O | 지역 (서울, 부산, 대구 등) |
| gender | string | O | 성별 (MALE, FEMALE) |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "nickname": "닉네임",
      "age": 25,
      "region": "서울",
      "gender": "MALE",
      "role": "USER",
      "points": 500,
      "hasTakenDos": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 로그인
`POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "nickname": "닉네임",
      "age": 25,
      "region": "서울",
      "gender": "MALE",
      "role": "USER",
      "points": 500,
      "hasTakenDos": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

---

### 로그아웃
`POST /auth/logout`

[인증 필요]

**Response (204):** No Content

---

### 토큰 재발급
`POST /auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

---

### 비밀번호 변경
`PATCH /auth/password`

[인증 필요]

비밀번호 변경 성공 시 보안을 위해 기존 Refresh Token이 삭제됩니다. (재로그인 필요)

**Request Body:**
```json
{
  "currentPassword": "현재비밀번호",
  "newPassword": "새비밀번호123"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| currentPassword | string | O | 현재 비밀번호 |
| newPassword | string | O | 새 비밀번호 (8자 이상, 영문+숫자) |

**Response (204):** No Content

**Error (401):**
```json
{
  "success": false,
  "message": "현재 비밀번호가 올바르지 않습니다."
}
```

---

## 사용자 (User)

### 내 정보 조회
`GET /users/me`

[인증 필요]

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "nickname": "닉네임",
    "age": 25,
    "region": "서울",
    "gender": "MALE",
    "points": 500,
    "hasTakenDos": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "totalEarnedPoints": 850
  }
}
```

| 필드 | 설명 |
|------|------|
| points | 현재 보유 포인트 |
| totalEarnedPoints | 총 획득 포인트 (양수 포인트 합계) |

---

### 내 정보 수정
`PATCH /users/me`

[인증 필요]

**Request Body:** (변경할 필드만)
```json
{
  "nickname": "새닉네임",
  "age": 26,
  "region": "부산",
  "gender": "FEMALE"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "nickname": "새닉네임",
    "age": 26,
    "region": "부산",
    "gender": "FEMALE",
    "points": 500,
    "hasTakenDos": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

---

### 포인트 내역 조회
`GET /users/me/points`

[인증 필요]

**Query Parameters:**
| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| page | number | 1 | 페이지 번호 |
| limit | number | 20 | 페이지당 개수 |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "SIGNUP",
      "amount": 500,
      "description": "회원가입 완료",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "type": "PARTY_VOTE",
      "amount": -5,
      "description": "정당 지지 - 더불어민주당",
      "createdAt": "2024-01-02T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2
  }
}
```

---

### 내 투표 집계 조회
`GET /users/me/votes`

[인증 필요]

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalVotes": 23,
    "stats": [
      { "partyId": 1, "partyName": "더불어민주당", "color": "#004EA2", "count": 15 },
      { "partyId": 2, "partyName": "국민의힘", "color": "#E61E2B", "count": 8 },
      { "partyId": 3, "partyName": "정의당", "color": "#FFCC00", "count": 0 }
    ]
  }
}
```

---

## 포인트 (Point)

### 출석 체크
`POST /points/attendance`

[인증 필요]

일일 출석 +30P, 7일 연속 출석 시 +20P 추가

**Response (200):**
```json
{
  "success": true,
  "data": {
    "attendance": {
      "id": 1,
      "date": "2024-01-01",
      "consecutiveDays": 3
    },
    "pointsEarned": 30,
    "consecutiveDays": 3,
    "isStreakBonus": false
  }
}
```

---

## 정당 (Party)

### 정당 목록 조회
`GET /parties`

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "더불어민주당", "color": "#004EA2", "logoUrl": null, "voteCount": 1523 },
    { "id": 2, "name": "국민의힘", "color": "#E61E2B", "logoUrl": null, "voteCount": 1245 },
    { "id": 3, "name": "정의당", "color": "#FFCC00", "logoUrl": null, "voteCount": 432 },
    { "id": 4, "name": "기본소득당", "color": "#00D2C3", "logoUrl": null, "voteCount": 156 },
    { "id": 5, "name": "기타/무당층", "color": "#808080", "logoUrl": null, "voteCount": 89 }
  ]
}
```

---

## 투표 (Vote)

### 정당 지지 투표
`POST /votes`

[인증 필요]

-5P 차감

**Request Body:**
```json
{
  "partyId": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": "uuid",
    "partyId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "party": {
      "name": "더불어민주당",
      "color": "#004EA2"
    },
    "remainingPoints": 495
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "포인트가 부족합니다. (현재: 3P, 필요: 5P)"
}
```

---

## 대시보드 (Dashboard)

### 실시간 지지율 스트림 (SSE)
`GET /dashboard/stream`

Server-Sent Events 연결

**Response:** (스트림)
```
data: {"type":"init","stats":{"totalVotes":100,"stats":[...]}}

data: {"type":"vote_update","stats":{"totalVotes":101,"stats":[...]}}
```

---

### 전체 지지율 통계
`GET /dashboard/stats`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalVotes": 1000,
    "stats": [
      { "partyId": 1, "partyName": "더불어민주당", "color": "#004EA2", "count": 350, "percentage": 35.00 },
      { "partyId": 2, "partyName": "국민의힘", "color": "#E61E2B", "count": 320, "percentage": 32.00 }
    ],
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 나이별 지지율 통계
`GET /dashboard/stats/by-age`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "ageGroup": "20대",
      "total": 200,
      "stats": [
        { "partyId": 1, "partyName": "더불어민주당", "count": 80, "percentage": 40.00 }
      ]
    }
  ]
}
```

---

### 지역별 지지율 통계
`GET /dashboard/stats/by-region`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "region": "서울",
      "total": 300,
      "stats": [...]
    }
  ]
}
```

---

## DOS (DNA Of Society) 검사

4개의 축으로 정치 성향을 분석합니다 (순서: 변화 → 분배 → 권리 → 발전):
- **변화축**: Change(변화) vs Stability(안정) → C/S
- **분배축**: Merit(경쟁) vs Equality(평등) → M/E
- **권리축**: Freedom(자유) vs Order(규율) → F/O
- **발전축**: Development(개발) vs Nature(환경) → D/N

### 질문 목록 조회
`GET /dos/questions`

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "question": "개인의 노력과 성취에 따른 보상 차이는...", "axis": "distribution" },
    { "id": 2, "question": "오랫동안 유지되어 온 방식에는...", "axis": "change" }
  ]
}
```

---

### 결과 계산
`POST /dos/calculate`

[인증 선택] (로그인 시 최초 1회 +300P)

**Request Body:**
```json
{
  "answers": [
    { "questionId": 1, "score": 2 },
    { "questionId": 2, "score": 5 }
  ]
}
```

| 필드 | 설명 |
|------|------|
| questionId | 질문 ID (1~32) |
| score | 응답 점수 (1~7, 4가 중립) |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "resultType": "CMFD",
    "axisPercentages": {
      "change": 65,
      "distribution": 58,
      "rights": 72,
      "development": 45
    },
    "resultTypeInfo": {
      "id": "CMFD",
      "name": "진보적 자유주의자",
      "description": "변화를 추구하며 개인의 자유와 경쟁을 중시하고...",
      "detail": "### 상세 설명\n마크다운 형식의 상세 설명...",
      "features": "[\"혁신 지향\", \"개인주의\", \"성장 중심\"]",
      "tag": "[\"#자유\", \"#진보\", \"#경쟁\"]"
    },
    "pointsEarned": 300
  }
}
```

---

### 유형 설명 조회
`GET /dos/result/:resultType`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "CMFD",
    "name": "진보적 자유주의자",
    "description": "짧은 설명",
    "detail": "마크다운 상세 설명",
    "features": "[\"특징1\", \"특징2\"]",
    "tag": "[\"#태그1\", \"#태그2\"]"
  }
}
```

---

### DOS 통계
`GET /dos/statistics`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 5000,
    "stats": [
      { "resultType": "CMFD", "count": 800, "percentage": "16.00" },
      { "resultType": "SEON", "count": 650, "percentage": "13.00" }
    ]
  }
}
```

---

## 밸런스 게임 (Balance Game)

### 밸런스 게임 목록 조회
`GET /balance`

[인증 선택] (로그인 시 myVote 포함)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "주 4일제 도입",
      "subtitle": "근로시간을 주 32시간으로 단축하는 제도",
      "agreeCount": 150,
      "disagreeCount": 80,
      "totalVotes": 230,
      "myVote": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 밸런스 게임 상세 조회
`GET /balance/:id`

[인증 선택] (로그인 시 myVote 포함)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "주 4일제 도입",
    "description": "주 4일 근무제는 근로시간을 주 32시간으로.....",
    "agreeCount": 150,
    "disagreeCount": 80,
    "totalVotes": 230,
    "commentCount": 23,
    "myVote": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 밸런스 게임 투표
`POST /balance/:id/vote`

[인증 필요]

+50P 지급 (사안당 1회)

**Request Body:**
```json
{
  "isAgree": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "주 4일제",
    "agreeCount": 151,
    "disagreeCount": 80,
    "totalVotes": 231,
    "agreePercent": 65,
    "disagreePercent": 35,
    "myVote": true,
    "pointsEarned": 50,
    "remainingPoints": 550
  }
}
```

---

### 밸런스 게임 생성 (관리자)
`POST /balance`

[관리자 전용]

**Request Body:**
```json
{
  "title": "주 4일제 도입",
  "subtitle": "근로시간을 주 32시간으로 단축하는 제도",
  "description": "주 4일 근무제는 근로시간을 주 32시간으로....."
}
```

| 필드 | 설명 |
|------|------|
| title | 제목 (100자 이하) |
| subtitle | 소제목 (200자 이하) |
| description | 상세 내용 |

---

### 밸런스 게임 수정 (관리자)
`PATCH /balance/:id`

[관리자 전용]

**Request Body:** (변경할 필드만)
```json
{
  "title": "수정된 제목",
  "subtitle": "수정된 소제목",
  "description": "수정된 설명"
}
```

---

### 밸런스 게임 삭제 (관리자)
`DELETE /balance/:id`

[관리자 전용]

**Response (204):** No Content

---

### 댓글 목록 조회
`GET /balance/:id/comments`

[인증 선택] (로그인 시 isLiked 포함)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "content": "저는 찬성입니다.",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "likeCount": 5,
      "isLiked": true,
      "user": { "id": "uuid", "nickname": "닉네임", "isAgree": true },
      "replies": [
        {
          "id": 2,
          "content": "저도요!",
          "createdAt": "2024-01-01T00:01:00.000Z",
          "likeCount": 2,
          "isLiked": false,
          "user": { "id": "uuid2", "nickname": "닉네임2", "isAgree": false }
        }
      ]
    }
  ]
}
```

| user 필드 | 설명 |
|------------|------|
| isAgree | 작성자의 투표 결과 (`true`: 찬성, `false`: 반대) |

| 댓글 필드 | 설명 |
|------------|------|
| likeCount | 좋아요 수 |
| isLiked | 내 좋아요 여부 (비로그인 시 `null`) |

---

### 댓글 작성
`POST /balance/:id/comments`

[인증 필요] (투표한 유저만)

**Request Body:**
```json
{
  "content": "댓글 내용",
  "parentId": null
}
```

| 필드 | 설명 |
|------|------|
| content | 댓글 내용 (500자 이하) |
| parentId | 대댓글인 경우 부모 댓글 ID (선택) |

---

### 댓글 수정
`PATCH /balance/:id/comments/:commentId`

[인증 필요] (본인 또는 관리자)

**Request Body:**
```json
{
  "content": "수정된 댓글 내용"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "content": "수정된 댓글 내용",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "user": { "id": "uuid", "nickname": "닉네임" }
  }
}
```

---

### 댓글 삭제
`DELETE /balance/:id/comments/:commentId`

[인증 필요] (본인 또는 관리자)

**Response (204):** No Content

---

### 댓글 좋아요 토글
`POST /balance/:id/comments/:commentId/like`

[인증 필요]

좋아요가 없으면 추가, 있으면 취소 (토글 방식)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "commentId": 1,
    "likeCount": 6,
    "isLiked": true
  }
}
```

---

## 실시간 뉴스 (News)

### 실시간 뉴스 새로고침
`POST /news/refresh`

Rate Limit: 1분에 1회

**Response (200):**
```json
{
  "success": true,
  "data": {
    "enqueued": 10,
    "urls": [
      "https://n.news.naver.com/mnews/article/nnn/nnnnnnnnnn",
      "..."
    ]
  }
}
```

---

### 실시간 뉴스 조회
`GET /news/articles`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 20,
      "naverUrl": "https://n.news.naver.com/mnews/article/nnn/nnnnnnnnnn",
      "originalUrl": "크롤링한 뉴스의 원문 url",
      "refinedTitle": "정제된 중립화 제목",
      "refinedSummary": "정제된 중립화 본문 (마크다운)",
      "shortSummary": "3줄 요약 첫 번째 줄\n3줄 요약 두 번째 줄\n3줄 요약 세 번째 줄",
      "relatedTags": ["이슈 태그 1", "이슈 태그 2", "이슈 태그 3"],
      "press": "언론사",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 공통 에러 응답

```json
{
  "success": false,
  "status": "fail",
  "message": "에러 메시지"
}
```

| 상태 코드 | 설명 |
|-----------|------|
| 400 | 잘못된 요청 (유효성 검사 실패) |
| 401 | 인증 필요 / 토큰 만료 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 409 | 중복 (이메일, 닉네임 등) |
| 500 | 서버 오류 |

---

## 지역 코드

```
서울, 부산, 대구, 인천, 광주, 대전, 울산, 세종, 
경기, 강원, 충북, 충남, 전북, 전남, 경북, 경남, 제주
```

---

## 인증 방식

모든 [인증 필요] API는 헤더에 Access Token 포함:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 포인트 정책

| 활동 | 포인트 |
|------|--------|
| 회원가입 | +500P |
| DOS 검사 (최초 1회) | +300P |
| 밸런스 게임 투표 | +50P |
| 일일 출석 | +30P |
| 7일 연속 출석 보너스 | +20P |
| 정당 지지 투표 | -5P |
