/**
 * 수동 뉴스 수집 스크립트
 *
 * 사용법:
 * npm run collect-news
 * tsx src/scripts/collectNews.ts
 * tsx src/scripts/collectNews.ts 2024-12-10
 */

import { initDatabase, closeDatabase } from '../models/database';
import { runManualAnalysis } from '../services/scheduler.service';
import logger from '../utils/logger';
import { validateConfig } from '../config/config';

async function main() {
  try {
    // 환경 변수 검증
    validateConfig();
    logger.info('Configuration validated');

    // 데이터베이스 연결
    await initDatabase();
    logger.info('Database connected');

    // 날짜 파라미터 (옵션)
    const date = process.argv[2];

    if (date) {
      // 날짜 형식 검증
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD');
      }
      logger.info(`Collecting news for date: ${date}`);
    } else {
      logger.info('Collecting news for yesterday');
    }

    // 뉴스 수집 및 분석 실행
    await runManualAnalysis(date);

    logger.info('Manual collection completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Manual collection failed:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

main();
