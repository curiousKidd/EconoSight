import { Router } from 'express';
import newsRoutes from './routes/news.routes';
import healthRoutes from './routes/health.routes';

const router = Router();

// API 라우트 등록
router.use('/news', newsRoutes);
router.use('/health', healthRoutes);

export default router;
