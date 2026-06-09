// CONFIGURACIÓN Y BASE DE DATOS DE PRODUCTOS
// Puedes reemplazar las URLs de Unsplash con las rutas locales de tus fotos (ej. 'assets/sudadera.jpg')
const PRODUCTS = [
    {
        id: 1,
        name: "Chainsaw",
        category: "camisetas",
        price: 120.00,
        description: "Camiseta con diseño de Chainsaw Man.",
        image: "https://lh3.googleusercontent.com/d/1OxgFXihUUrw7c-h60yteXvr8rpOSYzkz",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 2,
        name: "Vegeto SSJ",
        category: "camisetas",
        price: 120.00,
        description: "Camiseta con diseño de Vegeto en forma Super Saiyan.",
        image: "https://lh3.googleusercontent.com/d/17L17Y8Nc8ZE4ysBPGgVAr527RYQSzQ4y",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 3,
        name: "Vegeto SSJB",
        category: "camisetas",
        price: 120.00,
        description: "Camiseta con diseño de Vegeto en forma Super Saiyan Blue",
        image: "https://lh3.googleusercontent.com/d/1B111DBTP3CDyXW5BGURDhDsIFdljouRS",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 4,
        name: "Gogeta SSJB",
        category: "camisetas",
        price: 120.00,
        description: "Camiseta con diseño de Gogeta en forma Super Saiyan Blue",
        image: "https://lh3.googleusercontent.com/d/1LqG5PGm9XVbz8vo8rQvaQy70laFwCOI7",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 5,
        name: "Garfield 6",
        category: "camisetas",
        price: 120.00,
        description: "Camiseta con diseño de Garfield",
        image: "https://lh3.googleusercontent.com/d/1gwlNQQ24nM8SyyGfduClwwqAPzJ4QGHG",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    }
];


// Configuración de WhatsApp
const WHATSAPP_PHONE = "51996440579"; // Reemplaza con tu número de teléfono de WhatsApp (incluyendo código de país sin el + ni espacios, ej: 5215512345678)

// ESTADO DE LA APLICACIÓN
let cart = [];
localStorage.removeItem('endure_cart');
let selectedProduct = null;
let selectedSize = '';
let selectedQty = 1;

// VARIABLES DEL DOM
const productsGrid = document.getElementById('productsGrid');
const filterBtns = document.querySelectorAll('.filter-btn');

// Modal
const productModal = document.getElementById('productModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalImg = document.getElementById('modalImg');
const modalCategory = document.getElementById('modalCategory');
const modalTitle = document.getElementById('modalTitle');
const modalPrice = document.getElementById('modalPrice');
const modalDescription = document.getElementById('modalDescription');
const modalSizes = document.getElementById('modalSizes');
const qtyVal = document.getElementById('qtyVal');
const qtyMinus = document.getElementById('qtyMinus');
const qtyPlus = document.getElementById('qtyPlus');
const modalAddBtn = document.getElementById('modalAddBtn');

// Carrito
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartBtn = document.getElementById('cartBtn');
const cartClose = document.getElementById('cartClose');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartSubtotal = document.getElementById('cartSubtotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const cartCountBadges = document.querySelectorAll('.cart-count');
const emptyCartAction = document.getElementById('emptyCartAction');

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    renderProducts('all');
    updateCartUI();
    setupEventListeners();
    setupFAQAccordion();

    // Disable right-click on product images and quick view overlay
    document.addEventListener('contextmenu', function(e) {
        if (e.target.closest('.product-img-wrapper') || e.target.closest('.product-img') || e.target.closest('#modalImg') || e.target.closest('.modal-image-container') || e.target.closest('.cart-item-img')) {
            e.preventDefault();
            e.stopPropagation();
        }
    });
});

