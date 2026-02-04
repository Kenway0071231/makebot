/**
 * MakeBot Backend Server
 * Версия 2.2 (без Telegram) - ИСПРАВЛЕННЫЙ
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// КОНФИГУРАЦИЯ
// ============================================
const config = {
    name: 'MakeBot API',
    version: '2.2.0',
    contact: {
        email: 'support@makebot.shop',
        phone: '+7 (925) 151-58-31',
        adminEmail: process.env.ADMIN_EMAIL || 'Denis.Kenway@yandex.ru'
    }
};

// ============================================
// НАСТРОЙКА ПОЧТЫ (ИСПРАВЛЕННЫЙ)
// ============================================
function createEmailTransporter() {
    try {
        console.log('🔧 Настройка SMTP транспортера...');
        console.log('   Хост:', process.env.SMTP_HOST);
        console.log('   Порт:', process.env.SMTP_PORT);
        console.log('   Пользователь:', process.env.SMTP_USER);
        console.log('   Админ email:', process.env.ADMIN_EMAIL);
        
        // Проверяем наличие всех необходимых переменных
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.ADMIN_EMAIL) {
            console.error('❌ Не все SMTP переменные окружения установлены');
            console.error('   SMTP_USER:', !!process.env.SMTP_USER);
            console.error('   SMTP_PASS:', !!process.env.SMTP_PASS);
            console.error('   ADMIN_EMAIL:', !!process.env.ADMIN_EMAIL);
            return null;
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.mail.ru',
            port: parseInt(process.env.SMTP_PORT) || 465,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        
        // Проверяем подключение
        transporter.verify(function(error, success) {
            if (error) {
                console.error('❌ Ошибка проверки SMTP подключения:', error.message);
            } else {
                console.log('✅ SMTP сервер готов принимать письма');
            }
        });
        
        console.log('✅ SMTP транспортер создан');
        return transporter;
    } catch (error) {
        console.error('❌ Ошибка создания SMTP транспортера:', error.message);
        return null;
    }
}

const emailTransporter = createEmailTransporter();

// Генерация HTML для писем с калькулятора
function generateCalculatorEmail(data) {
    const calculation = data.calculation;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #4361ee, #7209b7); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .section { margin-bottom: 25px; }
        .section-title { color: #4361ee; font-weight: bold; font-size: 18px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #eef2ff; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .info-item { margin-bottom: 12px; }
        .info-label { font-weight: bold; color: #666; font-size: 14px; }
        .calculation-box { background: white; padding: 20px; border-radius: 8px; border: 2px solid #eef2ff; margin: 20px 0; }
        .price { font-size: 32px; font-weight: bold; color: #4361ee; text-align: center; margin: 20px 0; }
        .timeline { background: #eef2ff; padding: 15px; border-radius: 8px; }
        .timeline-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #d1d9ff; }
        .timeline-item:last-child { border-bottom: none; }
        .comment { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffc107; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Новая заявка с калькулятора</h1>
        <p>ID: #${data.id} | ${new Date(data.timestamp).toLocaleString('ru-RU')}</p>
    </div>
    
    <div class="content">
        <!-- Контактная информация -->
        <div class="section">
            <div class="section-title">👤 Контактная информация</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Имя:</div>
                    <div>${data.name}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Телефон:</div>
                    <div>${data.phone}</div>
                </div>
                ${data.email ? `
                <div class="info-item">
                    <div class="info-label">Email:</div>
                    <div>${data.email}</div>
                </div>
                ` : ''}
                <div class="info-item">
                    <div class="info-label">IP:</div>
                    <div>${data.ip}</div>
                </div>
            </div>
        </div>
        
        <!-- Комментарий -->
        ${data.comment ? `
        <div class="section">
            <div class="section-title">💬 Комментарий клиента</div>
            <div class="comment">
                ${data.comment}
            </div>
        </div>
        ` : ''}
        
        <!-- Расчет -->
        <div class="section">
            <div class="section-title">📊 Расчет стоимости</div>
            <div class="calculation-box">
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Тип проекта:</div>
                        <div>${calculation.projectType}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Платформы:</div>
                        <div>${calculation.platforms}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Интеграции:</div>
                        <div>${calculation.integrations}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Сложность:</div>
                        <div>${calculation.complexity}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Срочность:</div>
                        <div>${calculation.deadline}</div>
                    </div>
                </div>
                
                <div class="price">
                    ${calculation.totalPrice.toLocaleString('ru-RU')} ₽
                </div>
                
                <div style="text-align: center; color: #666; margin-bottom: 20px;">
                    Диапазон: ${calculation.minPrice.toLocaleString('ru-RU')} – ${calculation.maxPrice.toLocaleString('ru-RU')} ₽
                </div>
                
                <div class="timeline">
                    <div class="section-title" style="font-size: 16px; margin-top: 0;">📅 Сроки разработки</div>
                    <div class="timeline-item">
                        <span>Проектирование:</span>
                        <strong>${calculation.timeline.planning}</strong>
                    </div>
                    <div class="timeline-item">
                        <span>Разработка:</span>
                        <strong>${calculation.timeline.development}</strong>
                    </div>
                    <div class="timeline-item">
                        <span>Тестирование:</span>
                        <strong>${calculation.timeline.testing}</strong>
                    </div>
                    <div class="timeline-item" style="border-top: 2px solid #4361ee; padding-top: 15px; margin-top: 10px; font-weight: bold;">
                        <span>Общий срок:</span>
                        <span style="color: #4361ee;">${calculation.timeline.total}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Футер -->
        <div class="footer">
            <p>📧 Это автоматическое письмо с сайта MakeBot</p>
            <p>🕐 ${new Date(data.timestamp).toLocaleString('ru-RU')}</p>
            <p>📍 IP: ${data.ip}</p>
        </div>
    </div>
</body>
</html>
    `;
}

// Генерация HTML для контактных заявок
function generateContactEmail(data) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #4361ee, #7209b7); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .section { margin-bottom: 25px; }
        .section-title { color: #4361ee; font-weight: bold; font-size: 18px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #eef2ff; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .info-item { margin-bottom: 12px; }
        .info-label { font-weight: bold; color: #666; font-size: 14px; }
        .message { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffc107; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📞 Новая контактная заявка</h1>
        <p>ID: #${data.id} | ${new Date(data.timestamp).toLocaleString('ru-RU')}</p>
    </div>
    
    <div class="content">
        <!-- Контактная информация -->
        <div class="section">
            <div class="section-title">👤 Контактная информация</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Имя:</div>
                    <div>${data.name}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Телефон:</div>
                    <div>${data.phone}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">IP:</div>
                    <div>${data.ip}</div>
                </div>
            </div>
        </div>
        
        <!-- Сообщение -->
        ${data.message ? `
        <div class="section">
            <div class="section-title">💬 Сообщение клиента</div>
            <div class="message">
                ${data.message}
            </div>
        </div>
        ` : ''}
        
        <!-- Футер -->
        <div class="footer">
            <p>📧 Это автоматическое письмо с сайта MakeBot</p>
            <p>🕐 ${new Date(data.timestamp).toLocaleString('ru-RU')}</p>
            <p>📍 IP: ${data.ip}</p>
            <p>🌐 User-Agent: ${(data.userAgent || '').substring(0, 100)}</p>
        </div>
    </div>
</body>
</html>
    `;
}

// Отправка email (ИСПРАВЛЕННАЯ)
async function sendEmail(subject, html, text) {
    if (!emailTransporter) {
        console.warn('⚠️ SMTP транспортер не настроен, письмо не отправлено');
        return { success: false, error: 'SMTP не настроен' };
    }
    
    try {
        console.log('📤 Отправка письма...');
        console.log('   От:', process.env.SMTP_USER);
        console.log('   Кому:', process.env.ADMIN_EMAIL);
        console.log('   Тема:', subject);
        
        const mailOptions = {
            from: `"MakeBot" <${process.env.SMTP_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: subject,
            html: html,
            text: text || html.replace(/<[^>]*>/g, '')
        };
        
        const info = await emailTransporter.sendMail(mailOptions);
        console.log(`✅ Письмо отправлено: ${info.messageId}`);
        console.log(`   Ответ сервера: ${info.response}`);
        
        return { 
            success: true, 
            messageId: info.messageId,
            details: info
        };
        
    } catch (error) {
        console.error('❌ Ошибка отправки письма:', error.message);
        console.error('   Код ошибки:', error.code);
        console.error('   Команда:', error.command);
        return { 
            success: false, 
            error: error.message,
            code: error.code
        };
    }
}

// ============================================
// ПРОВЕРКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ (ИСПРАВЛЕННАЯ)
// ============================================
const requiredEnvVars = ['SMTP_USER', 'SMTP_PASS', 'ADMIN_EMAIL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.warn('⚠️  ВНИМАНИЕ: отсутствуют переменные окружения:', missingEnvVars);
    console.warn('   Отредактируйте файл .env в папке backend/');
} else {
    console.log('✅ Все переменные окружения найдены');
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
            emailConfigured: emailTransporter !== null
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
        
        // Отправляем email
        let emailResult = null;
        try {
            console.log('📤 Попытка отправки email...');
            const html = generateCalculatorEmail(estimateData);
            const text = `Новая заявка с калькулятора\nИмя: ${name}\nТелефон: ${phone}\nEmail: ${email || 'Не указан'}\nПроект: ${calculation.projectType}`;
            
            emailResult = await sendEmail(`🚀 Новая заявка с калькулятора #${estimateData.id}`, html, text);
            
            if (emailResult.success) {
                console.log(`✅ Заявка с калькулятора #${estimateData.id} отправлена на email`);
            } else {
                console.error('❌ Ошибка отправки email:', emailResult.error);
            }
        } catch (emailError) {
            console.error('❌ Исключение при отправке email:', emailError.message);
        }
        
        res.json({
            success: true,
            message: 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.',
            data: {
                requestId: estimateData.id,
                name,
                phone,
                email: email || null,
                emailSent: emailResult?.success || false,
                emailMessage: emailResult?.success ? 'Отправлено на email' : 'Ошибка отправки email'
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
        
        // Отправляем email
        let emailResult = null;
        try {
            console.log('📤 Попытка отправки контактной заявки на email...');
            const html = generateContactEmail(contactData);
            const text = `Новая контактная заявка\nИмя: ${name}\nТелефон: ${phone}\nСообщение: ${message || 'Не указано'}`;
            
            emailResult = await sendEmail(`📞 Новая контактная заявка #${contactData.id}`, html, text);
            
            if (emailResult.success) {
                console.log(`✅ Контактная заявка #${contactData.id} отправлена на email`);
            } else {
                console.error('❌ Ошибка отправки контактной заявки на email:', emailResult.error);
            }
        } catch (emailError) {
            console.error('❌ Исключение при отправке контактной заявки на email:', emailError.message);
        }
        
        res.json({
            success: true,
            message: 'Заявка успешно отправлена! Мы свяжемся с вами в течение 30 минут.',
            data: {
                contactId: contactData.id,
                name,
                phone,
                emailSent: emailResult?.success || false,
                emailMessage: emailResult?.success ? 'Отправлено на email' : 'Ошибка отправки email'
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

// Тестовый endpoint для проверки почты
app.get('/api/test/email', async (req, res) => {
    try {
        console.log('🔧 Тестирование email отправки...');
        
        if (!emailTransporter) {
            return res.json({
                success: false,
                message: 'Email не настроен',
                env: {
                    smtpUser: process.env.SMTP_USER ? 'Есть' : 'Нет',
                    adminEmail: process.env.ADMIN_EMAIL ? 'Есть' : 'Нет'
                }
            });
        }
        
        const html = `
            <h1>Тестовое письмо от MakeBot</h1>
            <p>Это тестовое письмо отправлено ${new Date().toLocaleString('ru-RU')}</p>
            <p>Если вы получили это письмо, значит SMTP настроен правильно.</p>
            <p><strong>Настройки SMTP:</strong></p>
            <ul>
                <li>Хост: ${process.env.SMTP_HOST}</li>
                <li>Порт: ${process.env.SMTP_PORT}</li>
                <li>Пользователь: ${process.env.SMTP_USER}</li>
                <li>Получатель: ${process.env.ADMIN_EMAIL}</li>
            </ul>
        `;
        
        const result = await sendEmail('🔧 Тестовое письмо от MakeBot', html, 'Тестовое письмо от MakeBot');
        
        res.json({
            success: result.success,
            message: result.success ? 'Тестовое письмо отправлено' : 'Ошибка отправки',
            result: result
        });
        
    } catch (error) {
        console.error('❌ Ошибка тестирования email:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка тестирования email',
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
            emailStatus: emailTransporter !== null
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
            email: emailTransporter !== null,
            env: missingEnvVars.length > 0 ? `⚠️ Missing: ${missingEnvVars.join(', ')}` : '✅ OK',
            endpoints: {
                calculator: '/api/calculator/submit',
                contact: '/api/contact',
                test: '/api/test/email'
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
    📧 Контакт: ${config.contact.email}
    📞 Телефон: ${config.contact.phone}
    📨 Email отправка: ${emailTransporter ? '✅ Настроена' : '❌ Не настроена'}
    ${missingEnvVars.length > 0 ? `⚠️  Отсутствуют: ${missingEnvVars.join(', ')}` : '✅ Все переменные окружения настроены'}
    ========================================
    `);
    
    // Выводим доступные endpoint'ы
    console.log('\n📡 Доступные API endpoints:');
    console.log('   GET  /api/info           - информация о сервере');
    console.log('   GET  /api/health         - проверка здоровья');
    console.log('   GET  /api/stats          - статистика заявок');
    console.log('   GET  /api/test/email     - тест email отправки');
    console.log('   POST /api/calculator/submit - отправка заявки с калькулятора');
    console.log('   POST /api/contact        - отправка контактной формы');
    console.log('   GET  /                   - главная страница сайта');
});
