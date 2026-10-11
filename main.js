// ==========================================================================
// ENDURE - FRONTEND RESOURCE LOADER & ENTRY POINT
// ==========================================================================
// Sistema centralizado de carga de recursos con gestión declarativa de
// dependencias, ejecución paralela controlada (DAG), soporte multietapa
// (critical, deferred, onDemand) y tolerancia a fallos.
// ==========================================================================

// ==========================================================================
// 1. REGISTRO DECLARATIVO DE RECURSOS
// ==========================================================================

const RESOURCE_REGISTRY = [

    // ----------------------------------------------------------------------
    // ESTILOS CSS — FASE CRÍTICA
    // Imprescindibles para el diseño inicial del catálogo y la navegación
    // ----------------------------------------------------------------------
    {
        id: 'cssAnimeGallery',
        type: 'css',
        src: './anime-gallery.css',
        dependsOn: [],
        phase: 'critical'
    },
    {
        id: 'cssAlertModal',
        type: 'css',
        src: './components/alerta/alert-modal.css',
        dependsOn: [],
        phase: 'critical'
    },
    {
        id: 'cssCartModal',
        type: 'css',
        src: './css/cart/cart-modal.css',
        dependsOn: [],
        phase: 'critical'
    },
    {
        id: 'cssProductCardModal',
        type: 'css',
        src: './css/catalog/product-card-modal.css',
        dependsOn: [],
        phase: 'critical'
    },
    {
        id: 'cssProductCard',
        type: 'css',
        src: './css/catalog/product-card.css',
        dependsOn: [],
        phase: 'critical'
    },
    {
        id: 'cssProductFilters',
        type: 'css',
        src: './css/catalog/product-filters.css',
        dependsOn: [],
        phase: 'critical'
    },

    // ----------------------------------------------------------------------
    // ESTILOS CSS — FASE DIFERIDA
    // Estilos para modales secundarios, notificaciones y checkout
    // ----------------------------------------------------------------------
    {
        id: 'cssCheckoutModal',
        type: 'css',
        src: './css/checkout/checkout-modal.css',
        dependsOn: [],
        phase: 'deferred'
    },
    {
        id: 'cssAccountCheckout',
        type: 'css',
        src: './css/account/account-checkout.css',
        dependsOn: [],
        phase: 'deferred'
    },
    {
        id: 'cssAppNotifications',
        type: 'css',
        src: './css/app/app-notifications.css',
        dependsOn: [],
        phase: 'deferred'
    },
    {
        id: 'cssSelector',
        type: 'css',
        src: './components/selector/selector.css',
        dependsOn: [],
        phase: 'deferred'
    },
    {
        id: 'cssAccountAddresses',
        type: 'css',
        src: './css/account/account-addresses.css',
        dependsOn: [],
        phase: 'deferred'
    },
    {
        id: 'cssAccountCheckoutOrderSummary',
        type: 'css',
        src: './css/account/accountCheckoutOrderSummary.css',
        dependsOn: [],
        phase: 'deferred'
    },
    {
        id: 'cssRapidForm',
        type: 'css',
        src: './components/formulario/rapid-form.css',
        dependsOn: [],
        phase: 'deferred'
    },

    // ----------------------------------------------------------------------
    // FRAGMENTOS HTML — FASE CRÍTICA
    // Estructuras que deben existir en el DOM antes de iniciar sus controladores
    // ----------------------------------------------------------------------
    {
        id: 'alertModalHTML',
        type: 'html',
        src: './components/alerta/alert-modal.html',
        target: 'alertModalContainer',
        dependsOn: [],
        phase: 'critical'
    },
    {
        id: 'cartModalHTML',
        type: 'html',
        src: './partials/cart/cart-modal.html',
        target: 'cartModalContainer',
        dependsOn: [],
        phase: 'critical'
    },
    {
        id: 'productFiltersHTML',
        type: 'html',
        src: './partials/catalog/product-filters.html',
        target: 'productFilters',
        dependsOn: [],
        phase: 'critical'
    },
    {
        id: 'productModalHTML',
        type: 'html',
        src: './partials/catalog/product-modal.html',
        target: 'productModalContainer',
        dependsOn: [],
        phase: 'critical'
    },

    // ----------------------------------------------------------------------
    // FRAGMENTOS HTML — FASE DIFERIDA
    // ----------------------------------------------------------------------
    {
        id: 'checkoutModalHTML',
        type: 'html',
        src: './partials/checkout/checkout-modal.html',
        target: 'checkoutModalContainer',
        dependsOn: [],
        phase: 'deferred'
    },
    {
        id: 'appNotificationsHTML',
        type: 'html',
        src: './partials/app/app-notifications.html',
        target: 'appNotificationsContainer',
        dependsOn: [],
        phase: 'deferred'
    },
    {
        id: 'addressModalHTML',
        type: 'html',
        src: './partials/account/address-modal.html',
        target: 'addressModalContainer',
        dependsOn: [],
        phase: 'deferred'
    },
    {
        id: 'rapidFormHTML',
        type: 'html',
        src: './components/formulario/rapid-form.html',
        target: 'rapidFormContainer',
        dependsOn: [],
        phase: 'deferred'
    },

    // ----------------------------------------------------------------------
    // JAVASCRIPT — FASE CRÍTICA
    // Fundamentos de la app, estado, catálogo, carrito base y navegación
    // ----------------------------------------------------------------------
    {
        id: 'debugger',
        type: 'js',
        src: './debugger.js',
        dependsOn: [],
        phase: 'critical'
    },
    {
        id: 'config',
        type: 'js',
        src: './config/config.js',
        dependsOn: [],
        phase: 'critical'
    },
    {
        id: 'alertModal',
        type: 'js',
        src: './components/alerta/alert-modal.js',
        dependsOn: ['alertModalHTML'],
        phase: 'critical'
    },
    {
        id: 'authApi',
        type: 'js',
        src: './modules/auth/authApi.js',
        dependsOn: ['config'],
        phase: 'critical'
    },
    {
        id: 'authUI',
        type: 'js',
        src: './modules/auth/authUI.js',
        dependsOn: [],
        phase: 'critical'
    },
    {
        id: 'authManager',
        type: 'js',
        src: './modules/auth/authManager.js',
        dependsOn: ['authApi', 'authUI'],
        phase: 'critical'
    },
    {
        id: 'appState',
        type: 'js',
        src: './app/appState.js',
        dependsOn: [],
        phase: 'critical'
    },
    {
        id: 'catalogApi',
        type: 'js',
        src: './catalog/catalogApi.js',
        dependsOn: ['config'],
        phase: 'critical'
    },
    {
        id: 'catalogCardModalZoom',
        type: 'js',
        src: './catalog/catalogCardModalZoom.js',
        dependsOn: ['productModalHTML'],
        phase: 'critical'
    },
    {
        id: 'catalogCardAnimation',
        type: 'js',
        src: './catalog/catalogCardAnimation.js',
        dependsOn: [],
        phase: 'critical'
    },
    {
        id: 'catalogManager',
        type: 'js',
        src: './catalog/catalogManager.js',
        dependsOn: ['catalogApi', 'config', 'appState'],
        phase: 'critical'
    },
    {
        id: 'catalogCardModal',
        type: 'js',
        src: './catalog/catalogCardModal.js',
        dependsOn: ['catalogManager', 'appState', 'productModalHTML'],
        phase: 'critical'
    },
    {
        id: 'catalogCard',
        type: 'js',
        src: './catalog/catalogCard.js',
        dependsOn: ['catalogCardAnimation', 'catalogCardModal'],
        phase: 'critical'
    },
    {
        id: 'appDropdowns',
        type: 'js',
        src: './app/appDropdowns.js',
        dependsOn: ['productFiltersHTML'],
        phase: 'critical'
    },
    {
        id: 'catalogUI',
        type: 'js',
        src: './catalog/catalogUI.js',
        dependsOn: ['catalogCard', 'catalogManager', 'appState', 'productFiltersHTML', 'appDropdowns'],
        phase: 'critical'
    },
    {
        id: 'catalogSubfilters',
        type: 'js',
        src: './catalog/catalogSubfilters.js',
        dependsOn: ['catalogManager', 'appState', 'productFiltersHTML'],
        phase: 'critical'
    },
    {
        id: 'cart',
        type: 'js',
        src: './cart/cart.js',
        dependsOn: [],
        phase: 'critical'
    },
    {
        id: 'cartStorage',
        type: 'js',
        src: './cart/cartStorage.js',
        dependsOn: ['cart'],
        phase: 'critical'
    },
    {
        id: 'cartDrawer',
        type: 'js',
        src: './cart/cartDrawer.js',
        dependsOn: ['cartModalHTML'],
        phase: 'critical'
    },
    {
        id: 'cartApi',
        type: 'js',
        src: './cart/cartApi.js',
        dependsOn: ['config'],
        phase: 'critical'
    },
    {
        id: 'cartUI',
        type: 'js',
        src: './cart/cartUI.js',
        dependsOn: ['cart', 'cartDrawer'],
        phase: 'critical'
    },
    {
        id: 'cartActions',
        type: 'js',
        src: './cart/cartActions.js',
        dependsOn: ['cart', 'cartStorage', 'cartApi', 'cartUI', 'cartDrawer', 'catalogManager'],
        phase: 'critical'
    },
    {
        id: 'cartSync',
        type: 'js',
        src: './cart/cartSync.js',
        dependsOn: ['cartApi', 'cart', 'cartStorage', 'cartUI'],
        phase: 'critical'
    },
    {
        id: 'appFilters',
        type: 'js',
        src: './app/appFilters.js',
        dependsOn: ['appState', 'catalogManager', 'catalogUI', 'catalogSubfilters', 'productFiltersHTML'],
        phase: 'critical'
    },
    {
        id: 'appFAQ',
        type: 'js',
        src: './app/appFAQ.js',
        dependsOn: [],
        phase: 'critical'
    },
    {
        id: 'appCheckout',
        type: 'js',
        src: './app/appCheckout.js',
        dependsOn: ['cart', 'appState'],
        phase: 'critical'
    },
    {
        id: 'appModal',
        type: 'js',
        src: './app/appModal.js',
        dependsOn: [],
        phase: 'critical'
    },
    {
        id: 'appZoom',
        type: 'js',
        src: './app/appZoom.js',
        dependsOn: [],
        phase: 'critical'
    },
    {
        id: 'appEvents',
        type: 'js',
        src: './app/appEvents.js',
        dependsOn: ['appFilters', 'cartDrawer', 'catalogCardModal', 'cartActions', 'alertModal'],
        phase: 'critical'
    },
    {
        id: 'app',
        type: 'js',
        src: './app.js',
        dependsOn: [
            'appEvents',
            'appFAQ',
            'catalogUI',
            'catalogManager',
            'cartUI',
            'cartStorage',
            'authManager',
            'catalogCardModalZoom'
        ],
        phase: 'critical'
    },

    // ----------------------------------------------------------------------
    // JAVASCRIPT — FASE DIFERIDA
    // Pasarela de pago Culqi, orquestación de checkout, direcciones y notificaciones
    // ----------------------------------------------------------------------
    {
        id: 'culqi3ds',
        type: 'js',
        src: 'https://3ds.culqi.com',
        dependsOn: [],
        phase: 'deferred'
    },
    {
        id: 'culqiCheckoutJs',
        type: 'js',
        src: 'https://js.culqi.com/checkout-js',
        dependsOn: [],
        phase: 'deferred'
    },
    {
        id: 'checkoutApi',
        type: 'js',
        src: './modules/checkout/checkoutApi.js',
        dependsOn: ['config'],
        phase: 'deferred'
    },
    {
        id: 'checkout',
        type: 'js',
        src: './modules/checkout/checkout.js',
        dependsOn: ['checkoutApi', 'culqi3ds', 'culqiCheckoutJs', 'cartApi', 'cart'],
        phase: 'deferred'
    },
    {
        id: 'accountCheckoutSummary',
        type: 'js',
        src: './account/accountCheckoutSummary.js',
        dependsOn: ['cart'],
        phase: 'deferred'
    },
    {
        id: 'accountCheckoutPurchase',
        type: 'js',
        src: './account/accountCheckoutPurchase.js',
        dependsOn: ['checkout', 'cart'],
        phase: 'deferred'
    },
    {
        id: 'accountCheckoutCompleted',
        type: 'js',
        src: './account/accountCheckoutCompleted.js',
        dependsOn: ['checkout'],
        phase: 'deferred'
    },
    {
        id: 'accountCheckoutOrderSummary',
        type: 'js',
        src: './account/accountCheckoutOrderSummary.js',
        dependsOn: ['cart'],
        phase: 'deferred'
    },
    {
        id: 'accountCheckout',
        type: 'js',
        src: './account/accountCheckout.js',
        dependsOn: [
            'accountCheckoutSummary',
            'accountCheckoutPurchase',
            'accountCheckoutCompleted',
            'accountCheckoutOrderSummary'
        ],
        phase: 'deferred'
    },
    {
        id: 'appCheckoutModal',
        type: 'js',
        src: './app/appCheckoutModal.js',
        dependsOn: ['checkoutModalHTML', 'accountCheckout', 'checkout'],
        phase: 'deferred'
    },
    {
        id: 'appLocationApi',
        type: 'js',
        src: './app/appLocationApi.js',
        dependsOn: ['config'],
        phase: 'deferred'
    },
    {
        id: 'appLocation',
        type: 'js',
        src: './app/appLocation.js',
        dependsOn: ['appLocationApi'],
        phase: 'deferred'
    },
    {
        id: 'selector',
        type: 'js',
        src: './components/selector/selector.js',
        dependsOn: ['cssSelector'],
        phase: 'deferred'
    },
    {
        id: 'addressMapService',
        type: 'js',
        src: './components/services/addressMapService.js',
        dependsOn: ['config'],
        phase: 'deferred'
    },
    {
        id: 'accountAddressesApi',
        type: 'js',
        src: './account/accountAddressesApi.js',
        dependsOn: ['config'],
        phase: 'deferred'
    },
    {
        id: 'rapidForm',
        type: 'js',
        src: './components/formulario/rapid-form.js',
        dependsOn: ['rapidFormHTML', 'config'],
        phase: 'deferred'
    },
    {
        id: 'accountAddresses',
        type: 'js',
        src: './account/accountAddresses.js',
        dependsOn: [
            'addressModalHTML',
            'accountAddressesApi',
            'addressMapService',
            'selector',
            'rapidForm',
            'appLocation'
        ],
        phase: 'deferred'
    },
    {
        id: 'notificationsApi',
        type: 'js',
        src: './modules/notifications/notificationsApi.js',
        dependsOn: ['config'],
        phase: 'deferred'
    },
    {
        id: 'notifications',
        type: 'js',
        src: './modules/notifications/notifications.js',
        dependsOn: ['notificationsApi'],
        phase: 'deferred'
    },
    {
        id: 'appNotificationsApi',
        type: 'js',
        src: './app/appNotificationsApi.js',
        dependsOn: ['config'],
        phase: 'deferred'
    },
    {
        id: 'appNotifications',
        type: 'js',
        src: './app/appNotifications.js',
        dependsOn: [
            'appNotificationsHTML',
            'appNotificationsApi',
            'notificationsApi',
            'notifications'
        ],
        phase: 'deferred'
    },

    // ----------------------------------------------------------------------
    // JAVASCRIPT — FASE ON-DEMAND
    // Recursos que únicamente se cargan cuando se accede a funciones específicas
    // (Ej. cuando un administrador activa el modo de catálogo administrativo)
    // ----------------------------------------------------------------------
    {
        id: 'accountSelects',
        type: 'js',
        src: './account/accountSelects.js',
        dependsOn: ['config'],
        phase: 'onDemand'
    },
    {
        id: 'accountInventory',
        type: 'js',
        src: './account/accountInventory.js',
        dependsOn: ['accountSelects', 'config'],
        phase: 'onDemand'
    }
];


