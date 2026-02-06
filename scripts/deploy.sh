#!/bin/bash

set -e  # 에러 발생 시 스크립트 중단

# 설정
APP_DIR="/home/ec2-user/OpenPoll"
LOG_FILE="/home/ec2-user/deploy.log"
BRANCH="main"

# 로그 함수
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "========== 배포 시작 =========="

# 프로젝트 디렉토리로 이동
cd "$APP_DIR"
log "현재 디렉토리: $(pwd)"

# 최신 코드 가져오기
log "Git pull 실행..."
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"
log "Git pull 완료: $(git rev-parse --short HEAD)"


# Backend 배포
log "========== Backend 배포 시작 =========="
cd "$APP_DIR/backend"

log "의존성 설치..."
npm ci --production

log "Prisma 클라이언트 생성..."
npx prisma generate

log "DB 마이그레이션..."
npx prisma migrate deploy

log "PM2로 백엔드 재시작..."
pm2 restart backend 2>/dev/null || pm2 start npm --name "backend" -- start

log "Backend 배포 완료"


# Frontend 배포
log "========== Frontend 배포 시작 =========="
cd "$APP_DIR/frontend/openpoll"

log "의존성 설치..."
npm ci

log "빌드..."
npm run build

# 빌드 결과물을 Nginx가 서빙하는 디렉토리로 복사 (필요시)
# log "빌드 파일 복사..."
# sudo cp -r dist/* /var/www/html/

log "Frontend 배포 완료"



log "========== 배포 완료 =========="
log "Backend: $(pm2 show backend 2>/dev/null | grep status || echo 'running')"

exit 0
