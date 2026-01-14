import { Router, Request, Response } from 'express';
import { asyncHandler, AppError } from '../../utils/errorHandler';
import { fcmService } from '../../services/fcm.service';
import { z } from 'zod';

const router = Router();

// 유효성 검증 스키마
const registerTokenSchema = z.object({
  token: z.string().min(1, 'FCM token is required'),
  userId: z.string().optional(),
});

const sendNotificationSchema = z.object({
  token: z.string().min(1, 'FCM token is required'),
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  data: z.record(z.string()).optional(),
});

const sendBulkNotificationSchema = z.object({
  tokens: z.array(z.string()).min(1, 'At least one token is required'),
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  data: z.record(z.string()).optional(),
});

const sendTopicNotificationSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  data: z.record(z.string()).optional(),
});

const subscribeToTopicSchema = z.object({
  tokens: z.array(z.string()).min(1, 'At least one token is required'),
  topic: z.string().min(1, 'Topic is required'),
});

/**
 * POST /api/fcm/register
 * FCM 토큰 등록
 */
router.post(
  '/register',
  asyncHandler(async (req: Request, res: Response) => {
    const { token, userId } = registerTokenSchema.parse(req.body);

    // TODO: 데이터베이스에 FCM 토큰 저장
    // await FCMTokenModel.save({ userId, token });

    res.json({
      success: true,
      message: 'FCM token registered successfully',
      data: { token, userId },
    });
  })
);

/**
 * POST /api/fcm/send
 * 단일 기기에 푸시 알림 전송
 */
router.post(
  '/send',
  asyncHandler(async (req: Request, res: Response) => {
    const { token, title, body, data } = sendNotificationSchema.parse(req.body);

    const success = await fcmService.sendToDevice(token, {
      title,
      body,
      data,
    });

    if (!success) {
      throw new AppError('Failed to send notification', 500);
    }

    res.json({
      success: true,
      message: 'Notification sent successfully',
    });
  })
);

/**
 * POST /api/fcm/send-bulk
 * 여러 기기에 푸시 알림 전송
 */
router.post(
  '/send-bulk',
  asyncHandler(async (req: Request, res: Response) => {
    const { tokens, title, body, data } =
      sendBulkNotificationSchema.parse(req.body);

    const result = await fcmService.sendToDevices(tokens, {
      title,
      body,
      data,
    });

    res.json({
      success: true,
      message: 'Bulk notification sent',
      data: result,
    });
  })
);

/**
 * POST /api/fcm/send-topic
 * 토픽에 푸시 알림 전송
 */
router.post(
  '/send-topic',
  asyncHandler(async (req: Request, res: Response) => {
    const { topic, title, body, data } =
      sendTopicNotificationSchema.parse(req.body);

    const success = await fcmService.sendToTopic(topic, {
      title,
      body,
      data,
    });

    if (!success) {
      throw new AppError('Failed to send notification to topic', 500);
    }

    res.json({
      success: true,
      message: `Notification sent to topic ${topic}`,
    });
  })
);

/**
 * POST /api/fcm/subscribe
 * 토픽 구독
 */
router.post(
  '/subscribe',
  asyncHandler(async (req: Request, res: Response) => {
    const { tokens, topic } = subscribeToTopicSchema.parse(req.body);

    const result = await fcmService.subscribeToTopic(tokens, topic);

    res.json({
      success: true,
      message: `Subscribed to topic ${topic}`,
      data: result,
    });
  })
);

/**
 * POST /api/fcm/unsubscribe
 * 토픽 구독 해제
 */
router.post(
  '/unsubscribe',
  asyncHandler(async (req: Request, res: Response) => {
    const { tokens, topic } = subscribeToTopicSchema.parse(req.body);

    const result = await fcmService.unsubscribeFromTopic(tokens, topic);

    res.json({
      success: true,
      message: `Unsubscribed from topic ${topic}`,
      data: result,
    });
  })
);

/**
 * POST /api/fcm/notify-new-news
 * 새 뉴스 알림 전송 (편의 엔드포인트)
 */
router.post(
  '/notify-new-news',
  asyncHandler(async (req: Request, res: Response) => {
    const { newsId, title, summary } = req.body;

    if (!newsId || !title) {
      throw new AppError('newsId and title are required', 400);
    }

    // 'daily_news' 토픽 구독자들에게 알림 전송
    const success = await fcmService.sendToTopic('daily_news', {
      title: '새로운 경제 뉴스',
      body: title,
      data: {
        newsId: newsId.toString(),
        type: 'new_news',
      },
    });

    if (!success) {
      throw new AppError('Failed to send new news notification', 500);
    }

    res.json({
      success: true,
      message: 'New news notification sent',
    });
  })
);

export default router;