// ==========================================================================
// 2. MOTOR DEL CARGADOR DE RECURSOS (RESOURCE LOADER)
// ==========================================================================

class ResourceLoader {

    /**
     * @param {Array<Object>} registry Lista declarativa de recursos
     */
    constructor(registry) {
        this.registry = registry;
        this.registryMap = new Map();
        this.cssOrderIndex = 0;

        // Registrar e indexar recursos
        this.registry.forEach((res, index) => {
            const entry = {
                ...res,
                registryIndex: index,
                state: 'idle', // 'idle' | 'loading' | 'ready' | 'failed'
                promise: null,
                error: null
            };
            this.registryMap.set(res.id, entry);
        });

        // Validaciones arquitectónicas estrictas
        this.validateRegistry();
    }

    /**
     * Valida identificadores duplicados, dependencias inexistentes y ciclos
     */
    validateRegistry() {
        const seenIds = new Set();

        for (const res of this.registry) {
            // 1. Identificadores válidos y únicos
            if (!res.id || typeof res.id !== 'string') {
                throw new Error(`[ResourceLoader] Recurso sin "id" válido: ${JSON.stringify(res)}`);
            }
            if (seenIds.has(res.id)) {
                throw new Error(`[ResourceLoader] Identificador duplicado detectado: "${res.id}" (${res.src})`);
            }
            seenIds.add(res.id);

            // 2. Tipo permitido
            if (!['js', 'css', 'html'].includes(res.type)) {
                throw new Error(`[ResourceLoader] Tipo no permitido "${res.type}" en recurso "${res.id}".`);
            }

            // 3. Contenedor obligatorio para HTML
            if (res.type === 'html' && (!res.target || typeof res.target !== 'string')) {
                throw new Error(`[ResourceLoader] El recurso HTML "${res.id}" (${res.src}) requiere el campo "target".`);
            }
        }

        // 4. Dependencias existentes
        for (const res of this.registry) {
            if (Array.isArray(res.dependsOn)) {
                for (const depId of res.dependsOn) {
                    if (!this.registryMap.has(depId)) {
                        throw new Error(
                            `[ResourceLoader] Dependencia inexistente "${depId}" requerida por "${res.id}" (${res.src})`
                        );
                    }
                }
            }
        }

        // 5. Detección de ciclos mediante DFS (3 colores)
        this.detectCycles();
    }

