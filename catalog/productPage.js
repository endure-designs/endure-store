// ==========================================================================
// PRODUCT PAGE — Controlador de la página dedicada de producto
// ==========================================================================
// Carga un producto por slug desde la API, renderiza su información
// en la página dedicada, actualiza los meta tags para SEO y genera
// datos estructurados JSON-LD para Google.
// ==========================================================================

(function () {

    'use strict';

    // ======================================================================
    // 1. UTILIDADES
    // ======================================================================

    /**
     * Genera el slug SEO-friendly a partir del nombre del producto.
     * Debe coincidir exactamente con la lógica usada en catalogCard.js
     * para generar los hrefs de las tarjetas.
     */
    function generateSlug(text) {

        return String(text)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }

    /**
     * Normaliza la ruta de imagen para que siempre sea absoluta respecto a la raíz del sitio,
     * evitando errores 404 al usar history.replaceState con rutas como /producto/{slug}.
     */
    function normalizeImagePath(src) {
        if (!src) return '/assets/ICONO_WEB.webp';
        if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return src;
        if (src.startsWith('./')) return src.replace(/^\.\//, '/');
        if (src.startsWith('/')) return src;
        return '/' + src;
    }


    /**
     * Extrae el slug de la URL actual.
     * Soporta query strings (?slug=xxx, ?p=xxx, ?id=xxx),
     * rutas limpias (/producto/{slug}, /product/{slug}) y hash (#/producto/{slug})
     */
    function getSlugFromURL() {

        // 1. Query parameter (?slug=... o ?p=... o ?id=...)
        const urlParams = new URLSearchParams(window.location.search);
        const querySlug = urlParams.get('slug') || urlParams.get('p') || urlParams.get('id');
        if (querySlug) {
            return decodeURIComponent(querySlug.trim());
        }

        // 2. Ruta en pathname (/producto/{slug} o /product/{slug})
        const path = window.location.pathname;
        const match = path.match(/^\/(?:producto|product)\/([^/]+)\/?$/i);
        if (match) {
            return decodeURIComponent(match[1].trim());
        }

        // 3. Fragmento hash (#/producto/{slug} o #producto/{slug})
        if (window.location.hash) {
            const hashMatch = window.location.hash.match(/^#\/?(?:producto|product)\/([^/?]+)/i);
            if (hashMatch) {
                return decodeURIComponent(hashMatch[1].trim());
            }
        }

        return null;
    }


    // ======================================================================
    // 2. ACTUALIZAR META TAGS SEO
    // ======================================================================

    function updateSEOMetaTags(product) {

        const baseUrl = 'https://endure.com.pe';
        const productSlug = product.slug || generateSlug(product.name);
        const productUrl = `${baseUrl}/producto/${productSlug}`;
        const productTitle = `${product.name} | ENDURE`;
        const productDescription = product.description
            || `Descubre ${product.name} en ENDURE - Streetwear & Urban Archives.`;
        const productImage = product.image
            ? (product.image.startsWith('http')
                ? product.image
                : `${baseUrl}${product.image}`)
            : '';

        // Title
        document.title = productTitle;

        // Canonical
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) canonical.href = productUrl;

        // Meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.content = productDescription;

        // Open Graph
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.content = productTitle;

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.content = productDescription;

        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) ogImage.content = productImage;

        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.content = productUrl;

        // Twitter
        const twTitle = document.querySelector('meta[name="twitter:title"]');
        if (twTitle) twTitle.content = productTitle;

        const twDesc = document.querySelector('meta[name="twitter:description"]');
        if (twDesc) twDesc.content = productDescription;

        const twImage = document.querySelector('meta[name="twitter:image"]');
        if (twImage) twImage.content = productImage;
    }


    // ======================================================================
    // 3. GENERAR DATOS ESTRUCTURADOS JSON-LD
    // ======================================================================

    function updateJsonLd(product) {

        const baseUrl = 'https://endure.com.pe';
        const productSlug = product.slug || generateSlug(product.name);

        const price = product.price != null
            ? parseFloat(product.price)
            : 0;

        const schema = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            'name': product.name,
            'description': product.description || '',
            'image': product.image
                ? (product.image.startsWith('http')
                    ? product.image
                    : `${baseUrl}${product.image}`)
                : '',
            'url': `${baseUrl}/producto/${productSlug}`,
            'brand': {
                '@type': 'Brand',
                'name': 'ENDURE'
            },
            'offers': {
                '@type': 'Offer',
                'priceCurrency': 'PEN',
                'price': price.toFixed(2),
                'availability': 'https://schema.org/InStock',
                'url': `${baseUrl}/producto/${productSlug}`,
                'seller': {
                    '@type': 'Organization',
                    'name': 'ENDURE'
                }
            }
        };

        // Categoría
        if (product.category?.name) {
            schema.category = product.category.name;
        }

        const jsonLdScript = document.getElementById('productJsonLd');
        if (jsonLdScript) {
            jsonLdScript.textContent = JSON.stringify(schema);
        }
    }


    // ======================================================================
    // 4. RENDERIZAR PRODUCTO EN LA PÁGINA
    // ======================================================================

    function renderProduct(product) {

        // --- Elementos del DOM ---

        const pageImg = document.getElementById('pageProductImg');
        const pageCategory = document.getElementById('pageProductCategory');
        const pageTitle = document.getElementById('pageProductTitle');
        const pagePrice = document.getElementById('pageProductPrice');
        const pageDescription = document.getElementById('pageProductDescription');
        const pageAttributes = document.getElementById('pageProductAttributes');
        const breadcrumbName = document.getElementById('breadcrumbProductName');

        // --- Datos principales ---

        if (pageImg) {
            pageImg.src = normalizeImagePath(product.image);
            pageImg.alt = product.name || '';
        }

        if (pageCategory) {
            const catName = product.category?.name || (typeof product.category === 'string' ? product.category : '-');
            pageCategory.textContent = String(catName).toUpperCase();
        }

        if (pageTitle) {
            pageTitle.textContent = product.name || '';
        }

        if (breadcrumbName) {
            breadcrumbName.textContent = product.name || '';
        }

        if (pageDescription) {
            pageDescription.textContent = product.description || '';
        }

        // --- Precio ---

        renderPrice(product, null);

        // --- Variantes y atributos ---

        const variants = Array.isArray(product.variants)
            ? product.variants
            : [];

        // Estado local de la página de producto
        window._productPageState = {
            product: product,
            selectedQty: 1,
            selectedAttributes: {},
            selectedVariant: null
        };

        // Funciones auxiliares para atributos (misma lógica que catalogCardModal.js)
        const getAttributeKey = attr => {
            const slug = attr?.attribute?.slug;
            const name = attr?.attribute?.name;
            const id = attr?.attribute?.id;
            return String(slug || name || id || '').trim().toLowerCase();
        };

        const getAttributeName = attr => {
            return String(attr?.attribute?.name || attr?.attribute?.slug || '').trim();
        };

        const getAttributeValue = attr => {
            return attr?.option?.value ?? '';
        };

        const getAttributeColor = attr => {
            return attr?.option?.hexColor || '';
        };

        // Construir grupos de atributos
        const attributeGroups = {};

        variants.forEach(variant => {
            if (!Array.isArray(variant.attributes)) return;

            variant.attributes.forEach(attr => {
                const key = getAttributeKey(attr);
                if (!key) return;

                const name = getAttributeName(attr);
                const value = getAttributeValue(attr);
                const hexColor = getAttributeColor(attr);

                if (!value) return;

                if (!attributeGroups[key]) {
                    attributeGroups[key] = { key, name, options: [] };
                }

                const alreadyExists = attributeGroups[key].options.some(
                    opt => String(opt.value) === String(value)
                );

                if (!alreadyExists) {
                    attributeGroups[key].options.push({ value, hexColor });
                }
            });
        });

        // Si no se encontraron grupos a través de variantes, usar colors y sizes directos del producto
        if (Object.keys(attributeGroups).length === 0) {
            if (Array.isArray(product.colors) && product.colors.length > 0) {
                attributeGroups['color'] = {
                    key: 'color',
                    name: 'Color',
                    options: product.colors.map(c => ({
                        value: c,
                        hexColor: String(c).startsWith('#') ? c : ''
                    }))
                };
            }

            if (Array.isArray(product.sizes) && product.sizes.length > 0) {
                attributeGroups['talla'] = {
                    key: 'talla',
                    name: 'Talla',
                    options: product.sizes.map(s => ({
                        value: s,
                        hexColor: ''
                    }))
                };
            }
        }

        // Variante por defecto
        const defaultVariant =
            variants.find(v => v.isDefault === true) ||
            variants[0] ||
            (variants.length === 0 ? { id: product.id, price: product.price } : null);

        window._productPageState.selectedVariant = defaultVariant;

        if (defaultVariant && Array.isArray(defaultVariant.attributes)) {
            defaultVariant.attributes.forEach(attr => {
                const key = getAttributeKey(attr);
                const value = getAttributeValue(attr);
                if (key && value !== '') {
                    window._productPageState.selectedAttributes[key] = value;
                }
            });
        }

        // Asegurar que cada grupo tenga una opción seleccionada por defecto
        Object.values(attributeGroups).forEach(group => {
            if (group.options.length > 0 && !window._productPageState.selectedAttributes[group.key]) {
                window._productPageState.selectedAttributes[group.key] = group.options[0].value;
            }
        });

        // Renderizar selectores de atributos
        if (pageAttributes) {

            pageAttributes.innerHTML = '';

            Object.values(attributeGroups).forEach(group => {

                const attributeGroup = document.createElement('div');
                attributeGroup.classList.add('attribute-group');

                const label = document.createElement('label');
                label.textContent = `${group.name}:`;

                const optionsContainer = document.createElement('div');

                const hasColorOptions = group.options.some(opt => opt.hexColor);

                optionsContainer.classList.add('attribute-options');
                if (hasColorOptions) {
                    optionsContainer.classList.add('color-options');
                }

                group.options.forEach(option => {

                    const button = document.createElement('button');
                    button.type = 'button';

                    const isDefaultOption = String(
                        window._productPageState.selectedAttributes[group.key]
                    ) === String(option.value);

                    if (isDefaultOption) {
                        button.classList.add('active');
                    }

                    if (option.hexColor) {
                        button.classList.add('color-option');
                        button.style.backgroundColor = option.hexColor;
                        button.title = option.value;
                        button.setAttribute('aria-label', option.value);
                    } else {
                        button.classList.add('attribute-option');
                        button.textContent = option.value;
                    }

                    button.addEventListener('click', () => {
                        optionsContainer.querySelectorAll('button')
                            .forEach(btn => btn.classList.remove('active'));
                        button.classList.add('active');

                        window._productPageState.selectedAttributes[group.key] = option.value;
                        updateSelectedVariant(variants, getAttributeKey, getAttributeValue);
                    });

                    optionsContainer.appendChild(button);
                });

                attributeGroup.appendChild(label);
                attributeGroup.appendChild(optionsContainer);
                pageAttributes.appendChild(attributeGroup);
            });
        }

        // Selección inicial
        updateSelectedVariant(variants, getAttributeKey, getAttributeValue);

        // --- Cantidad ---
        setupQuantityControls();

        // --- Botón Añadir al Carrito ---
        setupAddToCart(product);
    }


    // ======================================================================
    // 5. PRECIO
    // ======================================================================

    function renderPrice(product, variant) {

        const priceEl = document.getElementById('pageProductPrice');
        if (!priceEl) return;

        const currentPrice = variant?.price != null
            ? parseFloat(variant.price)
            : parseFloat(product.price || 0);

        const comparePrice = variant?.compareAtPrice != null
            ? parseFloat(variant.compareAtPrice)
            : parseFloat(product.compareAtPrice || 0);

        const isOnSale = comparePrice > currentPrice;

        if (isOnSale) {
            priceEl.innerHTML = `
                <span class="modal-price-compare">S/${comparePrice.toFixed(2)}</span>
                <span class="modal-price-current">S/${currentPrice.toFixed(2)}</span>
            `;
        } else {
            priceEl.innerHTML = `
                <span class="modal-price-current">S/${currentPrice.toFixed(2)}</span>
            `;
        }
    }


    // ======================================================================
    // 6. BUSCAR VARIANTE SELECCIONADA
    // ======================================================================

    function updateSelectedVariant(variants, getAttributeKey, getAttributeValue) {

        const state = window._productPageState;
        const selectedAttributes = state.selectedAttributes || {};
        const selectedKeys = Object.keys(selectedAttributes);

        if (selectedKeys.length === 0) {
            state.selectedVariant = variants.length === 1 ? variants[0] : null;
            return;
        }

        const selectedVariant = variants.find(variant => {
            if (!Array.isArray(variant.attributes)) return false;

            const variantAttributes = {};
            variant.attributes.forEach(attr => {
                const key = getAttributeKey(attr);
                const value = getAttributeValue(attr);
                if (key) variantAttributes[key] = value;
            });

            return selectedKeys.every(key =>
                String(variantAttributes[key]) === String(selectedAttributes[key])
            );
        });

        state.selectedVariant = selectedVariant || null;
        renderPrice(state.product, state.selectedVariant);

        // Si la variante tiene imagen propia, actualizarla
        if (selectedVariant?.image) {
            const pageImg = document.getElementById('pageProductImg');
            if (pageImg) pageImg.src = normalizeImagePath(selectedVariant.image);
        } else if (state.product?.image) {
            const pageImg = document.getElementById('pageProductImg');
            if (pageImg) pageImg.src = normalizeImagePath(state.product.image);
        }
    }


    // ======================================================================
    // 7. CONTROLES DE CANTIDAD
    // ======================================================================

    function setupQuantityControls() {

        const qtyVal = document.getElementById('pageQtyVal');
        const qtyMinus = document.getElementById('pageQtyMinus');
        const qtyPlus = document.getElementById('pageQtyPlus');

        if (!qtyVal || !qtyMinus || !qtyPlus) return;

        qtyVal.textContent = '1';

        qtyMinus.addEventListener('click', () => {
            const current = parseInt(qtyVal.textContent) || 1;
            if (current > 1) {
                qtyVal.textContent = current - 1;
                window._productPageState.selectedQty = current - 1;
            }
        });

        qtyPlus.addEventListener('click', () => {
            const current = parseInt(qtyVal.textContent) || 1;
            if (current < 99) {
                qtyVal.textContent = current + 1;
                window._productPageState.selectedQty = current + 1;
            }
        });
    }


    // ======================================================================
    // 8. AÑADIR AL CARRITO
    // ======================================================================

    function setupAddToCart(product) {

        const addBtn = document.getElementById('pageAddBtn');
        if (!addBtn) return;

        addBtn.addEventListener('click', () => {

            const state = window._productPageState;
            const variant = state.selectedVariant;
            const variants = Array.isArray(product.variants) ? product.variants : [];

            // Si hay variantes pero no se seleccionó una válida
            if (variants.length > 0 && !variant) {

                if (window.alertModal && typeof alertModal.show === 'function') {
                    alertModal.show({
                        type: 'warning',
                        title: 'Selecciona una opción',
                        message: 'Por favor, selecciona todas las opciones del producto antes de añadir al carrito.',
                        duration: 4000
                    });
                }
                return;
            }

            // Sincronizar con appState para que addToCart funcione
            if (window.appState) {
                appState.selectedProduct = product;
                appState.selectedQty = state.selectedQty;
                appState.selectedAttributes = state.selectedAttributes;
                appState.selectedVariant = variant;
            }

            // Llamar a la función global de agregar al carrito
            (async () => {
                try {
                    const effectiveVariant = variant || (variants.length > 0 ? variants[0] : { id: product.id, price: product.price });

                    if (typeof addToCart === 'function') {
                        await addToCart(product.id, effectiveVariant, state.selectedQty || 1);
                    } else if (typeof quickAdd === 'function') {
                        await quickAdd(product.id);
                    }

                    // Abrir drawer del carrito
                    if (typeof openCartDrawer === 'function') {
                        openCartDrawer();
                    }

                    // Notificación visual de éxito
                    if (window.alertModal && typeof alertModal.show === 'function') {
                        alertModal.show({
                            type: 'success',
                            title: '¡Añadido al carrito!',
                            message: `${product.name} se agregó exitosamente.`,
                            duration: 3000
                        });
                    }
                } catch (cartErr) {
                    console.error('❌ Error añadiendo al carrito:', cartErr);
                }
            })();
        });
    }


    // ======================================================================
    // 9. CARGAR PARTIALS DEL CARRITO
    // ======================================================================

    async function loadCartPartials() {

        try {
            // Cargar HTML del carrito
            const cartContainer = document.getElementById('cartModalContainer');
            if (cartContainer && cartContainer.innerHTML.trim() === '') {
                const response = await fetch('/partials/cart/cart-modal.html');
                if (response.ok) {
                    cartContainer.innerHTML = await response.text();
                }
            }

            // Cargar HTML del alert modal
            const alertContainer = document.getElementById('alertModalContainer');
            if (alertContainer && alertContainer.innerHTML.trim() === '') {
                const response = await fetch('/components/alerta/alert-modal.html');
                if (response.ok) {
                    alertContainer.innerHTML = await response.text();
                }
            }
        } catch (err) {
            console.warn('⚠️ Error cargando partials:', err);
        }
    }


    // ======================================================================
    // 10. INIT: CONFIGURAR NAVBAR Y SESIÓN
    // ======================================================================

    async function initNavbar() {

        window.currentUser = null;

        if (window.authManager && typeof authManager.checkAuthSession === 'function') {
            try {
                window.currentUser = await authManager.checkAuthSession();
            } catch (e) {
                console.warn('⚠️ Error verificando sesión:', e);
            }
        }

        // Carrito local
        if (typeof loadCart === 'function') loadCart();
        if (typeof updateCartUI === 'function') updateCartUI();

        // Eventos del carrito drawer
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn && typeof openCartDrawer === 'function') {
            cartBtn.addEventListener('click', openCartDrawer);
        }

        // Eventos navbar del usuario
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userMenu = document.getElementById('userMenu');
        const logoutBtn = document.getElementById('logoutBtn');

        if (userMenuBtn && userMenu) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userMenu.style.display = userMenu.style.display === 'none' ? 'block' : 'none';
            });

            document.addEventListener('click', () => {
                userMenu.style.display = 'none';
            });
        }

        if (logoutBtn && typeof handleLogout === 'function') {
            logoutBtn.addEventListener('click', handleLogout);
        }

        // Alert modal init
        if (window.alertModal && typeof alertModal.init === 'function') {
            alertModal.init();
        }
    }


    // ======================================================================
    // 11. INIT PRINCIPAL — CARGAR PRODUCTO
    // ======================================================================

    async function initProductPage() {

        const loadingEl = document.getElementById('productPageLoading');
        const contentEl = document.getElementById('productPageContent');
        const errorEl = document.getElementById('productPageError');

        // Cargar partials necesarios
        await loadCartPartials();

        // Inicializar navbar y sesión
        await initNavbar();

        // Obtener slug de la URL
        const slug = getSlugFromURL();

        if (!slug) {
            // No hay slug — mostrar error
            if (loadingEl) loadingEl.style.display = 'none';
            if (errorEl) errorEl.style.display = 'flex';
            return;
        }

        try {
            // Llamar a la API para obtener el producto por slug
            const response = await catalogApi.getProductBySlug(slug);

            if (!response.success || !response.data) {
                throw new Error('Producto no encontrado');
            }

            const product = response.data;

            // Registrar en catalogManager para operaciones del carrito
            if (window.catalogManager && typeof catalogManager.registerProduct === 'function') {
                catalogManager.registerProduct(product);
            }

            // Renderizar
            renderProduct(product);

            // Actualizar SEO
            updateSEOMetaTags(product);
            updateJsonLd(product);

            // Actualizar URL limpia en el navegador si soporta history API
            const canonicalSlug = product.slug || generateSlug(product.name);
            if (window.history && window.history.replaceState && canonicalSlug) {
                try {
                    window.history.replaceState(null, '', `/producto/${encodeURIComponent(canonicalSlug)}`);
                } catch (e) {
                    // Ignorar si hay restricciones locales
                }
            }

            // Mostrar contenido
            if (loadingEl) loadingEl.style.display = 'none';
            if (contentEl) contentEl.style.display = 'block';

            // Cargar productos relacionados
            loadRelatedProducts(product);

        } catch (error) {

            console.error('❌ Error cargando producto:', error);

            if (loadingEl) loadingEl.style.display = 'none';
            if (errorEl) errorEl.style.display = 'flex';
        }
    }


    // ======================================================================
    // 12. CARGAR PRODUCTOS RELACIONADOS
    // ======================================================================

    async function loadRelatedProducts(currentProduct) {

        const section = document.getElementById('relatedProductsSection');
        const grid = document.getElementById('relatedProductsGrid');
        if (!section || !grid) return;

        try {
            let list = [];
            if (window.catalogManager && typeof catalogManager.getProducts === 'function') {
                list = catalogManager.getProducts() || [];
            }

            if (!list || list.length <= 1) {
                const res = await fetch('/products.json');
                if (res.ok) list = await res.json();
            }

            const related = (list || [])
                .filter(p => String(p.id) !== String(currentProduct.id))
                .slice(0, 4);

            if (related.length === 0) return;

            grid.innerHTML = related.map(p => {
                const pSlug = p.slug || generateSlug(p.name);
                const price = p.price != null ? Number(p.price).toFixed(2) : '0.00';
                return `
                    <div class="related-card">
                        <a href="/producto/${pSlug}" class="related-card-img-link">
                            <img src="${normalizeImagePath(p.image)}" alt="${p.name}" loading="lazy">
                        </a>
                        <div class="related-card-info">
                            <a href="/producto/${pSlug}" class="related-card-title">${p.name}</a>
                            <span class="related-card-price">S/${price}</span>
                        </div>
                    </div>
                `;
            }).join('');

            section.style.display = 'block';

        } catch (e) {
            console.warn('⚠️ No se pudieron cargar productos relacionados:', e);
        }
    }


    // ======================================================================
    // 12. INICIAR
    // ======================================================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProductPage);
    } else {
        initProductPage();
    }

})();
