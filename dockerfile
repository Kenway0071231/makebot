# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Копируем зависимости
COPY backend/package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем бэкенд
COPY backend/ ./

# Копируем фронтенд
COPY frontend/ ../frontend/

# Копируем скрипты
COPY start.sh ./
RUN chmod +x start.sh

# Копируем конфигурацию NGINX
COPY nginx.conf ./

# Создаем пользователя
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 nodejs
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000
EXPOSE 8080

ENV NODE_ENV=production \
    PORT=3000

CMD ["sh", "start.sh"]
