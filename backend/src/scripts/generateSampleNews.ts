import { NewsModel } from '../models/news.model';
import { initDatabase, closeDatabase } from '../models/database';
import logger from '../utils/logger';

const sampleNews = [
  {
    news_date: new Date().toISOString().split('T')[0],
    title: '미국 연준, 기준금리 동결 결정... 인플레이션 추이 주시',
    source: 'Reuters',
    source_url: 'https://example.com/news/1',
    summary: '미국 연방준비제도(Fed)가 기준금리를 현 수준으로 동결하기로 결정했습니다. 제롬 파월 의장은 인플레이션 둔화 추세를 확인하면서도 신중한 접근이 필요하다고 강조했습니다. 시장에서는 향후 금리 인하 가능성에 주목하고 있습니다.',
    affected_sectors: ['금융', '부동산', '자동차'],
    market_sentiment: 'neutral' as const,
    sentiment_score: 0.0,
    raw_content: 'The Federal Reserve decided to maintain current interest rates...',
    ai_model: 'gpt-4-turbo-preview',
    token_usage: 450,
  },
  {
    news_date: new Date().toISOString().split('T')[0],
    title: '삼성전자, 차세대 3나노 공정 양산 본격화... 반도체 시장 공략',
    source: 'Bloomberg',
    source_url: 'https://example.com/news/2',
    summary: '삼성전자가 3나노 공정 기술을 적용한 반도체 양산을 본격화합니다. 이는 TSMC와의 경쟁에서 우위를 점하기 위한 전략적 움직임으로 해석됩니다. 전문가들은 이번 기술 혁신이 글로벌 반도체 시장 판도를 바꿀 수 있다고 전망하고 있습니다.',
    affected_sectors: ['반도체', 'IT/소프트웨어'],
    market_sentiment: 'positive' as const,
    sentiment_score: 0.75,
    raw_content: 'Samsung Electronics has begun mass production of 3nm chips...',
    ai_model: 'gpt-4-turbo-preview',
    token_usage: 520,
  },
  {
    news_date: new Date().toISOString().split('T')[0],
    title: '국제 유가 급등... OPEC+ 감산 연장 결정',
    source: 'Financial Times',
    source_url: 'https://example.com/news/3',
    summary: 'OPEC+가 원유 감산을 연장하기로 결정하면서 국제 유가가 급등했습니다. 브렌트유는 배럴당 85달러를 넘어섰으며, 이는 항공사와 운송업계에 부담으로 작용할 전망입니다. 에너지 관련 주식은 상승세를 보이고 있습니다.',
    affected_sectors: ['에너지', '항공/운송'],
    market_sentiment: 'negative' as const,
    sentiment_score: -0.45,
    raw_content: 'OPEC+ decided to extend oil production cuts...',
    ai_model: 'gpt-4-turbo-preview',
    token_usage: 380,
  },
  {
    news_date: new Date().toISOString().split('T')[0],
    title: '애플, AI 기능 탑재한 신형 아이폰 공개... 주가 5% 상승',
    source: 'Bloomberg',
    source_url: 'https://example.com/news/4',
    summary: '애플이 인공지능 기능을 대폭 강화한 신형 아이폰을 공개했습니다. 온디바이스 AI 처리 능력이 크게 향상되어 프라이버시를 유지하면서도 강력한 AI 기능을 제공합니다. 발표 직후 애플 주가는 5% 상승하며 시장의 긍정적 반응을 이끌어냈습니다.',
    affected_sectors: ['IT/소프트웨어', '반도체', '통신'],
    market_sentiment: 'positive' as const,
    sentiment_score: 0.85,
    raw_content: 'Apple unveiled the new iPhone with enhanced AI capabilities...',
    ai_model: 'gpt-4-turbo-preview',
    token_usage: 490,
  },
  {
    news_date: new Date().toISOString().split('T')[0],
    title: '중국 부동산 시장 침체 지속... 정부 부양책 발표',
    source: 'Reuters',
    source_url: 'https://example.com/news/5',
    summary: '중국 정부가 침체된 부동산 시장 회복을 위한 대규모 부양책을 발표했습니다. 주택 구매 제한 완화와 대출 규제 완화가 핵심입니다. 그러나 전문가들은 구조적 문제 해결을 위해서는 시간이 필요하다고 지적하고 있습니다.',
    affected_sectors: ['부동산', '금융', '건설'],
    market_sentiment: 'neutral' as const,
    sentiment_score: -0.15,
    raw_content: 'Chinese government announced stimulus measures for real estate...',
    ai_model: 'gpt-4-turbo-preview',
    token_usage: 420,
  },
  {
    news_date: new Date().toISOString().split('T')[0],
    title: '테슬라, 완전자율주행 베타 버전 공개... 자동차 산업 혁신',
    source: 'Bloomberg',
    source_url: 'https://example.com/news/6',
    summary: '테슬라가 완전자율주행(FSD) 베타 버전을 공개했습니다. 일론 머스크 CEO는 향후 6개월 내 상용화를 목표로 한다고 밝혔습니다. 자동차 업계는 이번 발표를 주목하며 자율주행 기술 개발에 박차를 가하고 있습니다.',
    affected_sectors: ['자동차', 'IT/소프트웨어'],
    market_sentiment: 'positive' as const,
    sentiment_score: 0.65,
    raw_content: 'Tesla released Full Self-Driving beta version...',
    ai_model: 'gpt-4-turbo-preview',
    token_usage: 460,
  },
];

async function generateSampleNews() {
  try {
    logger.info('Starting sample news generation...');

    // 데이터베이스 연결
    await initDatabase();
    logger.info('Database connected');

    // 샘플 뉴스 삽입
    for (const news of sampleNews) {
      try {
        const id = await NewsModel.create(news);
        logger.info(`Created news with ID: ${id} - ${news.title.substring(0, 50)}...`);
      } catch (error: any) {
        logger.error(`Failed to create news: ${error.message}`);
      }
    }

    logger.info(`Successfully generated ${sampleNews.length} sample news articles`);

    // 데이터베이스 연결 종료
    await closeDatabase();
    logger.info('Database connection closed');

    process.exit(0);
  } catch (error: any) {
    logger.error('Failed to generate sample news:', error);
    process.exit(1);
  }
}

// 스크립트 실행
generateSampleNews();
