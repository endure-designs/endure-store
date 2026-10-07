// ==========================================================================
// ACCOUNT TABS — Navegación de pestañas, sub-pestañas y menú desplegable
// ==========================================================================


function initTabs() {

    // ==========================================================================
    // 1. CAMBIO DE PESTAÑAS PRINCIPALES (SIDEBAR)
    // ==========================================================================

    const tabs = document.querySelectorAll(
        '.menu-tab[data-tab]'
    );

    const panels = document.querySelectorAll(
        '.tab-panel'
    );

    // --------------------------------------------------------------------------
    // Relación entre data-tab y contenedor principal
    // --------------------------------------------------------------------------

    const panelMap = {
        'admin': 'panel-admin',
        'personal': 'panel-personal-information',
        'addresses': 'panel-addresses',
        'security': 'panel-security',
        'cart': 'panel-cart',
        'orders': 'panel-orders'
    };

    tabs.forEach(tab => {

        tab.addEventListener('click', () => {

            const targetTab =
                tab.getAttribute('data-tab');

            const targetPanelId =
                panelMap[targetTab];

            if (!targetPanelId) {
                console.warn(
                    `⚠️ No existe un panel configurado para: ${targetTab}`
                );
                return;
            }

            // ------------------------------------------------------------------
            // Limpiar estado activo previo
            // ------------------------------------------------------------------

            tabs.forEach(t =>
                t.classList.remove('active')
            );

            panels.forEach(panel =>
                panel.classList.remove(
                    'active',
                    'animate-fade-up'
                )
            );

            // ------------------------------------------------------------------
            // Activar botón
            // ------------------------------------------------------------------

            tab.classList.add('active');

            // ------------------------------------------------------------------
            // Activar panel correspondiente
            // ------------------------------------------------------------------

            const activePanel =
                document.getElementById(targetPanelId);

            if (activePanel) {

                activePanel.classList.add('active');

                // Reiniciar animación CSS
                void activePanel.offsetWidth;

                activePanel.classList.add(
                    'animate-fade-up'
                );
            }

            // ------------------------------------------------------------------
            // Cargar carrito desde BD
            // ------------------------------------------------------------------

            if (targetTab === 'cart') {

                if (
                    window.accountCart &&
                    typeof accountCart.loadUserCart === 'function'
                ) {
                    accountCart.loadUserCart();
                }
            }

            // ------------------------------------------------------------------
            // Cargar pedidos desde BD
            // ------------------------------------------------------------------

            if (targetTab === 'orders') {

                if (
                    window.accountOrders &&
                    typeof accountOrders.loadOrders === 'function'
                ) {
                    accountOrders.loadOrders();
                }
            }

        });

    });


    // ==========================================================================
    // 2. CAMBIO DE SUB-PESTAÑAS EN EL PANEL ADMIN
    // ==========================================================================

    const subtabBtns = document.querySelectorAll(
        '.subtab-btn[data-subtab]'
    );

    const subtabPanels =
        document.querySelectorAll(
            '.subtab-panel'
        );

    subtabBtns.forEach(btn => {

        btn.addEventListener('click', () => {

            const targetSubtab =
                btn.getAttribute('data-subtab');

            // ------------------------------------------------------------------
            // Limpiar estado activo previo
            // ------------------------------------------------------------------

            subtabBtns.forEach(b =>
                b.classList.remove('active')
            );

            subtabPanels.forEach(panel =>
                panel.classList.remove('active')
            );

            // ------------------------------------------------------------------
            // Activar botón
            // ------------------------------------------------------------------

            btn.classList.add('active');

            // ------------------------------------------------------------------
            // Activar subpanel
            // ------------------------------------------------------------------

            const activeSubpanel =
                document.getElementById(
                    `subpanel-${targetSubtab}`
                );

            if (activeSubpanel) {
                activeSubpanel.classList.add('active');
            }

        });

    });


    // ==========================================================================
    // 3. MENÚ DESPLEGABLE EN NAVBAR
    // ==========================================================================

    const userMenuBtn =
        document.getElementById('userMenuBtn');

    const userMenu =
        document.getElementById('userMenu');

    if (userMenuBtn && userMenu) {

        userMenuBtn.addEventListener('click', event => {

            event.stopPropagation();

            if (
                window.appNotifications &&
                typeof appNotifications.close === 'function'
            ) {
                appNotifications.close();
            }

            userMenu.style.display =
                userMenu.style.display === 'none'
                    ? 'block'
                    : 'none';

        });

        document.addEventListener('click', () => {

            userMenu.style.display = 'none';

        });

    }


    // ==========================================================================
    // 4. BOTONES DE LOGOUT
    // ==========================================================================

    document
        .getElementById('sidebarLogoutBtn')
        ?.addEventListener(
            'click',
            () => accountSession.logout()
        );

    document
        .getElementById('navLogoutBtn')
        ?.addEventListener(
            'click',
            () => accountSession.logout()
        );


    // ==========================================================================
    // 5. ABRIR PESTAÑA SOLICITADA DESDE OTRA PÁGINA
    // ==========================================================================

    const openAccountTab =
        sessionStorage.getItem('openAccountTab');

    if (openAccountTab) {

        sessionStorage.removeItem(
            'openAccountTab'
        );

        const targetTab =
            document.querySelector(
                `.menu-tab[data-tab="${openAccountTab}"]`
            );

        if (targetTab) {

            // Esperar a que account.html termine de montar
            // todos sus componentes.
            setTimeout(() => {

                targetTab.click();

            }, 0);

        }

    }

}


window.accountTabs = {
    initTabs
};