# EconoSight 프로젝트 요약

## 프로젝트 개요

**EconoSight**는 매일 아침 전 세계 경제 뉴스를 AI로 분석하여 제공하는 서비스입니다.

- **프로젝트명**: EconoSight
- **버전**: 1.0.0 (MVP)
- **개발 기간**: Phase 1 완료
- **현재 상태**: 즉시 실행 가능한 완전한 MVP

---

## 주요 기능

### ✅ 구현 완료 (Phase 1 - MVP)

1. **자동 뉴스 수집**
   - NewsAPI를 통한 경제 뉴스 자동 수집
   - 중복 제거 및 필터링
   - 매일 자동 실행 (cron 스케줄러)

2. **AI 분석** (OpenAI GPT-4 Turbo)
   - 뉴스 요약 (한국어)
   - 영향받을 경제 분야 식별
   - 시장 감성 분석 (긍정/부정/중립)
   - 감성 점수 산출 (-1.0 ~ 1.0)

3. **데이터 저장**
   - MySQL 8.0 데이터베이스
   - 뉴스 데이터 영구 저장
   - 수집 로그 및 통계

4. **REST API**
   - 뉴스 목록 조회 (날짜별/최신순)
   - 뉴스 상세 조회
   - 헬스 체크

5. **반응형 웹 인터페이스**
   - React 18 + Vite
   - Tailwind CSS (모바일 퍼스트)
   - 날짜별 뉴스 리스트
   - 모달 팝업 상세 보기
   - 다크 모드 지원

6. **Google AdSense 준비**
   - 광고 컴포넌트 구현
   - SEO 최적화
   - Open Graph 메타 태그

7. **DevOps**
   - Docker + Docker Compose
   - 환경 변수 관리
   - 로깅 시스템

### 🔜 계획 중 (Phase 2 & 3)

- Flutter/React Native 모바일 앱
- FCM 푸시 알림
- 사용자 계정 시스템
- 맞춤 뉴스 필터링
- 다국어 지원
- Redis 캐싱

---

## 기술 스택

### 백엔드
- **런타임**: Node.js 20+
- **프레임워크**: Express.js
- **언어**: TypeScript
- **데이터베이스**: MySQL 8.0
- **AI**: OpenAI API (GPT-4 Turbo)
- **뉴스 소스**: NewsAPI
- **스케줄러**: node-cron
- **로깅**: Winston

### 프론트엔드
- **프레임워크**: React 18
- **빌드 도구**: Vite
- **언어**: TypeScript
- **스타일**: Tailwind CSS
- **상태 관리**: React Query + Context API
- **라우팅**: React Router v6

### 인프라
- **컨테이너**: Docker + Docker Compose
- **웹 서버**: Nginx (프로덕션)
- **배포**: AWS EC2 / Google Cloud Run

---

## 프로젝트 구조

```
econoSight/
├── backend/                    # Node.js + Express 백엔드
│   ├── src/
│   │   ├── api/               # REST API 라우터
│   │   ├── services/          # 비즈니스 로직
│   │   ├── models/            # 데이터베이스 모델
│   │   ├── utils/             # 유틸리티
│   │   ├── config/            # 환경 설정
│   │   └── scripts/           # 스크립트
│   ├── logs/                  # 로그 파일
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/                   # React + Vite 프론트엔드
│   ├── src/
│   │   ├── components/        # React 컴포넌트
│   │   ├── pages/             # 페이지
│   │   ├── services/          # API 호출
│   │   ├── types/             # TypeScript 타입
│   │   └── styles/            # 스타일
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── database/
│   └── schema.sql             # MySQL DDL
├── docker-compose.yml         # Docker 구성
├── .env.example               # 환경 변수 예시
├── .gitignore
├── README.md
├── SETUP_GUIDE.md
└── PROJECT_SUMMARY.md
```

---

## 생성된 파일 목록

### 백엔드 (17개 파일)
1. `backend/package.json` - 의존성 및 스크립트
2. `backend/tsconfig.json` - TypeScript 설정
3. `backend/Dockerfile` - Docker 이미지
4. `backend/src/app.ts` - Express 앱 엔트리포인트
5. `backend/src/config/config.ts` - 환경 설정
6. `backend/src/utils/logger.ts` - 로깅
7. `backend/src/utils/errorHandler.ts` - 에러 처리
8. `backend/src/models/database.ts` - DB 연결
9. `backend/src/models/news.model.ts` - 뉴스 모델
10. `backend/src/services/aiAnalyzer.service.ts` - OpenAI 연동
11. `backend/src/services/newsCollector.service.ts` - 뉴스 수집
12. `backend/src/services/scheduler.service.ts` - 자동 스케줄러
13. `backend/src/api/index.ts` - API 라우터 인덱스
14. `backend/src/api/routes/news.routes.ts` - 뉴스 API
15. `backend/src/api/routes/health.routes.ts` - 헬스 체크
16. `backend/src/scripts/collectNews.ts` - 수동 수집 스크립트

