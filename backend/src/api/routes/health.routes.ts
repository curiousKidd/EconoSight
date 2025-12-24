import { Router, Request, Response } from 'express';
import { getPool } from '../../models/database';
import { asyncHandler } from '../../utils/errorHandler';

const router = Router();

/**
 * GET /api/health
 * 서버 상태 확인
 */
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    // 데이터베이스 연결 확인
    const pool = getPool();
    const connection = await pool.getConnection();
    connection.release();

    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  })
);

export default router;
