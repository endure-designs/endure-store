// ==========================================================================
// ENDURE - PROGRESSIVE WEB APP SERVICE WORKER
// Version: 1.0.0
// Strategies:
//   - Navigation: Network-First (Online-First) with Cache & Offline Fallback
//   - CSS, JS, Fonts: Stale-While-Revalidate
//   - Static Images: Cache-First with Network Fallback
//   - API, Auth, Checkout, Culqi: Strictly Bypassed (Never Cached)
// ==========================================================================

const CACHE_VERSION = 'endure-pwa-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGES_CACHE = `${CACHE_VERSION}-pages`;
const IMAGES_CACHE = `${CACHE_VERSION}-images`;

// Recursos estáticos esenciales para arranque inmediato y modo offline
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/offline.html',
    '/manifest.webmanifest',
    '/styles.css',
    '/pwa.css',
    '/pwa.js',
    '/assets/ENDURE_LOGO.png',
    '/assets/ICONO_WEB.webp',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png',
    '/assets/icons/icon-maskable-192x192.png',
    '/assets/icons/icon-maskable-512x512.png',
    '/assets/icons/apple-touch-icon.png',
    '/assets/icons/favicon-32x32.png',
    '/assets/icons/favicon-16x16.png'
];

// Dominios y rutas dinámicas que JAMÁS deben ser cacheadas
const BYPASS_DOMAINS = [
    'api.endure.com.pe',
    '3ds.culqi.com',
    'js.culqi.com',
    'api.culqi.com',
    'nominatim.openstreetmap.org',
    'tile.openstreetmap.org'
];

const BYPASS_PATHS = [
    '/api/',
    '/auth/',
    '/cart/',
    '/orders/',
    '/checkout/',
    '/notifications/',
    '/cdn-cgi/'
];


// ==========================================================================
// 1. INSTALACIÓN
// ==========================================================================

self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Endure PWA Service Worker...', CACHE_VERSION);

    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[SW] Pre-cacheando recursos esenciales...');
            // Precarga tolerante a fallos individuales
            return Promise.allSettled(
                PRECACHE_ASSETS.map((url) =>
                    cache.add(new Request(url, { cache: 'reload' })).catch((err) => {
                        console.warn(`[SW] No se pudo pre-cachear: ${url}`, err.message);
                    })
                )
            );
        })
    );
});


// ==========================================================================
// 2. ACTIVACIÓN Y LIMPIEZA DE CACHÉS ANTIGUOS
// ==========================================================================

self.addEventListener('activate', (event) => {
    console.log('[SW] Activando Endure PWA Service Worker...', CACHE_VERSION);

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Si el caché pertenece a endure pero no coincide con la versión actual
                    if (cacheName.startsWith('endure-pwa-') &&
                        cacheName !== STATIC_CACHE &&
                        cacheName !== PAGES_CACHE &&
                        cacheName !== IMAGES_CACHE) {
                        console.log('[SW] Eliminando caché antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Tomar control inmediato de todas las pestañas abiertas
            return self.clients.claim();
        })
    );
});


// ==========================================================================
// 3. INTERCEPTACIÓN DE PETICIONES (FETCH)
// ==========================================================================

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 1. Filtrar solo peticiones HTTP/HTTPS con método GET
    if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
        return;
    }

    // 2. Comprobar si coincide con dominios o rutas excluidas
    const shouldBypass =
        BYPASS_DOMAINS.some(domain => url.hostname.includes(domain)) ||
        BYPASS_PATHS.some(path => url.pathname.startsWith(path)) ||
        request.headers.get('accept')?.includes('text/event-stream');

    if (shouldBypass) {
        // Petición directa a red sin pasar por caché
        return;
    }

    // ======================================================================
    // ESTRATEGIA A: NAVEGACIÓN (Páginas HTML) — Network-First (Online-First)
    // ======================================================================
    if (request.mode === 'navigate') {
        event.respondWith(handleNavigationRequest(request));
        return;
    }

    // ======================================================================
    // ESTRATEGIA B: IMÁGENES ESTÁTICAS — Cache-First con fallback a red
    // ======================================================================
    const isImage =
        request.destination === 'image' ||
        /\.(webp|png|jpg|jpeg|svg|ico|gif)$/i.test(url.pathname);

    if (isImage) {
        event.respondWith(handleImageRequest(request));
        return;
    }

    // ======================================================================
    // ESTRATEGIA C: CSS, JS, FUENTES — Stale-While-Revalidate
    // ======================================================================
    const isStaticAsset =
        request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'font' ||
        /\.(css|js|woff2|woff|ttf|eot)$/i.test(url.pathname);

    if (isStaticAsset) {
        event.respondWith(handleStaticAssetRequest(request));
        return;
    }

    // Comportamiento predeterminado para otros recursos estáticos
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            return cachedResponse || fetch(request);
        })
    );
});


