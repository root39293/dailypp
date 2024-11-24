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
│   │   ├── Dashboard.svelte
│   │   ├── LandingPage.svelte
│   │   ├── Sidebar.svelte
│   │   ├── ChallengeCard.svelte
│   │   └── PPChart.svelte
│   ├── server/        # 서버 관련 유틸리티
│   │   ├── config.ts
│   │   ├── db.ts
│   │   ├── errors.ts
│   │   └── osu-api.ts
│   ├── schemas.ts     # 데이터 스키마
│   └── types.ts       # 타입 정의
├── routes/
│   ├── api/          # API 엔드포인트
│   ├── auth/         # 인증 관련
│   ├── challenges/   # 도전과제 페이지
│   └── stats/        # 통계 페이지
└── app.css          # 전역 스타일
~~~

## 라이선스

MIT License
