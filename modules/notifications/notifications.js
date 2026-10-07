// ==========================================================================
// ENDURE - PUSH NOTIFICATIONS
// Firebase Cloud Messaging
// ==========================================================================
//
// Responsabilidades:
//
// - Inicializar Firebase Messaging.
// - Consultar el estado del permiso PUSH.
// - Solicitar permiso cuando appNotifications lo indique.
// - Obtener el token FCM.
// - Registrar el dispositivo en el backend.
// - Escuchar mensajes FCM en primer plano.
// - Comunicar nuevas notificaciones al sistema interno de Endure.
//
// Este módulo NO contiene:
//
// - UI.
// - Botones.
// - DOM del centro de notificaciones.
// - Lógica de notificaciones IN_APP.
// - Restricciones por rol.
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


    // ======================================================================
    // INICIALIZAR SERVICIO PUSH
    // ======================================================================

    async init(user) {

        console.log(
            '🔔 Inicializando servicio PUSH de Endure...'
        );

        this.currentUser = user || null;

        // --------------------------------------------------------------
        // Debe existir un usuario autenticado
        // --------------------------------------------------------------

        if (!this.currentUser) {

            console.log(
                '👤 No hay usuario autenticado. PUSH omitido.'
            );

            return;
        }


        // --------------------------------------------------------------
        // Compatibilidad del navegador
        // --------------------------------------------------------------

        if (!('Notification' in window)) {

            console.warn(
                '⚠️ Este navegador no soporta notificaciones.'
            );

            return;
        }


        if (!('serviceWorker' in navigator)) {

            console.warn(
                '⚠️ Este navegador no soporta Service Worker.'
            );

            return;
        }


        this.initialized = true;


        // --------------------------------------------------------------
        // Si el usuario ya concedió permiso anteriormente,
        // podemos preparar FCM sin volver a preguntar.
        // --------------------------------------------------------------

        if (Notification.permission === 'granted') {

            try {

                await this.preparePush();

                console.log(
                    '✅ Servicio PUSH preparado.'
                );

            } catch (error) {

                console.error(
                    '❌ No fue posible preparar PUSH:',
                    error
                );
            }

            return;
        }


        // --------------------------------------------------------------
        // default = todavía no decidió
        // denied  = bloqueado
        //
        // En ambos casos NO solicitamos permiso automáticamente.
        // appNotifications lo hará cuando el usuario pulse "Activar".
        // --------------------------------------------------------------

        if (Notification.permission === 'default') {

            console.log(
                '🔕 PUSH disponible pero todavía no autorizado.'
            );

            return;
        }


        if (Notification.permission === 'denied') {

            console.log(
                '🚫 PUSH bloqueado por el navegador.'
            );

            return;
        }
    },


    // ======================================================================
    // PREPARAR FIREBASE
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
                'No existe CONFIG.FIREBASE.'
            );
        }


        const firebaseConfig =
            CONFIG.FIREBASE;


        // --------------------------------------------------------------
        // Cargar Firebase SDK
        // --------------------------------------------------------------

        if (!window.firebase) {

            await this.loadFirebaseSDK();
        }


        // --------------------------------------------------------------
        // Inicializar Firebase
        // --------------------------------------------------------------

        if (!firebase.apps.length) {

            firebase.initializeApp(
                firebaseConfig
            );

            console.log(
                '🔥 Firebase inicializado correctamente.'
            );

        } else {

            console.log(
                '🔥 Firebase ya estaba inicializado.'
            );
        }


        // --------------------------------------------------------------
        // Messaging
        // --------------------------------------------------------------

        this.messaging =
            firebase.messaging();

        console.log(
            '📨 Firebase Cloud Messaging disponible.'
        );


        // --------------------------------------------------------------
        // Service Worker
        // --------------------------------------------------------------

        this.registration =
            await navigator.serviceWorker.register(
                './firebase-messaging-sw.js'
            );

        console.log(
            '⚙️ Firebase Service Worker registrado:',
            this.registration
        );


        // --------------------------------------------------------------
        // Listener de primer plano
        // --------------------------------------------------------------

        this.setupForegroundMessageListener();


        this.firebaseReady = true;
    },


    // ======================================================================
    // ACTIVAR PUSH
    // ======================================================================

    async enablePush() {

        if (!this.initialized) {

            throw new Error(
                'El servicio PUSH no está inicializado.'
            );
        }


        // --------------------------------------------------------------
        // Verificar soporte
        // --------------------------------------------------------------

        if (!('Notification' in window)) {

            throw new Error(
                'Este navegador no soporta notificaciones.'
            );
        }


        if (!('serviceWorker' in navigator)) {

            throw new Error(
                'Este navegador no soporta Service Worker.'
            );
        }


        // --------------------------------------------------------------
        // Ya bloqueado
        // --------------------------------------------------------------

        if (Notification.permission === 'denied') {

            return {
                enabled: false,
                permission: 'denied',
                reason: 'PERMISSION_DENIED'
            };
        }


        // --------------------------------------------------------------
        // Solicitar permiso
        // --------------------------------------------------------------

        let permission =
            Notification.permission;


        if (permission !== 'granted') {

            permission =
                await Notification.requestPermission();
        }


        console.log(
            '🔐 Permiso PUSH:',
            permission
        );


        if (permission !== 'granted') {

            return {
                enabled: false,
                permission,
                reason: 'PERMISSION_NOT_GRANTED'
            };
        }


        // --------------------------------------------------------------
        // Preparar Firebase
        // --------------------------------------------------------------

        await this.preparePush();


        // --------------------------------------------------------------
        // Obtener token FCM
        // --------------------------------------------------------------

        const token =
            await this.messaging.getToken({
                vapidKey:
                    CONFIG.FIREBASE.vapidKey,

                serviceWorkerRegistration:
                    this.registration
            });


        if (!token) {

            throw new Error(
                'Firebase no devolvió un token FCM.'
            );
        }


        console.log(
            '🎫 Token FCM obtenido correctamente.'
        );


        // --------------------------------------------------------------
        // Registrar dispositivo
        // --------------------------------------------------------------

        const device =
            await this.registerDeviceInBackend(
                token
            );


        console.log(
            '✅ PUSH activado correctamente.'
        );


        return {
            enabled: true,
            permission: 'granted',
            tokenRegistered: true,
            device
        };
    },


    // ======================================================================
    // ESTADO DEL PUSH
    // ======================================================================

    getStatus() {

        if (!('Notification' in window)) {

            return {
                supported: false,
                permission: 'unsupported',
                enabled: false
            };
        }


        const permission =
            Notification.permission;


        return {
            supported: true,
            permission,
            enabled:
                permission === 'granted'
        };
    },


    // ======================================================================
    // ESCUCHAR FCM EN PRIMER PLANO
    // ======================================================================

    setupForegroundMessageListener() {

        if (!this.messaging) {

            console.warn(
                '⚠️ Firebase Messaging no está disponible.'
            );

            return;
        }


        if (this.foregroundListenerRegistered) {
            return;
        }


        this.foregroundListenerRegistered =
            true;


        this.messaging.onMessage(
            (payload) => {

                console.log(
                    '🔔 Nueva notificación FCM en primer plano:',
                    payload
                );


                window.dispatchEvent(
                    new CustomEvent(
                        'endure:notification',
                        {
                            detail: payload
                        }
                    )
                );
            }
        );


        console.log(
            '📡 Listener FCM de primer plano configurado.'
        );
    },


    // ======================================================================
    // REGISTRAR DISPOSITIVO
    // ======================================================================

    async registerDeviceInBackend(token) {

        if (
            !window.notificationsApi ||
            typeof notificationsApi.registerDevice !== 'function'
        ) {

            throw new Error(
                'Notifications API no está disponible.'
            );
        }


        const data = {

            fcmToken: token,

            installationId: null,

            deviceName:
                navigator.platform ||
                'Web',

            browser:
                navigator.userAgent,

            browserVersion:
                null,

            operatingSystem:
                navigator.platform ||
                null,

            operatingSystemVersion:
                null,

            userAgent:
                navigator.userAgent ||
                null,

            language:
                navigator.language ||
                null,

            timezone:
                Intl.DateTimeFormat()
                    .resolvedOptions()
                    .timeZone ||
                null
        };


        console.log(
            '📡 Registrando dispositivo PUSH en backend...'
        );


        return await notificationsApi.registerDevice(
            data
        );
    },


    // ======================================================================
    // CARGAR FIREBASE SDK
    // ======================================================================

    loadFirebaseSDK() {

        return new Promise(
            (resolve, reject) => {

                const appScript =
                    document.createElement(
                        'script'
                    );

                const messagingScript =
                    document.createElement(
                        'script'
                    );


                appScript.src =
                    'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js';


                messagingScript.src =
                    'https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js';


                appScript.onload = () => {

                    document.head.appendChild(
                        messagingScript
                    );
                };


                messagingScript.onload = () => {

                    resolve();
                };


                appScript.onerror = () => {

                    reject(
                        new Error(
                            'No se pudo cargar Firebase App SDK.'
                        )
                    );
                };


                messagingScript.onerror = () => {

                    reject(
                        new Error(
                            'No se pudo cargar Firebase Messaging SDK.'
                        )
                    );
                };


                document.head.appendChild(
                    appScript
                );
            }
        );
    }

};