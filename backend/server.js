/**
 * MakeBot Backend Server
 * Версия 2.2 - Только Email уведомления
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
    email: {
        from: 'MakeBot <Denis.Kenway@yandex.ru>',
        to: 'Denis.Kenway@yandex.ru',
        smtp: {
            host: 'smtp.yandex.ru',
            port: 465,
            secure: true,
            auth: {
                user: 'Denis.Kenway@yandex.ru',
                pass: 'Deniska040406'
            }
        }
    }
};

// ============================================
// НАСТРОЙКА EMAIL ТРАНСПОРТА
// ============================================
const emailTransporter = nodemailer.createTransport(config.email.smtp);

// Проверка email подключения
emailTransporter.verify((error, success) => {
    if (error) {
        console.error('❌ Ошибка SMTP подключения:', error.message);
        console.log('⚠️  Email уведомления могут не работать');
    } else {
        console.log('✅ SMTP подключение успешно');
    }
});

// ============================================
// ФУНКЦИИ
// ============================================

// Функция отправки email уведомления
async function sendEmailNotification(data, type = 'calculator') {
    try {
        console.log(`📧 Отправка email уведомления (тип: ${type})`);
        
        let subject, html;
        
        if (type === 'calculator') {
            const calculation = data.calculation;
            subject = `🚀 Новая заявка с калькулятора: ${data.name}`;
            html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .header { background: linear-gradient(135deg, #4361ee, #7209b7); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
                        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; }
                        .section { margin-bottom: 15px; }
                        .section-title { color: #4361ee; font-weight: bold; margin-bottom: 10px; }
                        .info-item { margin-bottom: 8px; }
                        .info-label { font-weight: bold; color: #666; font-size: 14px; }
                        .price { font-size: 28px; font-weight: bold; color: #4361ee; text-align: center; margin: 15px 0; }
                        .footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>🚀 Новая заявка с калькулятора</h2>
                        <p>ID: #${data.id} | ${new Date(data.timestamp).toLocaleString('ru-RU')}</p>
                    </div>
                    
                    <div class="content">
                        <div class="section">
                            <div class="section-title">👤 Контактная информация</div>
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
                        
                        ${data.comment ? `
                        <div class="section">
                            <div class="section-title">💬 Комментарий</div>
                            <div style="background: #fff3cd; padding: 10px; border-radius: 5px; border-left: 4px solid #ffc107;">
                                ${data.comment}
                            </div>
                        </div>
                        ` : ''}
                        
                        <div class="section">
                            <div class="section-title">📊 Расчет стоимости</div>
                            <div style="background: white; padding: 15px; border-radius: 8px; border: 2px solid #eef2ff;">
                                <div class="info-item">
                                    <div class="info-label">Тип проекта:</div>
                                    <div>${calculation.projectType || 'Не указано'}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">Платформы:</div>
                                    <div>${calculation.platforms || 'Не указано'}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">Интеграции:</div>
                                    <div>${calculation.integrations || 'Не указано'}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">Сложность:</div>
                                    <div>${calculation.complexity || 'Не указано'}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">Срочность:</div>
                                    <div>${calculation.deadline || 'Не указано'}</div>
                                </div>
                                
                                <div class="price">
                                    ${(calculation.totalPrice || 0).toLocaleString('ru-RU')} ₽
                                </div>
                                
                                <div style="text-align: center; color: #666; margin-bottom: 15px;">
                                    Диапазон: ${(calculation.minPrice || 0).toLocaleString('ru-RU')} – ${(calculation.maxPrice || 0).toLocaleString('ru-RU')} ₽
                                </div>
                                
                                <div style="background: #eef2ff; padding: 10px; border-radius: 8px;">
                                    <div class="section-title" style="font-size: 14px;">📅 Сроки разработки</div>
                                    <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #d1d9ff;">
                                        <span>Проектирование:</span>
                                        <strong>${calculation.timeline?.planning || 'Не указано'}</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #d1d9ff;">
                                        <span>Разработка:</span>
                                        <strong>${calculation.timeline?.development || 'Не указано'}</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                                        <span>Тестирование:</span>
                                        <strong>${calculation.timeline?.testing || 'Не указано'}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p>📧 Это автоматическое письмо с сайта MakeBot</p>
                            <p>🕐 ${new Date(data.timestamp).toLocaleString('ru-RU')}</p>
                            <p>📍 IP: ${data.ip}</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
        } else {
            // Контактная форма
            subject = `📞 Новая контактная заявка: ${data.name}`;
            html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .header { background: linear-gradient(135deg, #4cc9f0, #4361ee); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
                        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; }
                        .section { margin-bottom: 15px; }
                        .section-title { color: #4361ee; font-weight: bold; margin-bottom: 10px; }
                        .info-item { margin-bottom: 8px; }
                        .info-label { font-weight: bold; color: #666; font-size: 14px; }
                        .footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>📞 Новая контактная заявка</h2>
                        <p>ID: #${data.id} | ${new Date(data.timestamp).toLocaleString('ru-RU')}</p>
                    </div>
                    
                    <div class="content">
                        <div class="section">
                            <div class="section-title">👤 Контактная информация</div>
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
                        
                        ${data.message ? `
                        <div class="section">
                            <div class="section-title">💬 Сообщение</div>
                            <div style="background: #fff3cd; padding: 10px; border-radius: 5px; border-left: 4px solid #ffc107;">
                                ${data.message}
                            </div>
                        </div>
                        ` : ''}
                        
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
        
        const mailOptions = {
            from: config.email.from,
            to: config.email.to,
            subject: subject,
            html: html
        };
        
        const info = await emailTransporter.sendMail(mailOptions);
        console.log(`✅ Email отправлен: ${info.messageId}`);
        
        return { success: true, messageId: info.messageId };
        
    } catch (error) {
        console.error('❌ Ошибка отправки email:', error.message);
        return { success: false, error: error.message };
    }
}

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Статические файлы
app.use(express.static(path.join(__dirname, '../frontend')));

// Логирование
app.use((req, res, next) => {
    console.log(`${new Date().toLocaleString('ru-RU')} - ${req.method} ${req.url} - IP: ${req.ip}`);
    next();
});

// ============================================
// МАРШРУТЫ API
// ============================================

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Проверка здоровья
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'MakeBot API работает',
        version: config.version,
        timestamp: new Date().toISOString(),
        emailConfigured: true
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
                message: 'Пожалуйста, заполните все обязательные поля'
            });
        }
        
        // Подготовка данных
        const estimateData = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            name: name.trim(),
            phone: phone.trim(),
            email: email ? email.trim() : null,
            comment: comment ? comment.trim() : null,
            calculation: calculation,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
        };
        
        console.log(`📊 Данные заявки: ${estimateData.name}, ${estimateData.phone}`);
        
        // Сохраняем в файл (просто для истории)
        const logPath = path.join(__dirname, 'data', 'calculator_requests.json');
        const requests = fs.existsSync(logPath) 
            ? JSON.parse(fs.readFileSync(logPath, 'utf8'))
            : [];
        
        requests.push(estimateData);
        fs.writeFileSync(logPath, JSON.stringify(requests, null, 2));
        
        // Отправляем email
        const emailResult = await sendEmailNotification(estimateData, 'calculator');
        
        if (emailResult.success) {
            console.log(`✅ Заявка #${estimateData.id} отправлена на email`);
        } else {
            console.log(`⚠️  Заявка сохранена, но email не отправлен: ${emailResult.error}`);
            // Продолжаем выполнение, даже если email не отправился
        }
        
        // Всегда возвращаем успех пользователю
        res.json({
            success: true,
            message: 'Спасибо! Ваша заявка принята. Мы свяжемся с вами в течение 30 минут.',
            data: {
                requestId: estimateData.id,
                name: estimateData.name,
                phone: estimateData.phone,
                emailSent: emailResult.success
            }
        });
        
    } catch (error) {
        console.error('❌ Ошибка при обработке заявки:', error);
        
        // Даже при ошибке возвращаем успех пользователю
        res.json({
            success: true,
            message: 'Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.',
            data: {
                requestId: Date.now()
            }
        });
    }
});

// Обработка контактной формы
app.post('/api/contact', async (req, res) => {
    try {
        console.log('📝 Получена контактная заявка');
        
        const { name, phone, message } = req.body;
        
        // Валидация
        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Пожалуйста, заполните все обязательные поля'
            });
        }
        
        // Подготовка данных
        const contactData = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            name: name.trim(),
            phone: phone.trim(),
            message: message ? message.trim() : null,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
        };
        
        console.log(`📊 Контактные данные: ${contactData.name}, ${contactData.phone}`);
        
        // Сохраняем в файл
        const logPath = path.join(__dirname, 'data', 'contact_requests.json');
        const contacts = fs.existsSync(logPath) 
            ? JSON.parse(fs.readFileSync(logPath, 'utf8'))
            : [];
        
        contacts.push(contactData);
        fs.writeFileSync(logPath, JSON.stringify(contacts, null, 2));
        
        // Отправляем email
        const emailResult = await sendEmailNotification(contactData, 'contact');
        
        if (emailResult.success) {
            console.log(`✅ Контактная заявка #${contactData.id} отправлена на email`);
        } else {
            console.log(`⚠️  Заявка сохранена, но email не отправлен: ${emailResult.error}`);
        }
        
        // Всегда возвращаем успех пользователю
        res.json({
            success: true,
            message: 'Спасибо! Ваша заявка принята. Мы свяжемся с вами в течение 30 минут.',
            data: {
                contactId: contactData.id,
                name: contactData.name,
                phone: contactData.phone,
                emailSent: emailResult.success
            }
        });
        
    } catch (error) {
        console.error('❌ Ошибка при обработке контактной формы:', error);
        
        // Даже при ошибке возвращаем успех пользователю
        res.json({
            success: true,
            message: 'Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.',
            data: {
                contactId: Date.now()
            }
        });
    }
});

// Простой endpoint для тестирования email
app.post('/api/test-email', async (req, res) => {
    try {
        console.log('🔧 Тестирование email отправки...');
        
        const testData = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            name: 'Тестовый пользователь',
            phone: '+7 (999) 999-99-99',
            email: 'test@example.com',
            ip: '127.0.0.1',
            calculation: {
                projectType: 'Тестовый проект',
                platforms: 'Telegram, WhatsApp',
                integrations: 'CRM, онлайн-оплата',
                complexity: 'Средняя',
                deadline: 'Стандартные сроки',
                totalPrice: 10000,
                minPrice: 8500,
                maxPrice: 11500,
                timeline: {
                    planning: '3-5 дней',
                    development: '7-14 дней',
                    testing: '2-3 дня',
                    total: '12-22 дня'
                }
            }
        };
        
        const result = await sendEmailNotification(testData, 'calculator');
        
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

// ============================================
// ОБРАБОТКА ОШИБОК
// ============================================

// 404
app.use((req, res) => {
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(404).json({
            success: false,
            message: 'API endpoint не найден'
        });
    }
    res.status(404).sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('❌ Ошибка сервера:', err.message);
    
    res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

// Создаем папку для данных
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('📁 Создана папка для данных');
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

// ============================================
// ЗАПУСК СЕРВЕРА
// ============================================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    ========================================
    MakeBot Server v${config.version}
    ========================================
    🚀 Сервер запущен на порту: ${PORT}
    🌐 Доступен по адресу: http://0.0.0.0:${PORT}
    📧 Email уведомления: ${config.email.to}
    📞 Телефон: +7 (925) 151-58-31
    ========================================
    
    📡 API endpoints:
       GET  /api/health           - проверка здоровья
       POST /api/calculator/submit - заявка с калькулятора
       POST /api/contact           - контактная форма
       POST /api/test-email        - тест email отправки
    ========================================
    `);
});
