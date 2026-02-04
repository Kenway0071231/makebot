/**
 * Конфигурация Telegram бота для отправки заявок
 * Версия 1.0
 */

const axios = require('axios');

// Проверка переменных окружения
function validateTelegramEnv() {
    const required = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'];
    const missing = required.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
        console.warn('⚠️  Отсутствуют переменные Telegram:', missing.join(', '));
        console.warn('   TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? '***' + process.env.TELEGRAM_BOT_TOKEN.slice(-4) : 'НЕТ');
        console.warn('   TELEGRAM_CHAT_ID:', process.env.TELEGRAM_CHAT_ID ? process.env.TELEGRAM_CHAT_ID : 'НЕТ');
        return false;
    }
    
    return true;
}

// Форматирование сообщения для калькулятора
function formatCalculatorMessage(data) {
    const calculation = data.calculation;
    
    let message = `
🚀 *Новая заявка с калькулятора*
────────────────────
*ID:* #${data.id}
*Время:* ${new Date(data.timestamp).toLocaleString('ru-RU')}

👤 *Контактная информация*
Имя: ${data.name}
Телефон: ${data.phone}
${data.email ? `Email: ${data.email}` : ''}
IP: ${data.ip}
`;

    if (data.comment && data.comment.trim()) {
        message += `
💬 *Комментарий клиента*
${data.comment}
────────────────────
`;
    }

    message += `
📊 *Расчет стоимости*
Тип проекта: ${calculation.projectType || 'Не указано'}
Платформы: ${calculation.platforms || 'Не указано'}
Интеграции: ${calculation.integrations || 'Не указано'}
Сложность: ${calculation.complexity || 'Не указано'}
Срочность: ${calculation.deadline || 'Не указано'}

💰 *Стоимость*
${(calculation.totalPrice || 0).toLocaleString('ru-RU')} ₽
Диапазон: ${(calculation.minPrice || 0).toLocaleString('ru-RU')} – ${(calculation.maxPrice || 0).toLocaleString('ru-RU')} ₽
`;

    if (calculation.timeline) {
        message += `
📅 *Сроки разработки*
Проектирование: ${calculation.timeline.planning || 'Не указано'}
Разработка: ${calculation.timeline.development || 'Не указано'}
Тестирование: ${calculation.timeline.testing || 'Не указано'}
────────────────────
*Общий срок:* ${calculation.timeline.total || 'Не указано'}
────────────────────
`;
    }

    message += `🕐 ${new Date(data.timestamp).toLocaleString('ru-RU')}
📍 IP: ${data.ip}`;
    
    return message.trim();
}

// Форматирование сообщения для контактной формы
function formatContactMessage(data) {
    let message = `
📞 *Новая контактная заявка*
────────────────────
*ID:* #${data.id}
*Время:* ${new Date(data.timestamp).toLocaleString('ru-RU')}

👤 *Контактная информация*
Имя: ${data.name}
Телефон: ${data.phone}
IP: ${data.ip}
`;

    if (data.message && data.message.trim()) {
        message += `
💬 *Сообщение*
${data.message}
────────────────────
`;
    }

    message += `
🕐 ${new Date(data.timestamp).toLocaleString('ru-RU')}
📍 IP: ${data.ip}
🌐 User-Agent: ${(data.userAgent || '').substring(0, 50)}...
`;
    
    return message.trim();
}

// Отправка сообщения в Telegram
async function sendToTelegram(message, type = 'calculator') {
    if (!validateTelegramEnv()) {
        console.warn('⚠️  Telegram не настроен, сообщение не отправлено');
        return { success: false, error: 'Telegram не настроен' };
    }

    try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN.trim();
        const chatId = process.env.TELEGRAM_CHAT_ID.trim();
        
        console.log(`📤 Отправка сообщения в Telegram (тип: ${type})`);
        console.log(`🤖 Токен: ${botToken.substring(0, 5)}...${botToken.substring(botToken.length - 4)}`);
        console.log(`💬 Chat ID: ${chatId}`);
        
        // Обрезаем длинные сообщения (ограничение Telegram - 4096 символов)
        const maxLength = 4000;
        if (message.length > maxLength) {
            console.log(`⚠️  Сообщение слишком длинное (${message.length} символов), обрезаем...`);
            message = message.substring(0, maxLength) + '...\n\n[Сообщение было обрезано]';
        }
        
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        
        console.log(`🌐 URL: ${url.substring(0, 50)}...`);
        
        const response = await axios.post(url, {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
            disable_notification: false
        }, {
            timeout: 30000, // 30 секунд таймаут
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`✅ Сообщение отправлено в Telegram: ${type} #${response.data.result.message_id}`);
        console.log(`📨 Текст сообщения (первые 200 символов): ${message.substring(0, 200)}...`);
        
        return { 
            success: true, 
            messageId: response.data.result.message_id,
            details: response.data
        };
        
    } catch (error) {
        console.error('❌ Ошибка отправки в Telegram:', error.message);
        
        if (error.response) {
            console.error('📊 Детали ошибки:', JSON.stringify(error.response.data, null, 2));
            console.error('🔧 Статус:', error.response.status);
            console.error('📋 Заголовки:', error.response.headers);
        } else if (error.request) {
            console.error('🌐 Нет ответа от сервера Telegram');
            console.error('Запрос:', error.request);
        } else {
            console.error('⚙️ Ошибка настройки запроса:', error.message);
        }
        
        return { 
            success: false, 
            error: error.message,
            details: error.response?.data,
            code: error.code
        };
    }
}

// Отправка заявки с калькулятора
async function sendCalculatorRequest(data) {
    console.log('📤 Отправка заявки калькулятора в Telegram...');
    const message = formatCalculatorMessage(data);
    console.log(`📝 Сообщение сформировано (${message.length} символов)`);
    return await sendToTelegram(message, 'calculator');
}

// Отправка контактной заявки
async function sendContactRequest(data) {
    console.log('📤 Отправка контактной заявки в Telegram...');
    const message = formatContactMessage(data);
    console.log(`📝 Сообщение сформировано (${message.length} символов)`);
    return await sendToTelegram(message, 'contact');
}

module.exports = {
    validateTelegramEnv,
    sendCalculatorRequest,
    sendContactRequest,
    formatCalculatorMessage,
    formatContactMessage
};
