FROM node:18-alpine

WORKDIR /app

# Устанавливаем зависимости системы
RUN apk add --no-cache curl bash

# Копируем package.json
COPY backend/package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production --no-audit

# Копируем бэкенд
COPY backend/ ./

# Создаем папки
RUN mkdir -p ../frontend && \
    mkdir -p data && \
    mkdir -p logs

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

# Открываем порт
EXPOSE 3000

# Команда запуска
CMD ["node", "server.js"]
