#!/bin/bash

set -e

export HOME=/home/ec2-user
sudo -u ec2-user -H bash -lc 'cd /home/ec2-user/OpenPoll && git pull'

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

# SSM은 root로 실행되므로 git safe.directory 설정 필요
git config --global --add safe.directory "$APP_DIR"

log "========== Backend 배포 시작 =========="

log "현재 디렉토리: $APP_DIR"

# 최신 코드 가져오기
log "Git pull 실행..."
sudo -u ec2-user -H bash -lc "cd $APP_DIR && git fetch origin $BRANCH"
sudo -u ec2-user -H bash -lc "cd $APP_DIR && git reset --hard origin/$BRANCH"
log "Git pull 완료: $(cd $APP_DIR && git rev-parse --short HEAD)"

# Backend 배포
cd "$APP_DIR/backend"

# Parameter Store에서 환경변수 로드
load_env_from_parameter_store

log "의존성 설치..."
sudo -u ec2-user -H bash -lc "cd $APP_DIR/backend && npm ci --production"

log "Prisma 클라이언트 생성..."
sudo -u ec2-user -H bash -lc "cd $APP_DIR/backend && npx prisma generate"

log "DB 마이그레이션..."
sudo -u ec2-user -H bash -lc "cd $APP_DIR/backend && npx prisma migrate deploy"

log "Seed 데이터 추가..."
sudo -u ec2-user -H bash -lc "cd $APP_DIR/backend && npx prisma db seed"

log "PM2로 백엔드 재시작..."
sudo -u ec2-user -H bash -lc "cd $APP_DIR/backend && pm2 restart backend 2>/dev/null || pm2 start npm --name backend -- start"

log "PM2 프로세스 목록 저장..."
sudo -u ec2-user -H bash -lc "pm2 save"

log "PM2 자동 시작 설정..."
sudo -u ec2-user -H bash -lc "pm2 startup" 2>/dev/null || true
sudo env PATH=$PATH:/home/ec2-user/.nvm/versions/node/$(sudo -u ec2-user -H bash -lc "node -v")/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user 2>/dev/null || true

log "========== Backend 배포 완료 =========="
log "Status: $(sudo -u ec2-user -H bash -lc 'pm2 show backend 2>/dev/null | grep status' || echo 'running')"

exit 0