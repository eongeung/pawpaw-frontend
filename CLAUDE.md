# PawPaw Frontend — 개발 컨텍스트

## 프로젝트 개요
반려동물 커뮤니티 앱. React + Vite + TailwindCSS + shadcn/ui 기반.  
백엔드: Spring Boot (localhost:8080), WebSocket(STOMP+SockJS) 채팅.

---

## 기술 스택

| 항목 | 사용 기술 |
|------|-----------|
| 프레임워크 | React 18 (StrictMode 제거 — Kakao Maps 이중 초기화 방지) |
| 라우팅 | react-router v7 (`createBrowserRouter`) |
| 상태관리 | Zustand (`authStore`, `errorStore`) |
| 지도 | Kakao Maps SDK (`libraries=services`) |
| 채팅 | @stomp/stompjs + SockJS |
| HTTP | Axios (인터셉터로 토큰 자동 첨부 + 리프레시 처리) |
| UI | shadcn/ui (Radix UI 기반) + lucide-react |

---

## 주요 파일 구조

```
src/
├── api/axios.js          # axios 인스턴스 + 인터셉터 (토큰 갱신, 에러 처리)
├── store/
│   ├── authStore.js      # isLoggedIn, userId
│   └── errorStore.js     # networkError, sessionExpired (전역 에러 상태)
├── App.jsx               # RouterProvider + SessionExpiredModal + NetworkErrorModal
├── routes.jsx            # 라우트 정의 (PrivateRoute 포함)
├── components/Layout.jsx # 헤더 + 네비게이션 바
└── pages/
    ├── auth/             # LoginPage, SignUpPage
    ├── community/        # PostListPage, PostDetailPage, PostCreatePage
    ├── chat/             # ChatPage
    ├── hospital/         # HospitalPage
    ├── walk/             # WalkRequestPage
    ├── pet/              # PetPage
    └── mypage/           # MyPage
```

---

## 2026-04-23 작업 내용 (PR #27, feat/session-expired-modal)

### 🗺 지도 API 전환 (Naver → Kakao)
- `index.html` 스크립트를 Kakao Maps SDK로 교체
- `HospitalPage`, `WalkRequestPage` 모두 `window.kakao.maps` 기반으로 재구현
- 역지오코딩: `coord2Address(lng, lat, cb)` — **경도 먼저**
- 지역명 변환: `coord2RegionCode(lng, lat, cb)`
- 키워드 검색: `kakao.maps.services.Places().keywordSearch()`

### 💬 채팅 개선
- **한국어 IME 중복 전송 방지**: `onKeyDown`에 `!e.nativeEvent.isComposing` 조건 추가
- **레이아웃**: `grid(반응형)` → `flex(고정)` — 항상 목록(288px) + 채팅창 가로 배치
- **상대방 이름 표시**: `room.requesterId === userId`면 `receiverNickname`, 아니면 `requesterNickname`
- **채팅방 생성 실패 메시지**: "채팅방 생성 실패" → "이미 채팅방이 만들어져 있습니다."

### 🏥 동물병원 개선
- **GPS 자동 검색**: 진입 시 `navigator.geolocation` → `coord2RegionCode` → 지역명 → 병원 자동 검색
- **네비바**: "동물병원" → "가까운 동물병원"
- **전화 버튼**: 전화번호 텍스트 → `tel:` 링크 전화하기 버튼
- **재방문 리뷰 뱃지**: 같은 닉네임이 같은 병원에 2번째 이상 리뷰 시 "두번째 리뷰" 뱃지 표시
- **별점 UI**: 5개 인터랙티브 Star 컴포넌트 (readonly/interactive 모드)
- **6개 이상 리뷰**: `max-h-[400px] overflow-y-auto` 스크롤

### 🚶 산책 매칭 개선
- **알바비 자동 포맷**: 숫자만 입력하면 `10,000원` 형태로 자동 변환
- **날짜/시간 유효성**:
  - 날짜: `min={TODAY}` (오늘 이전 선택 불가)
  - 시작 시간: 오늘 선택 시 현재 시각 이전 불가
  - 종료 시간: 시작 시간 이전 불가, 시작 시간 선택 시 자동 +1분
- **위치 선택 지도 개선**:
  - 키워드 검색 → 결과 드롭다운 목록 표시 (장소명 + 주소)
  - 목록 클릭 또는 지도 직접 클릭으로 위치 선택
  - "선택 완료" 버튼으로 위치 확정

