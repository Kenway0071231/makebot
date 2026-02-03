cat > backend/server.js << 'EOF'
/**
 * MakeBot Backend Server
 * Версия 2.0
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
    version: '2.0.0',
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
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${req.ip}`);
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
            uptime: process.uptime()
        }
    });
});

// Обработка контактной формы
app.post('/api/contact', (req, res) => {
    try {
        const { name, phone, message } = req.body;
        
        // Валидация
        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Пожалуйста, заполните обязательные поля'
            });
        }
        
        // Проверка формата телефона
        const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Неверный формат телефона'
            });
        }
        
        // Сохраняем данные
        const contactData = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            name,
            phone,
            message: message || 'Не указано',
            ip: req.ip,
            userAgent: req.get('User-Agent')
        };
        
        // Сохраняем в файл
        const logPath = path.join(__dirname, 'data', 'contacts.json');
        const contacts = fs.existsSync(logPath) 
            ? JSON.parse(fs.readFileSync(logPath, 'utf8'))
            : [];
        
        contacts.push(contactData);
        fs.writeFileSync(logPath, JSON.stringify(contacts, null, 2));
        
        // Логируем в консоль
        console.log('Новая заявка:', {
            id: contactData.id,
            name: contactData.name,
            phone: contactData.phone,
            time: contactData.timestamp
        });
        
        // Здесь можно добавить отправку email, уведомление в Telegram и т.д.
        
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

// Получение статистики
app.get('/api/stats', (req, res) => {
    try {
        const stats = {
            totalContacts: 0,
            todayContacts: 0,
            serverUptime: process.uptime(),
            memoryUsage: process.memoryUsage()
        };
        
        // Чтение контактов
        const contactsPath = path.join(__dirname, 'data', 'contacts.json');
        
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

// Экспорт данных (только для администратора)
app.get('/api/export/contacts', (req, res) => {
    // Простая проверка авторизации (в реальном проекте нужна нормальная авторизация)
    const authToken = req.headers['x-auth-token'];
    
    if (!authToken || authToken !== process.env.ADMIN_TOKEN) {
        return res.status(403).json({
            success: false,
            message: 'Доступ запрещен'
        });
    }
    
    try {
        const contactsPath = path.join(__dirname, 'data', 'contacts.json');
        let data = [];
        
        if (fs.existsSync(contactsPath)) {
            data = JSON.parse(fs.readFileSync(contactsPath, 'utf8'));
        }
        
        // Устанавливаем заголовки для скачивания файла
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="contacts_${Date.now()}.json"`);
        
        res.send(JSON.stringify(data, null, 2));
        
    } catch (error) {
        console.error('Ошибка при экспорте данных:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при экспорте данных'
        });
    }
});

// Проверка здоровья сервера
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: config.version
        }
    });
});

// Страница политики конфиденциальности
app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/privacy.html'));
});

// ============================================
// ОБРАБОТКА ОШИБОК
// ============================================

// 404 - Not Found
app.use((req, res) => {
    if (req.accepts('html')) {
        res.status(404).sendFile(path.join(__dirname, '../frontend/404.html'));
    } else if (req.accepts('json')) {
        res.status(404).json({
            success: false,
            message: 'Страница не найдена'
        });
    } else {
        res.status(404).type('txt').send('404 Not Found');
    }
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

// Создаем файл контактов если его нет
const contactsFile = path.join(dataDir, 'contacts.json');
if (!fs.existsSync(contactsFile)) {
    fs.writeFileSync(contactsFile, JSON.stringify([], null, 2));
}

app.listen(PORT, () => {
    console.log(`
    ========================================
    MakeBot Server v${config.version}
    ========================================
    🚀 Сервер запущен на порту: ${PORT}
    🌐 Доступен по адресу: http://localhost:${PORT}
    📧 Контакт: ${config.contact.email}
    📞 Телефон: ${config.contact.contact.phone}
    ========================================
    `);
    
    // Автоматическое открытие в браузере (только для разработки)
    if (process.env.NODE_ENV === 'development') {
        const { exec } = require('child_process');
        const platform = process.platform;
        
        let command;
        if (platform === 'darwin') command = 'open';
        else if (platform === 'win32') command = 'start';
        else command = 'xdg-open';
        
        exec(`${command} http://localhost:${PORT}`);
    }
});

// Обработка завершения работы
process.on('SIGINT', () => {
    console.log('\n🛑 Сервер останавливается...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Сервер получает сигнал завершения...');
    process.exit(0);
});

// Экспорт для тестирования
if (process.env.NODE_ENV === 'test') {
    module.exports = app;
}
EOF
