#!/bin/bash

echo "🚀 Запуск MakeBot Backend v2.1.0"
echo "========================================"

# Проверяем переменные окружения
if [ -z "$TELEGRAM_BOT_TOKEN" ] || [ -z "$TELEGRAM_CHAT_ID" ]; then
    echo "⚠️  ВНИМАНИЕ: Telegram не настроен!"
    echo "   Заявки не будут отправляться в Telegram"
    echo "   Добавьте в .env:"
    echo "   TELEGRAM_BOT_TOKEN=ваш_токен"
    echo "   TELEGRAM_CHAT_ID=ваш_chat_id"
fi

# Проверяем файл .env
if [ ! -f ".env" ]; then
    echo "⚠️  Файл .env не найден!"
    echo "   Создаю из примера..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "   Файл .env создан. Отредактируйте его!"
    else
        echo "❌ Файл .env.example также отсутствует!"
        exit 1
    fi
fi

# Создаем папку для данных если её нет
mkdir -p data

# Инициализируем файлы данных
if [ ! -f "data/calculator_requests.json" ]; then
    echo '[]' > data/calculator_requests.json
fi
if [ ! -f "data/contact_requests.json" ]; then
    echo '[]' > data/contact_requests.json
fi

echo "✅ Настройки проверены"
echo "🌐 Порт: ${PORT:-3000}"
echo "📁 Данные: $(pwd)/data"
echo "========================================"

# Запускаем сервер
exec node server.js
