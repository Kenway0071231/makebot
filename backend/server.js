// backend/server.js
/**
 * MakeBot Backend Server
 * Версия 2.3 (только Telegram) - ИСПРАВЛЕННЫЙ
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// КОНФИГУРАЦИЯ
// ============================================
const config = {
    name: 'MakeBot API',
    version: '2.3.0',
    contact: {
        phone: '+7 (925) 151-58-31'
    }
};

// ============================================
// НАСТРОЙКА TELEGRAM (ИСПРАВЛЕННЫЙ)
// ============================================
let telegramBot = null;

function initializeTelegramBot() {
    try {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        
        if (!token || !chatId) {
            console.error('❌ Отсутствуют переменные Telegram');
            console.error('   TELEGRAM_BOT_TOKEN:', !!token);
            console.error('   TELEGRAM_CHAT_ID:', !!chatId);
            return null;
        }
        
        console.log('🤖 Инициализация Telegram бота...');
        console.log('   Токен:', token.substring(0, 10) + '...');
        console.log('   Чат ID:', chatId);
        
        const bot = new TelegramBot(token, { polling: false });
        console.log('✅ Telegram бот инициализирован');
        
        // Проверка доступности бота
        bot.getMe().then(me => {
            console.log(`✅ Бот @${me.username} готов к работе`);
        }).catch(error => {
            console.error('❌ Ошибка доступа к боту:', error.message);
        });
        
        return bot;
    } catch (error) {
        console.error('❌ Ошибка инициализации Telegram бота:', error.message);
        return null;
    }
}

telegramBot = initializeTelegramBot();

// ============================================
// ФУНКЦИИ ОТПРАВКИ В TELEGRAM
// ============================================

// Отправка заявки с калькулятора в Telegram
async function sendCalculatorToTelegram(data) {
    if (!telegramBot) {
        console.warn('⚠️ Telegram бот не настроен, заявка не отправлена');
        return { success: false, error: 'Telegram не настроен' };
    }
    
    try {
        const chatId = process.env.TELEGRAM_CHAT_ID;
        const calculation = data.calculation;
        
        // Форматирование сообщения
        const message = `🚀 *НОВАЯ ЗАЯВКА С КАЛЬКУЛЯТОРА*
        
📋 *Детали заявки:*
🆔 ID: #${data.id}
📅 Дата: ${new Date(data.timestamp).toLocaleString('ru-RU')}
🌐 IP: ${data.ip}

👤 *Контактная информация:*
👨‍💼 Имя: ${data.name}
📞 Телефон: ${data.phone}
📧 Email: ${data.email || 'Не указан'}
💬 Комментарий: ${data.comment || 'Нет'}

📊 *Параметры проекта:*
🎯 Тип: ${calculation.projectType}
📱 Платформы: ${calculation.platforms || '—'}
🔗 Интеграции: ${calculation.integrations || '—'}
⚙️ Сложность: ${calculation.complexity}
⏱️ Срочность: ${calculation.deadline}

💰 *Расчет стоимости:*
💵 Ориентировочная: *${calculation.totalPrice.toLocaleString('ru-RU')} ₽*
📈 Диапазон: ${calculation.minPrice.toLocaleString('ru-RU')} – ${calculation.maxPrice.toLocaleString('ru-RU')} ₽

📅 *Сроки разработки:*
🗓️ Проектирование: ${calculation.timeline.planning}
🛠️ Разработка: ${calculation.timeline.development}
🧪 Тестирование: ${calculation.timeline.testing}
⏰ Общий срок: ${calculation.timeline.total}

📱 User-Agent: ${(data.userAgent || '').substring(0, 100)}`;
        
        console.log('📤 Отправка заявки в Telegram...');
        console.log('   Чат ID:', chatId);
        
        const result = await telegramBot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });
        
        console.log(`✅ Заявка отправлена в Telegram: ${result.message_id}`);
        
        return {
            success: true,
            messageId: result.message_id,
            details: result
        };
        
    } catch (error) {
        console.error('❌ Ошибка отправки в Telegram:', error.message);
        console.error('   Код ошибки:', error.code);
        return {
            success: false,
            error: error.message,
            code: error.code
        };
    }
}

// Отправка контактной заявки в Telegram
async function sendContactToTelegram(data) {
    if (!telegramBot) {
        console.warn('⚠️ Telegram бот не настроен, заявка не отправлена');
        return { success: false, error: 'Telegram не настроен' };
    }
    
    try {
        const chatId = process.env.TELEGRAM_CHAT_ID;
        
        // Форматирование сообщения
        const message = `📞 *НОВАЯ КОНТАКТНАЯ ЗАЯВКА*
        
📋 *Детали заявки:*
🆔 ID: #${data.id}
📅 Дата: ${new Date(data.timestamp).toLocaleString('ru-RU')}
🌐 IP: ${data.ip}

👤 *Контактная информация:*
👨‍💼 Имя: ${data.name}
📞 Телефон: ${data.phone}
💬 Сообщение: ${data.message || 'Нет'}

📱 User-Agent: ${(data.userAgent || '').substring(0, 100)}`;
        
        console.log('📤 Отправка контактной заявки в Telegram...');
        console.log('   Чат ID:', chatId);
        
        const result = await telegramBot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });
        
        console.log(`✅ Контактная заявка отправлена в Telegram: ${result.message_id}`);
        
        return {
            success: true,
            messageId: result.message_id,
            details: result
        };
        
    } catch (error) {
        console.error('❌ Ошибка отправки контактной заявки в Telegram:', error.message);
        console.error('   Код ошибки:', error.code);
        return {
            success: false,
            error: error.message,
            code: error.code
        };
    }
}

// ============================================
// ПРОВЕРКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ
// ============================================
const requiredEnvVars = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.warn('⚠️  ВНИМАНИЕ: отсутствуют переменные Telegram:', missingEnvVars);
    console.warn('   Отредактируйте файл .env в папке backend/');
    console.warn('   Пример:');
    console.warn('   TELEGRAM_BOT_TOKEN=ваш_токен');
    console.warn('   TELEGRAM_CHAT_ID=ваш_чат_id');
} else {
    console.log('✅ Переменные Telegram найдены');
}

// ============================================
// ПОДКЛЮЧЕНИЕ БИБЛИОТЕК
// ============================================
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);
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
            telegramConfigured: telegramBot !== null
        }
    });
});

// Валидация JSON
const validateJSON = (req, res, next) => {
    if (req.method === 'POST' && req.headers['content-type'] !== 'application/json') {
        console.warn('⚠️  Неправильный Content-Type:', req.headers['content-type']);
        return res.status(415).json({
            success: false,
            message: 'Неподдерживаемый формат данных. Используйте application/json'
        });
    }
    next();
};

// Обработка заявок с калькулятора (ИСПРАВЛЕННАЯ)
app.post('/api/calculator/submit', validateJSON, async (req, res) => {
    try {
        console.log('📝 Получена заявка с калькулятора');
        
        const { name, phone, email, comment, calculation } = req.body;
        
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
            name,
            phone,
            email: email || null,
            comment: comment || null,
            calculation,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.get('User-Agent')
        };
        
        console.log('📊 Данные заявки сохранены, ID:', estimateData.id);
        
        // Сохраняем в файл
        const logPath = path.join(__dirname, 'data', 'calculator_requests.json');
        const requests = fs.existsSync(logPath) 
            ? JSON.parse(fs.readFileSync(logPath, 'utf8'))
            : [];
        
        requests.push(estimateData);
        fs.writeFileSync(logPath, JSON.stringify(requests, null, 2));
        
        // Отправляем в Telegram
        let telegramResult = null;
        try {
            console.log('🤖 Попытка отправки в Telegram...');
            telegramResult = await sendCalculatorToTelegram(estimateData);
            
            if (telegramResult.success) {
                console.log(`✅ Заявка с калькулятора #${estimateData.id} отправлена в Telegram`);
            } else {
                console.error('❌ Ошибка отправки в Telegram:', telegramResult.error);
            }
        } catch (telegramError) {
            console.error('❌ Исключение при отправке в Telegram:', telegramError.message);
        }
        
        res.json({
            success: true,
            message: 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.',
            data: {
                requestId: estimateData.id,
                name,
                phone,
                email: email || null,
                telegramSent: telegramResult?.success || false,
                telegramMessage: telegramResult?.success ? 'Отправлено в Telegram' : 'Ошибка отправки в Telegram'
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

// Обработка контактной формы (ИСПРАВЛЕННАЯ)
app.post('/api/contact', validateJSON, async (req, res) => {
    try {
        console.log('📝 Получена контактная заявка');
        
        const { name, phone, message } = req.body;
        
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
            name,
            phone,
            message: message || null,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.get('User-Agent')
        };
        
        console.log('📊 Данные контактной заявки сохранены, ID:', contactData.id);
        
        // Сохраняем в файл
        const logPath = path.join(__dirname, 'data', 'contact_requests.json');
        const contacts = fs.existsSync(logPath) 
            ? JSON.parse(fs.readFileSync(logPath, 'utf8'))
            : [];
        
        contacts.push(contactData);
        fs.writeFileSync(logPath, JSON.stringify(contacts, null, 2));
        
        // Отправляем в Telegram
        let telegramResult = null;
        try {
            console.log('🤖 Попытка отправки контактной заявки в Telegram...');
            telegramResult = await sendContactToTelegram(contactData);
            
            if (telegramResult.success) {
                console.log(`✅ Контактная заявка #${contactData.id} отправлена в Telegram`);
            } else {
                console.error('❌ Ошибка отправки контактной заявки в Telegram:', telegramResult.error);
            }
        } catch (telegramError) {
            console.error('❌ Исключение при отправке контактной заявки в Telegram:', telegramError.message);
        }
        
        res.json({
            success: true,
            message: 'Заявка успешно отправлена! Мы свяжемся с вами в течение 30 минут.',
            data: {
                contactId: contactData.id,
                name,
                phone,
                telegramSent: telegramResult?.success || false,
                telegramMessage: telegramResult?.success ? 'Отправлено в Telegram' : 'Ошибка отправки в Telegram'
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
    try {
        console.log('🤖 Тестирование Telegram...');
        
        if (!telegramBot) {
            return res.json({
                success: false,
                message: 'Telegram не настроен',
                env: {
                    telegramToken: process.env.TELEGRAM_BOT_TOKEN ? 'Есть' : 'Нет',
                    telegramChatId: process.env.TELEGRAM_CHAT_ID ? 'Есть' : 'Нет'
                }
            });
        }
        
        const testMessage = `🔧 *Тестовое сообщение от MakeBot*
        
📅 Дата: ${new Date().toLocaleString('ru-RU')}
✅ Если вы получили это сообщение, значит Telegram настроен правильно.

🤖 Настройки:
• Бот: готов к работе
• Чат ID: ${process.env.TELEGRAM_CHAT_ID}
• Время: ${new Date().toISOString()}`;
        
        try {
            const result = await telegramBot.sendMessage(process.env.TELEGRAM_CHAT_ID, testMessage, {
                parse_mode: 'Markdown'
            });
            
            res.json({
                success: true,
                message: 'Тестовое сообщение отправлено в Telegram',
                result: {
                    messageId: result.message_id,
                    chatId: result.chat.id
                }
            });
            
        } catch (error) {
            console.error('❌ Ошибка отправки тестового сообщения:', error.message);
            res.json({
                success: false,
                message: 'Ошибка отправки тестового сообщения',
                error: error.message
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
            telegramStatus: telegramBot !== null
        };
        
        // Чтение из файлов
        const calculatorPath = path.join(__dirname, 'data', 'calculator_requests.json');
        const contactPath = path.join(__dirname, 'data', 'contact_requests.json');
        
        if (fs.existsSync(calculatorPath)) {
            const requests = JSON.parse(fs.readFileSync(calculatorPath, 'utf8'));
            stats.totalCalculatorRequests = requests.length;
            
            const today = new Date().toISOString().split('T')[0];
            stats.todayCalculatorRequests = requests.filter(r => 
                r.timestamp.split('T')[0] === today
            ).length;
        }
        
        if (fs.existsSync(contactPath)) {
            const contacts = JSON.parse(fs.readFileSync(contactPath, 'utf8'));
            stats.totalContactRequests = contacts.length;
            
            const today = new Date().toISOString().split('T')[0];
            stats.todayContactRequests = contacts.filter(c => 
                c.timestamp.split('T')[0] === today
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
            telegram: telegramBot !== null,
            env: missingEnvVars.length > 0 ? `⚠️ Missing: ${missingEnvVars.join(', ')}` : '✅ OK',
            endpoints: {
                calculator: '/api/calculator/submit',
                contact: '/api/contact',
                test: '/api/test/telegram'
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
            message: 'API endpoint not found'
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
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================
// ЗАПУСК СЕРВЕРА
// ============================================

// Создаем папку для данных
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    ========================================
    MakeBot Server v${config.version}
    ========================================
    🚀 Сервер запущен на порту: ${PORT}
    🌐 Доступен по адресу: http://0.0.0.0:${PORT}
    📞 Телефон: ${config.contact.phone}
    🤖 Telegram отправка: ${telegramBot ? '✅ Настроена' : '❌ Не настроена'}
    ${missingEnvVars.length > 0 ? `⚠️  Отсутствуют: ${missingEnvVars.join(', ')}` : '✅ Все переменные настроены'}
    ========================================
    `);
    
    // Выводим доступные endpoint'ы
    console.log('\n📡 Доступные API endpoints:');
    console.log('   GET  /api/info           - информация о сервере');
    console.log('   GET  /api/health         - проверка здоровья');
    console.log('   GET  /api/stats          - статистика заявок');
    console.log('   GET  /api/test/telegram  - тест Telegram отправки');
    console.log('   POST /api/calculator/submit - отправка заявки с калькулятора');
    console.log('   POST /api/contact        - отправка контактной формы');
    console.log('   GET  /                   - главная страница сайта');
});
