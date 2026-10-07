// ==========================================================================
// CATALOG UI - Renderizado de productos
// ==========================================================================


// ==========================================================================
// Poblar selector de tipos de producto
// ==========================================================================

function populateProductTypeSelect() {

    if (!categorySelect) return;

    const currentValue = categorySelect.value;

    categorySelect.innerHTML = '';

    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'Todos los productos';
    categorySelect.appendChild(allOption);

    const catalogFilters = catalogManager.getCatalogFilters();
    const productTypes = catalogFilters.productTypes || [];

    productTypes.forEach(productType => {

        const option = document.createElement('option');

        option.value = productType.slug;
        option.textContent = productType.name;

        categorySelect.appendChild(option);
    });

    if (
        [...categorySelect.options]
            .some(option => option.value === currentValue)
    ) {
        categorySelect.value = currentValue;
    } else {
        categorySelect.value = 'all';
    }

    rebuildCustomDropdown('categorySelect');

}


// ==========================================================================
// Poblar selector de colecciones
// ==========================================================================

function populateCollectionSelect() {
    if (!collectionSelect) return;

    const currentValue = collectionSelect.value;

    collectionSelect.innerHTML = '';

    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'Todas las colecciones';
    collectionSelect.appendChild(allOption);

    const catalogFilters = catalogManager.getCatalogFilters();
    const collections = catalogFilters.themes || [];

    collections.forEach(collection => {
        const option = document.createElement('option');

        option.value = collection.slug;
        option.textContent = collection.name;

        collectionSelect.appendChild(option);
    });

    if (
        [...collectionSelect.options]
            .some(option => option.value === currentValue)
    ) {
        collectionSelect.value = currentValue;
    } else {
        collectionSelect.value = 'all';
    }

    rebuildCustomDropdown('collectionSelect');

}





function scrollToProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    const headerOffset = 100;
    const elementPosition = productsGrid.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
    });
}

function updatePaginationTabs(totalPages) {
    const paginationContainer = document.getElementById('paginationTabs');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.classList.add('tab-btn');
        if (i === appState.currentPage) btn.classList.add('active');
        btn.textContent = i;
        btn.addEventListener('click', async () => {
            if (i === appState.currentPage) return;
            appState.currentPage = i;
            await catalogManager.loadProducts(
                i,
                window.CATALOG_PAGINATION.pageSize,
                catalogManager.getFilters()
            );
            renderCurrentProducts();
            scrollToProducts();
        });
        paginationContainer.appendChild(btn);
    }
}

function renderCurrentProducts() {

    console.log(
        '🔴 RENDER CATALOG:',
        new Date().toLocaleTimeString(),
        'modal abierto:',
        document.getElementById('productModal')?.classList.contains('open')
    );
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    // Controlar visibilidad del carrusel de anime
    const animeGallery = document.getElementById('anime-gallery');

    if (animeGallery) {
        if (appState.currentCollection === 'anime') {
            animeGallery.style.display = 'block';
        } else {
            animeGallery.style.display = 'none';
        }
    }

    // Obtener productos actuales desde catalogManager
    // (ya vienen paginados, filtrados y ordenados desde el backend)
    const productList = catalogManager.getProducts();


    // Los productos ya vienen listos del backend
    const pageProducts = productList;

    // Obtener totalPages desde la paginación del backend
    const totalPages = Math.max(
        1,
        window.CATALOG_PAGINATION?.totalPages || 1
    );

    // Sincronizar appState.currentPage con la paginación del backend
    appState.currentPage =
        window.CATALOG_PAGINATION?.page || 1;

    clearTimeout(appState.renderTimeout);
    clearTimeout(appState.fadeTimeout);

    appState.renderTimeout = setTimeout(() => {
        // Fade out animation
        productsGrid.classList.add('fade-out');

        appState.fadeTimeout = setTimeout(() => {
            productsGrid.innerHTML = '';

            if (pageProducts.length === 0) {
                productsGrid.innerHTML = `<p class="no-products">No hay productos en esta categoría por el momento.</p>`;
            } else {
                pageProducts.forEach((product, index) => {

                    const card = catalogCard.createProductCard(product);

                    card.style.animationDelay = `${index * 0.04}s`;

                    productsGrid.appendChild(card);

                });
            }

            // Fade in
            productsGrid.classList.remove('fade-out');

            // Update pagination UI
            updatePaginationTabs(totalPages);

        }, 10);
    }, 50);
}


//REVISAR EN CASO DE PARPADEO

function initResizeObserver() {

    const productsGrid = document.querySelector('.products-grid');

    if (!productsGrid) return;

    const resizeObserver = new ResizeObserver(entries => {

        for (let entry of entries) {

            // renderCurrentProducts();

        }
    });

    resizeObserver.observe(productsGrid);
}



window.catalogUI = {
    populateProductTypeSelect,
    populateCollectionSelect,
    scrollToProducts,
    updatePaginationTabs,
    renderCurrentProducts,
    initResizeObserver
};