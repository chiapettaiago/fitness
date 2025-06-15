// Funções para o modal de detalhes do produto
document.addEventListener('DOMContentLoaded', function() {
    // Buscar todos os botões "VER DETALHES"
    const detailButtons = document.querySelectorAll('.btn-details');
    
    // Adicionar evento de clique a cada botão
    detailButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-product-id');
            openProductModal(productId);
        });
    });
    
    // Fechar modal quando clicar no X
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            closeProductModal();
        });
    });
    
    // Fechar modal ao clicar fora do conteúdo
    const modals = document.querySelectorAll('.product-modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeProductModal();
            }
        });
    });
    
    // Fechar modal com tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProductModal();
        }
    });
});

// Função para abrir o modal
function openProductModal(productId) {
    // Fazer requisição AJAX para obter os detalhes do produto
    fetch(`/api/product/${productId}`)
        .then(response => response.json())
        .then(product => {
            // Preencher o modal com os detalhes do produto
            document.getElementById('modalProductImage').src = product.image;
            document.getElementById('modalProductTitle').textContent = product.name;
            document.getElementById('modalProductDescription').textContent = product.description;
            document.getElementById('modalProductPrice').textContent = `R$ ${product.price.toFixed(2)}`;
            document.getElementById('modalAddToCartBtn').href = `/add_to_cart/${product.id}`;
            
            const modal = document.getElementById('productModal');
            const modalContent = document.querySelector('.product-modal-content');
            
            // Detecta se é um dispositivo móvel
            const isMobile = window.innerWidth < 768;
            
            if (isMobile) {
                // Ajuste para dispositivos móveis
                // Garantir que o conteúdo esteja visível e bem centralizado
                modalContent.scrollTop = 0;
                
                // Adicionar classe específica para mobile
                modal.classList.add('mobile-modal');
                
                // Posiciona o modal no centro da tela
                const windowHeight = window.innerHeight;
                const modalHeight = Math.min(windowHeight * 0.9, 600); // limita a altura a 90% da altura da tela
                
                // Aplicar estilos específicos para mobile
                modal.style.alignItems = 'center';
                modalContent.style.maxHeight = `${modalHeight}px`;
            } else {
                // Remove a classe mobile se existir
                modal.classList.remove('mobile-modal');
            }
            
            // Exibir o modal
            modal.style.display = 'flex';
            
            // Adicionar classe ao body para prevenir rolagem
            document.body.style.overflow = 'hidden';
        })
        .catch(error => console.error('Erro ao carregar detalhes do produto:', error));
}

// Função para fechar o modal
function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.style.display = 'none';
        
        // Remover classe do body para permitir rolagem
        document.body.style.overflow = '';
    }
}

// Ajuste do modal quando a orientação da tela mudar
window.addEventListener('resize', function() {
    const modal = document.getElementById('productModal');
    
    // Só faz o ajuste se o modal estiver aberto
    if (modal && modal.style.display === 'flex') {
        const modalContent = document.querySelector('.product-modal-content');
        const isMobile = window.innerWidth < 768;
        
        if (isMobile) {
            // Ajustes para dispositivo móvel
            modal.classList.add('mobile-modal');
            
            // Recentraliza o modal
            const windowHeight = window.innerHeight;
            const modalHeight = Math.min(windowHeight * 0.9, 600);
            
            modal.style.alignItems = 'center';
            modalContent.style.maxHeight = `${modalHeight}px`;
            
            // Certifica que o conteúdo está no topo após redimensionamento
            modalContent.scrollTop = 0;
        } else {
            // Remove ajustes móveis
            modal.classList.remove('mobile-modal');
            modalContent.style.maxHeight = '';
        }
    }
});

