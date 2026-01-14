# 백엔드 FCM 설정 가이드

백엔드에서 Firebase Cloud Messaging (FCM)을 사용하여 푸시 알림을 전송하는 방법입니다.

## 1. Firebase 서비스 계정 키 생성

### 1.1 Firebase Console에서 키 생성

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택
3. 프로젝트 설정 (⚙️ 아이콘) > "서비스 계정" 탭
4. "새 비공개 키 생성" 클릭
5. JSON 파일 다운로드 (예: `econosight-firebase-adminsdk-xxxxx.json`)

### 1.2 키 파일 저장

```bash
# backend 디렉토리에 config 폴더 생성 (없으면)
mkdir -p backend/config

# 다운로드한 파일을 config 폴더로 복사
cp ~/Downloads/econosight-firebase-adminsdk-xxxxx.json backend/config/firebase-service-account.json
```

**주의**: 이 파일은 절대로 git에 커밋하지 마세요!

## 2. 환경 변수 설정

`backend/.env` 파일에 Firebase 설정 추가:

```env
# Firebase Cloud Messaging (FCM)
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
```

## 3. .gitignore 업데이트

`backend/.gitignore`에 추가:

```gitignore
# Firebase service account key
config/firebase-service-account.json
```

## 4. API 엔드포인트

### 4.1 FCM 토큰 등록

**POST** `/api/fcm/register`

Flutter 앱에서 받은 FCM 토큰을 저장합니다.

**Request Body:**
```json
{
  "token": "dGVzdF90b2tlbl8xMjM0NTY3ODkw...",
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "FCM token registered successfully",
  "data": {
    "token": "dGVzdF90b2tlbl8xMjM0NTY3ODkw...",
    "userId": "user123"
  }
}
```

### 4.2 단일 기기에 알림 전송

**POST** `/api/fcm/send`

특정 기기에 푸시 알림을 전송합니다.

**Request Body:**
```json
{
  "token": "dGVzdF90b2tlbl8xMjM0NTY3ODkw...",
  "title": "새로운 경제 뉴스",
  "body": "Fed, 기준금리 동결 결정",
  "data": {
    "newsId": "123",
    "type": "new_news"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent successfully"
}
```

### 4.3 여러 기기에 일괄 알림 전송

**POST** `/api/fcm/send-bulk`

여러 기기에 동시에 푸시 알림을 전송합니다.

**Request Body:**
```json
{
  "tokens": [
    "token1...",
    "token2...",
    "token3..."
  ],
  "title": "오늘의 경제 뉴스",
  "body": "총 5건의 새로운 뉴스가 등록되었습니다",
  "data": {
    "type": "daily_summary"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk notification sent",
  "data": {
    "successCount": 3,
    "failureCount": 0
  }
}
```

### 4.4 토픽에 알림 전송

**POST** `/api/fcm/send-topic`

특정 토픽 구독자들에게 푸시 알림을 전송합니다.

**Request Body:**
```json
{
  "topic": "daily_news",
  "title": "오늘의 경제 뉴스",
  "body": "Fed, 기준금리 동결 결정",
  "data": {
    "newsId": "123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent to topic daily_news"
}
```

### 4.5 토픽 구독

**POST** `/api/fcm/subscribe`

기기를 특정 토픽에 구독시킵니다.

**Request Body:**
```json
{
  "tokens": ["token1...", "token2..."],
  "topic": "daily_news"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscribed to topic daily_news",
  "data": {
    "successCount": 2,
    "failureCount": 0
  }
}
```

### 4.6 토픽 구독 해제

**POST** `/api/fcm/unsubscribe`

기기의 토픽 구독을 해제합니다.

**Request Body:**
```json
{
  "tokens": ["token1...", "token2..."],
  "topic": "daily_news"
}
```

### 4.7 새 뉴스 알림 (편의 엔드포인트)

**POST** `/api/fcm/notify-new-news`

새 뉴스가 등록되었을 때 'daily_news' 토픽 구독자들에게 알림을 전송합니다.

**Request Body:**
```json
{
  "newsId": 123,
  "title": "Fed, 기준금리 동결 결정",
  "summary": "미국 연방준비제도가..."
}
```

## 5. 자동 알림 설정

### 5.1 뉴스 수집 시 자동 알림

`src/services/newsCollector.service.ts` 또는 스케줄러에서 새 뉴스 수집 후 자동으로 알림 전송:

```typescript
import { fcmService } from './fcm.service';

// 뉴스 수집 후
async function afterNewsCollection(news: EconomicNews[]) {
  if (news.length > 0) {
    const latestNews = news[0];

    // 'daily_news' 토픽 구독자들에게 알림
    await fcmService.sendToTopic('daily_news', {
      title: '새로운 경제 뉴스',
      body: latestNews.title,
      data: {
        newsId: latestNews.id.toString(),
        type: 'new_news',
      },
    });
  }
}
```

### 5.2 매일 아침 요약 알림

스케줄러를 사용하여 매일 아침 경제 뉴스 요약을 전송:

```typescript
import cron from 'node-cron';
import { fcmService } from './fcm.service';
import { NewsModel } from '../models/news.model';

// 매일 아침 8시에 실행
cron.schedule('0 8 * * *', async () => {
  const today = new Date().toISOString().split('T')[0];
  const todayNews = await NewsModel.findByDate(today, 10, 0);

  if (todayNews.length > 0) {
    await fcmService.sendToTopic('daily_news', {
      title: '오늘의 경제 뉴스',
      body: `${todayNews.length}건의 새로운 뉴스가 등록되었습니다`,
      data: {
        type: 'daily_summary',
        count: todayNews.length.toString(),
      },
    });
  }
});
```

## 6. 테스트

### 6.1 cURL로 테스트

```bash
# 단일 기기에 알림 전송
curl -X POST http://localhost:3000/api/fcm/send \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_FCM_TOKEN",
    "title": "테스트 알림",
    "body": "백엔드에서 전송한 테스트 메시지입니다",
    "data": {
      "newsId": "1",
      "type": "test"
    }
  }'
```

### 6.2 Postman으로 테스트

1. Postman에서 새 요청 생성
2. Method: POST
3. URL: `http://localhost:3000/api/fcm/send`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "token": "YOUR_FCM_TOKEN",
  "title": "테스트 알림",
  "body": "백엔드에서 전송한 테스트 메시지입니다"
}
```

## 7. 데이터베이스 스키마 (선택사항)

FCM 토큰을 데이터베이스에 저장하려면:

```sql
CREATE TABLE fcm_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255),
  token TEXT NOT NULL,
  platform ENUM('android', 'ios', 'web') DEFAULT 'android',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_platform (user_id, platform),
  INDEX idx_user_id (user_id)
);
```

## 8. 프로덕션 배포 시 주의사항

1. **서비스 계정 키 보안**
   - 환경 변수로 관리
   - AWS Secrets Manager, Google Secret Manager 등 사용 권장
   - 절대로 git에 커밋하지 않기

2. **에러 처리**
   - 실패한 토큰 제거 로직 구현
   - 재시도 메커니즘 추가

3. **알림 빈도 제한**
   - 스팸 방지를 위한 알림 빈도 제한
   - 사용자 알림 설정 준수

4. **로깅 및 모니터링**
   - 알림 전송 성공/실패 로그
   - 토큰 갱신 모니터링

## 9. 문제 해결

### 문제: "FIREBASE_SERVICE_ACCOUNT_PATH not set" 경고

**원인**: 환경 변수가 설정되지 않음

**해결**:
```bash
# .env 파일 확인
cat backend/.env

# FIREBASE_SERVICE_ACCOUNT_PATH가 설정되어 있는지 확인
```

### 문제: "Failed to initialize Firebase Admin SDK" 오류

**원인**: 서비스 계정 키 파일 경로가 잘못됨

**해결**:
```bash
# 파일 존재 확인
ls -la backend/config/firebase-service-account.json

# 경로가 올바른지 확인 (.env 파일의 경로는 상대 경로)
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
```

### 문제: "Failed to send notification" 오류

**원인**:
- 잘못된 FCM 토큰
- 토큰이 만료됨
- Firebase 프로젝트 설정 오류

**해결**:
1. Flutter 앱에서 최신 토큰 확인
2. Firebase Console에서 프로젝트 설정 확인
3. 서비스 계정 키가 올바른 프로젝트의 것인지 확인

## 참고 자료

- [Firebase Admin SDK 문서](https://firebase.google.com/docs/admin/setup)
- [FCM Server 문서](https://firebase.google.com/docs/cloud-messaging/server)
- [Node.js Admin SDK](https://firebase.google.com/docs/reference/admin/node)