// ==========================================================================
// MANEJADORES DE ESTRATEGIAS DE CACHÉ
// ==========================================================================

/**
 * Estrategia Online-First para navegación HTML:
 * Intenta red primero; si hay éxito, actualiza caché de páginas.
 * Si falla la red (offline), intenta caché. Si no existe, sirve offline.html.
 */
async function handleNavigationRequest(request) {
    try {
        const networkResponse = await fetch(request);

        // Si la respuesta es válida, clonar y guardar en caché de páginas
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(PAGES_CACHE);
            cache.put(request, networkResponse.clone()).catch(() => {});
        }

        return networkResponse;
    } catch (networkError) {
        console.log('[SW] Navegación sin conexión. Intentando caché para:', request.url);

        // Intentar responder con la versión en caché de la página
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Si no está en caché la página solicitada, responder con offline.html
        const offlinePage = await caches.match('/offline.html');
        if (offlinePage) {
            return offlinePage;
        }

        // Fallback genérico si ni offline.html estuviese listo
        return new Response('Sin conexión a Internet', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
    }
}

/**
 * Estrategia Stale-While-Revalidate para CSS, JS y Fuentes:
 * Devuelve la versión en caché de inmediato mientras actualiza en segundo plano.
 */
async function handleStaticAssetRequest(request) {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone()).catch(() => {});
        }
        return networkResponse;
    }).catch((err) => {
        // En caso de estar offline y no tener caché
        return cachedResponse || Promise.reject(err);
    });

    return cachedResponse || fetchPromise;
}

/**
 * Estrategia Cache-First para Imágenes estáticas
 */
async function handleImageRequest(request) {
    const cache = await caches.open(IMAGES_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone()).catch(() => {});
        }
        return networkResponse;
    } catch (error) {
        // Imagen no disponible offline
        return cachedResponse || Promise.reject(error);
    }
}


// ==========================================================================
// 4. GESTIÓN DE MENSAJES (skipWaiting / actualizaciones)
// ==========================================================================

self.addEventListener('message', (event) => {
    if (!event.data) return;

    if (event.data.action === 'skipWaiting') {
        console.log('[SW] Forzando activación de nueva versión...');
        self.skipWaiting();
    }

    if (event.data.action === 'cleanCaches') {
        caches.keys().then((names) => {
            names.forEach(name => caches.delete(name));
        });
    }
});


// ==========================================================================
// 5. INTEGRACIÓN PUSH DE FIREBASE CLOUD MESSAGING (SEGUNDO PLANO)
// ==========================================================================

try {
    importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

    firebase.initializeApp({
        apiKey: 'AIzaSyCL38pSXCFXFBaRM7V8uEcwIAL9gKjswxw',
        authDomain: 'endure-67eae.firebaseapp.com',
        projectId: 'endure-67eae',
        storageBucket: 'endure-67eae.firebasestorage.app',
        messagingSenderId: '428868038597',
        appId: '1:428868038597:web:e2294c8b0c3862929425ac'
    });

    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        console.log('[SW] Push FCM recibido en segundo plano:', payload);

        const title =
            payload.notification?.title ||
            payload.data?.title ||
            'Endure';

        const options = {
            body:
                payload.notification?.body ||
                payload.data?.body ||
                'Tienes una nueva notificación de Endure.',
            icon: '/assets/icons/icon-192x192.png',
            badge: '/assets/icons/icon-192x192.png',
            data: payload.data || payload,
            vibrate: [100, 50, 100]
        };

        self.registration.showNotification(title, options);
    });
} catch (fcmError) {
    console.debug('[SW] Firebase messaging no inicializado en SW:', fcmError.message);
}

