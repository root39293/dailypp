# DailyPP

일일 osu! 맵 추천 웹 서비스 (개발 진행중)

![landing](https://github.com/user-attachments/assets/f8fb0208-c39b-4d30-96e6-1c2f15b6118f)

## 주요 기능

### 1. 맞춤형 비트맵 추천
- 사용자 PP 기반 난이도 조정 (0.7 ~ 1.0 배율)
- 난이도별 차등 추천 (Easy, Normal, Hard)
- 비트맵 필터링 기준 (최소 플레이 수: 1,000회, 길이: 1분 ~ 5분, 최근 30일 이내 등록된 맵)

### 2. 일일 도전과제
- 난이도별 3개 비트맵 제공
- 상세 정보 표시:
  - 난이도 ★
  - BPM
  - 맵 길이
  - 제작자 정보

### 3. 프로필
- osu! 프로필 연동
- 유저 정보 표시
- 도전과제 이력 확인

## 기술 스택

### Frontend
- SvelteKit
- TailwindCSS
- TypeScript

### Backend
- MongoDB
- osu! OAuth

## 개발 환경 설정

1. 저장소 클론
~~~bash
git clone https://github.com/root39293/dailypp.git
cd dailypp
~~~

2. 환경변수 설정
~~~bash
# .env 파일 생성 
MONGODB_URI="mongodb_uri"
OSU_CLIENT_ID="your_osu_client_id"
OSU_CLIENT_SECRET="your_osu_client_secret"
OSU_REDIRECT_URI="your_redirect_uri"
~~~

3. 의존성 설치 및 실행
~~~bash
npm install
npm run dev
~~~

## API 엔드포인트

### 사용자
- `GET /api/user`: 현재 로그인한 사용자 정보 조회
- `GET /api/user/history`: 도전과제 이력 조회

## 프로젝트 구조
~~~
src/
├── lib/
│   ├── components/     # 공통 컴포넌트
│   ├── server/        # 서버 관련 유틸리티
│   ├── schemas.ts     # 데이터 스키마
│   └── types.ts       # 타입 정의
├── routes/
│   ├── api/          # API 엔드포인트
│   ├── auth/         # 인증 관련
│   ├── challenges/   # 도전과제 페이지
│   └── profile/      # 프로필 페이지
└── app.css          # 전역 스타일
~~~

## 라이선스

MIT License
