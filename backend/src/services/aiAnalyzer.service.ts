import OpenAI from 'openai';
import config from '../config/config';
import logger from '../utils/logger';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

export interface NewsArticle {
  title: string;
  content: string;
  source?: string;
  publishedAt: string;
}

export interface AnalysisResult {
  summary: string;
  affected_sectors: string[];
  market_sentiment: 'positive' | 'negative' | 'neutral';
  sentiment_score: number;
  token_usage: number;
}

/**
 * OpenAI API를 사용하여 뉴스를 분석합니다.
 *
 * @param article 분석할 뉴스 기사
 * @param retryCount 재시도 횟수 (기본값: 3)
 * @returns 분석 결과
 */
export async function analyzeNews(
  article: NewsArticle,
  retryCount: number = 3
): Promise<AnalysisResult> {
  const prompt = createAnalysisPrompt(article);

  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      logger.info(`Analyzing news (attempt ${attempt}): ${article.title.substring(0, 50)}...`);

      const completion = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: `You are an expert economic analyst who analyzes global economic news.
Your task is to:
1. Summarize the news in 2-3 sentences (in Korean)
2. Identify affected economic sectors
3. Predict market sentiment (positive/negative/neutral)
4. Provide a sentiment score between -1.0 (very negative) and 1.0 (very positive)

Always respond in valid JSON format.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: config.openai.temperature,
        max_tokens: config.openai.maxTokens,
        response_format: { type: 'json_object' },
      });

      const responseContent = completion.choices[0].message.content;
      if (!responseContent) {
        throw new Error('Empty response from OpenAI');
      }

      const result = JSON.parse(responseContent);
      const tokenUsage = completion.usage?.total_tokens || 0;

      logger.info(`Analysis completed. Tokens used: ${tokenUsage}`);

      return {
        summary: result.summary || '',
        affected_sectors: Array.isArray(result.affected_sectors)
          ? result.affected_sectors
          : [],
        market_sentiment: validateSentiment(result.market_sentiment),
        sentiment_score: validateSentimentScore(result.sentiment_score),
        token_usage: tokenUsage,
      };
    } catch (error: any) {
      logger.error(`Analysis failed (attempt ${attempt}):`, error.message);

      if (attempt === retryCount) {
        throw new Error(`Failed to analyze news after ${retryCount} attempts: ${error.message}`);
      }

      // Rate limit 에러의 경우 더 오래 대기
      if (error.status === 429) {
        const waitTime = attempt * 5000; // 5초, 10초, 15초...
        logger.info(`Rate limited. Waiting ${waitTime}ms before retry...`);
        await sleep(waitTime);
      } else {
        await sleep(1000 * attempt); // 1초, 2초, 3초...
      }
    }
  }

  throw new Error('Failed to analyze news');
}

/**
 * 여러 뉴스 기사를 배치로 분석합니다 (비용 최적화)
 *
 * @param articles 분석할 뉴스 기사 배열
 * @returns 분석 결과 배열
 */
export async function analyzeBatchNews(
  articles: NewsArticle[]
): Promise<AnalysisResult[]> {
  const results: AnalysisResult[] = [];

  // 동시 실행 수 제한 (Rate Limit 방지)
  const concurrencyLimit = 3;
  for (let i = 0; i < articles.length; i += concurrencyLimit) {
    const batch = articles.slice(i, i + concurrencyLimit);
    const batchResults = await Promise.all(
      batch.map((article) => analyzeNews(article))
    );
    results.push(...batchResults);

    // 배치 간 대기 시간 (Rate Limit 방지)
    if (i + concurrencyLimit < articles.length) {
      await sleep(2000);
    }
  }

  return results;
}

/**
 * 분석을 위한 프롬프트 생성
 */
function createAnalysisPrompt(article: NewsArticle): string {
  return `
Analyze the following economic news article:

Title: ${article.title}
Source: ${article.source || 'Unknown'}
Published: ${article.publishedAt}

Content:
${article.content.substring(0, 3000)} ${article.content.length > 3000 ? '...' : ''}

Please provide your analysis in the following JSON format:
{
  "summary": "한국어로 2-3문장 요약",
  "affected_sectors": ["반도체", "금융", "에너지"] // 영향받을 경제 분야 (한국어)
  "market_sentiment": "positive" or "negative" or "neutral",
  "sentiment_score": 0.75 // -1.0 ~ 1.0 사이의 숫자
}

Possible sectors (in Korean):
- 반도체 (Semiconductor)
- 금융 (Finance)
- 에너지 (Energy)
- 부동산 (Real Estate)
- 자동차 (Automotive)
- 바이오/헬스케어 (Bio/Healthcare)
- IT/소프트웨어 (IT/Software)
- 유통/소비재 (Retail/Consumer Goods)
- 항공/운송 (Aviation/Transportation)
- 통신 (Telecommunications)
`;
}

/**
 * Sentiment 값 검증
 */
function validateSentiment(
  sentiment: any
): 'positive' | 'negative' | 'neutral' {
  const validSentiments = ['positive', 'negative', 'neutral'];
  if (validSentiments.includes(sentiment)) {
    return sentiment;
  }
  logger.warn(`Invalid sentiment: ${sentiment}, defaulting to 'neutral'`);
  return 'neutral';
}

/**
 * Sentiment score 검증
 */
function validateSentimentScore(score: any): number {
  const numScore = parseFloat(score);
  if (isNaN(numScore)) {
    logger.warn(`Invalid sentiment score: ${score}, defaulting to 0`);
    return 0;
  }
  // -1.0 ~ 1.0 범위로 제한
  return Math.max(-1.0, Math.min(1.0, numScore));
}

/**
 * 비용 계산 (GPT-4 Turbo 기준)
 *
 * @param totalTokens 총 토큰 수
 * @returns 예상 비용 (USD)
 */
export function calculateCost(totalTokens: number): number {
  // GPT-4 Turbo 가격 (2024년 기준)
  const inputCostPer1M = 10.0; // $10.00 per 1M tokens
  const outputCostPer1M = 30.0; // $30.00 per 1M tokens

  // 간단히 평균으로 계산 (실제로는 input/output 비율에 따라 다름)
  const avgCostPer1M = (inputCostPer1M + outputCostPer1M) / 2;

  return (totalTokens / 1_000_000) * avgCostPer1M;
}

/**
 * Sleep 헬퍼 함수
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
