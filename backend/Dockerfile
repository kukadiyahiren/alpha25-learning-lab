FROM php:8.4-cli-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
        git unzip ca-certificates libzip-dev libonig-dev \
    && docker-php-ext-install pdo_mysql mbstring zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Permanent PHP upload limits (ebook PDFs can be 20MB+)
COPY docker/uploads.ini /usr/local/etc/php/conf.d/zz-uploads.ini

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

COPY . .
RUN composer dump-autoload --optimize \
    && php artisan package:discover --ansi \
    && php artisan storage:link

ENV PORT=10000
EXPOSE 10000

# Force PHP flags at runtime too (Render sometimes ignores conf.d alone)
CMD ["sh", "-c", "php -d upload_max_filesize=64M -d post_max_size=72M -d max_execution_time=180 -d memory_limit=256M artisan serve --host=0.0.0.0 --port=${PORT}"]
