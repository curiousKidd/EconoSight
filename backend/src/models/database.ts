import mysql from 'mysql2/promise';
import config from '../config/config';
import logger from '../utils/logger';

let pool: mysql.Pool | null = null;

export async function initDatabase(): Promise<mysql.Pool> {
  if (pool) {
    return pool;
  }

  try {
    pool = mysql.createPool({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
      waitForConnections: true,
      connectionLimit: config.database.connectionLimit,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    // 연결 테스트
    const connection = await pool.getConnection();
    logger.info('Database connected successfully');
    connection.release();

    return pool;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
}

export function getPool(): mysql.Pool {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return pool;
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database connection closed');
  }
}

// 트랜잭션 헬퍼
export async function withTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
