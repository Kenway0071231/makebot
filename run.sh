# Создаем простой скрипт запуска
cat > run.sh << 'EOF'
#!/bin/bash

echo "🚀 Запуск MakeBot сайта..."

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен!"
    echo "Установите Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Проверка Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен!"
    echo "Установите Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# Создание необходимых папок
echo "📁 Создание структуры папок..."
mkdir -p backend/data logs

# Запуск проекта
echo "🐳 Запуск Docker контейнеров..."
docker-compose up --build -d

# Ожидание запуска
echo "⏳ Ожидание запуска приложения..."
sleep 15

# Проверка
if curl -s http://localhost:3000 > /dev/null; then
    echo ""
    echo "✅ Сайт успешно запущен!"
    echo ""
    echo "🌐 Откройте в браузере:"
    echo "   http://localhost:3000"
    echo "   или"
    IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')
    echo "   http://$IP:3000"
    echo ""
    echo "🛠️  Команды управления:"
    echo "   Логи:        docker-compose logs -f"
    echo "   Остановка:   docker-compose down"
    echo "   Перезапуск:  docker-compose restart"
    echo "   Статус:      docker-compose ps"
    echo ""
else
    echo "❌ Ошибка запуска!"
    echo "Проверьте логи: docker-compose logs makebot"
    exit 1
fi
EOF

chmod +x run.sh
