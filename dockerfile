# ============================================
# MakeBot Docker Image
# Версия: 1.0.0
# ============================================

# Используем официальный Node.js образ LTS
FROM node:18-alpine AS builder

# Устанавливаем метаданные
LABEL maintainer="MakeBot Team <info@makebot.ru>"
LABEL version="1.0.0"
LABEL description="Сайт MakeBot - разработка чат-ботов, ИИ решений и сайтов"

# Создаем рабочую директорию
WORKDIR /app

# Устанавливаем зависимости для сборки
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

# Копируем package.json и package-lock.json
COPY backend/package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# ============================================
# Этап production
# ============================================
FROM node:18-alpine AS production

# Создаем не-root пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 nodejs

# Создаем рабочую директорию
WORKDIR /app

# Копируем зависимости из builder stage
COPY --from=builder /app/node_modules ./node_modules

# Копируем backend
COPY backend/ ./

# Копируем frontend
COPY frontend/ ../frontend/

# Создаем папку для данных
RUN mkdir -p data && \
    echo '[]' > data/estimates.json && \
    echo '[]' > data/contacts.json

# Меняем владельца файлов
RUN chown -R nodejs:nodejs /app

# Переключаемся на не-root пользователя
USER nodejs

# Открываем порт
EXPOSE 3000

# Переменные окружения
ENV NODE_ENV=production \
    PORT=3000

# Команда запуска
CMD ["node", "server.js"]
