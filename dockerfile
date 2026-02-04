# ============================================
# MakeBot Docker Image
# Версия: 2.1.0
# ============================================

# Используем официальный Node.js образ LTS
FROM node:18-alpine

# Устанавливаем метаданные
LABEL maintainer="MakeBot Team <support@makebot.shop>"
LABEL version="2.1.0"
LABEL description="Сайт MakeBot с Telegram уведомлениями"

# Создаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY backend/package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код бэкенда
COPY backend/ ./

# Копируем фронтенд
COPY frontend/ ../frontend/

# Создаем папку для данных
RUN mkdir -p data

# Копируем .env.example
COPY .env.example .env.example

# Создаем не-root пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 nodejs

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
# Копируем стартовый скрипт
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Используем стартовый скрипт
CMD ["/app/start.sh"]