// --- RENDERIZACIÓN DE PRODUCTOS ---
function renderProducts(categoryFilter = 'all') {
    productsGrid.innerHTML = '';
    
    const filteredProducts = categoryFilter === 'all' 
        ? PRODUCTS 
        : PRODUCTS.filter(p => p.category === categoryFilter);

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `<p class="no-products">No hay productos en esta categoría por el momento.</p>`;
        return;
    }

    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        
        const badgeHTML = product.tag ? `<span class="product-badge">${product.tag}</span>` : '';
        
        card.innerHTML = `
            <div class="product-img-wrapper" onclick="openProductModal(${product.id})">
                ${badgeHTML}
                <img class="product-img" src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="product-quick-view">Vista Rápida</div>
            </div>
            <div class="product-details">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name" onclick="openProductModal(${product.id})">${product.name}</h3>
                <div class="product-price">S/${product.price.toFixed(2)}</div>
                <button class="product-add-btn" onclick="quickAdd(${product.id})">
                    <i class="fa-solid fa-bag-shopping"></i> Añadir
                </button>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

// --- EVENTOS Y CONTROLES ---
function setupEventListeners() {
    // Filtrado de categorías
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProducts(btn.dataset.category);
        });
    });

    // Control de carrito (Abrir/Cerrar)
    cartBtn.addEventListener('click', openCart);
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    emptyCartAction.addEventListener('click', closeCart);

    // Control de modal (Cerrar)
    modalClose.addEventListener('click', closeProductModal);
    modalOverlay.addEventListener('click', closeProductModal);

    // Cantidad en el modal
    qtyMinus.addEventListener('click', () => {
        if (selectedQty > 1) {
            selectedQty--;
            qtyVal.textContent = selectedQty;
        }
    });
    qtyPlus.addEventListener('click', () => {
        selectedQty++;
        qtyVal.textContent = selectedQty;
    });

    // Botón añadir del modal
    modalAddBtn.addEventListener('click', () => {
        if (!selectedSize && selectedProduct.sizes[0] !== "Única") {
            alert("Por favor selecciona una talla.");
            return;
        }
        addToCart(selectedProduct.id, selectedSize || selectedProduct.sizes[0], selectedQty);
        closeProductModal();
        openCart();
    });

    // Finalizar compra (WhatsApp)
    checkoutBtn.addEventListener('click', sendOrderToWhatsApp);
}

// --- LÓGICA DEL MODAL DE DETALLE ---
window.openProductModal = function(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    selectedProduct = product;
    selectedQty = 1;
    qtyVal.textContent = selectedQty;

    // Llenar datos en el modal
    modalImg.src = product.image;
    modalImg.alt = product.name;
    modalCategory.textContent = product.category;
    modalTitle.textContent = product.name;
    modalPrice.textContent = `S/${product.price.toFixed(2)}`;
    modalDescription.textContent = product.description;

    // Generar botones de tallas
    modalSizes.innerHTML = '';
    if (product.sizes.length === 1 && product.sizes[0] === "Única") {
        selectedSize = "Única";
        const btn = document.createElement('button');
        btn.classList.add('size-btn', 'active');
        btn.textContent = "Única";
        modalSizes.appendChild(btn);
    } else {
        selectedSize = ''; // Resetear talla
        product.sizes.forEach(size => {
            const btn = document.createElement('button');
            btn.classList.add('size-btn');
            btn.textContent = size;
            btn.addEventListener('click', () => {
                const sizeBtns = modalSizes.querySelectorAll('.size-btn');
                sizeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedSize = size;
            });
            modalSizes.appendChild(btn);
        });
    }

    productModal.classList.add('open');
    document.body.style.overflow = 'hidden'; // Bloquear scroll de la página
};

function closeProductModal() {
    productModal.classList.remove('open');
    document.body.style.overflow = ''; // Restaurar scroll
}

// --- LÓGICA DE AGREGADO RÁPIDO (SIN ABRIR MODAL) ---
window.quickAdd = function(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    // Si tiene tallas múltiples, abrimos el modal para que elija. De lo contrario, se añade directamente.
    if (product.sizes.length > 1 && product.sizes[0] !== "Única") {
        openProductModal(productId);
    } else {
        addToCart(productId, product.sizes[0], 1);
        openCart();
    }
};

// --- GESTIÓN DEL CARRITO ---
function addToCart(productId, size, qty) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    // Buscar si ya existe el mismo artículo con la misma talla
    const existingIndex = cart.findIndex(item => item.id === productId && item.size === size);

    if (existingIndex > -1) {
        cart[existingIndex].qty += qty;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            size: size,
            qty: qty
        });
    }

    saveCart();
    updateCartUI();
}

function updateCartQty(index, change) {
    cart[index].qty += change;
    
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    
    saveCart();
    updateCartUI();
}

function removeCartItem(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('endure_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const emptyState = cartItemsContainer.querySelector('.cart-empty-state');
    
    // Eliminar items previos (excepto el empty state si queremos re-mostrarlo)
    const currentItems = cartItemsContainer.querySelectorAll('.cart-item');
    currentItems.forEach(item => item.remove());

    if (cart.length === 0) {
        if (emptyState) emptyState.style.display = 'flex';
        cartSubtotal.textContent = "$0.00";
        cartCountBadges.forEach(badge => badge.textContent = '0');
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = '0.5';
        checkoutBtn.style.pointerEvents = 'none';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    checkoutBtn.disabled = false;
    checkoutBtn.style.opacity = '1';
    checkoutBtn.style.pointerEvents = 'auto';

    let total = 0;
    let itemCount = 0;

    cart.forEach((item, index) => {
        total += item.price * item.qty;
        itemCount += item.qty;

        const cartItemEl = document.createElement('div');
        cartItemEl.classList.add('cart-item');
        cartItemEl.innerHTML = `
            <img class="cart-item-img" src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4 class="cart-item-title">${item.name}</h4>
                <div class="cart-item-meta">Talla: ${item.size}</div>
                <div class="cart-item-price">S/${(item.price * item.qty).toFixed(2)}</div>
                <div class="cart-item-actions">
                    <div class="cart-item-qty">
                        <button onclick="updateCartQty(${index}, -1)"><i class="fa-solid fa-minus"></i></button>
                        <span>${item.qty}</span>
                        <button onclick="updateCartQty(${index}, 1)"><i class="fa-solid fa-plus"></i></button>
                    </div>
                    <button class="cart-item-remove" onclick="removeCartItem(${index})">Eliminar</button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemEl);
    });

    cartSubtotal.textContent = `S/${total.toFixed(2)}`;
    cartCountBadges.forEach(badge => badge.textContent = itemCount);
}

function openCart() {
    cartDrawer.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartDrawer.classList.remove('open');
    document.body.style.overflow = '';
}

// --- PROCESAMIENTO DE COMPRA A TRAVÉS DE WHATSAPP ---
function sendOrderToWhatsApp() {
    if (cart.length === 0) return;

    let subtotal = 0;
    let productsText = "";

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;
        productsText += `- *${item.name}* (Talla: ${item.size}) x${item.qty} -> S/${itemTotal.toFixed(2)}\n`;
    });

    const totalText = `S/${subtotal.toFixed(2)}`;

    // Construcción del mensaje para enviar
    const message = `⚡ *NUEVO PEDIDO - ENDURE*\n\n` +
                    `Hola, me gustaría concretar la compra de los siguientes productos:\n\n` +
                    `${productsText}\n` +
                    `*Subtotal del Pedido:* ${totalText}\n\n` +
                    `_Quedo a la espera para coordinar el método de pago y el envío. ¡Gracias!_`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;

    // Abrir enlace en pestaña nueva
    window.open(whatsappURL, '_blank');
}

// --- FAQ ACCORDION ---
function setupFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Cerrar otros abiertos
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}
