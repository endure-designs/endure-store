// ==========================================================================
// APP.JS — ORQUESTADOR PRINCIPAL PARA INDEX.HTML
// ==========================================================================
// Optimizado para renderizado prioritario del catálogo:
// - Carga paralela de filtros y productos del catálogo.
// - Sincronización del carrito fuera de la ruta crítica de renderizado.
// - Operaciones secundarias (Culqi, eventos de pago SSE, notificaciones)
//   movidas a fases diferidas.
// ==========================================================================

async function initApp() {

    console.log("🚀 Inicializando lógica modular de app.js...");

    // ----------------------------------------------------------------------
    // 1. Cargar carrito local de inmediato (sin bloqueo de red)
    // ----------------------------------------------------------------------

    if (typeof loadCart === 'function') {
        loadCart();
    }

    if (typeof updateCartUI === 'function') {
        updateCartUI();
    }

    // ----------------------------------------------------------------------
    // 2. Configurar listeners de interfaz inmediatamente
    //    Permite interacción instantánea mientras se obtienen datos del backend
    // ----------------------------------------------------------------------

    if (
        window.appEvents &&
        typeof appEvents.setupEventListeners === 'function'
    ) {
        appEvents.setupEventListeners();
    }

    if (
        window.appFAQ &&
        typeof appFAQ.setupFAQAccordion === 'function'
    ) {
        appFAQ.setupFAQAccordion();
    }

    if (
        window.appFilters &&
        typeof appFilters.setupSelectListeners === 'function'
    ) {
        appFilters.setupSelectListeners();
    }

    if (
        window.appDropdowns &&
        typeof appDropdowns.initCustomDropdowns === 'function'
    ) {
        appDropdowns.initCustomDropdowns();
    }

    // ----------------------------------------------------------------------
    // 3. Cargar filtros y productos del catálogo EN PARALELO
    //    Optimización crítica: ambas consultas son independientes y no tienen
    //    efectos secundarios colaterales entre sí.
    // ----------------------------------------------------------------------

    if (
        window.catalogManager &&
        typeof catalogManager.loadProducts === 'function' &&
        typeof catalogManager.loadCatalogFilters === 'function'
    ) {
        console.log("⚡ Consultando filtros y productos en paralelo...");

        await Promise.all([
            catalogManager.loadCatalogFilters(),
            catalogManager.loadProducts()
        ]);

        if (window.catalogUI) {
            if (typeof catalogUI.populateProductTypeSelect === 'function') {
                catalogUI.populateProductTypeSelect();
            }
            if (typeof catalogUI.populateCollectionSelect === 'function') {
                catalogUI.populateCollectionSelect();
            }
        }

        if (window.catalogSubfilters && typeof catalogSubfilters.init === 'function') {
            catalogSubfilters.init();
        }
    }

    // ----------------------------------------------------------------------
    // 4. Render inicial del catálogo
    // ----------------------------------------------------------------------

    if (
        window.catalogUI &&
        typeof catalogUI.renderCurrentProducts === 'function'
    ) {
        catalogUI.renderCurrentProducts();
    }

    // ----------------------------------------------------------------------
    // 4.1. Abrir producto cuando se ingresa mediante una URL SEO
    // ----------------------------------------------------------------------

    const productRouteMatch = window.location.pathname.match(
        /^\/producto\/([^/]+)\/?$/
    );

    if (productRouteMatch) {

        const slug = decodeURIComponent(productRouteMatch[1]);

        if (
            window.catalogCardModal &&
            typeof catalogCardModal.openProductModalBySlug === 'function'
        ) {
            await catalogCardModal.openProductModalBySlug(slug);
        }
    }

    // ----------------------------------------------------------------------
    // 5. Inicializar zoom de escritorio del modal
    // ----------------------------------------------------------------------

    if (
        window.catalogCardModalZoom &&
        typeof catalogCardModalZoom.setupDesktopZoom === 'function'
    ) {
        catalogCardModalZoom.setupDesktopZoom();
    }

    // ----------------------------------------------------------------------
    // 6. Inicializar modal de alertas
    // ----------------------------------------------------------------------

    if (
        window.alertModal &&
        typeof alertModal.init === 'function'
    ) {
        alertModal.init();
    }

    // ----------------------------------------------------------------------
    // 7. Sincronización del carrito fuera de la ruta crítica
    //    Se ejecuta en segundo plano con reconciliación segura contra
    //    mutaciones locales recientes sin bloquear el renderizado.
    // ----------------------------------------------------------------------

    if (typeof syncCartFromBackend === 'function') {
        syncCartFromBackend().catch(err => {
            console.warn("⚠️ Sincronización en segundo plano de carrito:", err);
        });
    }

    // ----------------------------------------------------------------------
    // 8. Inicializar checkout modal y etapas si ya están disponibles
    //    (También se inicializan automáticamente al culminar la etapa diferida)
    // ----------------------------------------------------------------------

    if (
        window.initCheckoutModal &&
        typeof window.initCheckoutModal === 'function'
    ) {
        window.initCheckoutModal();
    }

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
        accountCheckoutSummary.init().catch(() => { });
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
    // 9. Inicializar notificaciones si el usuario está autenticado y disponible
    // ----------------------------------------------------------------------

    if (
        window.currentUser &&
        window.appNotifications &&
        typeof appNotifications.init === 'function'
    ) {
        appNotifications.init().catch(err => {
            console.warn("⚠️ Error en inicialización de notificaciones:", err);
        });
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
        try {
            window.currentUser = await authManager.checkAuthSession();
        } catch (error) {
            console.warn("⚠️ Error verificando sesión inicial:", error);
            window.currentUser = null;
        }
    }

    // ----------------------------------------------------------------------
    // 2. Inicializar catálogo según rol de usuario (PÚBLICO vs ADMINISTRADOR)
    // ----------------------------------------------------------------------

    if (
        window.catalogManager &&
        typeof catalogManager.init === 'function'
    ) {
        catalogManager.init(window.currentUser);
    }

    // ----------------------------------------------------------------------
    // 3. Eventos del navbar (Menú desplegable de usuario y logout)
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
    // 5. Iniciar aplicación central (muestra catálogo de inmediato)
    // ----------------------------------------------------------------------

    await initApp();

}

// Iniciar orquestador
startApp();