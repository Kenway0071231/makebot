#!/bin/bash

# ============================================
# MakeBot Deploy Script
# Версия: 2.2.0
# ============================================

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Функции для вывода
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка .env файла
check_env_file() {
    if [ ! -f .env ]; then
        print_warning "Файл .env не найден!"
        print_info "Создаю .env из примера..."
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success "Файл .env создан из примера"
            print_warning "⚠️  Обязательно проверьте настройки SMTP в файле .env!"
            echo ""
            echo "SMTP настройки (проверьте в .env):"
            echo "  SMTP_HOST=smtp.yandex.ru"
            echo "  SMTP_PORT=465"
            echo "  SMTP_USER=support@makebot.store"
            echo "  SMTP_PASS=Deniska040406"
            echo "  ADMIN_EMAIL=Denis.Kenway@yandex.ru"
            echo ""
            read -p "Продолжить с текущими настройками? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_error "Прервано пользователем"
                exit 1
            fi
        else
            print_error "Файл .env.example также отсутствует!"
            exit 1
        fi
    else
        print_success "Файл .env найден"
    fi
}

# Основная функция
main() {
    echo
    echo "============================================"
    echo "       MakeBot Deployment Script v2.2       "
    echo "============================================"
    echo
    
    # Проверка .env файла
    check_env_file
    
    # Проверка Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker не установлен!"
        echo "Установите Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi

    # Проверка Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose не установлен!"
        echo "Установите Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi

    # Создаем папку для данных если её нет
    mkdir -p backend/data
    
    # Инициализируем файлы данных
    if [ ! -f "backend/data/calculator_requests.json" ]; then
        echo '[]' > backend/data/calculator_requests.json
        print_success "Создан файл calculator_requests.json"
    fi
    if [ ! -f "backend/data/contact_requests.json" ]; then
        echo '[]' > backend/data/contact_requests.json
        print_success "Создан файл contact_requests.json"
    fi

    # Запуск проекта
    print_info "Запуск Docker контейнеров..."
    docker-compose down 2>/dev/null || true
    docker-compose build --no-cache
    docker-compose up -d

    # Ожидание запуска
    print_info "Ожидание запуска приложения (30 секунд)..."
    sleep 30

    # Проверка
    if curl -s -f http://localhost:3000/api/health > /dev/null; then
        print_success "Сайт успешно запущен!"
        echo
        echo "🌐 Откройте в браузере:"
        echo "   http://localhost:3000"
        echo
        echo "📧 Email для заявок:"
        echo "   ${ADMIN_EMAIL:-Denis.Kenway@yandex.ru}"
        echo
        echo "🛠️  Команды управления:"
        echo "   Логи:        docker-compose logs -f"
        echo "   Остановка:   docker-compose down"
        echo "   Перезапуск:  docker-compose restart"
        echo "   Статус:      docker-compose ps"
        echo
        echo "📊 Проверка здоровья сервера:"
        echo "   curl http://localhost:3000/api/health"
        echo
        echo "📧 Тест отправки email:"
        echo "   curl http://localhost:3000/api/test/email"
        echo
        echo "📁 Файлы данных заявок:"
        echo "   backend/data/calculator_requests.json"
        echo "   backend/data/contact_requests.json"
        echo
    else
        print_error "Ошибка запуска!"
        echo "Проверьте логи: docker-compose logs makebot"
        exit 1
    fi
}

# Запуск основной функции
main "$@"