### 프론트엔드 (15개 파일)
1. `frontend/package.json` - 의존성 및 스크립트
2. `frontend/tsconfig.json` - TypeScript 설정
3. `frontend/tsconfig.node.json` - Node TypeScript 설정
4. `frontend/vite.config.ts` - Vite 설정
5. `frontend/tailwind.config.js` - Tailwind 설정
6. `frontend/postcss.config.js` - PostCSS 설정
7. `frontend/Dockerfile` - Docker 이미지
8. `frontend/index.html` - HTML 엔트리포인트
9. `frontend/src/main.tsx` - React 엔트리포인트
10. `frontend/src/App.tsx` - 메인 앱 컴포넌트
11. `frontend/src/types/news.types.ts` - TypeScript 타입
12. `frontend/src/services/api.ts` - API 클라이언트
13. `frontend/src/components/NewsCard.tsx` - 뉴스 카드
14. `frontend/src/components/NewsList.tsx` - 뉴스 리스트
15. `frontend/src/components/NewsModal.tsx` - 상세 모달
16. `frontend/src/components/AdBanner.tsx` - 광고 배너
17. `frontend/src/pages/HomePage.tsx` - 홈페이지
18. `frontend/src/styles/index.css` - 글로벌 스타일

### 인프라 및 문서 (7개 파일)
1. `database/schema.sql` - MySQL 스키마
2. `docker-compose.yml` - Docker Compose 설정
3. `.env.example` - 환경 변수 예시
4. `frontend/.env.example` - 프론트엔드 환경 변수
5. `.gitignore` - Git 제외 파일
6. `README.md` - 프로젝트 문서
7. `SETUP_GUIDE.md` - 설치 가이드
8. `PROJECT_SUMMARY.md` - 프로젝트 요약

**총 파일 수: 39개**

---

## 주요 기능 코드 위치

### 1. OpenAI 분석 엔진
- **파일**: `backend/src/services/aiAnalyzer.service.ts`
- **기능**:
  - `analyzeNews()` - 단일 뉴스 분석
  - `analyzeBatchNews()` - 배치 분석
  - `calculateCost()` - 비용 계산
- **특징**:
  - 재시도 로직 (최대 3회)
  - Rate Limit 처리
  - 토큰 사용량 추적

### 2. 뉴스 수집 시스템
- **파일**: `backend/src/services/newsCollector.service.ts`
- **기능**:
  - `collectEconomicNews()` - NewsAPI 뉴스 수집
  - `deduplicateNews()` - 중복 제거
  - `filterEconomicNews()` - 경제 뉴스 필터링
- **특징**:
  - 키워드 기반 필터링
  - 여러 소스 지원

### 3. 자동 스케줄러
- **파일**: `backend/src/services/scheduler.service.ts`
- **기능**:
  - `startScheduler()` - 스케줄러 시작
  - `runDailyAnalysis()` - 매일 자동 분석
- **특징**:
  - cron 표현식 지원
  - 타임존 설정
  - 실패 로그 기록

### 4. 데이터베이스 모델
- **파일**: `backend/src/models/news.model.ts`
- **모델**:
  - `NewsModel` - 뉴스 CRUD
  - `NewsCollectionLogModel` - 수집 로그
- **특징**:
  - 소프트 삭제
  - 중복 체크
  - 날짜별/최신순 조회

### 5. REST API
- **파일**: `backend/src/api/routes/news.routes.ts`
- **엔드포인트**:
  - `GET /api/news` - 뉴스 목록
  - `GET /api/news/latest` - 최신 뉴스
  - `GET /api/news/:id` - 뉴스 상세
- **특징**:
  - Zod 검증
  - 페이지네이션
  - 에러 핸들링

### 6. 프론트엔드 UI
- **파일**: `frontend/src/pages/HomePage.tsx`
- **컴포넌트**:
  - `NewsList` - 뉴스 리스트
  - `NewsCard` - 개별 뉴스 카드
  - `NewsModal` - 상세 모달
  - `AdBanner` - 광고 배너
- **특징**:
  - React Query 데이터 fetching
  - 반응형 디자인
  - 다크 모드

---

## API 명세

### GET /api/news
**뉴스 목록 조회**

Query Parameters:
- `date`: yyyy-mm-dd (선택)
- `limit`: number (기본값: 20)
- `offset`: number (기본값: 0)

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "news_date": "2024-12-09",
      "title": "Fed, 기준금리 동결 결정",
      "summary": "미국 연방준비제도가...",
      "affected_sectors": ["금융", "부동산"],
      "market_sentiment": "negative",
      "sentiment_score": -0.65,
      "source": "Reuters",
      "source_url": "https://..."
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### GET /api/news/latest
**최신 뉴스 조회**