// Efeito de vidro líquido nos elementos
document.addEventListener('mousemove', function(e) {
    // Lista de todos os tipos de elementos que devem ter o efeito 3D
    const elements = document.querySelectorAll('.card, .featured-card, .login-card, .admin-card, .product-detail-card');
    
    elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const angleX = (centerY - y) / 20;
            const angleY = (x - centerX) / 20;
            
            element.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.02, 1.02, 1.02)`;
            element.style.boxShadow = `
                ${-angleY}px ${angleX}px 20px rgba(234, 76, 137, 0.3),
                0 10px 20px rgba(156, 39, 176, 0.2)
            `;
        }
    });
    
    // Efeito especial para botões
    const buttons = document.querySelectorAll('.btn-primary, .btn-success');
    buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        const distance = Math.sqrt(
            Math.pow(e.clientX - (rect.left + rect.width / 2), 2) +
            Math.pow(e.clientY - (rect.top + rect.height / 2), 2)
        );
        
        const maxDistance = 300;
        if (distance < maxDistance) {
            const intensity = 1 - distance / maxDistance;
            button.style.boxShadow = `0 0 ${20 * intensity}px ${10 * intensity}px rgba(234, 76, 137, 0.3)`;
        } else {
            button.style.boxShadow = '';
        }
    });
    
    // Efeito de reflexo dinâmico na página
    const background = document.querySelector('.page-background');
    if (background) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        const moveX = (e.clientX / windowWidth) * 5 - 2.5;
        const moveY = (e.clientY / windowHeight) * 5 - 2.5;
        
        background.style.backgroundPosition = `${50 + moveX}% ${50 + moveY}%`;
    }
});

// Resetar transformação ao tirar o mouse
document.addEventListener('mouseleave', function(e) {
    // Resetar todos os elementos com efeito 3D
    const elements = document.querySelectorAll('.card, .featured-card, .login-card, .admin-card, .product-detail-card');
    elements.forEach(element => {
        element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        element.style.boxShadow = 'var(--card-shadow)';
    });
    
    // Resetar botões
    const buttons = document.querySelectorAll('.btn-primary, .btn-success');
    buttons.forEach(button => {
        button.style.boxShadow = '';
    });
});

// Adicionar efeito de ondulação líquida ao fundo
document.addEventListener('DOMContentLoaded', function() {
    // Criar elementos de bolhas para o efeito líquido
    const pageBackground = document.querySelector('.page-background');
    if (pageBackground) {
        for (let i = 0; i < 12; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'liquid-bubble';
            
            // Estilo aleatório para cada bolha
            const size = Math.random() * 200 + 50;
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const duration = Math.random() * 30 + 15;
            const delay = Math.random() * 5;
            
            bubble.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${posX}%;
                top: ${posY}%;
                background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
                border-radius: 50%;
                filter: blur(20px);
                opacity: ${Math.random() * 0.3 + 0.1};
                animation: float ${duration}s ease-in-out ${delay}s infinite alternate;
                pointer-events: none;
            `;
            
            pageBackground.appendChild(bubble);
        }
    }
    
    // Adicionar stylesheet para animações
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0% {
                transform: translate(0, 0) rotate(0deg) scale(1);
            }
            100% {
                transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px) rotate(${Math.random() * 30}deg) scale(${Math.random() * 0.2 + 0.9});
            }
        }
    `;
    
    document.head.appendChild(style);
});

// Animações suavizadas para a página de carrinho
document.addEventListener('DOMContentLoaded', function() {
    // Verifica se estamos na página de carrinho
    if (window.location.pathname.includes('/cart')) {
        // Adiciona índices para animar as linhas da tabela sequencialmente
        const tableRows = document.querySelectorAll('.table tbody tr');
        tableRows.forEach((row, index) => {
            row.style.setProperty('--row-index', index);
        });
        
        // Efeito de movimento suave para itens do carrinho
        const cartItems = document.querySelectorAll('.cart-item-img');
        
        cartItems.forEach((item, index) => {
            // Pequena animação inicial para cada item
            setTimeout(() => {
                item.style.animation = 'none';
                item.style.transform = 'translateY(0)';
                item.classList.add('cart-animation');
            }, 100 * index);
            
            // Adiciona um efeito de flutuação suave
            setInterval(() => {
                const randomY = Math.random() * 3;
                item.animate(
                    [
                        { transform: 'translateY(0)' },
                        { transform: `translateY(-${randomY}px)` },
                        { transform: 'translateY(0)' }
                    ], 
                    {
                        duration: 2000 + Math.random() * 1000, 
                        iterations: 1, 
                        easing: 'ease-in-out',
                        fill: 'forwards'
                    }
                );
            }, 3000 + Math.random() * 1000);
        });
        
        // Efeito de vidro líquido para a tabela
        const cartTable = document.querySelector('.table');
        if (cartTable) {
            // Criar efeito de reflexo na tabela
            cartTable.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                this.style.background = `
                    radial-gradient(
                        circle at ${x}px ${y}px,
                        rgba(255, 255, 255, 0.2) 0%,
                        rgba(255, 255, 255, 0.1) 10%,
                        var(--glass-bg) 50%
                    )
                `;
            });
            
            cartTable.addEventListener('mouseleave', function() {
                this.style.background = 'var(--glass-bg)';
            });
        }
        
        // Anima os botões de remoção ao passar o mouse
        const removeButtons = document.querySelectorAll('.btn-danger.btn-sm');
        removeButtons.forEach(button => {
            button.addEventListener('mouseover', function() {
                // Efeito de pulsação ao passar o mouse
                this.animate([
                    { transform: 'scale(1)' },
                    { transform: 'scale(1.1)' },
                    { transform: 'scale(1)' }
                ], {
                    duration: 600,
                    iterations: 1,
                    easing: 'ease-in-out'
                });
            });
        });
    }
});

// Melhorias para navbar móvel com efeito de vidro líquido
document.addEventListener('DOMContentLoaded', function() {
    // Efeito para a navbar móvel
    const mobileNav = document.querySelector('.mobile-nav');
    if (mobileNav) {
        // Efeito de transparência ao rolar
        let lastScrollTop = 0;
        window.addEventListener('scroll', function() {
            const st = window.pageYOffset || document.documentElement.scrollTop;
            
            // Ajusta a transparência com base na direção de rolagem
            if (st > lastScrollTop) {
                // Rolando para baixo - torna mais transparente
                mobileNav.style.background = 'rgba(232, 62, 140, 0.7)';
                mobileNav.style.backdropFilter = 'blur(8px)';
            } else {
                // Rolando para cima - torna mais opaco
                mobileNav.style.background = 'rgba(232, 62, 140, 0.9)';
                mobileNav.style.backdropFilter = 'blur(12px)';
            }
            lastScrollTop = st <= 0 ? 0 : st; // Para dispositivos móveis ou bouncing
        });
        
        // Adicionando efeito de ripple nos itens do menu móvel
        const navItems = document.querySelectorAll('.mobile-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                // Criar elemento de ripple
                const circle = document.createElement('div');
                const rect = this.getBoundingClientRect();
                
                // Calcular diâmetro do círculo baseado na largura/altura do item
                const diameter = Math.max(rect.width, rect.height);
                const radius = diameter / 2;
                
                // Posicionar o círculo no ponto de clique
                circle.style.width = circle.style.height = `${diameter}px`;
                circle.style.left = `${e.clientX - rect.left - radius}px`;
                circle.style.top = `${e.clientY - rect.top - radius}px`;
                
                // Estilo do círculo
                circle.style.position = 'absolute';
                circle.style.borderRadius = '50%';
                circle.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                circle.style.animation = 'ripple 0.8s ease-out';
                circle.style.pointerEvents = 'none';
                
                // Adicionar estilo para animação de ripple
                if (!document.querySelector('style#ripple-style')) {
                    const style = document.createElement('style');
                    style.id = 'ripple-style';
                    style.innerHTML = `
                        @keyframes ripple {
                            from { transform: scale(0); opacity: 1; }
                            to { transform: scale(2); opacity: 0; }
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                // Adicionar o círculo ao item e remover depois da animação
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(circle);
                
                setTimeout(() => {
                    if (circle.parentNode) {
                        circle.parentNode.removeChild(circle);
                    }
                }, 800);
            });
        });
    }
});

