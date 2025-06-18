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

// Função para abrir o modal com limpeza de estado
function openProductModal(productId) {
    // Primeiro, reseta qualquer estado de modal que possa estar pendente
    const existingModal = document.getElementById('productModal');
    const existingContent = document.querySelector('.product-modal-content');
    
    // Limpa estados anteriores para evitar comportamentos estranhos
    if (existingContent) {
        existingContent.style.transform = '';
        existingContent.style.opacity = '';
        existingContent.style.transition = '';
    }
    
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
            
            // Reseta posições e estilos
            if (modalContent) {
                modalContent.style.transform = '';
                modalContent.style.opacity = '';
                modalContent.scrollTop = 0;
            }
            
            if (isMobile) {
                // Ajuste para dispositivos móveis
                // Garantir que o conteúdo esteja visível e bem centralizado
                
                // Adicionar classe específica para mobile
                modal.classList.add('mobile-modal');
                
                // Posiciona o modal no centro da tela
                const windowHeight = window.innerHeight;
                const modalHeight = Math.min(windowHeight * 0.9, 600); // limita a altura a 90% da altura da tela
                
                // Aplicar estilos específicos para mobile
                modal.style.alignItems = 'center';
                if (modalContent) {
                    modalContent.style.maxHeight = `${modalHeight}px`;
                }
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

// Função para fechar o modal com limpeza adequada de estados
function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        // Primeiro, limpe quaisquer transformações pendentes
        const modalContent = document.querySelector('.product-modal-content');
        if (modalContent) {
            modalContent.style.transform = '';
            modalContent.style.opacity = '';
            modalContent.style.transition = '';
        }
        
        // Agora esconda o modal
        modal.style.display = 'none';
        
        // Remover classe do body para permitir rolagem
        document.body.style.overflow = '';
        
        // Pequeno atraso antes de limpar completamente todos os estilos inline
        setTimeout(() => {
            if (modalContent) {
                modalContent.removeAttribute('style');
            }
        }, 100);
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

// Efeito de vidro líquido nos elementos - versão super otimizada para desempenho
document.addEventListener('DOMContentLoaded', function() {
    // Verifica o nível de performance e ajusta os efeitos
    const perfUtils = window.perfUtils;
    const perfParams = perfUtils.performanceLevel.getParams();
    
    if (!perfParams[perfParams.level].animationsEnabled) {
        // Se as animações estiverem desativadas, não adiciona efeitos pesados
        console.log('Animações desativadas devido às preferências de usuário ou limitações do dispositivo');
        return;
    }
    
    // Seleciona os elementos que devem ter o efeito 3D
    const allElements = document.querySelectorAll('.card, .featured-card, .login-card, .admin-card, .product-detail-card');
    
    // Registra os elementos no gerenciador de visibilidade
    allElements.forEach(element => {
        perfUtils.visibilityManager.observe(
            element,
            // Quando o elemento fica visível
            (el) => {
                // Adiciona classe para indicar que o elemento está ativo para animações
                el.classList.add('anim-active');
            },
            // Quando o elemento não está mais visível
            (el) => {
                // Remove classe para desativar animações
                el.classList.remove('anim-active');
            }
        );
    });
    
    // Referências ao estado do mouse
    let mouseX = 0, mouseY = 0;
    let lastMouseX = 0, lastMouseY = 0;
    
    // Monitora a posição do mouse em todo o documento
    document.addEventListener('mousemove', perfUtils.throttle(function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, perfParams[perfParams.level].throttleTime));
    
    // Registra o efeito de vidro líquido no otimizador de animações
    perfUtils.animationOptimizer.add('glassEffect', function() {
        // Verifica se a posição do mouse mudou significativamente
        if (Math.abs(mouseX - lastMouseX) < 2 && Math.abs(mouseY - lastMouseY) < 2) {
            return; // Pula o frame se o mouse não se moveu o suficiente
        }
        
        // Atualiza as posições anteriores
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        
        // Obtém apenas os elementos com a classe 'anim-active' (visíveis)
        const activeElements = document.querySelectorAll('.card.anim-active, .featured-card.anim-active, .login-card.anim-active, .admin-card.anim-active, .product-detail-card.anim-active');
        
        // Aplica o efeito 3D apenas aos elementos ativos
        activeElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            
            const x = mouseX - rect.left;
            const y = mouseY - rect.top;
            
            if (x > -100 && x < rect.width + 100 && y > -100 && y < rect.height + 100) {
                // Limita o ângulo para elementos próximos ao mouse
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Calcula o ângulo com base na distância do mouse ao centro
                let angleX = (centerY - y) / 20;
                let angleY = (x - centerX) / 20;
                
                // Limita o ângulo máximo
                angleX = Math.min(Math.max(angleX, -5), 5);
                angleY = Math.min(Math.max(angleY, -5), 5);
                
                // Aplica a transformação
                element.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.02, 1.02, 1.02)`;
                element.style.boxShadow = `
                    ${-angleY}px ${angleX}px 20px rgba(234, 76, 137, 0.3),
                    0 10px 20px rgba(156, 39, 176, 0.2)
                `;
            }
        });
    });
    
    // Registra efeito para botões como animação de baixa prioridade
    perfUtils.animationOptimizer.add('buttonEffect', function() {
        // Só processa a cada segundo frame para economizar recursos
        if (Date.now() % 2 === 0) return;
        
        // Obtém apenas botões visíveis
        const buttons = document.querySelectorAll('.btn-primary.anim-active, .btn-success.anim-active');
        
        buttons.forEach(button => {
            const rect = button.getBoundingClientRect();
            const distance = Math.sqrt(
                Math.pow(mouseX - (rect.left + rect.width / 2), 2) +
                Math.pow(mouseY - (rect.top + rect.height / 2), 2)
            );
            
            const maxDistance = 300;
            if (distance < maxDistance) {
                const intensity = 1 - distance / maxDistance;
                button.style.boxShadow = `0 0 ${20 * intensity}px ${10 * intensity}px rgba(234, 76, 137, 0.3)`;
            } else {
                button.style.boxShadow = '';
            }
        });
    }, null);
    // Define como baixa prioridade
    perfUtils.animationOptimizer.setPriority('buttonEffect', 'low');
    
    // Efeito de reflexo dinâmico na página - registrado separadamente com prioridade baixa
    let lastBgUpdate = 0;
    perfUtils.animationOptimizer.add('backgroundEffect', function() {
        // Limita a taxa de atualização do fundo (a cada 100ms)
        const now = Date.now();
        if (now - lastBgUpdate < 100) return;
        lastBgUpdate = now;
        
        const background = document.querySelector('.page-background');
        if (background) {
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            
            const moveX = (mouseX / windowWidth) * 5 - 2.5;
            const moveY = (mouseY / windowHeight) * 5 - 2.5;
            
            background.style.backgroundPosition = `${50 + moveX}% ${50 + moveY}%`;
        }
    }, null);
    // Define como baixa prioridade
    perfUtils.animationOptimizer.setPriority('backgroundEffect', 'low');
    
    // Registra elementos de UI para efeitos de glassmorphism
    document.querySelectorAll('.btn, .card, .navbar, .mobile-nav, .product-modal-content').forEach(el => {
        perfUtils.visibilityManager.observe(el, 
            // Quando visível
            (element) => element.classList.add('anim-active'),
            // Quando não visível
            (element) => element.classList.remove('anim-active')
        );
    });
});

// Resetar transformação ao tirar o mouse - versão super otimizada para desempenho
document.addEventListener('DOMContentLoaded', function() {
    // Verifica o nível de performance
    const perfUtils = window.perfUtils;
    const perfParams = perfUtils.performanceLevel.getParams();
    
    if (!perfParams[perfParams.level].animationsEnabled) return;
    
    // Registro de eventos de mouseleave para elementos animados
    document.addEventListener('mouseleave', perfUtils.debounce(function() {
        // Reseta todas as transformações quando o mouse sai do documento
        resetAllTransforms();
    }, 100));
    
    // Função para resetar todas as transformações
    function resetAllTransforms() {
        // Usa requestAnimationFrame para sincronizar com o refresh do navegador
        requestAnimationFrame(() => {
            // Reseta apenas elementos com classe anim-active (visíveis)
            const elements = document.querySelectorAll('.card.anim-active, .featured-card.anim-active, .login-card.anim-active, .admin-card.anim-active, .product-detail-card.anim-active');
            
            elements.forEach(element => {
                element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
                element.style.boxShadow = 'var(--card-shadow)';
                
                // Inicia uma transição suave para o estado normal
                element.classList.add('reset-transition');
                
                // Remove a classe após a transição terminar
                setTimeout(() => {
                    element.classList.remove('reset-transition');
                }, 300);
            });
            
            // Resetar botões visíveis
            const buttons = document.querySelectorAll('.btn-primary.anim-active, .btn-success.anim-active');
            buttons.forEach(button => {
                button.style.boxShadow = '';
            });
        });
    }
    
    // Monitor de inatividade para pausar animações quando o usuário está inativo
    let inactivityTimer;
    
    function setupInactivityMonitor() {
        // Reseta o timer quando há interação do usuário
        const resetInactivityTimer = () => {
            clearTimeout(inactivityTimer);
            
            // Se as animações estavam pausadas, retoma
            if (window.animationsPaused) {
                window.animationsPaused = false;
                perfUtils.animationOptimizer.resume('glassEffect');
                perfUtils.animationOptimizer.resume('buttonEffect');
                perfUtils.animationOptimizer.resume('backgroundEffect');
            }
            
            // Define novo timer
            inactivityTimer = setTimeout(() => {
                // Pausa animações após 5 segundos de inatividade
                window.animationsPaused = true;
                perfUtils.animationOptimizer.pause('glassEffect');
                perfUtils.animationOptimizer.pause('buttonEffect');
                perfUtils.animationOptimizer.pause('backgroundEffect');
                
                // Reseta todas as transformações
                resetAllTransforms();
            }, 5000);
        };
        
        // Monitora eventos de interação
        ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'].forEach(eventType => {
            document.addEventListener(eventType, perfUtils.throttle(resetInactivityTimer, 500));
        });
        
        // Inicia o timer
        resetInactivityTimer();
    }
    
    // Configura o monitor de inatividade
    setupInactivityMonitor();
});

// Adicionar efeito de ondulação líquida ao fundo - otimizado para desempenho
document.addEventListener('DOMContentLoaded', function() {
    // Verifica o nível de desempenho antes de adicionar efeitos pesados
    const perfUtils = window.perfUtils;
    const perfParams = perfUtils.performanceLevel.getParams();
    
    // Somente adiciona bolhas se o dispositivo suportar efeitos de partículas
    if (!perfParams[perfParams.level].particleEffects) {
        console.log('Efeitos de partículas desativados para melhorar o desempenho');
        return;
    }
    
    // Número de bolhas baseado no desempenho do dispositivo
    let bubbleCount = 6; // Padrão para dispositivos de nível médio
    
    if (perfParams.level === 'high') {
        bubbleCount = 12; // Mais bolhas para dispositivos potentes
    } else if (perfParams.level === 'low') {
        bubbleCount = 3; // Poucas bolhas para dispositivos com limitações
    }
    
    // Criar elementos de bolhas para o efeito líquido
    const pageBackground = document.querySelector('.page-background');
    if (pageBackground) {
        // Cria todas as bolhas de uma vez para evitar reflow repetido
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'liquid-bubble';
            
            // Estilo aleatório para cada bolha
            const size = Math.random() * 200 + 50;
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const duration = Math.random() * 30 + 15;
            const delay = Math.random() * 5;
            
            // Usar menos blur e gradientes para melhorar o desempenho
            let blurAmount = perfParams.level === 'high' ? 20 : 10;
            
            bubble.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${posX}%;
                top: ${posY}%;
                background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
                border-radius: 50%;
                filter: blur(${blurAmount}px);
                opacity: ${Math.random() * 0.3 + 0.1};
                animation: float ${duration}s ease-in-out ${delay}s infinite alternate;
                pointer-events: none;
                will-change: transform, opacity;
                transform: translateZ(0);
            `;
            
            // Adiciona ao fragment para inserir tudo de uma vez
            fragment.appendChild(bubble);
        }
        
        // Adiciona todas as bolhas de uma vez só para evitar múltiplos reflows
        pageBackground.appendChild(fragment);
        
        // Pausa as animações quando a página não está visível
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                // Pausa as animações quando a página está em segundo plano
                pageBackground.classList.add('animations-paused');
            } else {
                // Retoma as animações quando a página volta ao foco
                pageBackground.classList.remove('animations-paused');
            }
        });
    }
    
    // Adicionar stylesheet para animações - otimizado com transform em vez de múltiplas propriedades
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0% {
                transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
            }
            100% {
                transform: translate3d(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px, 0) rotate(${Math.random() * 30}deg) scale(${Math.random() * 0.2 + 0.9});
            }
        }
        
        .animations-paused .liquid-bubble {
            animation-play-state: paused !important;
        }
    `;
    
    document.head.appendChild(style);
});

// Animações super-otimizadas para a página de carrinho
document.addEventListener('DOMContentLoaded', function() {
    // Verifica se estamos na página de carrinho
    if (window.location.pathname.includes('/cart')) {
        // Verifica o nível de performance e ajusta os efeitos
        const perfUtils = window.perfUtils;
        const perfParams = perfUtils.performanceLevel.getParams();
        
        // Decide o comportamento de animação com base no nível de desempenho
        let animationsEnabled = perfParams[perfParams.level].animationsEnabled;
        let animationDelay = 50; // Padrão
        
        if (perfParams.level === 'low') {
            animationDelay = 0; // Sem delay para dispositivos lentos
        } else if (perfParams.level === 'medium') {
            animationDelay = 30; // Delay reduzido para dispositivos médios
        }
        
        // Se as animações forem permitidas, adiciona efeito sequencial
        if (animationsEnabled) {
            // Adia a animação para depois do carregamento da página
            setTimeout(() => {
                // Adiciona índices para animar as linhas da tabela sequencialmente
                const tableRows = document.querySelectorAll('.table tbody tr');
                
                // Usa IntersectionObserver para animar apenas linhas visíveis
                tableRows.forEach((row, index) => {
                    row.style.setProperty('--row-index', index);
                    row.style.setProperty('--animation-delay', `${index * animationDelay}ms`);
                    
                    // Observa se a linha da tabela está visível
                    perfUtils.visibilityManager.observe(
                        row,
                        // Quando for visível
                        (element) => {
                            // Usa requestIdleCallback para não bloquear a UI
                            perfUtils.requestIdleCallback(() => {
                                element.classList.add('animated-row');
                            });
                        },
                        // Quando não for visível
                        (element) => {
                            element.classList.remove('animated-row');
                        }
                    );
                });
            }, 100); // Pequeno atraso para permitir que a página carregue primeiro
        } else {
            // Se animações estiverem desativadas, mostra tudo de uma vez
            document.querySelectorAll('.table tbody tr').forEach(row => {
                row.style.opacity = 1;
            });
        }
        
        if (perfParams.animationsEnabled) {
            // Efeito de movimento suave para itens do carrinho
            const cartItems = document.querySelectorAll('.cart-item-img');
            
            // Contador para limitar o número de animações simultâneas
            let activeAnimations = 0;
            
            cartItems.forEach((item, index) => {
                // Observamos a visibilidade de cada item
                window.perfUtils.visibilityManager.observe(
                    item,
                    // Quando visível
                    (element) => {
                        // Limita o número máximo de animações simultâneas
                        if (activeAnimations < 5) {
                            activeAnimations++;
                            
                            // Pequena animação inicial para cada item - com delay para não sobrecarregar
                            setTimeout(() => {
                                element.style.animation = 'none';
                                element.style.transform = 'translateY(0)';
                                element.classList.add('cart-animation');
                                
                                // Usa requestAnimationFrame para animação mais eficiente
                                let animationId;
                                
                                // Função para animar com requestAnimationFrame
                                const animateFloat = () => {
                                    // Efeito de flutuação com pequena intensidade
                                    const randomY = Math.random() * (perfParams.transitionSpeed * 6);
                                    
                                    element.animate(
                                        [
                                            { transform: 'translateY(0)' },
                                            { transform: `translateY(-${randomY}px)` },
                                            { transform: 'translateY(0)' }
                                        ], 
                                        {
                                            duration: 2000 + Math.random() * 1000, 
                                            iterations: 1, 
                                            easing: 'ease-in-out'
                                        }
                                    );
                                    
                                    // Agenda a próxima animação com intervalo adaptado ao nível de performance
                                    animationId = setTimeout(() => {
                                        requestAnimationFrame(animateFloat);
                                    }, 3000 + Math.random() * 2000);
                                };
                                
                                // Inicia a animação
                                animationId = setTimeout(() => {
                                    requestAnimationFrame(animateFloat);
                                }, 500 * index);
                                
                                // Armazena o ID da animação no elemento para poder cancelá-la depois
                                element._animationId = animationId;
                                
                            }, 100 * Math.min(index, 5)); // Limita o atraso máximo
                        }
                    },
                    // Quando não visível, cancela a animação para economizar recursos
                    (element) => {
                        if (element._animationId) {
                            clearTimeout(element._animationId);
                            activeAnimations = Math.max(0, activeAnimations - 1);
                        }
                    }
                );
            });
            
            // Efeito de vidro líquido para a tabela - otimizado
            const cartTable = document.querySelector('.table');
            if (cartTable && perfParams.blurEffects) {
                // Criar efeito de reflexo na tabela com throttle para limitar atualizações
                cartTable.addEventListener('mousemove', window.perfUtils.throttle(function(e) {
                    const rect = this.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    // Atualiza o gradiente usando requestAnimationFrame
                    requestAnimationFrame(() => {
                        this.style.background = `
                            radial-gradient(
                                circle at ${x}px ${y}px,
                                rgba(255, 255, 255, 0.2) 0%,
                                rgba(255, 255, 255, 0.1) 10%,
                                var(--glass-bg) 50%
                            )
                        `;
                    });
                }, 50)); // Atualiza a cada 50ms no máximo
                
                cartTable.addEventListener('mouseleave', function() {
                    // Usa requestAnimationFrame para sincronizar com o refresh do navegador
                    requestAnimationFrame(() => {
                        this.style.background = 'var(--glass-bg)';
                    });
                });
            }
            
            // Anima os botões de remoção ao passar o mouse - otimizado
            const removeButtons = document.querySelectorAll('.btn-danger.btn-sm');
            
            if (perfParams.animationsEnabled) {
                removeButtons.forEach(button => {
                    button.addEventListener('mouseover', window.perfUtils.debounce(function() {
                        // Efeito de pulsação ao passar o mouse
                        this.animate([
                            { transform: 'scale(1)' },
                            { transform: 'scale(1.1)' },
                            { transform: 'scale(1)' }
                        ], {
                            duration: 600 * perfParams.transitionSpeed,
                            iterations: 1,
                            easing: 'ease-in-out'
                        });
                    }, 150)); // Evita ativar a animação várias vezes rapidamente
                });
            }
        }
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

// Melhorar comportamento do modal em dispositivos móveis com melhor gestão de estado
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('productModal');
    
    // Adicionar suporte para gestos de touch nos dispositivos móveis
    if (modal) {
        let touchStartY = 0;
        let touchMoveY = 0;
        let isDragging = false;
        let modalContent = null;
        
        // Função para resetar o estado do modal completamente
        function resetModalState() {
            if (modalContent) {
                modalContent.style.transition = '';
                modalContent.style.transform = '';
                modalContent.style.opacity = '';
            }
            isDragging = false;
            touchStartY = 0;
            touchMoveY = 0;
        }
        
        // Função para limpar o estado quando o modal é fechado
        function cleanupModalState() {
            resetModalState();
            
            // Importante: remover qualquer transformação que possa ter permanecido
            const allModals = document.querySelectorAll('.product-modal-content');
            allModals.forEach(content => {
                content.style.transform = '';
                content.style.opacity = '';
                content.style.transition = '';
            });
        }
        
        modal.addEventListener('touchstart', function(e) {
            // Sempre pega a referência atualizada ao conteúdo do modal
            modalContent = document.querySelector('.product-modal-content');
            
            // Somente permite arrasto se estiver no topo do conteúdo
            if (modalContent && modalContent.scrollTop <= 0 && window.innerWidth < 768) {
                touchStartY = e.touches[0].clientY;
                isDragging = true;
                modalContent.style.transition = 'none';
            }
        }, { passive: true });
        
        modal.addEventListener('touchmove', function(e) {
            if (!isDragging || !modalContent) return;
            
            touchMoveY = e.touches[0].clientY;
            const dragDistance = touchMoveY - touchStartY;
            
            // Permite puxar para baixo para fechar o modal (apenas limitado)
            if (dragDistance > 0 && dragDistance < 200) {
                modalContent.style.transform = `translateY(${dragDistance}px)`;
                modalContent.style.opacity = 1 - (dragDistance / 200);
            }
        }, { passive: true });
        
        modal.addEventListener('touchend', function(e) {
            if (!isDragging || !modalContent) return;
            
            const dragDistance = touchMoveY - touchStartY;
            
            // Restaura o estilo e transições
            modalContent.style.transition = 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';
            
            // Se arrastou o suficiente, fecha o modal
            if (dragDistance > 100) {
                modalContent.style.transform = 'translateY(100vh)';
                modalContent.style.opacity = '0';
                setTimeout(function() {
                    closeProductModal();
                    cleanupModalState();
                }, 300);
            } else {
                // Senão, retorna à posição normal
                modalContent.style.transform = '';
                modalContent.style.opacity = '';
                resetModalState();
            }
        });
        
        // Impede scrolling do body quando estiver tocando no modal
        modal.addEventListener('touchmove', function(e) {
            const content = document.querySelector('.product-modal-content');
            if (!content) return;
            
            // Se o usuário já chegou ao final do conteúdo, impede o scroll para evitar bounce
            const isAtTop = content.scrollTop <= 0;
            const isAtBottom = Math.abs(content.scrollHeight - content.scrollTop - content.clientHeight) < 1;
            
            if ((isAtTop && e.touches[0].clientY > touchStartY) || 
                (isAtBottom && e.touches[0].clientY < touchStartY)) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Garantir que o estado seja limpo quando o modal for fechado por outros meios
        document.querySelectorAll('.modal-close, .btn-outline-dark').forEach(el => {
            el.addEventListener('click', cleanupModalState);
        });
        
        // Limpar estado quando escapar
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                cleanupModalState();
            }
        });
    }
});
