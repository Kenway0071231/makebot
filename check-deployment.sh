#!/bin/bash

echo "🔍 Проверка развертывания MakeBot..."

echo "1. Проверка Docker..."
docker --version
docker-compose --version

echo ""
echo "2. Проверка файлов..."
ls -la backend/
ls -la frontend/
ls -la *.yml *.sh

echo ""
echo "3. Проверка .env файла..."
if [ -f .env ]; then
    echo ".env найден"
    grep -E "TELEGRAM|PORT|NODE" .env
else
    echo "❌ .env не найден!"
fi

echo ""
echo "4. Проверка доступности API..."
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ API доступен"
    curl -s http://localhost:3000/api/info | jq . || curl -s http://localhost:3000/api/info
else
    echo "❌ API недоступен"
fi

echo ""
echo "5. Проверка Telegram..."
curl -s http://localhost:3000/api/test/telegram | jq . || curl -s http://localhost:3000/api/test/telegram

echo ""
echo "=========================================="
echo "Для тестирования отправки заявки:"
echo ""
echo "1. Откройте сайт: http://localhost:3000"
echo "2. Заполните калькулятор"
echo "3. Отправьте тестовую заявку"
echo "4. Проверьте Telegram"
echo "=========================================="
