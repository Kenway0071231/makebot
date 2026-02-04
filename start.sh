#!/bin/bash

echo "🚀 Запуск MakeBot сайта v2.0..."

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

# Проверка .env файла
if [ ! -f .env ]; then
    echo "⚠️  Файл .env не найден!"
    if [ -f .env.example ]; then
        echo "📋 Копирую .env.example в .env..."
        cp .env.example .env
        echo "⚠️  Отредактируйте файл .env и добавьте SMTP настройки!"
        echo ""
        echo "Необходимо добавить в .env:"
        echo "SMTP_HOST=smtp.yandex.ru"
        echo "SMTP_PORT=465"
        echo "SMTP_USER=Denis.Kenway@yandex.ru"
        echo "SMTP_PASS=Deniska040406"
        echo "ADMIN_EMAIL=Denis.Kenway@yandex.ru"
        echo ""
        read -p "Продолжить? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "❌ Прервано пользователем"
            exit 1
        fi
    else
        echo "❌ Файл .env.example также отсутствует!"
        exit 1
    fi
fi

# Запуск проекта
echo "🐳 Запуск Docker контейнеров..."
docker-compose up --build -d

# Ожидание запуска
echo "⏳ Ожидание запуска приложения..."
sleep 30

# Проверка
if curl -s http://localhost:3000 > /dev/null; then
    echo ""
    echo "✅ Сайт успешно запущен!"
    echo ""
    echo "🌐 Откройте в браузере:"
    echo "   http://localhost:3000"
    echo "   или"
    echo "   http://$(curl -s ifconfig.me):3000"
    echo ""
    echo "🛠️  Команды управления:"
    echo "   Логи:        docker-compose logs -f"
    echo "   Остановка:   docker-compose down"
    echo "   Перезапуск:  docker-compose restart"
    echo "   Статус:      docker-compose ps"
    echo ""
    echo "📧 Проверка отправки писем:"
    echo "   Проверьте, что в .env правильные SMTP настройки"
    echo ""
else
    echo "❌ Ошибка запуска!"
    echo "Проверьте логи: docker-compose logs makebot"
    exit 1
fi
