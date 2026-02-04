/**
 * MakeBot Backend Server
 * Версия 1.0
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// КОНФИГУРАЦИЯ
// ============================================
const config = {
    name: 'MakeBot API',
    version: '1.0.0',
    contact: {
        email: 'info@makebot.ru',
        phone: '+7 (XXX) XXX-XX-XX'
    }
};

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
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
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
            contact: config.contact
        }
    });
});

// Обработка заявок с калькулятора
app.post('/api/calculator/estimate', (req, res) => {
    try {
        const { answers, totalPrice, contactInfo } = req.body;
        
        if (!answers || !totalPrice) {
            return res.status(400).json({
                success: false,
                message: 'Недостаточно данных для расчета'
            });
        }
        
        // Сохраняем данные в лог (в реальном проекте - в базу данных)
        const estimateData = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            answers,
            totalPrice,
            contactInfo,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        };
        
        // Сохраняем в файл (для демонстрации)
        const logPath = path.join(__dirname, 'data', 'estimates.json');
        const estimates = fs.existsSync(logPath) 
            ? JSON.parse(fs.readFileSync(logPath, 'utf8'))
            : [];
        
        estimates.push(estimateData);
        fs.writeFileSync(logPath, JSON.stringify(estimates, null, 2));
        
        // В реальном проекте здесь будет отправка email или в CRM
        console.log('Новая заявка с калькулятора:', estimateData);
        
        res.json({
            success: true,
            message: 'Расчет успешно сохранен',
            data: {
                estimateId: estimateData.id,
                totalPrice,
                contactInfo
            }
        });
        
    } catch (error) {
        console.error('Ошибка при обработке расчета:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при обработке расчета'
        });
    }
});

// Обработка контактной формы
app.post('/api/contact', (req, res) => {
    try {
        const { name, phone, privacyPolicy } = req.body;
        
        // Валидация
        if (!name || !phone || !privacyPolicy) {
            return res.status(400).json({
                success: false,
                message: 'Пожалуйста, заполните обязательные поля и подтвердите согласие'
            });
        }
        
        // Сохраняем данные (в реальном проекте - в базу данных)
        const contactData = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            name,
            phone,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        };
        
        // Сохраняем в файл (для демонстрации)
        const logPath = path.join(__dirname, 'data', 'contacts.json');
        const contacts = fs.existsSync(logPath) 
            ? JSON.parse(fs.readFileSync(logPath, 'utf8'))
            : [];
        
        contacts.push(contactData);
        fs.writeFileSync(logPath, JSON.stringify(contacts, null, 2));
        
        // Имитация отправки email
        console.log('Новая заявка:', contactData);
        
        res.json({
            success: true,
            message: 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.',
            data: {
                contactId: contactData.id,
                name,
                phone
            }
        });
        
    } catch (error) {
        console.error('Ошибка при обработке заявки:', error);
        res.status(500).json({
            success: false,
            message: 'Произошла ошибка при отправке заявки. Пожалуйста, попробуйте еще раз.'
        });
    }
});

// Получение статистики (для админки)
app.get('/api/stats', (req, res) => {
    try {
        // В реальном проекте здесь будет запрос к базе данных
        const stats = {
            totalEstimates: 0,
            totalContacts: 0,
            todayEstimates: 0,
            todayContacts: 0
        };
        
        // Чтение из файлов (для демонстрации)
        const estimatesPath = path.join(__dirname, 'data', 'estimates.json');
        const contactsPath = path.join(__dirname, 'data', 'contacts.json');
        
        if (fs.existsSync(estimatesPath)) {
            const estimates = JSON.parse(fs.readFileSync(estimatesPath, 'utf8'));
            stats.totalEstimates = estimates.length;
            
            // Подсчет за сегодня
            const today = new Date().toISOString().split('T')[0];
            stats.todayEstimates = estimates.filter(e => 
                e.timestamp.split('T')[0] === today
            ).length;
        }
        
        if (fs.existsSync(contactsPath)) {
            const contacts = JSON.parse(fs.readFileSync(contactsPath, 'utf8'));
            stats.totalContacts = contacts.length;
            
            // Подсчет за сегодня
            const today = new Date().toISOString().split('T')[0];
            stats.todayContacts = contacts.filter(c => 
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
            memory: process.memoryUsage()
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

app.listen(PORT, () => {
    console.log(`
    ========================================
    MakeBot Server v${config.version}
    ========================================
    🚀 Сервер запущен на порту: ${PORT}
    🌐 Доступен по адресу: http://localhost:${PORT}
    📧 Контакт: ${config.contact.email}
    📞 Телефон: ${config.contact.phone}
    ========================================
    `);
});
