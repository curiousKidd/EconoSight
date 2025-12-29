import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getPool } from './database';

export interface EconomicNews {
  id?: number;
  news_date: string; // YYYY-MM-DD
  title: string;
  source?: string;
  source_url?: string;
  summary: string;
  affected_sectors?: string[];
  market_sentiment: 'positive' | 'negative' | 'neutral';
  sentiment_score?: number;
  raw_content?: string;
  ai_model?: string;
  token_usage?: number;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
}

export interface NewsCollectionLog {
  id?: number;
  execution_date: string;
  started_at: Date;
  finished_at?: Date;
  status: 'running' | 'success' | 'failed' | 'partial';
  news_collected?: number;
  news_analyzed?: number;
  error_message?: string;
  total_tokens?: number;
  estimated_cost?: number;
}

export class NewsModel {
  // 뉴스 추가
  static async create(news: EconomicNews): Promise<number> {
    const pool = getPool();
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO economic_news
       (news_date, title, source, source_url, summary, affected_sectors,
        market_sentiment, sentiment_score, raw_content, ai_model, token_usage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        news.news_date,
        news.title,
        news.source || null,
        news.source_url || null,
        news.summary,
        news.affected_sectors ? JSON.stringify(news.affected_sectors) : null,
        news.market_sentiment,
        news.sentiment_score || null,
        news.raw_content || null,
        news.ai_model || null,
        news.token_usage || null,
      ]
    );

    return result.insertId;
  }

  // 날짜별 뉴스 조회
  static async findByDate(
    date: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<EconomicNews[]> {
    const pool = getPool();
    // LIMIT과 OFFSET은 정수로 확실히 변환
    const safeLimit = Math.max(1, Math.min(100, Math.floor(Number(limit))));
    const safeOffset = Math.max(0, Math.floor(Number(offset)));

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, news_date, title, source, source_url, summary,
              affected_sectors, market_sentiment, sentiment_score, created_at
       FROM economic_news
       WHERE news_date = ? AND is_deleted = FALSE
       ORDER BY created_at DESC
       LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      [date]
    );

    return rows.map((row) => ({
      ...row,
      affected_sectors: typeof row.affected_sectors === 'string'
        ? JSON.parse(row.affected_sectors)
        : row.affected_sectors || [],
    })) as EconomicNews[];
  }

  // ID로 뉴스 조회 (상세)
  static async findById(id: number): Promise<EconomicNews | null> {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM economic_news WHERE id = ? AND is_deleted = FALSE`,
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      ...row,
      affected_sectors: typeof row.affected_sectors === 'string'
        ? JSON.parse(row.affected_sectors)
        : row.affected_sectors || [],
    } as EconomicNews;
  }

  // 최신 뉴스 조회
  static async findLatest(limit: number = 10): Promise<EconomicNews[]> {
    const pool = getPool();
    const safeLimit = Math.max(1, Math.min(50, Math.floor(Number(limit))));

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, news_date, title, source, source_url, summary,
              affected_sectors, market_sentiment, sentiment_score, created_at
       FROM economic_news
       WHERE is_deleted = FALSE
       ORDER BY news_date DESC, created_at DESC
       LIMIT ${safeLimit}`,
      []
    );

    return rows.map((row) => ({
      ...row,
      affected_sectors: typeof row.affected_sectors === 'string'
        ? JSON.parse(row.affected_sectors)
        : row.affected_sectors || [],
    })) as EconomicNews[];
  }

  // 날짜별 뉴스 개수 조회
  static async countByDate(date: string): Promise<number> {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM economic_news
       WHERE news_date = ? AND is_deleted = FALSE`,
      [date]
    );

    return rows[0].count;
  }

  // 뉴스가 이미 존재하는지 확인 (중복 방지)
  static async existsByTitleAndDate(title: string, date: string): Promise<boolean> {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM economic_news
       WHERE title = ? AND news_date = ? AND is_deleted = FALSE`,
      [title, date]
    );

    return rows[0].count > 0;
  }

  // 뉴스 삭제 (소프트 삭제)
  static async softDelete(id: number): Promise<boolean> {
    const pool = getPool();
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE economic_news SET is_deleted = TRUE WHERE id = ?`,
      [id]
    );

    return result.affectedRows > 0;
  }
}

export class NewsCollectionLogModel {
  // 수집 로그 시작
  static async create(executionDate: string): Promise<number> {
    const pool = getPool();
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO news_collection_logs (execution_date, started_at, status)
       VALUES (?, NOW(), 'running')`,
      [executionDate]
    );

    return result.insertId;
  }

  // 수집 로그 업데이트
  static async update(
    id: number,
    data: Partial<NewsCollectionLog>
  ): Promise<boolean> {
    const pool = getPool();
    const fields: string[] = [];
    const values: any[] = [];

    if (data.finished_at !== undefined) {
      fields.push('finished_at = ?');
      values.push(data.finished_at);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    if (data.news_collected !== undefined) {
      fields.push('news_collected = ?');
      values.push(data.news_collected);
    }
    if (data.news_analyzed !== undefined) {
      fields.push('news_analyzed = ?');
      values.push(data.news_analyzed);
    }
    if (data.error_message !== undefined) {
      fields.push('error_message = ?');
      values.push(data.error_message);
    }
    if (data.total_tokens !== undefined) {
      fields.push('total_tokens = ?');
      values.push(data.total_tokens);
    }
    if (data.estimated_cost !== undefined) {
      fields.push('estimated_cost = ?');
      values.push(data.estimated_cost);
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(id);
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE news_collection_logs SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // 최근 로그 조회
  static async findRecent(limit: number = 10): Promise<NewsCollectionLog[]> {
    const pool = getPool();
    const safeLimit = Math.max(1, Math.min(100, Math.floor(Number(limit))));

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM news_collection_logs
       ORDER BY execution_date DESC LIMIT ${safeLimit}`,
      []
    );

    return rows as NewsCollectionLog[];
  }
}
