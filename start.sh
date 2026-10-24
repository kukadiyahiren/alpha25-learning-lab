#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"

cd "$ROOT/backend"
php -d upload_max_filesize=32M -d post_max_size=40M artisan serve --host=127.0.0.1 --port=8000 &
API_PID=$!

cd "$ROOT/admin"
npm run dev &
ADMIN_PID=$!

cd "$ROOT"
python3 -m http.server 8080 --bind 127.0.0.1 &
WEB_PID=$!

trap 'kill $API_PID $ADMIN_PID $WEB_PID 2>/dev/null || true' EXIT
wait
