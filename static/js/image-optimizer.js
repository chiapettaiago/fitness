/**
 * Otimizador de imagens para melhorar o desempenho
 * Versão 2.0 - Simplificada e mais estável
 */

// Função principal que será executada quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Usa uma abordagem defensiva para evitar erros caso window.perfUtils não esteja disponível
    setTimeout(function() {
        try {
            initImageOptimizer();
        } catch (error) {
            console.warn('Erro ao inicializar otimizador de imagens:', error);
            // Tenta inicializar uma versão simplificada
            initSimpleOptimizer();
        }
    }, 300); // Pequeno delay para garantir que perfUtils esteja carregado
});

// Versão principal do otimizador
function initImageOptimizer() {
    // Verifica se perfUtils está disponível
    if (!window.perfUtils) {
        throw new Error("Performance utils não disponível");
    }
    
    // Define qualidade da imagem baseada no nível de performance
    let imageQuality = 'high'; // padrão
    
    try {
        const perfParams = window.perfUtils.performanceLevel.getParams();
        if (perfParams && perfParams.level) {
            if (perfParams[perfParams.level] && perfParams[perfParams.level].imageQuality) {
                imageQuality = perfParams[perfParams.level].imageQuality;
            } else {
                // Fallback baseado apenas no nível
                imageQuality = perfParams.level === 'low' ? 'low' : 
                               perfParams.level === 'medium' ? 'medium' : 'high';
            }
        }
    } catch (e) {
        console.log("Usando qualidade padrão para imagens");
    }
    
    // Carregamento lazy otimizado com base no nível de desempenho
    function setupLazyImages() {
        // Detecta suporte nativo a lazy loading
        const hasNativeLazy = 'loading' in HTMLImageElement.prototype;
        
        // Procura por todas as imagens de produtos
        const productImages = document.querySelectorAll('.product-image, .modal-image, .card-img-top');
        
        productImages.forEach(img => {
            // Somente processa imagens que têm src (não processadas anteriormente)
            if (!img.dataset.processed) {
                // Marca a imagem como processada para evitar duplicação
                img.dataset.processed = 'true';
                
                // Obtém a URL original da imagem
                const originalSrc = img.src || img.dataset.src;
                if (!originalSrc) return;
                
                // Se já tem a URL de baixa qualidade, usa ela
                const lowQualitySrc = img.dataset.lowSrc || generateLowQualityUrl(originalSrc);
                
                // Usa a classe do otimizador de recursos para carregar a imagem adequada
                perfUtils.resourceOptimizer.loadImage(img, originalSrc, lowQualitySrc);
                
                // Adiciona suporte a lazy loading nativo quando disponível
                if (hasNativeLazy) {
                    img.loading = 'lazy';
                }
                
                // Adiciona efeito de blur quando a imagem está carregando (somente em dispositivos com boa performance)
                if (perfParams.level !== 'low') {
                    addBlurEffect(img, lowQualitySrc);
                }
            }
        });
    }
    
    // Gera URL para versão de baixa qualidade da imagem
    // Esta é uma função de exemplo - em produção, você teria um serviço real de geração de thumbnails
    function generateLowQualityUrl(originalUrl) {
        // Simulação - em produção você teria um CDN real que manipula as imagens
        if (originalUrl.includes('?')) {
            return originalUrl + '&quality=low&w=100';
        } else {
            return originalUrl + '?quality=low&w=100';
        }
    }
    
    // Adiciona efeito de blur durante o carregamento
    function addBlurEffect(img, lowQualitySrc) {
        // Salva a classe original
        const originalClass = img.className;
        
        // Adiciona classe de blur
        img.classList.add('loading-blur');
        
        // Quando a imagem carregar, remove o blur suavemente
        img.onload = function() {
            // Remove o blur com transição suave
            setTimeout(() => {
                img.classList.remove('loading-blur');
            }, 100);
        };
        
        // Se ocorrer erro, também remove o blur
        img.onerror = function() {
            img.classList.remove('loading-blur');
        };
    }
    
    // Verifica quando novos elementos são adicionados ao DOM (por exemplo, em cards dinâmicos)
    function observeDOMChanges() {
        // Cria uma instância de MutationObserver
        const observer = new MutationObserver((mutations) => {
            let hasNewImages = false;
            
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.tagName === 'IMG' || 
                                node.classList?.contains('card') || 
                                node.classList?.contains('product-modal-content')) {
                                hasNewImages = true;
                                break;
                            }
                        }
                    }
                }
            });
            
            // Se identificar novos elementos que podem conter imagens, reprocessa
            if (hasNewImages) {
                setupLazyImages();
            }
        });
        
        // Inicia a observação
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Inicializa a otimização
    setupLazyImages();
    
    // Observa mudanças no DOM para processar novas imagens
    observeDOMChanges();
    
    // Adiciona CSS para o efeito de blur
    const style = document.createElement('style');
    style.textContent = `
        .loading-blur {
            filter: blur(8px);
            transition: filter 0.3s ease-out;
        }
        
        @media (prefers-reduced-motion: reduce) {
            .loading-blur {
                filter: none;
            }
        }
    `;
    document.head.appendChild(style);
}

// Versão simplificada do otimizador para casos onde perfUtils não está disponível
function initSimpleOptimizer() {
    console.log("Usando otimizador de imagens simplificado");
    
    // Aplica lazy loading nativo se disponível
    if ('loading' in HTMLImageElement.prototype) {
        document.querySelectorAll('.product-image, .modal-image, .card-img-top')
            .forEach(img => {
                if (!img.hasAttribute('loading')) {
                    img.loading = 'lazy';
                }
            });
    }
    
    // Adiciona CSS básico para melhorar a aparência durante carregamento
    const style = document.createElement('style');
    style.textContent = `
        img {
            opacity: 0;
            transition: opacity 0.3s ease-in;
        }
        img.loaded, img[src] {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
    
    // Adiciona evento de carga para todas as imagens
    document.querySelectorAll('img').forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', () => img.classList.add('loaded'));
        }
    });
}
