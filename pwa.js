// ==========================================================================
// ENDURE - PROGRESSIVE WEB APP CLIENT MANAGER
// Registration, Update Detection, and Native Install Experience
// ==========================================================================

(function () {
    'use strict';

    // Estado del gestor PWA
    const state = {
        swRegistration: null,
        deferredPrompt: null,
        isStandalone: false,
        isIos: false,
        updateWaiting: false
    };

    // Claves de almacenamiento local para cooldowns no invasivos
    const STORAGE_KEY_DISMISSED = 'endure_pwa_install_dismissed';
    const STORAGE_KEY_IOS_DISMISSED = 'endure_pwa_ios_dismissed';
    const STORAGE_KEY_INSTALLED = 'endure_pwa_installed';
    const COOLDOWN_DAYS = 7;
    const IOS_COOLDOWN_DAYS = 14;


    // ======================================================================
    // 1. DETECCIÓN DE ENTORNO
    // ======================================================================

    function detectEnvironment() {
        // Modo standalone (ya instalada y abierta como app)
        state.isStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            window.matchMedia('(display-mode: fullscreen)').matches ||
            window.matchMedia('(display-mode: minimal-ui)').matches ||
            window.navigator.standalone === true ||
            document.referrer.includes('android-app://');

        if (state.isStandalone) {
            document.documentElement.classList.add('is-standalone');
            localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
            console.log('📱 [PWA] Endure ejecutándose en modo standalone.');
        }

        // Detección de iOS (iPhone / iPad / iPod en Safari)
        const ua = navigator.userAgent;
        const isAppleMobile = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
        const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(ua);

        state.isIos = isAppleMobile && isSafari;
    }


    // ======================================================================
    // 2. REGISTRO DEL SERVICE WORKER Y GESTIÓN DE ACTUALIZACIONES
    // ======================================================================

    async function registerServiceWorker() {
        if (!('serviceWorker' in navigator) || !window.isSecureContext) {
            console.log('ℹ️ [PWA] Service Worker no disponible en este entorno.');
            return;
        }

        try {
            const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
            state.swRegistration = reg;
            console.log('✅ [PWA] Service Worker registrado con éxito (scope: /).');

            // Escuchar si hay una actualización encontrada
            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                if (!newWorker) return;

                newWorker.addEventListener('statechange', () => {
                    // Si el nuevo worker terminó de instalarse y ya hay un controlador activo
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        state.updateWaiting = true;
                        showUpdateNotification(newWorker);
                    }
                });
            });

            // Verificar periódicamente actualizaciones cada hora
            setInterval(() => {
                reg.update().catch(() => {});
            }, 60 * 60 * 1000);

        } catch (error) {
            console.warn('⚠️ [PWA] Fallo al registrar Service Worker:', error);
        }

        // Recargar suavemente si el usuario acepta una nueva versión
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });
    }

    /**
     * Muestra una notificación discreta cuando hay una nueva versión disponible
     */
    function showUpdateNotification(worker) {
        // No interrumpir si el usuario está en checkout o llenando formularios
        const isCheckoutOpen = document.getElementById('checkoutModal')?.classList.contains('active');
        if (isCheckoutOpen) return;

        const toast = document.createElement('div');
        toast.className = 'pwa-update-toast';
        toast.innerHTML = `
            <span>✨ Nueva versión de Endure disponible</span>
            <button id="pwaUpdateBtn" type="button">Actualizar</button>
        `;
        document.body.appendChild(toast);

        // Animar entrada
        requestAnimationFrame(() => {
            toast.classList.add('pwa-visible');
        });

        const updateBtn = toast.querySelector('#pwaUpdateBtn');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => {
                worker.postMessage({ action: 'skipWaiting' });
                toast.classList.remove('pwa-visible');
                setTimeout(() => toast.remove(), 400);
            });
        }
    }


    // ======================================================================
    // 3. EXPERIENCIA DE INSTALACIÓN (Android & Desktop)
    // ======================================================================

    function setupInstallPrompt() {
        if (state.isStandalone) {
            return;
        }

        // Delegación de clics para cualquier elemento con atributo data-pwa-install o id pwaMenuInstallBtn
        document.addEventListener('click', (event) => {
            const trigger = event.target.closest('[data-pwa-install], #pwaMenuInstallBtn');
            if (trigger) {
                event.preventDefault();
                window.endurePWA.install();
            }
        });

        // Capturar el evento beforeinstallprompt nativo
        window.addEventListener('beforeinstallprompt', (event) => {
            // Prevenir la barra nativa invasiva automática
            event.preventDefault();
            state.deferredPrompt = event;
            console.log('📲 [PWA] Evento beforeinstallprompt capturado.');

            // Mostrar botones de instalación integrados en el menú si existen
            const menuBtns = document.querySelectorAll('[data-pwa-install], #pwaMenuInstallBtn');
            menuBtns.forEach(btn => {
                btn.style.display = '';
            });

            // Comprobar si el usuario descartó recientemente la sugerencia flotante
            if (isCooldownActive(STORAGE_KEY_DISMISSED, COOLDOWN_DAYS)) {
                console.log('⏳ [PWA] Banner de instalación omitido por cooldown.');
                return;
            }

            // Mostrar el banner integrado tras 3.5 segundos de navegación tranquila
            setTimeout(() => {
                showInstallBanner();
            }, 3500);
        });

        // Escuchar cuando la app ha sido instalada con éxito
        window.addEventListener('appinstalled', () => {
            console.log('🎉 [PWA] ¡Endure ha sido instalada exitosamente!');
            state.deferredPrompt = null;
            localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
            hideInstallBanner();

            const menuBtns = document.querySelectorAll('[data-pwa-install], #pwaMenuInstallBtn');
            menuBtns.forEach(btn => {
                btn.style.display = 'none';
            });
        });
    }

    /**
     * Inyecta y muestra el banner de instalación adaptado al diseño de Endure
     */
    function showInstallBanner() {
        if (state.isStandalone || !state.deferredPrompt) return;
        if (document.getElementById('pwaInstallBanner')) return;

        const banner = document.createElement('aside');
        banner.id = 'pwaInstallBanner';
        banner.className = 'pwa-install-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Instalar aplicación');
        banner.innerHTML = `
            <div class="pwa-banner-icon">
                <img src="/assets/icons/icon-192x192.png" alt="Endure Logo">
            </div>
            <div class="pwa-banner-content">
                <h4 class="pwa-banner-title">Instala la App de Endure</h4>
                <p class="pwa-banner-desc">Acceso rápido y mejor experiencia</p>
            </div>
            <div class="pwa-banner-actions">
                <button id="pwaInstallActionBtn" class="pwa-btn-install" type="button">Instalar</button>
                <button id="pwaDismissActionBtn" class="pwa-btn-close" type="button" aria-label="Cerrar">&times;</button>
            </div>
        `;

        document.body.appendChild(banner);

        // Animar entrada
        requestAnimationFrame(() => {
            banner.classList.add('pwa-visible');
        });

        // Manejar clic en "Instalar"
        const installBtn = banner.querySelector('#pwaInstallActionBtn');
        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                if (!state.deferredPrompt) return;

                hideInstallBanner();
                state.deferredPrompt.prompt();

                const { outcome } = await state.deferredPrompt.userChoice;
                console.log(`[PWA] Elección del usuario: ${outcome}`);

                if (outcome === 'accepted') {
                    localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
                } else {
                    setCooldown(STORAGE_KEY_DISMISSED);
                }

                state.deferredPrompt = null;
            });
        }

        // Manejar clic en "Cerrar" (X)
        const dismissBtn = banner.querySelector('#pwaDismissActionBtn');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                hideInstallBanner();
                setCooldown(STORAGE_KEY_DISMISSED);
            });
        }
    }

    function hideInstallBanner() {
        const banner = document.getElementById('pwaInstallBanner');
        if (banner) {
            banner.classList.remove('pwa-visible');
            setTimeout(() => banner.remove(), 400);
        }
    }


    // ======================================================================
    // 4. GUÍA DE INSTALACIÓN PARA iOS SAFARI
    // ======================================================================

    function setupIosInstructions() {
        if (!state.isIos || state.isStandalone) return;
        if (isCooldownActive(STORAGE_KEY_IOS_DISMISSED, IOS_COOLDOWN_DAYS)) return;

        // Mostrar solo tras 6 segundos de navegación en iOS
        setTimeout(() => {
            showIosModal();
        }, 6000);
    }

    function showIosModal() {
        if (state.isStandalone || document.getElementById('pwaIosOverlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'pwaIosOverlay';
        overlay.className = 'pwa-ios-modal-overlay';
        overlay.innerHTML = `
            <div class="pwa-ios-modal" role="dialog" aria-modal="true" aria-label="Instalar en iOS">
                <div class="pwa-ios-header">
                    <img src="/assets/icons/apple-touch-icon.png" alt="Endure Logo">
                    <div>
                        <h3>Instala Endure en tu iPhone</h3>
                    </div>
                </div>
                <ul class="pwa-ios-steps">
                    <li class="pwa-ios-step">
                        <span class="pwa-ios-step-num">1</span>
                        <span>Pulsa el botón <strong>Compartir</strong> <i class="fa-solid fa-arrow-up-from-bracket pwa-ios-icon"></i> en la barra inferior de Safari.</span>
                    </li>
                    <li class="pwa-ios-step">
                        <span class="pwa-ios-step-num">2</span>
                        <span>Desplázate hacia abajo y selecciona <strong>"Agregar al inicio"</strong> <i class="fa-regular fa-square-plus pwa-ios-icon"></i>.</span>
                    </li>
                </ul>
                <button id="pwaIosCloseBtn" class="pwa-ios-btn-close" type="button">Entendido</button>
            </div>
        `;

        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.classList.add('pwa-visible');
        });

        const closeBtn = overlay.querySelector('#pwaIosCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                overlay.classList.remove('pwa-visible');
                setCooldown(STORAGE_KEY_IOS_DISMISSED);
                setTimeout(() => overlay.remove(), 400);
            });
        }

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('pwa-visible');
                setCooldown(STORAGE_KEY_IOS_DISMISSED);
                setTimeout(() => overlay.remove(), 400);
            }
        });
    }


    // ======================================================================
    // 5. UTILIDADES DE COOLDOWN (NO INVASIVO)
    // ======================================================================

    function isCooldownActive(storageKey, days) {
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return false;
            const timestamp = parseInt(raw, 10);
            if (isNaN(timestamp)) return false;
            const now = Date.now();
            const elapsedDays = (now - timestamp) / (1000 * 60 * 60 * 24);
            return elapsedDays < days;
        } catch {
            return false;
        }
    }

    function setCooldown(storageKey) {
        try {
            localStorage.setItem(storageKey, Date.now().toString());
        } catch {}
    }


    // ======================================================================
    // 6. API GLOBAL PWA (Para integración opcional en botones del menú)
    // ======================================================================

    window.endurePWA = {
        isStandalone: () => state.isStandalone,
        canInstall: () => !!state.deferredPrompt,
        install: async () => {
            if (state.deferredPrompt) {
                state.deferredPrompt.prompt();
                const { outcome } = await state.deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
                }
                state.deferredPrompt = null;
                hideInstallBanner();
                return outcome;
            } else if (state.isIos) {
                showIosModal();
                return 'ios_guide_shown';
            }
            return 'not_available';
        },
        checkForUpdates: () => {
            if (state.swRegistration) {
                state.swRegistration.update();
            }
        }
    };


    // ======================================================================
    // 7. INICIALIZACIÓN
    // ======================================================================

    detectEnvironment();
    setupInstallPrompt();
    setupIosInstructions();

    // Registrar Service Worker al cargar la ventana
    if (document.readyState === 'complete') {
        registerServiceWorker();
    } else {
        window.addEventListener('load', registerServiceWorker);
    }

})();
