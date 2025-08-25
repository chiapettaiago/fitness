// Fiturban Style Carousel Controller
document.addEventListener('DOMContentLoaded', function() {
    // Configurar carrosseis
    initCarousels();
    
    // Configurar quick view
    initQuickView();
    
    // Configurar hero slider
    initHeroSlider();
});

function initCarousels() {
    const carousels = ['featuredCarousel', 'bestsellersCarousel'];
    
    carousels.forEach(carouselId => {
        const carousel = document.getElementById(carouselId);
        if (!carousel) return;
        
        const prevBtn = document.getElementById(carouselId.replace('Carousel', 'Prev'));
        const nextBtn = document.getElementById(carouselId.replace('Carousel', 'Next'));
        
        if (prevBtn && nextBtn) {
            // Controle de navegação
            prevBtn.addEventListener('click', () => scrollCarousel(carousel, -1));
            nextBtn.addEventListener('click', () => scrollCarousel(carousel, 1));
            
            // Auto scroll suave no mobile
            if (window.innerWidth <= 768) {
                enableTouchScroll(carousel);
            }
            
            // Atualizar botões baseado na posição
            carousel.addEventListener('scroll', () => updateCarouselButtons(carousel, prevBtn, nextBtn));
            
            // Inicializar estado dos botões
            updateCarouselButtons(carousel, prevBtn, nextBtn);
        }
    });
}

function scrollCarousel(carousel, direction) {
    const cardWidth = carousel.querySelector('.product-card').offsetWidth;
    const gap = 20; // gap entre cards
    const scrollAmount = (cardWidth + gap) * 2; // move 2 cards por vez
    
    carousel.scrollBy({
        left: scrollAmount * direction,
        behavior: 'smooth'
    });
}

function updateCarouselButtons(carousel, prevBtn, nextBtn) {
    const isAtStart = carousel.scrollLeft <= 0;
    const isAtEnd = carousel.scrollLeft >= (carousel.scrollWidth - carousel.clientWidth - 10);
    
    prevBtn.disabled = isAtStart;
    nextBtn.disabled = isAtEnd;
    
    // Visual feedback
    prevBtn.style.opacity = isAtStart ? '0.5' : '1';
    nextBtn.style.opacity = isAtEnd ? '0.5' : '1';
}

function enableTouchScroll(carousel) {
    let isDown = false;
    let startX;
    let scrollLeft;
    
    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        carousel.classList.add('active');
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });
    
    carousel.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.classList.remove('active');
    });
    
    carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.classList.remove('active');
    });
    
    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
    });
}

function initQuickView() {
    // Quick view para produtos
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-quick-view')) {
            e.preventDefault();
            const productId = e.target.closest('.btn-quick-view').dataset.productId;
            showProductQuickView(productId);
        }
    });
}

function showProductQuickView(productId) {
    // Adicionar loading state
    const btn = document.querySelector(`[data-product-id="${productId}"]`);
    if (btn) {
        btn.classList.add('loading');
        btn.innerHTML = '<i class="bi bi-hourglass-split"></i>';
    }
    
    // Fetch product details
    fetch(`/api/product/${productId}`)
        .then(response => response.json())
        .then(product => {
            showQuickViewModal(product);
        })
        .catch(error => {
            console.error('Erro ao carregar produto:', error);
            alert('Erro ao carregar detalhes do produto');
        })
        .finally(() => {
            // Remover loading state
            if (btn) {
                btn.classList.remove('loading');
                btn.innerHTML = '<i class="bi bi-eye"></i>';
            }
        });
}

