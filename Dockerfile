# Stage 1: Build the React frontend
FROM oven/bun:latest as frontend
WORKDIR /app
COPY front/package.json front/bun.lockb* ./
RUN bun install
COPY front/ ./
# For a single-container deployment, the API is on the same domain
RUN echo "VITE_API_URL=/api" > .env.production
RUN bun run build

# Stage 2: Build the Laravel backend
FROM composer:2.7 as backend
WORKDIR /app
COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --ignore-platform-reqs
COPY backend/ ./
RUN composer dump-autoload --optimize

# Stage 3: Final image
FROM php:8.2-fpm-alpine

# Install Nginx and required dependencies
RUN apk add --no-cache nginx supervisor \
    libpng-dev libzip-dev oniguruma-dev libxml2-dev \
    freetype-dev libjpeg-turbo-dev

# Install PHP extensions required by Laravel
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Set up Nginx and Supervisor configurations
COPY docker-config/nginx.conf /etc/nginx/http.d/default.conf
COPY docker-config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create directory for supervisor pid
RUN mkdir -p /var/run && chown -R root:root /var/run

# Copy backend code
WORKDIR /var/www/html
COPY --from=backend /app /var/www/html

# Copy frontend build into Laravel's public directory
COPY --from=frontend /app/dist /var/www/html/public

# Set proper permissions for Laravel
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Expose port 80 for Nginx
EXPOSE 80

# Start Supervisor to run both Nginx and PHP-FPM
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
