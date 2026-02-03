cat > frontend/js/main.js << 'EOF'
/**
 * MakeBot Основные скрипты
 * Версия 2.0
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('MakeBot v2.0 loaded');
    
    // ============================================
    // ИНИЦИАЛИЗАЦИЯ
    // ============================================
    initMobileMenu();
    initSmoothScroll();
    initAnimations();
    initFormValidation();
    initPrivacyModal();
    initPhoneMask();
    initScrollAnimations();
    
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
    function initScrollAnimations() {
        const animateElements = document.querySelectorAll('.animate-on-scroll');
        
        if (animateElements.length === 0) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.getAttribute('data-delay') || 0;
                    setTimeout(() => {
                        entry.target.classList.add('animated');
                    }, parseFloat(delay) * 1000);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        animateElements.forEach(el => observer.observe(el));
    }
    
    // ============================================
    // АНИМАЦИИ ПРИ ЗАГРУЗКЕ
    // ============================================
    function initAnimations() {
        // Анимация визуальных элементов в герое
        const visualElements = document.querySelectorAll('.visual-element');
        visualElements.forEach((el, index) => {
            const delay = el.getAttribute('data-delay') || (index * 0.1);
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, parseFloat(delay) * 1000 + 1000); // +1s для задержки после загрузки
        });
        
        // Анимация плавающих элементов
        const floatElements = document.querySelectorAll('.animate-float');
        floatElements.forEach(el => {
            const delay = el.getAttribute('data-delay') || 0;
            setTimeout(() => {
                el.style.animationDelay = `${delay}s`;
                el.style.animationPlayState = 'running';
            }, parseFloat(delay) * 1000);
        });
    }
    
    // ============================================
    // МАСКА ТЕЛЕФОНА
    // ============================================
    function initPhoneMask() {
        const phoneInput = document.getElementById('phone');
        
        if (!phoneInput) return;
        
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 0) {
                value = value.substring(0, 10);
                
                let formatted = '';
                if (value.length > 0) {
                    formatted += '(' + value.substring(0, 3);
                }
                if (value.length >= 4) {
                    formatted += ') ' + value.substring(3, 6);
                }
                if (value.length >= 7) {
                    formatted += '-' + value.substring(6, 8);
                }
                if (value.length >= 9) {
                    formatted += '-' + value.substring(8, 10);
                }
                
                e.target.value = formatted;
            } else {
                e.target.value = '';
            }
        });
        
        phoneInput.addEventListener('blur', function(e) {
            if (e.target.value === '(') {
                e.target.value = '';
            }
        });
    }
    
    // ============================================
    // ВАЛИДАЦИЯ ФОРМ
    // ============================================
    function initFormValidation() {
        const contactForm = document.getElementById('contactForm');
        
        if (!contactForm) return;
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm(this)) {
                submitForm(this);
            }
        });
        
        // Валидация в реальном времени
        const inputs = contactForm.querySelectorAll('input[required], textarea[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
    }
    
    function validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    function validateField(field) {
        let isValid = true;
        let message = '';
        
        // Очистить предыдущие ошибки
        clearFieldError(field);
        
        // Проверка на пустое значение
        if (!field.value.trim()) {
            isValid = false;
            message = 'Это поле обязательно для заполнения';
        }
        
        // Проверка телефона
        if (field.type === 'tel' && field.value.trim()) {
            const phoneRegex = /^\(\d{3}\) \d{3}-\d{2}-\d{2}$/;
            if (!phoneRegex.test(field.value)) {
                isValid = false;
                message = 'Введите телефон в формате (XXX) XXX-XX-XX';
            }
        }
        
        // Если есть ошибка, показать её
        if (!isValid) {
            showFieldError(field, message);
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
    
    function submitForm(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Показать состояние загрузки
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;
        
        // Собрать данные формы
        const formData = {
            name: document.getElementById('name').value,
            phone: '+7 ' + document.getElementById('phone').value,
            message: document.getElementById('message').value,
            timestamp: new Date().toISOString(),
            page: window.location.href
        };
        
        // Имитация отправки на сервер
        setTimeout(() => {
            // Показать модальное окно успеха
            showSuccessModal();
            
            // Сбросить форму
            form.reset();
            
            // Восстановить кнопку
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Отправить данные в консоль (в реальном проекте здесь будет fetch на сервер)
            console.log('Форма отправлена:', formData);
            
            // Можно также отправить данные на сервер:
            // sendToServer(formData);
            
        }, 1500);
    }
    
    function showSuccessModal() {
        const modal = document.getElementById('successModal');
        const closeBtn = document.getElementById('closeModal');
        
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
        
        // Закрытие по ESC
        document.addEventListener('keydown', function closeOnEsc(e) {
            if (e.key === 'Escape') {
                modal.classList.remove('active');
                document.removeEventListener('keydown', closeOnEsc);
            }
        });
    }
    
    // ============================================
    // МОДАЛЬНОЕ ОКНО ПОЛИТИКИ
    // ============================================
    function initPrivacyModal() {
        const privacyLinks = document.querySelectorAll('.privacy-link, .privacy-link-footer');
        const privacyModal = document.getElementById('privacyModal');
        const closePrivacyBtn = document.getElementById('closePrivacyModal');
        const acceptPrivacyBtn = document.getElementById('acceptPrivacy');
        
        if (!privacyModal) return;
        
        // Открытие модалки
        privacyLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                openPrivacyModal();
            });
        });
        
        // Закрытие модалки
        if (closePrivacyBtn) {
            closePrivacyBtn.addEventListener('click', closePrivacyModal);
        }
        
        if (acceptPrivacyBtn) {
            acceptPrivacyBtn.addEventListener('click', function() {
                // Отметить чекбокс в форме
                const agreementCheckbox = document.getElementById('privacyAgreement');
                if (agreementCheckbox) {
                    agreementCheckbox.checked = true;
                }
                closePrivacyModal();
            });
        }
        
        // Закрытие по клику вне модалки
        privacyModal.addEventListener('click', function(e) {
            if (e.target === privacyModal) {
                closePrivacyModal();
            }
        });
        
        // Закрытие по ESC
        document.addEventListener('keydown', function closeOnEsc(e) {
            if (e.key === 'Escape' && privacyModal.classList.contains('active')) {
                closePrivacyModal();
            }
        });
        
        function openPrivacyModal() {
            privacyModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        function closePrivacyModal() {
            privacyModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // ============================================
    // ОТПРАВКА НА СЕРВЕР (пример)
    // ============================================
    function sendToServer(data) {
        fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
    
    // ============================================
    // ОБНОВЛЕНИЕ ГОДА В ФУТЕРЕ
    // ============================================
    function updateFooterYear() {
        const yearElement = document.querySelector('.copyright');
        if (yearElement) {
            const currentYear = new Date().getFullYear();
            yearElement.textContent = yearElement.textContent.replace(/\d{4}/, currentYear);
        }
    }
    
    // ============================================
    // СТАТИСТИКА ПОСЕЩЕНИЙ
    // ============================================
    function initVisitCounter() {
        let visits = localStorage.getItem('makebot_visits') || 0;
        visits = parseInt(visits) + 1;
        localStorage.setItem('makebot_visits', visits);
        
        console.log(`Посещений сайта: ${visits}`);
    }
    
    // ============================================
    // ОПТИМИЗАЦИЯ ИЗОБРАЖЕНИЙ
    // ============================================
    function initImageOptimization() {
        // Ленивая загрузка изображений (если будут добавлены)
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback для старых браузеров
            images.forEach(img => {
                img.src = img.dataset.src;
            });
        }
    }
    
    // ============================================
    // ЗАПУСК ВСЕХ ФУНКЦИЙ
    // ============================================
    updateFooterYear();
    initVisitCounter();
    initImageOptimization();
    
    // Инициализация при полной загрузке страницы
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
        
        // Показать анимированные элементы после загрузки
        setTimeout(() => {
            const animatedElements = document.querySelectorAll('.animate-on-scroll:not([data-delay])');
            animatedElements.forEach(el => {
                el.classList.add('animated');
            });
        }, 300);
    });
    
    // Предотвращение контекстного меню на изображениях
    document.addEventListener('contextmenu', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    });
});
EOF
