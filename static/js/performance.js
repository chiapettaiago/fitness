/**
 * Utilitários para otimizar o desempenho das animações e recursos
 * Versão 2.0 - Otimizado para desempenho em dispositivos móveis
 */

// Função para debounce - limita a frequência de chamadas de uma função
function debounce(func, wait = 20, immediate = true) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Função para throttle - garante que a função não seja chamada mais de uma vez em um período específico
function throttle(func, limit = 100) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Detecta se o navegador está ocioso para executar tarefas não prioritárias
const requestIdleCallback = window.requestIdleCallback || 
    function(cb) {
        return setTimeout(function() {
            const start = Date.now();
            cb({
                didTimeout: false,
                timeRemaining: function() {
                    return Math.max(0, 50 - (Date.now() - start));
                }
            });
        }, 1);
    };

// Otimização de animações com requestAnimationFrame
class AnimationOptimizer {
    constructor() {
        this.animations = new Map();
        this.animationFrameId = null;
        this.isRunning = false;
        this.lastTimestamp = 0;
        this.fpsLimit = 60; // Limite padrão de FPS
        this.fpsInterval = 1000 / this.fpsLimit;
        
        // Ajusta automaticamente com base no desempenho do dispositivo
        this.autoAdjustPerformance();
    }

    // Ajusta automaticamente os parâmetros de desempenho
    autoAdjustPerformance() {
        // Verifica o tipo de dispositivo e capacidade
        const perfParams = performanceLevel.getParams();
        
        // Ajusta o FPS máximo com base no nível de desempenho
        if (perfParams.level === 'low') {
            this.fpsLimit = 30; // Reduz para 30 FPS em dispositivos de baixo desempenho
        } else if (perfParams.level === 'medium') {
            this.fpsLimit = 45; // Reduz para 45 FPS em dispositivos médios
        } 
        
        // Calcula o intervalo entre frames
        this.fpsInterval = 1000 / this.fpsLimit;
    }

    // Adiciona uma animação para processamento otimizado
    add(id, callback, elements) {
        this.animations.set(id, { 
            callback, 
            elements, 
            active: true, 
            priority: 'normal' // Pode ser 'high', 'normal', 'low'
        });
        this.start();
        return id;
    }

    // Define a prioridade de uma animação
    setPriority(id, priority) {
        const animation = this.animations.get(id);
        if (animation) {
            animation.priority = priority;
        }
    }

    // Pausa uma animação específica
    pause(id) {
        const animation = this.animations.get(id);
        if (animation) {
            animation.active = false;
        }
    }

    // Retoma uma animação específica
    resume(id) {
        const animation = this.animations.get(id);
        if (animation) {
            animation.active = true;
        }
    }

    // Remove uma animação
    remove(id) {
        this.animations.delete(id);
        if (this.animations.size === 0) {
            this.stop();
        }
    }

    // Inicia o loop de animação
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTimestamp = performance.now();
        this.loop();
    }

    // Para o loop de animação
    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.isRunning = false;
    }

    // Loop principal de animação
    loop(timestamp) {
        // Calcula o tempo decorrido
        const elapsed = timestamp - this.lastTimestamp;
        
        // Se passou tempo suficiente, executa o próximo frame
        if (elapsed >= this.fpsInterval) {
            // Ajusta o timestamp
            this.lastTimestamp = timestamp - (elapsed % this.fpsInterval);
            
            // Primeiro executa animações de alta prioridade
            for (const [id, animation] of this.animations) {
                if (animation.active && animation.priority === 'high') {
                    animation.callback(animation.elements);
                }
            }
            
            // Depois executa animações de prioridade normal
            for (const [id, animation] of this.animations) {
                if (animation.active && animation.priority === 'normal') {
                    animation.callback(animation.elements);
                }
            }
            
            // Por último, executa animações de baixa prioridade
            for (const [id, animation] of this.animations) {
                if (animation.active && animation.priority === 'low') {
                    animation.callback(animation.elements);
                }
            }
        }
        
        // Continua o loop
        if (this.isRunning) {
            this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
        }
    }
}

// Instância global do otimizador de animação
const animationOptimizer = new AnimationOptimizer();

// Verificação de visibilidade para pausar animações não visíveis
class VisibilityManager {
    constructor() {
        this.observers = new Map();
        this.intersectionObserver = new IntersectionObserver(this.handleIntersection.bind(this), {
            threshold: 0.1, // 10% do elemento precisa estar visível
            rootMargin: '50px 0px' // Pré-carrega elementos próximos da viewport
        });
        
        // Monitora mudanças na visibilidade da página
        document.addEventListener('visibilitychange', this.handlePageVisibility.bind(this));
    }

