#!/usr/bin/env bash
# Zonora 个人博客一键启动脚本
# 用法: bash start.sh

set -euo pipefail

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info()    { echo -e "${CYAN}▶ $1${NC}"; }
log_success() { echo -e "${GREEN}✔ $1${NC}"; }
log_warn()    { echo -e "${YELLOW}⚠ $1${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo -e "${GREEN}=== Zonora 个人博客 ===${NC}"
echo ""

# 安装依赖
if [[ ! -d "node_modules" ]]; then
  log_info "安装依赖..."
  npm install
else
  log_success "依赖已存在"
fi

# 启动。开发服务器包装脚本会在 Ctrl+C、终端关闭或收到终止信号时，
# 清理 Next.js 及其所有 worker，避免残留进程继续占用端口和内存。
log_info "启动开发服务器 (http://localhost:3000)..."
echo ""
npm run dev
# 以后更新 zonora 的命令
# 以后 GitHub main-v2 更新后，只执行：
# cd /home/ubuntu/projcets/zonora
# git fetch origin main-v2
# git reset --hard origin/main-v2
# docker compose up -d --build
# docker image prune -f
