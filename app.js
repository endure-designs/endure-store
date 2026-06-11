
// // --- RASTREADOR DE CULPABLES DEL SCROLL ---
// window.addEventListener('scroll', () => {
//     // Si el scroll ocurre durante la carga inicial o es un salto extraño al inicio (0)
//     if (window.scrollY === 0) {
//         console.log("Scroll detectado al inicio (0). Rastreando origen...");
//     }
// }, { capture: true });

// // Esto detecta si algo está llamando a scrollIntoView o scrollTo
// const originalScrollTo = window.scrollTo;
// window.scrollTo = function (...args) {
//     console.warn("¡ALERTA! Alguien llamó a window.scrollTo con:", args);
//     console.trace("Culpable:");
//     originalScrollTo.apply(this, args);
// };

// // Esto detecta si se está forzando un scroll mediante un ID en la URL
// window.addEventListener('load', () => {
//     console.log("Carga completada. Posición final:", window.scrollY);
// });


// CONFIGURACIÓN Y BASE DE DATOS DE PRODUCTOS
// Puedes reemplazar las URLs de Unsplash con las rutas locales de tus fotos (ej. 'assets/sudadera.jpg')
const PRODUCTS = [
    {
        id: 1,
        name: "Chainsaw",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Chainsaw Man.",
        image: "./assets/chainsaw.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 2,
        name: "Vegeto SSJ",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Vegeto en forma Super Saiyan.",
        image: "./assets/vegeto_ssj.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 3,
        name: "Vegeto SSJB",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Vegeto en forma Super Saiyan Blue",
        image: "./assets/vegeto_ssjb.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 4,
        name: "Gogeta SSJB",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Gogeta en forma Super Saiyan Blue",
        image: "./assets/gogeta_ssjb.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 5,
        name: "Garfield",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Garfield",
        image: "./assets/garfield6.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 6,
        name: "Baki Hanma",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Baki Hanma.",
        image: "./assets/baki_hanma.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 7,
        name: "Chainsawman Denji",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Chainsaw Man.",
        image: "./assets/chainsawman2.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 8,
        name: "Doflamingo",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Doflamingo.",
        image: "./assets/doflamingo_one_piece.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 9,
        name: "Goku, Roshi & Krilin",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Goku, Roshi & Krilin.",
        image: "./assets/dragon_ball_goku_roshi_krilin.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 10,
        name: "Goku, Roshi & Krilin saludo",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Goku, Roshi & Krilin.",
        image: "./assets/dragon_ball_goku_roshi_krilin2.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 11,
        name: "Gogeta SSJ4",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Gogeta SSJ4.",
        image: "./assets/gogeta_ssj4.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 12,
        name: "Luffy saludo",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Luffy.",
        image: "./assets/luffy_puno_arriba.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 13,
        name: "Luffy",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Luffy.",
        image: "./assets/luffy_straw_hat.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 14,
        name: "Majin Boo malvado",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Majin Boo malvado.",
        image: "./assets/majin_boo_2da_forma.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 15,
        name: "Deku, Bakugo & Todoroki",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Deku, Bakugo & Todoroki.",
        image: "./assets/mha_deku_bakugo_todoroki.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 16,
        name: "Mugiwara One Piece",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Mugiwara One Piece.",
        image: "./assets/mugiwara_one_piece.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 17,
        name: "Meliodas",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Meliodas.",
        image: "./assets/nnt_meliodas.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 18,
        name: "One Piece Luffy Gear 5",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de One Piece Luffy Gear 5.",
        image: "./assets/one_piece_luffy_gear_5.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 19,
        name: "Solo Leveling Sung Jin-Woo",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Solo Leveling Sung Jin-Woo.",
        image: "./assets/solo_leveling_sung_jin_woo.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 20,
        name: "Verano Bulma & Roshi",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Verano Bulma & Roshi.",
        image: "./assets/verano_bulma_roshi.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 21,
        name: "Ace One Piece",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Ace One Piece.",
        image: "./assets/ace_one_piece.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 22,
        name: "Chopper One Piece",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Chopper One Piece.",
        image: "./assets/chopper_one_piece.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 23,
        name: "Fusión Goku y Vegeta",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Fusión Goku y Vegeta.",
        image: "./assets/goku_vegeta_vegeto.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 24,
        name: "Itachi Genjutsu",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Itachi.",
        image: "./assets/itachi_genjutsu.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 25,
        name: "Kenjaku Culling Game",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Kenjaku.",
        image: "./assets/jujutsu_kaisen_kenjaku.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 26,
        name: "Okarun Dandadan",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Okarun Dandadan.",
        image: "./assets/okarun_dandadan.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 27,
        name: "Parque titánico",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Parque titánico.",
        image: "./assets/parque_titanico.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 28,
        name: "Picoro",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Picoro.",
        image: "./assets/picoro_dragon_ball.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 29,
        name: "Saitama One Punch Man",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Saitama One Punch Man.",
        image: "./assets/saitama_one_punch_man.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 30,
        name: "Profesor Gojo",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Satoru Gojo.",
        image: "./assets/satoru_gojo.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 31,
        name: "Satoru Gojo Estudiante",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Satoru Gojo.",
        image: "./assets/satoru_gojo_joven.webp",
        sizes: ["S", "M", "L", "XL"],
        tag: "Nuevo"
    },
    {
        id: 32,
        name: "Primera Forma Cell",
        category: "camisetas",
        price: 35.00,
        description: "Camiseta con diseño de Primera Forma Cell.",
        image: "./assets/cell_1era_forma.webp",
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
    document.addEventListener('contextmenu', function (e) {
        if (e.target.closest('.product-img-wrapper') || e.target.closest('.product-img') || e.target.closest('#modalImg') || e.target.closest('.modal-image-container') || e.target.closest('.cart-item-img')) {
            e.preventDefault();
            e.stopPropagation();
        }
    });
});