    /**
     * Algoritmo de detección de ciclos en el grafo de dependencias
     */
    detectCycles() {
        const visited = new Set();
        const inStack = new Set();

        const dfs = (nodeId, path) => {
            inStack.add(nodeId);

            const res = this.registryMap.get(nodeId);
            if (res && Array.isArray(res.dependsOn)) {
                for (const depId of res.dependsOn) {
                    if (inStack.has(depId)) {
                        const cyclePath = [...path, depId];
                        const cycleStart = cyclePath.indexOf(depId);
                        const cycle = cyclePath.slice(cycleStart);
                        throw new Error(
                            `[ResourceLoader] Ciclo de dependencias detectado: ${cycle.join(' -> ')}`
                        );
                    }
                    if (!visited.has(depId)) {
                        dfs(depId, [...path, depId]);
                    }
                }
            }

            inStack.delete(nodeId);
            visited.add(nodeId);
        };

        for (const id of this.registryMap.keys()) {
            if (!visited.has(id)) {
                dfs(id, [id]);
            }
        }
    }

    /**
     * Carga una hoja de estilos CSS preservando el orden de la cascada
     */
    loadStylesheet(res) {
        return new Promise((resolve, reject) => {
            const existingLink = document.querySelector(`link[data-resource-id="${res.id}"]`) ||
                document.querySelector(`link[href="${res.src}"]`);

            if (existingLink) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = res.src;
            link.dataset.resourceId = res.id;
            link.dataset.registryIndex = String(res.registryIndex);

            link.onload = () => resolve();
            link.onerror = () => {
                reject(new Error(`[ResourceLoader] Error al descargar hoja de estilo CSS "${res.id}": ${res.src}`));
            };

            // Preservar la cascada insertando en el orden relativo del registro
            const allTrackedLinks = document.querySelectorAll('link[data-registry-index]');
            let inserted = false;

            for (const otherLink of allTrackedLinks) {
                const otherIdx = Number(otherLink.dataset.registryIndex);
                if (otherIdx > res.registryIndex) {
                    otherLink.parentNode.insertBefore(link, otherLink);
                    inserted = true;
                    break;
                }
            }

            if (!inserted) {
                document.head.appendChild(link);
            }
        });
    }

