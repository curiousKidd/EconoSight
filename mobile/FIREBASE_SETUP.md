# Firebase 푸시 알림 설정 가이드

FCM (Firebase Cloud Messaging)을 사용하여 푸시 알림을 구현하는 방법입니다.

## 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: `econosight` (또는 원하는 이름)
4. Google Analytics 활성화 (선택사항)
5. 프로젝트 생성 완료

## 2. Android 설정

### 2.1 Android 앱 등록

1. Firebase Console에서 프로젝트 선택
2. "Android 앱에 Firebase 추가" 클릭
3. Android 패키지 이름: `com.econosight.mobile`
4. 앱 닉네임: `EconoSight` (선택사항)
5. Debug signing certificate SHA-1: (선택사항, 개발 시)

### 2.2 google-services.json 다운로드

1. Firebase Console에서 `google-services.json` 파일 다운로드
2. 파일을 `mobile/android/app/` 디렉토리에 복사

```bash
cp ~/Downloads/google-services.json mobile/android/app/
```

### 2.3 Android 프로젝트 설정

**android/build.gradle** (프로젝트 레벨):

```gradle
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.1.0'
        classpath 'com.google.gms:google-services:4.4.0'  // 추가
    }
}
```

**android/app/build.gradle** (앱 레벨):

```gradle
apply plugin: 'com.android.application'
apply plugin: 'com.google.gms.google-services'  // 추가 (맨 아래)

android {
    defaultConfig {
        applicationId "com.econosight.mobile"
        // ... 기타 설정
    }
}

dependencies {
    // Firebase BOM
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-messaging'
}
```

**android/app/src/main/AndroidManifest.xml**:

```xml
<manifest>
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>  <!-- 추가 -->

    <application>
        <!-- FCM 서비스 -->
        <service
            android:name="io.flutter.plugins.firebase.messaging.FlutterFirebaseMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>
    </application>
</manifest>
```

## 3. iOS 설정

### 3.1 iOS 앱 등록

1. Firebase Console에서 프로젝트 선택
2. "iOS 앱에 Firebase 추가" 클릭
3. iOS 번들 ID: `com.econosight.mobile`
4. 앱 닉네임: `EconoSight` (선택사항)

### 3.2 GoogleService-Info.plist 다운로드

1. Firebase Console에서 `GoogleService-Info.plist` 파일 다운로드
2. Xcode에서 `mobile/ios/Runner` 폴더에 파일 추가
   - Xcode에서 Runner 프로젝트 열기
   - Runner 폴더에 파일 드래그 앤 드롭
   - "Copy items if needed" 체크

### 3.3 iOS 프로젝트 설정

**ios/Runner/Info.plist**:

```xml
<dict>
    <!-- 기존 설정 -->

    <!-- Firebase Messaging -->
    <key>FirebaseMessagingAutoInitEnabled</key>
    <true/>
</dict>
```

**Capabilities 추가** (Xcode):
1. Xcode에서 Runner 프로젝트 선택
2. Signing & Capabilities 탭
3. "+ Capability" 클릭
4. "Push Notifications" 추가
5. "Background Modes" 추가
   - "Remote notifications" 체크

### 3.4 APNs 인증 키 업로드 (중요!)

