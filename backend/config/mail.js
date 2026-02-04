/**
 * Конфигурация почтового клиента
 * Версия 1.0
 */

const nodemailer = require('nodemailer');

// Проверка переменных окружения
function validateEnv() {
    const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'ADMIN_EMAIL'];
    const missing = required.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
        console.warn('⚠️  Отсутствуют переменные окружения:', missing.join(', '));
        console.warn('   Создайте файл .env на основе .env.example');
        return false;
    }
    
    return true;
}

// Создание почтового транспорта
function createTransporter() {
    if (!validateEnv()) {
        console.warn('⚠️  SMTP транспорт не создан из-за отсутствия переменных окружения');
        return null;
    }
    
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        
        // Проверка подключения
        transporter.verify((error, success) => {
            if (error) {
                console.error('❌ Ошибка проверки SMTP подключения:', error.message);
            } else {
                console.log('✅ SMTP подключение успешно проверено');
            }
        });
        
        return transporter;
        
    } catch (error) {
        console.error('❌ Ошибка создания SMTP транспорта:', error.message);
        return null;
    }
}

// Генератор HTML для писем
function generateEmailTemplate(type, data) {
    const templates = {
        calculator: require('./templates/calculator-email'),
        contact: require('./templates/contact-email'),
        client: require('./templates/client-email')
    };
    
    const template = templates[type];
    return template ? template(data) : null;
}

module.exports = {
    validateEnv,
    createTransporter,
    generateEmailTemplate
};
