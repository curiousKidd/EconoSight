-- EconoSight Database Schema
-- MySQL 8.0+

-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS econosight
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE econosight;

-- 경제 뉴스 메인 테이블
CREATE TABLE IF NOT EXISTS economic_news (
    id INT PRIMARY KEY AUTO_INCREMENT,
    news_date DATE NOT NULL COMMENT '뉴스 발생 날짜',
    title VARCHAR(500) NOT NULL COMMENT '뉴스 제목',
    source VARCHAR(100) COMMENT '뉴스 출처 (예: Reuters, Bloomberg)',
    source_url TEXT COMMENT '원본 뉴스 URL',

    -- AI 분석 결과
    summary TEXT NOT NULL COMMENT 'AI 생성 요약본',
    affected_sectors JSON COMMENT '영향받을 경제 분야 배열 (예: ["반도체", "금융", "에너지"])',
    market_sentiment ENUM('positive', 'negative', 'neutral') NOT NULL DEFAULT 'neutral' COMMENT '시장 반응 예측',
    sentiment_score DECIMAL(3,2) DEFAULT 0.00 COMMENT '감성 점수 (-1.00 ~ 1.00)',

    -- 원본 데이터
    raw_content TEXT COMMENT '원본 뉴스 내용 (전문)',

    -- OpenAI API 메타데이터
    ai_model VARCHAR(50) COMMENT '사용된 AI 모델 (예: gpt-4-turbo)',
    token_usage INT COMMENT '사용된 토큰 수',

    -- 시스템 필드
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '레코드 생성 시각',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '레코드 수정 시각',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '소프트 삭제 플래그',

    -- 인덱스
    INDEX idx_news_date (news_date DESC),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_sentiment (market_sentiment),
    INDEX idx_deleted (is_deleted),

    -- 복합 인덱스 (날짜별 조회 최적화)
    INDEX idx_date_deleted (news_date DESC, is_deleted),

    -- 전문 검색 인덱스 (제목, 요약)
    FULLTEXT INDEX idx_fulltext_title_summary (title, summary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='경제 뉴스 메인 테이블';

-- 경제 분야 마스터 테이블 (정규화)
CREATE TABLE IF NOT EXISTS economic_sectors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sector_name VARCHAR(100) NOT NULL UNIQUE COMMENT '경제 분야명 (한글)',
    sector_name_en VARCHAR(100) COMMENT '경제 분야명 (영문)',
    description TEXT COMMENT '분야 설명',
    icon_url VARCHAR(255) COMMENT '아이콘 이미지 URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_sector_name (sector_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='경제 분야 마스터';

-- 초기 경제 분야 데이터
INSERT INTO economic_sectors (sector_name, sector_name_en, description) VALUES
('반도체', 'Semiconductor', '반도체 산업 및 관련 기술'),
('금융', 'Finance', '은행, 증권, 보험 등 금융 서비스'),
('에너지', 'Energy', '석유, 가스, 신재생에너지'),
('부동산', 'Real Estate', '건설, 부동산 개발 및 거래'),
('자동차', 'Automotive', '자동차 제조 및 관련 산업'),
('바이오/헬스케어', 'Bio/Healthcare', '제약, 의료기기, 바이오테크'),
('IT/소프트웨어', 'IT/Software', 'IT 서비스, 소프트웨어 개발'),
('유통/소비재', 'Retail/Consumer Goods', '유통, 소비재 제조'),
('항공/운송', 'Aviation/Transportation', '항공, 해운, 물류'),
('통신', 'Telecommunications', '통신 서비스 및 인프라')
ON DUPLICATE KEY UPDATE sector_name=sector_name;

-- 광고 클릭 추적 테이블 (AdSense 분석용)
CREATE TABLE IF NOT EXISTS ad_clicks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(100) COMMENT '세션 ID (익명)',
    ad_unit_id VARCHAR(100) COMMENT 'AdSense 광고 유닛 ID',
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '클릭 시각',
    page_url TEXT COMMENT '클릭 발생 페이지',
    user_agent TEXT COMMENT 'User Agent',
    ip_address VARCHAR(45) COMMENT 'IP 주소 (해시화 권장)',

    INDEX idx_clicked_at (clicked_at DESC),
    INDEX idx_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='광고 클릭 추적';

-- 뉴스 수집 로그 테이블 (스케줄러 모니터링용)
CREATE TABLE IF NOT EXISTS news_collection_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    execution_date DATE NOT NULL COMMENT '실행 날짜',
    started_at TIMESTAMP NOT NULL COMMENT '시작 시각',
    finished_at TIMESTAMP COMMENT '종료 시각',
    status ENUM('running', 'success', 'failed', 'partial') NOT NULL DEFAULT 'running' COMMENT '실행 상태',
    news_collected INT DEFAULT 0 COMMENT '수집된 뉴스 수',
    news_analyzed INT DEFAULT 0 COMMENT '분석 완료된 뉴스 수',
    error_message TEXT COMMENT '에러 메시지 (실패 시)',
    total_tokens INT DEFAULT 0 COMMENT '사용된 총 토큰 수',
    estimated_cost DECIMAL(10,4) DEFAULT 0.00 COMMENT '예상 API 비용 (USD)',

    INDEX idx_execution_date (execution_date DESC),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='뉴스 수집 실행 로그';

-- 사용자 테이블 (Phase 2 - 앱 확장 시)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) COMMENT '비밀번호 해시 (bcrypt)',
    name VARCHAR(100),

    -- 푸시 알림 설정
    fcm_token TEXT COMMENT 'Firebase Cloud Messaging 토큰',
    push_enabled BOOLEAN DEFAULT TRUE COMMENT '푸시 알림 수신 동의',
    preferred_time TIME DEFAULT '08:00:00' COMMENT '선호 알림 시간',

    -- 맞춤 설정
    preferred_sectors JSON COMMENT '관심 경제 분야 (JSON 배열)',
    language VARCHAR(10) DEFAULT 'ko' COMMENT '선호 언어',

    -- 시스템 필드
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,

    INDEX idx_email (email),
    INDEX idx_push_enabled (push_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 (Phase 2)';

-- 북마크 테이블 (Phase 3 - 고도화)
CREATE TABLE IF NOT EXISTS bookmarks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    news_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (news_id) REFERENCES economic_news(id) ON DELETE CASCADE,

    UNIQUE KEY unique_bookmark (user_id, news_id),
    INDEX idx_user_bookmarks (user_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='뉴스 북마크';

-- 뷰: 최근 7일 뉴스 요약 통계
CREATE OR REPLACE VIEW v_recent_news_stats AS
SELECT
    news_date,
    COUNT(*) as total_news,
    SUM(CASE WHEN market_sentiment = 'positive' THEN 1 ELSE 0 END) as positive_count,
    SUM(CASE WHEN market_sentiment = 'negative' THEN 1 ELSE 0 END) as negative_count,
    SUM(CASE WHEN market_sentiment = 'neutral' THEN 1 ELSE 0 END) as neutral_count,
    AVG(sentiment_score) as avg_sentiment_score,
    SUM(token_usage) as total_tokens
FROM economic_news
WHERE is_deleted = FALSE
  AND news_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
GROUP BY news_date
ORDER BY news_date DESC;

-- 프로시저: 오래된 로그 삭제 (90일 이상)
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS cleanup_old_logs()
BEGIN
    DELETE FROM news_collection_logs
    WHERE execution_date < DATE_SUB(CURDATE(), INTERVAL 90 DAY);

    DELETE FROM ad_clicks
    WHERE clicked_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
END //
DELIMITER ;

-- 이벤트 스케줄러: 매월 1일 자동 정리 (MySQL 8.0+)
-- SET GLOBAL event_scheduler = ON;
-- CREATE EVENT IF NOT EXISTS monthly_cleanup
-- ON SCHEDULE EVERY 1 MONTH
-- STARTS CONCAT(DATE_FORMAT(CURRENT_DATE + INTERVAL 1 MONTH, '%Y-%m-01'), ' 02:00:00')
-- DO CALL cleanup_old_logs();

-- 권한 설정 (실제 배포 시 사용)
-- CREATE USER IF NOT EXISTS 'econosight_user'@'%' IDENTIFIED BY 'your_secure_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON econosight.* TO 'econosight_user'@'%';
-- FLUSH PRIVILEGES;

-- 초기 데이터 확인
SELECT 'Database schema created successfully!' as status;
SELECT COUNT(*) as sector_count FROM economic_sectors;