1. [Apple Developer Console](https://developer.apple.com/) 접속
2. Certificates, Identifiers & Profiles > Keys
3. "+" 버튼 클릭하여 새 키 생성
4. "Apple Push Notifications service (APNs)" 체크
5. 생성된 `.p8` 파일 다운로드
6. Firebase Console > 프로젝트 설정 > Cloud Messaging
7. APNs 인증 키 업로드:
   - Key ID
   - Team ID
   - `.p8` 파일

## 4. Flutter 코드 활성화

**mobile/lib/main.dart**:

주석 처리된 Firebase 관련 코드를 활성화:

```dart
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'services/firebase_service.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint('Background message: ${message.messageId}');
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Firebase 초기화
  await Firebase.initializeApp();
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  runApp(const EconoSightApp());
}
```

**HomeScreen에서 Firebase 초기화**:

```dart
@override
void initState() {
  super.initState();
  _initializeFirebase();
}

Future<void> _initializeFirebase() async {
  final firebaseService = FirebaseService();
  await firebaseService.initialize();

  // 백엔드에 FCM 토큰 전송
  if (firebaseService.fcmToken != null) {
    await firebaseService.sendTokenToBackend(firebaseService.fcmToken);
  }
}
```

## 5. 패키지 설치 및 실행

```bash
# Firebase 관련 패키지 설치
flutter pub get

# iOS 의존성 설치 (macOS only)
cd ios && pod install && cd ..

# 앱 실행
flutter run
```

## 6. 테스트

### 6.1 FCM 토큰 확인

앱을 실행하면 콘솔에 FCM 토큰이 출력됩니다:

```
FCM Token: dGVzdF90b2tlbl8xMjM0NTY3ODkw...
```

### 6.2 Firebase Console에서 테스트 메시지 전송

1. Firebase Console > Cloud Messaging
2. "첫 번째 캠페인 만들기" 또는 "새 알림"
3. 알림 제목/내용 입력
4. "테스트 메시지 전송"
5. FCM 토큰 입력
6. "테스트" 클릭

### 6.3 테스트 시나리오

1. **포그라운드**: 앱이 실행 중일 때 메시지 수신
2. **백그라운드**: 앱이 백그라운드에 있을 때 메시지 수신
3. **종료됨**: 앱이 종료된 상태에서 메시지 수신 후 알림 클릭

## 7. 백엔드 통합

백엔드에서 FCM 토큰을 저장하고 푸시 알림을 전송하려면:

### 7.1 백엔드 API 추가

```typescript
// backend/src/api/routes/fcm.routes.ts
router.post('/fcm/register', async (req, res) => {
  const { userId, token } = req.body;
  // 데이터베이스에 FCM 토큰 저장
  await saveFcmToken(userId, token);
  res.json({ success: true });
});
```

### 7.2 Flutter에서 토큰 전송

```dart
// lib/services/api_service.dart
Future<void> saveFcmToken(String token) async {
  final uri = Uri.parse('$apiBaseUrl/api/fcm/register');
  await _client.post(
    uri,
    headers: {'Content-Type': 'application/json'},
    body: json.encode({'token': token}),
  );
}
```

## 8. 문제 해결

### Android

**문제**: `google-services.json` 파일을 찾을 수 없음

**해결**:
```bash
# 파일 위치 확인
ls -la mobile/android/app/google-services.json

# 없으면 다시 복사
cp ~/Downloads/google-services.json mobile/android/app/
```

### iOS

**문제**: APNs 인증 오류

**해결**:
1. Firebase Console에서 APNs 인증 키가 올바르게 업로드되었는지 확인
2. Xcode에서 Capabilities > Push Notifications 활성화 확인
3. 실제 기기에서 테스트 (시뮬레이터는 푸시 알림 미지원)

**문제**: `GoogleService-Info.plist` 파일을 찾을 수 없음

**해결**:
1. Xcode에서 Runner 프로젝트 열기
2. Runner 폴더에 파일이 포함되어 있는지 확인
3. 없으면 Xcode에서 다시 추가 (Copy items if needed 체크)

## 9. 프로덕션 배포 시 주의사항

1. **Android**: Release 키로 서명 시 Firebase에 SHA-1 추가
2. **iOS**: Production APNs 인증서/키 사용
3. **토픽 구독**: 사용자 세그먼트별 알림을 위해 토픽 활용
4. **알림 권한**: 앱 첫 실행 시 적절한 시점에 권한 요청

## 참고 자료

- [FlutterFire 공식 문서](https://firebase.flutter.dev/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [iOS 푸시 알림 설정](https://firebase.google.com/docs/cloud-messaging/ios/client)
- [Android 푸시 알림 설정](https://firebase.google.com/docs/cloud-messaging/android/client)
