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
        return false;
    }
    
    return true;
}

// Форматирование сообщения для калькулятора
function formatCalculatorMessage(data) {
    const calculation = data.calculation;
    
    return `
🚀 *Новая заявка с калькулятора*
────────────────────
*ID:* #${data.id}
*Время:* ${new Date(data.timestamp).toLocaleString('ru-RU')}

👤 *Контактная информация*
Имя: ${data.name}
Телефон: ${data.phone}
${data.email ? `Email: ${data.email}` : ''}
IP: ${data.ip}

${data.comment ? `💬 *Комментарий клиента*
${data.comment}
────────────────────
` : ''}

📊 *Расчет стоимости*
Тип проекта: ${calculation.projectType}
Платформы: ${calculation.platforms}
Интеграции: ${calculation.integrations}
Сложность: ${calculation.complexity}
Срочность: ${calculation.deadline}

💰 *Стоимость*
${calculation.totalPrice.toLocaleString('ru-RU')} ₽
Диапазон: ${calculation.minPrice.toLocaleString('ru-RU')} – ${calculation.maxPrice.toLocaleString('ru-RU')} ₽

📅 *Сроки разработки*
Проектирование: ${calculation.timeline.planning}
Разработка: ${calculation.timeline.development}
Тестирование: ${calculation.timeline.testing}
────────────────────
*Общий срок:* ${calculation.timeline.total}
────────────────────
🕐 ${new Date(data.timestamp).toLocaleString('ru-RU')}
📍 IP: ${data.ip}
`.trim();
}

// Форматирование сообщения для контактной формы
function formatContactMessage(data) {
    return `
📞 *Новая контактная заявка*
────────────────────
*ID:* #${data.id}
*Время:* ${new Date(data.timestamp).toLocaleString('ru-RU')}

👤 *Контактная информация*
Имя: ${data.name}
Телефон: ${data.phone}
IP: ${data.ip}

${data.message ? `💬 *Сообщение*
${data.message}
────────────────────
` : ''}

🕐 ${new Date(data.timestamp).toLocaleString('ru-RU')}
📍 IP: ${data.ip}
🌐 User-Agent: ${data.userAgent?.substring(0, 50)}...
`.trim();
}

// Отправка сообщения в Telegram
async function sendToTelegram(message, type = 'calculator') {
    if (!validateTelegramEnv()) {
        console.warn('⚠️  Telegram не настроен, сообщение не отправлено');
        return { success: false, error: 'Telegram не настроен' };
    }

    try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        
        // Проверка формата токена и chat_id
        if (!botToken || botToken.length < 30) {
            console.error('❌ Некорректный токен Telegram бота');
            return { success: false, error: 'Некорректный токен Telegram бота' };
        }
        
        if (!chatId || isNaN(parseInt(chatId))) {
            console.error('❌ Некорректный Chat ID');
            return { success: false, error: 'Некорректный Chat ID' };
        }
        
        // Обрезаем длинные сообщения (ограничение Telegram - 4096 символов)
        const maxLength = 4000;
        if (message.length > maxLength) {
            message = message.substring(0, maxLength) + '...\n\n[Сообщение было обрезано]';
        }
        
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        
        console.log(`📤 Отправка сообщения в Telegram: ${url.substring(0, 60)}...`);
        console.log(`📝 Chat ID: ${chatId}`);
        
        const response = await axios.post(url, {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        }, {
            timeout: 10000, // 10 секунд таймаут
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`✅ Сообщение отправлено в Telegram: ${type} #${response.data.result.message_id}`);
        return { success: true, messageId: response.data.result.message_id };
        
    } catch (error) {
        console.error('❌ Ошибка отправки в Telegram:', error.message);
        
        if (error.response) {
            console.error('Детали ошибки:', JSON.stringify(error.response.data, null, 2));
            
            // Проверка конкретных ошибок
            if (error.response.data.description === 'Forbidden: bot was blocked by the user') {
                console.error('❌ Бот заблокирован пользователем');
            } else if (error.response.data.description === 'Bad Request: chat not found') {
                console.error('❌ Чат не найден. Проверьте Chat ID');
            } else if (error.response.data.description.includes('invalid token')) {
                console.error('❌ Неверный токен бота');
            }
        } else if (error.request) {
            console.error('Нет ответа от сервера Telegram. Проверьте подключение к интернету');
        }
        
        return { 
            success: false, 
            error: error.message,
            details: error.response?.data 
        };
    }
}

// Отправка заявки с калькулятора
async function sendCalculatorRequest(data) {
    console.log('📤 Отправка заявки калькулятора в Telegram...');
    const message = formatCalculatorMessage(data);
    return await sendToTelegram(message, 'calculator');
}

// Отправка контактной заявки
async function sendContactRequest(data) {
    console.log('📤 Отправка контактной заявки в Telegram...');
    const message = formatContactMessage(data);
    return await sendToTelegram(message, 'contact');
}

module.exports = {
    validateTelegramEnv,
    sendCalculatorRequest,
    sendContactRequest,
    formatCalculatorMessage,
    formatContactMessage
};
