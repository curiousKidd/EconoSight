import { EconomicNews } from '../types/news.types';
import { format } from 'date-fns';

interface NewsCardProps {
  news: EconomicNews;
  onClick: (news: EconomicNews) => void;
}

const getSentimentBadgeClass = (sentiment: string): string => {
  switch (sentiment) {
    case 'positive':
      return 'sentiment-positive';
    case 'negative':
      return 'sentiment-negative';
    default:
      return 'sentiment-neutral';
  }
};

const getSentimentEmoji = (sentiment: string): string => {
  switch (sentiment) {
    case 'positive':
      return '📈';
    case 'negative':
      return '📉';
    default:
      return '➡️';
  }
};

const NewsCard = ({ news, onClick }: NewsCardProps) => {
  return (
    <div
      className="card hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick(news)}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {news.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{news.source || 'Unknown'}</span>
            <span>•</span>
            <span>{format(new Date(news.news_date), 'yyyy-MM-dd')}</span>
          </div>
        </div>
        <div className="ml-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSentimentBadgeClass(news.market_sentiment)}`}>
            {getSentimentEmoji(news.market_sentiment)} {news.market_sentiment}
          </span>
        </div>
      </div>

      {/* 요약 */}
      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
        {news.summary}
      </p>

      {/* 영향받는 분야 */}
      {news.affected_sectors && news.affected_sectors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {news.affected_sectors.map((sector, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded"
            >
              {sector}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsCard;
