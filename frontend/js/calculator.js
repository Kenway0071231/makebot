/**
 * MakeBot Калькулятор (упрощенный)
 */

class Calculator {
    constructor() {
        this.currentStep = 1;
        this.answers = {};
        this.totalSteps = 4;
        
        this.elements = {
            questionContainer: document.getElementById('questionContainer'),
            resultContainer: document.getElementById('resultContainer'),
            progressFill: document.getElementById('progressFill'),
            currentQuestion: document.getElementById('currentQuestion'),
            resetButton: document.getElementById('resetCalculator'),
            calculatorForm: document.getElementById('calculatorContactForm')
        };
        
        this.questions = [
            {
                id: 1,
                question: "Какой проект вам нужен?",
                key: "projectType",
                options: [
                    { id: "simple-bot", text: "Чат-бот", icon: "fas fa-comment-dots", price: 7500 },
                    { id: "ai-bot", text: "ИИ-бот", icon: "fas fa-brain", price: 12500 },
                    { id: "website", text: "Сайт", icon: "fas fa-code", price: 15000 },
                    { id: "mini-app", text: "Мини-приложение", icon: "fas fa-mobile-alt", price: 25000 }
                ]
            },
            {
                id: 2,
                question: "Какие интеграции нужны?",
                key: "integrations",
                options: [
                    { id: "none", text: "Без интеграций", icon: "fas fa-times", multiplier: 1.0 },
                    { id: "crm", text: "CRM система", icon: "fas fa-database", multiplier: 1.3 },
                    { id: "payment", text: "Оплата онлайн", icon: "fas fa-credit-card", multiplier: 1.25 },
                    { id: "api", text: "Внешние API", icon: "fas fa-plug", multiplier: 1.2 }
                ]
            },
            {
                id: 3,
                question: "Сложность проекта",
                key: "complexity",
                options: [
                    { id: "simple", text: "Простая", icon: "fas fa-stream", multiplier: 1.0 },
                    { id: "medium", text: "Средняя", icon: "fas fa-code-branch", multiplier: 1.5 },
                    { id: "complex", text: "Сложная", icon: "fas fa-cogs", multiplier: 2.0 }
                ]
            },
            {
                id: 4,
                question: "Сроки разработки",
                key: "deadline",
                options: [
                    { id: "normal", text: "Стандартно", icon: "fas fa-calendar-alt", multiplier: 1.0 },
                    { id: "fast", text: "Быстро", icon: "fas fa-bolt", multiplier: 1.3 },
                    { id: "urgent", text: "Срочно", icon: "fas fa-rocket", multiplier: 1.5 }
                ]
            }
        ];
        
        this.init();
    }
    
    init() {
        this.showQuestion(1);
        this.setupEventListeners();
    }
    
