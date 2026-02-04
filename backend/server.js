/**
 * MakeBot Backend Server
 * Версия 2.0
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
    version: '2.0.0',
    contact: {
        email: 'support@makebot.shop',
        phone: '+7 (925) 151-58-31',
        adminEmail: process.env.ADMIN_EMAIL || 'Denis.Kenway@yandex.ru'
    }
};

// ============================================
// ПРОВЕРКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ
// ============================================
const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'ADMIN_EMAIL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.warn('⚠️  Внимание: отсутствуют переменные окружения:', missingEnvVars);
    console.warn('   Создайте файл .env на основе .env.example');
}

// ============================================
// НАСТРОЙКА ПОЧТОВОГО КЛИЕНТА
// ============================================
let mailTransporter;

try {
    mailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.yandex.ru',
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    // Проверка подключения к SMTP
    mailTransporter.verify((error, success) => {
        if (error) {
            console.error('❌ Ошибка подключения к SMTP:', error.message);
        } else {
            console.log('✅ SMTP подключение успешно установлено');
        }
    });
} catch (error) {
    console.error('❌ Ошибка создания почтового транспорта:', error.message);
    mailTransporter = null;
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
            smtpConfigured: !!mailTransporter
        }
    });
});

// Обработка заявок с калькулятора
app.post('/api/calculator/submit', async (req, res) => {
    try {
        const { name, phone, email, comment, calculation } = req.body;
        
        if (!name || !phone || !calculation) {
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
            ip: req.ip,
            userAgent: req.get('User-Agent')
        };
        
        // Сохраняем в файл
        const logPath = path.join(__dirname, 'data', 'calculator_requests.json');
        const requests = fs.existsSync(logPath) 
            ? JSON.parse(fs.readFileSync(logPath, 'utf8'))
            : [];
        
        requests.push(estimateData);
        fs.writeFileSync(logPath, JSON.stringify(requests, null, 2));
        
        // Отправляем письмо администратору
        if (mailTransporter) {
            try {
                const mailOptions = {
                    from: `"MakeBot" <${process.env.SMTP_USER}>`,
                    to: process.env.ADMIN_EMAIL,
                    subject: `✅ Новая заявка с калькулятора #${estimateData.id}`,
                    html: generateCalculatorEmailHtml(estimateData)
                };
                
                await mailTransporter.sendMail(mailOptions);
                console.log(`📧 Письмо с заявкой #${estimateData.id} отправлено администратору`);
                
                // Отправляем копию клиенту, если указан email
                if (email) {
                    const clientMailOptions = {
                        from: `"MakeBot" <${process.env.SMTP_USER}>`,
                        to: email,
                        subject: `Ваш расчет стоимости от MakeBot`,
                        html: generateClientEmailHtml(estimateData)
                    };
                    
                    await mailTransporter.sendMail(clientMailOptions);
                    console.log(`📧 Копия письма отправлена клиенту: ${email}`);
                }
                
            } catch (mailError) {
                console.error('❌ Ошибка отправки письма:', mailError.message);
                // Не прерываем выполнение, если письмо не отправилось
            }
        } else {
            console.warn('⚠️  SMTP не настроен, письмо не отправлено');
        }
        
        res.json({
            success: true,
            message: 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.',
            data: {
                requestId: estimateData.id,
                name,
                phone,
                email: email || null
            }
        });
        
    } catch (error) {
        console.error('Ошибка при обработке заявки с калькулятора:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при обработке заявки. Пожалуйста, попробуйте еще раз.'
        });
    }
});

// Обработка контактной формы
app.post('/api/contact', async (req, res) => {
    try {
        const { name, phone, message } = req.body;
        
        // Валидация
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
            name,
            phone,
            message: message || null,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        };
        
        // Сохраняем в файл
        const logPath = path.join(__dirname, 'data', 'contact_requests.json');
        const contacts = fs.existsSync(logPath) 
            ? JSON.parse(fs.readFileSync(logPath, 'utf8'))
            : [];
        
        contacts.push(contactData);
        fs.writeFileSync(logPath, JSON.stringify(contacts, null, 2));
        
        // Отправляем письмо администратору
        if (mailTransporter) {
            try {
                const mailOptions = {
                    from: `"MakeBot" <${process.env.SMTP_USER}>`,
                    to: process.env.ADMIN_EMAIL,
                    subject: `📞 Новая контактная заявка #${contactData.id}`,
                    html: generateContactEmailHtml(contactData)
                };
                
                await mailTransporter.sendMail(mailOptions);
                console.log(`📧 Письмо с контактной заявкой #${contactData.id} отправлено администратору`);
                
            } catch (mailError) {
                console.error('❌ Ошибка отправки письма:', mailError.message);
            }
        }
        
        res.json({
            success: true,
            message: 'Заявка успешно отправлена! Мы свяжемся с вами в течение 30 минут.',
            data: {
                contactId: contactData.id,
                name,
                phone
            }
        });
        
    } catch (error) {
        console.error('Ошибка при обработке контактной формы:', error);
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
            smtpStatus: !!mailTransporter
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
            smtp: !!mailTransporter,
            env: missingEnvVars.length > 0 ? `⚠️ Missing: ${missingEnvVars.join(', ')}` : '✅ OK'
        }
    });
});

// ============================================
// ГЕНЕРАТОРЫ HTML ДЛЯ ПИСЕМ
// ============================================

function generateCalculatorEmailHtml(data) {
    const calculation = data.calculation;
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Новая заявка с калькулятора #${data.id}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4361ee; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
        .section { margin-bottom: 20px; }
        .section-title { color: #4361ee; font-weight: bold; margin-bottom: 10px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .info-item { margin-bottom: 8px; }
        .info-label { font-weight: bold; color: #666; }
        .calculation { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #4361ee; }
        .price { font-size: 24px; font-weight: bold; color: #4361ee; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Новая заявка с калькулятора</h1>
            <p>ID: #${data.id} | ${new Date(data.timestamp).toLocaleString('ru-RU')}</p>
        </div>
        
        <div class="content">
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
                        <div class="info-label">Email:</div>
                        <div>${data.email || 'Не указан'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">IP:</div>
                        <div>${data.ip}</div>
                    </div>
                </div>
            </div>
            
            ${data.comment ? `
            <div class="section">
                <div class="section-title">💬 Комментарий клиента</div>
                <div style="background: #fff3cd; padding: 10px; border-radius: 5px; border-left: 4px solid #ffc107;">
                    ${data.comment}
                </div>
            </div>
            ` : ''}
            
            <div class="section">
                <div class="section-title">📊 Расчет стоимости</div>
                <div class="calculation">
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
                    
                    <div style="margin-top: 20px; text-align: center;">
                        <div class="price">${formatPrice(calculation.totalPrice)} ₽</div>
                        <div>Диапазон: ${formatPrice(calculation.minPrice)} – ${formatPrice(calculation.maxPrice)} ₽</div>
                        <div style="color: #666; margin-top: 5px;">Сроки: ${calculation.timeline.total}</div>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p>📧 Это автоматическое письмо с сайта MakeBot.</p>
                <p>🕐 Время получения: ${new Date(data.timestamp).toLocaleString('ru-RU')}</p>
                <p>📍 IP клиента: ${data.ip} | User-Agent: ${data.userAgent}</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
}

function generateClientEmailHtml(data) {
    const calculation = data.calculation;
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Ваш расчет стоимости от MakeBot</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4361ee, #7209b7); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .section { margin-bottom: 25px; }
        .section-title { color: #4361ee; font-weight: bold; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #4361ee; padding-bottom: 5px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .info-item { margin-bottom: 12px; }
        .info-label { font-weight: bold; color: #666; }
        .calculation { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #eef2ff; }
        .price { font-size: 32px; font-weight: bold; color: #4361ee; text-align: center; margin: 15px 0; }
        .timeline { background: #eef2ff; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .timeline-item { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #d1d9ff; }
        .timeline-item:last-child { border-bottom: none; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; text-align: center; }
        .contact-info { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .btn { display: inline-block; background: #4361ee; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 Спасибо за обращение в MakeBot!</h1>
            <p>Ваш расчет стоимости готов</p>
        </div>
        
        <div class="content">
            <div class="section">
                <div class="section-title">📋 Ваши параметры проекта</div>
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
            </div>
            
            <div class="section">
                <div class="section-title">💰 Расчет стоимости</div>
                <div class="calculation">
                    <div class="price">от ${formatPrice(calculation.totalPrice)} ₽</div>
                    <div style="text-align: center; color: #666; margin-bottom: 20px;">
                        Диапазон: ${formatPrice(calculation.minPrice)} – ${formatPrice(calculation.maxPrice)} ₽
                    </div>
                    
                    <div class="timeline">
                        <div class="section-title">📅 Сроки разработки</div>
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
                        <div class="timeline-item" style="border-top: 2px solid #4361ee; padding-top: 10px; margin-top: 10px;">
                            <span><strong>Общий срок:</strong></span>
                            <strong style="color: #4361ee;">${calculation.timeline.total}</strong>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-info">
                <div class="section-title">📞 Свяжитесь с нами</div>
                <p>Наш менеджер свяжется с вами в течение 30 минут для уточнения деталей и подготовки окончательного предложения.</p>
                <p><strong>Телефон:</strong> +7 (925) 151-58-31</p>
                <p><strong>Email:</strong> support@makebot.shop</p>
                <div style="text-align: center; margin-top: 20px;">
                    <a href="tel:+79251515831" class="btn">📞 Позвонить сейчас</a>
                </div>
            </div>
            
            <div class="footer">
                <p>С уважением, команда MakeBot 🤖</p>
                <p>Создаем будущее автоматизации бизнеса</p>
                <p>📍 ID заявки: #${data.id}</p>
                <p>🕐 ${new Date(data.timestamp).toLocaleString('ru-RU')}</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
}

function generateContactEmailHtml(data) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Новая контактная заявка #${data.id}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #7209b7; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .info-item { margin-bottom: 15px; }
        .info-label { font-weight: bold; color: #666; }
        .message { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #7209b7; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📞 Новая контактная заявка</h1>
            <p>ID: #${data.id} | ${new Date(data.timestamp).toLocaleString('ru-RU')}</p>
        </div>
        
        <div class="content">
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
                <div class="info-item">
                    <div class="info-label">Время:</div>
                    <div>${new Date(data.timestamp).toLocaleString('ru-RU')}</div>
                </div>
            </div>
            
            ${data.message ? `
            <div class="info-item">
                <div class="info-label">Сообщение:</div>
                <div class="message">${data.message}</div>
            </div>
            ` : '<div class="info-item"><em>Сообщение не указано</em></div>'}
            
            <div class="footer">
                <p>📧 Это автоматическое письмо с сайта MakeBot.</p>
                <p>📍 IP клиента: ${data.ip}</p>
                <p>🌐 User-Agent: ${data.userAgent}</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
}

function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

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
    📨 Админ email: ${config.contact.adminEmail}
    🔐 SMTP: ${mailTransporter ? '✅ Настроен' : '❌ Не настроен'}
    ${missingEnvVars.length > 0 ? `⚠️  Отсутствуют: ${missingEnvVars.join(', ')}` : '✅ Все переменные окружения настроены'}
    ========================================
    `);
});