### GET /api/news/:id
**뉴스 상세 조회**

### GET /api/health
**헬스 체크**

---

## 데이터베이스 스키마

### economic_news 테이블
주요 필드:
- `id` - Primary Key
- `news_date` - 뉴스 날짜
- `title` - 제목
- `summary` - AI 요약
- `affected_sectors` - 영향받는 분야 (JSON)
- `market_sentiment` - 시장 감성 (ENUM)
- `sentiment_score` - 감성 점수 (DECIMAL)
- `ai_model` - 사용된 AI 모델
- `token_usage` - 토큰 사용량

### news_collection_logs 테이블
스케줄러 실행 로그

### economic_sectors 테이블
경제 분야 마스터 데이터

---

## 환경 변수

### 필수 환경 변수
```bash
OPENAI_API_KEY=sk-xxx          # OpenAI API 키
NEWS_API_KEY=xxx               # NewsAPI 키
DB_PASSWORD=xxx                # MySQL 비밀번호
```

### 선택 환경 변수
```bash
PORT=3000                      # 서버 포트
DB_HOST=localhost              # MySQL 호스트
SCHEDULER_ENABLED=true         # 스케줄러 활성화
ANALYSIS_CRON=0 6 * * *        # 실행 시간 (매일 오전 6시)
ADSENSE_CLIENT_ID=ca-pub-xxx   # AdSense 클라이언트 ID
```

---

## 실행 방법

### 로컬 개발 환경

```bash
# 1. 환경 변수 설정
cp .env.example .env
# .env 파일 편집

# 2. 데이터베이스 설정
mysql -u root -p < database/schema.sql

# 3. 백엔드 실행
cd backend
npm install
npm run dev

# 4. 프론트엔드 실행 (새 터미널)
cd frontend
npm install
npm run dev
```

### Docker

```bash
# 환경 변수 설정
cp .env.example .env

# 전체 스택 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

---

## 예상 비용

### 프로덕션 환경 (월간)
- OpenAI API: $30-50
- NewsAPI: $449
- AWS EC2: $8.50
- AWS RDS: $15
- **총**: $502-522/월

### 비용 절감 방안
1. OpenAI API 사용량 제한
2. 무료 RSS 피드 활용
3. AWS 프리티어 활용
4. 캐싱 전략

---

## 성능 최적화

### 구현된 최적화
1. **데이터베이스**
   - 인덱스 최적화
   - 복합 인덱스
   - 전문 검색 인덱스

2. **API**
   - React Query 캐싱 (5분)
   - 페이지네이션
   - Rate Limit 처리

3. **비용 최적화**
   - 중복 뉴스 체크
   - 토큰 수 제한
   - 배치 처리

---

## 보안

### 구현된 보안 기능
1. Helmet.js (보안 헤더)
2. CORS 설정
3. 환경 변수 분리
4. SQL Injection 방지 (Prepared Statements)
5. 에러 정보 은닉

---

## 테스트

### 수동 테스트
```bash
# 뉴스 수집 테스트
npm run collect-news

# API 테스트
curl http://localhost:3000/api/health
curl http://localhost:3000/api/news/latest
```

---

## 다음 단계

### Phase 2: 모바일 앱
1. Flutter 앱 개발
2. FCM 푸시 알림
3. 앱 스토어 배포

### Phase 3: 고도화
1. 사용자 계정 시스템
2. 맞춤 뉴스 필터링
3. 다국어 지원
4. Redis 캐싱
5. 성능 모니터링

---

## 주의사항

### API 키 보안
- `.env` 파일을 절대 Git에 커밋하지 마세요
- API 키는 환경 변수로만 관리
- 프로덕션 환경에서는 AWS Secrets Manager 등 사용 권장

### 비용 관리
- OpenAI API 사용량 모니터링
- NewsAPI 요청 제한 확인
- 스케줄러 실행 빈도 조절

### 라이선스
- OpenAI API: 상용 사용 가능
- NewsAPI: 라이선스 확인 필요
- 오픈소스 라이브러리: 각 라이선스 준수

---

## 프로젝트 완성도

### ✅ 완료된 작업
- [x] 기술 스택 선정 및 문서화
- [x] 프로젝트 구조 설계
- [x] MySQL 데이터베이스 스키마
- [x] OpenAI API 연동
- [x] 뉴스 수집 시스템
- [x] 자동 스케줄러
- [x] REST API 개발
- [x] 반응형 웹 UI
- [x] Google AdSense 준비
- [x] Docker 환경 구축
- [x] 문서화 (README, SETUP_GUIDE)

### 🚀 즉시 실행 가능
이 프로젝트는 **GitHub에 바로 push 가능한 수준**으로 작성되었습니다.
API 키만 입력하면 즉시 실행할 수 있습니다!

---

## 라이선스

MIT License

---

## 작성일

2024-12-11

**프로젝트 상태: MVP 완료 ✅**
