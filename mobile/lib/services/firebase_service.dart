import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

/// Firebase Cloud Messaging 서비스
class FirebaseService {
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  String? _fcmToken;

  String? get fcmToken => _fcmToken;

  /// Firebase 초기화 및 권한 요청
  Future<void> initialize() async {
    try {
      // 알림 권한 요청
      NotificationSettings settings = await _messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        debugPrint('User granted notification permission');

        // FCM 토큰 가져오기
        _fcmToken = await _messaging.getToken();
        debugPrint('FCM Token: $_fcmToken');

        // 토큰 갱신 리스너
        _messaging.onTokenRefresh.listen((newToken) {
          _fcmToken = newToken;
          debugPrint('FCM Token refreshed: $newToken');
          // TODO: 백엔드에 새 토큰 전송
        });

        // 포그라운드 메시지 핸들러 설정
        FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

        // 백그라운드 메시지 핸들러는 main.dart에서 설정
        FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageOpenedApp);
      } else {
        debugPrint('User declined notification permission');
      }
    } catch (e) {
      debugPrint('Error initializing Firebase Messaging: $e');
    }
  }

  /// 포그라운드 메시지 처리
  void _handleForegroundMessage(RemoteMessage message) {
    debugPrint('Foreground message received');
    debugPrint('Title: ${message.notification?.title}');
    debugPrint('Body: ${message.notification?.body}');
    debugPrint('Data: ${message.data}');

    // TODO: 로컬 알림 표시 (flutter_local_notifications 사용)
  }

  /// 알림 클릭 시 처리 (앱이 백그라운드에 있을 때)
  void _handleMessageOpenedApp(RemoteMessage message) {
    debugPrint('Message clicked, app opened from background');
    debugPrint('Data: ${message.data}');

    // TODO: 뉴스 상세 화면으로 이동
    // 예: Navigator.push(context, NewsDetailScreen(id: message.data['news_id']))
  }

  /// 백엔드에 FCM 토큰 전송
  Future<void> sendTokenToBackend(String? token) async {
    if (token == null) return;

    try {
      // TODO: API 호출하여 토큰 저장
      // await apiService.saveFcmToken(token);
      debugPrint('TODO: Send FCM token to backend: $token');
    } catch (e) {
      debugPrint('Error sending FCM token to backend: $e');
    }
  }

  /// 특정 토픽 구독
  Future<void> subscribeToTopic(String topic) async {
    try {
      await _messaging.subscribeToTopic(topic);
      debugPrint('Subscribed to topic: $topic');
    } catch (e) {
      debugPrint('Error subscribing to topic: $e');
    }
  }

  /// 특정 토픽 구독 해제
  Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _messaging.unsubscribeFromTopic(topic);
      debugPrint('Unsubscribed from topic: $topic');
    } catch (e) {
      debugPrint('Error unsubscribing from topic: $e');
    }
  }
}

/// 백그라운드 메시지 핸들러 (Top-level 함수여야 함)
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Firebase.initializeApp()이 필요한 경우 여기서 호출
  debugPrint('Background message received');
  debugPrint('Title: ${message.notification?.title}');
  debugPrint('Body: ${message.notification?.body}');
  debugPrint('Data: ${message.data}');
}
