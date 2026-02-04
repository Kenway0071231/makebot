#!/bin/bash

# ============================================
# MakeBot Deploy Script
# Версия: 1.0.0
# ============================================

set -e  # Выход при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Основная функция
main() {
    echo
    echo "============================================"
    echo "       MakeBot Deployment Script v1.0       "
    echo "============================================"
    echo
    
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

    # Запуск проекта
    print_info "Запуск Docker контейнеров..."
    docker-compose down 2>/dev/null
    docker-compose build
    docker-compose up -d

    # Ожидание запуска
    print_info "Ожидание запуска приложения..."
    sleep 10

    # Проверка
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Сайт успешно запущен!"
        echo
        echo "🌐 Откройте в браузере:"
        echo "   http://localhost:3000"
        echo
        echo "🛠️  Команды управления:"
        echo "   Логи:        docker-compose logs -f"
        echo "   Остановка:   docker-compose down"
        echo "   Перезапуск:  docker-compose restart"
        echo
    else
        print_error "Ошибка запуска!"
        echo "Проверьте логи: docker-compose logs makebot"
        exit 1
    fi
}

# Запуск основной функции
main "$@"
