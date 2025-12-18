import { useState } from 'react';
import { EconomicNews } from '../types/news.types';
import NewsCard from './NewsCard';
import NewsModal from './NewsModal';

interface NewsListProps {
  news: EconomicNews[];
  loading?: boolean;
}

const NewsList = ({ news, loading }: NewsListProps) => {
  const [selectedNews, setSelectedNews] = useState<EconomicNews | null>(null);

  const handleNewsClick = (newsItem: EconomicNews) => {
    setSelectedNews(newsItem);
  };

  const handleCloseModal = () => {
    setSelectedNews(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          뉴스가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {news.map((newsItem) => (
          <NewsCard
            key={newsItem.id}
            news={newsItem}
            onClick={handleNewsClick}
          />
        ))}
      </div>

      {selectedNews && (
        <NewsModal news={selectedNews} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default NewsList;
