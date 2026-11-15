#!/bin/sh
set -e

# Ensure every boot picks up latest routes/config (fixes stale Render deploys)
php artisan optimize:clear
php artisan migrate --force --no-interaction

exec php \
  -d upload_max_filesize=64M \
  -d post_max_size=72M \
  -d max_execution_time=180 \
  -d memory_limit=256M \
  artisan serve --host=0.0.0.0 --port="${PORT:-10000}"
