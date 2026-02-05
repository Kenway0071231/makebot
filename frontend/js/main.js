/**
 * MakeBot Основные скрипты
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('MakeBot loaded');
    
    // Мобильное меню
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            mobileMenuBtn.innerHTML = navLinks.classList.contains('active') ? 
                '<i class="fas fa-times"></i>' : 
                '<i class="fas fa-bars"></i>';
        });
    }
    
    // Плавная прокрутка
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href.includes('Modal')) return;
            e.preventDefault();
            
            const targetElement = document.querySelector(href);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Анимации при скролле
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
    
    // Маска телефона
    document.querySelectorAll('input[type="tel"]').forEach(phoneInput => {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (!value.startsWith('7') && value.length > 0) value = '7' + value;
            if (value.length > 11) value = value.substring(0, 11);
            
            let formatted = '+7';
            if (value.length > 1) formatted += ' (' + value.substring(1, 4);
            if (value.length >= 4) formatted += ') ' + value.substring(4, 7);
            if (value.length >= 7) formatted += '-' + value.substring(7, 9);
            if (value.length >= 9) formatted += '-' + value.substring(9, 11);
            
            e.target.value = formatted;
        });
        
        phoneInput.addEventListener('focus', function() {
            if (!this.value) this.value = '+7 (';
        });
    });
    
    // Модальные окна
    const privacyLinks = document.querySelectorAll('.privacy-link');
    const privacyModal = document.getElementById('privacyModal');
    
    if (privacyModal) {
        privacyLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                privacyModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });
        
        document.getElementById('closePrivacyModal')?.addEventListener('click', function() {
            privacyModal.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        document.getElementById('acceptPrivacyPolicy')?.addEventListener('click', function() {
            const checkboxes = document.querySelectorAll('input[type="checkbox"][name*="privacy"]');
            checkboxes.forEach(cb => cb.checked = true);
            privacyModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Закрытие модальных окон
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
    });
});
