#!/bin/bash
# start.sh

echo "============================================"
echo "        MakeBot Startup Script              "
echo "============================================"
echo ""

# Установите путь к проекту
PROJECT_PATH="/home/$(whoami)/makebot-site"

# Проверка переменных окружения
echo "🔍 Проверка переменных окружения..."
if [ -z "$TELEGRAM_BOT_TOKEN" ] || [ -z "$TELEGRAM_CHAT_ID" ]; then
    echo "⚠️  Внимание: TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не установлены!"
    echo "   Проверьте файл .env"
fi

# Установите ID Cloud Shell
export CLOUD_SHELL_ID=$(hostname)
echo "🌐 Cloud Shell ID: $CLOUD_SHELL_ID"

# Перейдите в директорию проекта
cd "$PROJECT_PATH"

# Проверьте зависимости
echo "📦 Проверка зависимостей Node.js..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "Установка зависимостей..."
    npm install
fi

# Запустите Node.js сервер в фоне
echo "🚀 Запуск Node.js сервера..."
npm start &
SERVER_PID=$!

# Дайте серверу время запуститься
echo "⏳ Ожидание запуска сервера (5 секунд)..."
sleep 5

# Проверьте, запустился ли сервер
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Node.js сервер запущен (PID: $SERVER_PID)"
    
    # Протестируйте сервер
    echo "🧪 Тестирование API..."
    curl -s -o /dev/null -w "HTTP статус: %{http_code}\n" http://localhost:3000/api/health
    
    # Запустите NGINX
    echo "🌐 Настройка NGINX..."
    sudo nginx -c "$PROJECT_PATH/nginx.conf"
    
    # Определите URL
    PORT=8080
    URL="https://${CLOUD_SHELL_ID}-${PORT}.hosted.codelabs.site"
    
    echo ""
    echo "============================================"
    echo "✅ СИСТЕМА ЗАПУЩЕНА УСПЕШНО!"
    echo "============================================"
    echo ""
    echo "🌐 Ваш сайт доступен по адресу:"
    echo "   $URL"
    echo ""
    echo "📱 Телеграм-бот настроен:"
    echo "   Токен: ${TELEGRAM_BOT_TOKEN:0:10}..."
    echo "   Chat ID: $TELEGRAM_CHAT_ID"
    echo ""
    echo "🔧 Команды для проверки:"
    echo "   Проверить здоровье: curl $URL/api/health"
    echo "   Тест Telegram: curl $URL/api/test/telegram"
    echo ""
    echo "🛠️  Для остановки нажмите Ctrl+C, затем:"
    echo "   sudo nginx -s stop && kill $SERVER_PID"
    
    # Сохраните PID для последующей остановки
    echo $SERVER_PID > /tmp/makebot_server.pid
    
else
    echo "❌ Ошибка: Node.js сервер не запустился"
    exit 1
fi

# Держим скрипт активным
wait $SERVER_PID
