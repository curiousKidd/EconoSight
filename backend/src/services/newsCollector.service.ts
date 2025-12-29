import axios from 'axios';
import config from '../config/config';
import logger from '../utils/logger';
import { NewsArticle } from './aiAnalyzer.service';

interface NewsAPIArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

/**
 * RSS 피드를 사용하여 경제 뉴스를 수집합니다 (무료).
 *
 * @param fromDate 시작 날짜 (YYYY-MM-DD)
 * @param toDate 종료 날짜 (YYYY-MM-DD)
 * @returns 수집된 뉴스 기사 배열
 */
export async function collectEconomicNews(
  fromDate?: string,
  toDate?: string
): Promise<NewsArticle[]> {
  // RSS 피드 방식 사용 (NewsAPI 불필요)
  logger.info('Collecting news from RSS feeds...');

  const rssSources = [
    'https://feeds.bloomberg.com/markets/news.rss',
    'https://www.reuters.com/rssFeed/businessNews',
    'https://www.ft.com/?format=rss',
  ];

  const allArticles: NewsArticle[] = [];

  for (const rssUrl of rssSources) {
    try {
      const articles = await collectFromRSS(rssUrl);
      allArticles.push(...articles);
    } catch (error: any) {
      logger.error(`Failed to collect from RSS: ${rssUrl}`, error.message);
      // 하나의 RSS 실패해도 계속 진행
    }
  }

  return allArticles;

  // 기본값: 어제 날짜
  if (!fromDate || !toDate) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    fromDate = toDate = yesterday.toISOString().split('T')[0];
  }

  logger.info(`Collecting economic news from ${fromDate} to ${toDate}`);

  try {
    const url = `${config.newsApi.baseUrl}/everything`;

    // 경제 관련 키워드 (영어)
    const keywords = [
      'economy',
      'finance',
      'stock market',
      'Federal Reserve',
      'interest rate',
      'GDP',
      'inflation',
      'trade',
      'semiconductor',
      'oil prices',
    ].join(' OR ');

    const params = {
      q: keywords,
      from: fromDate,
      to: toDate,
      language: config.newsApi.language,
      sortBy: 'relevancy',
      pageSize: config.newsApi.pageSize,
      apiKey: config.newsApi.apiKey,
    };

    const response = await axios.get<NewsAPIResponse>(url, {
      params,
      timeout: 30000,
    });

    if (response.data.status !== 'ok') {
      throw new Error(`NewsAPI returned status: ${response.data.status}`);
    }

    logger.info(`Collected ${response.data.articles.length} articles`);

    // NewsAPI 형식을 내부 형식으로 변환
    const articles: NewsArticle[] = response.data.articles
      .filter((article) => {
        // 제목과 내용이 있는 기사만 필터링
        return article.title && article.content && article.title !== '[Removed]';
      })
      .map((article) => ({
        title: article.title,
        content: article.content || article.description || '',
        source: article.source.name,
        publishedAt: article.publishedAt,
        url: article.url,
      }));

    logger.info(`Filtered to ${articles.length} valid articles`);

    return articles;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Invalid NewsAPI key');
      }
      if (error.response?.status === 429) {
        throw new Error('NewsAPI rate limit exceeded');
      }
      logger.error('NewsAPI error:', error.response?.data || error.message);
    }
    throw new Error(`Failed to collect news: ${error.message}`);
  }
}

/**
 * 특정 소스에서 뉴스 수집 (대안)
 *
 * @param sources 뉴스 소스 배열 (예: ['bloomberg', 'reuters'])
 * @param fromDate 시작 날짜
 * @param toDate 종료 날짜
 * @returns 수집된 뉴스 기사 배열
 */
export async function collectFromSources(
  sources: string[],
  fromDate?: string,
  toDate?: string
): Promise<NewsArticle[]> {
  if (!config.newsApi.apiKey) {
    throw new Error('NewsAPI key is not configured');
  }

  if (!fromDate || !toDate) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    fromDate = toDate = yesterday.toISOString().split('T')[0];
  }

  logger.info(`Collecting news from sources: ${sources.join(', ')}`);

  try {
    const url = `${config.newsApi.baseUrl}/top-headlines`;

    const params = {
      sources: sources.join(','),
      from: fromDate,
      to: toDate,
      pageSize: config.newsApi.pageSize,
      apiKey: config.newsApi.apiKey,
    };

    const response = await axios.get<NewsAPIResponse>(url, {
      params,
      timeout: 30000,
    });

    if (response.data.status !== 'ok') {
      throw new Error(`NewsAPI returned status: ${response.data.status}`);
    }

    const articles: NewsArticle[] = response.data.articles
      .filter((article) => article.title && article.content)
      .map((article) => ({
        title: article.title,
        content: article.content || article.description || '',
        source: article.source.name,
        publishedAt: article.publishedAt,
        url: article.url,
      }));

    logger.info(`Collected ${articles.length} articles from sources`);

    return articles;
  } catch (error: any) {
    logger.error('Failed to collect from sources:', error.message);
    throw error;
  }
}

/**
 * RSS 피드에서 뉴스 수집 (무료)
 */
export async function collectFromRSS(rssUrl: string): Promise<NewsArticle[]> {
  logger.info(`Collecting news from RSS: ${rssUrl}`);

  try {
    // RSS를 JSON으로 변환해주는 무료 서비스 사용
    const rss2jsonUrl = `https://api.rss2json.com/v1/api.json`;
    const response = await axios.get(rss2jsonUrl, {
      params: {
        rss_url: rssUrl,
        count: 10,
      },
      timeout: 30000,
    });

    if (response.data.status !== 'ok') {
      throw new Error('RSS feed parsing failed');
    }

    const articles: NewsArticle[] = response.data.items
      .filter((item: any) => item.title && item.description)
      .map((item: any) => ({
        title: item.title,
        content: item.description || item.content || '',
        source: response.data.feed.title || 'RSS Feed',
        publishedAt: item.pubDate || new Date().toISOString(),
        url: item.link,
      }));

    logger.info(`Collected ${articles.length} articles from RSS`);

    return articles;
  } catch (error: any) {
    logger.error('Failed to collect from RSS:', error.message);
    // 에러 발생 시 빈 배열 반환 (다른 소스는 계속 진행)
    return [];
  }
}

/**
 * 뉴스 중복 제거 (제목 기반)
 */
export function deduplicateNews(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  const unique: NewsArticle[] = [];

  for (const article of articles) {
    const normalized = article.title.toLowerCase().trim();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      unique.push(article);
    }
  }

  logger.info(`Deduplicated: ${articles.length} -> ${unique.length} articles`);

  return unique;
}

/**
 * 경제 뉴스 필터링 (키워드 기반)
 */
export function filterEconomicNews(articles: NewsArticle[]): NewsArticle[] {
  const economicKeywords = [
    'economy',
    'economic',
    'finance',
    'financial',
    'market',
    'stock',
    'trading',
    'investment',
    'bank',
    'fed',
    'reserve',
    'interest',
    'rate',
    'inflation',
    'gdp',
    'trade',
    'export',
    'import',
    'semiconductor',
    'chip',
    'oil',
    'energy',
    'currency',
    'dollar',
    'euro',
  ];

  const filtered = articles.filter((article) => {
    const text = (article.title + ' ' + article.content).toLowerCase();
    return economicKeywords.some((keyword) => text.includes(keyword));
  });

  logger.info(`Filtered economic news: ${articles.length} -> ${filtered.length} articles`);

  return filtered;
}
