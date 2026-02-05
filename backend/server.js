/**
 * MakeBot Backend Server (рабочая версия)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== НАСТРОЙКА TELEGRAM ====================
console.log('🤖 Настраиваю Telegram...');
console.log('Токен:', process.env.TELEGRAM_BOT_TOKEN ? 'Есть' : 'Нет');
console.log('Чат ID:', process.env.TELEGRAM_CHAT_ID ? 'Есть' : 'Нет');

let bot = null;
try {
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
        bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
        console.log('✅ Telegram бот инициализирован');
    } else {
        console.log('⚠️ Telegram токен или чат ID не указаны');
    }
} catch (error) {
    console.error('❌ Ошибка инициализации Telegram:', error.message);
}

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Логирование
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// ==================== РОУТЫ ====================

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Проверка работы
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'online',
        time: new Date().toISOString(),
        telegram: bot !== null
    });
});

// Отправка заявки с калькулятора
app.post('/api/calculator/submit', async (req, res) => {
    try {
        console.log('📝 Получена заявка с калькулятора:', req.body);
        
        const { name, phone, email, comment, calculation } = req.body;
        
        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Укажите имя и телефон'
            });
        }
        
        // Сохраняем в файл
        const data = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            name,
            phone,
            email,
            comment,
            calculation,
            ip: req.ip
        };
        
        const filePath = path.join(__dirname, 'data', 'calculator.json');
        const allData = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
        allData.push(data);
        fs.writeFileSync(filePath, JSON.stringify(allData, null, 2));
        
        // Отправляем в Telegram
        let telegramResult = { success: false };
        if (bot) {
            try {
                const message = `🚀 *НОВАЯ ЗАЯВКА С КАЛЬКУЛЯТОРА* \n\n👤 *Имя:* ${name}\n📞 *Телефон:* ${phone}\n📧 *Email:* ${email || 'Не указан'}\n💬 *Комментарий:* ${comment || 'Нет'}\n\n💰 *Стоимость:* ${calculation?.totalPrice ? calculation.totalPrice.toLocaleString('ru-RU') + ' ₽' : '—'}\n📅 *Дата:* ${new Date().toLocaleString('ru-RU')}\n🌐 *IP:* ${req.ip || 'Неизвестен'}`;
                
                await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message, {
                    parse_mode: 'Markdown'
                });
                
                telegramResult = { success: true };
                console.log('✅ Сообщение отправлено в Telegram');
            } catch (telegramError) {
                console.error('❌ Ошибка Telegram:', telegramError.message);
                telegramResult = { success: false, error: telegramError.message };
            }
        }
        
        res.json({
            success: true,
            message: 'Заявка отправлена!',
            telegram: telegramResult.success
        });
        
    } catch (error) {
        console.error('❌ Ошибка обработки заявки:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
        });
    }
});

// Контактная форма
app.post('/api/contact', async (req, res) => {
    try {
        console.log('📞 Получена контактная форма:', req.body);
        
        const { name, phone, message } = req.body;
        
        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Укажите имя и телефон'
            });
        }
        
        // Сохраняем в файл
        const data = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            name,
            phone,
            message,
            ip: req.ip
        };
        
        const filePath = path.join(__dirname, 'data', 'contact.json');
        const allData = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
        allData.push(data);
        fs.writeFileSync(filePath, JSON.stringify(allData, null, 2));
        
        // Отправляем в Telegram
        let telegramResult = { success: false };
        if (bot) {
            try {
                const telegramMessage = `📞 *НОВАЯ КОНТАКТНАЯ ЗАЯВКА* \n\n👤 *Имя:* ${name}\n📞 *Телефон:* ${phone}\n💬 *Сообщение:* ${message || 'Нет'}\n📅 *Дата:* ${new Date().toLocaleString('ru-RU')}\n🌐 *IP:* ${req.ip || 'Неизвестен'}`;
                
                await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, telegramMessage, {
                    parse_mode: 'Markdown'
                });
                
                telegramResult = { success: true };
                console.log('✅ Контактная заявка отправлена в Telegram');
            } catch (telegramError) {
                console.error('❌ Ошибка Telegram:', telegramError.message);
                telegramResult = { success: false, error: telegramError.message };
            }
        }
        
        res.json({
            success: true,
            message: 'Заявка отправлена!',
            telegram: telegramResult.success
        });
        
    } catch (error) {
        console.error('❌ Ошибка обработки формы:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
        });
    }
});

// Тест Telegram
app.get('/api/test/telegram', async (req, res) => {
    try {
        if (!bot) {
            return res.json({
                success: false,
                message: 'Telegram не настроен'
            });
        }
        
        const testMessage = `🔧 *Тест MakeBot* \n\n✅ Система работает!\n📅 ${new Date().toLocaleString('ru-RU')}\n🚀 Заявки будут приходить в этот чат`;
        
        await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, testMessage, {
            parse_mode: 'Markdown'
        });
        
        res.json({
            success: true,
            message: 'Тестовое сообщение отправлено!'
        });
        
    } catch (error) {
        console.error('❌ Тест Telegram:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка: ' + error.message
        });
    }
});

// ==================== ЗАПУСК СЕРВЕРА ====================

// Создаем папку для данных
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Проверяем файлы данных
['calculator.json', 'contact.json'].forEach(file => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '[]');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    ========================================
    🚀 MakeBot Server запущен!
    ========================================
    🔗 http://0.0.0.0:${PORT}
    🤖 Telegram: ${bot ? '✅ Настроен' : '❌ Не настроен'}
    📅 ${new Date().toLocaleString('ru-RU')}
    ========================================
    `);
});
