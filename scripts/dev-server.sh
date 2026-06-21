#!/usr/bin/env bash

set -uo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_ID="$(printf '%s' "$PROJECT_DIR" | cksum | awk '{print $1}')"
PID_FILE="${TMPDIR:-/tmp}/zonora-dev-${UID}-${PROJECT_ID}.pid"
NEXT_BIN="$PROJECT_DIR/node_modules/.bin/next"

SERVER_PID=""
SERVER_PGID=""
CLEANED_UP=0

is_project_process() {
  local pid="$1"
  [[ -d "/proc/$pid" ]] || return 1
  [[ "$(readlink -f "/proc/$pid/cwd" 2>/dev/null || true)" == "$PROJECT_DIR" ]]
}

wait_for_exit() {
  local pid="$1"
  local attempts="${2:-30}"

  for ((i = 0; i < attempts; i++)); do
    kill -0 "$pid" 2>/dev/null || return 0
    sleep 0.1
  done

  return 1
}

stop_process_group() {
  local pid="$1"
  local pgid="$2"

  kill -0 "$pid" 2>/dev/null || return 0

  # Give Next.js a chance to close watchers and workers cleanly.
  kill -INT -- "-$pgid" 2>/dev/null || true
  wait_for_exit "$pid" 30 && return 0

  kill -TERM -- "-$pgid" 2>/dev/null || true
  wait_for_exit "$pid" 20 && return 0

  kill -KILL -- "-$pgid" 2>/dev/null || true
}

cleanup() {
  local exit_code=$?

  if ((CLEANED_UP)); then
    return "$exit_code"
  fi
  CLEANED_UP=1

  trap - EXIT INT TERM HUP

  if [[ -n "$SERVER_PID" && -n "$SERVER_PGID" ]]; then
    stop_process_group "$SERVER_PID" "$SERVER_PGID"
  fi

  if [[ -f "$PID_FILE" ]] && [[ "$(cat "$PID_FILE" 2>/dev/null || true)" == "$SERVER_PID" ]]; then
    rm -f "$PID_FILE"
  fi

  return "$exit_code"
}

cleanup_stale_server() {
  [[ -f "$PID_FILE" ]] || return 0

  local stale_pid
  local stale_pgid
  stale_pid="$(cat "$PID_FILE" 2>/dev/null || true)"

  if [[ "$stale_pid" =~ ^[0-9]+$ ]] && is_project_process "$stale_pid"; then
    stale_pgid="$(ps -o pgid= -p "$stale_pid" 2>/dev/null | tr -d ' ')"
    if [[ "$stale_pgid" =~ ^[0-9]+$ ]]; then
      printf '⚠ 清理上次遗留的 Zonora 开发服务器 (PID %s)...\n' "$stale_pid"
      stop_process_group "$stale_pid" "$stale_pgid"
    fi
  fi

  rm -f "$PID_FILE"
}

if [[ ! -x "$NEXT_BIN" ]]; then
  printf '错误：未找到 Next.js，请先运行 npm install。\n' >&2
  exit 1
fi

cleanup_stale_server
trap cleanup EXIT INT TERM HUP

cd "$PROJECT_DIR"

# Run Next.js in its own session so every worker belongs to one process group.
setsid "$NEXT_BIN" dev "$@" &
SERVER_PID=$!
SERVER_PGID="$(ps -o pgid= -p "$SERVER_PID" | tr -d ' ')"

if [[ ! "$SERVER_PGID" =~ ^[0-9]+$ ]]; then
  printf '错误：无法获取开发服务器进程组。\n' >&2
  exit 1
fi

printf '%s' "$SERVER_PID" > "$PID_FILE"

wait "$SERVER_PID"
exit_code=$?
exit "$exit_code"