// Melhorar comportamento do modal em dispositivos móveis
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('productModal');
    
    // Adicionar suporte para gestos de touch nos dispositivos móveis
    if (modal) {
        let touchStartY = 0;
        let touchMoveY = 0;
        let isDragging = false;
        
        modal.addEventListener('touchstart', function(e) {
            const modalContent = document.querySelector('.product-modal-content');
            
            // Somente permite arrasto se estiver no topo do conteúdo
            if (modalContent.scrollTop <= 0 && window.innerWidth < 768) {
                touchStartY = e.touches[0].clientY;
                isDragging = true;
                modalContent.style.transition = 'none';
            }
        }, { passive: true });
        
        modal.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            
            touchMoveY = e.touches[0].clientY;
            const modalContent = document.querySelector('.product-modal-content');
            const dragDistance = touchMoveY - touchStartY;
            
            // Permite puxar para baixo para fechar o modal (apenas limitado)
            if (dragDistance > 0 && dragDistance < 200) {
                modalContent.style.transform = `translateY(${dragDistance}px)`;
                modalContent.style.opacity = 1 - (dragDistance / 200);
            }
        }, { passive: true });
        
        modal.addEventListener('touchend', function(e) {
            if (!isDragging) return;
            
            const modalContent = document.querySelector('.product-modal-content');
            const dragDistance = touchMoveY - touchStartY;
            
            // Restaura o estilo e transições
            modalContent.style.transition = 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';
            
            // Se arrastou o suficiente, fecha o modal
            if (dragDistance > 100) {
                modalContent.style.transform = 'translateY(100vh)';
                modalContent.style.opacity = '0';
                setTimeout(closeProductModal, 300);
            } else {
                // Senão, retorna à posição normal
                modalContent.style.transform = '';
                modalContent.style.opacity = '';
            }
            
            isDragging = false;
        });
        
        // Impede scrolling do body quando estiver tocando no modal
        document.querySelector('.product-modal-content').addEventListener('touchmove', function(e) {
            // Se o usuário já chegou ao final do conteúdo, impede o scroll para evitar bounce
            const isAtTop = this.scrollTop === 0;
            const isAtBottom = this.scrollHeight - this.scrollTop === this.clientHeight;
            
            if ((isAtTop && e.touches[0].clientY > touchStartY) || 
                (isAtBottom && e.touches[0].clientY < touchStartY)) {
                e.preventDefault();
            }
        }, { passive: false });
    }
});
