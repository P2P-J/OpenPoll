#!/bin/bash

set -e

export HOME=/home/ec2-user
sudo -u ec2-user -H bash -lc 'cd /home/ec2-user/OpenPoll && git pull'

# 설정
APP_DIR="/home/ec2-user/OpenPoll"
LOG_FILE="/home/ec2-user/deploy-frontend.log"
BRANCH="main"
AWS_REGION="ap-northeast-2"
PARAMETER_PATH="/openpoll/prod/frontend"

# 로그 함수
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Parameter Store에서 환경변수 로드
load_env_from_parameter_store() {
    log "Parameter Store에서 환경변수 로드..."

    ENV_FILE="$APP_DIR/frontend/openpoll/.env"

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
            # /openpoll/prod/frontend/VITE_API_BASE_URL → VITE_API_BASE_URL
            key=$(basename "$name")
            echo "$key=$value" >> "$ENV_FILE"
            log "  - $key 로드 완료"
        done

    log "환경변수 로드 완료"
}

# SSM은 root로 실행되므로 git safe.directory 설정 필요
git config --global --add safe.directory "$APP_DIR"

log "========== Frontend 배포 시작 =========="
log "현재 디렉토리: $APP_DIR"
# 최신 코드 가져오기
log "Git pull 실행..."
sudo -u ec2-user -H bash -lc "cd $APP_DIR && git fetch origin $BRANCH"
sudo -u ec2-user -H bash -lc "cd $APP_DIR && git reset --hard origin/$BRANCH"
log "Git pull 완료: $(cd $APP_DIR && git rev-parse --short HEAD)"

# Frontend 배포
cd "$APP_DIR/frontend/openpoll"

# Parameter Store에서 환경변수 로드
load_env_from_parameter_store

log "의존성 설치..."
sudo -u ec2-user -H bash -lc "cd $APP_DIR/frontend/openpoll && npm ci"

log "빌드..."
sudo -u ec2-user -H bash -lc "cd $APP_DIR/frontend/openpoll && npm run build"

# 빌드 결과물을 Nginx가 서빙하는 디렉토리로 복사
log "빌드 파일 복사..."
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/

# Nginx 설정 리로드
log "Nginx 리로드..."
sudo nginx -s reload

log "========== Frontend 배포 완료 =========="

exit 0