// ==========================================================================
// APP STATE — Estado global de la aplicación
// ==========================================================================

window.appState = {
    // Modal y producto seleccionado
    selectedProduct: null,
    selectedSize: '',
    selectedColor: '',
    selectedQty: 1,

    // Filtros y Paginación
    currentPage: 1,
    currentFilter: 'all',
    currentCollection: 'all', // theme
    currentSubtopic: 'all', // subtheme para anime
    currentSort: 'date-desc', // default sorting

    // Constantes
    WHATSAPP_PHONE: "51996440579",

    // Variables de control de renderizado
    renderTimeout: null,
    fadeTimeout: null
};
