// ==========================================================================
// APP.JS — ORQUESTADOR PRINCIPAL PARA INDEX.HTML
// ==========================================================================

// ==========================================================================
// APP.JS — ORQUESTADOR PRINCIPAL
// ==========================================================================



async function initApp() {

    console.log("🚀 Inicializando lógica modular de app.js...");

    // ----------------------------------------------------------------------
    // 1. Cargar carrito y sincronizar
    // ----------------------------------------------------------------------

    if (typeof loadCart === 'function') {
        loadCart();
    }

    if (typeof updateCartUI === 'function') {
        updateCartUI();
    }

    if (typeof syncCartFromBackend === 'function') {
        await syncCartFromBackend();
    }

    // ----------------------------------------------------------------------
    // 2. Inicializar eventos principales
    //    Filtros, botones, modales, etc.
    // ----------------------------------------------------------------------

    if (
        window.appEvents &&
        typeof appEvents.setupEventListeners === 'function'
    ) {
        appEvents.setupEventListeners();
    }


    // ----------------------------------------------------------------------
    // 3. Inicializar acordeón de FAQ
    // ----------------------------------------------------------------------

    if (
        window.appFAQ &&
        typeof appFAQ.setupFAQAccordion === 'function'
    ) {
        appFAQ.setupFAQAccordion();
    }


    // ----------------------------------------------------------------------
    // 4. Inicializar listeners de filtros y selectores nativos
    // ----------------------------------------------------------------------

    if (
        window.appFilters &&
        typeof appFilters.setupSelectListeners === 'function'
    ) {
        appFilters.setupSelectListeners();
    }


    // ----------------------------------------------------------------------
    // 5. Inicializar dropdowns personalizados
    // ----------------------------------------------------------------------

    if (
        window.appDropdowns &&
        typeof appDropdowns.initCustomDropdowns === 'function'
    ) {
        appDropdowns.initCustomDropdowns();
    }


    // ----------------------------------------------------------------------
    // 6. Cargar catálogo y renderizar productos
    // ----------------------------------------------------------------------

    if (
        window.catalogManager &&
        typeof catalogManager.loadProducts === 'function' &&
        typeof catalogManager.loadCatalogFilters === 'function'
    ) {
        await catalogManager.loadCatalogFilters();
        await catalogManager.loadProducts();

        catalogUI.populateProductTypeSelect();
        catalogUI.populateCollectionSelect();
        catalogSubfilters.init();
    }

    // ----------------------------------------------------------------------
    // Render inicial del catálogo
    // ----------------------------------------------------------------------

    if (
        window.catalogUI &&
        typeof catalogUI.renderCurrentProducts === 'function'
    ) {
        catalogUI.renderCurrentProducts();
    }


    // ----------------------------------------------------------------------
    // 7. Inicializar zoom de escritorio del modal
    // ----------------------------------------------------------------------

    if (
        window.catalogCardModalZoom &&
        typeof catalogCardModalZoom.setupDesktopZoom === 'function'
    ) {
        catalogCardModalZoom.setupDesktopZoom();
    }


    // ----------------------------------------------------------------------
    // 8. Inicializar modal de alertas
    // ----------------------------------------------------------------------

    if (
        window.alertModal &&
        typeof alertModal.init === 'function'
    ) {
        alertModal.init();
    }


    // ----------------------------------------------------------------------
    // 9. Inicializar checkout modal
    // ----------------------------------------------------------------------

    if (
        window.initCheckoutModal &&
        typeof window.initCheckoutModal === 'function'
    ) {
        window.initCheckoutModal();
    }


    // ----------------------------------------------------------------------
    // 10. Inicializar checkout
    // ----------------------------------------------------------------------

    if (
        window.accountCheckout &&
        typeof accountCheckout.init === 'function'
    ) {
        accountCheckout.init();
    }

    if (
        window.accountCheckoutSummary &&
        typeof accountCheckoutSummary.init === 'function'
    ) {
        await accountCheckoutSummary.init();
    }

    if (
        window.accountCheckoutPurchase &&
        typeof accountCheckoutPurchase.init === 'function'
    ) {
        accountCheckoutPurchase.init();
    }

    if (
        window.accountCheckoutCompleted &&
        typeof accountCheckoutCompleted.init === 'function'
    ) {
        accountCheckoutCompleted.init();
    }

    if (
        window.accountCheckoutOrderSummary &&
        typeof accountCheckoutOrderSummary.init === 'function'
    ) {
        accountCheckoutOrderSummary.init();
    }


    // ----------------------------------------------------------------------
    // 11. Inicializar centro de notificaciones
    // ----------------------------------------------------------------------

    if (
        window.currentUser &&
        window.appNotifications &&
        typeof appNotifications.init === 'function'
    ) {
        await appNotifications.init();
    }


    // ----------------------------------------------------------------------
    // 10. Evitar click derecho sobre imágenes
    // ----------------------------------------------------------------------

    document.addEventListener('contextmenu', function (e) {

        if (
            e.target.closest('.product-img-wrapper') ||
            e.target.closest('.product-img') ||
            e.target.closest('#modalImg') ||
            e.target.closest('.modal-image-container') ||
            e.target.closest('.cart-item-img')
        ) {
            e.preventDefault();
            e.stopPropagation();
        }

    });

}

async function startApp() {

    // ----------------------------------------------------------------------
    // 1. Verificación de sesión
    // ----------------------------------------------------------------------

    window.currentUser = null;

    if (
        window.authManager &&
        typeof authManager.checkAuthSession === 'function'
    ) {
        window.currentUser = await authManager.checkAuthSession();
    }



    if (
        window.checkout &&
        typeof window.checkout.init === 'function'
    ) {
        await window.checkout.init(window.currentUser);
    }


    // ----------------------------------------------------------------------
    // 1.2 Inicializar eventos SSE
    // ----------------------------------------------------------------------
    if (
        window.currentUser &&
        window.checkout &&
        typeof checkout.initializePaymentEvents === 'function'
    ) {
        checkout.initializePaymentEvents();
    }


    // ----------------------------------------------------------------------
    // 2. Inicializar catálogo según usuario
    // ----------------------------------------------------------------------

    if (
        window.catalogManager &&
        typeof catalogManager.init === 'function'
    ) {
        catalogManager.init(currentUser);
    }


    // ----------------------------------------------------------------------
    // 3. Eventos del navbar
    //    Menú de usuario y logout
    // ----------------------------------------------------------------------

    const userMenuBtn =
        document.getElementById('userMenuBtn');

    const userMenu =
        document.getElementById('userMenu');

    const logoutBtn =
        document.getElementById('logoutBtn');

    if (userMenuBtn && userMenu) {

        userMenuBtn.addEventListener('click', (e) => {

            e.stopPropagation();

            if (
                window.appNotifications &&
                typeof appNotifications.close === 'function'
            ) {
                appNotifications.close();
            }

            const isHidden =
                userMenu.style.display === 'none';

            userMenu.style.display =
                isHidden ? 'block' : 'none';

        });

        document.addEventListener('click', () => {

            userMenu.style.display = 'none';

        });
    }


    // ----------------------------------------------------------------------
    // 4. Logout
    // ----------------------------------------------------------------------

    if (
        logoutBtn &&
        typeof handleLogout === 'function'
    ) {
        logoutBtn.addEventListener(
            'click',
            handleLogout
        );
    }


    // ----------------------------------------------------------------------
    // 5. Iniciar aplicación central
    // ----------------------------------------------------------------------

    await initApp();

}

// Iniciar la app directamente ya que los scripts se cargan dinámicamente al final
startApp();