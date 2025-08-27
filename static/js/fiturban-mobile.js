// Fiturban Mobile Functionality
document.addEventListener('DOMContentLoaded', function() {
    initMobileFunctionality();
    initMobileSidebarMenu();
});

function initMobileFunctionality() {
    // Configurar touch scroll suave para carrosseis
    enhanceMobileCarousels();
    
    // Configurar pull-to-refresh (opcional)
    if ('serviceWorker' in navigator) {
        enablePullToRefresh();
    }
    
    // Otimizar scroll performance
    optimizeScrollPerformance();
    
    // Configurar gestos touch
    initTouchGestures();
}

function initMobileSidebarMenu() {
    const openBtns = [
        document.getElementById('mobileMenuBtn'),
        document.getElementById('desktopMenuBtn')
    ].filter(Boolean);
    const closeBtn = document.getElementById('mobileMenuClose');
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('mobileSidebarOverlay');

    if (!sidebar || !overlay) return;

    // Garante estado inicial fechado
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    document.body.classList.remove('no-scroll');

    let isOpen = false;

    const openMenu = () => {
        if (isOpen) return;
        sidebar.classList.add('open');
        overlay.classList.add('show');
        document.body.classList.add('no-scroll');
        sidebar.setAttribute('aria-hidden', 'false');
        isOpen = true;
        // Foco acessível
        const firstLink = sidebar.querySelector('a, button');
        if (firstLink) firstLink.focus({ preventScroll: true });
    };

    const closeMenu = () => {
        if (!isOpen) return;
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
        document.body.classList.remove('no-scroll');
        sidebar.setAttribute('aria-hidden', 'true');
        isOpen = false;
        // Retorna foco ao botão de abertura
        const btn = openBtns[0];
        if (btn) btn.focus({ preventScroll: true });
    };

    openBtns.forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); openMenu(); }));
    if (closeBtn) closeBtn.addEventListener('click', (e) => { e.preventDefault(); closeMenu(); });
    overlay.addEventListener('click', closeMenu);

    // Fechar com ESC
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

    // Impedir scroll do body quando aberto
    const toggleScroll = () => {
        document.documentElement.style.overflow = isOpen ? 'hidden' : '';
        document.body.style.overflow = isOpen ? 'hidden' : '';
        document.body.style.touchAction = isOpen ? 'none' : '';
    };

    // Observar mudanças de estado
    const observer = new MutationObserver(() => toggleScroll());
    observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
}

function enhanceMobileCarousels() {
    const carousels = document.querySelectorAll('.products-carousel');
    
    carousels.forEach(carousel => {
        // Melhorar scroll horizontal no mobile
        carousel.style.overflowX = 'auto';
        carousel.style.scrollBehavior = 'smooth';
        carousel.style.webkitOverflowScrolling = 'touch';
        
        // Indicadores de scroll
        addScrollIndicators(carousel);
        
        // Auto-hide scrollbar
        carousel.addEventListener('scroll', debounce(() => {
            updateScrollPosition(carousel);
        }, 100));
    });
}

function addScrollIndicators(carousel) {
    const indicator = document.createElement('div');
    indicator.className = 'scroll-indicator';
    indicator.innerHTML = `
        <div class="scroll-dots">
            <span class="dot active"></span>
            <span class="dot"></span>
            <span class="dot"></span>
        </div>
    `;
    
    carousel.parentElement.appendChild(indicator);
}

function updateScrollPosition(carousel) {
    // Atualizar indicadores baseado na posição do scroll
    const scrollPercent = carousel.scrollLeft / (carousel.scrollWidth - carousel.clientWidth);
    const dots = carousel.parentElement.querySelectorAll('.dot');
    
    dots.forEach((dot, index) => {
        dot.classList.remove('active');
        if (index === Math.round(scrollPercent * (dots.length - 1))) {
            dot.classList.add('active');
        }
    });
}

function enablePullToRefresh() {
    let startY = 0;
    let pullDistance = 0;
    const threshold = 100;
    
    document.addEventListener('touchstart', function(e) {
        if (window.scrollY === 0) {
            startY = e.touches[0].clientY;
        }
    });
    
    document.addEventListener('touchmove', function(e) {
        if (window.scrollY === 0 && startY) {
            pullDistance = e.touches[0].clientY - startY;
            
            if (pullDistance > 0) {
                // Visual feedback do pull
                document.body.style.transform = `translateY(${Math.min(pullDistance / 3, 50)}px)`;
                
                if (pullDistance > threshold) {
                    // Mostrar indicador de refresh
                    showRefreshIndicator();
                }
            }
        }
    });
    
    document.addEventListener('touchend', function() {
        if (pullDistance > threshold) {
            // Refresh da página
            location.reload();
        }
        
        // Reset
        document.body.style.transform = '';
        pullDistance = 0;
        startY = 0;
        hideRefreshIndicator();
    });
}

