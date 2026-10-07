// ==========================================================================
// CATALOG MANAGER
// ==========================================================================

// ==========================================================================
// CARGAR CATÁLOGO
// ==========================================================================

let PRODUCTS = [];
let CATALOG_FILTERS = {
    productTypes: [],
    categories: [],
    themes: [],
    subthemes: []
};
let CATALOG_MODE = 'PUBLIC';

async function loadCatalogFilters() {
    try {
        let response;
        if (CATALOG_MODE === 'ADMIN') {
            response = await window.catalogApi.getAdminCatalogFilters();
        } else {
            response = await window.catalogApi.getCatalogFilters();
        }

        CATALOG_FILTERS = response.data;
        console.log('✅ Filtros globales cargados:', CATALOG_MODE);
    } catch (error) {
        console.error('❌ Error cargando filtros globales:', error);
        CATALOG_FILTERS = {
            productTypes: [],
            categories: [],
            themes: [],
            subthemes: []
        };
    }
    return CATALOG_FILTERS;
}

function getCatalogFilters() {
    return CATALOG_FILTERS;
}


async function loadProducts(
    page = CONFIG.DEFAULT_PAGE,
    pageSize = CONFIG.DEFAULT_PAGE_SIZE,
    filters = {}
) {

    try {

        // ------------------------------------------------------------------
        // Validar y limpiar paginación
        // ------------------------------------------------------------------

        const pagination =
            validateAndCleanPagination(
                page,
                pageSize
            );

        // ------------------------------------------------------------------
        // No solicitar páginas que no existen
        // ------------------------------------------------------------------

        if (!pagination.valid) {

            console.warn(
                '⚠️ Página fuera de rango:',
                pagination.page
            );

            return PRODUCTS;
        }

        page =
            pagination.page;

        pageSize =
            pagination.pageSize;

        // ------------------------------------------------------------------
        // Obtener catálogo según el modo actual
        // ------------------------------------------------------------------

        let response;

        if (CATALOG_MODE === 'ADMIN') {

            response =
                await window.catalogApi.getAdminProducts(
                    page,
                    pageSize,
                    filters
                );

        } else {

            response =
                await window.catalogApi.getProducts(
                    page,
                    pageSize,
                    filters
                );
        }

        // ------------------------------------------------------------------
        // Guardar productos en memoria
        // ------------------------------------------------------------------

        PRODUCTS =
            response.data.items;

        // ------------------------------------------------------------------
        // Actualizar información de paginación
        // ------------------------------------------------------------------

        window.CATALOG_PAGINATION =
            response.data.pagination;

        // ------------------------------------------------------------------
        // Confirmación de carga
        // ------------------------------------------------------------------

        console.log(
            '✅ Catálogo cargado:',
            CATALOG_MODE
        );

        console.log(
            '📦 Productos:',
            PRODUCTS
        );

        console.log(
            '📄 Paginación:',
            window.CATALOG_PAGINATION
        );

        // ------------------------------------------------------------------
        // Devolver productos cargados
        // ------------------------------------------------------------------

        return PRODUCTS;

    } catch (error) {

        console.error(
            '❌ Error cargando catálogo:',
            error
        );

        PRODUCTS = [];

        return [];
    }
}


// ==========================================================================
// CAMBIAR MODO DEL CATÁLOGO
// ==========================================================================

function setCatalogMode(mode) {

    if (
        mode !== 'PUBLIC' &&
        mode !== 'ADMIN'
    ) {
        return;
    }

    CATALOG_MODE = mode;

    // Reiniciar paginación al cambiar de catálogo
    window.CATALOG_PAGINATION = {

        page: CONFIG.DEFAULT_PAGE,

        pageSize: CONFIG.DEFAULT_PAGE_SIZE,

        total: 0,

        totalPages: 0
    };
}


// ==========================================================================
// OBTENER PRODUCTOS
// ==========================================================================

function getProducts() {

    return PRODUCTS;
}


// ==========================================================================
// OBTENER PRODUCTO POR ID
// ==========================================================================

function getProductById(id) {

    return PRODUCTS.find(
        p => String(p.id) === String(id)
    );
}


