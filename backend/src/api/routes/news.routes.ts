import { Router, Request, Response } from 'express';
import { NewsModel } from '../../models/news.model';
import { asyncHandler, AppError } from '../../utils/errorHandler';
import { z } from 'zod';

const router = Router();

// 유효성 검증 스키마
const getNewsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  offset: z.string().transform(Number).pipe(z.number().int().min(0)).optional(),
});

const getNewsByIdSchema = z.object({
  id: z.string().transform(Number).pipe(z.number().int().positive()),
});

/**
 * GET /api/news
 * 뉴스 목록 조회
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const query = getNewsQuerySchema.parse(req.query);

    const date = query.date || new Date().toISOString().split('T')[0];
    const limit = query.limit || 20;
    const offset = query.offset || 0;

    const news = await NewsModel.findByDate(date, limit, offset);
    const total = await NewsModel.countByDate(date);

    res.json({
      success: true,
      data: news,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + news.length < total,
      },
    });
  })
);

/**
 * GET /api/news/latest
 * 최신 뉴스 조회
 */
router.get(
  '/latest',
  asyncHandler(async (req: Request, res: Response) => {
    const limitStr = req.query.limit as string | undefined;
    const limit = limitStr ? parseInt(limitStr, 10) : 10;

    if (isNaN(limit) || limit < 1 || limit > 50) {
      throw new AppError('Invalid limit parameter (1-50)', 400);
    }

    const news = await NewsModel.findLatest(limit);

    res.json({
      success: true,
      data: news,
      total: news.length,
    });
  })
);

/**
 * GET /api/news/:id
 * 뉴스 상세 조회
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = getNewsByIdSchema.parse(req.params);

    const news = await NewsModel.findById(id);

    if (!news) {
      throw new AppError('News not found', 404);
    }

    res.json({
      success: true,
      data: news,
    });
  })
);

export default router;
