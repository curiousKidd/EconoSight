import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { newsApi } from '../services/api';
import NewsList from '../components/NewsList';
import AdBanner from '../components/AdBanner';
import { format } from 'date-fns';

const HomePage = () => {
  // 기본값: 어제 날짜 (스케줄러가 전날 뉴스를 수집하므로)
  const getYesterdayDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getYesterdayDate());

  const { data, isLoading, error } = useQuery({
    queryKey: ['news', selectedDate],
    queryFn: () => newsApi.getNews(selectedDate, 20, 0),
  });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                EconoSight
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                AI 기반 경제 뉴스 분석
              </p>
            </div>
            <div>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </header>

      {/* 상단 광고 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <AdBanner adSlot="1234567890" />
      </div>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 정보 */}
        {data && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {format(new Date(selectedDate), 'yyyy년 MM월 dd일')} •{' '}
              {data.pagination ? (
                <>
                  총 <span className="font-semibold">{data.pagination.total}</span>건의 뉴스
                </>
              ) : (
                <>
                  <span className="font-semibold">{data.total || 0}</span>건의 뉴스
                </>
              )}
            </p>
          </div>
        )}

        {/* 에러 처리 */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-6">
            <p>뉴스를 불러오는 중 오류가 발생했습니다.</p>
          </div>
        )}

        {/* 뉴스 리스트 */}
        <NewsList news={data?.data || []} loading={isLoading} />

        {/* 하단 광고 */}
        {data && data.data.length > 0 && (
          <div className="mt-8">
            <AdBanner adSlot="9876543210" />
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © 2024 EconoSight. AI 기반 경제 뉴스 분석 서비스.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
