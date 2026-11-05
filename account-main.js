// ==========================================================================
// ENDURE - ACCOUNT ENTRY POINT
// Optimized parallel resource loader with dependency graph
// ==========================================================================


// ==========================================================================
// GRAFO DE DEPENDENCIAS DE SCRIPTS
// ==========================================================================
//
// Cada entrada define un script y los IDs de scripts que DEBEN haberse
// cargado antes. El loader resuelve el grafo por capas (topological sort)
// y carga en paralelo todos los scripts de la misma capa.
//
// Para agregar un nuevo script:
//   1. Añadirlo al array con un `id` único
//   2. Listar en `deps` los IDs de los que depende
//   3. El loader se encarga del resto
// ==========================================================================

const scriptGraph = [

    // ======================================================================
    // CAPA 0 — Sin dependencias (se cargan todos en paralelo)
    // ======================================================================

    // Configuración global
    { id: 'config', src: './config/config.js' },

    // Componentes UI sin dependencias
    { id: 'confirmationModal', src: './components/confirmacion/confirmation-modal.js' },
    { id: 'alertModal', src: './components/alerta/alert-modal.js' },
    { id: 'selector', src: './components/selector/selector.js' },
    { id: 'rapidForm', src: './components/formulario/rapid-form.js' },
    { id: 'passwordValidation', src: './modules/validator/passwordValidation.js' },
    { id: 'accountTabs', src: './account/accountTabs.js' },

    // Culqi (externos, sin dependencias locales)
    { id: 'culqi3ds', src: 'https://3ds.culqi.com' },
    { id: 'culqiCheckoutJs', src: 'https://js.culqi.com/checkout-js' },

    // ======================================================================
    // CAPA 1 — Dependen solo de config
    // ======================================================================

    {
        id: 'debugger', src: './debugger.js',
        deps: ['config']
    },

    {
        id: 'cartApi', src: './cart/cartApi.js',
        deps: ['config']
    },

    {
        id: 'checkoutApi', src: './modules/checkout/checkoutApi.js',
        deps: ['config']
    },

    {
        id: 'appLocationApi', src: './app/appLocationApi.js',
        deps: ['config']
    },

    {
        id: 'addressMapService', src: './components/services/addressMapService.js',
        deps: ['config']
    },

    {
        id: 'orderDetailComponent', src: './components/detalle-orden/order-detail.js',
        deps: ['config']
    },

    {
        id: 'accountSession', src: './account/accountSession.js',
        deps: ['config']
    },

    {
        id: 'accountAddressesApi', src: './account/accountAddressesApi.js',
        deps: ['config']
    },

    {
        id: 'accountOrdersApi', src: './account/accountOrdersApi.js',
        deps: ['config']
    },

    {
        id: 'accountProductApi', src: './account/accountProductApi.js',
        deps: ['config']
    },

    {
        id: 'accountProductTypeApi', src: './account/accountProductTypeApi.js',
        deps: ['config']
    },

    {
        id: 'accountInventoryApi', src: './account/accountInventoryApi.js',
        deps: ['config']
    },

    {
        id: 'accountTags', src: './account/accountTags.js',
        deps: ['config']
    },

    {
        id: 'appNotificationsApi', src: './app/appNotificationsApi.js',
        deps: ['config']
    },

    {
        id: 'notificationsApi', src: './modules/notifications/notificationsApi.js',
        deps: ['config']
    },

    // ======================================================================
    // CAPA 2 — Dependen de capa 0 + capa 1
    // ======================================================================

    {
        id: 'checkoutModule', src: './modules/checkout/checkout.js',
        deps: ['checkoutApi', 'config', 'culqi3ds', 'culqiCheckoutJs']
    },

    {
        id: 'appLocation', src: './app/appLocation.js',
        deps: ['appLocationApi', 'selector']
    },

    {
        id: 'appNotifications', src: './app/appNotifications.js',
        deps: ['appNotificationsApi', 'config']
    },

    {
        id: 'notifications', src: './modules/notifications/notifications.js',
        deps: ['notificationsApi', 'alertModal']
    },

    {
        id: 'accountProfile', src: './account/accountProfile.js',
        deps: ['config', 'rapidForm', 'alertModal', 'confirmationModal']
    },

    {
        id: 'accountSecurity', src: './account/accountSecurity.js',
        deps: ['config', 'passwordValidation', 'alertModal', 'confirmationModal']
    },

    {
        id: 'accountCart', src: './account/accountCart.js',
        deps: ['cartApi', 'config', 'alertModal', 'confirmationModal']
    },

    {
        id: 'accountOrders', src: './account/accountOrders.js',
        deps: ['accountOrdersApi', 'orderDetailComponent', 'alertModal', 'confirmationModal', 'config']
    },

    {
        id: 'accountProductTypes', src: './account/accountProductTypes.js',
        deps: ['accountProductTypeApi', 'alertModal', 'confirmationModal', 'rapidForm']
    },

    {
        id: 'accountAttributes', src: './account/accountAttributes.js',
        deps: ['accountProductTypeApi', 'selector', 'alertModal']
    },

    {
        id: 'accountSelects', src: './account/accountSelects.js',
        deps: ['accountProductApi', 'accountProductTypeApi', 'selector']
    },

    {
        id: 'accountCheckoutSummary', src: './account/accountCheckoutSummary.js',
        deps: ['cartApi', 'config']
    },

    {
        id: 'accountCheckoutPurchase', src: './account/accountCheckoutPurchase.js',
        deps: ['checkoutApi', 'checkoutModule', 'config', 'alertModal']
    },

    {
        id: 'accountCheckoutCompleted', src: './account/accountCheckoutCompleted.js',
        deps: ['config', 'accountOrdersApi']
    },

    {
        id: 'accountInventoryMovementsModal', src: './account/accountInventoryMovementsModal.js',
        deps: ['accountInventoryApi', 'config']
    },

    {
        id: 'accountInventoryManager', src: './account/accountInventoryManager.js',
        deps: ['accountInventoryApi', 'alertModal', 'confirmationModal']
    },

    // ======================================================================
    // CAPA 3
    // ======================================================================

    {
        id: 'accountAddresses', src: './account/accountAddresses.js',
        deps: ['accountAddressesApi', 'appLocation', 'addressMapService', 'alertModal', 'confirmationModal', 'rapidForm']
    },

    {
        id: 'accountVariants', src: './account/accountVariants.js',
        deps: ['accountAttributes', 'accountSelects', 'alertModal']
    },

    {
        id: 'accountInventoryFilters', src: './account/accountInventoryFilters.js',
        deps: ['accountSelects', 'selector']
    },

    {
        id: 'accountCheckoutOrderSummary', src: './account/accountCheckoutOrderSummary.js',
        deps: ['cartApi', 'config', 'appLocation']
    },

    // ======================================================================
    // CAPA 4
    // ======================================================================

    {
        id: 'accountInventoryFilterModal', src: './account/accountInventoryFilterModal.js',
        deps: ['accountInventoryFilters', 'accountSelects', 'selector']
    },

    {
        id: 'accountCheckout', src: './account/accountCheckout.js',
        deps: ['accountCheckoutSummary', 'accountCheckoutPurchase', 'accountCheckoutCompleted', 'accountCart', 'appLocation', 'accountAddresses', 'alertModal']
    },

    // ======================================================================
    // CAPA 5
    // ======================================================================

    {
        id: 'accountInventory', src: './account/accountInventory.js',
        deps: ['accountInventoryApi', 'accountInventoryFilters', 'accountInventoryFilterModal', 'accountInventoryMovementsModal', 'accountInventoryManager', 'accountSelects', 'alertModal']
    },

    // ======================================================================
    // CAPA 6
    // ======================================================================

    {
        id: 'accountProductForm', src: './account/accountProductForm.js',
        deps: ['accountProductApi', 'accountSelects', 'accountTags', 'accountVariants', 'accountInventory', 'accountAttributes', 'rapidForm', 'alertModal', 'confirmationModal']
    },

    // ======================================================================
    // CAPA 7
    // ======================================================================

    {
        id: 'accountProductValidation', src: './account/accountProductValidation.js',
        deps: ['accountProductForm']
    },

    // ======================================================================
    // CAPA FINAL — Orquestador principal (depende de todo)
    // ======================================================================

    {
        id: 'account', src: './account.js',
        deps: [
            'accountSession', 'accountTabs', 'accountProfile', 'accountSecurity',
            'accountAddresses', 'accountCart', 'accountOrders', 'accountProductTypes',
            'accountProductForm', 'accountProductValidation', 'accountInventory',
            'accountCheckout', 'accountCheckoutOrderSummary', 'appNotifications',
            'notifications', 'debugger'
        ]
    },
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

    './components/formulario/rapid-form.css',
    './modules/checkout/checkout.css',
    './components/confirmacion/confirmation-modal.css',
    './components/alerta/alert-modal.css',
    './components/selector/selector.css',
    './css/account/account-profile.css',
    './css/account/account-security.css',
    './css/account/account-addresses.css',
    './css/account/account-cart.css',
    './css/account/account-orders.css',
    './components/detalle-orden/order-detail.css',
    './css/account/account-checkout.css',
    './css/account/accountCheckoutOrderSummary.css',
    './css/app/app-notifications.css'

];


