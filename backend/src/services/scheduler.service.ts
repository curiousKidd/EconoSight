import cron from 'node-cron';
import config from '../config/config';
import logger from '../utils/logger';
import { collectEconomicNews, deduplicateNews, filterEconomicNews } from './newsCollector.service';
import { analyzeNews, calculateCost } from './aiAnalyzer.service';
import { NewsModel, NewsCollectionLogModel } from '../models/news.model';

let scheduledTask: cron.ScheduledTask | null = null;

/**
 * 스케줄러 시작
 */
export function startScheduler(): void {
  if (!config.scheduler.enabled) {
    logger.info('Scheduler is disabled in configuration');
    return;
  }

  if (scheduledTask) {
    logger.warn('Scheduler is already running');
    return;
  }

  logger.info(`Starting scheduler with cron: ${config.scheduler.analysisTime}`);
  logger.info(`Timezone: ${config.scheduler.timezone}`);

  scheduledTask = cron.schedule(
    config.scheduler.analysisTime,
    async () => {
      logger.info('Scheduler triggered: Starting news collection and analysis');
      await runDailyAnalysis();
    },
    {
      timezone: config.scheduler.timezone,
    }
  );

  logger.info('Scheduler started successfully');
}

/**
 * 스케줄러 중지
 */
export function stopScheduler(): void {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    logger.info('Scheduler stopped');
  }
}

/**
 * 매일 뉴스 수집 및 분석 실행
 */
export async function runDailyAnalysis(): Promise<void> {
  const executionDate = getYesterdayDate();
  logger.info(`Running daily analysis for date: ${executionDate}`);

  // 로그 시작
  const logId = await NewsCollectionLogModel.create(executionDate);

  try {
    // 1. 뉴스 수집
    logger.info('Step 1: Collecting news...');
    let articles = await collectEconomicNews(executionDate, executionDate);

    if (articles.length === 0) {
      logger.warn('No news articles collected');
      await NewsCollectionLogModel.update(logId, {
        finished_at: new Date(),
        status: 'success',
        news_collected: 0,
        news_analyzed: 0,
      });
      return;
    }

    // 2. 경제 뉴스 필터링
    logger.info('Step 2: Filtering economic news...');
    articles = filterEconomicNews(articles);

    // 3. 중복 제거
    logger.info('Step 3: Deduplicating news...');
    articles = deduplicateNews(articles);

    logger.info(`Total articles to analyze: ${articles.length}`);

    // 4. AI 분석 및 저장
    logger.info('Step 4: Analyzing and saving news...');
    let analyzedCount = 0;
    let totalTokens = 0;

    for (const article of articles) {
      try {
        // 중복 체크
        const exists = await NewsModel.existsByTitleAndDate(
          article.title,
          executionDate
        );

        if (exists) {
          logger.info(`Skipping duplicate: ${article.title.substring(0, 50)}...`);
          continue;
        }

        // AI 분석
        const analysis = await analyzeNews(article);

        // DB 저장
        await NewsModel.create({
          news_date: executionDate,
          title: article.title,
          source: article.source,
          source_url: article.url,
          summary: analysis.summary,
          affected_sectors: analysis.affected_sectors,
          market_sentiment: analysis.market_sentiment,
          sentiment_score: analysis.sentiment_score,
          raw_content: article.content,
          ai_model: config.openai.model,
          token_usage: analysis.token_usage,
        });

        analyzedCount++;
        totalTokens += analysis.token_usage;

        logger.info(
          `Analyzed (${analyzedCount}/${articles.length}): ${article.title.substring(0, 50)}...`
        );

        // Rate limit 방지를 위한 대기
        if (analyzedCount < articles.length) {
          await sleep(2000); // 2초 대기
        }
      } catch (error: any) {
        logger.error(`Failed to analyze article: ${article.title}`, error.message);
        // 개별 뉴스 실패는 건너뛰고 계속 진행
      }
    }

    // 5. 로그 업데이트
    const estimatedCost = calculateCost(totalTokens);
    await NewsCollectionLogModel.update(logId, {
      finished_at: new Date(),
      status: analyzedCount === articles.length ? 'success' : 'partial',
      news_collected: articles.length,
      news_analyzed: analyzedCount,
      total_tokens: totalTokens,
      estimated_cost: estimatedCost,
    });

    logger.info('Daily analysis completed successfully');
    logger.info(`Total articles: ${articles.length}`);
    logger.info(`Analyzed: ${analyzedCount}`);
    logger.info(`Total tokens: ${totalTokens}`);
    logger.info(`Estimated cost: $${estimatedCost.toFixed(4)}`);
  } catch (error: any) {
    logger.error('Daily analysis failed:', error.message);

    // 로그 업데이트 (실패)
    await NewsCollectionLogModel.update(logId, {
      finished_at: new Date(),
      status: 'failed',
      error_message: error.message,
    });

    throw error;
  }
}

/**
 * 어제 날짜 가져오기 (YYYY-MM-DD)
 */
function getYesterdayDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

/**
 * Sleep 헬퍼 함수
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 수동 실행 (테스트용)
 */
export async function runManualAnalysis(date?: string): Promise<void> {
  const targetDate = date || getYesterdayDate();
  logger.info(`Running manual analysis for date: ${targetDate}`);

  await runDailyAnalysis();
}
