// ==========================================================================
// APP FILTERS — Filtros, Ordenamiento y Selección de Colección
// ==========================================================================


// ==========================================================================
// Renderizar productos según ProductType
// ==========================================================================

async function renderCatalogProducts(categoryFilter = 'all') {

    appState.currentFilter = categoryFilter;

    // Si cambiamos de ProductType directamente,
    // la categoría secundaria anterior deja de ser válida.
    appState.currentCategory = 'all';

    const categorySelect =
        document.getElementById('categorySelect');

    if (categorySelect) {
        categorySelect.value =
            appState.currentFilter;
    }

    appState.currentPage =
        CONFIG.DEFAULT_PAGE;

    await catalogManager.loadProducts(
        CONFIG.DEFAULT_PAGE,
        window.CATALOG_PAGINATION?.pageSize ||
        CONFIG.DEFAULT_PAGE_SIZE,
        catalogManager.getFilters()
    );

    catalogUI.renderCurrentProducts();
}


// ==========================================================================
// Configurar listeners de filtros
// ==========================================================================

function setupSelectListeners() {

    const categorySelect =
        document.getElementById('categorySelect');

    const sortSelect =
        document.getElementById('sortSelect');

    const collectionSelect =
        document.getElementById('collectionSelect');


    // ======================================================================
    // PRODUCT TYPE
    // ======================================================================

    if (categorySelect) {

        categorySelect.addEventListener('change', async () => {

            // ProductType seleccionado
            appState.currentFilter =
                categorySelect.value;

            // Al seleccionar directamente un ProductType,
            // se elimina cualquier categoría secundaria anterior.
            appState.currentCategory = 'all';

            appState.currentPage =
                CONFIG.DEFAULT_PAGE;

            // Limpiar subfiltros porque todavía no se ha seleccionado
            // una categoría secundaria.
            if (window.catalogSubfilters) {
                catalogSubfilters.clear();
            }

            await catalogManager.loadProducts(
                CONFIG.DEFAULT_PAGE,
                window.CATALOG_PAGINATION?.pageSize ||
                CONFIG.DEFAULT_PAGE_SIZE,
                catalogManager.getFilters()
            );

            catalogUI.renderCurrentProducts();
        });
    }


    // ======================================================================
    // ORDENAMIENTO
    // ======================================================================

    if (sortSelect) {

        sortSelect.addEventListener('change', async () => {

            appState.currentSort =
                sortSelect.value;

            appState.currentPage =
                CONFIG.DEFAULT_PAGE;

            await catalogManager.loadProducts(
                CONFIG.DEFAULT_PAGE,
                window.CATALOG_PAGINATION?.pageSize ||
                CONFIG.DEFAULT_PAGE_SIZE,
                catalogManager.getFilters()
            );

            catalogUI.renderCurrentProducts();
        });
    }


    // ======================================================================
    // THEME / COLECCIÓN
    // ======================================================================

    if (collectionSelect) {

        collectionSelect.addEventListener('change', async () => {

            const prevCollection =
                appState.currentCollection;

            appState.currentCollection =
                collectionSelect.value;

            // Al cambiar de Theme directamente,
            // se elimina cualquier Subtheme anterior.
            appState.currentSubtopic = 'all';

            // Limpiar subfiltros anteriores.
            if (window.catalogSubfilters) {
                catalogSubfilters.clear();
            }


            // --------------------------------------------------------------
            // Galería especial de Anime
            // --------------------------------------------------------------

            if (
                appState.currentCollection === 'anime' &&
                prevCollection !== 'anime'
            ) {

                const container =
                    document.getElementById('anime-gallery');

                if (container) {

                    const newContainer =
                        container.cloneNode(false);

                    container.parentNode.replaceChild(
                        newContainer,
                        container
                    );

                    if (
                        window.appAnime &&
                        typeof appAnime.initAnimeGallery === 'function'
                    ) {
                        appAnime.initAnimeGallery();
                    }
                }
            }


            appState.currentPage =
                CONFIG.DEFAULT_PAGE;

            await catalogManager.loadProducts(
                CONFIG.DEFAULT_PAGE,
                window.CATALOG_PAGINATION?.pageSize ||
                CONFIG.DEFAULT_PAGE_SIZE,
                catalogManager.getFilters()
            );

            catalogUI.renderCurrentProducts();
        });
    }


    // ======================================================================
    // SUBFILTROS DINÁMICOS
    // ======================================================================

    document.addEventListener('click', async (e) => {

        const subfilter =
            e.target.closest('.catalog-subfilter-item');

        if (!subfilter) return;

        e.stopPropagation();


        const type =
            subfilter.dataset.type;

        const value =
            subfilter.dataset.value;

        const parentValue =
            subfilter.dataset.parent;


        // ==================================================================
        // CATEGORÍA
        // ==================================================================

        if (type === 'category') {

            // ProductType padre
            appState.currentFilter =
                parentValue;

            // Categoría seleccionada
            appState.currentCategory =
                value;

            const categorySelect =
                document.getElementById('categorySelect');

            if (categorySelect) {

                categorySelect.value =
                    appState.currentFilter;

                appDropdowns.refreshCustomDropdown(
                    'categorySelect',
                    subfilter.textContent
                );
            }
        }


        // ==================================================================
        // "TODAS" LAS CATEGORÍAS DEL PRODUCT TYPE
        // ==================================================================

        else if (type === 'productType') {

            appState.currentFilter =
                value;

            appState.currentCategory =
                'all';

            if (categorySelect) {
                categorySelect.value =
                    appState.currentFilter;
            }
        }


        // ==================================================================
        // SUBTHEME
        // ==================================================================

        else if (type === 'subtheme') {

            appState.currentCollection =
                parentValue;

            appState.currentSubtopic =
                value;

            const collectionSelect =
                document.getElementById('collectionSelect');

            if (collectionSelect) {

                collectionSelect.value =
                    appState.currentCollection;

                appDropdowns.refreshCustomDropdown(
                    'collectionSelect',
                    subfilter.textContent
                );
            }
        }


        // ==================================================================
        // "TODOS" LOS SUBTHEMES DEL THEME
        // ==================================================================

        else if (type === 'theme') {

            appState.currentCollection =
                value;

            appState.currentSubtopic =
                'all';

            if (collectionSelect) {
                collectionSelect.value =
                    appState.currentCollection;
            }
        }


        // ==================================================================
        // Actualizar estado visual del subfiltro
        // ==================================================================

        const container =
            subfilter.closest('#catalogSubfilters');

        if (container) {

            container
                .querySelectorAll('.catalog-subfilter-item')
                .forEach(item => {
                    item.classList.remove('active');
                });

            subfilter.classList.add('active');
        }


        // ==================================================================
        // Recargar productos
        // ==================================================================

        appState.currentPage =
            CONFIG.DEFAULT_PAGE;

        await catalogManager.loadProducts(
            CONFIG.DEFAULT_PAGE,
            window.CATALOG_PAGINATION?.pageSize ||
            CONFIG.DEFAULT_PAGE_SIZE,
            catalogManager.getFilters()
        );

        catalogUI.renderCurrentProducts();
    });
}


// ==========================================================================
// API pública
// ==========================================================================

window.appFilters = {

    renderCatalogProducts,
    setupSelectListeners

};