// ==========================================================================
// LOADER: CARGAR UN SCRIPT INDIVIDUAL
// ==========================================================================

function loadScript(src) {

    return new Promise((resolve, reject) => {

        const script = document.createElement('script');

        script.src = src;

        script.onload = () => {
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
// LOADER: CARGAR UNA HOJA DE ESTILOS
// ==========================================================================

function loadStylesheet(href) {

    return new Promise((resolve, reject) => {

        const link = document.createElement('link');

        link.rel = 'stylesheet';
        link.href = href;

        link.onload = () => {
            resolve();
        };

        link.onerror = () => {
            console.error(`❌ Error cargando CSS: ${href}`);
            reject(new Error(`No se pudo cargar CSS: ${href}`));
        };

        document.head.appendChild(link);

    });

}


// ==========================================================================
// LOADER: CARGAR UN PARTIAL HTML
// ==========================================================================

function loadPartial(partial) {

    const container = document.getElementById(partial.containerId);

    if (!container) {
        console.error(`❌ No existe el contenedor: ${partial.containerId}`);
        return Promise.resolve();
    }

    return fetch(partial.file)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            container.innerHTML = html;
        })
        .catch(error => {
            console.error(`❌ Error cargando ${partial.file}:`, error);
        });
}


// ==========================================================================
// RESOLVER GRAFO DE DEPENDENCIAS POR CAPAS (Topological Sort — Kahn)
// ==========================================================================
//
// Devuelve un array de capas, donde cada capa es un array de nodos que
// pueden cargarse en paralelo porque todas sus dependencias ya fueron
// resueltas en capas anteriores.
// ==========================================================================

function resolveScriptLayers(graph) {

    // Construir índice y conteo de dependencias entrantes
    const nodeMap = new Map();
    const inDegree = new Map();

    for (const node of graph) {
        nodeMap.set(node.id, node);
        inDegree.set(node.id, (node.deps || []).length);
    }

    // Validar que todas las dependencias referenciadas existen
    for (const node of graph) {
        for (const dep of (node.deps || [])) {
            if (!nodeMap.has(dep)) {
                throw new Error(
                    `Dependencia "${dep}" requerida por "${node.id}" no existe en el grafo.`
                );
            }
        }
    }

    const resolved = new Set();
    const layers = [];

    while (resolved.size < graph.length) {

        // Encontrar todos los nodos cuyas dependencias ya están resueltas
        const layer = graph.filter(node =>
            !resolved.has(node.id) &&
            (node.deps || []).every(dep => resolved.has(dep))
        );

        if (layer.length === 0) {
            // Detectar dependencias circulares
            const unresolved = graph
                .filter(n => !resolved.has(n.id))
                .map(n => n.id);
            throw new Error(
                `Dependencia circular detectada entre: ${unresolved.join(', ')}`
            );
        }

        layers.push(layer);

        for (const node of layer) {
            resolved.add(node.id);
        }
    }

    return layers;
}


// ==========================================================================
// CARGAR SCRIPTS RESPETANDO DEPENDENCIAS CON MÁXIMO PARALELISMO
// ==========================================================================

async function loadScriptsParallel(graph) {

    const layers = resolveScriptLayers(graph);

    console.log(
        `📦 Grafo resuelto: ${layers.length} capas, ${graph.length} scripts`
    );

    for (let i = 0; i < layers.length; i++) {

        const layer = layers[i];

        const ids = layer.map(n => n.id).join(', ');
        console.log(
            `  ⏳ Capa ${i}: cargando ${layer.length} script(s) en paralelo [${ids}]`
        );

        // Cargar todos los scripts de esta capa en paralelo
        await Promise.all(
            layer.map(node => loadScript(node.src))
        );

        console.log(
            `  ✅ Capa ${i}: completada`
        );
    }
}


// ==========================================================================
// CARGAR TODOS LOS CSS EN PARALELO
// ==========================================================================

function loadAllStylesParallel(styleList) {

    console.log(`🎨 Cargando ${styleList.length} hojas de estilo en paralelo...`);

    return Promise.all(
        styleList.map(href => loadStylesheet(href))
    );
}


// ==========================================================================
// CARGAR TODOS LOS PARTIALS HTML EN PARALELO
// ==========================================================================

function loadAllPartialsParallel(partialList) {

    console.log(`📄 Cargando ${partialList.length} partials HTML en paralelo...`);

    return Promise.all(
        partialList.map(partial => loadPartial(partial))
    );
}


// ==========================================================================
// INICIALIZAR CUENTA
// ==========================================================================
//
// Estrategia de carga optimizada:
//
//   1. CSS y Partials HTML se cargan EN PARALELO entre sí y con la
//      primera capa de scripts (no tienen interdependencias).
//
//   2. Los scripts se cargan por capas: dentro de cada capa todos
//      se descargan y ejecutan en paralelo. La siguiente capa solo
//      arranca cuando la anterior termina, garantizando que las
//      dependencias estén disponibles.
//
//   3. La lógica de la cuenta (account.js → initializeAccountLogic)
//      se ejecuta solo cuando TODOS los recursos han terminado.
//
// ==========================================================================

async function initializeAccount() {

    const startTime = performance.now();

    try {

        // ------------------------------------------------------------------
        // FASE 1: CSS + Partials HTML + Scripts — máximo paralelismo
        // ------------------------------------------------------------------
        // CSS y partials no dependen de ningún script, así que los lanzamos
        // en paralelo con la carga completa del grafo de scripts.
        // Los scripts internamente se resuelven capa por capa.
        // ------------------------------------------------------------------

        await Promise.all([

            loadAllStylesParallel(styles),
            loadAllPartialsParallel(partials),
            loadScriptsParallel(scriptGraph)

        ]);

        // ------------------------------------------------------------------
        // FASE 2: INICIALIZAR LA LÓGICA DE LA CUENTA
        // ------------------------------------------------------------------

        if (window.initializeAccountLogic) {

            await window.initializeAccountLogic();

        }

        // ------------------------------------------------------------------
        // INICIALIZACIÓN COMPLETADA
        // ------------------------------------------------------------------

        const elapsed = (performance.now() - startTime).toFixed(0);

        console.log(
            `🚀 Endure Account inicializado correctamente en ${elapsed}ms`
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
