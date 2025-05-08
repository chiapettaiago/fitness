from flask import Flask, render_template, redirect, url_for, request, session, flash, jsonify
from functools import wraps, lru_cache
import json
import os
from datetime import timedelta

app = Flask(__name__)
app.secret_key = 'chave_super_secreta'
app.permanent_session_lifetime = timedelta(days=1)  # Sessão dura 1 dia

# Configuração do usuário admin
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

# Cache para produtos
@lru_cache(maxsize=1)
def load_products():
    try:
        with open('products.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_products(products):
    with open('products.json', 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=4)
    # Limpa o cache após salvar
    load_products.cache_clear()

# Decorator para verificar se o usuário está logado
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            flash('Por favor, faça login para acessar esta página.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@lru_cache(maxsize=1)
def get_featured_products():
    products = load_products()
    return sorted(products, key=lambda x: x['price'], reverse=True)[:3]

@app.route('/')
def index():
    session.permanent = True  # Torna a sessão permanente
    cart_count = len(session.get('cart', []))
    featured_products = get_featured_products()
    products = load_products()
    
    # Filtra produtos por categoria se especificado
    category = request.args.get('category')
    if category:
        products = [p for p in products if p['category'] == category]
    
    return render_template('index.html', 
                         products=products, 
                         cart_count=cart_count,
                         featured_products=featured_products,
                         current_category=category)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if not username or not password:
            flash('Por favor, preencha todos os campos!', 'danger')
            return render_template('login.html')
        
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session.permanent = True
            session['logged_in'] = True
            session['username'] = username
            flash('Login realizado com sucesso!', 'success')
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Usuário ou senha incorretos!', 'danger')
            return render_template('login.html')
    
    # Se o usuário já estiver logado, redireciona para o dashboard
    if 'logged_in' in session:
        return redirect(url_for('admin_dashboard'))
        
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('Logout realizado com sucesso!', 'success')
    return redirect(url_for('index'))

@app.route('/admin')
@login_required
def admin_dashboard():
    products = load_products()
    return render_template('admin/dashboard.html', products=products)

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
    return render_template('product.html', product=product, cart_count=cart_count)

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
    return render_template('cart.html', cart_items=cart_items, total=total, cart_count=cart_count)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=11000, debug=False, threaded=True)
