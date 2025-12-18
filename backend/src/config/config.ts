import dotenv from 'dotenv';
import path from 'path';

// .env 파일 로드
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
  // 서버 설정
  port: number;
  nodeEnv: string;

  // 데이터베이스 설정
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    connectionLimit: number;
  };

  // OpenAI API 설정
  openai: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };

  // NewsAPI 설정
  newsApi: {
    apiKey: string;
    baseUrl: string;
    sources: string[];
    language: string;
    pageSize: number;
  };

  // 스케줄러 설정
  scheduler: {
    analysisTime: string; // cron 형식
    timezone: string;
    enabled: boolean;
  };

  // AdSense 설정
  adsense: {
    clientId: string;
  };

  // CORS 설정
  cors: {
    origin: string[];
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'econosight',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000', 10),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
  },

  newsApi: {
    apiKey: process.env.NEWS_API_KEY || '',
    baseUrl: 'https://newsapi.org/v2',
    sources: (process.env.NEWS_SOURCES || 'bloomberg,reuters,financial-times').split(','),
    language: process.env.NEWS_LANGUAGE || 'en',
    pageSize: parseInt(process.env.NEWS_PAGE_SIZE || '10', 10),
  },

  scheduler: {
    analysisTime: process.env.ANALYSIS_CRON || '0 6 * * *', // 매일 오전 6시
    timezone: process.env.TIMEZONE || 'Asia/Seoul',
    enabled: process.env.SCHEDULER_ENABLED !== 'false',
  },

  adsense: {
    clientId: process.env.ADSENSE_CLIENT_ID || '',
  },

  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  },
};

// 필수 환경 변수 검증
export function validateConfig(): void {
  const requiredEnvVars = [
    'OPENAI_API_KEY',
    'NEWS_API_KEY',
    'DB_PASSWORD',
  ];

  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file.'
    );
  }

  if (!config.openai.apiKey.startsWith('sk-')) {
    throw new Error('Invalid OpenAI API key format');
  }
}

export default config;