function showQuickViewModal(product) {
    // Criar modal dinâmico
    const modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    modal.innerHTML = `
        <div class="quick-view-backdrop" onclick="closeQuickView()"></div>
        <div class="quick-view-content">
            <button class="quick-view-close" onclick="closeQuickView()">
                <i class="bi bi-x-lg"></i>
            </button>
            <div class="row">
                <div class="col-md-6">
                    <div class="quick-view-image">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="quick-view-info">
                        <h3>${product.name}</h3>
                        <p class="product-code">PRETO | ${product.id}</p>
                        <div class="quick-view-price">
                            <span class="price-main">R$ ${product.price.toFixed(2)}</span>
                            <span class="price-installment">10% off no PIX ou</span>
                            <span class="price-installment">10x de R$ ${(product.price / 10).toFixed(2)}</span>
                        </div>
                        <div class="size-selector">
                            <label>Tamanho:</label>
                            <div class="size-options">
                                <button class="size-btn">P</button>
                                <button class="size-btn">M</button>
                                <button class="size-btn active">G</button>
                                <button class="size-btn">GG</button>
                            </div>
                        </div>
                        <div class="quick-view-actions">
                            <a href="/add_to_cart/${product.id}" class="btn-add-cart">
                                <i class="bi bi-bag-plus"></i>
                                ADICIONAR AO CARRINHO
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animação de entrada
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Configurar seletor de tamanho
    modal.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            modal.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function closeQuickView() {
    const modal = document.querySelector('.quick-view-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Estilo para modal quick view
const quickViewStyles = `
.quick-view-modal {
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

.quick-view-modal.show {
    opacity: 1;
    visibility: visible;
}

.quick-view-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.8);
    backdrop-filter: blur(5px);
}

.quick-view-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 12px;
    max-width: 800px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    padding: 30px;
}

.quick-view-close {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #666;
    z-index: 1;
}

.quick-view-image img {
    width: 100%;
    border-radius: 8px;
}

.quick-view-info h3 {
    font-size: 24px;
    font-weight: 700;
    color: #000;
    margin-bottom: 8px;
    text-transform: uppercase;
}

.quick-view-price {
    margin: 20px 0;
}

.size-selector {
    margin: 25px 0;
}

.size-selector label {
    display: block;
    font-weight: 600;
    margin-bottom: 10px;
    color: #333;
}

.size-options {
    display: flex;
    gap: 8px;
}

.size-btn {
    width: 40px;
    height: 40px;
    border: 2px solid #e0e0e0;
    background: white;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.size-btn:hover,
.size-btn.active {
    border-color: #000;
    background: #000;
    color: white;
}

.quick-view-actions .btn-add-cart {
    width: 100%;
    padding: 15px;
    background: #000;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s ease;
}

.quick-view-actions .btn-add-cart:hover {
    background: #333;
    color: white;
}

@media (max-width: 768px) {
    .quick-view-content {
        padding: 20px;
    }
    
    .quick-view-info h3 {
        font-size: 20px;
    }
}
`;

// Adicionar estilos ao head
const styleSheet = document.createElement('style');
styleSheet.textContent = quickViewStyles;
document.head.appendChild(styleSheet);

// === HERO SLIDER (3 ITENS) ===
function initHeroSlider() {
    const slides = Array.from(document.querySelectorAll('.hero-slider .hero-slide'));
    if (!slides.length) return;
    const prev = document.querySelector('.hero-slider .hero-nav.prev');
    const next = document.querySelector('.hero-slider .hero-nav.next');
    const dotsWrap = document.querySelector('.hero-slider .hero-dots');
    const status = document.getElementById('hero-status');
    let index = 0;
    let timer;

    // Criar dots
    slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.setAttribute('aria-label', `Ir para slide ${i+1}`);
        b.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(b);
    });

    function update() {
        slides.forEach((s, i) => s.classList.toggle('active', i === index));
        dotsWrap.querySelectorAll('button').forEach((d, i) => d.classList.toggle('active', i === index));
        if (status) status.textContent = `Slide ${index+1} de ${slides.length}`;
    }

    function goTo(i) {
        index = (i + slides.length) % slides.length;
        update();
        restart();
    }

    function nextSlide() { goTo(index + 1); }
    function prevSlide() { goTo(index - 1); }

    function start() {
        stop();
        timer = setInterval(nextSlide, 5000);
    }
    function stop() { if (timer) clearInterval(timer); }
    function restart() { start(); }

    // Listeners
    next?.addEventListener('click', nextSlide);
    prev?.addEventListener('click', prevSlide);
    const slider = document.querySelector('.hero-slider');
    slider?.addEventListener('mouseenter', stop);
    slider?.addEventListener('mouseleave', start);

    // Touch swipe
    let touchStartX = 0;
    slider?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, {passive:true});
    slider?.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) {
            if (dx < 0) nextSlide(); else prevSlide();
        }
    });

    // Init
    update();
    start();
}
