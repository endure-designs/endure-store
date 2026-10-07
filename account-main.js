// ==========================================================================
// ENDURE - ACCOUNT ENTRY POINT
// ==========================================================================

// Scripts que deben cargarse en orden de dependencias
const scripts = [
    // Configuración global
    './config/config.js',

    // Debug
    './debugger.js',

    // Carrito (API)
    './cart/cartApi.js',

    // Culqi
    'https://3ds.culqi.com',
    'https://js.culqi.com/checkout-js',

    // Account — Módulos independientes (sin dependencias entre sí)
    './modules/checkout/checkoutApi.js',
    './modules/checkout/checkout.js',
    './components/confirmacion/confirmation-modal.js',
    './app/appLocationApi.js',
    './app/appLocation.js',
    './components/alerta/alert-modal.js',
    './modules/validator/passwordValidation.js',
    './components/selector/selector.js',
    './account/accountProfile.js',
    './account/accountSecurity.js',
    './components/services/addressMapService.js',
    './account/accountAddressesApi.js',
    './account/accountAddresses.js',
    './account/accountSession.js',
    './account/accountCart.js',
    './account/accountOrdersApi.js',
    './account/accountOrders.js',
    './account/accountTabs.js',
    './components/detalle-orden/order-detail.js',
    './components/formulario/rapid-form.js',




    // Account — Módulos con dependencias en cascada
    './account/accountProductApi.js',
    './account/accountProductTypeApi.js',
    './account/accountProductTypes.js',
    './account/accountAttributes.js',
    './account/accountSelects.js',   // Base: getProductsData, getFieldValue, etc.
    './account/accountVariants.js',
    './account/accountTags.js',      // Independiente
    './account/accountInventoryApi.js',
    './account/accountInventoryFilters.js',
    './account/accountInventoryFilterModal.js',
    './account/accountInventoryMovementsModal.js',
    './account/accountInventoryManager.js',
    './account/accountInventory.js', // Depende de: accountSelects
    './account/accountProductForm.js', // Depende de: accountSelects, accountTags, accountSKU, accountInventory
    './account/accountProductValidation.js',
    './account/accountCheckoutSummary.js',
    './account/accountCheckoutPurchase.js',
    './account/accountCheckoutCompleted.js',

    './account/accountCheckout.js',   // Nuevo módulo de checkout
    './account/accountCheckoutOrderSummary.js',
    './modules/notifications/notificationsApi.js',
    './modules/notifications/notifications.js',
    './app/appNotificationsApi.js',
    './app/appNotifications.js',

    // Lógica modular principal
    './account.js'
];


// ==========================================================================
// SUBVENTANAS HTML
// ==========================================================================

const partials = [

    {
        containerId: 'rapidFormContainer',
        file: './components/formulario/rapid-form.html'
    },

    {
        containerId: 'confirmationModalContainer',
        file: './components/confirmacion/confirmation-modal.html'
    },

    {
        containerId: 'alertModalContainer',
        file: './components/alerta/alert-modal.html'
    },

    {
        containerId: 'subpanel-product-types',
        file: './partials/admin/admin-types-attributes.html'
    },

    {
        containerId: 'subpanel-create-product',
        file: './partials/admin/admin-create-product.html'
    },

    {
        containerId: 'subpanel-product-list',
        file: './partials/admin/admin-inventory.html'
    },

    {
        containerId: 'panel-personal-information',
        file: './partials/account/account-profile.html'
    },

    {
        containerId: 'panel-security',
        file: './partials/account/account-security.html'
    },

    {
        containerId: 'panel-addresses',
        file: './partials/account/account-addresses.html'
    },

    {
        containerId: 'panel-cart',
        file: './partials/account/account-cart.html'
    },

    {
        containerId: 'panel-orders',
        file: './partials/account/account-orders.html'
    },

    {
        containerId: 'accountOrderDetailContainer',
        file: './components/detalle-orden/order-detail.html'
    },

    {
        containerId: 'checkoutContent',
        file: './partials/account/account-checkout.html'
    },

    {
        containerId: 'appNotificationsContainer',
        file: './partials/app/app-notifications.html'
    },

    {
        containerId: 'addressModalContainer',
        file: './partials/account/address-modal.html'
    },

];


// ==========================================================================
// CSS DE ACCOUNT
// ==========================================================================

