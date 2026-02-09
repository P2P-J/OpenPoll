#!/bin/bash

set -e

# 설정
APP_DIR="/home/ec2-user/OpenPoll"
LOG_FILE="/home/ec2-user/deploy-frontend.log"
BRANCH="main"

# 로그 함수
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "========== Frontend 배포 시작 =========="

cd "$APP_DIR"
log "현재 디렉토리: $(pwd)"

# 최신 코드 가져오기
log "Git pull 실행..."
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"
log "Git pull 완료: $(git rev-parse --short HEAD)"

# Frontend 배포
cd "$APP_DIR/frontend/openpoll"

log "의존성 설치..."
npm ci

log "빌드..."
npm run build

# 빌드 결과물을 Nginx가 서빙하는 디렉토리로 복사 (필요시)
# log "빌드 파일 복사..."
# sudo cp -r dist/* /var/www/html/

log "========== Frontend 배포 완료 =========="

exit 0
