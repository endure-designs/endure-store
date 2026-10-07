// ==========================================================================
// ENDURE ACCOUNT LOGIC
// Inicialización y orquestación de los módulos de la cuenta
// ==========================================================================

async function initializeAccountLogic() {

    console.log("🚀 Inicializando lógica modular de account.html...");

    // ======================================================================
    // 1. INICIALIZAR SESIÓN Y OBTENER USUARIO
    // ======================================================================

    let user = null;

    if (
        window.accountSession &&
        typeof accountSession.init === 'function'
    ) {
        user = await accountSession.init();
    }

    console.log(
        "👤 Usuario actual:",
        user
    );


    // ======================================================================
    // 2. INICIALIZAR NAVEGACIÓN GENERAL
    // ======================================================================

    if (
        window.accountTabs &&
        typeof accountTabs.initTabs === 'function'
    ) {
        accountTabs.initTabs();
    }


    // ======================================================================
    // 3. INICIALIZAR FUNCIONES COMUNES DE LA CUENTA
    // ======================================================================

    // ----------------------------------------------------------------------
    // Rapid Form
    // ----------------------------------------------------------------------

    if (
        window.rapidForm &&
        typeof rapidForm.init === 'function'
    ) {
        await rapidForm.init();
    }


    // ----------------------------------------------------------------------
    // Checkout
    // ----------------------------------------------------------------------

    if (
        window.accountCheckout &&
        typeof accountCheckout.init === 'function'
    ) {

        if (
            window.accountCheckoutSummary &&
            typeof accountCheckoutSummary.init === 'function'
        ) {
            accountCheckoutSummary.init();
        }

        if (
            window.accountCheckoutOrderSummary &&
            typeof accountCheckoutOrderSummary.init === 'function'
        ) {
            accountCheckoutOrderSummary.init();
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

        accountCheckout.init();
    }

    // ----------------------------------------------------------------------
    // Inicializar centro de notificaciones
    // ----------------------------------------------------------------------

    if (
        window.appNotifications &&
        typeof appNotifications.init === 'function'
    ) {
        await appNotifications.init();
    }


    // ======================================================================
    // 4. FUNCIONES EXCLUSIVAS DEL ADMINISTRADOR
    // ======================================================================

    if (user?.role === 'ADMIN') {

        console.log(
            "🔐 Usuario administrador. Inicializando módulos administrativos..."
        );


        // ------------------------------------------------------------------
        // Notificaciones Firebase
        // ------------------------------------------------------------------

        if (
            window.endureNotifications &&
            typeof endureNotifications.init === 'function'
        ) {

            await endureNotifications.init(user);

        }

        // ------------------------------------------------------------------
        // Productos administrativos
        // ------------------------------------------------------------------

        await loadAdminProducts();


        // ------------------------------------------------------------------
        // Tipos de producto y atributos
        // ------------------------------------------------------------------

        if (
            window.accountProductTypes &&
            typeof accountProductTypes.init === 'function'
        ) {
            await accountProductTypes.init();
        }


        // ------------------------------------------------------------------
        // Gestión de atributos globales
        // ------------------------------------------------------------------

        if (
            window.accountAttributes &&
            typeof accountAttributes.init === 'function'
        ) {
            await accountAttributes.init();
        }


        // ------------------------------------------------------------------
        // Formulario de productos, selectores y autoguardado
        // ------------------------------------------------------------------

        if (
            window.accountProductForm &&
            typeof accountProductForm.initProductForm === 'function'
        ) {
            accountProductForm.initProductForm();
        }


        // ------------------------------------------------------------------
        // Modal de detalle del inventario
        // ------------------------------------------------------------------

        if (
            window.accountInventory &&
            typeof accountInventory.init === 'function'
        ) {
            accountInventory.init();
        }


        // ------------------------------------------------------------------
        // Control de inventario
        // ------------------------------------------------------------------

        if (
            window.accountInventoryManager &&
            typeof accountInventoryManager.init === 'function'
        ) {
            await accountInventoryManager.init();
        }

    } else {

        console.log(
            "👤 Usuario cliente. Se omiten módulos administrativos."
        );

    }

}


async function loadAdminProducts() {
    const response = await accountProductApi.getProducts();
    // Dependiendo de si tu backend devuelve .products o .data.items
    const products = response.products || (response.data && response.data.items) || [];

    if (window.accountSelects && typeof accountSelects.populateCategorizationSelects === 'function') {
        accountSelects.populateCategorizationSelects(products);
    }

    if (window.accountInventory && typeof accountInventory.cargarProductosInventario === 'function') {
        accountInventory.cargarProductosInventario();
    }

    return products;
}

// Exponer la función para que account-main.js la ejecute una vez cargados los scripts
window.initializeAccountLogic = initializeAccountLogic;