# EconoSight - 경제 뉴스 요약 및 분석 서비스

매일 아침 전 세계 경제 뉴스를 AI로 분석하여 제공하는 서비스입니다.

## 기술 스택 선정 및 근거

### 선정된 기술 스택

**백엔드:**
- 언어/프레임워크: Node.js 20+ / Express.js (TypeScript)
- ORM: mysql2 (직접 쿼리) + TypeORM (선택적)
- 스케줄러: node-cron
- API 클라이언트: axios
- 검증: joi / zod

**프론트엔드:**
- 프레임워크: React 18+ with Vite
- 언어: TypeScript
- UI 라이브러리: Tailwind CSS
- 상태 관리: React Query + Context API
- 라우팅: React Router v6

**데이터베이스:**
- MySQL 8.0+
- 캐싱: Redis (선택적, Phase 3)

**인프라:**
- 컨테이너: Docker + Docker Compose
- 배포: AWS EC2 / Google Cloud Run
- CI/CD: GitHub Actions

**외부 API:**
- OpenAI API (GPT-4 Turbo)
- NewsAPI.org (뉴스 수집)
- Google AdSense (수익화)

### 선정 근거

#### 백엔드 언어 선택 이유: Node.js + TypeScript

**장점:**
1. **확장성**: 비동기 I/O 기반으로 뉴스 수집 및 AI 분석 등 외부 API 호출에 최적
2. **모바일 API 지원**: RESTful API를 통해 Flutter/React Native 앱과 쉽게 통합
3. **생태계**: npm 패키지 생태계가 풍부 (OpenAI SDK, 스케줄러, DB 드라이버 등)
4. **개발 속도**: JavaScript/TypeScript 단일 언어로 풀스택 개발 가능
5. **유지보수**: TypeScript로 타입 안정성 확보, 대규모 프로젝트 관리 용이

**대안 검토:**
- Python (FastAPI): AI/ML 생태계는 강력하나, 프론트엔드와 언어 이질성
- Java (Spring Boot): 엔터프라이즈급이나 MVP 단계에서 과도한 보일러플레이트
- Go: 성능은 우수하나 생태계가 상대적으로 작음

#### 프론트엔드 기술 선택 이유: React + Vite + Tailwind CSS

**장점:**
1. **반응형 지원**: Tailwind CSS의 모바일 퍼스트 디자인으로 손쉬운 반응형 구현
2. **SEO**: Vite의 빠른 빌드 + React 18의 SSR 지원 (필요 시 Next.js로 전환 가능)
3. **AdSense 통합**: React의 컴포넌트 기반 구조로 광고 영역 관리 용이
4. **개발자 경험**: Vite의 HMR로 빠른 개발, Tailwind로 CSS 작성 시간 단축
5. **커뮤니티**: 방대한 React 생태계와 UI 라이브러리 활용 가능

**대안 검토:**
- Next.js: SSR/SSG 지원으로 SEO에 유리하나, MVP 단계에서는 과도할 수 있음 (Phase 2에서 고려)
- Vue.js: 학습 곡선은 낮으나, 생태계와 채용 시장에서 React보다 작음
- Svelte: 성능은 우수하나, 생태계가 작고 프로덕션 사례가 적음

#### 모바일 확장 전략

**Phase 2 크로스 플랫폼:**
- **1순위: Flutter**
  - 단일 코드베이스로 iOS/Android 동시 지원
  - 네이티브 성능과 UI
  - Dart 언어는 TypeScript와 유사해 학습 곡선 낮음
  - FCM(Firebase Cloud Messaging) 푸시 알림 통합 용이

- **2순위: React Native**
  - React 개발자라면 즉시 적응 가능
  - 웹 코드 일부 재사용 가능
  - Expo를 통한 빠른 프로토타이핑

**API 재사용성:**
- RESTful API 설계로 웹/모바일 클라이언트 모두 동일한 엔드포인트 사용
- JWT 기반 인증 (Phase 2에서 추가)
- API 버전 관리 (/api/v1)

#### 데이터베이스: MySQL 8.0+

**장점:**
1. **안정성**: 금융/경제 데이터 저장에 검증된 RDBMS
2. **JSON 지원**: MySQL 8.0의 JSON 타입으로 affected_sectors 같은 배열 저장
3. **트랜잭션**: ACID 속성 보장
4. **확장성**: 인덱싱, 파티셔닝 등 최적화 기능 풍부
5. **호스팅**: AWS RDS, Google Cloud SQL, PlanetScale 등 매니지드 서비스 다양

#### 스케줄러: node-cron

**장점:**
- Node.js 프로세스 내에서 동작 (별도 cron 데몬 불필요)
- 간단한 설정으로 매일 새벽 자동 실행 구현
- 타임존 설정 지원 (Asia/Seoul)

