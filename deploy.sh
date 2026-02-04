#!/bin/bash

echo "🚀 Запуск MakeBot (Email версия)..."
echo

# Создаем папки
mkdir -p backend/data
mkdir -p frontend

# Копируем index.html если его нет
if [ ! -f "frontend/index.html" ]; then
    echo "⚠️  frontend/index.html не найден"
    echo "Скопируйте ваш index.html в папку frontend/"
    exit 1
fi

# Проверяем .env
if [ ! -f ".env" ]; then
    echo "📝 Создаем .env файл..."
    cat > .env << EOL
EMAIL_HOST=smtp.yandex.ru
EMAIL_PORT=465
EMAIL_USER=Denis.Kenway@yandex.ru
EMAIL_PASSWORD=Deniska040406
EMAIL_FROM=MakeBot <Denis.Kenway@yandex.ru>
EMAIL_TO=Denis.Kenway@yandex.ru
PORT=3000
NODE_ENV=production
EOL
    echo "✅ .env создан. Проверьте настройки email!"
fi

# Запускаем Docker
echo "🐳 Запускаем Docker контейнер..."
docker-compose down 2>/dev/null || true
docker-compose build --no-cache
docker-compose up -d

echo
echo "⏳ Ожидаем запуск сервера..."
sleep 10

# Проверяем
if curl -s http://localhost:3000/api/health | grep -q "success"; then
    echo
    echo "✅ Сайт запущен!"
    echo "🌐 Откройте: http://localhost:3000"
    echo "📧 Заявки будут приходить на: Denis.Kenway@yandex.ru"
    echo
    echo "📊 Проверка:"
    echo "   curl http://localhost:3000/api/health"
    echo
    echo "🛠️  Управление:"
    echo "   Логи: docker-compose logs -f makebot"
    echo "   Стоп: docker-compose down"
else
    echo "❌ Ошибка запуска!"
    echo "Проверьте логи: docker-compose logs makebot"
fi
