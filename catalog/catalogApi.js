// ==========================================================================
// CATALOG API
// ==========================================================================

// ==========================================================================
// Construir query string con paginación y filtros
// ==========================================================================

function buildQueryString(page, pageSize, filters = {}) {

    const params = new URLSearchParams();

    params.set('page', page);
    params.set('pageSize', pageSize);

    // Filtros válidos que acepta el backend
    const validFilters = [
        'search',
        'productType',
        'category',
        'theme',
        'subtheme',
        'sort'
    ];

    validFilters.forEach(key => {

        const value = filters[key];

        // No enviar parámetros vacíos, null o undefined
        if (
            value !== undefined &&
            value !== null &&
            value !== ''
        ) {
            params.set(key, value);
        }
    });

    return params.toString();
}


// ==========================================================================
// OBTENER PRODUCTOS DESDE EL SERVIDOR
// ==========================================================================

async function getProducts(
    page = CONFIG.DEFAULT_PAGE,
    pageSize = CONFIG.DEFAULT_PAGE_SIZE,
    filters = {}
) {

    const queryString =
        buildQueryString(page, pageSize, filters);

    const response =
        await fetch(
            `${CONFIG.API_BASE_URL}/products?${queryString}`
        );

    if (!response.ok) {

        const errorText =
            await response.text();

        console.error(
            '❌ Error en GET /products:',
            response.status,
            errorText
        );

        throw new Error(
            `Error HTTP ${response.status} al cargar productos.`
        );
    }

    return await response.json();
}


// ==========================================================================
// OBTENER PRODUCTOS NO PUBLICADOS PARA ADMINISTRADOR
// ==========================================================================

async function getAdminProducts(
    page = CONFIG.DEFAULT_PAGE,
    pageSize = CONFIG.DEFAULT_PAGE_SIZE,
    filters = {}
) {

    const queryString =
        buildQueryString(page, pageSize, filters);

    const response =
        await fetch(
            `${CONFIG.API_BASE_URL}/products/admin?${queryString}`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

    if (!response.ok) {

        const errorText =
            await response.text();

        console.error(
            '❌ Error en GET /products/admin:',
            response.status,
            errorText
        );

        throw new Error(
            `Error HTTP ${response.status} al cargar productos de administrador.`
        );
    }

    return await response.json();
}


// ==========================================================================
// OBTENER FILTROS GLOBALES DEL CATÁLOGO
// ==========================================================================

async function getCatalogFilters() {

    const response =
        await fetch(
            `${CONFIG.API_BASE_URL}/products/filters`
        );

    if (!response.ok) {

        const errorText =
            await response.text();

        console.error(
            '❌ Error en GET /products/filters:',
            response.status,
            errorText
        );

        throw new Error(
            `Error HTTP ${response.status} al cargar filtros globales.`
        );
    }

    return await response.json();
}

async function getAdminCatalogFilters() {

    const response =
        await fetch(
            `${CONFIG.API_BASE_URL}/products/filters/admin`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

    if (!response.ok) {

        const errorText =
            await response.text();

        console.error(
            '❌ Error en GET /products/filters/admin:',
            response.status,
            errorText
        );

        throw new Error(
            `Error HTTP ${response.status} al cargar filtros globales de administrador.`
        );
    }

    return await response.json();
}

// ==========================================================================
// OBTENER PRODUCTO PUBLICADO POR SLUG
// ==========================================================================

async function getProductBySlug(slug) {

    // 1. Intentar obtener desde la API del backend
    try {
        const response = await fetch(
            `${CONFIG.API_BASE_URL}/products/${encodeURIComponent(slug)}`
        );

        if (response.ok) {
            return await response.json();
        }

        const errorText = await response.text();
        console.warn(
            '⚠️ API GET /products/:slug no OK:',
            response.status,
            errorText
        );
    } catch (networkError) {
        console.warn('⚠️ No se pudo conectar a la API, usando fallback local:', networkError.message);
    }

    // 2. Fallback: buscar en memoria, localStorage o products.json
    try {
        const cleanSlug = String(slug).trim().toLowerCase();

        // 2.1. Memoria de catalogManager
        if (window.catalogManager && typeof catalogManager.getProducts === 'function') {
            const memoryList = catalogManager.getProducts() || [];
            const found = memoryList.find(p =>
                (p.slug && String(p.slug).toLowerCase() === cleanSlug) ||
                String(p.id) === cleanSlug ||
                (window.appRouter && appRouter.generateSlug(p.name) === cleanSlug)
            );
            if (found) {
                return { success: true, data: found };
            }
        }

        // 2.2. En localStorage
        const stored = localStorage.getItem(CONFIG.PRODUCTS_STORAGE_KEY);
        if (stored) {
            const list = JSON.parse(stored);
            if (Array.isArray(list)) {
                const found = list.find(p =>
                    (p.slug && String(p.slug).toLowerCase() === cleanSlug) ||
                    String(p.id) === cleanSlug ||
                    (window.appRouter && appRouter.generateSlug(p.name) === cleanSlug)
                );
                if (found) {
                    return { success: true, data: found };
                }
            }
        }

        // 2.3. En archivo products.json estático
        const jsonResp = await fetch('/products.json');
        if (jsonResp.ok) {
            const jsonList = await jsonResp.json();
            if (Array.isArray(jsonList)) {
                const found = jsonList.find(p =>
                    (p.slug && String(p.slug).toLowerCase() === cleanSlug) ||
                    String(p.id) === cleanSlug ||
                    (window.appRouter && appRouter.generateSlug(p.name) === cleanSlug)
                );
                if (found) {
                    return { success: true, data: found };
                }
            }
        }
    } catch (fallbackError) {
        console.warn('⚠️ Fallback local falló:', fallbackError);
    }

    throw new Error(`Producto con slug o id "${slug}" no encontrado.`);
}

// ==========================================================================
// EXPORTAR API
// ==========================================================================

window.catalogApi = {

    getProducts,
    getAdminProducts,
    getCatalogFilters,
    getAdminCatalogFilters,
    getProductBySlug

};