# Используем официальный Node.js образ
FROM node:18-alpine

# Создаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY backend/package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем весь код бэкенда
COPY backend/ ./

# Копируем фронтенд
COPY frontend/ ../frontend/

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["node", "server.js"]
