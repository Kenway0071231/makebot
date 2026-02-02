const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Маршруты
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// API для приема заявок
app.post('/api/contact', (req, res) => {
    try {
        const { name, phone, email, message } = req.body;
        
        // Здесь должна быть логика сохранения в базу данных
        // Пока просто логируем и возвращаем успех
        console.log('Новая заявка:', { name, phone, email, message });
        
        // В реальном приложении здесь нужно:
        // 1. Сохранить в базу данных
        // 2. Отправить уведомление на почту/телеграм
        
        res.status(200).json({
            success: true,
            message: 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.'
        });
    } catch (error) {
        console.error('Ошибка при обработке заявки:', error);
        res.status(500).json({
            success: false,
            message: 'Произошла ошибка при отправке заявки. Пожалуйста, попробуйте еще раз.'
        });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Откройте в браузере: http://localhost:${PORT}`);
});
