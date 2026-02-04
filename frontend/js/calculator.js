/**
 * MakeBot Калькулятор стоимости
 * Версия 1.0
 */

document.addEventListener('DOMContentLoaded', function() {
    // ============================================
    // КОНФИГУРАЦИЯ КАЛЬКУЛЯТОРА
    // ============================================
    const calculatorConfig = {
        version: '1.0.0',
        currentStep: 1,
        totalSteps: 5,
        answers: {},
        basePrices: {
            'chat-bot': 30000,
            'ai-bot': 70000,
            'mini-app': 50000,
            'website': 40000
        },
        questions: [
            {
                id: 1,
                question: "Какая услуга вас интересует?",
                description: "Выберите тип проекта, который вам нужен",
                type: "single",
                key: "service",
                options: [
                    {
                        id: "chat-bot",
                        text: "Чат-боты для мессенджеров",
                        description: "Автоматизация общения с клиентами",
                        icon: "fas fa-comment-dots",
                        basePrice: 30000,
                        timeline: "7-10 дней"
                    },
                    {
                        id: "ai-bot",
                        text: "ИИ-боты с нейросетями",
                        description: "Продвинутые решения с искусственным интеллектом",
                        icon: "fas fa-brain",
                        basePrice: 70000,
                        timeline: "14-21 день"
                    },
                    {
                        id: "mini-app",
                        text: "Мини-приложения",
                        description: "Легкие приложения внутри мессенджеров",
                        icon: "fas fa-mobile-alt",
                        basePrice: 50000,
                        timeline: "10-14 дней"
                    },
                    {
                        id: "website",
                        text: "Разработка сайтов",
                        description: "Современные сайты и лендинги",
                        icon: "fas fa-code",
                        basePrice: 40000,
                        timeline: "7-14 дней"
                    }
                ]
            },
            {
                id: 2,
                question: "Где будет работать решение?",
                description: "Выберите платформы для интеграции",
                type: "multiple",
                key: "platforms",
                options: [
                    {
                        id: "telegram",
                        text: "Telegram",
                        icon: "fab fa-telegram",
                        price: 10000,
                        popular: true
                    },
                    {
                        id: "whatsapp",
                        text: "WhatsApp",
                        icon: "fab fa-whatsapp",
                        price: 15000,
                        popular: true
                    },
                    {
                        id: "vk",
                        text: "ВКонтакте",
                        icon: "fab fa-vk",
                        price: 10000
                    },
                    {
                        id: "website",
                        text: "На вашем сайте",
                        icon: "fas fa-globe",
                        price: 5000
                    },
                    {
                        id: "max",
                        text: "MAX",
                        icon: "fas fa-comment",
                        price: 12000,
                        popular: true
                    },
                    {
                        id: "instagram",
                        text: "Instagram",
                        icon: "fab fa-instagram",
                        price: 15000
                    }
                ]
            },
            {
                id: 3,
                question: "Какие интеграции нужны?",
                description: "Выберите необходимые подключения к системам",
                type: "multiple",
                key: "integrations",
                options: [
                    {
                        id: "crm",
                        text: "CRM система",
                        description: "AmoCRM, Битрикс24, RetailCRM",
                        icon: "fas fa-database",
                        price: 15000,
                        essential: true
                    },
                    {
                        id: "api",
                        text: "Сторонние API",
                        description: "Подключение к внешним сервисам",
                        icon: "fas fa-plug",
                        price: 10000
                    },
                    {
                        id: "payment",
                        text: "Оплата онлайн",
                        description: "ЮKassa, CloudPayments, Tinkoff",
                        icon: "fas fa-credit-card",
                        price: 12000,
                        popular: true
                    },
                    {
                        id: "email",
                        text: "Email рассылка",
                        description: "Интеграция с email-сервисами",
                        icon: "fas fa-envelope",
                        price: 8000
                    },
                    {
                        id: "1c",
                        text: "1C / ERP система",
                        description: "Синхронизация с 1С",
                        icon: "fas fa-calculator",
                        price: 20000
                    },
                    {
                        id: "none",
                        text: "Пока не нужно",
                        icon: "fas fa-times",
                        price: 0
                    }
                ]
            },
            {
                id: 4,
                question: "Сложность логики бота?",
                description: "Оцените сложность вашего проекта",
                type: "single",
                key: "complexity",
                options: [
                    {
                        id: "simple",
                        text: "Простая (ответы по сценарию)",
                        description: "Линейные сценарии, FAQ, база знаний",
                        icon: "fas fa-stream",
                        price: 20000,
                        multiplier: 1.0
                    },
                    {
                        id: "medium",
                        text: "Средняя (ветвления, условия)",
                        description: "Сложные сценарии, интеграции, базы данных",
                        icon: "fas fa-code-branch",
                        price: 35000,
                        multiplier: 1.5
                    },
                    {
                        id: "complex",
                        text: "Сложная (алгоритмы, AI)",
                        description: "ИИ, машинное обучение, сложная аналитика",
                        icon: "fas fa-cogs",
                        price: 60000,
                        multiplier: 2.0
                    }
                ]
            },
            {
                id: 5,
                question: "Срочность разработки?",
                description: "Выберите желаемые сроки",
                type: "single",
                key: "deadline",
                options: [
                    {
                        id: "normal",
                        text: "Стандартно (2-3 недели)",
                        icon: "fas fa-calendar-alt",
                        price: 0,
                        timeline: "14-21 день"
                    },
                    {
                        id: "fast",
                        text: "Срочно (7-10 дней)",
                        icon: "fas fa-bolt",
                        price: 15000,
                        timeline: "7-10 дней"
                    },
                    {
                        id: "very-fast",
                        text: "Очень срочно (до 7 дней)",
                        icon: "fas fa-rocket",
                        price: 25000,
                        timeline: "3-7 дней"
                    }
                ]
            }
        ]
    };

    // ============================================
    // ЭЛЕМЕНТЫ DOM
    // ============================================
    const elements = {
        questionContainer: document.getElementById('questionContainer'),
        resultContainer: document.getElementById('resultContainer'),
        progressFill: document.getElementById('progressFill'),
        currentQuestion: document.getElementById('currentQuestion'),
        resetButton: document.getElementById('resetCalculator'),
        contactButton: document.getElementById('contactAfterCalc'),
        
        // Результат
        resultType: document.getElementById('resultType'),
        resultPlatforms: document.getElementById('resultPlatforms'),
        resultIntegrations: document.getElementById('resultIntegrations'),
        resultComplexity: document.getElementById('resultComplexity'),
        resultDeadline: document.getElementById('resultDeadline'),
        
        // Таймлайн
        timelinePlanning: document.getElementById('timelinePlanning'),
        timelineDevelopment: document.getElementById('timelineDevelopment'),
        timelineTesting: document.getElementById('timelineTesting'),
        
        // Цена
        priceAmount: document.getElementById('priceAmount'),
        priceRange: document.getElementById('priceRange')
    };

    // ============================================
    // ИНИЦИАЛИЗАЦИЯ
    // ============================================
    function initCalculator() {
        console.log('MakeBot Calculator v' + calculatorConfig.version);
        showQuestion(1);
        setupEventListeners();
    }

    // ============================================
    // ОТОБРАЖЕНИЕ ВОПРОСОВ
    // ============================================
    function showQuestion(step) {
        calculatorConfig.currentStep = step;
        const question = calculatorConfig.questions[step - 1];
        
        // Обновить прогресс
        updateProgress(step);
        
        // Создать HTML вопроса
        const questionHTML = createQuestionHTML(question, step);
        elements.questionContainer.innerHTML = questionHTML;
        
        // Восстановить выбранные ответы
        restoreSelectedAnswers(question);
        
        // Скрыть результат
        elements.resultContainer.style.display = 'none';
        elements.questionContainer.style.display = 'block';
        
        // Добавить обработчики
        setupQuestionListeners(question);
    }

    function createQuestionHTML(question, step) {
        const isFirst = step === 1;
        const isLast = step === calculatorConfig.totalSteps;
        
        // Создать опции
        let optionsHTML = '';
        question.options.forEach((option, index) => {
            const isPopular = option.popular ? '<span class="option-badge popular">Популярный</span>' : '';
            const isEssential = option.essential ? '<span class="option-badge essential">Важно</span>' : '';
            const badges = isPopular || isEssential ? `<div class="option-badges">${isPopular}${isEssential}</div>` : '';
            const description = option.description ? `<p class="option-description">${option.description}</p>` : '';
            
            optionsHTML += `
                <div class="option animate-on-scroll" 
                     data-id="${option.id}"
                     data-price="${option.price || 0}"
                     data-text="${option.text}"
                     data-timeline="${option.timeline || ''}"
                     data-multiplier="${option.multiplier || 1}">
                    <i class="${option.icon}"></i>
                    <div class="option-content">
                        <div class="option-title">${option.text}</div>
                        ${description}
                        ${badges}
                        ${option.price ? `<div class="option-price">+${formatPrice(option.price)} ₽</div>` : ''}
                        ${option.timeline ? `<div class="option-timeline">${option.timeline}</div>` : ''}
                    </div>
                </div>
            `;
        });

        // Создать кнопки
        const buttonsHTML = isFirst ? `
            <div class="buttons">
                <div></div>
                <button class="btn-primary next-btn" ${!calculatorConfig.answers[question.key] ? 'disabled' : ''}>
                    Далее <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        ` : isLast ? `
            <div class="buttons">
                <button class="btn-secondary prev-btn">
                    <i class="fas fa-arrow-left"></i> Назад
                </button>
                <button class="btn-primary calculate-btn" ${!calculatorConfig.answers[question.key] ? 'disabled' : ''}>
                    Рассчитать стоимость <i class="fas fa-calculator"></i>
                </button>
            </div>
        ` : `
            <div class="buttons">
                <button class="btn-secondary prev-btn">
                    <i class="fas fa-arrow-left"></i> Назад
                </button>
                <button class="btn-primary next-btn" ${!calculatorConfig.answers[question.key] ? 'disabled' : ''}>
                    Далее <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `;

        return `
            <div class="question">
                <div class="question-header">
                    <h3>${question.question}</h3>
                    <p class="question-description">${question.description}</p>
                </div>
                <div class="options-grid">
                    ${optionsHTML}
                </div>
                ${buttonsHTML}
            </div>
        `;
    }

    // ============================================
    // ОБНОВЛЕНИЕ ПРОГРЕССА
    // ============================================
    function updateProgress(step) {
        const progressPercent = ((step - 1) / (calculatorConfig.totalSteps - 1)) * 100;
        elements.progressFill.style.width = `${progressPercent}%`;
        elements.currentQuestion.textContent = step;
    }

    // ============================================
    // ВОССТАНОВЛЕНИЕ ВЫБРАННЫХ ОТВЕТОВ
    // ============================================
    function restoreSelectedAnswers(question) {
        const savedAnswer = calculatorConfig.answers[question.key];
        if (!savedAnswer) return;

        const options = document.querySelectorAll('.option');
        
        options.forEach(option => {
            const optionId = option.getAttribute('data-id');
            
            if (question.type === 'single') {
                if (savedAnswer.id === optionId) {
                    option.classList.add('selected');
                }
            } else {
                if (Array.isArray(savedAnswer)) {
                    const isSelected = savedAnswer.some(answer => answer.id === optionId);
                    if (isSelected) {
                        option.classList.add('selected');
                    }
                }
            }
        });
        
        // Активировать кнопку "Далее"
        const nextBtn = document.querySelector('.next-btn, .calculate-btn');
        if (nextBtn) {
            nextBtn.disabled = false;
        }
    }

    // ============================================
    // НАСТРОЙКА ОБРАБОТЧИКОВ ВОПРОСОВ
    // ============================================
    function setupQuestionListeners(question) {
        const options = document.querySelectorAll('.option');
        const nextBtn = document.querySelector('.next-btn, .calculate-btn');
        const prevBtn = document.querySelector('.prev-btn');

        // Обработчики для опций
        options.forEach(option => {
            option.addEventListener('click', function() {
                handleOptionClick(this, question);
            });
        });

        // Обработчик для кнопки "Далее"
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                if (question.type === 'multiple' && !calculatorConfig.answers[question.key]) {
                    showNotification('Пожалуйста, выберите хотя бы один вариант', 'warning');
                    return;
                }
                
                if (calculatorConfig.currentStep < calculatorConfig.totalSteps) {
                    showQuestion(calculatorConfig.currentStep + 1);
                } else {
                    calculateResult();
                }
            });
        }

        // Обработчик для кнопки "Назад"
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (calculatorConfig.currentStep > 1) {
                    showQuestion(calculatorConfig.currentStep - 1);
                }
            });
        }
    }

    function handleOptionClick(optionElement, question) {
        const optionId = optionElement.getAttribute('data-id');
        const optionText = optionElement.getAttribute('data-text');
        const optionPrice = parseInt(optionElement.getAttribute('data-price')) || 0;
        
        if (question.type === 'single') {
            // Снять выделение со всех
            document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
            // Выделить выбранный
            optionElement.classList.add('selected');
            // Сохранить ответ
            calculatorConfig.answers[question.key] = {
                id: optionId,
                text: optionText,
                price: optionPrice,
                timeline: optionElement.getAttribute('data-timeline') || '',
                multiplier: parseFloat(optionElement.getAttribute('data-multiplier')) || 1
            };
        } else {
            // Множественный выбор
            optionElement.classList.toggle('selected');
            
            // Обновить массив выбранных ответов
            const selectedOptions = Array.from(document.querySelectorAll('.option.selected'));
            
            calculatorConfig.answers[question.key] = selectedOptions.map(opt => ({
                id: opt.getAttribute('data-id'),
                text: opt.getAttribute('data-text'),
                price: parseInt(opt.getAttribute('data-price')) || 0
            }));
            
            // Если ничего не выбрано, удалить ответ
            if (selectedOptions.length === 0) {
                delete calculatorConfig.answers[question.key];
            }
        }
        
        // Активировать/деактивировать кнопку "Далее"
        const nextBtn = document.querySelector('.next-btn, .calculate-btn');
        if (nextBtn) {
            nextBtn.disabled = !calculatorConfig.answers[question.key];
        }
    }

    // ============================================
    // РАСЧЕТ РЕЗУЛЬТАТА
    // ============================================
    function calculateResult() {
        if (!validateAnswers()) {
            showNotification('Пожалуйста, ответьте на все вопросы', 'warning');
            return;
        }

        // Рассчитать стоимость
        const calculation = calculatePrice();
        
        // Обновить данные в результате
        updateResultDisplay(calculation);
        
        // Показать результат
        showResult();
        
        // Отправить аналитику
        sendAnalytics(calculation);
    }

    function validateAnswers() {
        for (const question of calculatorConfig.questions) {
            if (!calculatorConfig.answers[question.key]) {
                return false;
            }
        }
        return true;
    }

    function calculatePrice() {
        let basePrice = 0;
        let totalPrice = 0;
        let serviceType = '';
        let platforms = [];
        let integrations = [];
        let complexity = '';
        let deadline = '';
        let complexityMultiplier = 1;
        
        // Пройтись по всем ответам
        for (const [key, answer] of Object.entries(calculatorConfig.answers)) {
            const question = calculatorConfig.questions.find(q => q.key === key);
            
            switch (key) {
                case 'service':
                    serviceType = answer.text;
                    basePrice = answer.price;
                    totalPrice += answer.price;
                    break;
                    
                case 'platforms':
                    if (Array.isArray(answer)) {
                        platforms = answer.map(a => a.text);
                        totalPrice += answer.reduce((sum, a) => sum + a.price, 0);
                    } else {
                        platforms = [answer.text];
                        totalPrice += answer.price;
                    }
                    break;
                    
                case 'integrations':
                    if (Array.isArray(answer)) {
                        integrations = answer.map(a => a.text);
                        totalPrice += answer.reduce((sum, a) => sum + a.price, 0);
                    } else {
                        integrations = [answer.text];
                        totalPrice += answer.price;
                    }
                    break;
                    
                case 'complexity':
                    complexity = answer.text;
                    complexityMultiplier = answer.multiplier;
                    totalPrice += answer.price;
                    break;
                    
                case 'deadline':
                    deadline = answer.text;
                    totalPrice += answer.price;
                    break;
            }
        }
        
        // Применить множитель сложности
        totalPrice = Math.round(totalPrice * complexityMultiplier);
        
        // Рассчитать диапазон цен (±20%)
        const minPrice = Math.round(totalPrice * 0.8);
        const maxPrice = Math.round(totalPrice * 1.2);
        
        // Рассчитать таймлайн
        const timeline = calculateTimeline(complexityMultiplier, deadline);
        
        return {
            serviceType,
            platforms,
            integrations,
            complexity,
            deadline,
            basePrice,
            totalPrice,
            minPrice,
            maxPrice,
            complexityMultiplier,
            timeline
        };
    }

    function calculateTimeline(complexityMultiplier, deadline) {
        let planning = '3-5 дней';
        let development = '7-14 дней';
        let testing = '2-3 дня';
        
        // Корректировка по сложности
        if (complexityMultiplier >= 1.5) {
            development = '14-21 день';
            testing = '3-5 дней';
        }
        
        // Корректировка по срочности
        if (deadline.includes('Срочно')) {
            planning = '2-3 дня';
            development = '7-10 дней';
            testing = '1-2 дня';
        } else if (deadline.includes('Очень срочно')) {
            planning = '1-2 дня';
            development = '3-7 дней';
            testing = '1 день';
        }
        
        return { planning, development, testing };
    }

    // ============================================
    // ОБНОВЛЕНИЕ ОТОБРАЖЕНИЯ РЕЗУЛЬТАТА
    // ============================================
    function updateResultDisplay(calculation) {
        // Основные параметры
        elements.resultType.textContent = calculation.serviceType;
        elements.resultPlatforms.textContent = calculation.platforms.length > 0 ? 
            calculation.platforms.join(', ') : '—';
        elements.resultIntegrations.textContent = calculation.integrations.length > 0 ? 
            calculation.integrations.join(', ') : '—';
        elements.resultComplexity.textContent = calculation.complexity || '—';
        elements.resultDeadline.textContent = calculation.deadline || '—';
        
        // Таймлайн
        elements.timelinePlanning.textContent = calculation.timeline.planning;
        elements.timelineDevelopment.textContent = calculation.timeline.development;
        elements.timelineTesting.textContent = calculation.timeline.testing;
        
        // Цена
        elements.priceAmount.textContent = `от ${formatPrice(calculation.totalPrice)} ₽`;
        elements.priceRange.textContent = `${formatPrice(calculation.minPrice)} – ${formatPrice(calculation.maxPrice)} ₽`;
    }

    function showResult() {
        elements.questionContainer.style.display = 'none';
        elements.resultContainer.style.display = 'block';
        
        // Прокрутить к результату
        elements.resultContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
        
        // Анимация появления
        elements.resultContainer.classList.add('fade-in');
    }

    // ============================================
    // НАСТРОЙКА ОБЩИХ ОБРАБОТЧИКОВ
    // ============================================
    function setupEventListeners() {
        // Кнопка сброса
        elements.resetButton.addEventListener('click', function() {
            resetCalculator();
        });
        
        // Кнопка "Обсудить проект"
        elements.contactButton.addEventListener('click', function() {
            scrollToContactForm();
        });
        
        // FAQ аккордеон
        setupFAQAccordion();
    }

    function resetCalculator() {
        calculatorConfig.answers = {};
        calculatorConfig.currentStep = 1;
        showQuestion(1);
        
        // Прокрутить к калькулятору
        document.getElementById('calculator').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    function scrollToContactForm() {
        document.getElementById('contact').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    function showSuccessModal() {
        const modal = document.getElementById('successModal');
        const closeBtn = document.getElementById('closeModal');
        
        if (!modal) return;
        
        modal.classList.add('active');
        
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('active');
        }, { once: true });
        
        // Закрытие по клику вне модального окна
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    function setupFAQAccordion() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', function() {
                // Закрыть все остальные
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Переключить текущий
                item.classList.toggle('active');
            });
        });
    }

    // ============================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // ============================================
    function formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    function showNotification(message, type = 'info') {
        // Создать уведомление
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Добавить стили
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'warning' ? '#fff3cd' : '#d1ecf1'};
            color: ${type === 'warning' ? '#856404' : '#0c5460'};
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        // Добавить в DOM
        document.body.appendChild(notification);
        
        // Удалить через 5 секунд
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
        
        // Добавить анимации
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    function sendAnalytics(calculation) {
        // В реальном проекте здесь будет отправка в Google Analytics или другой сервис
        console.log('Analytics:', {
            event: 'calculator_completed',
            data: calculation
        });
    }

    // ============================================
    // ЗАПУСК КАЛЬКУЛЯТОРА
    // ============================================
    initCalculator();
});
