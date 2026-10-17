// ==========================================================================
// ROUTER.JS — Sistema de enrutamiento para GitHub Pages SPA
// ==========================================================================
// GitHub Pages no soporta reescritura de URLs del lado del servidor.
// Este router trabaja en conjunto con 404.html para manejar rutas
// como /producto/{slug}:
//
// 1. El usuario navega a /producto/{slug}
// 2. GitHub Pages no encuentra el archivo → sirve 404.html
// 3. 404.html guarda la ruta en sessionStorage y redirige a /
// 4. index.html carga y este router lee el sessionStorage
// 5. El router redirige internamente a la página correcta
//
// Para la página de producto dedicada, el flujo alternativo es:
// - Si el servidor soporta reescritura (ej: Netlify, Vercel),
//   servir directamente product.html cuando la ruta es /producto/*
// ==========================================================================

(function () {

    'use strict';

    // ======================================================================
    // CONFIGURACIÓN DE RUTAS
    // ======================================================================

    const ROUTES = {

        // Página de producto dedicada
        product: {
            pattern: /^\/producto\/([^/]+)\/?$/,
            page: '/product.html',
            extractParams: function (match) {
                return { slug: decodeURIComponent(match[1]) };
            }
        }

        // Aquí se pueden agregar más rutas en el futuro:
        // collection: {
        //     pattern: /^\/coleccion\/([^/]+)\/?$/,
        //     page: '/collection.html',
        //     extractParams: function(match) {
        //         return { slug: decodeURIComponent(match[1]) };
        //     }
        // }
    };


    // ======================================================================
    // VERIFICAR SI HAY UNA RUTA GUARDADA POR 404.html
    // ======================================================================

    function checkSavedRoute() {

        const savedPath = sessionStorage.getItem('spa-redirect-path');

        if (!savedPath) return null;

        // Limpiar el sessionStorage inmediatamente
        sessionStorage.removeItem('spa-redirect-path');

        return savedPath;
    }


    // ======================================================================
    // RESOLVER RUTA — Encontrar la ruta que coincida
    // ======================================================================

    function resolveRoute(path) {

        // Separar path y query string
        const [pathname, queryString] = path.split('?');

        for (const [routeName, route] of Object.entries(ROUTES)) {

            const match = pathname.match(route.pattern);

            if (match) {
                return {
                    name: routeName,
                    page: route.page,
                    params: route.extractParams(match),
                    query: queryString || ''
                };
            }
        }

        return null;
    }


    // ======================================================================
    // NAVEGAR A LA PÁGINA CORRECTA
    // ======================================================================

    function navigateToRoute(route) {

        // Construir la URL destino con los parámetros como query string
        // para que la página dedicada los pueda leer
        let targetUrl = route.page;

        // Preservar el path original en la URL para que la página de producto
        // pueda extraer el slug directamente del pathname
        const originalPath = window.location.pathname;

        // Si ya estamos en la página correcta, no redirigir
        if (window.location.pathname === route.page) return;

        // Para la página de producto, queremos que la URL se mantenga
        // como /producto/{slug}, así que usamos history.replaceState
        // solo si estamos en la raíz (viniendo de un redirect del 404.html)
        if (window.location.pathname === '/' || window.location.pathname === '/index.html') {

            // Redirigir a la página dedicada preservando el slug en la URL
            const slug = route.params.slug;
            const productPageUrl = `/producto/${slug}`;

            // Usar la página de producto con el path original
            window.location.replace(
                route.page + '?slug=' + encodeURIComponent(slug)
            );
        }
    }


    // ======================================================================
    // INIT — Ejecutar en cada carga de página
    // ======================================================================

    function initRouter() {

        // 1. Verificar si hay una ruta guardada por el 404.html
        const savedPath = checkSavedRoute();

        if (savedPath) {

            const route = resolveRoute(savedPath);

            if (route) {
                console.log('🔀 [Router] Redirigiendo a:', route.name, route.params);
                navigateToRoute(route);
                return; // Detener ejecución, la página se va a recargar
            }

            // Si no se encontró una ruta válida, la ruta guardada era inválida
            console.warn('⚠️ [Router] Ruta guardada no reconocida:', savedPath);
        }

        // 2. Verificar si la URL actual coincide con alguna ruta
        //    (para cuando el servidor soporta reescritura directa)
        const currentRoute = resolveRoute(window.location.pathname);

        if (currentRoute) {
            console.log('📍 [Router] Ruta actual detectada:', currentRoute.name);

            // Si estamos en index.html pero la ruta es de producto,
            // abrir el modal de producto (comportamiento SPA existente)
            if (
                currentRoute.name === 'product' &&
                (window.location.pathname === '/' ||
                    window.location.pathname === '/index.html')
            ) {
                // El app.js ya maneja esto con openProductModalBySlug
                return;
            }
        }
    }


    // ======================================================================
    // UTILIDAD PÚBLICA: Generar URL de producto
    // ======================================================================

    /**
     * Genera la URL SEO-friendly para un producto.
     * Usar en lugar de construir la URL manualmente.
     *
     * @param {Object} product - Objeto del producto con slug o name
     * @returns {string} URL absoluta del producto
     */
    function getProductURL(product) {

        const slug = product.slug || generateSlugFromName(product.name);
        return `/producto/${slug}`;
    }

    function generateSlugFromName(text) {

        return String(text)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }


    // ======================================================================
    // INTERCEPTAR CLICS EN ENLACES DE PRODUCTO
    // ======================================================================
    // Mantiene las URLs limpias en el HTML para SEO de Google (/producto/{slug}),
    // y en el navegador redirige directamente a /product.html?slug=...
    // ======================================================================

    function setupLinkInterception() {

        document.addEventListener('click', function (e) {

            const anchor = e.target.closest('a');
            if (!anchor) return;

            if (
                anchor.target === '_blank' ||
                anchor.hasAttribute('download') ||
                e.ctrlKey || e.metaKey || e.shiftKey || e.altKey
            ) {
                return;
            }

            const href = anchor.getAttribute('href');
            if (!href) return;

            const match = href.match(/^\/(?:producto|product)\/([^/?#]+)/i);
            if (match) {
                e.preventDefault();
                const slug = match[1];
                window.location.href = `/product.html?slug=${encodeURIComponent(slug)}`;
            }
        });
    }


    // ======================================================================
    // EXPORTAR
    // ======================================================================

    window.appRouter = {
        init: initRouter,
        getProductURL: getProductURL,
        resolveRoute: resolveRoute,
        generateSlug: generateSlugFromName,
        setupLinkInterception: setupLinkInterception
    };


    // ======================================================================
    // AUTO-INIT
    // ======================================================================

    initRouter();
    setupLinkInterception();

})();
