// Hero Enhancements para Telas Grandes
document.addEventListener('DOMContentLoaded', function() {
    initHeroEnhancements();
});

function initHeroEnhancements() {
    const heroSlider = document.querySelector('.hero-slider');
    if (!heroSlider) return;
    
    // Detectar se é desktop
    if (window.innerWidth >= 1200) {
        enhanceForDesktop();
    }
    
    // Lazy loading das imagens de background
    initHeroLazyLoading();
    
    // Parallax effect para desktop
    if (window.innerWidth >= 1200 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        initHeroParallax();
    }
    
    // Keyboard navigation
    initHeroKeyboardNav();
    
    // Auto-pause no focus de elementos
    initHeroAccessibility();
}

function enhanceForDesktop() {
    const heroSlider = document.querySelector('.hero-slider');
    const slides = document.querySelectorAll('.hero-slide');
    
    // Adicionar classe para desktop
    heroSlider.classList.add('desktop-enhanced');
    
    // Preload das próximas imagens
    slides.forEach((slide, index) => {
        const element = slide;
        const bgImage = element.style.backgroundImage;
        if (bgImage) {
            const match = bgImage.match(/url\((.*?)\)/);
            if (match) {
                const imageUrl = match[1].replace(/['"]/g, '');
                const img = new Image();
                img.src = imageUrl;
            }
        }
    });
    
    // Melhores transições
    let currentIndex = 0;
    const nextBtn = document.querySelector('.hero-nav.next');
    const prevBtn = document.querySelector('.hero-nav.prev');
    
    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % slides.length;
            smoothTransition(currentIndex);
        });
        
        prevBtn.addEventListener('click', () => {
            currentIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
            smoothTransition(currentIndex);
        });
    }
}

function smoothTransition(index) {
    const slides = document.querySelectorAll('.hero-slide');
    
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === index) {
            setTimeout(() => {
                slide.classList.add('active');
            }, 100);
        }
    });
    
    // Atualizar dots
    const dots = document.querySelectorAll('.hero-dots button');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

function initHeroLazyLoading() {
    const slides = document.querySelectorAll('.hero-slide');
    
    // Observer para lazy loading
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const slide = entry.target;
                    const element = slide;
                    const bgImage = element.dataset.bgImage;
                    
                    if (bgImage && !slide.classList.contains('loaded')) {
                        element.style.backgroundImage = `url(${bgImage})`;
                        slide.classList.add('loaded');
                    }
                }
            });
        }, { threshold: 0.1 });
        
        slides.forEach(slide => {
            observer.observe(slide);
        });
    }
}

function initHeroParallax() {
    const heroSlider = document.querySelector('.hero-slider');
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        const element = heroSlider;
        element.style.transform = `translateY(${rate}px)`;
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick, { passive: true });
}

function initHeroKeyboardNav() {
    const heroSlider = document.querySelector('.hero-slider');
    
    // Tornar o slider focável
    heroSlider.setAttribute('tabindex', '0');
    heroSlider.setAttribute('role', 'region');
    heroSlider.setAttribute('aria-label', 'Carousel de destaques');
    
    heroSlider.addEventListener('keydown', (e) => {
        const event = e;
        switch(event.key) {
            case 'ArrowLeft':
                e.preventDefault();
                const prevBtn = document.querySelector('.hero-nav.prev');
                if (prevBtn) prevBtn.click();
                break;
            case 'ArrowRight':
                e.preventDefault();
                const nextBtn = document.querySelector('.hero-nav.next');
                if (nextBtn) nextBtn.click();
                break;
            case 'Home':
                e.preventDefault();
                const firstDot = document.querySelector('.hero-dots button:first-child');
                if (firstDot) firstDot.click();
                break;
            case 'End':
                e.preventDefault();
                const lastDot = document.querySelector('.hero-dots button:last-child');
                if (lastDot) lastDot.click();
                break;
        }
    });
}

function initHeroAccessibility() {
    const heroSlider = document.querySelector('.hero-slider');
    const playPauseBtn = createPlayPauseButton();
    
    // Pausar quando elementos internos recebem foco
    const focusableElements = heroSlider.querySelectorAll('a, button');
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', () => {
            heroSlider.dispatchEvent(new Event('mouseenter'));
        });
        
        element.addEventListener('blur', () => {
            heroSlider.dispatchEvent(new Event('mouseleave'));
        });
    });
}

function createPlayPauseButton() {
    const heroSlider = document.querySelector('.hero-slider');
    const button = document.createElement('button');
    
    button.className = 'hero-play-pause';
    button.innerHTML = '<i class="bi bi-pause-fill"></i>';
    button.setAttribute('aria-label', 'Pausar slideshow');
    button.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        width: 44px;
        height: 44px;
        border: none;
        background: rgba(0,0,0,0.5);
        color: white;
        border-radius: 50%;
        cursor: pointer;
        z-index: 5;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
    `;
    
    let isPlaying = true;
    
    button.addEventListener('click', () => {
        isPlaying = !isPlaying;
        
        if (isPlaying) {
            button.innerHTML = '<i class="bi bi-pause-fill"></i>';
            button.setAttribute('aria-label', 'Pausar slideshow');
            heroSlider.dispatchEvent(new Event('mouseleave'));
        } else {
            button.innerHTML = '<i class="bi bi-play-fill"></i>';
            button.setAttribute('aria-label', 'Reproduzir slideshow');
            heroSlider.dispatchEvent(new Event('mouseenter'));
        }
    });
    
    button.addEventListener('mouseenter', () => {
        button.style.background = 'rgba(255,255,255,0.9)';
        button.style.color = '#000';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.background = 'rgba(0,0,0,0.5)';
        button.style.color = 'white';
    });
    
    heroSlider.appendChild(button);
    return button;
}

// Otimizações de performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Recarregar otimizações quando a tela for redimensionada
window.addEventListener('resize', debounce(() => {
    // Reinicializar se mudou para desktop
    if (window.innerWidth >= 1200) {
        const heroSlider = document.querySelector('.hero-slider');
        if (!heroSlider.classList.contains('desktop-enhanced')) {
            enhanceForDesktop();
        }
    }
}, 250));

// Performance observer para monitorar métricas
if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
            if (entry.entryType === 'measure' && entry.name.indexOf('hero') !== -1) {
                console.log('Hero performance: ' + entry.name + ' took ' + entry.duration + 'ms');
            }
        });
    });
    
    try {
        observer.observe({ entryTypes: ['measure'] });
    } catch (e) {
        console.log('Performance Observer not fully supported');
    }
}