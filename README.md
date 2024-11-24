# DailyPP

일일 osu! 맵 추천 웹 서비스 (개발 진행중)

![landing](https://github.com/user-attachments/assets/f8fb0208-c39b-4d30-96e6-1c2f15b6118f)

## 주요 기능

### 1. 맞춤형 비트맵 추천
- 사용자 PP 기반 난이도 조정 (0.7 ~ 1.0 배율)
- 난이도별 차등 추천 (Easy, Normal, Hard)
- 비트맵 필터링 기준 (최소 플레이 수: 1,000회, 길이: 1분 ~ 5분, 최근 30일 이내 등록된 맵)

### 2. 일일 도전과제
- 난이도별 3개 비트맵 제공 (Easy, Normal, Hard)
- S 랭크 이상 달성 시 클리어 인정
- 상세 정보 표시:
  - 난이도 ★
  - BPM
  - 맵 길이
  - 제작자 정보
  - 예상 PP

### 3. 통계 및 진행현황
- 일일/주간 도전과제 달성률
- 연속 달성 스트릭
- PP 성장 그래프
- 난이도별 클리어 현황

## 기술 스택

### Frontend
- SvelteKit
- TailwindCSS
- TypeScript
- Chart.js

### Backend
- MongoDB
- osu! OAuth
- JWT 인증

## 개발 환경 설정

1. 저장소 클론
~~~bash
git clone https://github.com/n1et/dailypp.git
cd dailypp
~~~

2. 환경변수 설정
~~~bash
# .env 파일 생성
MONGODB_URI="mongodb_uri"
OSU_CLIENT_ID="your_osu_client_id"
OSU_CLIENT_SECRET="your_osu_client_secret"
PUBLIC_BASE_URL="your_base_url" # 개발: http://localhost:5173
~~~

3. 의존성 설치 및 실행
~~~bash
npm install
npm run dev
~~~

## API 엔드포인트

### 인증
- `POST /auth/signin`: osu! OAuth 로그인
- `POST /auth/signout`: 로그아웃
- `GET /auth/callback`: OAuth 콜백 처리

### 사용자
- `GET /api/user/stats`: 사용자의 도전과제 통계 조회
- `GET /api/user/history`: 도전과제 이력 조회
- `GET /api/user/pp-history`: PP 변화 이력 조회
- `GET /api/user/dashboard`: 대시보드 통계 조회

### 도전과제
- `POST /api/challenges/complete`: 도전과제 완료 처리

## 프로젝트 구조
~~~
src/
├── lib/
│   ├── components/     # 공통 컴포넌트
│   │   ├── Dashboard.svelte      # 대시보드 컴포넌트
│   │   ├── LandingPage.svelte    # 랜딩 페이지
│   │   ├── Sidebar.svelte        # 사이드바 네비게이션
│   │   ├── ChallengeCard.svelte  # 도전과제 카드
│   │   ├── PPChart.svelte        # PP 변화 그래프
│   │   ├── LoadingSpinner.svelte # 로딩 스피너
│   │   ├── ErrorAlert.svelte     # 에러 알림
│   │   └── StatsCard.svelte      # 통계 카드
│   ├── server/        # 서버 관련 유틸리티
│   │   ├── config.ts   # 서버 설정
│   │   ├── db.ts       # MongoDB 연결
│   │   ├── errors.ts   # 에러 처리
│   │   └── osu-api.ts  # osu! API 래퍼
│   ├── schemas.ts     # Zod 데이터 스키마
│   └── types.ts       # TypeScript 타입 정의
├── routes/
│   ├── +layout.svelte           # 루트 레이아웃
│   ├── +layout.server.ts        # 서버 사이드 레이아웃 로직
│   ├── api/                     # API 엔드포인트
│   │   ├── challenges/          # 도전과제 API
│   │   │   └── complete/        # 도전과제 완료 처리
│   │   └── user/               # 유저 관련 API
│   │       ├── dashboard/      # 대시보드 데이터
│   │       └── stats/         # 통계 데이터
│   ├── auth/                   # 인증 관련
│   │   ├── callback/          # OAuth 콜백
│   │   └── signout/          # 로그아웃
│   ├── challenges/            # 도전과제 페이지
│   ├── dashboard/            # 대시보드 페이지
│   └── stats/               # 통계 페이지
├── app.html                # HTML 템플릿
└── app.css                # 전역 스타일
~~~

## 라이선스

MIT License
