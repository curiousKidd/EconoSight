# EconoSight 설치 및 실행 가이드

## 목차
1. [사전 요구사항](#사전-요구사항)
2. [로컬 개발 환경 설정](#로컬-개발-환경-설정)
3. [Docker를 이용한 실행](#docker를-이용한-실행)
4. [문제 해결](#문제-해결)
5. [API 테스트](#api-테스트)

---

## 사전 요구사항

### 필수 소프트웨어
- **Node.js**: v20.0.0 이상
- **MySQL**: v8.0 이상
- **npm**: v9.0.0 이상
- **Docker** (선택 사항): v20.0 이상
- **Docker Compose** (선택 사항): v2.0 이상

### API 키 발급
프로젝트 실행을 위해 다음 API 키가 필요합니다:

1. **OpenAI API 키**
   - https://platform.openai.com/api-keys 에서 발급
   - 비용: GPT-4 Turbo 기준 Input $10/1M tokens, Output $30/1M tokens

2. **NewsAPI 키**
   - https://newsapi.org/register 에서 발급
   - 무료 플랜: 100 requests/day (개발용)
   - 유료 플랜: $449/month (프로덕션용)

3. **Google AdSense** (선택 사항)
   - https://www.google.com/adsense 에서 신청

---

## 로컬 개발 환경 설정

### 1. 저장소 클론 (또는 현재 디렉토리 사용)

```bash
cd /Users/kidd.curious/IDE_MINE/econoSight
```

### 2. 환경 변수 설정

```bash
# 루트 디렉토리에 .env 파일 생성
cp .env.example .env

# 프론트엔드 .env 파일 생성
cp frontend/.env.example frontend/.env
```

**.env 파일 수정** (중요!):
```bash
# 텍스트 에디터로 .env 파일을 열어 다음 값들을 설정하세요
nano .env
```

필수 설정 항목:
- `OPENAI_API_KEY`: OpenAI API 키 입력
- `NEWS_API_KEY`: NewsAPI 키 입력
- `DB_PASSWORD`: MySQL 비밀번호 설정

### 3. MySQL 데이터베이스 설정

#### 옵션 A: 로컬 MySQL 사용

```bash
# MySQL 실행 (macOS)
brew services start mysql

# MySQL 로그인
mysql -u root -p

# 데이터베이스 생성 및 스키마 적용
mysql -u root -p < database/schema.sql
```

#### 옵션 B: Docker MySQL 사용

```bash
# MySQL 컨테이너 실행
docker run -d \
  --name econosight-mysql \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -e MYSQL_DATABASE=econosight \
  -p 3306:3306 \
  mysql:8.0

# 스키마 적용
docker exec -i econosight-mysql mysql -uroot -pyour_password < database/schema.sql
```

### 4. 백엔드 설치 및 실행

```bash
cd backend

# 의존성 설치
npm install

# 개발 모드로 실행
npm run dev
```

서버가 정상적으로 시작되면:
```
Server is running on port 3000
Database connected successfully
Scheduler started successfully
```

### 5. 프론트엔드 설치 및 실행 (새 터미널)

```bash
cd frontend

# 의존성 설치
npm install

# 개발 모드로 실행
npm run dev
```

브라우저에서 http://localhost:5173 접속

### 6. 수동 뉴스 수집 테스트

```bash
cd backend

# 어제 날짜 뉴스 수집
npm run collect-news

# 특정 날짜 뉴스 수집
npx tsx src/scripts/collectNews.ts 2024-12-10
```

---

## Docker를 이용한 실행

### 1. 환경 변수 설정

```bash
cp .env.example .env
# .env 파일을 편집하여 API 키 입력
nano .env
```

### 2. Docker Compose로 전체 스택 실행

```bash
# 백그라운드에서 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 특정 서비스 로그만 확인
docker-compose logs -f backend
```

### 3. 서비스 확인

- **프론트엔드**: http://localhost
- **백엔드 API**: http://localhost:3000/api
- **헬스 체크**: http://localhost:3000/api/health
- **MySQL**: localhost:3306

### 4. Docker 중지 및 삭제

```bash
# 서비스 중지
docker-compose stop

# 서비스 삭제 (데이터 유지)
docker-compose down

# 서비스 및 볼륨 삭제 (데이터 삭제)
docker-compose down -v
```

---

## 문제 해결

### 1. 데이터베이스 연결 실패

**증상**:
```
Failed to connect to database: ECONNREFUSED
```

**해결**:
1. MySQL이 실행 중인지 확인
   ```bash
   # macOS
   brew services list

   # Linux
   sudo systemctl status mysql
   ```

2. .env 파일의 DB 설정 확인
   ```bash
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   ```

3. MySQL 연결 테스트
   ```bash
   mysql -h localhost -u root -p
   ```

### 2. OpenAI API 오류

**증상**:
```
Invalid OpenAI API key format
```

**해결**:
1. API 키가 `sk-`로 시작하는지 확인
2. .env 파일에 따옴표 없이 입력되었는지 확인
3. OpenAI 대시보드에서 API 키 활성화 상태 확인

### 3. NewsAPI Rate Limit

**증상**:
```
NewsAPI rate limit exceeded
```

**해결**:
1. 무료 플랜은 100 requests/day 제한
2. 스케줄러를 일시적으로 비활성화
   ```bash
   SCHEDULER_ENABLED=false
   ```
3. 유료 플랜으로 업그레이드 고려

### 4. 포트 충돌

**증상**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**해결**:
1. 사용 중인 프로세스 확인
   ```bash
   # macOS/Linux
   lsof -i :3000

   # Windows
   netstat -ano | findstr :3000
   ```

2. 포트 변경
   ```bash
   # .env 파일에서
   PORT=3001
   ```

### 5. 프론트엔드 빌드 오류

**증상**:
```
Module not found: Error: Can't resolve 'date-fns'
```

**해결**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## API 테스트

### cURL을 이용한 테스트

```bash
# 헬스 체크
curl http://localhost:3000/api/health

# 최신 뉴스 조회
curl http://localhost:3000/api/news/latest

# 특정 날짜 뉴스 조회
curl "http://localhost:3000/api/news?date=2024-12-10"

# 뉴스 상세 조회
curl http://localhost:3000/api/news/1
```

### Postman Collection

API 테스트를 위한 Postman Collection:

```json
{
  "info": {
    "name": "EconoSight API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": "http://localhost:3000/api/health"
      }
    },
    {
      "name": "Get Latest News",
      "request": {
        "method": "GET",
        "header": [],
        "url": "http://localhost:3000/api/news/latest?limit=10"
      }
    },
    {
      "name": "Get News by Date",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3000/api/news?date=2024-12-10&limit=20",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "news"],
          "query": [
            {"key": "date", "value": "2024-12-10"},
            {"key": "limit", "value": "20"}
          ]
        }
      }
    }
  ]
}
```

---

## 배포 가이드

### AWS EC2 배포 (권장)

1. **EC2 인스턴스 생성**
   - 인스턴스 타입: t3.small 이상
   - OS: Ubuntu 22.04 LTS
   - 보안 그룹: 80, 443, 3000 포트 개방

2. **서버 설정**
   ```bash
   # Docker 설치
   sudo apt update
   sudo apt install -y docker.io docker-compose

   # 프로젝트 클론
   git clone <repository-url>
   cd econoSight

   # 환경 변수 설정
   cp .env.example .env
   nano .env

   # 실행
   sudo docker-compose up -d
   ```

3. **도메인 연결 및 HTTPS 설정**
   - Nginx + Let's Encrypt 사용 권장

### Vercel (프론트엔드) + AWS (백엔드)

프론트엔드만 Vercel에 배포하고 백엔드는 AWS에 배포하는 방식도 가능합니다.

---

## 예상 비용 계산

### 개발/테스트 환경 (월간)
- **OpenAI API**: $0-10 (테스트 목적)
- **NewsAPI**: Free (100 requests/day)
- **호스팅**: $0 (로컬)
- **총 예상 비용**: $0-10/월

### 프로덕션 환경 (월간)
- **OpenAI API**: $30-50 (일 10건 분석 기준)
- **NewsAPI**: $449 (Developer 플랜)
- **AWS EC2**: $8.50 (t3.micro)
- **AWS RDS**: $15 (db.t3.micro)
- **총 예상 비용**: $502-522/월

### 비용 절감 팁
1. OpenAI API 사용량 모니터링 및 제한 설정
2. NewsAPI 대신 무료 RSS 피드 활용 고려
3. AWS 프리티어 활용 (첫 12개월)
4. CloudFlare CDN 무료 플랜 사용

---

## 다음 단계

MVP가 완성되었습니다! 다음 단계로 진행할 수 있습니다:

### Phase 2: 모바일 앱
- Flutter 또는 React Native로 모바일 앱 개발
- FCM 푸시 알림 구현
- 앱 스토어 배포

### Phase 3: 고도화
- 사용자 계정 시스템
- 맞춤 뉴스 필터링
- 다국어 지원 (영어, 일본어 등)
- Redis 캐싱으로 성능 향상
- 이메일 뉴스레터 발송

---

## 지원

문제가 발생하거나 질문이 있으시면:
- GitHub Issues: [링크]
- 이메일: [이메일]
- 문서: README.md 참조

**Happy Coding! 🚀**