    /**
     * Descarga e inserta un fragmento HTML en su contenedor destino
     */
    async loadHtmlFragment(res) {
        const container = document.getElementById(res.target);

        if (!container) {
            throw new Error(
                `[ResourceLoader] Contenedor destino "${res.target}" no existe en el DOM para el fragmento HTML "${res.id}" (${res.src})`
            );
        }

        try {
            const response = await fetch(res.src);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }

            const html = await response.text();
            container.innerHTML = html;
        } catch (error) {
            throw new Error(
                `[ResourceLoader] Error al cargar fragmento HTML "${res.id}" (${res.src}): ${error.message}`
            );
        }
    }

    /**
     * Carga y ejecuta un archivo JavaScript con orden determinista
     */
    loadScript(res) {
        return new Promise((resolve, reject) => {
            const existingScript = document.querySelector(`script[data-resource-id="${res.id}"]`) ||
                document.querySelector(`script[src="${res.src}"]`);

            if (existingScript) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = res.src;
            script.dataset.resourceId = res.id;
            script.async = false; // Mantiene determinismo en la secuencia de ejecución

            script.onload = () => resolve();
            script.onerror = () => {
                reject(new Error(`[ResourceLoader] Error al cargar JavaScript "${res.id}": ${res.src}`));
            };

            document.body.appendChild(script);
        });
    }

    /**
     * Carga un recurso resolviendo previamente todas sus dependencias de forma paralela
     * @param {string} id Identificador del recurso
     * @returns {Promise<void>}
     */
    async load(id) {
        const res = this.registryMap.get(id);

        if (!res) {
            throw new Error(`[ResourceLoader] Recurso no encontrado en el registro: "${id}"`);
        }

        if (res.state === 'ready') {
            return;
        }

        if (res.state === 'failed') {
            throw res.error;
        }

        if (res.promise) {
            return res.promise;
        }

        res.state = 'loading';

        res.promise = (async () => {
            try {
                // 1. Resolver todas las dependencias declaradas en paralelo
                if (Array.isArray(res.dependsOn) && res.dependsOn.length > 0) {
                    await Promise.all(
                        res.dependsOn.map(depId => this.load(depId))
                    );
                }

                // 2. Procesar el recurso según su tipo
                if (res.type === 'css') {
                    await this.loadStylesheet(res);
                } else if (res.type === 'html') {
                    await this.loadHtmlFragment(res);
                } else if (res.type === 'js') {
                    await this.loadScript(res);
                }

                res.state = 'ready';
            } catch (error) {
                res.state = 'failed';
                res.error = error;
                throw error;
            }
        })();

        return res.promise;
    }

    /**
     * Carga simultáneamente todos los recursos independientes que pertenecen a una fase
     * @param {string} phase 'critical' | 'deferred' | 'onDemand'
     * @returns {Promise<void>}
     */
    async loadPhase(phase) {
        const phaseResources = Array.from(this.registryMap.values())
            .filter(res => res.phase === phase);

        if (phaseResources.length === 0) {
            return;
        }

        console.log(`⏳ [ResourceLoader] Iniciando fase: "${phase}" (${phaseResources.length} recursos)...`);

        // Lanzar la carga concurrente de todos los recursos de la etapa.
        // Aquellos con dependencias independientes se procesarán en paralelo de inmediato;
        // los que tengan dependencias esperarán automáticamente a que sus prerrequisitos finalicen.
        await Promise.all(
            phaseResources.map(res => this.load(res.id))
        );

        console.log(`✅ [ResourceLoader] Fase "${phase}" completada exitosamente.`);
    }

    /**
     * Diagnóstico del estado actual de recursos
     */
    getStatus() {
        const summary = { ready: [], loading: [], failed: [], idle: [] };
        for (const [id, res] of this.registryMap.entries()) {
            summary[res.state].push({ id, type: res.type, src: res.src, phase: res.phase });
        }
        return summary;
    }

}


