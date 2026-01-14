import admin from 'firebase-admin';
import { logger } from '../utils/logger';

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export class FCMService {
  private static instance: FCMService;
  private initialized = false;

  private constructor() {}

  public static getInstance(): FCMService {
    if (!FCMService.instance) {
      FCMService.instance = new FCMService();
    }
    return FCMService.instance;
  }

  /**
   * Firebase Admin SDK 초기화
   * FIREBASE_SERVICE_ACCOUNT_PATH 환경 변수에 서비스 계정 키 파일 경로 설정 필요
   */
  public initialize(): void {
    if (this.initialized) {
      logger.info('Firebase Admin SDK already initialized');
      return;
    }

    try {
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

      if (!serviceAccountPath) {
        logger.warn(
          'FIREBASE_SERVICE_ACCOUNT_PATH not set. FCM features will be disabled.'
        );
        return;
      }

      const serviceAccount = require(serviceAccountPath);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      this.initialized = true;
      logger.info('Firebase Admin SDK initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Firebase Admin SDK:', error);
    }
  }

  /**
   * 단일 기기에 푸시 알림 전송
   */
  public async sendToDevice(
    token: string,
    notification: NotificationPayload
  ): Promise<boolean> {
    if (!this.initialized) {
      logger.warn('FCM not initialized. Skipping notification.');
      return false;
    }

    try {
      const message: admin.messaging.Message = {
        token,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'econosight_news',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      logger.info(`Successfully sent message: ${response}`);
      return true;
    } catch (error) {
      logger.error('Error sending FCM message:', error);
      return false;
    }
  }

  /**
   * 여러 기기에 푸시 알림 전송
   */
  public async sendToDevices(
    tokens: string[],
    notification: NotificationPayload
  ): Promise<{ successCount: number; failureCount: number }> {
    if (!this.initialized) {
      logger.warn('FCM not initialized. Skipping notifications.');
      return { successCount: 0, failureCount: 0 };
    }

    if (tokens.length === 0) {
      logger.warn('No tokens provided for sending notifications.');
      return { successCount: 0, failureCount: 0 };
    }

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'econosight_news',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      logger.info(
        `Successfully sent ${response.successCount} messages out of ${tokens.length}`
      );

      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            logger.error(`Failed to send to token ${tokens[idx]}:`, resp.error);
          }
        });
      }

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      logger.error('Error sending FCM multicast messages:', error);
      return { successCount: 0, failureCount: tokens.length };
    }
  }

  /**
   * 토픽에 푸시 알림 전송
   */
  public async sendToTopic(
    topic: string,
    notification: NotificationPayload
  ): Promise<boolean> {
    if (!this.initialized) {
      logger.warn('FCM not initialized. Skipping notification.');
      return false;
    }

    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'econosight_news',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      logger.info(`Successfully sent message to topic ${topic}: ${response}`);
      return true;
    } catch (error) {
      logger.error(`Error sending FCM message to topic ${topic}:`, error);
      return false;
    }
  }

  /**
   * 기기를 토픽에 구독
   */
  public async subscribeToTopic(
    tokens: string[],
    topic: string
  ): Promise<{ successCount: number; failureCount: number }> {
    if (!this.initialized) {
      logger.warn('FCM not initialized. Skipping subscription.');
      return { successCount: 0, failureCount: 0 };
    }

    try {
      const response = await admin.messaging().subscribeToTopic(tokens, topic);

      logger.info(
        `Successfully subscribed ${response.successCount} devices to topic ${topic}`
      );

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      logger.error(`Error subscribing to topic ${topic}:`, error);
      return { successCount: 0, failureCount: tokens.length };
    }
  }

  /**
   * 토픽 구독 해제
   */
  public async unsubscribeFromTopic(
    tokens: string[],
    topic: string
  ): Promise<{ successCount: number; failureCount: number }> {
    if (!this.initialized) {
      logger.warn('FCM not initialized. Skipping unsubscription.');
      return { successCount: 0, failureCount: 0 };
    }

    try {
      const response = await admin
        .messaging()
        .unsubscribeFromTopic(tokens, topic);

      logger.info(
        `Successfully unsubscribed ${response.successCount} devices from topic ${topic}`
      );

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      logger.error(`Error unsubscribing from topic ${topic}:`, error);
      return { successCount: 0, failureCount: tokens.length };
    }
  }
}

export const fcmService = FCMService.getInstance();
