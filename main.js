// ==========================================================================
// ENDURE - FRONTEND ENTRY POINT
// ==========================================================================

// Scripts JavaScript que deben cargarse en orden de dependencias
const scripts = [

    // ----------------------------------------------------------------------
    // Debug
    // ----------------------------------------------------------------------

    './debugger.js',

    // Culqi
    'https://3ds.culqi.com',
    'https://js.culqi.com/checkout-js',


    // ----------------------------------------------------------------------
    // Configuración
    // ----------------------------------------------------------------------

    './config/config.js',
    './components/alerta/alert-modal.js',

    // ----------------------------------------------------------------------
    // Autenticación
    // ----------------------------------------------------------------------

    './modules/auth/authApi.js',
    './modules/auth/authManager.js',
    './modules/auth/authUI.js',

    // ----------------------------------------------------------------------
    // Cuenta
    // ----------------------------------------------------------------------

    './account/accountSelects.js',
    './account/accountInventory.js',

    // ----------------------------------------------------------------------
    // Catálogo
    // ----------------------------------------------------------------------

    './catalog/catalogApi.js',
    './catalog/catalogCardModalZoom.js',
    './catalog/catalogCardAnimation.js',
    './catalog/catalogCardModal.js',
    './catalog/catalogCard.js',
    './catalog/catalogUI.js',
    './catalog/catalogManager.js',
    './catalog/catalogSubfilters.js',

    // ----------------------------------------------------------------------
    // Carrito
    // ----------------------------------------------------------------------

    './cart/cart.js',
    './cart/cartStorage.js',
    './cart/cartDrawer.js',
    './cart/cartApi.js',
    './cart/cartActions.js',
    './cart/cartUI.js',
    './cart/cartSync.js',

    // ----------------------------------------------------------------------
    // App Modular
    // ----------------------------------------------------------------------
    './account/accountCheckoutSummary.js',
    './account/accountCheckoutPurchase.js',
    './account/accountCheckoutCompleted.js',
    './account/accountCheckoutOrderSummary.js',
    './account/accountCheckout.js',
    './app/appLocationApi.js',
    './app/appLocation.js',
    './components/selector/selector.js',
    './components/services/addressMapService.js',
    './account/accountAddressesApi.js',
    './account/accountAddresses.js',
    './components/formulario/rapid-form.js',
    './app/appState.js',
    './app/appFilters.js',
    './app/appDropdowns.js',
    './app/appModal.js',
    './app/appZoom.js',
    './app/appCheckout.js',
    './app/appFAQ.js',
    './app/appEvents.js',
    './app/appCheckoutModal.js',
    './modules/checkout/checkoutApi.js',
    './modules/checkout/checkout.js',
    './modules/notifications/notificationsApi.js',
    './modules/notifications/notifications.js',
    './app/appNotificationsApi.js',
    './app/appNotifications.js',

];


// ==========================================================================
// COMPONENTES HTML DEL CATÁLOGO
// ==========================================================================

const catalogComponents = [

    {
        containerId: 'rapidFormContainer',
        file: './components/formulario/rapid-form.html'
    },


    {
        containerId: 'alertModalContainer',
        file: './components/alerta/alert-modal.html'
    },

    {
        containerId: 'cartModalContainer',
        file: './partials/cart/cart-modal.html'
    },

    {
        containerId: 'productFilters',
        file: './partials/catalog/product-filters.html'
    },

    {
        containerId: 'productModalContainer',
        file: './partials/catalog/product-modal.html'
    },

    {
        containerId: 'checkoutModalContainer',
        file: './partials/checkout/checkout-modal.html'
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
// CSS PRINCIPAL
// ==========================================================================

const styles = [
    './anime-gallery.css',
    './components/alerta/alert-modal.css',
    './css/cart/cart-modal.css',
    './css/catalog/product-card-modal.css',
    './css/catalog/product-card.css',
    './css/catalog/product-filters.css',
    './css/checkout/checkout-modal.css',
    './css/account/account-checkout.css',
    './css/app/app-notifications.css',
    './components/selector/selector.css',
    './css/account/account-addresses.css',
    './css/account/accountCheckoutOrderSummary.css',
    './components/formulario/rapid-form.css'
];


function loadStylesheet(href) {
    return new Promise((resolve, reject) => {

        const link = document.createElement('link');

        link.rel = 'stylesheet';
        link.href = href;

        link.onload = resolve;

        link.onerror = () => {
            reject(new Error(`Error cargando CSS: ${href}`));
        };

        document.head.appendChild(link);
    });
}


// ==========================================================================
// CARGAR SCRIPTS SECUENCIALMENTE
// ==========================================================================

function loadScript(src) {

    return new Promise((resolve, reject) => {

        const script = document.createElement('script');

        script.src = src;

        script.onload = () => {
            resolve();
        };

        script.onerror = () => {

            console.error(
                `❌ Error cargando: ${src}`
            );

            reject(
                new Error(
                    `No se pudo cargar ${src}`
                )
            );

        };

        document.body.appendChild(script);

    });

}


// ==========================================================================
// CARGAR COMPONENTES HTML DEL CATÁLOGO
// ==========================================================================

async function loadCatalogComponents() {

    for (const component of catalogComponents) {

        const container =
            document.getElementById(
                component.containerId
            );

        if (!container) {

            console.error(
                `❌ No existe el contenedor: ${component.containerId}`
            );

            continue;
        }

        try {

            const response =
                await fetch(component.file);

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
                `❌ Error cargando ${component.file}:`,
                error
            );

        }

    }

}


// ==========================================================================
// INICIALIZAR APLICACIÓN
// ==========================================================================

async function initializeApp() {

    try {

        // ------------------------------------------------------------------
        // 1. Cargar estilos CSS
        // ------------------------------------------------------------------

        for (const style of styles) {
            await loadStylesheet(style);
        }

        // ------------------------------------------------------------------
        // 2. Cargar módulos JavaScript
        // ------------------------------------------------------------------

        for (const script of scripts) {

            await loadScript(script);

        }


        // ------------------------------------------------------------------
        // 3. Cargar componentes HTML
        // ------------------------------------------------------------------

        await loadCatalogComponents();


        // ------------------------------------------------------------------
        // 4. Cargar el orquestador principal
        // ------------------------------------------------------------------

        await loadScript('./app.js');


        // ------------------------------------------------------------------
        // Inicialización completada
        // ------------------------------------------------------------------

        console.log(
            '🚀 Endure inicializado correctamente.'
        );

    } catch (error) {

        console.error(
            '❌ Error inicializando Endure:',
            error
        );

    }

}


// ==========================================================================
// EJECUTAR
// ==========================================================================

initializeApp();