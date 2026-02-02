document.addEventListener('DOMContentLoaded', function() {
    // Данные калькулятора
    const calculatorData = {
        currentStep: 1,
        totalSteps: 5,
        answers: {},
        questions: [
            {
                id: 1,
                question: "Какая услуга вас интересует?",
                type: "single",
                options: [
                    { id: "chat-bot", text: "Чат-бот для мессенджеров", icon: "fas fa-comment-dots", price: 30000 },
                    { id: "ai-bot", text: "ИИ-бот с нейросетями", icon: "fas fa-brain", price: 70000 },
                    { id: "mini-app", text: "Мини-приложение", icon: "fas fa-mobile-alt", price: 50000 },
                    { id: "website", text: "Разработка сайта", icon: "fas fa-code", price: 40000 }
                ]
            },
            {
                id: 2,
                question: "Где будет работать решение?",
                type: "multiple",
                options: [
                    { id: "telegram", text: "Telegram", icon: "fab fa-telegram", price: 10000 },
                    { id: "whatsapp", text: "WhatsApp", icon: "fab fa-whatsapp", price: 15000 },
                    { id: "vk", text: "ВКонтакте", icon: "fab fa-vk", price: 10000 },
                    { id: "website", text: "На вашем сайте", icon: "fas fa-globe", price: 5000 },
                    { id: "avito", text: "Авито", icon: "fas fa-store", price: 12000 }
                ]
            },
            {
                id: 3,
                question: "Какие интеграции нужны?",
                type: "multiple",
                options: [
                    { id: "crm", text: "CRM система", icon: "fas fa-database", price: 15000 },
                    { id: "api", text: "Сторонние API", icon: "fas fa-plug", price: 10000 },
                    { id: "payment", text: "Оплата онлайн", icon: "fas fa-credit-card", price: 12000 },
                    { id: "email", text: "Email рассылка", icon: "fas fa-envelope", price: 8000 },
                    { id: "none", text: "Пока не нужно", icon: "fas fa-times", price: 0 }
                ]
            },
            {
                id: 4,
                question: "Сложность логики бота?",
                type: "single",
                options: [
                    { id: "simple", text: "Простая (ответы по сценарию)", icon: "fas fa-stream", price: 20000 },
                    { id: "medium", text: "Средняя (ветвления, условия)", icon: "fas fa-code-branch", price: 35000 },
                    { id: "complex", text: "Сложная (алгоритмы, AI)", icon: "fas fa-cogs", price: 60000 }
                ]
            },
            {
                id: 5,
                question: "Срочность разработки?",
                type: "single",
                options: [
                    { id: "normal", text: "Стандартно (2-3 недели)", icon: "fas fa-calendar-alt", price: 0 },
                    { id: "fast", text: "Срочно (7-10 дней)", icon: "fas fa-bolt", price: 15000 },
                    { id: "very-fast", text: "Очень срочно (до 7 дней)", icon: "fas fa-rocket", price: 25000 }
                ]
            }
        ]
    };

    // Элементы DOM
    const questionContainer = document.getElementById('questionContainer');
    const resultContainer = document.getElementById('resultContainer');
    const progressFill = document.getElementById('progressFill');
    const currentQuestion = document.getElementById('currentQuestion');
    const resetButton = document.getElementById('resetCalculator');
    const resultType = document.getElementById('resultType');
    const resultPlatforms = document.getElementById('resultPlatforms');
    const resultIntegrations = document.getElementById('resultIntegrations');
    const resultComplexity = document.getElementById('resultComplexity');
    const priceAmount = document.getElementById('priceAmount');

    // Инициализация калькулятора
    function initCalculator() {
        showQuestion(1);
    }

    // Показать вопрос
    function showQuestion(step) {
        calculatorData.currentStep = step;
        const question = calculatorData.questions[step - 1];
        
        // Обновить прогресс
        const progressPercent = ((step - 1) / (calculatorData.totalSteps - 1)) * 100;
        progressFill.style.width = `${progressPercent}%`;
        currentQuestion.textContent = step;
        
        // Создать HTML вопроса
        let optionsHTML = '';
        
        question.options.forEach(option => {
            const isSelected = calculatorData.answers[question.id] && 
                (question.type === 'single' 
                    ? calculatorData.answers[question.id].id === option.id
                    : calculatorData.answers[question.id].some(ans => ans.id === option.id));
            
            optionsHTML += `
                <div class="option ${isSelected ? 'selected' : ''}" 
                     data-id="${option.id}"
                     data-price="${option.price}"
                     data-text="${option.text}">
                    <i class="${option.icon}"></i>
                    <div>${option.text}</div>
                </div>
            `;
        });
        
        const buttonsHTML = step === 1 ? `
            <div class="buttons">
                <div></div>
                <button class="btn-primary" id="nextQuestion">Далее <i class="fas fa-arrow-right"></i></button>
            </div>
        ` : step === calculatorData.totalSteps ? `
            <div class="buttons">
                <button class="btn-secondary" id="prevQuestion"><i class="fas fa-arrow-left"></i> Назад</button>
                <button class="btn-primary" id="showResult">Рассчитать</button>
            </div>
        ` : `
            <div class="buttons">
                <button class="btn-secondary" id="prevQuestion"><i class="fas fa-arrow-left"></i> Назад</button>
                <button class="btn-primary" id="nextQuestion">Далее <i class="fas fa-arrow-right"></i></button>
            </div>
        `;
        
        questionContainer.innerHTML = `
            <div class="question">
                <h3>${question.question}</h3>
                <div class="options-grid">
                    ${optionsHTML}
                </div>
                ${buttonsHTML}
            </div>
        `;
        
        // Скрыть результат
        resultContainer.style.display = 'none';
        questionContainer.style.display = 'block';
        
        // Добавить обработчики
        addOptionListeners();
        addButtonListeners();
    }

    // Добавить обработчики для вариантов ответа
    function addOptionListeners() {
        const options = document.querySelectorAll('.option');
        const question = calculatorData.questions[calculatorData.currentStep - 1];
        
        options.forEach(option => {
            option.addEventListener('click', function() {
                const optionId = this.getAttribute('data-id');
                const optionText = this.getAttribute('data-text');
                
                if (question.type === 'single') {
                    // Снять выделение со всех
                    options.forEach(opt => opt.classList.remove('selected'));
                    // Выделить выбранный
                    this.classList.add('selected');
                    // Сохранить ответ
                    calculatorData.answers[question.id] = {
                        id: optionId,
                        text: optionText,
                        price: parseInt(this.getAttribute('data-price'))
                    };
                } else {
                    // Множественный выбор
                    this.classList.toggle('selected');
                    
                    // Обновить массив выбранных ответов
                    const selectedOptions = Array.from(document.querySelectorAll('.option.selected'));
                    
                    calculatorData.answers[question.id] = selectedOptions.map(opt => ({
                        id: opt.getAttribute('data-id'),
                        text: opt.getAttribute('data-text'),
                        price: parseInt(opt.getAttribute('data-price'))
                    }));
                    
                    // Если ничего не выбрано, удалить ответ
                    if (selectedOptions.length === 0) {
                        delete calculatorData.answers[question.id];
                    }
                }
            });
        });
    }

    // Добавить обработчики для кнопок
    function addButtonListeners() {
        const prevBtn = document.getElementById('prevQuestion');
        const nextBtn = document.getElementById('nextQuestion');
        const showResultBtn = document.getElementById('showResult');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (calculatorData.currentStep > 1) {
                    showQuestion(calculatorData.currentStep - 1);
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                if (calculatorData.currentStep < calculatorData.totalSteps && 
                    calculatorData.answers[calculatorData.questions[calculatorData.currentStep - 1].id]) {
                    showQuestion(calculatorData.currentStep + 1);
                } else {
                    alert('Пожалуйста, выберите вариант ответа');
                }
            });
        }
        
        if (showResultBtn) {
            showResultBtn.addEventListener('click', function() {
                if (calculatorData.answers[calculatorData.questions[calculatorData.currentStep - 1].id]) {
                    showResult();
                } else {
                    alert('Пожалуйста, выберите вариант ответа');
                }
            });
        }
    }

    // Показать результат
    function showResult() {
        // Рассчитать стоимость
        let totalPrice = 0;
        let serviceType = '';
        let platforms = [];
        let integrations = [];
        let complexity = '';
        
        // Пройтись по всем ответам
        for (const [questionId, answer] of Object.entries(calculatorData.answers)) {
            const question = calculatorData.questions.find(q => q.id == questionId);
            
            if (questionId == 1) {
                serviceType = answer.text;
                totalPrice += answer.price;
            } else if (questionId == 2) {
                if (Array.isArray(answer)) {
                    platforms = answer.map(a => a.text);
                    totalPrice += answer.reduce((sum, a) => sum + a.price, 0);
                } else {
                    platforms = [answer.text];
                    totalPrice += answer.price;
                }
            } else if (questionId == 3) {
                if (Array.isArray(answer)) {
                    integrations = answer.map(a => a.text);
                    totalPrice += answer.reduce((sum, a) => sum + a.price, 0);
                } else {
                    integrations = [answer.text];
                    totalPrice += answer.price;
                }
            } else if (questionId == 4) {
                complexity = answer.text;
                totalPrice += answer.price;
            } else if (questionId == 5) {
                totalPrice += answer.price;
            }
        }
        
        // Форматировать цену
        const formattedPrice = totalPrice.toLocaleString('ru-RU');
        
        // Обновить данные в результате
        resultType.textContent = serviceType;
        resultPlatforms.textContent = platforms.length > 0 ? platforms.join(', ') : '—';
        resultIntegrations.textContent = integrations.length > 0 ? integrations.join(', ') : '—';
        resultComplexity.textContent = complexity || '—';
        priceAmount.textContent = `от ${formattedPrice} ₽`;
        
        // Показать результат
        questionContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        
        // Прокрутить к результату
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Кнопка сброса
    resetButton.addEventListener('click', function() {
        calculatorData.answers = {};
        calculatorData.currentStep = 1;
        showQuestion(1);
    });

    // Запустить калькулятор
    initCalculator();
});