**대안:**
- AWS EventBridge / Google Cloud Scheduler: 클라우드 서비스 의존성 증가
- Linux cron: 로컬 환경과 클라우드 환경 설정 불일치 가능성

## 프로젝트 구조

```
econoSight/
├── backend/                    # Node.js + Express 백엔드
│   ├── src/
│   │   ├── api/               # REST API 라우터
│   │   │   ├── routes/
│   │   │   │   ├── news.routes.ts
│   │   │   │   └── health.routes.ts
│   │   │   └── index.ts
│   │   ├── services/          # 비즈니스 로직
│   │   │   ├── newsCollector.service.ts    # 뉴스 수집
│   │   │   ├── aiAnalyzer.service.ts       # OpenAI 분석
│   │   │   └── scheduler.service.ts        # 자동 실행
│   │   ├── models/            # 데이터베이스 모델
│   │   │   ├── database.ts
│   │   │   └── news.model.ts
│   │   ├── utils/             # 유틸리티
│   │   │   ├── logger.ts
│   │   │   └── errorHandler.ts
│   │   ├── config/            # 환경 설정
│   │   │   └── config.ts
│   │   └── app.ts             # Express 앱
│   ├── tests/                 # 테스트 코드
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # React + Vite 프론트엔드
│   ├── public/
│   ├── src/
│   │   ├── components/        # 재사용 컴포넌트
│   │   │   ├── NewsList.tsx
│   │   │   ├── NewsCard.tsx
│   │   │   ├── NewsModal.tsx
│   │   │   └── AdBanner.tsx
│   │   ├── pages/             # 페이지 컴포넌트
│   │   │   ├── HomePage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   ├── services/          # API 호출
│   │   │   └── api.ts
│   │   ├── types/             # TypeScript 타입
│   │   │   └── news.types.ts
│   │   ├── hooks/             # 커스텀 훅
│   │   ├── styles/            # 글로벌 스타일
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── database/                   # 데이터베이스 스크립트
│   ├── schema.sql             # DDL
│   └── migrations/            # 마이그레이션
├── docker-compose.yml         # Docker 구성
├── .env.example               # 환경 변수 예시
├── .gitignore
└── README.md
```

## 주요 기능

### Phase 1: MVP (최우선)
- [x] 자동 뉴스 수집 (NewsAPI)
- [x] OpenAI API를 통한 뉴스 분석
  - 뉴스 요약
  - 영향받을 경제 분야 식별
  - 시장 감성 분석 (긍정/부정/중립)
- [x] MySQL 데이터베이스 저장
- [x] REST API 제공
- [x] 반응형 웹 인터페이스
- [x] Google AdSense 준비
- [x] 매일 자동 실행 스케줄러

### Phase 2: 모바일 앱 (2차 고도화)
- [ ] Flutter/React Native 앱 개발
- [ ] FCM 푸시 알림
- [ ] 앱 스토어 배포

### Phase 3: 고도화
- [ ] 사용자 맞춤 필터링
- [ ] 다국어 지원
- [ ] Redis 캐싱
- [ ] 성능 모니터링

## 빠른 시작

### 사전 요구사항
- Node.js 20+
- MySQL 8.0+
- Docker & Docker Compose (선택)
- OpenAI API Key
- NewsAPI Key

### 로컬 실행

```bash
# 1. 저장소 클론
git clone <repository-url>
cd econoSight

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 API 키 입력

# 3. 데이터베이스 설정
mysql -u root -p < database/schema.sql

# 4. 백엔드 설치 및 실행
cd backend
npm install
npm run dev

# 5. 프론트엔드 설치 및 실행 (새 터미널)
cd frontend
npm install
npm run dev
```

### Docker 실행

```bash
docker-compose up -d
```

## API 문서

### GET /api/news
뉴스 목록 조회

**Query Parameters:**
- `date`: yyyy-mm-dd (선택, 기본값: 오늘)
- `limit`: number (선택, 기본값: 20)

**Response:**
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
      "source_url": "https://..."
    }
  ],
  "total": 45
}
```

### GET /api/news/:id
뉴스 상세 조회

### GET /api/news/latest
최신 뉴스 조회

## 예상 비용

### OpenAI API (GPT-4 Turbo)
- 입력: $10.00 / 1M tokens
- 출력: $30.00 / 1M tokens
- **월 예상 비용**: $30-50 (일 10건 분석 기준)

### NewsAPI
- 무료 플랜: 100 requests/day (개발용)
- Developer 플랜: $449/month (프로덕션용)

### 호스팅 (AWS 기준)
- EC2 t3.micro: $8.50/month
- RDS db.t3.micro: $15/month
- **총 월 예상 비용**: $53-73

## 라이선스

MIT License

## 문의

이슈 트래커: [GitHub Issues]
