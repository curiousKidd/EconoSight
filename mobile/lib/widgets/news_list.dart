import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/news.dart';
import '../providers/news_provider.dart';
import 'news_card.dart';

class NewsList extends StatefulWidget {
  final Function(EconomicNews)? onNewsTap;
  final String? filterDate;

  const NewsList({
    super.key,
    this.onNewsTap,
    this.filterDate,
  });

  @override
  State<NewsList> createState() => _NewsListState();
}

class _NewsListState extends State<NewsList> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);

    // Initial data fetch
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<NewsProvider>();
      if (provider.newsList.isEmpty) {
        provider.fetchLatestNews(limit: 20);
      }
    });
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      final provider = context.read<NewsProvider>();
      if (provider.hasMore && !provider.isLoading) {
        provider.loadMore(date: widget.filterDate);
      }
    }
  }

  Future<void> _onRefresh() async {
    final provider = context.read<NewsProvider>();
    await provider.refresh(date: widget.filterDate);
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<NewsProvider>(
      builder: (context, provider, child) {
        // Error state
        if (provider.error != null && provider.newsList.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.error_outline,
                  size: 64,
                  color: Colors.red,
                ),
                const SizedBox(height: 16),
                Text(
                  '오류가 발생했습니다',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  provider.error ?? '',
                  style: Theme.of(context).textTheme.bodyMedium,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _onRefresh,
                  child: const Text('다시 시도'),
                ),
              ],
            ),
          );
        }

        // Loading state (initial)
        if (provider.isLoading && provider.newsList.isEmpty) {
          return const Center(
            child: CircularProgressIndicator(),
          );
        }

        // Empty state
        if (provider.newsList.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.article_outlined,
                  size: 64,
                  color: Colors.grey,
                ),
                const SizedBox(height: 16),
                Text(
                  '뉴스가 없습니다',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  '새로운 뉴스를 기다려주세요',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.grey[600],
                      ),
                ),
              ],
            ),
          );
        }

        // List with data
        return RefreshIndicator(
          onRefresh: _onRefresh,
          child: ListView.builder(
            controller: _scrollController,
            physics: const AlwaysScrollableScrollPhysics(),
            itemCount:
                provider.newsList.length + (provider.hasMore ? 1 : 0),
            itemBuilder: (context, index) {
              if (index == provider.newsList.length) {
                return const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Center(
                    child: CircularProgressIndicator(),
                  ),
                );
              }

              final news = provider.newsList[index];
              return NewsCard(
                news: news,
                onTap: () => widget.onNewsTap?.call(news),
              );
            },
          ),
        );
      },
    );
  }
}
