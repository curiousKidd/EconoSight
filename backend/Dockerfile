# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm ci

# 소스 복사 및 빌드
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# 프로덕션 의존성만 설치
COPY package*.json ./
RUN npm ci --only=production

# 빌드된 파일 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src

# 로그 디렉토리 생성
RUN mkdir -p logs

# 포트 노출
EXPOSE 3000

# 시작 명령
CMD ["node", "dist/app.js"]
