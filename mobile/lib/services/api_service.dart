import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/news.dart';
import '../utils/constants.dart';

class ApiService {
  final http.Client _client;

  ApiService({http.Client? client}) : _client = client ?? http.Client();

  /// 뉴스 목록 조회
  Future<NewsResponse> getNews({
    String? date,
    int limit = AppConstants.defaultNewsLimit,
    int offset = 0,
  }) async {
    try {
      final queryParams = <String, String>{};

      if (date != null) {
        queryParams['date'] = date;
      }
      queryParams['limit'] = limit.toString();
      queryParams['offset'] = offset.toString();

      final uri = Uri.parse(AppConstants.newsEndpoint).replace(
        queryParameters: queryParams,
      );

      final response = await _client.get(uri);

      if (response.statusCode == 200) {
        final jsonData = json.decode(utf8.decode(response.bodyBytes));
        return NewsResponse.fromJson(jsonData);
      } else {
        throw ApiException(
          'Failed to load news: ${response.statusCode}',
          response.statusCode,
        );
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: $e', 0);
    }
  }

  /// 최신 뉴스 조회
  Future<NewsResponse> getLatestNews({int limit = 10}) async {
    try {
      final uri = Uri.parse(AppConstants.latestNewsEndpoint).replace(
        queryParameters: {'limit': limit.toString()},
      );

      final response = await _client.get(uri);

      if (response.statusCode == 200) {
        final jsonData = json.decode(utf8.decode(response.bodyBytes));
        return NewsResponse.fromJson(jsonData);
      } else {
        throw ApiException(
          'Failed to load latest news: ${response.statusCode}',
          response.statusCode,
        );
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: $e', 0);
    }
  }

  /// 뉴스 상세 조회
  Future<EconomicNews> getNewsById(int id) async {
    try {
      final uri = Uri.parse(AppConstants.newsDetailEndpoint(id));

      final response = await _client.get(uri);

      if (response.statusCode == 200) {
        final jsonData = json.decode(utf8.decode(response.bodyBytes));
        if (jsonData['success'] == true && jsonData['data'] != null) {
          return EconomicNews.fromJson(jsonData['data']);
        } else {
          throw ApiException('Invalid response format', response.statusCode);
        }
      } else if (response.statusCode == 404) {
        throw ApiException('News not found', 404);
      } else {
        throw ApiException(
          'Failed to load news detail: ${response.statusCode}',
          response.statusCode,
        );
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: $e', 0);
    }
  }

  void dispose() {
    _client.close();
  }
}

class ApiException implements Exception {
  final String message;
  final int statusCode;

  ApiException(this.message, this.statusCode);

  @override
  String toString() => 'ApiException: $message (Status: $statusCode)';
}
