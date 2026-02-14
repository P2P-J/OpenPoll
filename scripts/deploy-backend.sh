#!/bin/bash

set -e

# 설정
APP_DIR="/home/ec2-user/OpenPoll"
LOG_FILE="/home/ec2-user/deploy-backend.log"
BRANCH="main"
AWS_REGION="ap-northeast-2"
PARAMETER_PATH="/openpoll/prod"

# 로그 함수
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Parameter Store에서 환경변수 로드
load_env_from_parameter_store() {
    log "Parameter Store에서 환경변수 로드..."
    
    ENV_FILE="$APP_DIR/backend/.env"
    
    # 기존 .env 백업 (있으면)
    if [ -f "$ENV_FILE" ]; then
        cp "$ENV_FILE" "$ENV_FILE.backup"
    fi
    
    # 빈 .env 파일 생성
    > "$ENV_FILE"
    
    # Parameter Store에서 값 가져오기
    aws ssm get-parameters-by-path \
        --path "$PARAMETER_PATH" \
        --with-decryption \
        --region "$AWS_REGION" \
        --query "Parameters[*].[Name,Value]" \
        --output text | while read -r name value; do
            # /openpoll/prod/DATABASE_URL → DATABASE_URL
            key=$(basename "$name")
            echo "$key=$value" >> "$ENV_FILE"
            log "  - $key 로드 완료"
        done
    
    log "환경변수 로드 완료"
}

log "========== Backend 배포 시작 =========="

cd "$APP_DIR"
log "현재 디렉토리: $(pwd)"

# 최신 코드 가져오기
log "Git pull 실행..."
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"
log "Git pull 완료: $(git rev-parse --short HEAD)"

# Backend 배포
cd "$APP_DIR/backend"

# Parameter Store에서 환경변수 로드
load_env_from_parameter_store

log "의존성 설치..."
npm ci --production

log "Prisma 클라이언트 생성..."
npx prisma generate

log "DB 마이그레이션..."
npx prisma migrate deploy

log "Seed 데이터 추가..."
npx prisma db seed

log "PM2로 백엔드 재시작..."
pm2 restart backend 2>/dev/null || pm2 start npm --name "backend" -- start

log "========== Backend 배포 완료 =========="
log "Status: $(pm2 show backend 2>/dev/null | grep status || echo 'running')"

exit 0