// ==========================================================================
// OBTENER COLECCIONES
// ==========================================================================

function getCollections() {

    const products = getProducts();

    const collections = new Map();

    products.forEach(product => {

        if (!product.theme) return;

        collections.set(
            product.theme.slug,
            {
                id: product.theme.id,
                name: product.theme.name,
                slug: product.theme.slug
            }
        );
    });

    return [...collections.values()];
}


// ==========================================================================
// OBTENER CATEGORÍAS
// ==========================================================================

function getCategories() {

    const products = getProducts();

    const categories = products
        .filter(product => product.category)
        .map(product => product.category);

    const uniqueCategories =
        Array.from(
            new Map(
                categories.map(category => [
                    category.slug,
                    category
                ])
            ).values()
        );

    return uniqueCategories;
}


// ==========================================================================
// OBTENER TIPOS DE PRODUCTO
// ==========================================================================

function getProductTypes() {

    const products = getProducts();

    const productTypes = products
        .filter(product => product.productType)
        .map(product => product.productType);

    const uniqueProductTypes =
        Array.from(
            new Map(
                productTypes.map(productType => [
                    productType.slug,
                    productType
                ])
            ).values()
        );

    return uniqueProductTypes;
}


// ==========================================================================
// OBTENER FILTROS ACTIVOS DESDE APP STATE
// ==========================================================================

function getFilters() {

    const filters = {};

    // productType — appState.currentFilter almacena el productType seleccionado
    if (
        appState.currentFilter &&
        appState.currentFilter !== 'all'
    ) {
        filters.productType = appState.currentFilter;
    }

    // category — appState.currentCategory almacena la categoría seleccionada
    if (
        appState.currentCategory &&
        appState.currentCategory !== 'all'
    ) {
        filters.category = appState.currentCategory;
    }

    // theme — appState.currentCollection almacena el theme seleccionado
    if (
        appState.currentCollection &&
        appState.currentCollection !== 'all'
    ) {
        filters.theme = appState.currentCollection;
    }

    // subtheme — appState.currentSubtopic almacena el subtheme seleccionado
    if (
        appState.currentSubtopic &&
        appState.currentSubtopic !== 'all'
    ) {
        filters.subtheme = appState.currentSubtopic;
    }

    // sort — appState.currentSort almacena el ordenamiento seleccionado
    if (appState.currentSort) {
        filters.sort = appState.currentSort;
    }

    // search — appState.currentSearch almacena el texto de búsqueda
    if (
        appState.currentSearch &&
        appState.currentSearch.trim() !== ''
    ) {
        filters.search = appState.currentSearch.trim();
    }

    return filters;
}


// ==========================================================================
// VALIDAR Y LIMPIAR PAGINACIÓN
// ==========================================================================

function validateAndCleanPagination(

    page = CONFIG.DEFAULT_PAGE,

    pageSize = CONFIG.DEFAULT_PAGE_SIZE,

    resetPage = false

) {

    page = Number(page);

    pageSize = Number(pageSize);

    // ----------------------------------------------------------------------
    // Validar página
    // ----------------------------------------------------------------------

    if (
        !Number.isInteger(page) ||
        page < 1
    ) {
        page = CONFIG.DEFAULT_PAGE;
    }

    // ----------------------------------------------------------------------
    // Validar cantidad de productos por página
    // ----------------------------------------------------------------------

    if (
        !Number.isInteger(pageSize) ||
        pageSize < 1
    ) {
        pageSize = CONFIG.DEFAULT_PAGE_SIZE;
    }

    // ----------------------------------------------------------------------
    // Reiniciar página
    // ----------------------------------------------------------------------

    if (resetPage) {

        page = CONFIG.DEFAULT_PAGE;
    }

    // ----------------------------------------------------------------------
    // Obtener total de páginas conocido
    // ----------------------------------------------------------------------

    const totalPages =
        Number(
            window.CATALOG_PAGINATION?.totalPages || 0
        );

    // ----------------------------------------------------------------------
    // Verificar si la página solicitada existe
    // ----------------------------------------------------------------------

    if (
        totalPages > 0 &&
        page > totalPages
    ) {

        return {

            valid: false,

            page,

            pageSize,

            totalPages
        };
    }

    // ----------------------------------------------------------------------
    // Paginación válida
    // ----------------------------------------------------------------------

    return {

        valid: true,

        page,

        pageSize,

        totalPages
    };
}


