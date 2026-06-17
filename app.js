let PRODUCTS = [];

async function loadProducts() {
    try {
        const response = await fetch('./products.json');
        PRODUCTS = await response.json(); // Se rellena automáticamente
        populateCollectionSelect();
    } catch (error) {
        console.error("Error al cargar el JSON:", error);
    }
}

// Ejecutar al cargar la página
loadProducts();

// Populate collection (theme) dropdown based on product data
function populateCollectionSelect() {
    if (!collectionSelect) return;
    // Clear existing options except the default 'all'
    const currentValue = collectionSelect.value;
    collectionSelect.innerHTML = '';
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'Todas las colecciones';
    collectionSelect.appendChild(allOption);
    const themes = new Set();
    PRODUCTS.forEach(p => {
        if (p.theme) themes.add(p.theme);
    });
    themes.forEach(theme => {
        const opt = document.createElement('option');
        opt.value = theme;
        opt.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
        collectionSelect.appendChild(opt);
    });
    // Restore previous selection if still valid
    if ([...collectionSelect.options].some(o => o.value === currentValue)) {
        collectionSelect.value = currentValue;
    } else {
        collectionSelect.value = 'all';
    }
    // Refresh the custom dropdown UI for collection filter
    rebuildCustomDropdown('collectionSelect');
}




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
const categorySelect = document.getElementById('categorySelect');
const collectionSelect = document.getElementById('collectionSelect');
const sortSelect = document.getElementById('sortSelect');

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

// La inicialización ahora se concentra en initApp()

// --- RENDERIZACIÓN DE PRODUCTOS ---
// Pagination constants
const PRODUCTS_PER_TAB_DESKTOP = 15;
const PRODUCTS_PER_TAB_MOBILE = 10;
let currentPage = 1;
let currentFilter = 'all';
let currentCollection = 'all'; // collection (theme) filter

// Determine products per page based on screen width
function getProductsPerPage() {
    return window.innerWidth <= 768 ? PRODUCTS_PER_TAB_MOBILE : PRODUCTS_PER_TAB_DESKTOP;
}

// Render products for current filter and page
function renderCurrentProducts() {
    const perPage = getProductsPerPage();
    // Apply category filter
    let filtered = currentFilter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === currentFilter);
    // Apply collection (theme) filter
    if (currentCollection && currentCollection !== 'all') {
        filtered = filtered.filter(p => p.theme === currentCollection);
    }
    // Apply sorting
    if (currentSort) {
        if (currentSort === 'date-asc') {
            filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (currentSort === 'date-desc') {
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (currentSort === 'price-asc') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (currentSort === 'price-desc') {
            filtered.sort((a, b) => b.price - a.price);
        }
    }
    const totalPages = Math.ceil(filtered.length / perPage);
    // Ensure current page is within bounds
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    const pageProducts = filtered.slice(start, end);
    // Fade out animation
    productsGrid.classList.add('fade-out');
    setTimeout(() => {
        productsGrid.innerHTML = '';
        if (pageProducts.length === 0) {
            productsGrid.innerHTML = `<p class="no-products">No hay productos en esta categoría por el momento.</p>`;
        } else {
            pageProducts.forEach(product => {
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
        // Fade in
        productsGrid.classList.remove('fade-out');
        // Update pagination UI
        updatePaginationTabs(totalPages);
        // Scroll to grid start
        //window.scrollTo({ top: productsGrid.offsetTop - 100, behavior: 'smooth' });
    }, 300);
}



function scrollToProducts() {
    const headerOffset = 100; // Ajusta según la altura de tu navbar
    const elementPosition = productsGrid.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
    });
}


// Update pagination tabs UI
function updatePaginationTabs(totalPages) {
    const paginationContainer = document.getElementById('paginationTabs');
    paginationContainer.innerHTML = '';
    if (totalPages <= 1) return; // No tabs needed
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.classList.add('tab-btn');
        if (i === currentPage) btn.classList.add('active');
        btn.textContent = i;
        btn.addEventListener('click', () => {
            if (i === currentPage) return;
            currentPage = i;
            renderCurrentProducts();
            scrollToProducts();
        });
        paginationContainer.appendChild(btn);
    };
}


// --- RENDERIZACIÓN DE PRODUCTOS (original call) ---
// Global sort variable
let currentSort = 'date-asc'; // default sorting

// Render products (category filter update)
function renderProducts(categoryFilter = 'all') {
    // Update global filter and sync select UI
    currentFilter = categoryFilter;
    if (typeof categorySelect !== 'undefined') {
        categorySelect.value = currentFilter;
    }
    // Reset to first page on filter change
    currentPage = 1;
    renderCurrentProducts();
}

// Setup event listeners for new dropdown filters
function setupSelectListeners() {
    if (categorySelect) {
        categorySelect.addEventListener('change', () => {
            currentFilter = categorySelect.value;
            currentPage = 1;
            renderCurrentProducts();
        });
    }
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentSort = sortSelect.value;
            // For now, just re-render; sorting logic to be implemented later
            renderCurrentProducts();
        });
    }
    if (collectionSelect) {
        collectionSelect.addEventListener('change', () => {
            currentCollection = collectionSelect.value;
            currentPage = 1;
            renderCurrentProducts();
        });
    }
}

