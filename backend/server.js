/**
 * MakeBot Backend Server
 * Версия 2.1
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Импорт Telegram модуля
const telegram = require('./config/telegram');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// КОНФИГУРАЦИЯ
// ============================================
const config = {
    name: 'MakeBot API',
    version: '2.1.0',
    contact: {
        email: 'support@makebot.shop',
        phone: '+7 (925) 151-58-31',
        adminEmail: process.env.ADMIN_EMAIL || 'Denis.Kenway@yandex.ru'
    }
};

// ============================================
// ПРОВЕРКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ
// ============================================
const requiredEnvVars = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.warn('⚠️  Внимание: отсутствуют переменные окружения:', missingEnvVars);
    console.warn('   Создайте файл .env на основе .env.example');
} else {
    console.log('✅ Все переменные окружения найдены');
    console.log('📱 Telegram Chat ID:', process.env.TELEGRAM_CHAT_ID);
}

// Проверка Telegram
if (telegram.validateTelegramEnv()) {
    console.log('✅ Telegram настроен корректно');
} else {
    console.warn('⚠️  Telegram не настроен, заявки не будут отправляться');
}

// ============================================
// ПОДКЛЮЧЕНИЕ БИБЛИОТЕК
// ============================================
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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
            telegramConfigured: telegram.validateTelegramEnv()
        }
    });
});

// Обработка заявок с калькулятора
app.post('/api/calculator/submit', async (req, res) => {
    try {
        console.log('📝 Получена заявка с калькулятора:', req.body);
        
        const { name, phone, email, comment, calculation } = req.body;
        
        if (!name || !phone || !calculation) {
            console.log('❌ Недостаточно данных в заявке');
            return res.status(400).json({
                success: false,
                message: 'Недостаточно данных для обработки заявки'
            });
        }
        
        // Сохраняем данные в лог
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
            console.log('📤 Попытка отправки в Telegram...');
            telegramResult = await telegram.sendCalculatorRequest(estimateData);
            
            if (telegramResult.success) {
                console.log(`✅ Заявка с калькулятора #${estimateData.id} отправлена в Telegram`);
            } else {
                console.error('❌ Ошибка отправки в Telegram:', telegramResult.error);
                // Не прерываем выполнение, если Telegram не отправился
            }
        } catch (telegramError) {
            console.error('❌ Исключение при отправке в Telegram:', telegramError.message);
            // Не прерываем выполнение, если Telegram не отправился
        }
        
        res.json({
            success: true,
            message: 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.',
            data: {
                requestId: estimateData.id,
                name,
                phone,
                email: email || null,
                telegramSent: telegramResult?.success || false
            }
        });
        
    } catch (error) {
        console.error('❌ Ошибка при обработке заявки с калькулятора:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при обработке заявки. Пожалуйста, попробуйте еще раз.'
        });
    }
});

// Обработка контактной формы
app.post('/api/contact', async (req, res) => {
    try {
        console.log('📝 Получена контактная заявка:', req.body);
        
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
            console.log('📤 Попытка отправки контактной заявки в Telegram...');
            telegramResult = await telegram.sendContactRequest(contactData);
            
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
                telegramSent: telegramResult?.success || false
            }
        });
        
    } catch (error) {
        console.error('❌ Ошибка при обработке контактной формы:', error);
        res.status(500).json({
            success: false,
            message: 'Произошла ошибка при отправке заявки. Пожалуйста, попробуйте еще раз.'
        });
    }
});

// Получение статистики (для админки)
app.get('/api/stats', (req, res) => {
    try {
        const stats = {
            totalCalculatorRequests: 0,
            totalContactRequests: 0,
            todayCalculatorRequests: 0,
            todayContactRequests: 0,
            telegramStatus: telegram.validateTelegramEnv()
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
            memory: process.memoryUsage(),
            telegram: telegram.validateTelegramEnv(),
            env: missingEnvVars.length > 0 ? `⚠️ Missing: ${missingEnvVars.join(', ')}` : '✅ OK'
        }
    });
});

// ============================================
// ОБРАБОТКА ОШИБОК
// ============================================

// 404 - Not Found
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Страница не найдена'
    });
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Ошибка сервера:', err);
    
    res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================
// ЗАПУСК СЕРВЕРА
// ============================================

// Создаем папку для данных, если её нет
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

app.listen(PORT, () => {
    console.log(`
    ========================================
    MakeBot Server v${config.version}
    ========================================
    🚀 Сервер запущен на порту: ${PORT}
    🌐 Доступен по адресу: http://localhost:${PORT}
    📧 Контакт: ${config.contact.email}
    📞 Телефон: ${config.contact.phone}
    📱 Telegram: ${telegram.validateTelegramEnv() ? '✅ Настроен' : '❌ Не настроен'}
    ${missingEnvVars.length > 0 ? `⚠️  Отсутствуют: ${missingEnvVars.join(', ')}` : '✅ Все переменные окружения настроены'}
    ========================================
    `);
});
