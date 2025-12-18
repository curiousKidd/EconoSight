import axios from 'axios';
import { NewsResponse, NewsDetailResponse } from '../types/news.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const newsApi = {
  // 뉴스 목록 조회
  getNews: async (date?: string, limit?: number, offset?: number): Promise<NewsResponse> => {
    const params: Record<string, any> = {};
    if (date) params.date = date;
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;

    const response = await apiClient.get<NewsResponse>('/news', { params });
    return response.data;
  },

  // 최신 뉴스 조회
  getLatestNews: async (limit?: number): Promise<NewsResponse> => {
    const params: Record<string, any> = {};
    if (limit) params.limit = limit;

    const response = await apiClient.get<NewsResponse>('/news/latest', { params });
    return response.data;
  },

  // 뉴스 상세 조회
  getNewsById: async (id: number): Promise<NewsDetailResponse> => {
    const response = await apiClient.get<NewsDetailResponse>(`/news/${id}`);
    return response.data;
  },

  // 헬스 체크
  healthCheck: async (): Promise<any> => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export default apiClient;
