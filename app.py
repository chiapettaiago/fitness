from flask import Flask, render_template, redirect, url_for, request, session, flash, jsonify, make_response
from flask_compress import Compress
from functools import wraps, lru_cache
import json
import os
import time
from datetime import timedelta

app = Flask(__name__)
app.secret_key = 'chave_super_secreta'
app.permanent_session_lifetime = timedelta(days=1)  # Sessão dura 1 dia
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 31536000  # Cache de recursos estáticos por 1 ano
app.config['COMPRESS_MIMETYPES'] = ['text/html', 'text/css', 'text/xml', 'application/json', 'application/javascript']
app.config['COMPRESS_LEVEL'] = 6
app.config['COMPRESS_MIN_SIZE'] = 512

# Ativa compressão GZIP/Brotli (se disponível)
Compress(app)

# Configuração do usuário admin
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

# Cache global para melhorar desempenho
CACHE = {
    'products': None,
    'products_timestamp': 0,
    'featured_products': None,
    'category_products': {},
    'banners': None,
    'banners_timestamp': 0
}

# Cache para produtos com expiração
def load_products(force_refresh=False):
    # Verifica se é necessário recarregar os dados
    current_time = time.time()
    
    # Se o cache estiver vazio ou expirado (30 segundos) ou forçar refresh
    if force_refresh or CACHE['products'] is None or (current_time - CACHE['products_timestamp'] > 30):
        try:
            with open('products.json', 'r', encoding='utf-8') as f:
                CACHE['products'] = json.load(f)
                CACHE['products_timestamp'] = current_time
                # Limpa o cache de categorias
                CACHE['category_products'] = {}
                # Recalcula produtos em destaque
                CACHE['featured_products'] = None
        except FileNotFoundError:
            CACHE['products'] = []
            CACHE['products_timestamp'] = current_time
            
    return CACHE['products']

def save_products(products):
    with open('products.json', 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=4)
    # Força atualização do cache
    load_products(force_refresh=True)

# Cache para banners do hero
def load_banners(force_refresh=False):
    current_time = time.time()
    if force_refresh or CACHE['banners'] is None or (current_time - CACHE['banners_timestamp'] > 60):
        try:
            with open('banners.json', 'r', encoding='utf-8') as f:
                CACHE['banners'] = json.load(f)
                CACHE['banners_timestamp'] = current_time
        except FileNotFoundError:
            # Fallback padrão (3 banners)
            CACHE['banners'] = [
                {
                    "id": 1,
                    "kicker": "LANÇAMENTOS",
                    "title": "Novas peças para elevar o seu treino",
                    "cta_text": "Comprar agora",
                    "cta_url": "/?esp=lancamentos",
                    "image": "https://images.unsplash.com/photo-1549049950-48d5887197ce?q=80&w=1600&auto=format&fit=crop"
                },
                {
                    "id": 2,
                    "kicker": "FIT BASIC",
                    "title": "Básicos versáteis para todos os dias",
                    "cta_text": "Ver coleção",
                    "cta_url": "/?colecao=fitbasic",
                    "image": "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=1600&auto=format&fit=crop"
                },
                {
                    "id": 3,
                    "kicker": "SALE",
                    "title": "Descontos imperdíveis por tempo limitado",
                    "cta_text": "Aproveitar",
                    "cta_url": "/?esp=sale",
                    "image": "https://images.unsplash.com/photo-1571907480495-3f5fd9b3be26?q=80&w=1600&auto=format&fit=crop"
                }
            ]
            CACHE['banners_timestamp'] = current_time
    return CACHE['banners']

