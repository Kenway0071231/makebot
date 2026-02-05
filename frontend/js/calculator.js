/**
 * MakeBot Калькулятор стоимости
 * Упрощенная рабочая версия
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('MakeBot Calculator loaded');
    
    // Конфигурация
    const config = {
        currentStep: 1,
        answers: {},
        calculationData: {}
    };
    
    // Элементы DOM
    const elements = {
        questionContainer: document.getElementById('questionContainer'),
        resultContainer: document.getElementById('resultContainer'),
        progressFill: document.getElementById('progressFill'),
        currentQuestion: document.getElementById('currentQuestion'),
        resetButton: document.getElementById('resetCalculator'),
        calculatorContactForm: document.getElementById('calculatorContactForm'),
        submitCalculatorForm: document.getElementById('submitCalculatorForm')
    };
    
    // Вопросы
    const questions = [
        {
            id: 1,
            question: "Какой проект вам нужен?",
            options: [
                { id: "simple-bot", text: "Чат-бот средней сложности", icon: "fas fa-comment-dots", price: "от 7 500 ₽" },
                { id: "ai-bot", text: "ИИ-бот с нейросетями", icon: "fas fa-brain", price: "от 12 500 ₽" },
                { id: "website", text: "Сайт (базовый/средний)", icon: "fas fa-code", price: "от 15 000 ₽" },
                { id: "mini-app", text: "Мини-приложение", icon: "fas fa-mobile-alt", price: "от 25 000 ₽" }
            ]
        },
        {
            id: 2,
            question: "Какие интеграции нужны?",
            options: [
                { id: "none", text: "Без интеграций", icon: "fas fa-times" },
                { id: "crm", text: "CRM система", icon: "fas fa-database" },
                { id: "payment", text: "Онлайн-оплата", icon: "fas fa-credit-card" },
                { id: "api", text: "Внешние API", icon: "fas fa-plug" }
            ]
        },
        {
            id: 3,
            question: "Оцените сложность проекта",
            options: [
                { id: "simple", text: "Простая", icon: "fas fa-stream" },
                { id: "medium", text: "Средняя", icon: "fas fa-code-branch" },
                { id: "complex", text: "Сложная", icon: "fas fa-cogs" }
            ]
        },
        {
            id: 4,
            question: "Сроки разработки",
            options: [
                { id: "normal", text: "Стандартные сроки", icon: "fas fa-calendar-alt" },
                { id: "fast", text: "Ускоренные сроки", icon: "fas fa-bolt" },
                { id: "very-fast", text: "Максимально срочно", icon: "fas fa-rocket" }
            ]
        }
    ];
    
    // Инициализация
    function initCalculator() {
        showQuestion(1);
        setupEventListeners();
    }
    
    // Показать вопрос
    function showQuestion(step) {
        config.currentStep = step;
        
        if (step > questions.length) {
            calculateResult();
            return;
        }
        
        const question = questions[step - 1];
        
        // Обновить прогресс
        updateProgress(step);
        
        // Создать HTML
        const questionHTML = `
            <div class="question">
                <h3>${question.question}</h3>
                <div class="options-grid">
                    ${question.options.map(option => `
                        <div class="option" data-id="${option.id}">
                            <i class="${option.icon}"></i>
                            <div class="option-content">
                                <div class="option-title">${option.text}</div>
                                ${option.price ? `<div class="option-price">${option.price}</div>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="buttons">
                    ${step > 1 ? `<button class="btn-secondary prev-btn"><i class="fas fa-arrow-left"></i> Назад</button>` : '<div></div>'}
                    <button class="btn-primary next-btn">
                        ${step === questions.length ? 'Рассчитать стоимость <i class="fas fa-calculator"></i>' : 'Далее <i class="fas fa-arrow-right"></i>'}
                    </button>
                </div>
            </div>
        `;
        
        elements.questionContainer.innerHTML = questionHTML;
        
        // Скрыть результат
        elements.resultContainer.style.display = 'none';
        elements.questionContainer.style.display = 'block';
        
        // Добавить обработчики
        setupQuestionListeners(question, step);
    }
    
    // Обновить прогресс
    function updateProgress(step) {
        const progressPercent = ((step - 1) / (questions.length - 1)) * 100;
        elements.progressFill.style.width = `${progressPercent}%`;
        elements.currentQuestion.textContent = step;
    }
    
    // Настройка обработчиков вопросов
    function setupQuestionListeners(question, step) {
        const options = document.querySelectorAll('.option');
        const nextBtn = document.querySelector('.next-btn');
        const prevBtn = document.querySelector('.prev-btn');
        
        // Обработчики для опций
        options.forEach(option => {
            option.addEventListener('click', function() {
                // Снять выделение со всех
                options.forEach(opt => opt.classList.remove('selected'));
                // Выделить выбранный
                this.classList.add('selected');
                // Сохранить ответ
                config.answers[`question${step}`] = {
                    id: this.getAttribute('data-id'),
                    text: this.querySelector('.option-title').textContent
                };
            });
        });
        
        // Кнопка "Далее"
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                if (!config.answers[`question${step}`]) {
                    alert('Пожалуйста, выберите вариант');
                    return;
                }
                
                if (step < questions.length) {
                    showQuestion(step + 1);
                } else {
                    calculateResult();
                }
            });
        }
        
        // Кнопка "Назад"
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (step > 1) {
                    showQuestion(step - 1);
                }
            });
        }
    }
    
    // Расчет результата
    function calculateResult() {
        // Простой расчет цены
        let basePrice = 7500;
        
        if (config.answers.question1?.id === 'ai-bot') basePrice = 12500;
        if (config.answers.question1?.id === 'website') basePrice = 15000;
        if (config.answers.question1?.id === 'mini-app') basePrice = 25000;
        
        // Множители
        if (config.answers.question3?.id === 'medium') basePrice *= 1.5;
        if (config.answers.question3?.id === 'complex') basePrice *= 2;
        
        if (config.answers.question4?.id === 'fast') basePrice *= 1.3;
        if (config.answers.question4?.id === 'very-fast') basePrice *= 1.5;
        
        // Округление
        basePrice = Math.round(basePrice / 500) * 500;
        
        // Сохраняем данные расчета
        config.calculationData = {
            projectType: config.answers.question1?.text || '—',
            integrations: config.answers.question2?.text || '—',
            complexity: config.answers.question3?.text || '—',
            deadline: config.answers.question4?.text || '—',
            totalPrice: basePrice,
            minPrice: Math.round(basePrice * 0.85),
            maxPrice: Math.round(basePrice * 1.15),
            timeline: {
                planning: '3-5 дней',
                development: '7-14 дней',
                testing: '2-3 дня',
                total: '12-22 дня'
            }
        };
        
        // Обновляем отображение
        document.getElementById('resultType').textContent = config.calculationData.projectType;
        document.getElementById('resultIntegrations').textContent = config.calculationData.integrations;
        document.getElementById('resultComplexity').textContent = config.calculationData.complexity;
        document.getElementById('resultDeadline').textContent = config.calculationData.deadline;
        
        document.getElementById('timelinePlanning').textContent = config.calculationData.timeline.planning;
        document.getElementById('timelineDevelopment').textContent = config.calculationData.timeline.development;
        document.getElementById('timelineTesting').textContent = config.calculationData.timeline.testing;
        
        document.getElementById('priceAmount').textContent = `от ${formatPrice(config.calculationData.totalPrice)} ₽`;
        document.getElementById('priceRange').textContent = `${formatPrice(config.calculationData.minPrice)} – ${formatPrice(config.calculationData.maxPrice)} ₽`;
        
        // Показать результат
        elements.questionContainer.style.display = 'none';
        elements.resultContainer.style.display = 'block';
        
        // Прокрутить к результату
        elements.resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Форматирование цены
    function formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    
    // Настройка обработчиков
    function setupEventListeners() {
        // Кнопка сброса
        if (elements.resetButton) {
            elements.resetButton.addEventListener('click', function() {
                config.answers = {};
                config.calculationData = {};
                config.currentStep = 1;
                
                if (elements.calculatorContactForm) {
                    elements.calculatorContactForm.reset();
                }
                
                showQuestion(1);
                document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' });
            });
        }
        
        // Форма калькулятора
        if (elements.calculatorContactForm) {
            elements.calculatorContactForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // Простая валидация
                const name = document.getElementById('calcName');
                const phone = document.getElementById('calcPhone');
                const privacyCheckbox = document.getElementById('calcPrivacyPolicy');
                
                if (!name.value.trim() || !phone.value.trim()) {
                    alert('Пожалуйста, заполните обязательные поля');
                    return;
                }
                
                if (!privacyCheckbox.checked) {
                    alert('Пожалуйста, примите политику конфиденциальности');
                    return;
                }
                
                // Показать индикатор загрузки
                const submitBtn = elements.submitCalculatorForm;
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
                submitBtn.disabled = true;
                
                try {
                    const formData = {
                        name: name.value.trim(),
                        phone: phone.value.trim(),
                        email: document.getElementById('calcEmail')?.value.trim() || null,
                        comment: document.getElementById('calcComment')?.value.trim() || null,
                        calculation: config.calculationData
                    };
                    
                    console.log('📤 Отправка данных:', formData);
                    
                    const response = await fetch('/api/calculator/submit', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        alert('✅ Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.');
                        elements.calculatorContactForm.reset();
                    } else {
                        throw new Error(result.message || 'Ошибка при отправке');
                    }
                    
                } catch (error) {
                    console.error('❌ Ошибка:', error);
                    alert('Ошибка при отправке: ' + error.message);
                } finally {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            });
        }
    }
    
    // Запуск калькулятора
    initCalculator();
});
