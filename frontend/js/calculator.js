/**
 * MakeBot Калькулятор стоимости v2.1
 * Исправленная версия с рабочими переходами
 */

document.addEventListener('DOMContentLoaded', function() {
    // ============================================
    // КОНФИГУРАЦИЯ КАЛЬКУЛЯТОРА v2.1
    // ============================================
    const calculatorConfig = {
        version: '2.1.0',
        currentStep: 1,
        totalSteps: 5,
        answers: {},
        calculationData: {},
        
        // Базовые цены
        basePrices: {
            'simple-bot': 7500,
            'ai-bot': 12500,
            'website': 15000,
            'mini-app': 25000
        },
        
        // Базовые сроки
        baseTimes: {
            'simple-bot': '7-14',
            'ai-bot': '14-21',
            'website': '14-21',
            'mini-app': '21-31'
        },
        
        questions: [
            {
                id: 1,
                question: "Какой проект вам нужен?",
                type: "single",
                key: "projectType",
                options: [
                    {
                        id: "simple-bot",
                        text: "Чат-бот средней сложности",
                        description: "Кнопочное меню, FAQ, базовые сценарии",
                        icon: "fas fa-comment-dots",
                        basePrice: 7500,
                        baseTime: "7-14 дней",
                        complexity: "simple"
                    },
                    {
                        id: "ai-bot",
                        text: "ИИ-бот с нейросетями",
                        description: "Умные ответы, анализ контекста, обучение",
                        icon: "fas fa-brain",
                        basePrice: 12500,
                        baseTime: "14-21 день",
                        complexity: "ai",
                        popular: true
                    },
                    {
                        id: "website",
                        text: "Сайт (базовый/средний)",
                        description: "Лендинг, корпоративный сайт, визитка",
                        icon: "fas fa-code",
                        basePrice: 15000,
                        baseTime: "14-21 день",
                        complexity: "website",
                        popular: true
                    },
                    {
                        id: "mini-app",
                        text: "Мини-приложение в мессенджере",
                        description: "Базовое приложение внутри Telegram/VK",
                        icon: "fas fa-mobile-alt",
                        basePrice: 25000,
                        baseTime: "21-31 день",
                        complexity: "mini-app"
                    }
                ]
            },
            // Вопрос 2 будет динамическим в зависимости от типа проекта
            {
                id: 3,
                question: "Какие интеграции нужны?",
                type: "multiple",
                key: "integrations",
                options: [
                    {
                        id: "none",
                        text: "Без интеграций",
                        icon: "fas fa-times",
                        priceMultiplier: 1.0,
                        timeMultiplier: 1.0
                    },
                    {
                        id: "crm",
                        text: "CRM система",
                        description: "AmoCRM, Битрикс24, RetailCRM",
                        icon: "fas fa-database",
                        priceMultiplier: 1.3,
                        timeMultiplier: 1.2,
                        popular: true,
                        essential: true
                    },
                    {
                        id: "payment",
                        text: "Онлайн-оплата",
                        description: "ЮKassa, CloudPayments, Tinkoff",
                        icon: "fas fa-credit-card",
                        priceMultiplier: 1.25,
                        timeMultiplier: 1.15,
                        popular: true
                    },
                    {
                        id: "email",
                        text: "Email рассылка",
                        description: "Интеграция с email-сервисами",
                        icon: "fas fa-envelope",
                        priceMultiplier: 1.1,
                        timeMultiplier: 1.05
                    },
                    {
                        id: "api",
                        text: "Внешние API",
                        description: "До 3 подключений к внешним сервисам",
                        icon: "fas fa-plug",
                        priceMultiplier: 1.2,
                        timeMultiplier: 1.1
                    },
                    {
                        id: "database",
                        text: "Собственная база данных",
                        description: "Хранение данных пользователей",
                        icon: "fas fa-server",
                        priceMultiplier: 1.15,
                        timeMultiplier: 1.08
                    },
                    {
                        id: "other-integration",
                        text: "Другое",
                        description: "Указать в комментарии",
                        icon: "fas fa-plus-circle",
                        priceMultiplier: 1.4,
                        timeMultiplier: 1.25,
                        custom: true
                    }
                ]
            },
            {
                id: 4,
                question: "Оцените сложность проекта",
                description: "Чем сложнее логика, тем выше стоимость и сроки",
                type: "single",
                key: "complexity",
                options: [
                    {
                        id: "simple",
                        text: "Простая (базовая функциональность)",
                        description: "Стандартные функции, минимальная кастомизация",
                        icon: "fas fa-stream",
                        priceMultiplier: 1.0,
                        timeMultiplier: 1.0
                    },
                    {
                        id: "medium",
                        text: "Средняя (дополнительные функции)",
                        description: "Расширенный функционал, кастомизация дизайна",
                        icon: "fas fa-code-branch",
                        priceMultiplier: 1.5,
                        timeMultiplier: 1.3,
                        popular: true
                    },
                    {
                        id: "complex",
                        text: "Сложная (уникальная логика)",
                        description: "Сложные алгоритмы, уникальные решения",
                        icon: "fas fa-cogs",
                        priceMultiplier: 2.0,
                        timeMultiplier: 1.7
                    },
                    {
                        id: "very-complex",
                        text: "Очень сложная (инновации)",
                        description: "Собственные разработки, интеграция с редкими системами",
                        icon: "fas fa-rocket",
                        priceMultiplier: 2.5,
                        timeMultiplier: 2.0
                    }
                ]
            },
            {
                id: 5,
                question: "Сроки разработки",
                description: "Выберите желаемую скорость выполнения",
                type: "single",
                key: "deadline",
                options: [
                    {
                        id: "normal",
                        text: "Стандартные сроки",
                        description: "Оптимальное соотношение цена/качество",
                        icon: "fas fa-calendar-alt",
                        priceMultiplier: 1.0,
                        timeMultiplier: 1.0,
                        popular: true
                    },
                    {
                        id: "fast",
                        text: "Ускоренные сроки",
                        description: "Работа в 2 смены, приоритетный проект",
                        icon: "fas fa-bolt",
                        priceMultiplier: 1.3,
                        timeMultiplier: 0.7
                    },
                    {
                        id: "very-fast",
                        text: "Максимально срочно",
                        description: "Работа 24/7, все ресурсы на ваш проект",
                        icon: "fas fa-rocket",
                        priceMultiplier: 1.5,
                        timeMultiplier: 0.5
                    }
                ]
            }
        ],
        
        // Конфигурация для вопроса 2 в зависимости от типа проекта
        question2Config: {
            'simple-bot': {
                question: "В каких мессенджерах нужен бот?",
                type: "multiple",
                key: "platforms",
                options: [
                    {
                        id: "telegram",
                        text: "Telegram",
                        icon: "fab fa-telegram",
                        priceMultiplier: 1.0,
                        timeMultiplier: 1.0,
                        popular: true
                    },
                    {
                        id: "whatsapp",
                        text: "WhatsApp",
                        icon: "fab fa-whatsapp",
                        priceMultiplier: 1.3,
                        timeMultiplier: 1.2,
                        popular: true
                    },
                    {
                        id: "instagram",
                        text: "Instagram",
                        icon: "fab fa-instagram",
                        priceMultiplier: 1.3,
                        timeMultiplier: 1.2
                    },
                    {
                        id: "vk",
                        text: "ВКонтакте",
                        icon: "fab fa-vk",
                        priceMultiplier: 1.2,
                        timeMultiplier: 1.1,
                        popular: true
                    },
                    {
                        id: "max",
                        text: "MAX",
                        icon: "fas fa-comment",
                        priceMultiplier: 1.2,
                        timeMultiplier: 1.1
                    },
                    {
                        id: "other-platform",
                        text: "Другое",
                        description: "Указать в комментарии",
                        icon: "fas fa-plus-circle",
                        priceMultiplier: 1.5,
                        timeMultiplier: 1.3,
                        custom: true
                    }
                ]
            },
            'ai-bot': {
                question: "В каких мессенджерах нужен ИИ-бот?",
                type: "multiple",
                key: "platforms",
                options: [
                    {
                        id: "telegram",
                        text: "Telegram",
                        icon: "fab fa-telegram",
                        priceMultiplier: 1.0,
                        timeMultiplier: 1.0,
                        popular: true
                    },
                    {
                        id: "whatsapp",
                        text: "WhatsApp",
                        icon: "fab fa-whatsapp",
                        priceMultiplier: 1.4,
                        timeMultiplier: 1.3,
                        popular: true
                    },
                    {
                        id: "website",
                        text: "На вашем сайте",
                        icon: "fas fa-globe",
                        priceMultiplier: 1.2,
                        timeMultiplier: 1.1
                    },
                    {
                        id: "other-platform-ai",
                        text: "Другое",
                        description: "Указать в комментарии",
                        icon: "fas fa-plus-circle",
                        priceMultiplier: 1.6,
                        timeMultiplier: 1.4,
                        custom: true
                    }
                ]
            },
            'website': {
                question: "Какой тип сайта нужен?",
                type: "single",
                key: "websiteType",
                options: [
                    {
                        id: "landing",
                        text: "Лендинг (одностраничник)",
                        icon: "fas fa-flag",
                        priceMultiplier: 1.0,
                        timeMultiplier: 1.0,
                        baseTime: "7-10 дней",
                        popular: true
                    },
                    {
                        id: "corporate",
                        text: "Корпоративный сайт",
                        icon: "fas fa-building",
                        priceMultiplier: 1.3,
                        timeMultiplier: 1.2,
                        baseTime: "14-21 день"
                    },
                    {
                        id: "catalog",
                        text: "Сайт-каталог",
                        icon: "fas fa-box-open",
                        priceMultiplier: 1.5,
                        timeMultiplier: 1.3,
                        baseTime: "14-21 день",
                        popular: true
                    },
                    {
                        id: "online-store",
                        text: "Интернет-магазин",
                        icon: "fas fa-shopping-cart",
                        priceMultiplier: 2.0,
                        timeMultiplier: 1.5,
                        baseTime: "21-28 дней"
                    },
                    {
                        id: "service",
                        text: "Сайт услуг",
                        icon: "fas fa-concierge-bell",
                        priceMultiplier: 1.2,
                        timeMultiplier: 1.1,
                        baseTime: "10-14 дней"
                    }
                ]
            },
            'mini-app': {
                question: "Где нужно приложение?",
                type: "single",
                key: "appPlatform",
                options: [
                    {
                        id: "telegram",
                        text: "Telegram",
                        icon: "fab fa-telegram",
                        priceMultiplier: 1.0,
                        timeMultiplier: 1.0,
                        popular: true
                    },
                    {
                        id: "vk",
                        text: "ВКонтакте",
                        icon: "fab fa-vk",
                        priceMultiplier: 1.2,
                        timeMultiplier: 1.1
                    },
                    {
                        id: "other-app",
                        text: "Другое",
                        description: "Указать в комментарии",
                        icon: "fas fa-plus-circle",
                        priceMultiplier: 1.5,
                        timeMultiplier: 1.3,
                        custom: true
                    }
                ]
            }
        }
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
        priceRange: document.getElementById('priceRange'),
        
        // Форма калькулятора
        calculatorContactForm: document.getElementById('calculatorContactForm'),
        submitCalculatorForm: document.getElementById('submitCalculatorForm'),
        contactFormContainer: document.getElementById('contactFormContainer')
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
    // ОТОБРАЖЕНИЕ ВОПРОСОВ (ИСПРАВЛЕННАЯ ФУНКЦИЯ)
    // ============================================
    function showQuestion(step) {
        calculatorConfig.currentStep = step;
        
        // Определить, какой вопрос показывать
        let question;
        if (step === 1) {
            question = calculatorConfig.questions[0]; // Тип проекта
        } else if (step === 2) {
            // Динамический вопрос в зависимости от типа проекта
            const projectType = calculatorConfig.answers.projectType?.id;
            if (projectType && calculatorConfig.question2Config[projectType]) {
                question = calculatorConfig.question2Config[projectType];
            } else {
                // Если тип проекта не выбран, показываем сообщение
                showNotification('Пожалуйста, выберите тип проекта на первом шаге', 'warning');
                showQuestion(1);
                return;
            }
        } else {
            // Вопросы 3, 4, 5
            // Корректный индекс для массива questions (учитываем что question2 динамический)
            question = calculatorConfig.questions[step - 2];
        }
        
        // Если вопрос не найден, показываем первый
        if (!question) {
            console.error('Вопрос не найден для шага', step);
            question = calculatorConfig.questions[0];
            calculatorConfig.currentStep = 1;
        }
        
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
        setupQuestionListeners(question, step);
        
        // Анимация появления
        setTimeout(() => {
            const options = document.querySelectorAll('.option');
            options.forEach((option, index) => {
                setTimeout(() => {
                    option.classList.add('visible');
                }, index * 100);
            });
        }, 50);
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
            
            // Форматирование цены
            let priceLabel = '';
            if (option.basePrice) {
                priceLabel = `<div class="option-price">от ${formatPrice(option.basePrice)} ₽</div>`;
            } else if (option.priceMultiplier && option.priceMultiplier !== 1) {
                priceLabel = `<div class="option-price">×${option.priceMultiplier.toFixed(1)}</div>`;
            }
            
            // Форматирование времени
            let timeline = '';
            if (option.baseTime) {
                timeline = `<div class="option-timeline">${option.baseTime}</div>`;
            } else if (option.timeline) {
                timeline = `<div class="option-timeline">${option.timeline}</div>`;
            }
            
            optionsHTML += `
                <div class="option animate-on-scroll" 
                     data-id="${option.id}"
                     data-text="${option.text}"
                     ${option.basePrice ? `data-baseprice="${option.basePrice}"` : ''}
                     ${option.priceMultiplier ? `data-pricemultiplier="${option.priceMultiplier}"` : ''}
                     ${option.timeMultiplier ? `data-timemultiplier="${option.timeMultiplier}"` : ''}
                     ${option.baseTime ? `data-basetime="${option.baseTime}"` : ''}>
                    <i class="${option.icon}"></i>
                    <div class="option-content">
                        <div class="option-title">${option.text}</div>
                        ${description}
                        ${badges}
                        ${priceLabel}
                        ${timeline}
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
                    ${question.description ? `<p class="question-description">${question.description}</p>` : ''}
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
                } else if (savedAnswer.id === optionId) {
                    option.classList.add('selected');
                }
            }
        });
        
        // Активировать кнопку "Далее"
        const nextBtn = document.querySelector('.next-btn, .calculate-btn');
        if (nextBtn) {
            nextBtn.disabled = !calculatorConfig.answers[question.key];
        }
    }

    // ============================================
    // НАСТРОЙКА ОБРАБОТЧИКОВ ВОПРОСОВ (ИСПРАВЛЕННАЯ)
    // ============================================
    function setupQuestionListeners(question, step) {
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
        const basePrice = optionElement.getAttribute('data-baseprice');
        const priceMultiplier = optionElement.getAttribute('data-pricemultiplier');
        const timeMultiplier = optionElement.getAttribute('data-timemultiplier');
        const baseTime = optionElement.getAttribute('data-basetime');
        
        if (question.type === 'single') {
            // Снять выделение со всех
            document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
            // Выделить выбранный
            optionElement.classList.add('selected');
            // Сохранить ответ
            calculatorConfig.answers[question.key] = {
                id: optionId,
                text: optionText,
                basePrice: basePrice ? parseInt(basePrice) : null,
                priceMultiplier: priceMultiplier ? parseFloat(priceMultiplier) : 1.0,
                timeMultiplier: timeMultiplier ? parseFloat(timeMultiplier) : 1.0,
                baseTime: baseTime || null
            };
        } else {
            // Множественный выбор
            optionElement.classList.toggle('selected');
            
            // Обновить массив выбранных ответов
            const selectedOptions = Array.from(document.querySelectorAll('.option.selected'));
            
            calculatorConfig.answers[question.key] = selectedOptions.map(opt => ({
                id: opt.getAttribute('data-id'),
                text: opt.getAttribute('data-text'),
                priceMultiplier: parseFloat(opt.getAttribute('data-pricemultiplier')) || 1.0,
                timeMultiplier: parseFloat(opt.getAttribute('data-timemultiplier')) || 1.0
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
        
        // Сохранить данные расчета
        calculatorConfig.calculationData = calculation;
        
        // Обновить данные в результате
        updateResultDisplay(calculation);
        
        // Показать результат
        showResult();
    }

    function validateAnswers() {
        // Проверить все обязательные вопросы
        const requiredKeys = ['projectType', 'complexity', 'deadline'];
        
        // Проверить проекто-специфичные вопросы
        const projectType = calculatorConfig.answers.projectType?.id;
        if (projectType) {
            if (projectType === 'simple-bot' || projectType === 'ai-bot') {
                if (!calculatorConfig.answers.platforms) return false;
            } else if (projectType === 'website') {
                if (!calculatorConfig.answers.websiteType) return false;
            } else if (projectType === 'mini-app') {
                if (!calculatorConfig.answers.appPlatform) return false;
            }
        }
        
        // Проверить интеграции (могут быть не выбраны, тогда считается "none")
        if (!calculatorConfig.answers.integrations) {
            calculatorConfig.answers.integrations = [{
                id: "none",
                text: "Без интеграций",
                priceMultiplier: 1.0,
                timeMultiplier: 1.0
            }];
        }
        
        for (const key of requiredKeys) {
            if (!calculatorConfig.answers[key]) {
                return false;
            }
        }
        
        return true;
    }

    function calculatePrice() {
        const projectType = calculatorConfig.answers.projectType;
        let basePrice = projectType.basePrice || calculatorConfig.basePrices[projectType.id];
        let baseTime = projectType.baseTime || calculatorConfig.baseTimes[projectType.id];
        
        let totalPrice = basePrice;
        let totalTimeMultiplier = 1.0;
        let timeline = {};
        
        // Собрать информацию для отображения
        let displayInfo = {
            projectType: projectType.text,
            platforms: '',
            integrations: '',
            complexity: calculatorConfig.answers.complexity.text,
            deadline: calculatorConfig.answers.deadline.text
        };
        
        // 1. Платформы/Тип сайта/Платформа приложения
        if (calculatorConfig.answers.platforms) {
            const platforms = calculatorConfig.answers.platforms;
            displayInfo.platforms = platforms.map(p => p.text).join(', ');
            
            platforms.forEach(platform => {
                totalPrice *= platform.priceMultiplier;
                totalTimeMultiplier *= platform.timeMultiplier;
            });
        } else if (calculatorConfig.answers.websiteType) {
            const websiteType = calculatorConfig.answers.websiteType;
            displayInfo.platforms = websiteType.text;
            
            totalPrice *= websiteType.priceMultiplier;
            totalTimeMultiplier *= websiteType.timeMultiplier;
            if (websiteType.baseTime) {
                baseTime = websiteType.baseTime;
            }
        } else if (calculatorConfig.answers.appPlatform) {
            const appPlatform = calculatorConfig.answers.appPlatform;
            displayInfo.platforms = appPlatform.text;
            
            totalPrice *= appPlatform.priceMultiplier;
            totalTimeMultiplier *= appPlatform.timeMultiplier;
        }
        
        // 2. Интеграции
        const integrations = calculatorConfig.answers.integrations;
        if (integrations && integrations.length > 0) {
            displayInfo.integrations = integrations.map(i => i.text).join(', ');
            
            integrations.forEach(integration => {
                totalPrice *= integration.priceMultiplier;
                totalTimeMultiplier *= integration.timeMultiplier;
            });
        } else {
            displayInfo.integrations = 'Без интеграций';
        }
        
        // 3. Сложность
        const complexity = calculatorConfig.answers.complexity;
        totalPrice *= complexity.priceMultiplier;
        totalTimeMultiplier *= complexity.timeMultiplier;
        
        // 4. Срочность
        const deadline = calculatorConfig.answers.deadline;
        totalPrice *= deadline.priceMultiplier;
        totalTimeMultiplier *= deadline.timeMultiplier;
        
        // 5. Округление до 500
        totalPrice = Math.round(totalPrice / 500) * 500;
        
        // 6. Расчет сроков
        const [minBaseDays, maxBaseDays] = parseTimeRange(baseTime);
        const minDays = Math.round(minBaseDays * totalTimeMultiplier);
        const maxDays = Math.round(maxBaseDays * totalTimeMultiplier);
        
        // Минимальный срок - 3 дня
        const finalMinDays = Math.max(3, minDays);
        const finalMaxDays = Math.max(finalMinDays + 2, maxDays);
        
        timeline = {
            planning: `${Math.max(1, Math.round(finalMinDays * 0.2))}-${Math.max(2, Math.round(finalMaxDays * 0.25))} дней`,
            development: `${Math.max(3, Math.round(finalMinDays * 0.5))}-${Math.max(5, Math.round(finalMaxDays * 0.6))} дней`,
            testing: `${Math.max(1, Math.round(finalMinDays * 0.1))}-${Math.max(2, Math.round(finalMaxDays * 0.15))} дней`,
            total: `${finalMinDays}-${finalMaxDays} дней`
        };
        
        // 7. Расчет диапазона цен (±15%)
        const minPrice = Math.round(totalPrice * 0.85);
        const maxPrice = Math.round(totalPrice * 1.15);
        
        return {
            ...displayInfo,
            basePrice,
            totalPrice,
            minPrice,
            maxPrice,
            timeline,
            totalTimeMultiplier,
            rawAnswers: { ...calculatorConfig.answers }
        };
    }

    function parseTimeRange(timeStr) {
        return timeStr.split('-').map(num => parseInt(num));
    }

    // ============================================
    // ОБНОВЛЕНИЕ ОТОБРАЖЕНИЯ РЕЗУЛЬТАТА
    // ============================================
    function updateResultDisplay(calculation) {
        // Основные параметры
        elements.resultType.textContent = calculation.projectType;
        elements.resultPlatforms.textContent = calculation.platforms || '—';
        elements.resultIntegrations.textContent = calculation.integrations || '—';
        elements.resultComplexity.textContent = calculation.complexity;
        elements.resultDeadline.textContent = calculation.deadline;
        
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
        elements.contactFormContainer.style.display = 'block';
        
        // Прокрутить к результату
        elements.resultContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
        
        // Анимация появления
        elements.resultContainer.classList.add('fade-in');
    }

    // ============================================
    // ОТПРАВКА ФОРМЫ КАЛЬКУЛЯТОРА (ИСПРАВЛЕННАЯ)
    // ============================================
    function setupCalculatorFormListener() {
        if (!elements.calculatorContactForm) return;
        
        elements.calculatorContactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Валидация формы
            if (!validateCalculatorForm()) {
                return;
            }
            
            // Показать индикатор загрузки
            const submitBtn = elements.submitCalculatorForm;
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
            submitBtn.disabled = true;
            
            try {
                // Собрать данные формы
                const formData = {
                    name: document.getElementById('calcName').value.trim(),
                    phone: document.getElementById('calcPhone').value.trim(),
                    email: document.getElementById('calcEmail').value.trim() || null,
                    comment: document.getElementById('calcComment').value.trim() || null,
                    calculation: calculatorConfig.calculationData
                };
                
                // Отправить на сервер
                const response = await fetch('/api/calculator/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Показать успешное сообщение
                    showSuccessModal('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
                    
                    // Сбросить форму
                    elements.calculatorContactForm.reset();
                    
                    // Скрыть форму после успешной отправки
                    setTimeout(() => {
                        elements.contactFormContainer.style.display = 'none';
                    }, 3000);
                    
                    // Отправить аналитику
                    sendAnalytics('calculator_form_submitted', formData);
                    
                } else {
                    throw new Error(result.message || 'Ошибка при отправке формы');
                }
                
            } catch (error) {
                console.error('Ошибка отправки формы:', error);
                showNotification('Ошибка при отправке формы. Пожалуйста, попробуйте еще раз или свяжитесь с нами напрямую.', 'warning');
            } finally {
                // Восстановить кнопку
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    function validateCalculatorForm() {
        const name = document.getElementById('calcName');
        const phone = document.getElementById('calcPhone');
        const privacy = document.getElementById('calcPrivacyPolicy');
        
        let isValid = true;
        
        // Очистить предыдущие ошибки
        clearFieldError(name);
        clearFieldError(phone);
        
        // Валидация имени
        if (!name.value.trim()) {
            showFieldError(name, 'Введите ваше имя');
            isValid = false;
        }
        
        // Валидация телефона
        const phoneRegex = /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/;
        if (!phone.value.trim()) {
            showFieldError(phone, 'Введите номер телефона');
            isValid = false;
        } else if (!phoneRegex.test(phone.value)) {
            showFieldError(phone, 'Введите телефон в формате: +7 (XXX) XXX-XX-XX');
            isValid = false;
        }
        
        // Валидация согласия (ДОБАВЛЕНА ПРОВЕРКА ЧЕКБОКСА)
        if (!privacy.checked) {
            showNotification('Необходимо согласие на обработку персональных данных', 'warning');
            isValid = false;
        }
        
        return isValid;
    }

    function showFieldError(field, message) {
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #dc3545;
            font-size: 0.85rem;
            margin-top: 5px;
            display: flex;
            align-items: center;
            gap: 5px;
        `;
        
        const errorIcon = document.createElement('i');
        errorIcon.className = 'fas fa-exclamation-circle';
        
        errorDiv.prepend(errorIcon);
        field.parentNode.appendChild(errorDiv);
    }

    function clearFieldError(field) {
        field.classList.remove('error');
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    // ============================================
    // НАСТРОЙКА ОБЩИХ ОБРАБОТЧИКОВ
    // ============================================
    function setupEventListeners() {
        // Кнопка сброса
        if (elements.resetButton) {
            elements.resetButton.addEventListener('click', function() {
                resetCalculator();
            });
        }
        
        // Форма калькулятора
        setupCalculatorFormListener();
        
        // FAQ аккордеон
        setupFAQAccordion();
    }

    function resetCalculator() {
        calculatorConfig.answers = {};
        calculatorConfig.calculationData = {};
        calculatorConfig.currentStep = 1;
        
        // Сбросить форму
        if (elements.calculatorContactForm) {
            elements.calculatorContactForm.reset();
        }
        
        // Показать первый вопрос
        showQuestion(1);
        
        // Прокрутить к калькулятору
        document.getElementById('calculator').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
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

    function showSuccessModal(message) {
        const modal = document.getElementById('successModal');
        const messageEl = document.getElementById('successMessage');
        const closeBtn = document.getElementById('closeModal');
        
        if (!modal) return;
        
        if (messageEl) {
            messageEl.textContent = message;
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }, { once: true });
        
        // Закрытие по клику вне модального окна
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Закрытие по Escape
        document.addEventListener('keydown', function closeOnEscape(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
                document.removeEventListener('keydown', closeOnEscape);
            }
        });
    }

    function sendAnalytics(event, data) {
        console.log('Analytics:', {
            event: event,
            data: {
                ...data,
                calculation: data.calculation ? '...' : null
            }
        });
    }

    // ============================================
    // ЗАПУСК КАЛЬКУЛЯТОРА
    // ============================================
    initCalculator();
});
