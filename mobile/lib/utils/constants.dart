class AppConstants {
  // API Configuration
  static const String apiBaseUrl =
      String.fromEnvironment('API_BASE_URL', defaultValue: 'http://localhost:3000');
  static const String apiVersion = '/api';

  // API Endpoints
  static String get newsEndpoint => '$apiBaseUrl$apiVersion/news';
  static String get latestNewsEndpoint => '$apiBaseUrl$apiVersion/news/latest';

  static String newsDetailEndpoint(int id) => '$apiBaseUrl$apiVersion/news/$id';

  // App Configuration
  static const int defaultNewsLimit = 20;
  static const int maxNewsLimit = 100;

  // UI Constants
  static const double defaultPadding = 16.0;
  static const double defaultRadius = 12.0;

  // Sentiment Colors
  static const Map<String, int> sentimentColors = {
    'positive': 0xFF4CAF50, // Green
    'negative': 0xFFF44336, // Red
    'neutral': 0xFF9E9E9E,  // Grey
  };

  // Date Format
  static const String dateFormat = 'yyyy-MM-dd';
  static const String displayDateFormat = 'yyyy년 MM월 dd일';
}
