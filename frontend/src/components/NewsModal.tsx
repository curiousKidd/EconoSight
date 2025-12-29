import { useEffect } from 'react';
import { EconomicNews } from '../types/news.types';
import { format } from 'date-fns';

interface NewsModalProps {
  news: EconomicNews;
  onClose: () => void;
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

const NewsModal = ({ news, onClose }: NewsModalProps) => {
  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-start">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {news.title}
            </h2>
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span>{news.source || 'Unknown'}</span>
              <span>•</span>
              <span>{format(new Date(news.news_date), 'yyyy년 MM월 dd일')}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-6">
          {/* 감성 분석 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              시장 반응 예측
            </h3>
            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${getSentimentBadgeClass(news.market_sentiment)}`}
              >
                {getSentimentEmoji(news.market_sentiment)} {news.market_sentiment}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                점수: {news.sentiment_score ? Number(news.sentiment_score).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>

          {/* 요약 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              AI 요약
            </h3>
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
              {news.summary}
            </p>
          </div>

          {/* 영향받는 분야 */}
          {news.affected_sectors && news.affected_sectors.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                영향받을 경제 분야
              </h3>
              <div className="flex flex-wrap gap-2">
                {news.affected_sectors.map((sector, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm rounded-lg"
                  >
                    {sector}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 원문 링크 */}
          {news.source_url && (
            <div>
              <a
                href={news.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                원문 보기
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsModal;
