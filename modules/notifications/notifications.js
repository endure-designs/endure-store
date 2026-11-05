// ==========================================================================
// ENDURE - PUSH & BROWSER NOTIFICATIONS
// Firebase Cloud Messaging & Web Notifications API
// ==========================================================================
//
// Responsabilidades:
//
// - Comprobar compatibilidad del entorno (Notification API, ServiceWorker, contexto seguro).
// - Consultar y monitorizar en tiempo real el estado del permiso (concedido, bloqueado, pendiente).
// - Solicitar permiso nativo al usuario cuando se requiera.
// - Inicializar Firebase Messaging y registrar el Service Worker.
// - Obtener el token FCM y registrar el dispositivo en el backend.
// - Mostrar notificaciones nativas en el navegador (primer plano y confirmación).
// - Escuchar mensajes FCM y emitir eventos internos para la UI de Endure.
//
// ==========================================================================

window.endureNotifications = {

    // ======================================================================
    // ESTADO
    // ======================================================================

    messaging: null,
    registration: null,
    currentUser: null,

    initialized: false,
    firebaseReady: false,
    foregroundListenerRegistered: false,
    permissionWatcherActive: false,
    _loadingFirebasePromise: null,


    // ======================================================================
    // CONSULTA INTEGRAL DEL ESTADO DEL PERMISO
    // ======================================================================
    //
    // Controla todos los casos posibles:
    // - No soportado por el navegador
    // - Contexto no seguro (HTTP en lugar de HTTPS / localhost)
    // - Bloqueado por el navegador (denied)
    // - Pendiente de decisión (default)
    // - Concedido / Activado (granted)
    // ======================================================================

    getStatus() {

        // 1. Verificación de Contexto Seguro
        if (window.isSecureContext === false) {

            return {
                supported: false,
                permission: 'unsupported',
                state: 'unsupported',
                enabled: false,
                isBlocked: false,
                isPending: false,
                isGranted: false,
                reason: 'INSECURE_CONTEXT',
                message: 'Las notificaciones requieren una conexión segura (HTTPS o localhost).'
            };

        }

        // 2. Soporte de la API Notification
        if (!('Notification' in window)) {

            return {
                supported: false,
                permission: 'unsupported',
                state: 'unsupported',
                enabled: false,
                isBlocked: false,
                isPending: false,
                isGranted: false,
                reason: 'NOTIFICATION_API_NOT_SUPPORTED',
                message: 'Este navegador no soporta la API de notificaciones nativas.'
            };

        }

        // 3. Soporte de Service Worker (indispensable para notificaciones Push)
        if (!('serviceWorker' in navigator)) {

            return {
                supported: false,
                permission: 'unsupported',
                state: 'unsupported',
                enabled: false,
                isBlocked: false,
                isPending: false,
                isGranted: false,
                reason: 'SERVICE_WORKER_NOT_SUPPORTED',
                message: 'Este navegador no soporta Service Workers requeridos para notificaciones Push.'
            };

        }

        const rawPermission = Notification.permission;

        // Caso: Concedido
        if (rawPermission === 'granted') {

            return {
                supported: true,
                permission: 'granted',
                state: 'granted',
                enabled: true,
                isBlocked: false,
                isPending: false,
                isGranted: true,
                reason: null,
                message: 'Las notificaciones del navegador están activadas y concedidas.'
            };

        }

        // Caso: Bloqueado
        if (rawPermission === 'denied') {

            return {
                supported: true,
                permission: 'denied',
                state: 'denied',
                enabled: false,
                isBlocked: true,
                isPending: false,
                isGranted: false,
                reason: 'PERMISSION_DENIED',
                message: 'Las notificaciones están bloqueadas en los ajustes de tu navegador.'
            };

        }

        // Caso: Pendiente de solicitar (default)
        return {
            supported: true,
            permission: 'default',
            state: 'default',
            enabled: false,
            isBlocked: false,
            isPending: true,
            isGranted: false,
            reason: 'PERMISSION_PENDING',
            message: 'Las notificaciones están pendientes de autorización por el usuario.'
        };

    },


    // ======================================================================
    // MONITORIZACIÓN DE CAMBIOS DE PERMISOS EN TIEMPO REAL
    // ======================================================================
    //
    // Detecta si el usuario cambia el permiso desde el candado o configuración
    // del navegador sin necesidad de recargar la página.
    // ======================================================================

    async watchPermissionChanges() {

        if (this.permissionWatcherActive) {
            return;
        }

        if (!('permissions' in navigator) || !navigator.permissions.query) {
            return;
        }

        try {

            const permissionStatus =
                await navigator.permissions.query({ name: 'notifications' });

            this.permissionWatcherActive = true;

            const handleStatusChange = () => {

                const currentStatus = this.getStatus();

                console.log(
                    '🔄 Permiso de notificaciones del navegador actualizado:',
                    currentStatus.permission
                );

                // Notificar a toda la aplicación para actualizar la UI
                window.dispatchEvent(
                    new CustomEvent('endure:notification-permission-changed', {
                        detail: currentStatus
                    })
                );

                // Si fue concedido externamente y no estaba preparado
                if (currentStatus.isGranted && !this.firebaseReady) {

                    this.preparePush().catch(err => {
                        console.warn('⚠️ No fue posible preparar PUSH tras cambio de permiso:', err);
                    });

                }

            };

            if (typeof permissionStatus.addEventListener === 'function') {
                permissionStatus.addEventListener('change', handleStatusChange);
            } else {
                permissionStatus.onchange = handleStatusChange;
            }

        } catch (error) {

            // Algunos navegadores no implementan query con 'notifications', ignorar silenciosamente
            console.debug('Permissions API query no soportada para notifications:', error);

        }

    },


    // ======================================================================
    // INICIALIZAR SERVICIO PUSH
    // ======================================================================

    async init(user) {

        console.log('🔔 Inicializando servicio de notificaciones de Endure...');

        this.currentUser = user || this.currentUser || null;

        // Comprobación de compatibilidad y estado actual
        const status = this.getStatus();

        this.initialized = true;

        // Activar observador de cambios en permisos del navegador
        this.watchPermissionChanges();

        if (!status.supported) {

            console.warn(
                `⚠️ Notificaciones no compatibles: ${status.message}`
            );

            return status;

        }

        // --------------------------------------------------------------
        // Caso: Ya concedido (granted)
        // --------------------------------------------------------------
        if (status.isGranted) {

            console.log(
                '✅ Permiso de notificaciones ya concedido previamente.'
            );

            try {

                await this.preparePush();

                console.log(
                    '🚀 Servicio PUSH preparado correctamente.'
                );

            } catch (error) {

                console.error(
                    '❌ Error preparando el servicio PUSH:',
                    error
                );

            }

            return status;

        }

        // --------------------------------------------------------------
        // Caso: Pendiente de activar (default)
        // --------------------------------------------------------------
        if (status.isPending) {

            console.log(
                '🔕 Notificaciones disponibles pero pendientes de activar por el usuario.'
            );

            return status;

        }

        // --------------------------------------------------------------
        // Caso: Bloqueado (denied)
        // --------------------------------------------------------------
        if (status.isBlocked) {

            console.warn(
                '🚫 Notificaciones bloqueadas en los ajustes del navegador.'
            );

            return status;

        }

        return status;

    },


    // ======================================================================
    // PREPARAR FIREBASE Y SERVICE WORKER
    // ======================================================================

    async preparePush() {

        if (this.firebaseReady) {
            return;
        }

        // --------------------------------------------------------------
        // Configuración
        // --------------------------------------------------------------
        if (!window.CONFIG || !CONFIG.FIREBASE) {

            throw new Error(
                'No existe CONFIG.FIREBASE en la configuración global.'
            );

        }

        const firebaseConfig = CONFIG.FIREBASE;

        // --------------------------------------------------------------
        // Cargar Firebase SDK (App y Messaging)
        // --------------------------------------------------------------
        if (!window.firebase || typeof window.firebase.messaging !== 'function') {

            await this.loadFirebaseSDK();

        }

        // --------------------------------------------------------------
        // Inicializar Firebase
        // --------------------------------------------------------------
        if (!window.firebase.apps.length) {

            window.firebase.initializeApp(firebaseConfig);

            console.log('🔥 Firebase inicializado correctamente.');

        } else {

            console.log('🔥 Firebase ya estaba inicializado.');

        }

        // --------------------------------------------------------------
        // Messaging
        // --------------------------------------------------------------
        this.messaging = window.firebase.messaging();

        console.log('📨 Firebase Cloud Messaging disponible.');

        // --------------------------------------------------------------
        // Service Worker (Unificado con PWA)
        // --------------------------------------------------------------
        this.registration =
            (await navigator.serviceWorker.getRegistration()) ||
            (await navigator.serviceWorker.register('./sw.js'));

        // Esperar a que el Service Worker esté activo
        await navigator.serviceWorker.ready;

        console.log(
            '⚙️ Firebase Service Worker registrado y activo:',
            this.registration
        );

        // --------------------------------------------------------------
        // Listener de primer plano
        // --------------------------------------------------------------
        this.setupForegroundMessageListener();

        this.firebaseReady = true;

    },


    // ======================================================================
    // ACTIVAR NOTIFICACIONES DEL NAVEGADOR (ENABLE PUSH)
    // ======================================================================
    //
    // Este método gestiona todos los flujos de activación:
    // 1. Si no está soportado -> lo detecta y aborta con razón clara.
    // 2. Si ya está bloqueado (denied) -> informa que el navegador bloqueó y
    //    guía al usuario (no se puede mostrar prompt si denied).
    // 3. Si está pendiente (default) -> solicita el permiso nativo con compatibilidad.
    // 4. Si el usuario acepta -> registra Service Worker, token FCM, backend y
    //    muestra una notificación de bienvenida nativa.
    // ======================================================================

    async enablePush() {

        // Auto-inicializar si aún no se había hecho
        if (!this.initialized) {
            await this.init(this.currentUser);
        }

        const currentStatus = this.getStatus();

        // --------------------------------------------------------------
        // 1. Comprobar soporte
        // --------------------------------------------------------------
        if (!currentStatus.supported) {

            console.warn(`❌ No se pueden activar: ${currentStatus.message}`);

            return {
                enabled: false,
                permission: currentStatus.permission,
                isBlocked: false,
                isPending: false,
                reason: currentStatus.reason,
                message: currentStatus.message
            };

        }

        // --------------------------------------------------------------
        // 2. Comprobar si ya están bloqueadas (denied)
        // --------------------------------------------------------------
        if (currentStatus.isBlocked) {

            console.warn(
                '🚫 Las notificaciones están bloqueadas en la configuración del navegador.'
            );

            return {
                enabled: false,
                permission: 'denied',
                isBlocked: true,
                isPending: false,
                reason: 'PERMISSION_DENIED',
                message: 'Las notificaciones están bloqueadas en tu navegador. Para activarlas, haz clic en el icono del candado junto a la URL y selecciona "Permitir".'
            };

        }

        // --------------------------------------------------------------
        // 3. Solicitar permiso al navegador (compatible con Promise y Callback)
        // --------------------------------------------------------------
        let permission = currentStatus.permission;

        if (permission !== 'granted') {

            try {

                if (typeof Notification.requestPermission === 'function') {

                    const result = Notification.requestPermission();

                    // Soporte para navegadores modernos (Promise) y legacy (Callback)
                    if (result && typeof result.then === 'function') {
                        permission = await result;
                    } else {
                        permission = await new Promise(resolve => {
                            Notification.requestPermission(resolve);
                        });
                    }

                }

            } catch (requestError) {

                console.error(
                    '❌ Error al invocar Notification.requestPermission:',
                    requestError
                );

                permission = Notification.permission || 'denied';

            }

        }

        console.log('🔐 Resultado de solicitud de permiso:', permission);

        // Notificar el nuevo estado a toda la aplicación
        const updatedStatus = this.getStatus();

        window.dispatchEvent(
            new CustomEvent('endure:notification-permission-changed', {
                detail: updatedStatus
            })
        );

        // --------------------------------------------------------------
        // 4. Evaluar respuesta del usuario
        // --------------------------------------------------------------

        // Caso: Usuario bloqueó en el diálogo nativo
        if (permission === 'denied') {

            console.warn('🚫 El usuario denegó el permiso de notificaciones.');

            return {
                enabled: false,
                permission: 'denied',
                isBlocked: true,
                isPending: false,
                reason: 'PERMISSION_DENIED_BY_USER',
                message: 'Has bloqueado las notificaciones. Puedes cambiarlas desde el candado de la barra de navegación.'
            };

        }

        // Caso: Diálogo cerrado o ignorado sin responder (permanece en default)
        if (permission === 'default') {

            console.log('🔕 La solicitud de notificaciones fue descartada o sigue pendiente.');

            return {
                enabled: false,
                permission: 'default',
                isBlocked: false,
                isPending: true,
                reason: 'PERMISSION_DISMISSED',
                message: 'La solicitud de notificaciones fue descartada o sigue pendiente.'
            };

        }

        // Caso: No concedido
        if (permission !== 'granted') {

            return {
                enabled: false,
                permission,
                isBlocked: permission === 'denied',
                isPending: permission === 'default',
                reason: 'PERMISSION_NOT_GRANTED',
                message: 'No se concedió el permiso para notificaciones.'
            };

        }

        // --------------------------------------------------------------
        // 5. Permiso concedido -> Preparar Firebase, FCM y Backend
        // --------------------------------------------------------------

        try {

            await this.preparePush();

            // Obtener token FCM
            let token = null;

            if (this.messaging && CONFIG.FIREBASE?.vapidKey) {

                try {

                    token = await this.messaging.getToken({
                        vapidKey: CONFIG.FIREBASE.vapidKey,
                        serviceWorkerRegistration: this.registration
                    });

                    console.log('🎫 Token FCM obtenido correctamente.');

                } catch (tokenError) {

                    console.warn(
                        '⚠️ No se pudo obtener el token FCM de Firebase:',
                        tokenError
                    );

                }

            }

            // Registrar dispositivo en el backend si hay token
            let device = null;

            if (token) {

                try {

                    device = await this.registerDeviceInBackend(token);

                    console.log('📡 Dispositivo registrado en el backend.');

                } catch (deviceError) {

                    console.warn(
                        '⚠️ No se pudo sincronizar el dispositivo con el backend:',
                        deviceError
                    );

                }

            }

            // ----------------------------------------------------------
            // 6. Activar y verificar notificación nativa en el navegador
            // ----------------------------------------------------------

            await this.showNotification('¡Notificaciones activadas!', {
                body: 'Recibirás avisos en tiempo real sobre tus pedidos y promociones de Endure.',
                icon: 'assets/ICONO_WEB.webp',
                tag: 'endure-welcome'
            });

            console.log('✅ Notificaciones del navegador activadas con éxito.');

            return {
                enabled: true,
                permission: 'granted',
                isBlocked: false,
                isPending: false,
                isGranted: true,
                tokenRegistered: !!device,
                token,
                device,
                message: 'Notificaciones activadas exitosamente.'
            };

        } catch (setupError) {

            console.error('❌ Error configurando Push tras otorgar permiso:', setupError);

            // Incluso si Firebase falla, las notificaciones locales del navegador ya están activas
            await this.showNotification('¡Notificaciones activadas!', {
                body: 'Las alertas del navegador de Endure están habilitadas.',
                icon: 'assets/ICONO_WEB.webp'
            });

            return {
                enabled: true,
                permission: 'granted',
                isGranted: true,
                isBlocked: false,
                isPending: false,
                warning: 'Permiso concedido pero ocurrió un problema secundario con el servidor de mensajería.',
                error: setupError.message
            };

        }

    },


    // ======================================================================
    // MOSTRAR NOTIFICACIÓN NATIVA EN EL NAVEGADOR
    // ======================================================================
    //
    // Permite disparar notificaciones del sistema operativo / navegador
    // usando Service Worker (PWA) o Notification API directa.
    // ======================================================================

    async showNotification(title, options = {}) {

        const status = this.getStatus();

        if (!status.isGranted) {

            console.warn(
                '⚠️ No se puede mostrar notificación: permiso no concedido.',
                status.permission
            );

            return null;

        }

        const notificationOptions = {
            icon: 'assets/ICONO_WEB.webp',
            badge: 'assets/ICONO_WEB.webp',
            ...options
        };

        // 1. Intentar mediante Service Worker Registration (estándar para PWA y Push)
        if (
            this.registration &&
            typeof this.registration.showNotification === 'function'
        ) {

            try {

                await this.registration.showNotification(
                    title,
                    notificationOptions
                );

                return true;

            } catch (swError) {

                console.warn(
                    '⚠️ Error mostrando notificación vía Service Worker, recurriendo a API directa:',
                    swError
                );

            }

        }

        // 2. Fallback: instanciar Notification directamente
        if ('Notification' in window) {

            try {

                const nativeNotification = new Notification(
                    title,
                    notificationOptions
                );

                return nativeNotification;

            } catch (notificationError) {

                console.error(
                    '❌ Error mostrando notificación con new Notification():',
                    notificationError
                );

            }

        }

        return null;

    },


    // ======================================================================
    // ESCUCHAR FCM EN PRIMER PLANO
    // ======================================================================

    setupForegroundMessageListener() {

        if (!this.messaging) {

            console.warn('⚠️ Firebase Messaging no está disponible.');

            return;

        }

        if (this.foregroundListenerRegistered) {
            return;
        }

        this.foregroundListenerRegistered = true;

        this.messaging.onMessage((payload) => {

            console.log('🔔 Nueva notificación FCM en primer plano:', payload);

            // 1. Comunicar al sistema interno de Endure (UI, badges, lista in-app)
            window.dispatchEvent(
                new CustomEvent('endure:notification', {
                    detail: payload
                })
            );

            // 2. Si las notificaciones del navegador están activadas,
            // mostrar también la notificación nativa para no pasarla por alto
            const title =
                payload.notification?.title ||
                payload.data?.title ||
                'Endure';

            const body =
                payload.notification?.body ||
                payload.data?.body ||
                'Tienes una nueva notificación.';

            const icon =
                payload.notification?.icon ||
                payload.data?.icon ||
                'assets/ICONO_WEB.webp';

            this.showNotification(title, {
                body,
                icon,
                data: payload.data || payload
            });

        });

        console.log('📡 Listener FCM de primer plano configurado.');

    },


    // ======================================================================
    // REGISTRAR DISPOSITIVO EN EL BACKEND
    // ======================================================================

    async registerDeviceInBackend(token) {

        if (
            !window.notificationsApi ||
            typeof window.notificationsApi.registerDevice !== 'function'
        ) {

            console.warn('⚠️ notificationsApi no disponible para registrar dispositivo.');

            return null;

        }

        const data = {
            fcmToken: token,
            installationId: null,
            deviceName: navigator.userAgentData?.platform || navigator.platform || 'Web',
            browser: navigator.userAgent,
            browserVersion: null,
            operatingSystem: navigator.userAgentData?.platform || navigator.platform || null,
            operatingSystemVersion: null,
            userAgent: navigator.userAgent || null,
            language: navigator.language || null,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null
        };

        console.log('📡 Registrando dispositivo PUSH en backend...');

        return await window.notificationsApi.registerDevice(data);

    },


    // ======================================================================
    // CARGAR FIREBASE SDK DINÁMICAMENTE
    // ======================================================================

    loadFirebaseSDK() {

        if (this._loadingFirebasePromise) {
            return this._loadingFirebasePromise;
        }

        this._loadingFirebasePromise = new Promise((resolve, reject) => {

            const appScript = document.createElement('script');
            const messagingScript = document.createElement('script');

            appScript.src =
                'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js';

            messagingScript.src =
                'https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js';

            appScript.onload = () => {
                document.head.appendChild(messagingScript);
            };

            messagingScript.onload = () => {
                resolve();
            };

            appScript.onerror = () => {
                this._loadingFirebasePromise = null;
                reject(new Error('No se pudo cargar Firebase App SDK.'));
            };

            messagingScript.onerror = () => {
                this._loadingFirebasePromise = null;
                reject(new Error('No se pudo cargar Firebase Messaging SDK.'));
            };

            document.head.appendChild(appScript);

        });

        return this._loadingFirebasePromise;

    }

};

// Alias para compatibilidad con referencias previas
window.notificationsModule = window.endureNotifications;