# Decorator para verificar se o usuário está logado
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            flash('Por favor, faça login para acessar esta página.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Função para obter produtos em destaque (com cache)
def get_featured_products():
    if CACHE['featured_products'] is None:
        products = load_products()
        CACHE['featured_products'] = sorted(products, key=lambda x: x['price'], reverse=True)[:3]
    
    return CACHE['featured_products']

@app.route('/')
def index():
    session.permanent = True  # Torna a sessão permanente
    cart_count = len(session.get('cart', []))
    featured_products = get_featured_products()
    banners = load_banners()
    
    # Filtrar por categoria, se houver
    category = request.args.get('category')
    
    if category:
        # Verifica se já tem esta categoria em cache
        if category not in CACHE['category_products']:
            products = load_products()
            CACHE['category_products'][category] = [p for p in products if p.get('category') == category]
        
        products = CACHE['category_products'][category]
    else:
        products = load_products()

    # ETag baseado no timestamp de produtos + categoria + quantidade
    etag = f'W/"index-{int(CACHE["products_timestamp"])}-{int(CACHE["banners_timestamp"])}-{category or "all"}-{len(products)}"'
    client_etag = request.headers.get('If-None-Match')
    if client_etag == etag:
        resp = make_response('', 304)
        resp.headers['ETag'] = etag
        resp.headers['Cache-Control'] = 'public, max-age=30'
        resp.headers['Vary'] = 'Accept-Encoding'
        return resp

    # Renderiza normalmente
    response = make_response(render_template(
        'index.html',
        products=products,
        featured_products=featured_products,
    banners=banners,
        cart_count=cart_count,
        current_category=category
    ))
    response.headers['ETag'] = etag
    response.headers['Cache-Control'] = 'public, max-age=30'
    response.headers['Vary'] = 'Accept-Encoding'
    return response

@app.route('/login', methods=['GET', 'POST'])
def login():
    cart_count = len(session.get('cart', []))
    
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if not username or not password:
            flash('Por favor, preencha todos os campos!', 'danger')
            return render_template('login.html', cart_count=cart_count)
        
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session.permanent = True
            session['logged_in'] = True
            session['username'] = username
            flash('Login realizado com sucesso!', 'success')
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Usuário ou senha incorretos!', 'danger')
            return render_template('login.html', cart_count=cart_count)
    
    # Se o usuário já estiver logado, redireciona para o dashboard
    if 'logged_in' in session:
        return redirect(url_for('admin_dashboard'))
        
    resp = make_response(render_template('login.html', cart_count=cart_count))
    resp.headers['Cache-Control'] = 'no-store, max-age=0'
    resp.headers['Vary'] = 'Accept-Encoding'
    return resp

@app.route('/logout')
def logout():
    session.clear()
    flash('Logout realizado com sucesso!', 'success')
    return redirect(url_for('index'))

@app.route('/admin')
@login_required
def admin_dashboard():
    products = load_products()
    resp = make_response(render_template('admin/dashboard.html', products=products))
    resp.headers['Cache-Control'] = 'no-store, max-age=0'
    resp.headers['Vary'] = 'Accept-Encoding'
    return resp

@app.route('/admin/products/add', methods=['GET', 'POST'])
@login_required
def add_product():
    if request.method == 'POST':
        products = load_products()
        new_id = max([p['id'] for p in products], default=0) + 1
        
        new_product = {
            'id': new_id,
            'name': request.form.get('name'),
            'price': float(request.form.get('price')),
            'description': request.form.get('description'),
            'image': request.form.get('image'),
            'category': request.form.get('category')
        }
        
        products.append(new_product)
        save_products(products)
        flash('Produto adicionado com sucesso!', 'success')
        return redirect(url_for('admin_dashboard'))
    
    return render_template('admin/add_product.html')

@app.route('/admin/products/edit/<int:product_id>', methods=['GET', 'POST'])
@login_required
def edit_product(product_id):
    products = load_products()
    product = next((p for p in products if p['id'] == product_id), None)
    
    if not product:
        flash('Produto não encontrado!', 'danger')
        return redirect(url_for('admin_dashboard'))
    
    if request.method == 'POST':
        product['name'] = request.form.get('name')
        product['price'] = float(request.form.get('price'))
        product['description'] = request.form.get('description')
        product['image'] = request.form.get('image')
        product['category'] = request.form.get('category')
        
        save_products(products)
        flash('Produto atualizado com sucesso!', 'success')
        return redirect(url_for('admin_dashboard'))
    
    return render_template('admin/edit_product.html', product=product)

@app.route('/admin/products/delete/<int:product_id>')
@login_required
def delete_product(product_id):
    products = load_products()
    products = [p for p in products if p['id'] != product_id]
    save_products(products)
    flash('Produto removido com sucesso!', 'success')
    return redirect(url_for('admin_dashboard'))

@app.route('/product/<int:product_id>')
def product(product_id):
    products = load_products()
    product = next((p for p in products if p['id'] == product_id), None)
    cart_count = len(session.get('cart', []))
    if product:
        etag = f'W/"product-{product["id"]}-{int(CACHE["products_timestamp"])}"'
        client_etag = request.headers.get('If-None-Match')
        if client_etag == etag:
            resp = make_response('', 304)
            resp.headers['ETag'] = etag
            resp.headers['Cache-Control'] = 'public, max-age=60'
            resp.headers['Vary'] = 'Accept-Encoding'
            return resp

        resp = make_response(render_template('product.html', product=product, cart_count=cart_count))
        resp.headers['ETag'] = etag
        resp.headers['Cache-Control'] = 'public, max-age=60'
        resp.headers['Vary'] = 'Accept-Encoding'
        return resp
    else:
        resp = make_response(render_template('product.html', product=None, cart_count=cart_count))
        resp.headers['Cache-Control'] = 'public, max-age=30'
        resp.headers['Vary'] = 'Accept-Encoding'
        return resp

@app.route('/add_to_cart/<int:product_id>')
def add_to_cart(product_id):
    cart = session.get('cart', [])
    cart.append(product_id)
    session['cart'] = cart
    flash('Produto adicionado ao carrinho!', 'success')
    return redirect(url_for('index'))

@app.route('/remove_from_cart/<int:product_id>')
def remove_from_cart(product_id):
    cart = session.get('cart', [])
    if product_id in cart:
        cart.remove(product_id)
        session['cart'] = cart
        flash('Produto removido do carrinho!', 'info')
    return redirect(url_for('cart'))

@app.route('/clear_cart')
def clear_cart():
    session.pop('cart', None)
    flash('Carrinho esvaziado!', 'info')
    return redirect(url_for('cart'))

@app.route('/cart')
def cart():
    cart_ids = session.get('cart', [])
    cart_items = []
    total = 0
    
    if cart_ids:
        products = load_products()
        # Contar quantidade de cada item
        item_count = {}
        for item_id in cart_ids:
            item_count[item_id] = item_count.get(item_id, 0) + 1
        
        # Criar lista de itens com quantidade
        for item_id, quantity in item_count.items():
            product = next((p for p in products if p['id'] == item_id), None)
            if product:
                cart_items.append({
                    'id': product['id'],
                    'name': product['name'],
                    'price': product['price'],
                    'image': product['image'],
                    'quantity': quantity,
                    'subtotal': product['price'] * quantity
                })
                total += product['price'] * quantity
    
    cart_count = len(cart_ids)
    resp = make_response(render_template('cart.html', cart_items=cart_items, total=total, cart_count=cart_count))
    resp.headers['Cache-Control'] = 'no-store, max-age=0'
    resp.headers['Vary'] = 'Accept-Encoding'
    return resp

# API para obter detalhes do produto
@app.route('/api/product/<int:product_id>')
def api_product_details(product_id):
    products = load_products()
    product = next((p for p in products if p['id'] == product_id), None)
    
    if product:
        # Adiciona headers para cache do navegador (15 minutos)
        response = jsonify(product)
        response.headers['Cache-Control'] = 'public, max-age=900'
        response.headers['Vary'] = 'Accept-Encoding'
        
        # Adiciona ETag baseado no timestamp do produto
        if 'updated_at' in product:
            response.headers['ETag'] = f'W/"{product["id"]}-{product["updated_at"]}"'
        
        return response
    else:
        return jsonify({"error": "Produto não encontrado"}), 404

# Configurar cabeçalhos de resposta para otimização
@app.after_request
def add_header(response):
    """Adiciona cabeçalhos para melhorar performance."""
    # Nota: Estamos removendo Content-Encoding manual pois pode causar erro
    # A compressão deve ser configurada no servidor web (nginx, apache)
    
    # Previne clickjacking
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    
    # Vary para compressão
    response.headers.setdefault('Vary', 'Accept-Encoding')

    # Ativa cache para recursos estáticos
    if request.path.startswith('/static/'):
        # Cache por 1 ano para recursos estáticos (imagens, css, js)
        response.headers['Cache-Control'] = 'public, max-age=31536000'
    
    # Adiciona cabeçalhos de segurança
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    
    return response

# Define prioridade de recursos críticos
@app.before_request
def before_request():
    """Define prioridade para recursos críticos."""
    if request.path.endswith('.css'):
        # Prioridade para CSS
        request.priority = 'high'
    elif request.path.endswith('.js'):
        # JS pode carregar depois
        request.priority = 'low'
    else:
        request.priority = 'medium'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=11000, debug=False, threaded=True)
