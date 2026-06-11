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

# 启动
log_info "启动开发服务器 (http://localhost:3000)..."
echo ""
npm run dev
