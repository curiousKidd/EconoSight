import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../utils/errorHandler';
import { runDailyAnalysis } from '../../services/scheduler.service';

const router = Router();

/**
 * POST /api/admin/collect-news
 * 수동으로 뉴스 수집 및 분석 실행
 */
router.post(
  '/collect-news',
  asyncHandler(async (_req: Request, res: Response) => {
    // 백그라운드에서 실행
    runDailyAnalysis().catch((error) => {
      console.error('Failed to run daily analysis:', error);
    });

    res.json({
      success: true,
      message: 'News collection started in background',
    });
  })
);

export default router;