    // Lida com mudanças na visibilidade da página (aba ativa/inativa)
    handlePageVisibility() {
        const isVisible = document.visibilityState === 'visible';
        
        // Notifica todos os observadores sobre a mudança de visibilidade da página
        this.observers.forEach((observer, element) => {
            if (isVisible) {
                // Verifica se o elemento está visível na tela
                if (this.isElementInViewport(element) && !observer.visible) {
                    observer.visible = true;
                    observer.onVisible(element);
                }
            } else {
                // Se a página não está visível, pausa todas as animações
                if (observer.visible) {
                    observer.visible = false;
                    observer.onHidden(element);
                }
            }
        });
    }

    // Verifica se um elemento está na viewport
    isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= -50 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight + 50 || document.documentElement.clientHeight + 50) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Observa um elemento e executa callbacks quando sua visibilidade muda
    observe(element, onVisible, onHidden) {
        this.observers.set(element, { onVisible, onHidden, visible: false });
        this.intersectionObserver.observe(element);
    }

    // Para de observar um elemento
    unobserve(element) {
        this.observers.delete(element);
        this.intersectionObserver.unobserve(element);
    }

    // Manipula eventos de intersecção
    handleIntersection(entries) {
        entries.forEach(entry => {
            const observer = this.observers.get(entry.target);
            if (!observer) return;

            if (entry.isIntersecting && !observer.visible) {
                observer.visible = true;
                observer.onVisible(entry.target);
            } else if (!entry.isIntersecting && observer.visible) {
                observer.visible = false;
                observer.onHidden(entry.target);
            }
        });
    }
}

// Instância global do gerenciador de visibilidade
const visibilityManager = new VisibilityManager();

// Detecção de capacidade do dispositivo para ajustar efeitos
const performanceLevel = {
    // Cache para o nível detectado
    _cachedLevel: null,
    
    // Detecta o nível de desempenho do dispositivo
    detect() {
        // Retorna o nível em cache se já foi calculado
        if (this._cachedLevel) return this._cachedLevel;
        
        // Valores iniciais
        let level = 'high';
        
        // Dispositivos móveis normalmente têm menor capacidade
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            level = 'medium';
            
            // Verifica se é um dispositivo de baixa capacidade
            if (this.isLowEndDevice()) {
                level = 'low';
            }
        }
        
        // Verifica se o navegador suporta detecção de hardware
        if (navigator.hardwareConcurrency) {
            // Dispositivos com menos de 4 núcleos são considerados de menor capacidade
            if (navigator.hardwareConcurrency < 4) {
                level = (level === 'high') ? 'medium' : 'low';
            }
        }
        
        // Verifica memória disponível (API experimental, nem todos os navegadores suportam)
        if (navigator.deviceMemory) {
            if (navigator.deviceMemory < 4) {
                level = (level === 'high') ? 'medium' : 'low';
            }
        }
        
        // Respeita preferências de redução de movimento
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            level = 'low';
        }
        
        // Armazena em cache o nível detectado
        this._cachedLevel = level;
        
        // Salva no sessionStorage para uso em outros scripts
        try {
            sessionStorage.setItem('performanceLevel', level);
        } catch (e) {
            // Ignora erros de acesso ao sessionStorage
        }
        
        return level;
    },
    
    // Verifica se é um dispositivo de baixa potência
    isLowEndDevice() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
            // Se a conexão for lenta, provavelmente é um dispositivo mais antigo
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                return true;
            }
            
            // Se a economia de dados estiver ativada, respeite isso
            if (connection.saveData) {
                return true;
            }
        }
        
        return false;
    },
    
    // Obtém os parâmetros para o nível atual
    getParams() {
        const level = this.detect();
        
        const params = {
            level,
            low: {
                animationsEnabled: false,
                blurEffects: false,
                particleEffects: false,
                transitionSpeed: 0.1,
                throttleTime: 200,
                imageQuality: 'low'
            },
            medium: {
                animationsEnabled: true,
                blurEffects: true,
                particleEffects: false,
                transitionSpeed: 0.3,
                throttleTime: 100,
                imageQuality: 'medium'
            },
            high: {
                animationsEnabled: true,
                blurEffects: true,
                particleEffects: true,
                transitionSpeed: 0.5,
                throttleTime: 50,
                imageQuality: 'high'
            }
        };
        
        return params;
    }
};

