import { Router } from 'express';
import newsRoutes from './routes/news.routes';
import healthRoutes from './routes/health.routes';
import adminRoutes from './routes/admin.routes';

const router = Router();

// API 라우트 등록
router.use('/news', newsRoutes);
router.use('/health', healthRoutes);
router.use('/admin', adminRoutes);

export default router;
