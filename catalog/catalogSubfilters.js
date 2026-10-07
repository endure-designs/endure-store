// ==========================================================================
// CATALOG SUBFILTERS — Subfiltros dinámicos del catálogo
// ==========================================================================
//
// Responsabilidad:
// - Mostrar Categories relacionadas con un ProductType.
// - Mostrar Subthemes relacionados con un Theme.
// - Utilizar un único contenedor: #catalogSubfilters.
// - No realizar llamadas al backend.
// - No modificar directamente el estado del catálogo.
// ==========================================================================


// ==========================================================================
// CONFIGURACIÓN
// ==========================================================================

const SUBFILTER_CONTAINER_ID = 'catalogSubfilters';


// ==========================================================================
// OBTENER CONTENEDOR
// ==========================================================================

function getSubfilterContainer() {

    return document.getElementById(SUBFILTER_CONTAINER_ID);

}


// ==========================================================================
// OBTENER CATEGORÍAS DE UN PRODUCT TYPE
// ==========================================================================

function getCategoriesForProductType(productTypeSlug) {

    const filters =
        catalogManager.getCatalogFilters();

    const categories =
        filters.categories || [];

    return categories.filter(category =>
        category.productType &&
        category.productType.slug === productTypeSlug
    );

}


// ==========================================================================
// OBTENER SUBTHEMES DE UN THEME
// ==========================================================================

function getSubthemesForTheme(themeSlug) {

    const filters =
        catalogManager.getCatalogFilters();

    const subthemes =
        filters.subthemes || [];

    return subthemes.filter(subtheme =>
        subtheme.theme &&
        subtheme.theme.slug === themeSlug
    );

}


// ==========================================================================
// LIMPIAR SUBFILTROS
// ==========================================================================

function clear() {

    const container =
        getSubfilterContainer();

    if (!container) return;

    container.innerHTML = '';

    container.classList.remove('visible');

}


function isSubfilterActive(type, value, parent) {

    if (type === 'category') {
        return (
            appState.currentCategory === value &&
            appState.currentFilter === parent
        );
    }

    if (type === 'productType') {
        return (
            appState.currentFilter === value &&
            appState.currentCategory === 'all'
        );
    }

    if (type === 'subtheme') {
        return (
            appState.currentSubtopic === value &&
            appState.currentCollection === parent
        );
    }

    if (type === 'theme') {
        return (
            appState.currentCollection === value &&
            appState.currentSubtopic === 'all'
        );
    }

    return false;
}


// ==========================================================================
// CREAR ELEMENTO DE SUBFILTRO
// ==========================================================================

function createSubfilterItem({ type, value, parent, text }) {

    const item = document.createElement('div');

    item.classList.add('catalog-subfilter-item');

    item.textContent = text;

    item.dataset.type = type;
    item.dataset.value = value;

    if (parent) {
        item.dataset.parent = parent;
    }

    if (isSubfilterActive(type, value, parent)) {
        item.classList.add('active');
    }

    return item;
}


// ==========================================================================
// MOSTRAR CATEGORÍAS
// ==========================================================================

function showCategories(productTypeSlug) {

    const container =
        getSubfilterContainer();

    if (!container) return;

    const categories =
        getCategoriesForProductType(productTypeSlug);

    container.innerHTML = '';

    if (!categories.length) {
        container.classList.remove('visible');
        return;
    }

    // ----------------------------------------------------------------------
    // TÍTULO
    // ----------------------------------------------------------------------

    const title =
        document.createElement('div');

    title.classList.add('catalog-subfilter-title');

    title.textContent = 'Categorías';

    container.appendChild(title);


    // ----------------------------------------------------------------------
    // OPCIÓN TODAS
    // ----------------------------------------------------------------------

    const allItem =
        createSubfilterItem({
            type: 'productType',
            value: productTypeSlug,
            text: 'Todas'
        });

    container.appendChild(allItem);


    // ----------------------------------------------------------------------
    // CATEGORÍAS
    // ----------------------------------------------------------------------

    categories.forEach(category => {

        const item =
            createSubfilterItem({
                type: 'category',
                value: category.slug,
                parent: productTypeSlug,
                text: category.name
            });

        container.appendChild(item);

    });


    // ----------------------------------------------------------------------
    // MOSTRAR
    // ----------------------------------------------------------------------

    container.classList.add('visible');

}


// ==========================================================================
// MOSTRAR SUBTHEMES
// ==========================================================================

function showSubthemes(themeSlug) {

    const container =
        getSubfilterContainer();

    if (!container) return;

    const subthemes =
        getSubthemesForTheme(themeSlug);

    container.innerHTML = '';

    if (!subthemes.length) {
        container.classList.remove('visible');
        return;
    }

    // ----------------------------------------------------------------------
    // TÍTULO
    // ----------------------------------------------------------------------

    const title =
        document.createElement('div');

    title.classList.add('catalog-subfilter-title');

    title.textContent = 'Subtemas';

    container.appendChild(title);


    // ----------------------------------------------------------------------
    // OPCIÓN TODOS
    // ----------------------------------------------------------------------

    const allItem =
        createSubfilterItem({
            type: 'theme',
            value: themeSlug,
            text: 'Todos'
        });

    container.appendChild(allItem);


    // ----------------------------------------------------------------------
    // SUBTHEMES
    // ----------------------------------------------------------------------

    subthemes.forEach(subtheme => {

        const item =
            createSubfilterItem({
                type: 'subtheme',
                value: subtheme.slug,
                parent: themeSlug,
                text: subtheme.name
            });

        container.appendChild(item);

    });


    // ----------------------------------------------------------------------
    // MOSTRAR
    // ----------------------------------------------------------------------

    container.classList.add('visible');

}


// ==========================================================================
// MOSTRAR SUBFILTROS SEGÚN TIPO
// ==========================================================================

function show(type, slug) {

    if (!type || !slug) {
        clear();
        return;
    }

    if (type === 'productType') {

        showCategories(slug);
        return;

    }

    if (type === 'theme') {

        showSubthemes(slug);
        return;

    }

    clear();

}


// ==========================================================================
// INICIALIZAR
// ==========================================================================

function init() {

    const container =
        getSubfilterContainer();

    if (!container) {

        console.warn(
            '⚠️ No existe #catalogSubfilters.'
        );

        return;

    }

    clear();

}


// ==========================================================================
// API PÚBLICA
// ==========================================================================

window.catalogSubfilters = {

    init,
    show,
    showCategories,
    showSubthemes,
    getCategoriesForProductType,
    getSubthemesForTheme,
    clear

};