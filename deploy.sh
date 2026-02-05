#!/bin/bash

# ============================================
# MakeBot Deploy Script for Yandex Cloud
# Версия: 2.4.0
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
    print_info "Проверка файла .env..."
    
    # Если файла нет, создаем из примера
    if [ ! -f .env ]; then
        print_warning "Файл .env не найден!"
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success "Создан .env из примера"
        else
            print_error "Файл .env.example также отсутствует!"
            exit 1
        fi
    fi
    
    # Проверяем важные переменные
    print_info "Проверка важных переменных..."
    
    local telegram_token=$(grep -E "^TELEGRAM_BOT_TOKEN=" .env | cut -d'=' -f2)
    local telegram_chat=$(grep -E "^TELEGRAM_CHAT_ID=" .env | cut -d'=' -f2)
    
    if [ -z "$telegram_token" ] || [[ "$telegram_token" == *"ваш_токен"* ]]; then
        print_error "TELEGRAM_BOT_TOKEN не настроен или содержит значение по умолчанию!"
        echo ""
        echo "=========== ВАЖНО! ==========="
        echo "Для работы отправки заявок в Telegram:"
        echo "1. Откройте файл .env: nano .env"
        echo "2. Найдите строку TELEGRAM_BOT_TOKEN"
        echo "3. Замените на ваш реальный токен:"
        echo "   TELEGRAM_BOT_TOKEN=8216117039:AAGXvE3XwIfRXO7BBl-rFG2uEcfDEL0dtRM"
        echo "4. Сохраните файл: Ctrl+X, затем Y, затем Enter"
        echo "=============================="
        echo ""
        read -p "Продолжить с текущими настройками? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    if [ -z "$telegram_chat" ] || [[ "$telegram_chat" == *"ваш_чат_id"* ]]; then
        print_error "TELEGRAM_CHAT_ID не настроен или содержит значение по умолчанию!"
        echo ""
        echo "=========== ВАЖНО! ==========="
        echo "Для получения заявок в Telegram:"
        echo "1. Откройте файл .env: nano .env"
        echo "2. Найдите строку TELEGRAM_CHAT_ID"
        echo "3. Замените на ваш Chat ID:"
        echo "   TELEGRAM_CHAT_ID=1079922982"
        echo "4. Сохраните файл"
        echo "=============================="
        echo ""
    fi
    
    print_success "Проверка .env завершена"
}

# Создание структуры папок
create_structure() {
    print_info "Создание структуры папок..."
    
    # Основные папки
    mkdir -p backend/data
    mkdir -p frontend/css
    mkdir -p frontend/js
    mkdir -p logs
    
    # Создаем .gitkeep для data
    touch backend/data/.gitkeep
    
    print_success "Структура папок создана"
}

# Копирование файлов
copy_files() {
    print_info "Копирование файлов..."
    
    # Проверяем наличие файлов
    if [ ! -f "backend/package.json" ]; then
        print_error "Файл backend/package.json не найден!"
        exit 1
    fi
    
    if [ ! -f "frontend/index.html" ]; then
        print_warning "Файл frontend/index.html не найден, создаю базовый..."
        # Можно создать базовый HTML
    fi
    
    print_success "Файлы проверены"
}

# Основная функция
main() {
    echo
    echo "============================================"
    echo "   MakeBot Deployment Script v2.4"
    echo "   for Yandex Cloud"
    echo "============================================"
    echo
    
    # Проверка Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker не установлен!"
        echo "Установите Docker:"
        echo "  curl -fsSL https://get.docker.com -o get-docker.sh"
        echo "  sudo sh get-docker.sh"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose не установлен!"
        echo "Установите Docker Compose:"
        echo "  sudo apt-get update"
        echo "  sudo apt-get install docker-compose"
        exit 1
    fi
    
    # Проверка .env
    check_env_file
    
    # Создание структуры
    create_structure
    
    # Копирование файлов
    copy_files
    
    # Создаем файлы данных если их нет
    print_info "Инициализация файлов данных..."
    
    if [ ! -f "backend/data/calculator_requests.json" ]; then
        echo '[]' > backend/data/calculator_requests.json
        print_success "Создан calculator_requests.json"
    fi
    
    if [ ! -f "backend/data/contact_requests.json" ]; then
        echo '[]' > backend/data/contact_requests.json
        print_success "Создан contact_requests.json"
    fi
    
    # Проверяем права на файлы
    chmod 755 deploy.sh
    chmod 644 backend/data/*.json 2>/dev/null || true
    
    # Запуск проекта
    print_info "Запуск Docker контейнеров..."
    
    # Останавливаем старые контейнеры
    docker-compose down 2>/dev/null || true
    
    # Собираем образ
    print_info "Сборка Docker образа..."
    docker-compose build --no-cache
    
    # Запускаем
    print_info "Запуск контейнеров..."
    docker-compose up -d
    
    # Ожидание запуска
    print_info "Ожидание запуска приложения (15 секунд)..."
    sleep 15
    
    # Проверка
    print_info "Проверка работоспособности..."
    
    if curl -s -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_success "✅ Сайт успешно запущен!"
        
        echo
        echo "============================================"
        echo "           MakeBot Развернут!"
        echo "============================================"
        echo
        echo "🌐 Откройте в браузере:"
        echo "   http://ваш-ip-адрес:3000"
        echo "   или"
        echo "   http://localhost:3000"
        echo
        echo "🤖 Telegram настройки:"
        echo "   Бот: @makebot_support_bot"
        echo "   Chat ID: 1079922982"
        echo
        echo "🛠️  Команды управления:"
        echo "   Просмотр логов:   docker-compose logs -f"
        echo "   Остановить:       docker-compose down"
        echo "   Перезапустить:    docker-compose restart"
        echo "   Статус:           docker-compose ps"
        echo
        echo "🔍 Проверка API:"
        echo "   curl http://localhost:3000/api/health"
        echo "   curl http://localhost:3000/api/info"
        echo
        echo "📊 Тест Telegram:"
        echo "   curl http://localhost:3000/api/test/telegram"
        echo
        echo "📁 Файлы данных:"
        echo "   backend/data/calculator_requests.json"
        echo "   backend/data/contact_requests.json"
        echo
        echo "============================================"
        
    else
        print_error "Ошибка запуска!"
        echo
        echo "Проверьте логи:"
        echo "  docker-compose logs makebot"
        echo
        echo "Или попробуйте запустить вручную:"
        echo "  docker-compose up"
        echo
        exit 1
    fi
}

# Запуск
main "$@"