const styles = [

    // ----------------------------------------------------------------------
    // Rapid Form
    // ----------------------------------------------------------------------
    './components/formulario/rapid-form.css',

    // ----------------------------------------------------------------------
    // Culqi 3DS
    // ----------------------------------------------------------------------
    './modules/checkout/checkout.css',

    // ----------------------------------------------------------------------
    // ConfirmacionModal
    // ----------------------------------------------------------------------
    './components/confirmacion/confirmation-modal.css',
    // ----------------------------------------------------------------------
    // AlertaModal
    // ----------------------------------------------------------------------   
    './components/alerta/alert-modal.css',
    // ----------------------------------------------------------------------
    // Selector
    // ----------------------------------------------------------------------
    './components/selector/selector.css',
    // ----------------------------------------------------------------------
    // Seccion Informacion Personal
    // ----------------------------------------------------------------------
    './css/account/account-profile.css',
    // ----------------------------------------------------------------------
    // Seccion Seguridad
    // ----------------------------------------------------------------------
    './css/account/account-security.css',
    // ----------------------------------------------------------------------
    // Seccion Direcciones
    // ----------------------------------------------------------------------
    './css/account/account-addresses.css',
    // ----------------------------------------------------------------------
    // Seccion Carrito
    // ----------------------------------------------------------------------
    './css/account/account-cart.css',
    // ----------------------------------------------------------------------
    // Seccion Pedidos
    // ----------------------------------------------------------------------
    './css/account/account-orders.css',
    './components/detalle-orden/order-detail.css',
    // ----------------------------------------------------------------------
    // Interfaz checkout
    // ----------------------------------------------------------------------
    './css/account/account-checkout.css',
    // ----------------------------------------------------------------------
    // Resumen de pedido checkout
    // ----------------------------------------------------------------------
    './css/account/accountCheckoutOrderSummary.css',
    // ----------------------------------------------------------------------
    // Notificaciones app
    // ----------------------------------------------------------------------
    './css/app/app-notifications.css'
];

// ==========================================================================
// CARGAR SCRIPTS SECUENCIALMENTE
// ==========================================================================

function loadScript(src) {

    return new Promise((resolve, reject) => {

        const script = document.createElement('script');

        script.src = src;

        script.onload = () => {
            //console.log(`✅ Cargado: ${src}`);
            resolve();
        };

        script.onerror = () => {
            console.error(`❌ Error cargando: ${src}`);
            reject(new Error(`No se pudo cargar ${src}`));
        };

        document.body.appendChild(script);
    });
}


// ==========================================================================
// CARGAR SUBVENTANAS HTML
// ==========================================================================

async function loadAccountPartials() {

    for (const partial of partials) {

        const container =
            document.getElementById(
                partial.containerId
            );

        if (!container) {
            console.error(
                `❌ No existe el contenedor: ${partial.containerId}`
            );
            continue;
        }

        try {

            const response =
                await fetch(partial.file);

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}`
                );
            }

            const html =
                await response.text();


            container.innerHTML = html;

        } catch (error) {

            console.error(
                `❌ Error cargando ${partial.file}:`,
                error
            );

        }
    }
}


// ==========================================================================
// CARGAR CSS SECUENCIALMENTE
// ==========================================================================

function loadStylesheet(href) {

    return new Promise((resolve, reject) => {

        const link =
            document.createElement('link');

        link.rel = 'stylesheet';
        link.href = href;

        link.onload = () => {
            resolve();
        };

        link.onerror = () => {

            console.error(
                `❌ Error cargando CSS: ${href}`
            );

            reject(
                new Error(
                    `No se pudo cargar CSS: ${href}`
                )
            );

        };

        document.head.appendChild(link);

    });

}

// ==========================================================================
// INICIALIZAR CUENTA
// ==========================================================================

async function initializeAccount() {

    try {

        // ------------------------------------------------------------------
        // 1. CARGAR ESTILOS CSS
        // ------------------------------------------------------------------

        for (const style of styles) {

            await loadStylesheet(style);

        }

        // ------------------------------------------------------------------
        // 2. CARGAR SCRIPTS
        // ------------------------------------------------------------------

        for (const script of scripts) {

            await loadScript(script);

        }

        // ------------------------------------------------------------------
        // 3. CARGAR SUBVENTANAS HTML
        // ------------------------------------------------------------------

        await loadAccountPartials();

        // ------------------------------------------------------------------
        // 4. INICIALIZAR LA LÓGICA DE LA CUENTA
        // ------------------------------------------------------------------

        if (window.initializeAccountLogic) {

            await window.initializeAccountLogic();

        }

        // ------------------------------------------------------------------
        // INICIALIZACIÓN COMPLETADA
        // ------------------------------------------------------------------

        console.log(
            '🚀 Endure Account inicializado correctamente.'
        );

    } catch (error) {

        console.error(
            '❌ Error inicializando Endure Account:',
            error
        );

    }

}

// ==========================================================================
// EJECUTAR
// ==========================================================================

initializeAccount();