/**
 * MakeBot Основные скрипты
 * Версия 1.4 (с исправленной отправкой форм)
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('MakeBot v1.4 loaded');
    
    // ============================================
    // ИНИЦИАЛИЗАЦИЯ
    // ============================================
    initMobileMenu();
    initSmoothScroll();
    initAnimations();
    initFormValidation();
    initPrivacyModal();
    initPhoneMask();
    
    // ============================================
    // МОБИЛЬНОЕ МЕНЮ
    // ============================================
    function initMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                navLinks.classList.toggle('active');
                mobileMenuBtn.innerHTML = navLinks.classList.contains('active') ? 
                    '<i class="fas fa-times"></i>' : 
                    '<i class="fas fa-bars"></i>';
            });
            
            // Закрыть меню при клике на ссылку
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                });
            });
            
            // Закрыть меню при клике вне его
            document.addEventListener('click', function(e) {
                if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    navLinks.classList.remove('active');
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
        }
    }
    
    // ============================================
    // ПЛАВНАЯ ПРОКРУТКА
    // ============================================
    function initSmoothScroll() {
        // Обработчик для всех ссылок с якорями
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Пропустить пустые ссылки и ссылки на другие страницы
                if (href === '#' || href.includes('javascript')) return;
                
                // Пропустить ссылки на модальные окна
                if (href.includes('Modal')) return;
                
                e.preventDefault();
                
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    const headerHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Активная ссылка в навигации при прокрутке
        window.addEventListener('scroll', function() {
            const scrollPosition = window.scrollY + 100;
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
            
            // Обновление активного пункта меню
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                const sectionId = section.getAttribute('id');
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
            
            // Эффект при прокрутке для навигации
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
    
    // ============================================
    // АНИМАЦИИ ПРИ СКРОЛЛЕ
    // ============================================
    function initAnimations() {
        // Анимация появления элементов
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);
        
        // Наблюдать за элементами для анимации
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
        
        // Анимация счетчиков в статистике
        animateCounters();
    }
    
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        counters.forEach(counter => {
            const target = counter.textContent;
            if (target.includes('-')) {
                return;
            }
            
            const targetNumber = parseInt(target);
            if (isNaN(targetNumber)) return;
            
            const increment = targetNumber / 100;
            let current = 0;
            
            const updateCounter = () => {
                if (current < targetNumber) {
                    current += increment;
                    counter.textContent = Math.floor(current);
                    setTimeout(updateCounter, 20);
                } else {
                    counter.textContent = targetNumber;
                }
            };
            
            // Запустить анимацию при появлении в viewport
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            observer.observe(counter);
        });
    }
    
    // ============================================
    // ВАЛИДАЦИЯ И ОТПРАВКА ФОРМ
    // ============================================
    function initFormValidation() {
        // Контактная форма
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // Простая валидация
                const name = document.getElementById('name');
                const phone = document.getElementById('phone');
                
                if (!name.value.trim() || !phone.value.trim()) {
                    alert('Пожалуйста, заполните обязательные поля');
                    return;
                }
                
                // Проверка чекбокса
                const privacyCheckbox = document.getElementById('privacyPolicy');
                if (!privacyCheckbox.checked) {
                    alert('Пожалуйста, примите политику конфиденциальности');
                    return;
                }
                
                // Показать индикатор загрузки
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
                submitBtn.disabled = true;
                
                try {
                    // Собрать данные формы
                    const formData = {
                        name: name.value.trim(),
                        phone: phone.value.trim(),
                        message: document.getElementById('message')?.value.trim() || null
                    };
                    
                    console.log('📤 Отправка контактной формы:', formData);
                    
                    // Отправить на сервер
                    const response = await fetch('/api/contact', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        showSuccessModal('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в течение 30 минут.');
                        contactForm.reset();
                    } else {
                        throw new Error(result.message || 'Ошибка при отправке формы');
                    }
                    
                } catch (error) {
                    console.error('❌ Ошибка отправки формы:', error);
                    alert('Ошибка при отправке формы: ' + error.message);
                } finally {
                    // Восстановить кнопку
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            });
        }
        
        // Форма калькулятора (обработчик уже в calculator.js)
    }
    
    // ============================================
    // МАСКА ДЛЯ ТЕЛЕФОНА
    // ============================================
    function initPhoneMask() {
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        
        phoneInputs.forEach(phoneInput => {
            phoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                
                // Если начинается не с 7, добавляем +7
                if (!value.startsWith('7') && value.length > 0) {
                    value = '7' + value;
                }
                
                // Ограничиваем длину
                if (value.length > 11) {
                    value = value.substring(0, 11);
                }
                
                // Форматируем
                let formattedValue = '+7';
                if (value.length > 1) {
                    formattedValue += ' (' + value.substring(1, 4);
                }
                if (value.length >= 4) {
                    formattedValue += ') ' + value.substring(4, 7);
                }
                if (value.length >= 7) {
                    formattedValue += '-' + value.substring(7, 9);
                }
                if (value.length >= 9) {
                    formattedValue += '-' + value.substring(9, 11);
                }
                
                e.target.value = formattedValue;
            });
            
            // При фокусе, если поле пустое, ставим +7 (
            phoneInput.addEventListener('focus', function() {
                if (!this.value) {
                    this.value = '+7 (';
                }
            });
        });
    }
    
    // ============================================
    // МОДАЛЬНОЕ ОКНО ПОЛИТИКИ
    // ============================================
    function initPrivacyModal() {
        const privacyLinks = document.querySelectorAll('.privacy-link');
        const privacyModal = document.getElementById('privacyModal');
        const closePrivacyModal = document.getElementById('closePrivacyModal');
        const acceptPrivacyPolicy = document.getElementById('acceptPrivacyPolicy');
        
        if (!privacyModal) return;
        
        // Открытие модального окна
        privacyLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                privacyModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });
        
        // Закрытие модального окна
        function closeModal() {
            privacyModal.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        if (closePrivacyModal) {
            closePrivacyModal.addEventListener('click', closeModal);
        }
        
        if (acceptPrivacyPolicy) {
            acceptPrivacyPolicy.addEventListener('click', function() {
                // Поставить галочку в активной форме
                const activeForm = document.querySelector('form:not([style*="display: none"])');
                if (activeForm) {
                    const privacyCheckbox = activeForm.querySelector('input[type="checkbox"][name*="privacy"]');
                    if (privacyCheckbox) {
                        privacyCheckbox.checked = true;
                    }
                }
                closeModal();
            });
        }
        
        // Закрытие по клику вне модального окна
        privacyModal.addEventListener('click', function(e) {
            if (e.target === privacyModal) {
                closeModal();
            }
        });
        
        // Закрытие по Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && privacyModal.classList.contains('active')) {
                closeModal();
            }
        });
    }
    
    // ============================================
    // МОДАЛЬНОЕ ОКНО УСПЕХА
    // ============================================
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
    
    // ============================================
    // УВЕДОМЛЕНИЯ
    // ============================================
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
    
    // ============================================
    // УТИЛИТЫ
    // ============================================
    // Обновление года в футере
    function updateFooterYear() {
        const yearElement = document.querySelector('.copyright');
        if (yearElement) {
            const currentYear = new Date().getFullYear();
            yearElement.textContent = yearElement.textContent.replace(/\d{4}/, currentYear);
        }
    }
    
    // Инициализация счетчиков посещений
    function initVisitCounter() {
        let visits = localStorage.getItem('makebot_visits') || 0;
        visits = parseInt(visits) + 1;
        localStorage.setItem('makebot_visits', visits);
        
        console.log(`Посещений сайта: ${visits}`);
    }
    
    // ============================================
    // ЗАПУСК ВСЕХ ФУНКЦИЙ
    // ============================================
    updateFooterYear();
    initVisitCounter();
    
    // Инициализация при полной загрузке страницы
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
        
        // Показываем элементы с задержкой для плавного появления
        setTimeout(() => {
            document.querySelectorAll('.animate-on-scroll').forEach(el => {
                if (el.getBoundingClientRect().top < window.innerHeight) {
                    el.classList.add('visible');
                }
            });
        }, 100);
    });
});
