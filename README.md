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

### 4. 데모 모드 (/demo)
로그인 없이 서비스의 기능을 미리볼 수 있는 데모 페이지를 제공합니다:
- 도전과제 시스템 미리보기
- 대시보드 및 통계 화면 체험

## 맵 추천 알고리즘

### 난이도 계산 수식
`difficulty_range(stable_top_play_stars, type) = stable_top_play_stars + offset(type) ± margin(type)` where `offset = {EASY: -1.0, NORMAL: -0.25, HARD: +0.6}, margin = 0.25`

### 현재 구현 (1000pp 이상)
1. 유저의 상위 기록 분석
   - 상위 10개 기록 중 정확도 95% 이상인 상위 3개 기록 선별
   - 모드별 난이도 보정 적용
     * DT/NC: 원래 난이도 × 1.4 (예: 4.5★ → 6.3★)
     * HR: 원래 난이도 × 1.05 (예: 4.5★ → 4.7★)
   - 가장 높은 난이도를 기준값으로 사용

2. 난이도별 맵 추천 범위
   예시) 기준값이 6★인 경우:
   - EASY: 5.0★ ~ 5.5★ (기준값 -1.0 ±0.25)
   - NORMAL: 5.75★ ~ 6.25★ (기준값 -0.25 ±0.25)
   - HARD: 6.35★ ~ 6.85★ (기준값 +0.6 ±0.25)

3. 맵 필터링
   - 계산된 난이도 범위 내의 ranked 비트맵 검색
   - 길이 30초 ~ 5분 제한
   - 무작위 선택으로 다양성 확보

### 현재 구현 (1000pp 미만)
단계별 고정 난이도 범위 적용:
1. 입문 (0-300pp)
   - EASY: 2.0★ ~ 2.3★
   - NORMAL: 2.3★ ~ 2.6★
   - HARD: 2.6★ ~ 2.9★

2. 초급 (301-600pp)
   - EASY: 2.5★ ~ 2.8★
   - NORMAL: 2.8★ ~ 3.1★
   - HARD: 3.1★ ~ 3.4★

3. 중급 진입 (601-1000pp)
   - EASY: 3.0★ ~ 3.3★
   - NORMAL: 3.3★ ~ 3.6★
   - HARD: 3.6★ ~ 4.0★

## TODO

### 초보자 추천 알고리즘 개선 계획
1. S랭크 기반 실력 판단
   - S랭크 보유 여부로 초보자 판단
   - 현재 도전 중인 난이도 기준으로 추천
   - 예) S랭크가 없는 유저의 최근 A랭크 기록이 2.5★라면:
     * EASY: 2.3★ ~ 2.5★ (현재 난이도보다 약간 쉽게)
     * NORMAL: 2.5★ ~ 2.7★ (현재 도전 중인 난이도)
     * HARD: 2.7★ ~ 2.9★ (약간 더 어려운 도전용)

2. 피드백 기반 난이도 조정
   - 클리어 성공/실패에 따른 난이도 동적 조정
   - 정확도와 랭크를 고려한 단계적 상승
   - 패턴별 성공률 분석으로 개인화된 추천

## 기술 스택

### Frontend
- SvelteKit
- TailwindCSS
- TypeScript
- Chart.js

### Backend
- MongoDB
- mongoose
- osu! OAuth
- JWT 인증

## API 엔드포인트

### 인증
- `POST /auth/signin`: osu! OAuth 로그인
- `POST /auth/signout`: 로그아웃
- `GET /auth/callback`: OAuth 콜백 처리

### 사용자
- `GET /api/user`: 사용자 통계 조회
- `PUT /api/user`: 사용자 설정 업데이트
- `GET /api/user/stats`: 도전과제 달성 통계 조회
- `GET /api/user/history`: 도전과제 이력 조회
- `GET /api/user/pp-history`: PP 변화 이력 조회
- `GET /api/user/dashboard`: 대시보드 통계 조회 (주간/일간 달성률, PP 성장)

### 도전과제
- `GET /api/challenges`: 오늘의 도전과제 조회/생성
- `POST /api/challenges`: 도전과제 상태 업데이트
- `POST /api/challenges/complete`: 도전과제 완료 처리 및 검증
- `POST /api/challenges/feedback`: 비트맵 피드백 제출
- `POST /api/challenges/setting-goal`: 목표 설정 (TODO)

## 개발 환경 설정

1. 저장소 클론 및 의존성 설치
~~~bash
git clone https://github.com/root39293/dailypp.git
cd dailypp
npm install
~~~

2. 환경변수 설정 (.env)
~~~bash
VITE_MONGODB_URI="mongodb_uri"
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
