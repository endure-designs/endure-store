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
// EXPORTAR API
// ==========================================================================

window.catalogApi = {

    getProducts,
    getAdminProducts,
    getCatalogFilters,
    getAdminCatalogFilters

};