// ==========================================================================
// 3. INICIALIZACIÓN DE LA APLICACIÓN
// ==========================================================================

const loader = new ResourceLoader(RESOURCE_REGISTRY);

// Exposición global para interoperabilidad con módulos y eventos bajo demanda
window.resourceLoader = loader;
window.RESOURCE_REGISTRY = RESOURCE_REGISTRY;

async function initializeApp() {

    try {
        console.log('⚡ [Endure] Inicializando cargador con gestión de dependencias...');

        // ------------------------------------------------------------------
        // ETAPA 1: CRITICAL (Ruta Crítica)
        // Descarga concurrente de estilos, HTML y scripts indispensables
        // para renderizar el catálogo y la navegación sin bloqueos
        // ------------------------------------------------------------------
        await loader.loadPhase('critical');

        console.log('🚀 [Endure] Recursos críticos listos. Catálogo visible e interactivo.');

        // ------------------------------------------------------------------
        // ETAPA 2: DEFERRED (Carga en Segundo Plano)
        // No bloquea la vista inicial. Se ejecuta una vez que el catálogo
        // está disponible para el usuario.
        // ------------------------------------------------------------------
        setTimeout(() => {
            loader.loadPhase('deferred')
                .then(() => {
                    console.log('✨ [Endure] Módulos diferidos listos en segundo plano.');

                    // Inicializar submódulos de checkout y notificaciones si aplican
                    if (window.currentUser && window.appNotifications && typeof appNotifications.init === 'function') {
                        appNotifications.init().catch(err => {
                            console.warn('⚠️ Error al inicializar notificaciones diferidas:', err);
                        });
                    }

                    if (window.initCheckoutModal && typeof window.initCheckoutModal === 'function') {
                        window.initCheckoutModal();
                    }

                    if (window.accountCheckout && typeof accountCheckout.init === 'function') {
                        accountCheckout.init();
                    }

                    if (window.accountCheckoutSummary && typeof accountCheckoutSummary.init === 'function') {
                        accountCheckoutSummary.init().catch(() => {});
                    }

                    if (window.accountCheckoutPurchase && typeof accountCheckoutPurchase.init === 'function') {
                        accountCheckoutPurchase.init();
                    }

                    if (window.accountCheckoutCompleted && typeof accountCheckoutCompleted.init === 'function') {
                        accountCheckoutCompleted.init();
                    }

                    if (window.accountCheckoutOrderSummary && typeof accountCheckoutOrderSummary.init === 'function') {
                        accountCheckoutOrderSummary.init();
                    }

                    if (window.checkout && typeof checkout.init === 'function') {
                        checkout.init(window.currentUser).catch(err => {
                            console.warn('⚠️ Error inicializando pasarela Culqi diferida:', err);
                        });
                    }
                })
                .catch(err => {
                    console.warn('⚠️ [Endure] Advertencia en carga diferida:', err.message);
                });
        }, 50);

    } catch (error) {
        // Fallo crítico: se interrumpe la inicialización para evitar inconsistencias
        console.error('❌ [Endure] Error crítico en la inicialización:', error);

        const alertContainer = document.getElementById('alertModalContainer') || document.body;
        const errorBanner = document.createElement('div');
        errorBanner.style.cssText =
            'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); ' +
            'background: #ef4444; color: #fff; padding: 14px 24px; border-radius: 8px; ' +
            'font-family: sans-serif; font-size: 14px; z-index: 999999; box-shadow: 0 4px 16px rgba(0,0,0,0.3);';
        errorBanner.innerHTML =
            `<strong>Error al cargar la tienda</strong><br><small>${error.message}</small>`;
        alertContainer.appendChild(errorBanner);
    }

}

// Iniciar aplicación
initializeApp();