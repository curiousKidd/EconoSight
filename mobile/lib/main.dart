import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
// import 'package:firebase_core/firebase_core.dart';
// import 'package:firebase_messaging/firebase_messaging.dart';
import 'providers/news_provider.dart';
import 'screens/home_screen.dart';
// import 'services/firebase_service.dart';

// Firebase 백그라운드 메시지 핸들러 (주석 해제 시 사용)
// @pragma('vm:entry-point')
// Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
//   await Firebase.initializeApp();
//   debugPrint('Background message: ${message.messageId}');
// }

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load environment variables (if using flutter_dotenv)
  // await dotenv.load(fileName: "assets/.env");

  // Firebase 초기화 (Firebase 설정 후 주석 해제)
  // await Firebase.initializeApp();
  // FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  runApp(const EconoSightApp());
}

class EconoSightApp extends StatelessWidget {
  const EconoSightApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => NewsProvider(),
        ),
      ],
      child: MaterialApp(
        title: 'EconoSight',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF1976D2),
            brightness: Brightness.light,
          ),
          useMaterial3: true,
          appBarTheme: const AppBarTheme(
            elevation: 0,
            centerTitle: true,
          ),
        ),
        home: const HomeScreen(),
      ),
    );
  }
}
