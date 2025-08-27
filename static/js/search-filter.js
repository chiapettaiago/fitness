// Funcionalidade de busca e filtros com suporte a AJAX
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const categoryItems = document.querySelectorAll('.category-item');
    const productsContainer = document.getElementById('bestsellersCarousel');
    const resultsSection = productsContainer ? productsContainer.closest('.products-section') : null;
    const resultsTitle = resultsSection ? resultsSection.querySelector('.section-title') : null;
    const categorySection = document.querySelector('.category-horizontal');

    // Helpers
    function createEl(tag, className, html) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (html !== undefined) el.innerHTML = html;
        return el;
    }

    function updateResultsInfo(query, category, count) {
        if (!categorySection) return;
        let info = document.querySelector('.search-results-info');
        const labelFromCategory = (cat) => ({ camisetas: 'Camisetas', calcas: 'Calças', acessorios: 'Acessórios' }[cat] || (cat ? cat : 'Todos'));
        const safe = (s) => (s || '').toString().replace(/[<>&]/g, '');

        if (!info) {
            info = createEl('section', 'search-results-info');
            const container = createEl('div', 'container');
            const bar = createEl('div', 'search-info-bar d-flex justify-content-between align-items-center py-3');
            const filters = createEl('div', 'search-filters d-flex gap-2');
            const countEl = createEl('div', 'results-count text-muted');
            countEl.innerHTML = `<span class="count-text">${count} produto${count === 1 ? '' : 's'} encontrado${count === 1 ? '' : 's'}</span>`;
            bar.appendChild(filters);
            bar.appendChild(countEl);
            container.appendChild(bar);
            info.appendChild(container);
            categorySection.insertAdjacentElement('afterend', info);
        }

        // Atualiza filtros
        const filters = info.querySelector('.search-filters');
        filters.innerHTML = '';
        if (query) {
            const qTag = createEl('span', 'filter-tag search-tag badge bg-light text-dark border');
            qTag.innerHTML = `<i class="bi bi-search"></i><span class="ms-1">"${safe(query)}"</span>`;
            const clear = createEl('a', 'filter-remove ms-2 text-muted', '<i class="bi bi-x"></i>');
            clear.href = '#';
            clear.addEventListener('click', (e) => { e.preventDefault(); if (searchInput) searchInput.value = ''; doAjaxSearch('', category); });
            qTag.appendChild(clear);
            filters.appendChild(qTag);
        }
        if (category) {
            const cTag = createEl('span', 'filter-tag category-tag badge bg-light text-dark border');
            cTag.innerHTML = `<i class="bi bi-tag"></i><span class="ms-1">${labelFromCategory(category)}</span>`;
            const clearC = createEl('a', 'filter-remove ms-2 text-muted', '<i class="bi bi-x"></i>');
            clearC.href = '#';
            clearC.addEventListener('click', (e) => { e.preventDefault(); doAjaxSearch(query || '', null); });
            cTag.appendChild(clearC);
            filters.appendChild(cTag);
        }

        // Atualiza contagem
        const countEl = info.querySelector('.results-count .count-text');
        if (countEl) countEl.textContent = `${count} produto${count === 1 ? '' : 's'} encontrado${count === 1 ? '' : 's'}`;

        // Atualiza título da seção
        if (resultsTitle) {
            resultsTitle.textContent = (query || category) ? 'Resultados' : 'Mais Vendidos';
        }
    }

    function renderProducts(products) {
        if (!productsContainer) return;
        if (!products || products.length === 0) {
            productsContainer.innerHTML = `
                <div class="w-100 text-center py-5 text-muted">
                    <i class="bi bi-search"></i>
                    <div class="mt-2">Nenhum produto encontrado</div>
                </div>`;
            return;
        }
        const cards = products.map(p => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async">
                    <div class="product-sizes"><span>P</span><span>M</span><span>G</span></div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${p.name}</h3>
                    <p class="product-code">PRETO | ${p.id}</p>
                    <div class="product-price">
                        <span class="price-main">R$ ${Number(p.price).toFixed(2)}</span>
                        <span class="price-installment">10% off no PIX ou</span>
                        <span class="price-installment">10x de R$ ${(Number(p.price)/10).toFixed(2)}</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn-quick-view" data-product-id="${p.id}"><i class="bi bi-eye"></i></button>
                        <a href="/add_to_cart/${p.id}" class="btn-add-cart"><i class="bi bi-bag-plus"></i></a>
                    </div>
                </div>
            </div>
        `).join('');
        productsContainer.innerHTML = cards;
    }

    // Busca com delay para evitar muitas requisições
    let searchTimeout;

    function doAjaxSearch(query = '', category = null) {
        if (!productsContainer) {
            // Fallback: navegar
            const url = new URL(window.location.origin + '/search');
            if (query) url.searchParams.set('q', query);
            if (category) url.searchParams.set('category', category);
            window.location.href = url.toString();
            return;
        }

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            // Loading state
            productsContainer.innerHTML = '<div class="w-100 text-center py-5">Carregando...</div>';
            try {
                const url = new URL(window.location.origin + '/api/search');
                if (query) url.searchParams.set('q', query);
                if (category) url.searchParams.set('category', category);
                const res = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
                const data = await res.json();

                renderProducts(data.products);
                updateResultsInfo(data.query, data.category, data.count);

                // Atualiza URL sem recarregar
                updateURL(data.query, data.category);

                // Atualiza categoria ativa
                categoryItems.forEach(el => el.classList.remove('active'));
                if (data.category) {
                    document.querySelectorAll(`.category-item[href*="category=${data.category}"]`).forEach(el => el.classList.add('active'));
                } else {
                    document.querySelectorAll('.category-item[href="/"]').forEach(el => el.classList.add('active'));
                }
            } catch (e) {
                productsContainer.innerHTML = '<div class="w-100 text-center py-5 text-danger">Erro ao carregar resultados</div>';
            }
        }, 300); // debounce
    }

    // Event listener para o formulário de busca
    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = searchInput.value.trim();
            doAjaxSearch(query);
        });

        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            if (query.length >= 3 || query.length === 0) {
                doAjaxSearch(query);
            }
        });

        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                doAjaxSearch('');
            }
        });
    }

    // Navegação das categorias com AJAX
    categoryItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const href = this.getAttribute('href') || '';
            const match = href.match(/category=([^&]+)/);
            const category = match ? decodeURIComponent(match[1]) : null;
            e.preventDefault();
            doAjaxSearch(searchInput ? searchInput.value.trim() : '', category);
        });
    });

    // Expor função para busca mobile
    function openSearch() {
        const searchQuery = prompt('Digite sua busca:');
        if (searchQuery !== null) {
            doAjaxSearch(searchQuery.trim());
        }
    }
    window.openSearch = openSearch;

    // Foco quando já há query na URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentQuery = urlParams.get('q');
    const currentCategory = urlParams.get('category');
    if ((currentQuery || currentCategory) && productsContainer) {
        updateResultsInfo(currentQuery || '', currentCategory, 0); // count corrigido após fetch
        doAjaxSearch(currentQuery || '', currentCategory || null);
        if (searchInput && currentQuery) {
            searchInput.focus();
            searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
        }
    }
});

// Mantém utilitários existentes
function filterProductsLocally(products, query, category) {
    if (!query && !category) return products;
    return products.filter(product => {
        let matchesCategory = !category || product.category === category;
        let matchesQuery = !query || product.name.toLowerCase().includes(query.toLowerCase()) || product.description.toLowerCase().includes(query.toLowerCase()) || product.category.toLowerCase().includes(query.toLowerCase());
        return matchesCategory && matchesQuery;
    });
}

function updateURL(query, category) {
    const url = new URL(window.location);
    if (query) url.searchParams.set('q', query); else url.searchParams.delete('q');
    if (category) url.searchParams.set('category', category); else url.searchParams.delete('category');
    if (!query && !category) url.search = '';
    history.replaceState({}, '', url);
}
