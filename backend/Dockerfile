FROM php:8.4-cli-bookworm

# gd is required by PhpSpreadsheet (Worksheet bulk Excel import)
RUN apt-get update && apt-get install -y --no-install-recommends \
        git unzip ca-certificates \
        libzip-dev libonig-dev \
        libfreetype6-dev libjpeg62-turbo-dev libpng-dev libwebp-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) pdo_mysql mbstring zip gd \
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

RUN chmod +x /app/start.sh

# Always clear caches + migrate, then serve (avoids stale route 404s on Render)
CMD ["/app/start.sh"]
