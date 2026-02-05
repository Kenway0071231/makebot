/**
 * MakeBot Backend Server
 * Упрощенная рабочая версия
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
    version: '2.3.0',
    contact: {
        phone: process.env.CONTACT_PHONE || '+7 (925) 151-58-31'
    }
};

// ============================================
// НАСТРОЙКА TELEGRAM
// ============================================
let telegramBot = null;
let telegramEnabled = false;

// Проверяем наличие токена
if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN !== 'ваш_токен_здесь') {
    try {
        telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
        telegramEnabled = true;
        console.log('✅ Telegram бот настроен');
    } catch (error) {
        console.error('❌ Ошибка настройки Telegram:', error.message);
    }
} else {
    console.warn('⚠️ Telegram не настроен. Установите TELEGRAM_BOT_TOKEN в .env');
}

// ============================================
// ФУНКЦИИ ОТПРАВКИ В TELEGRAM
// ============================================
async function sendToTelegram(message) {
    if (!telegramEnabled || !telegramBot) {
        console.warn('⚠️ Telegram не настроен, сообщение не отправлено');
        return { success: false, error: 'Telegram не настроен' };
    }
    
    try {
        const chatId = process.env.TELEGRAM_CHAT_ID;
        const result = await telegramBot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });
        
        console.log(`✅ Сообщение отправлено в Telegram (ID: ${result.message_id})`);
        return { success: true, messageId: result.message_id };
        
    } catch (error) {
        console.error('❌ Ошибка отправки в Telegram:', error.message);
        return { success: false, error: error.message };
    }
}

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
            telegramConfigured: telegramEnabled
        }
    });
});

// Обработка заявок с калькулятора
app.post('/api/calculator/submit', async (req, res) => {
    try {
        console.log('📝 Получена заявка с калькулятора');
        
        const { name, phone, email, comment, calculation } = req.body;
        
        // Валидация
        if (!name || !phone || !calculation) {
            return res.status(400).json({
                success: false,
                message: 'Недостаточно данных'
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
        if (telegramEnabled) {
            const message = `🚀 *НОВАЯ ЗАЯВКА С КАЛЬКУЛЯТОРА* \n\n👤 Имя: ${estimateData.name}\n📞 Телефон: ${estimateData.phone}\n📧 Email: ${estimateData.email || 'Не указан'}\n💬 Комментарий: ${estimateData.comment || 'Нет'}\n\n💰 Стоимость: ${estimateData.calculation.totalPrice?.toLocaleString('ru-RU') || '—'} ₽\n📅 Дата: ${new Date(estimateData.timestamp).toLocaleString('ru-RU')}`;
            
            telegramResult = await sendToTelegram(message);
        }
        
        res.json({
            success: true,
            message: 'Заявка успешно отправлена!',
            data: {
                requestId: estimateData.id,
                telegramSent: telegramResult?.success || false
            }
        });
        
    } catch (error) {
        console.error('❌ Ошибка при обработке заявки:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при обработке заявки'
        });
    }
});

// Обработка контактной формы
app.post('/api/contact', async (req, res) => {
    try {
        console.log('📝 Получена контактная заявка');
        
        const { name, phone, message } = req.body;
        
        if (!name || !phone) {
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
        
        console.log('📊 Контактная заявка сохранена, ID:', contactData.id);
        
        // Сохраняем в файл
        const logPath = path.join(__dirname, 'data', 'contact_requests.json');
        const contacts = fs.existsSync(logPath) 
            ? JSON.parse(fs.readFileSync(logPath, 'utf8'))
            : [];
        
        contacts.push(contactData);
        fs.writeFileSync(logPath, JSON.stringify(contacts, null, 2));
        
        // Отправляем в Telegram
        let telegramResult = null;
        if (telegramEnabled) {
            const telegramMessage = `📞 *НОВАЯ КОНТАКТНАЯ ЗАЯВКА* \n\n👤 Имя: ${contactData.name}\n📞 Телефон: ${contactData.phone}\n💬 Сообщение: ${contactData.message || 'Нет'}\n📅 Дата: ${new Date(contactData.timestamp).toLocaleString('ru-RU')}`;
            
            telegramResult = await sendToTelegram(telegramMessage);
        }
        
        res.json({
            success: true,
            message: 'Заявка успешно отправлена!',
            data: {
                contactId: contactData.id,
                telegramSent: telegramResult?.success || false
            }
        });
        
    } catch (error) {
        console.error('❌ Ошибка при обработке контактной формы:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при отправке заявки'
        });
    }
});

// Тестовый endpoint для проверки Telegram
app.get('/api/test/telegram', async (req, res) => {
    try {
        if (!telegramEnabled) {
            return res.json({
                success: false,
                message: 'Telegram не настроен',
                status: 'not_configured'
            });
        }
        
        const testMessage = `🔧 *Тестовое сообщение от MakeBot* \n\n📅 ${new Date().toLocaleString('ru-RU')}\n✅ Telegram настроен правильно!`;
        
        const result = await sendToTelegram(testMessage);
        
        res.json({
            success: result.success,
            message: result.success ? 'Тестовое сообщение отправлено' : 'Ошибка отправки',
            result: result
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка тестирования Telegram',
            error: error.message
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
            telegram: telegramEnabled,
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
    res.status(404).sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ============================================
// ЗАПУСК СЕРВЕРА
// ============================================

// Создаем папку для данных
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Запуск сервера
app.listen(PORT, HOST, () => {
    console.log(`
    ========================================
    MakeBot Server v${config.version}
    ========================================
    🚀 Сервер запущен на: ${HOST}:${PORT}
    📞 Телефон: ${config.contact.phone}
    🤖 Telegram: ${telegramEnabled ? '✅ Настроен' : '❌ Не настроен'}
    ========================================
    `);
});
