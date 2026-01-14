import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config, { validateConfig } from './config/config';
import logger from './utils/logger';
import { errorHandler } from './utils/errorHandler';
import { initDatabase, closeDatabase } from './models/database';
import { startScheduler, stopScheduler } from './services/scheduler.service';
import { fcmService } from './services/fcm.service';
import apiRoutes from './api';

const app: Application = express();

// 미들웨어
app.use(helmet()); // 보안 헤더
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 요청 로깅
app.use((req: Request, _res: Response, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// API 라우트
app.use('/api', apiRoutes);

// 루트 라우트
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'EconoSight API',
    version: '1.0.0',
    status: 'running',
    documentation: '/api/health',
  });
});

// 에러 핸들러 (가장 마지막)
app.use(errorHandler);

// 404 핸들러
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      statusCode: 404,
    },
  });
});

// 서버 시작
async function startServer(): Promise<void> {
  try {
    // 환경 변수 검증
    validateConfig();
    logger.info('Configuration validated');

    // 데이터베이스 연결
    await initDatabase();
    logger.info('Database initialized');

    // FCM 초기화 (선택적)
    fcmService.initialize();

    // 스케줄러 시작
    startScheduler();

    // 서버 시작
    const port = config.port;
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`API URL: http://localhost:${port}/api`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  stopScheduler();
  await closeDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  stopScheduler();
  await closeDatabase();
  process.exit(0);
});

// 처리되지 않은 에러 핸들링
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// 서버 시작
startServer();

export default app;