// --- RENDERIZACIÓN DE PRODUCTOS ---
// Pagination constants
const PRODUCTS_PER_TAB_DESKTOP = 15;
const PRODUCTS_PER_TAB_MOBILE = 10;
let currentPage = 1;
let currentFilter = 'all';

// Determine products per page based on screen width
function getProductsPerPage() {
    return window.innerWidth <= 768 ? PRODUCTS_PER_TAB_MOBILE : PRODUCTS_PER_TAB_DESKTOP;
}

// Render products for current filter and page
function renderCurrentProducts() {
    const perPage = getProductsPerPage();
    const filtered = currentFilter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === currentFilter);
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
function renderProducts(categoryFilter = 'all') {
    currentFilter = categoryFilter;
    currentPage = 1; // Reset to first page on filter change
    renderCurrentProducts();
}

// Re‑render on window resize to adjust per‑page count
// window.addEventListener('resize', () => {
//     renderCurrentProducts();
// });


// --- OPTIMIZACIÓN DEL REDIMENSIONAMIENTO ---
let resizeTimer;
window.addEventListener('resize', () => {
    // Esto cancela cualquier renderizado previo si el evento se dispara muy rápido
    clearTimeout(resizeTimer);

    // Solo espera 250ms después de que el usuario deja de mover la ventana
    resizeTimer = setTimeout(() => {
        renderCurrentProducts();
    }, 250);
});



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

/**
 * Initialize desktop hover zoom on the modal image.
 */
// function setupDesktopZoom() {
//     const container = modalImg.parentElement; // .modal-image-container
//     // Mouse enter – activate zoom
//     modalImg.addEventListener('mouseenter', (e) => {
//         if (window.innerWidth <= 768) return; // skip on mobile
//         desktopZoomActive = true;
//         modalImg.classList.add('zoomed');
//         // Calculate maximum translation limits based on image size and scale
//         const imgRect = modalImg.getBoundingClientRect();
//         const imgWidth = imgRect.width;
//         const imgHeight = imgRect.height;
//         maxTranslateX = (DESKTOP_ZOOM_SCALE - 1) * imgWidth / 2;
//         maxTranslateY = (DESKTOP_ZOOM_SCALE - 1) * imgHeight / 2;
//         // Reset any previous transforms
//         currentTranslateX = 0;
//         currentTranslateY = 0;
//         modalImg.style.transform = `scale(${DESKTOP_ZOOM_SCALE})`;
//     });

//     // Mouse move – pan while zoomed (bounded)
//     container.addEventListener('mousemove', (e) => {
//         if (!desktopZoomActive) return;
//         const rect = container.getBoundingClientRect();
//         const offsetX = e.clientX - rect.left - rect.width / 2; // distance from center
//         const offsetY = e.clientY - rect.top - rect.height / 2;
//         // Desired translation is opposite direction of mouse offset, scaled
//         let tx = -offsetX * (DESKTOP_ZOOM_SCALE - 1);
//         let ty = -offsetY * (DESKTOP_ZOOM_SCALE - 1);
//         // Clamp to limits so we never show empty space
//         tx = Math.max(-maxTranslateX, Math.min(maxTranslateX, tx));
//         ty = Math.max(-maxTranslateY, Math.min(maxTranslateY, ty));
//         currentTranslateX = tx;
//         currentTranslateY = ty;
//         modalImg.style.transform = `scale(${DESKTOP_ZOOM_SCALE}) translate(${tx}px, ${ty}px)`;
//     });

//     // Mouse leave – reset zoom
//     modalImg.addEventListener('mouseleave', () => {
//         if (window.innerWidth <= 768) return;
//         desktopZoomActive = false;
//         modalImg.classList.remove('zoomed');
//         modalImg.style.transform = '';
//     });
// }



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

// Initialise both behaviours after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setupDesktopZoom();
    setupMobileZoom();
});



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
