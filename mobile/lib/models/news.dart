class EconomicNews {
  final int id;
  final String newsDate;
  final String title;
  final String? source;
  final String? sourceUrl;
  final String summary;
  final List<String> affectedSectors;
  final String marketSentiment;
  final double sentimentScore;
  final String createdAt;

  EconomicNews({
    required this.id,
    required this.newsDate,
    required this.title,
    this.source,
    this.sourceUrl,
    required this.summary,
    required this.affectedSectors,
    required this.marketSentiment,
    required this.sentimentScore,
    required this.createdAt,
  });

  factory EconomicNews.fromJson(Map<String, dynamic> json) {
    return EconomicNews(
      id: json['id'] as int,
      newsDate: json['news_date'] as String,
      title: json['title'] as String,
      source: json['source'] as String?,
      sourceUrl: json['source_url'] as String?,
      summary: json['summary'] as String,
      affectedSectors: (json['affected_sectors'] as List<dynamic>)
          .map((e) => e.toString())
          .toList(),
      marketSentiment: json['market_sentiment'] as String,
      sentimentScore: (json['sentiment_score'] as num).toDouble(),
      createdAt: json['created_at'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'news_date': newsDate,
      'title': title,
      'source': source,
      'source_url': sourceUrl,
      'summary': summary,
      'affected_sectors': affectedSectors,
      'market_sentiment': marketSentiment,
      'sentiment_score': sentimentScore,
      'created_at': createdAt,
    };
  }
}

class NewsResponse {
  final bool success;
  final List<EconomicNews> data;
  final Pagination? pagination;
  final int? total;

  NewsResponse({
    required this.success,
    required this.data,
    this.pagination,
    this.total,
  });

  factory NewsResponse.fromJson(Map<String, dynamic> json) {
    return NewsResponse(
      success: json['success'] as bool,
      data: (json['data'] as List<dynamic>)
          .map((e) => EconomicNews.fromJson(e as Map<String, dynamic>))
          .toList(),
      pagination: json['pagination'] != null
          ? Pagination.fromJson(json['pagination'] as Map<String, dynamic>)
          : null,
      total: json['total'] as int?,
    );
  }
}

class Pagination {
  final int total;
  final int limit;
  final int offset;
  final bool hasMore;

  Pagination({
    required this.total,
    required this.limit,
    required this.offset,
    required this.hasMore,
  });

  factory Pagination.fromJson(Map<String, dynamic> json) {
    return Pagination(
      total: json['total'] as int,
      limit: json['limit'] as int,
      offset: json['offset'] as int,
      hasMore: json['hasMore'] as bool,
    );
  }
}
