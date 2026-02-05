/**
 * MakeBot Backend Server
 * Версия 2.4 (исправленная) - для Yandex Cloud
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// ============================================
// КОНФИГУРАЦИЯ
// ============================================
const config = {
    name: 'MakeBot API',
    version: '2.4.0',
    contact: {
        phone: process.env.CONTACT_PHONE || '+7 (925) 151-58-31',
        email: process.env.CONTACT_EMAIL || 'support@makebot.shop'
    }
};

// ============================================
// НАСТРОЙКА TELEGRAM (УЛУЧШЕННАЯ)
// ============================================
let telegramBot = null;
let telegramInitialized = false;

async function initializeTelegramBot() {
    try {
        console.log('🤖 Начинаю инициализацию Telegram бота...');
        
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        
        if (!token || token === 'ваш_токен_здесь') {
            console.error('❌ TELEGRAM_BOT_TOKEN не установлен или установлен по умолчанию');
            console.error('   Пожалуйста, установите реальный токен в .env файле');
            return null;
        }
        
        if (!chatId || isNaN(chatId)) {
            console.error('❌ TELEGRAM_CHAT_ID не установлен или некорректен');
            console.error('   Chat ID должен быть числом');
            return null;
        }
        
        console.log('   Токен:', token.substring(0, 10) + '...' + token.substring(token.length - 5));
        console.log('   Чат ID:', chatId);
        
        // Создаем бота с отключенным polling
        const bot = new TelegramBot(token, { 
            polling: false,
            request: {
                timeout: 10000,
                agentOptions: {
                    keepAlive: true,
                    keepAliveMsecs: 10000
                }
            }
        });
        
        // Проверяем доступность бота
        console.log('   Проверяю доступность бота...');
        try {
            const me = await bot.getMe();
            console.log(`   ✅ Бот доступен: @${me.username} (ID: ${me.id})`);
            console.log(`   ✅ Имя бота: ${me.first_name}`);
            
            telegramInitialized = true;
            console.log('✅ Telegram бот успешно инициализирован и готов к работе');
            
            // Отправляем тестовое сообщение
            try {
                const testMessage = `🤖 *MakeBot Server Started* \n\n✅ Сервер запущен успешно!\n📅 ${new Date().toLocaleString('ru-RU')}\n🌐 ${process.env.APP_URL || 'http://localhost:3000'}\n🔧 Версия: ${config.version}`;
                
                await bot.sendMessage(chatId, testMessage, {
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                });
                console.log('   ✅ Тестовое сообщение отправлено');
            } catch (testError) {
                console.warn('   ⚠️ Не удалось отправить тестовое сообщение:', testError.message);
            }
            
            return bot;
            
        } catch (botError) {
            console.error('❌ Ошибка при проверке бота:', botError.message);
            console.error('   Проверьте:');
            console.error('   1. Правильность токена');
            console.error('   2. Доступность интернета на сервере');
            console.error('   3. Что бот не заблокирован');
            return null;
        }
        
    } catch (error) {
        console.error('❌ Критическая ошибка инициализации Telegram:', error);
        return null;
    }
}

// Инициализируем бота при старте
initializeTelegramBot().then(bot => {
    telegramBot = bot;
}).catch(error => {
    console.error('Ошибка при инициализации Telegram:', error);
});

// ============================================
// ФУНКЦИИ ОТПРАВКИ В TELEGRAM (УЛУЧШЕННЫЕ)
// ============================================

async function sendToTelegram(message, options = {}) {
    if (!telegramBot || !telegramInitialized) {
        console.warn('⚠️ Telegram бот не инициализирован, сообщение не отправлено');
        return { success: false, error: 'Telegram не инициализирован' };
    }
    
    try {
        const chatId = process.env.TELEGRAM_CHAT_ID;
        
        const defaultOptions = {
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
            disable_notification: false
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        console.log('📤 Отправка в Telegram...');
        console.log('   Чат ID:', chatId);
        console.log('   Длина сообщения:', message.length, 'символов');
        
        const result = await telegramBot.sendMessage(chatId, message, finalOptions);
        
        console.log(`✅ Сообщение отправлено успешно! ID: ${result.message_id}`);
        console.log('   Дата:', new Date(result.date * 1000).toLocaleString('ru-RU'));
        
        return {
            success: true,
            messageId: result.message_id,
            chatId: result.chat.id,
            date: new Date(result.date * 1000)
        };
        
    } catch (error) {
        console.error('❌ Ошибка отправки в Telegram:');
        console.error('   Код:', error.code);
        console.error('   Сообщение:', error.message);
        console.error('   Ответ сервера:', error.response ? JSON.stringify(error.response.body) : 'Нет ответа');
        
        return {
            success: false,
            error: error.message,
            code: error.code,
            response: error.response
        };
    }
}

// Отправка заявки с калькулятора
async function sendCalculatorToTelegram(data) {
    const message = `🚀 *НОВАЯ ЗАЯВКА С КАЛЬКУЛЯТОРА* \n\n📋 *Детали заявки:*\n🆔 ID: #${data.id}\n📅 Дата: ${new Date(data.timestamp).toLocaleString('ru-RU')}\n🌐 IP: ${data.ip}\n\n👤 *Контактная информация:*\n👨‍💼 Имя: ${data.name}\n📞 Телефон: ${data.phone}\n📧 Email: ${data.email || 'Не указан'}\n💬 Комментарий: ${data.comment || 'Нет'}\n\n📊 *Параметры проекта:*\n🎯 Тип: ${data.calculation.projectType}\n📱 Платформы: ${data.calculation.platforms || '—'}\n🔗 Интеграции: ${data.calculation.integrations || '—'}\n⚙️ Сложность: ${data.calculation.complexity}\n⏱️ Срочность: ${data.calculation.deadline}\n\n💰 *Расчет стоимости:*\n💵 Ориентировочная: *${data.calculation.totalPrice.toLocaleString('ru-RU')} ₽*\n📈 Диапазон: ${data.calculation.minPrice.toLocaleString('ru-RU')} – ${data.calculation.maxPrice.toLocaleString('ru-RU')} ₽\n\n📅 *Сроки разработки:*\n🗓️ Проектирование: ${data.calculation.timeline.planning}\n🛠️ Разработка: ${data.calculation.timeline.development}\n🧪 Тестирование: ${data.calculation.timeline.testing}\n⏰ Общий срок: ${data.calculation.timeline.total}\n\n📱 User-Agent: ${(data.userAgent || '').substring(0, 100)}...`;
    
    return await sendToTelegram(message);
}

// Отправка контактной заявки
async function sendContactToTelegram(data) {
    const message = `📞 *НОВАЯ КОНТАКТНАЯ ЗАЯВКА* \n\n📋 *Детали заявки:*\n🆔 ID: #${data.id}\n📅 Дата: ${new Date(data.timestamp).toLocaleString('ru-RU')}\n🌐 IP: ${data.ip}\n\n👤 *Контактная информация:*\n👨‍💼 Имя: ${data.name}\n📞 Телефон: ${data.phone}\n💬 Сообщение: ${data.message || 'Нет'}\n\n📱 User-Agent: ${(data.userAgent || '').substring(0, 100)}...`;
    
    return await sendToTelegram(message);
}

// ============================================
// ПРОВЕРКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ
// ============================================
console.log('🔍 Проверка переменных окружения...');
const requiredEnvVars = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'];
requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value.includes('ваш_')) {
        console.error(`❌ ${varName}: НЕ НАСТРОЕН или содержит значение по умолчанию`);
    } else {
        console.log(`✅ ${varName}: установлен`);
    }
});

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json({ 
    limit: '10mb',
    type: 'application/json'
}));
app.use(express.urlencoded({ 
    extended: true,
    limit: '10mb'
}));

// Статические файлы
app.use(express.static(path.join(__dirname, '../frontend')));

// Логирование запросов
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(`${timestamp} - ${req.method} ${req.url} - IP: ${ip}`);
    next();
});

// ============================================
// МАРШРУТЫ API
// ============================================

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Информация о сервере
app.get('/api/info', (req, res) => {
    res.json({
        success: true,
        data: {
            name: config.name,
            version: config.version,
            serverTime: new Date().toISOString(),
            contact: config.contact,
            telegramConfigured: telegramInitialized,
            telegramStatus: telegramInitialized ? '✅ Готов' : '❌ Не настроен',
            environment: process.env.NODE_ENV,
            host: req.headers.host
        }
    });
});

// Валидация JSON
const validateJSON = (req, res, next) => {
    if (req.method === 'POST' && !req.headers['content-type']?.includes('application/json')) {
        console.warn('⚠️ Неправильный Content-Type:', req.headers['content-type']);
        return res.status(415).json({
            success: false,
            message: 'Неподдерживаемый формат данных. Используйте application/json'
        });
    }
    next();
};

// Обработка заявок с калькулятора
app.post('/api/calculator/submit', validateJSON, async (req, res) => {
    console.log('📝 Получена заявка с калькулятора');
    
    try {
        const { name, phone, email, comment, calculation } = req.body;
        
        // Валидация
        if (!name || !phone || !calculation) {
            console.log('❌ Недостаточно данных в заявке');
            return res.status(400).json({
                success: false,
                message: 'Недостаточно данных для обработки заявки'
            });
        }
        
        // Сохраняем данные
        const estimateData = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            name: name.trim(),
            phone: phone.trim(),
            email: email ? email.trim() : null,
            comment: comment ? comment.trim() : null,
            calculation,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.get('User-Agent')
        };
        
        console.log('📊 Данные заявки:', {
            id: estimateData.id,
            name: estimateData.name,
            phone: estimateData.phone,
            email: estimateData.email
        });
        
        // Сохраняем в файл
        const logPath = path.join(__dirname, 'data', 'calculator_requests.json');
        const requests = fs.existsSync(logPath) 
            ? JSON.parse(fs.readFileSync(logPath, 'utf8'))
            : [];
        
        requests.push(estimateData);
        fs.writeFileSync(logPath, JSON.stringify(requests, null, 2));
        console.log(`✅ Заявка #${estimateData.id} сохранена в файл`);
        
        // Отправляем в Telegram
        let telegramResult = null;
        if (telegramInitialized) {
            console.log('🤖 Отправляю заявку в Telegram...');
            try {
                telegramResult = await sendCalculatorToTelegram(estimateData);
                
                if (telegramResult.success) {
                    console.log(`✅ Заявка #${estimateData.id} успешно отправлена в Telegram`);
                } else {
                    console.error(`❌ Ошибка отправки в Telegram:`, telegramResult.error);
                }
            } catch (telegramError) {
                console.error('❌ Исключение при отправке в Telegram:', telegramError);
                telegramResult = { success: false, error: telegramError.message };
            }
        } else {
            console.warn('⚠️ Telegram не настроен, пропускаю отправку');
            telegramResult = { success: false, error: 'Telegram не настроен' };
        }
        
        // Ответ клиенту
        res.json({
            success: true,
            message: 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.',
            data: {
                requestId: estimateData.id,
                name: estimateData.name,
                phone: estimateData.phone,
                email: estimateData.email,
                telegramSent: telegramResult?.success || false,
                telegramMessage: telegramResult?.success ? '✅ Отправлено в Telegram' : '❌ Ошибка отправки в Telegram'
            }
        });
        
    } catch (error) {
        console.error('❌ Ошибка при обработке заявки с калькулятора:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при обработке заявки. Пожалуйста, попробуйте еще раз.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Обработка контактной формы
app.post('/api/contact', validateJSON, async (req, res) => {
    console.log('📝 Получена контактная заявка');
    
    try {
        const { name, phone, message } = req.body;
        
        // Валидация
        if (!name || !phone) {
            console.log('❌ Недостаточно данных в контактной форме');
            return res.status(400).json({
                success: false,
                message: 'Пожалуйста, заполните обязательные поля'
            });
        }
        
        // Сохраняем данные
        const contactData = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            name: name.trim(),
            phone: phone.trim(),
            message: message ? message.trim() : null,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.get('User-Agent')
        };
        
        console.log('📊 Контактные данные:', {
            id: contactData.id,
            name: contactData.name,
            phone: contactData.phone
        });
        
        // Сохраняем в файл
        const logPath = path.join(__dirname, 'data', 'contact_requests.json');
        const contacts = fs.existsSync(logPath) 
            ? JSON.parse(fs.readFileSync(logPath, 'utf8'))
            : [];
        
        contacts.push(contactData);
        fs.writeFileSync(logPath, JSON.stringify(contacts, null, 2));
        console.log(`✅ Контактная заявка #${contactData.id} сохранена в файл`);
        
        // Отправляем в Telegram
        let telegramResult = null;
        if (telegramInitialized) {
            console.log('🤖 Отправляю контактную заявку в Telegram...');
            try {
                telegramResult = await sendContactToTelegram(contactData);
                
                if (telegramResult.success) {
                    console.log(`✅ Контактная заявка #${contactData.id} успешно отправлена в Telegram`);
                } else {
                    console.error(`❌ Ошибка отправки в Telegram:`, telegramResult.error);
                }
            } catch (telegramError) {
                console.error('❌ Исключение при отправке в Telegram:', telegramError);
                telegramResult = { success: false, error: telegramError.message };
            }
        } else {
            console.warn('⚠️ Telegram не настроен, пропускаю отправку');
            telegramResult = { success: false, error: 'Telegram не настроен' };
        }
        
        // Ответ клиенту
        res.json({
            success: true,
            message: 'Заявка успешно отправлена! Мы свяжемся с вами в течение 30 минут.',
            data: {
                contactId: contactData.id,
                name: contactData.name,
                phone: contactData.phone,
                telegramSent: telegramResult?.success || false,
                telegramMessage: telegramResult?.success ? '✅ Отправлено в Telegram' : '❌ Ошибка отправки в Telegram'
            }
        });
        
    } catch (error) {
        console.error('❌ Ошибка при обработке контактной формы:', error);
        res.status(500).json({
            success: false,
            message: 'Произошла ошибка при отправке заявки. Пожалуйста, попробуйте еще раз.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Тестовый endpoint для проверки Telegram
app.get('/api/test/telegram', async (req, res) => {
    console.log('🤖 Тестирование Telegram...');
    
    try {
        if (!telegramBot || !telegramInitialized) {
            return res.json({
                success: false,
                message: 'Telegram не настроен или не инициализирован',
                status: 'not_configured',
                env: {
                    telegramToken: process.env.TELEGRAM_BOT_TOKEN ? '✅ Есть' : '❌ Нет',
                    telegramChatId: process.env.TELEGRAM_CHAT_ID ? '✅ Есть' : '❌ Нет',
                    telegramInitialized: telegramInitialized ? '✅ Да' : '❌ Нет'
                }
            });
        }
        
        const testMessage = `🔧 *Тестовое сообщение от MakeBot* \n\n📅 Дата: ${new Date().toLocaleString('ru-RU')}\n✅ Если вы получили это сообщение, значит Telegram настроен правильно.\n\n🤖 *Настройки:*\n• Сервер: ${req.headers.host}\n• Чат ID: ${process.env.TELEGRAM_CHAT_ID}\n• Версия: ${config.version}\n• Время сервера: ${new Date().toISOString()}\n\n📊 *Статус:*\n✅ Готов к работе\n🟢 Заявки будут приходить сюда`;
        
        try {
            const result = await telegramBot.sendMessage(process.env.TELEGRAM_CHAT_ID, testMessage, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
            
            console.log('✅ Тестовое сообщение отправлено успешно!');
            
            res.json({
                success: true,
                message: 'Тестовое сообщение отправлено в Telegram',
                status: 'sent',
                result: {
                    messageId: result.message_id,
                    chatId: result.chat.id,
                    date: new Date(result.date * 1000).toISOString()
                },
                details: {
                    serverTime: new Date().toISOString(),
                    telegramInitialized: telegramInitialized,
                    botStatus: 'active'
                }
            });
            
        } catch (error) {
            console.error('❌ Ошибка отправки тестового сообщения:', error.message);
            
            res.json({
                success: false,
                message: 'Ошибка отправки тестового сообщения',
                status: 'send_error',
                error: {
                    code: error.code,
                    message: error.message,
                    response: error.response ? error.response.body : null
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Ошибка тестирования Telegram:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка тестирования Telegram',
            error: error.message
        });
    }
});

// Получение статистики
app.get('/api/stats', (req, res) => {
    try {
        const stats = {
            totalCalculatorRequests: 0,
            totalContactRequests: 0,
            todayCalculatorRequests: 0,
            todayContactRequests: 0,
            telegramStatus: telegramInitialized,
            serverUptime: process.uptime(),
            serverTime: new Date().toISOString()
        };
        
        // Чтение из файлов
        const calculatorPath = path.join(__dirname, 'data', 'calculator_requests.json');
        const contactPath = path.join(__dirname, 'data', 'contact_requests.json');
        
        if (fs.existsSync(calculatorPath)) {
            const requests = JSON.parse(fs.readFileSync(calculatorPath, 'utf8'));
            stats.totalCalculatorRequests = requests.length;
            
            const today = new Date().toISOString().split('T')[0];
            stats.todayCalculatorRequests = requests.filter(r => 
                r.timestamp && r.timestamp.split('T')[0] === today
            ).length;
        }
        
        if (fs.existsSync(contactPath)) {
            const contacts = JSON.parse(fs.readFileSync(contactPath, 'utf8'));
            stats.totalContactRequests = contacts.length;
            
            const today = new Date().toISOString().split('T')[0];
            stats.todayContactRequests = contacts.filter(c => 
                c.timestamp && c.timestamp.split('T')[0] === today
            ).length;
        }
        
        res.json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        console.error('Ошибка при получении статистики:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении статистики'
        });
    }
});

// Проверка здоровья сервера
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            telegram: telegramInitialized,
            telegramStatus: telegramInitialized ? '✅ Настроен' : '❌ Не настроен',
            env: {
                nodeEnv: process.env.NODE_ENV,
                port: process.env.PORT,
                missingVars: requiredEnvVars.filter(varName => !process.env[varName])
            },
            endpoints: {
                calculator: '/api/calculator/submit',
                contact: '/api/contact',
                test: '/api/test/telegram',
                health: '/api/health',
                stats: '/api/stats',
                info: '/api/info'
            }
        }
    });
});

// ============================================
// ОБРАБОТКА ОШИБОК
// ============================================

// 404 - Not Found
app.use((req, res) => {
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(404).json({
            success: false,
            message: 'API endpoint not found',
            requestedUrl: req.url,
            method: req.method
        });
    }
    res.status(404).sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('❌ Ошибка сервера:', err);
    
    res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
        timestamp: new Date().toISOString()
    });
});

// ============================================
// ЗАПУСК СЕРВЕРА
// ============================================

// Создаем папку для данных
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('📁 Создана папка данных:', dataDir);
}

// Инициализация файлов данных
const dataFiles = [
    'calculator_requests.json',
    'contact_requests.json'
];

dataFiles.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '[]', 'utf8');
        console.log(`📁 Создан файл данных: ${file}`);
    }
});

// Запуск сервера
app.listen(PORT, HOST, () => {
    console.log(`
    ========================================
    MakeBot Server v${config.version}
    ========================================
    🚀 Сервер запущен!
    🌐 Host: ${HOST}:${PORT}
    🔗 URL: http://${HOST}:${PORT}
    📞 Телефон: ${config.contact.phone}
    
    🤖 Telegram Status:
    ${telegramInitialized ? '    ✅ Настроен и готов к работе' : '    ❌ Не настроен'}
    ${telegramBot ? '    ✅ Бот инициализирован' : '    ❌ Бот не инициализирован'}
    
    📊 Переменные окружения:
    ${requiredEnvVars.map(varName => 
        `    ${process.env[varName] ? '✅' : '❌'} ${varName}: ${process.env[varName] ? 'Установлен' : 'Не установлен'}`
    ).join('\n    ')}
    
    📡 Доступные API endpoints:
       GET  /api/info           - информация о сервере
       GET  /api/health         - проверка здоровья
       GET  /api/stats          - статистика заявок
       GET  /api/test/telegram  - тест Telegram отправки
       POST /api/calculator/submit - отправка заявки с калькулятора
       POST /api/contact        - отправка контактной формы
       GET  /                   - главная страница сайта
    ========================================
    `);
    
    // Тестовый запрос для проверки
    console.log('🔍 Проверка доступности API...');
    setTimeout(() => {
        const checkUrl = `http://${HOST}:${PORT}/api/health`;
        console.log(`   Проверка: ${checkUrl}`);
    }, 1000);
});