// Gerenciamento de recursos
const resourceOptimizer = {
    // Carrega uma imagem com qualidade adequada
    loadImage(imgElement, highQualitySrc, lowQualitySrc = null) {
        const params = performanceLevel.getParams();
        const qualitySrc = params.level === 'low' && lowQualitySrc ? lowQualitySrc : highQualitySrc;
        
        // Verifica se o elemento está visível
        visibilityManager.observe(
            imgElement,
            // Quando visível, carrega a imagem
            (element) => {
                // Se já carregou a imagem de alta qualidade, não faz nada
                if (element.src === highQualitySrc) return;
                
                // Carrega a imagem com a qualidade apropriada
                element.src = qualitySrc;
                
                // Se for low ou medium, pré-carrega a versão de alta qualidade quando o navegador estiver ocioso
                if (params.level !== 'high' && qualitySrc !== highQualitySrc) {
                    requestIdleCallback(() => {
                        const preloadImg = new Image();
                        preloadImg.src = highQualitySrc;
                        preloadImg.onload = () => {
                            // Quando terminar de carregar a versão de alta qualidade, troca a imagem
                            element.src = highQualitySrc;
                        };
                    });
                }
            },
            // Quando oculto, não faz nada
            () => {}
        );
    },
    
    // Carrega um script assincronamente
    loadScript(url, callback = null) {
        const script = document.createElement('script');
        script.src = url;
        script.defer = true;
        
        if (callback) {
            script.onload = callback;
        }
        
        document.head.appendChild(script);
    },
    
    // Carrega um CSS assincronamente
    loadCSS(url, callback = null) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        
        if (callback) {
            link.onload = callback;
        }
        
        document.head.appendChild(link);
    }
};

// Monitoramento de desempenho da página
const performanceMonitor = {
    // Armazena métricas de desempenho
    metrics: {
        fps: 0,
        memory: null,
        networkLatency: 0
    },
    
    // Inicia monitoramento
    start() {
        this.monitorFPS();
        this.monitorMemory();
        this.monitorNetwork();
    },
    
    // Monitora taxa de quadros (FPS)
    monitorFPS() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const countFPS = () => {
            const now = performance.now();
            frameCount++;
            
            if (now - lastTime >= 1000) { // a cada segundo
                this.metrics.fps = frameCount;
                frameCount = 0;
                lastTime = now;
                
                // Ajusta automaticamente com base no FPS
                this.autoAdjustPerformance();
            }
            
            requestAnimationFrame(countFPS);
        };
        
        requestAnimationFrame(countFPS);
    },
    
    // Monitora uso de memória (disponível apenas em alguns navegadores)
    monitorMemory() {
        if (performance.memory) {
            setInterval(() => {
                this.metrics.memory = {
                    total: performance.memory.totalJSHeapSize,
                    used: performance.memory.usedJSHeapSize
                };
            }, 2000);
        }
    },
    
    // Monitora latência da rede
    monitorNetwork() {
        // Verifica a API de conexão
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            connection.addEventListener('change', () => {
                // Atualiza parâmetros de desempenho com base na conexão
                performanceLevel._cachedLevel = null; // Força nova detecção
                this.autoAdjustPerformance();
            });
        }
    },
    
    // Ajusta automaticamente com base em métricas coletadas
    autoAdjustPerformance() {
        // Se o FPS for muito baixo, reduz os efeitos
        if (this.metrics.fps < 30 && performanceLevel._cachedLevel !== 'low') {
            performanceLevel._cachedLevel = 'low';
            document.documentElement.style.setProperty('--transition-speed', '0.1s');
        }
    }
};

// Exporta as funções e classes para uso global
window.perfUtils = {
    debounce,
    throttle,
    requestIdleCallback,
    animationOptimizer,
    visibilityManager,
    performanceLevel,
    resourceOptimizer,
    performanceMonitor
};

// Inicia automaticamente o monitoramento quando carregado
document.addEventListener('DOMContentLoaded', () => {
    // Inicia o monitor de desempenho em navegadores compatíveis
    if (window.performance) {
        performanceMonitor.start();
    }
});

// Aplica configurações iniciais de desempenho de forma segura
(() => {
    try {
        // Define variáveis CSS baseadas no nível de desempenho
        const params = performanceLevel.getParams();
        // Verifica se params existe e tem a propriedade level
        if (params && params.level && params[params.level]) {
            const transitionSpeed = params[params.level].transitionSpeed || 0.3;
            document.documentElement.style.setProperty('--transition-speed', `${transitionSpeed}s`);
            
            // Define classe de desempenho no body para estilização via CSS
            document.body.classList.add(`performance-${params.level}`);
        }
    } catch (error) {
        console.error("Erro ao aplicar configurações iniciais:", error);
        // Valores padrão em caso de erro
        document.documentElement.style.setProperty('--transition-speed', '0.3s');
    }
})();