// Call setupSelectListeners during initialization
function initApp() {
    updateCartUI();
    setupEventListeners();
    setupFAQAccordion();
    setupSelectListeners();
    initCustomDropdowns(); // Initialize custom dropdown UI
    renderProducts('all');
    // Existing zoom setups
    setupDesktopZoom();
    setupMobileZoom();

    // Disable right-click on product images and quick view overlay
    document.addEventListener('contextmenu', function (e) {
        if (e.target.closest('.product-img-wrapper') || e.target.closest('.product-img') || e.target.closest('#modalImg') || e.target.closest('.modal-image-container') || e.target.closest('.cart-item-img')) {
            e.preventDefault();
            e.stopPropagation();
        }
    });
}

// Initialize custom dropdowns for all .custom-dropdown elements
function initCustomDropdowns() {
    const dropdowns = document.querySelectorAll('.custom-dropdown');
    dropdowns.forEach(dd => {
        const selectId = dd.getAttribute('data-select-id');
        const nativeSelect = document.getElementById(selectId);
        if (!nativeSelect) return;
        // Hide native select (already via CSS). Build custom list.
        const list = document.createElement('div');
        list.classList.add('dropdown-list');
        Array.from(nativeSelect.options).forEach(opt => {
            const item = document.createElement('div');
            item.classList.add('dropdown-item');
            item.textContent = opt.textContent;
            if (opt.selected) item.classList.add('active');
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                // Update native select
                nativeSelect.value = opt.value;
                // Update displayed selected text
                refreshCustomDropdown(selectId);
                // Close dropdown
                dd.classList.remove('open');
                // Trigger change event for other listeners
                const event = new Event('change', { bubbles: true });
                nativeSelect.dispatchEvent(event);
            });
            list.appendChild(item);
        });
        // Selected display element
        const selectedDiv = document.createElement('div');
        selectedDiv.classList.add('selected');
        selectedDiv.textContent = nativeSelect.selectedOptions[0]?.textContent || '';
        dd.appendChild(selectedDiv);
        dd.appendChild(list);
        // Toggle open/close
        dd.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close other open dropdowns
            document.querySelectorAll('.custom-dropdown.open').forEach(openDd => {
                if (openDd !== dd) openDd.classList.remove('open');
            });
            dd.classList.toggle('open');
        });
        // Close when clicking outside
        document.addEventListener('click', () => dd.classList.remove('open'));
    });
}

// Rebuild custom dropdown items (used when native select options change dynamically)
function rebuildCustomDropdown(selectId) {
    const dd = document.querySelector(`.custom-dropdown[data-select-id="${selectId}"]`);
    const nativeSelect = document.getElementById(selectId);
    if (!dd || !nativeSelect) return;

    let list = dd.querySelector('.dropdown-list');
    if (!list) return;

    list.innerHTML = '';
    Array.from(nativeSelect.options).forEach(opt => {
        const item = document.createElement('div');
        item.classList.add('dropdown-item');
        item.textContent = opt.textContent;
        if (opt.selected) item.classList.add('active');
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            nativeSelect.value = opt.value;
            refreshCustomDropdown(selectId);
            dd.classList.remove('open');
            const event = new Event('change', { bubbles: true });
            nativeSelect.dispatchEvent(event);
        });
        list.appendChild(item);
    });
    
    refreshCustomDropdown(selectId);
}