// ==========================================================================
// INICIALIZAR CATÁLOGO
// ==========================================================================

function init(user) {

    const adminCatalogToggle =
        document.getElementById(
            'adminCatalogToggle'
        );

    // ----------------------------------------------------------------------
    // Si el botón no existe, no hacer nada
    // ----------------------------------------------------------------------

    if (!adminCatalogToggle) return;

    // ----------------------------------------------------------------------
    // Verificar si el usuario es administrador
    // ----------------------------------------------------------------------

    const isAdmin =
        user?.role === 'ADMIN';

    // ----------------------------------------------------------------------
    // Mostrar botón únicamente al administrador
    // ----------------------------------------------------------------------

    adminCatalogToggle.hidden =
        !isAdmin;

    // ----------------------------------------------------------------------
    // Si no es administrador, terminar
    // ----------------------------------------------------------------------

    if (!isAdmin) return;

    // ----------------------------------------------------------------------
    // Estado inicial: catálogo público
    // ----------------------------------------------------------------------

    setCatalogMode('PUBLIC');

    // ----------------------------------------------------------------------
    // Texto inicial del botón
    // ----------------------------------------------------------------------

    adminCatalogToggle.textContent =
        'Ver catálogo administrativo';

    // ----------------------------------------------------------------------
    // Alternar catálogo
    // ----------------------------------------------------------------------

    adminCatalogToggle.addEventListener(
        'click',
        async () => {

            const newMode =
                CATALOG_MODE === 'PUBLIC'
                    ? 'ADMIN'
                    : 'PUBLIC';

            // --------------------------------------------------------------
            // Cambiar modo y reiniciar paginación
            // --------------------------------------------------------------

            setCatalogMode(newMode);

            // --------------------------------------------------------------
            // Resetear filtros al cambiar de catálogo
            // --------------------------------------------------------------

            appState.currentFilter = 'all';
            appState.currentCollection = 'all';
            appState.currentSubtopic = 'all';
            appState.currentPage = CONFIG.DEFAULT_PAGE;

            // --------------------------------------------------------------
            // Actualizar texto del botón
            // --------------------------------------------------------------

            if (CATALOG_MODE === 'ADMIN') {

                adminCatalogToggle.textContent =
                    'Volver al catálogo público';

            } else {

                adminCatalogToggle.textContent =
                    'Ver catálogo administrativo';
            }

            // --------------------------------------------------------------
            // Cargar filtros globales del nuevo catálogo
            // --------------------------------------------------------------

            await loadCatalogFilters();

            // --------------------------------------------------------------
            // Reconstruir selectores con las opciones del nuevo catálogo
            // --------------------------------------------------------------

            if (
                window.catalogUI &&
                typeof catalogUI.populateProductTypeSelect === 'function'
            ) {
                catalogUI.populateProductTypeSelect();
            }

            if (
                window.catalogUI &&
                typeof catalogUI.populateCollectionSelect === 'function'
            ) {
                catalogUI.populateCollectionSelect();
            }

            // --------------------------------------------------------------
            // Cargar productos del nuevo catálogo SIN filtros
            // --------------------------------------------------------------

            await loadProducts(
                CONFIG.DEFAULT_PAGE,
                CONFIG.DEFAULT_PAGE_SIZE,
                {}
            );

            // --------------------------------------------------------------
            // Renderizar productos
            // --------------------------------------------------------------

            if (
                window.catalogUI &&
                typeof catalogUI.renderCurrentProducts === 'function'
            ) {
                catalogUI.renderCurrentProducts();
            }
        }
    );
}

// ==========================================================================
// EXPORTAR CATALOG MANAGER
// ==========================================================================

window.catalogManager = {

    init,

    loadProducts,

    loadCatalogFilters,

    setCatalogMode,

    getProducts,

    getProductById,

    getCollections,

    getCategories,

    getProductTypes,

    getFilters,

    getCatalogFilters
};