function showRefreshIndicator() {
    let indicator = document.querySelector('.refresh-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'refresh-indicator';
        indicator.innerHTML = '<i class="bi bi-arrow-clockwise"></i><span>Solte para atualizar</span>';
        document.body.appendChild(indicator);
    }
    indicator.classList.add('show');
}

function hideRefreshIndicator() {
    const indicator = document.querySelector('.refresh-indicator');
    if (indicator) {
        indicator.classList.remove('show');
    }
}

function optimizeScrollPerformance() {
    // Lazy loading de imagens no mobile
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // Debounce scroll events
    let ticking = false;
    
    function updateOnScroll() {
        // Atualizar posições de elementos fixos
        updateFloatingElements();
        ticking = false;
    }
    
    document.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateOnScroll);
            ticking = true;
        }
    });
}

function updateFloatingElements() {
    const whatsappFloat = document.querySelector('.whatsapp-float');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (whatsappFloat && mobileNav) {
        const scrollY = window.scrollY;
        const documentHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        
        // Ocultar elementos flutuantes quando próximo ao final
        if (scrollY + windowHeight > documentHeight - 100) {
            whatsappFloat.style.opacity = '0.5';
            mobileNav.style.transform = 'translateY(10px)';
        } else {
            whatsappFloat.style.opacity = '1';
            mobileNav.style.transform = 'translateY(0)';
        }
    }
}

function initTouchGestures() {
    // Swipe gestures para navegação
    let startX = 0;
    let startY = 0;
    
    document.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', function(e) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Swipe horizontal (navegação entre páginas)
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 100) {
            if (diffX > 0) {
                // Swipe left - próxima página
                handleSwipeLeft();
            } else {
                // Swipe right - página anterior
                handleSwipeRight();
            }
        }
    });
}

function handleSwipeLeft() {
    // Lógica para swipe left (opcional)
    console.log('Swipe left detected');
}

function handleSwipeRight() {
    // Lógica para swipe right (opcional)
    console.log('Swipe right detected');
}

// Função de busca mobile
function openSearch() {
    const searchModal = document.createElement('div');
    searchModal.className = 'search-modal';
    searchModal.innerHTML = `
        <div class="search-backdrop" onclick="closeSearch()"></div>
        <div class="search-content">
            <div class="search-header">
                <input type="text" placeholder="Buscar produtos..." class="search-input" autofocus>
                <button onclick="closeSearch()" class="search-close">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
            <div class="search-suggestions">
                <div class="suggestion-item">Leggings</div>
                <div class="suggestion-item">Tops</div>
                <div class="suggestion-item">Shorts</div>
                <div class="suggestion-item">Conjuntos</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(searchModal);
    setTimeout(() => searchModal.classList.add('show'), 10);
}

function closeSearch() {
    const searchModal = document.querySelector('.search-modal');
    if (searchModal) {
        searchModal.classList.remove('show');
        setTimeout(() => searchModal.remove(), 300);
    }
}

// Utility functions
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

// CSS para funcionalidades mobile
const mobileStyles = `
.scroll-indicator {
    display: flex;
    justify-content: center;
    margin-top: 10px;
}

.scroll-dots {
    display: flex;
    gap: 6px;
}

.dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ddd;
    transition: background 0.3s ease;
}

.dot.active {
    background: #000;
}

.refresh-indicator {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(-100px);
    background: #000;
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 9999;
    transition: transform 0.3s ease;
}

.refresh-indicator.show {
    transform: translateX(-50%) translateY(0);
}

.search-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.search-modal.show {
    opacity: 1;
    visibility: visible;
}

.search-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
}

.search-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: white;
    transform: translateY(-100%);
    transition: transform 0.3s ease;
}

.search-modal.show .search-content {
    transform: translateY(0);
}

.search-header {
    display: flex;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #eee;
}

.search-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 16px;
    padding: 10px;
}

.search-close {
    background: none;
    border: none;
    font-size: 18px;
    padding: 5px;
    cursor: pointer;
}

.search-suggestions {
    padding: 20px 15px;
}

.suggestion-item {
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    color: #666;
    cursor: pointer;
}

.suggestion-item:hover {
    color: #000;
}

.whatsapp-float {
    transition: opacity 0.3s ease;
}

.mobile-nav {
    transition: transform 0.3s ease;
}

@media (max-width: 768px) {
    .scroll-indicator {
        display: flex;
    }
}

@media (min-width: 769px) {
    .scroll-indicator {
        display: none;
    }
}
`;

// Adicionar estilos
const mobileStyleSheet = document.createElement('style');
mobileStyleSheet.textContent = mobileStyles;
document.head.appendChild(mobileStyleSheet);
