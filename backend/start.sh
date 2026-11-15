#!/bin/sh
set -e

# Ensure runtime folders exist (API image may omit empty/cached view dirs)
mkdir -p \
  resources/views \
  storage/app/public \
  storage/framework/cache/data \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs \
  bootstrap/cache

# Clear caches without failing the whole boot if one step is noisy
php artisan config:clear
php artisan route:clear
php artisan cache:clear || true
php artisan view:clear || true
php artisan event:clear || true

php artisan migrate --force --no-interaction

exec php \
  -d upload_max_filesize=64M \
  -d post_max_size=72M \
  -d max_execution_time=180 \
  -d memory_limit=256M \
  artisan serve --host=0.0.0.0 --port="${PORT:-10000}"