// Refresh displayed selected text for a specific custom dropdown
function refreshCustomDropdown(selectId) {
    const dd = document.querySelector(`.custom-dropdown[data-select-id="${selectId}"]`);
    const nativeSelect = document.getElementById(selectId);
    if (!dd || !nativeSelect) return;
    const selectedDiv = dd.querySelector('.selected');
    if (selectedDiv) {
        selectedDiv.textContent = nativeSelect.selectedOptions[0]?.textContent || '';
    }
    // Update active class on items
    dd.querySelectorAll('.dropdown-item').forEach(item => {
        const opt = Array.from(nativeSelect.options).find(o => o.textContent === item.textContent);
        if (opt && opt.selected) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Initialise both behaviours after DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

// Re‑render on window resize to adjust per‑page count
// window.addEventListener('resize', () => {
//     renderCurrentProducts();
// });



// En lugar de usar window.addEventListener('resize', ...)
const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
        // Solo renderiza cuando el contenedor de productos cambie de tamaño real
        renderCurrentProducts();
    }
});

// Observamos el contenedor principal de tu grid
resizeObserver.observe(document.querySelector('.products-grid'));



// Zoom functionality for product modal image (desktop hover zoom 300% with bounded drag, mobile click-to-open overlay)

// Desktop zoom constants
const DESKTOP_ZOOM_SCALE = 3;

// State variables for desktop zoom and drag
let desktopZoomActive = false;
let dragStartX = 0;
let dragStartY = 0;
let currentTranslateX = 0;
let currentTranslateY = 0;
let maxTranslateX = 0;
let maxTranslateY = 0;


//Función para hacer zoom al pasar el mouse sobre la imagen en vista rápida

function setupDesktopZoom() {
    const container = modalImg.parentElement;
    const scale = DESKTOP_ZOOM_SCALE;

    modalImg.addEventListener('mouseenter', () => {
        if (window.innerWidth <= 768) return;
        desktopZoomActive = true;
        modalImg.classList.add('zoomed');

        // La imagen escalada al 300% es 3 veces el tamaño del contenedor
        // Lo que "sobra" de imagen es: (ancho * scale) - ancho
        // Como movemos la imagen con translate, el límite es ese sobrante
        modalImg.style.transformOrigin = '0 0'; // MUY IMPORTANTE: fija el origen a la esquina
        modalImg.style.transform = `scale(${scale})`;
    });

    container.addEventListener('mousemove', (e) => {
        if (!desktopZoomActive) return;

        const rect = container.getBoundingClientRect();

        // 1. Obtener posición del mouse normalizada (de 0 a 1)
        const mouseX = (e.clientX - rect.left) / rect.width;
        const mouseY = (e.clientY - rect.top) / rect.height;

        // 2. Calcular cuánto margen "sobra" de la imagen
        // maxScroll es el espacio total que podemos desplazar
        const maxScrollX = (modalImg.clientWidth * scale) - rect.width;
        const maxScrollY = (modalImg.clientHeight * scale) - rect.height;

        // 3. Aplicar el desplazamiento proporcional
        // moveX va de 0 a maxScrollX. Usamos negativo para mover la imagen
        const tx = mouseX * maxScrollX;
        const ty = mouseY * maxScrollY;

        // Aplicar la transformación usando translate negativo
        // Dividimos por scale para compensar el escalado del navegador
        modalImg.style.transform = `scale(${scale}) translate(${-tx / scale}px, ${-ty / scale}px)`;
    });

    modalImg.addEventListener('mouseleave', () => {
        desktopZoomActive = false;
        modalImg.classList.remove('zoomed');
        modalImg.style.transform = 'scale(1) translate(0px, 0px)';
    });
}


/**
 * Mobile behavior: click opens a full‑screen overlay that can be pinch‑zoomed.
 */
function setupMobileZoom() {
    const mobileOverlay = document.getElementById('mobileZoomOverlay');
    const mobileImg = document.getElementById('mobileZoomImg');
    // Click on the modal image opens the overlay (only on small screens)
    modalImg.addEventListener('click', (e) => {
        if (window.innerWidth > 768) return; // desktop handled by hover
        mobileImg.src = modalImg.src;
        mobileImg.alt = modalImg.alt;
        mobileOverlay.classList.add('visible');
    });
    // Clicking outside the image closes the overlay
    mobileOverlay.addEventListener('click', (e) => {
        if (e.target !== mobileImg) {
            mobileOverlay.classList.remove('visible');
        }
    });
}

// Funcionalidades de zoom consolidadas en initApp



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
window.openProductModal = function (productId) {
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
window.quickAdd = function (productId) {
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
        cartSubtotal.textContent = "S/0.00";
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
