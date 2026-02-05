/**
 * MakeBot Основные скрипты
 * Версия 1.5 (с исправленной валидацией и отправкой форм)
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('MakeBot v1.5 loaded');
    
    // ============================================
    // ВАЛИДАЦИОННЫЕ ФУНКЦИИ (ДОБАВЛЕНО)
    // ============================================
    function validateField(field) {
        const value = field.value.trim();
        const fieldName = field.getAttribute('id') || field.getAttribute('name');
        let isValid = true;
        let errorMessage = '';
        
        // Очистить предыдущие ошибки
        clearFieldError(field);
        
        // Проверка на заполненность
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Это поле обязательно для заполнения';
        }
        
        // Специфичные проверки
        if (isValid && value) {
            switch (field.type) {
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Введите корректный email';
                    }
                    break;
                    
                case 'tel':
                    const phoneRegex = /^\+7\s?\(\d{3}\)\s?\d{3}-\d{2}-\d{2}$/;
                    if (!phoneRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Введите телефон в формате +7 (XXX) XXX-XX-XX';
                    }
                    break;
            }
        }
        
        // Показать ошибку если есть
        if (!isValid) {
            showFieldError(field, errorMessage);
        }
        
        return isValid;
    }
    
    function clearFieldError(field) {
        // Удалить сообщение об ошибке
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
        
        // Убрать стиль ошибки
        field.classList.remove('field-error');
        field.style.borderColor = '';
    }
    
    function showFieldError(field, message) {
        // Очистить предыдущие ошибки
        clearFieldError(field);
        
        // Добавить стиль ошибки
        field.classList.add('field-error');
        field.style.borderColor = '#dc3545';
        
        // Создать элемент с сообщением об ошибке
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error-message';
        errorElement.style.cssText = `
            color: #dc3545;
            font-size: 0.85rem;
            margin-top: 5px;
            margin-bottom: 10px;
        `;
        errorElement.textContent = message;
        
        // Вставить после поля
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }
    
    function validateContactForm() {
        const form = document.getElementById('contactForm');
        const fields = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        
        fields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });
        
        // Проверка чекбокса политики конфиденциальности
        const privacyCheckbox = form.querySelector('input[name="privacyPolicy"]');
        if (privacyCheckbox && !privacyCheckbox.checked) {
            showNotification('Пожалуйста, примите политику конфиденциальности', 'warning');
            isValid = false;
        }
        
        return isValid;
    }
    
    function validateCalculatorForm() {
        const form = document.getElementById('calculatorContactForm');
        if (!form) return true;
        
        const fields = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        
        fields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });
        
        // Проверка чекбокса для калькулятора
        const privacyCheckbox = form.querySelector('input[name="calcPrivacyPolicy"]');
        if (privacyCheckbox && !privacyCheckbox.checked) {
            showNotification('Пожалуйста, примите политику конфиденциальности', 'warning');
            isValid = false;
        }
        
        return isValid;
    }
    
    // ============================================
    // ИНИЦИАЛИЗАЦИЯ
    // ============================================
    initMobileMenu();
    initSmoothScroll();
    initAnimations();
    initFormValidation();
    initPrivacyModal();
    initPhoneMask();
    
    // ... остальной код остается без изменений ...
});
