# Loja Fitness

Uma aplicação web simples construída com **Flask** para gerenciar uma loja de produtos fitness. Permite visualizar produtos, adicionar ao carrinho e, em área administrativa, adicionar, editar e gerenciar itens.

## 📑 Sumário
- [Recursos](#recursos)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Autor](#autor)
- [Licença](#licença)

## 🔥 Recursos
- Listagem de produtos
- Página de detalhes do produto
- Carrinho de compras
- Autenticação de usuário (login)
- Área administrativa para adicionar, editar e remover produtos

## 💻 Tecnologias
- Python 3.6+
- Flask
- Jinja2
- CSS customizado (em `static/css/style.css`)
- JSON para armazenamento de produtos (`products.json`)

## 🚀 Instalação
1. Clone o repositório:
   ```bash
   git clone https://github.com/chiapettaiago/fitness.git
   cd loja-fitness
   ```
2. Crie e ative um ambiente virtual:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   ```
3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

## 🎬 Uso
Execute a aplicação:
```bash
python app.py
```
Acesse em `http://localhost:5000` no seu navegador.

## 📂 Estrutura do Projeto
```
.
├── app.py
├── products.py
├── products.json
├── requirements.txt
├── static/
│   └── css/
│       └── style.css
├── templates/
│   ├── base.html
│   ├── index.html
│   ├── product.html
│   ├── cart.html
│   └── login.html
└── admin/
    ├── dashboard.html
    ├── add_product.html
    └── edit_product.html
```

## 🤝 Autor
- Iago Filgueiras Chiapetta (<iagochiapetta@gmail.com>)

## 📄 Licença
Este projeto está licenciado sob a **MIT License**. Veja o arquivo `LICENSE` para mais detalhes.