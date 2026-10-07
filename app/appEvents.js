// ==========================================================================
// APP EVENTS — Configuración de Event Listeners (Filtros, Modal, Carrito)
// ==========================================================================

function setupEventListeners() {
    // Filtrado de categorías
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appFilters.renderCatalogProducts(btn.dataset.category);
        });
    });

    // Control de carrito (Abrir/Cerrar)
    if (typeof initCartDrawer === 'function') {
        initCartDrawer();
    }

    // Control de modal (Cerrar)
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalClose) modalClose.addEventListener('click', catalogCardModal.closeProductModal);
    if (modalOverlay) modalOverlay.addEventListener('click', catalogCardModal.closeProductModal);

    // Cantidad en el modal
    const qtyMinus = document.getElementById('qtyMinus');
    const qtyPlus = document.getElementById('qtyPlus');
    const qtyVal = document.getElementById('qtyVal');

    if (qtyMinus && qtyVal) {
        qtyMinus.addEventListener('click', () => {
            if (appState.selectedQty > 1) {
                appState.selectedQty--;
                qtyVal.textContent = appState.selectedQty;
            }
        });
    }

    if (qtyPlus && qtyVal) {
        qtyPlus.addEventListener('click', () => {
            appState.selectedQty++;
            qtyVal.textContent = appState.selectedQty;
        });
    }

    // Botón añadir del modal
    const modalAddBtn = document.getElementById('modalAddBtn');
    if (modalAddBtn) {
        modalAddBtn.addEventListener('click', () => {
            const validation =
                catalogCardModal.validateSelectedVariant();

            if (!validation.valid) {

                if (
                    window.alert - modal &&
                    typeof alert - modal.show === 'function'
                ) {
                    alert - modal.show({
                        title: 'Combinación no disponible',
                        message: validation.message,
                        type: 'warning'
                    });
                }

                return;
            }

            if (typeof addToCart === 'function') {
                addToCart(
                    appState.selectedProduct.id,
                    validation.variant,
                    appState.selectedQty
                );
            }

            catalogCardModal.closeProductModal();
            if (typeof openCart === 'function') {
                openCart();
            }
        });
    }

    // Finalizar compra (Checkout Modal)
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (typeof openCheckoutModal === 'function') {
                openCheckoutModal();
            }
        });
    }

    // Inicializar el modal de checkout si la función existe
    if (typeof initCheckoutModal === 'function') {
        initCheckoutModal();
    }
}

window.appEvents = {
    setupEventListeners
};