    showQuestion(step) {
        this.currentStep = step;
        const question = this.questions[step - 1];
        
        // Обновить прогресс
        const progress = ((step - 1) / (this.totalSteps - 1)) * 100;
        this.elements.progressFill.style.width = `${progress}%`;
        this.elements.currentQuestion.textContent = step;
        
        // Создать HTML
        const html = `
            <div class="question">
                <h3>${question.question}</h3>
                <div class="options-grid">
                    ${question.options.map(opt => `
                        <div class="option" data-id="${opt.id}" data-multiplier="${opt.multiplier || 1}">
                            <i class="${opt.icon}"></i>
                            <div class="option-content">
                                <div class="option-title">${opt.text}</div>
                                ${opt.price ? `<div class="option-price">от ${this.formatPrice(opt.price)} ₽</div>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="buttons">
                    ${step > 1 ? '<button class="btn-secondary prev-btn"><i class="fas fa-arrow-left"></i> Назад</button>' : '<div></div>'}
                    <button class="btn-primary next-btn">
                        ${step === this.totalSteps ? 'Рассчитать <i class="fas fa-calculator"></i>' : 'Далее <i class="fas fa-arrow-right"></i>'}
                    </button>
                </div>
            </div>
        `;
        
        this.elements.questionContainer.innerHTML = html;
        this.elements.resultContainer.style.display = 'none';
        this.elements.questionContainer.style.display = 'block';
        
        // Настроить обработчики
        this.setupQuestionListeners(question);
    }
    
    setupQuestionListeners(question) {
        const options = document.querySelectorAll('.option');
        const nextBtn = document.querySelector('.next-btn');
        const prevBtn = document.querySelector('.prev-btn');
        
        options.forEach(opt => {
            opt.addEventListener('click', () => {
                options.forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                
                this.answers[question.key] = {
                    id: opt.dataset.id,
                    text: opt.querySelector('.option-title').textContent,
                    multiplier: parseFloat(opt.dataset.multiplier)
                };
            });
        });
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (!this.answers[question.key]) {
                    alert('Выберите вариант ответа');
                    return;
                }
                
                if (this.currentStep < this.totalSteps) {
                    this.showQuestion(this.currentStep + 1);
                } else {
                    this.calculate();
                }
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentStep > 1) {
                    this.showQuestion(this.currentStep - 1);
                }
            });
        }
    }
    
    calculate() {
        // Базовая цена из первого вопроса
        let basePrice = 7500;
        const projectType = this.answers.projectType;
        
        if (projectType?.id === 'ai-bot') basePrice = 12500;
        if (projectType?.id === 'website') basePrice = 15000;
        if (projectType?.id === 'mini-app') basePrice = 25000;
        
        // Применяем множители
        let totalPrice = basePrice;
        if (this.answers.integrations) totalPrice *= this.answers.integrations.multiplier;
        if (this.answers.complexity) totalPrice *= this.answers.complexity.multiplier;
        if (this.answers.deadline) totalPrice *= this.answers.deadline.multiplier;
        
        // Округляем
        totalPrice = Math.round(totalPrice / 500) * 500;
        const minPrice = Math.round(totalPrice * 0.85);
        const maxPrice = Math.round(totalPrice * 1.15);
        
        // Сохраняем расчет
        this.calculationResult = {
            projectType: projectType?.text || '—',
            integrations: this.answers.integrations?.text || '—',
            complexity: this.answers.complexity?.text || '—',
            deadline: this.answers.deadline?.text || '—',
            totalPrice: totalPrice,
            minPrice: minPrice,
            maxPrice: maxPrice
        };
        
        // Показать результат
        this.showResult();
    }
    
    showResult() {
        const calc = this.calculationResult;
        
        document.getElementById('resultType').textContent = calc.projectType;
        document.getElementById('resultIntegrations').textContent = calc.integrations;
        document.getElementById('resultComplexity').textContent = calc.complexity;
        document.getElementById('resultDeadline').textContent = calc.deadline;
        
        document.getElementById('priceAmount').textContent = `от ${this.formatPrice(calc.totalPrice)} ₽`;
        document.getElementById('priceRange').textContent = `${this.formatPrice(calc.minPrice)} – ${this.formatPrice(calc.maxPrice)} ₽`;
        
        this.elements.questionContainer.style.display = 'none';
        this.elements.resultContainer.style.display = 'block';
        this.elements.resultContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    
    setupEventListeners() {
        // Сброс калькулятора
        if (this.elements.resetButton) {
            this.elements.resetButton.addEventListener('click', () => {
                this.currentStep = 1;
                this.answers = {};
                this.showQuestion(1);
                document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' });
            });
        }
        
        // Форма калькулятора
        if (this.elements.calculatorForm) {
            this.elements.calculatorForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const name = document.getElementById('calcName').value.trim();
                const phone = document.getElementById('calcPhone').value.trim();
                const privacy = document.getElementById('calcPrivacyPolicy').checked;
                
                if (!name || !phone) {
                    alert('Заполните имя и телефон');
                    return;
                }
                
                if (!privacy) {
                    alert('Примите политику конфиденциальности');
                    return;
                }
                
                const submitBtn = document.getElementById('submitCalculatorForm');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
                submitBtn.disabled = true;
                
                try {
                    const formData = {
                        name: name,
                        phone: phone,
                        email: document.getElementById('calcEmail')?.value.trim() || null,
                        comment: document.getElementById('calcComment')?.value.trim() || null,
                        calculation: this.calculationResult
                    };
                    
                    console.log('Отправляем данные:', formData);
                    
                    const response = await fetch('/api/calculator/submit', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        alert('✅ Заявка отправлена! Мы свяжемся с вами.');
                        this.elements.calculatorForm.reset();
                    } else {
                        throw new Error(result.message || 'Ошибка');
                    }
                    
                } catch (error) {
                    console.error('Ошибка:', error);
                    alert('Ошибка отправки: ' + error.message);
                } finally {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            });
        }
        
        // Обработка контактной формы
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const name = document.getElementById('name').value.trim();
                const phone = document.getElementById('phone').value.trim();
                const privacy = document.getElementById('privacyPolicy').checked;
                
                if (!name || !phone) {
                    alert('Заполните имя и телефон');
                    return;
                }
                
                if (!privacy) {
                    alert('Примите политику конфиденциальности');
                    return;
                }
                
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
                submitBtn.disabled = true;
                
                try {
                    const formData = {
                        name: name,
                        phone: phone,
                        message: document.getElementById('message')?.value.trim() || null
                    };
                    
                    console.log('Отправляем контактную форму:', formData);
                    
                    const response = await fetch('/api/contact', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        alert('✅ Заявка отправлена! Мы перезвоним.');
                        contactForm.reset();
                    } else {
                        throw new Error(result.message || 'Ошибка');
                    }
                    
                } catch (error) {
                    console.error('Ошибка:', error);
                    alert('Ошибка отправки: ' + error.message);
                } finally {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            });
        }
    }
}

// Запуск калькулятора при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new Calculator();
});
