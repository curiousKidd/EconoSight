import 'package:flutter/foundation.dart';
import '../models/news.dart';
import '../services/api_service.dart';

class NewsProvider with ChangeNotifier {
  final ApiService _apiService;

  NewsProvider({ApiService? apiService})
      : _apiService = apiService ?? ApiService();

  // State
  List<EconomicNews> _newsList = [];
  EconomicNews? _selectedNews;
  bool _isLoading = false;
  String? _error;
  Pagination? _pagination;

  // Getters
  List<EconomicNews> get newsList => _newsList;
  EconomicNews? get selectedNews => _selectedNews;
  bool get isLoading => _isLoading;
  String? get error => _error;
  Pagination? get pagination => _pagination;
  bool get hasMore => _pagination?.hasMore ?? false;

  /// 뉴스 목록 조회
  Future<void> fetchNews({
    String? date,
    int limit = 20,
    int offset = 0,
    bool append = false,
  }) async {
    try {
      _isLoading = true;
      _error = null;
      if (!append) {
        notifyListeners();
      }

      final response = await _apiService.getNews(
        date: date,
        limit: limit,
        offset: offset,
      );

      if (append) {
        _newsList.addAll(response.data);
      } else {
        _newsList = response.data;
      }

      _pagination = response.pagination;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  /// 최신 뉴스 조회
  Future<void> fetchLatestNews({int limit = 10}) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final response = await _apiService.getLatestNews(limit: limit);

      _newsList = response.data;
      _pagination = null; // Latest news doesn't use pagination
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  /// 뉴스 상세 조회
  Future<void> fetchNewsById(int id) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final news = await _apiService.getNewsById(id);

      _selectedNews = news;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  /// 다음 페이지 로드
  Future<void> loadMore({String? date, int limit = 20}) async {
    if (_isLoading || !hasMore) return;

    final currentOffset = _pagination?.offset ?? 0;
    final currentLimit = _pagination?.limit ?? limit;

    await fetchNews(
      date: date,
      limit: currentLimit,
      offset: currentOffset + currentLimit,
      append: true,
    );
  }

  /// 새로고침
  Future<void> refresh({String? date, int limit = 20}) async {
    await fetchNews(date: date, limit: limit, offset: 0, append: false);
  }

  /// 선택된 뉴스 초기화
  void clearSelectedNews() {
    _selectedNews = null;
    notifyListeners();
  }

  /// 에러 초기화
  void clearError() {
    _error = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _apiService.dispose();
    super.dispose();
  }
}
