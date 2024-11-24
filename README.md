# DailyPP

일일 osu! 맵 추천 웹 서비스 (Work in Progress)

![landing](https://github.com/user-attachments/assets/f8fb0208-c39b-4d30-96e6-1c2f15b6118f)

## 주요 기능

### 1. 맞춤형 비트맵 추천
- 사용자 PP 기반 난이도 조정 (0.7 ~ 1.0 배율)
- 난이도별 차등 추천 (Easy, Normal, Hard)
- 비트맵 필터링 (최소 플레이 수, 길이, 최근 등록 기준)

### 2. 일일 도전과제
- 난이도별 3개 비트맵 제공
- S 랭크 이상 달성 시 클리어
- 상세 정보 표시 (난이도, BPM, 길이, 예상 PP 등)

### 3. 통계 및 진행현황
- 일일/주간 도전과제 달성률
- 연속 달성 스트릭
- PP 성장 그래프
- 난이도별 클리어 현황

## 데모 페이지

로그인하지 않고도 서비스의 주요 기능을 체험해볼 수 있는 데모 페이지를 제공합니다.
- 도전과제 UI 미리보기
- 통계 그래프 데모
- 대시보드 레이아웃 확인

👉 [데모 페이지 바로가기](/demo)

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

## 개발 환경 설정

1. 저장소 클론 및 의존성 설치
~~~bash
git clone https://github.com/root39293/dailypp.git
cd dailypp
npm install
~~~

2. 환경변수 설정 (.env)
~~~bash
MONGODB_URI="mongodb_uri"
OSU_CLIENT_ID="your_osu_client_id"
OSU_CLIENT_SECRET="your_osu_client_secret"
PUBLIC_BASE_URL="your_vercel_url"
~~~

3. 개발 서버 실행
~~~bash
npm run dev
~~~

## 라이선스

MIT License
