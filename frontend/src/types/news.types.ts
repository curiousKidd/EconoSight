export interface EconomicNews {
  id: number;
  news_date: string;
  title: string;
  source?: string;
  source_url?: string;
  summary: string;
  affected_sectors: string[];
  market_sentiment: 'positive' | 'negative' | 'neutral';
  sentiment_score: number;
  created_at: string;
}

export interface NewsResponse {
  success: boolean;
  data: EconomicNews[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  total?: number;
}

export interface NewsDetailResponse {
  success: boolean;
  data: EconomicNews;
}