### ❤️ 커뮤니티 좋아요 상태 유지
- `localStorage.setItem('liked_{userId}_{postId}', 'true/false')`로 저장
- 페이지 재진입 시 localStorage 우선 읽기 → 서버 `liked` 필드 fallback

### 🧑 마이페이지 신규 구현 (`src/pages/mypage/MyPage.jsx`)
- 프로필: 이니셜 아바타, 닉네임, 이메일, 주소, 가입일
- 프로필 수정 모달: 닉네임·주소 편집, GPS 버튼으로 현재 위치 자동 입력
- 활동 통계: 작성 글 수, 산책 매칭 수
- 탭: 작성한 글 목록 / 산책 매칭 목록

**필요한 API 응답 필드:**
- `GET /api/users/me` → `{ nickname, email, address, createdAt }`
- `GET /api/posts/my` → `[{ id, title, category, createdAt }]`
- `GET /api/walk-requests/my` → `[{ id, title, walkDate, startTime, endTime, location, reward }]`
- `PUT /api/users/me` → `{ nickname, address }` 전송, 수정된 유저 반환

### 🚨 에러 처리 (서버 연결 끊김 / 세션 만료)
- **errorStore** (Zustand): `networkError`, `sessionExpired` 전역 상태
- **axios 인터셉터**:
  - `!error.response` → `setNetworkError(true)` (서버 다운)
  - 401 리프레시 실패 → `setSessionExpired(true)`
- **App.jsx**:
  - `SessionExpiredModal`: 강제 모달 (닫기 불가), 다시 로그인 버튼
  - `NetworkErrorModal`: 닫기 또는 다시 로그인 선택 가능

---

## 주의사항 / 알려진 제약

- **StrictMode 제거됨** — `src/main.jsx`에서 제거. Kakao Maps useEffect 이중 실행 방지 목적
- **Kakao Maps 도메인 등록 필요** — Kakao Developers 콘솔에서 `http://localhost:5173` 등록해야 지도 타일 표시
- **채팅 requesterId/receiverId** — 채팅방 API 응답에 두 필드가 있어야 상대방 이름 정확히 표시
- **마이페이지 `/api/walk-requests/my`** — 내가 등록한 산책 매칭만 반환하는 전용 엔드포인트 필요
- **좋아요 상태** — 서버가 `liked` 필드를 응답에 포함하면 localStorage 대신 서버 값 우선 사용 가능

---

## 브랜치 / PR 현황 (2026-04-23 기준)

| 브랜치 | PR | 내용 |
|--------|----|------|
| feat/session-expired-modal | #27 | 이 문서의 모든 변경사항 |
| feat/hospital-improvements | #? | 동물병원 별점/리뷰 초기 구현 |
| feat/walk-improvements | #? | 산책 매칭 초기 개선 |
| feat/mypage | #? | 마이페이지 초기 구현 |
| feat/post-image-upload | #? | 게시글 이미지 업로드 |
| feat/community-comment-count | #? | 댓글 개수 표시 |
| fix/like-state-sync | #? | 좋아요 상태 동기화 |

---

## 이슈 번호 참조

| # | 내용 | 상태 |
|---|------|------|
| 28 | Naver → Kakao 지도 전환 | PR #27에서 처리 |
| 29 | 서버 연결/세션 만료 모달 | PR #27에서 처리 |
| 30 | 채팅 IME 중복 전송 | PR #27에서 처리 |
| 31 | 동물병원 GPS/전화 버튼/재방문 리뷰 | PR #27에서 처리 |
| 32 | 산책 매칭 지도 검색 결과 목록 | PR #27에서 처리 |
| 4  | 좋아요 상태 초기화 버그 | PR #27에서 처리 |
| 6  | 채팅방 상대방 이름 표시 | PR #27에서 처리 |
| 7  | 채팅방 생성 실패 메시지 | PR #27에서 처리 |
| 11 | 마이페이지 구현 | PR #27에서 처리 |
| 12 | 산책 날짜/시간 유효성 | PR #27에서 처리 |
| 13 | 알바비 포맷 | PR #27에서 처리 |
| 15 | 동물병원 GPS 자동 검색 | PR #27에서 처리 |
