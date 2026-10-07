// ==========================================================
// APP NOTIFICATIONS
// Centro de notificaciones de Endure
// ==========================================================

(function () {
    'use strict';

    // ======================================================
    // ESTADO
    // ======================================================

    const state = {
        initialized: false,
        isOpen: false,
        isLoading: false,

        page: 1,
        limit: 20,
        hasMore: true,

        unreadCount: 0,
        notifications: []
    };


    // ======================================================
    // ELEMENTOS
    // ======================================================

    let elements = {};


    function cacheElements() {

        elements = {

            container:
                document.getElementById('appNotificationsContainer'),

            button:
                document.getElementById('notificationsButton'),

            badge:
                document.getElementById('notificationsBadge'),

            panel:
                document.getElementById('notificationsPanel'),

            list:
                document.getElementById('notificationsList'),

            loading:
                document.getElementById('notificationsLoading'),

            empty:
                document.getElementById('notificationsEmpty'),

            unreadLabel:
                document.getElementById('notificationsUnreadLabel'),

            markAllRead:
                document.getElementById('notificationsMarkAllRead'),

            // PUSH

            pushSettings:
                document.getElementById('notificationsPushSettings'),

            pushStatus:
                document.getElementById('notificationsPushStatus'),

            pushButton:
                document.getElementById('notificationsPushButton')
        };
    }


    // ======================================================
    // INICIALIZACIÓN
    // ======================================================

    async function init() {

        if (state.initialized) {
            return;
        }

        cacheElements();

        if (!elements.container) {

            console.warn(
                '⚠️ No se encontró #appNotificationsContainer.'
            );

            return;
        }

        if (
            !elements.button ||
            !elements.panel ||
            !elements.list
        ) {

            console.warn(
                '⚠️ El componente de notificaciones está incompleto.'
            );

            return;
        }

        elements.container.hidden = false;

        bindEvents();

        state.initialized = true;

        // Estado PUSH
        renderPushStatus();

        // Escuchar nuevas notificaciones
        bindNotificationListener();

        // Contador IN_APP
        await refreshUnreadCount();
    }


    // ======================================================
    // EVENTOS
    // ======================================================

    function bindEvents() {

        // --------------------------------------------------
        // Abrir / cerrar panel
        // --------------------------------------------------

        elements.button.addEventListener(
            'click',
            function (event) {

                event.stopPropagation();

                const userMenu = document.getElementById('userMenu');

                if (userMenu) {
                    userMenu.style.display = 'none';
                }

                togglePanel();
            }
        );


        // --------------------------------------------------
        // Marcar todas como leídas
        // --------------------------------------------------

        if (elements.markAllRead) {

            elements.markAllRead.addEventListener(
                'click',
                async function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    await markAllAsRead();
                }
            );
        }


        // --------------------------------------------------
        // Activar PUSH
        // --------------------------------------------------

        if (elements.pushButton) {

            elements.pushButton.addEventListener(
                'click',
                async function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    await enablePush();
                }
            );
        }


        // --------------------------------------------------
        // Evitar que los clics dentro del panel
        // lleguen al document
        // --------------------------------------------------

        elements.panel.addEventListener(
            'click',
            function (event) {

                event.stopPropagation();
            }
        );


        // --------------------------------------------------
        // Cerrar al hacer clic fuera
        // --------------------------------------------------

        document.addEventListener(
            'click',
            function () {

                if (state.isOpen) {
                    closePanel();
                }
            }
        );


        // --------------------------------------------------
        // Escape para cerrar
        // --------------------------------------------------

        document.addEventListener(
            'keydown',
            function (event) {

                if (
                    event.key === 'Escape' &&
                    state.isOpen
                ) {

                    closePanel();
                }
            }
        );
    }


    // ======================================================
    // PUSH
    // ======================================================

    function bindNotificationListener() {

        window.addEventListener(
            'endure:notification',
            async function (event) {

                const notification = event.detail;

                console.log(
                    '🔔 Nueva notificación recibida por tiempo real:',
                    notification
                );

                // ==================================================
                // ACTUALIZAR EL BADGE INMEDIATAMENTE
                // ==================================================

                state.unreadCount += 1;

                renderUnreadCount();

                console.log(
                    '🔔 Badge actualizado inmediatamente:',
                    state.unreadCount
                );


                // ==================================================
                // SI EL PANEL ESTÁ ABIERTO, ACTUALIZAR LA LISTA
                // ==================================================

                if (state.isOpen) {

                    resetPagination();

                    await loadNotifications();
                }
            }
        );
    }


    async function enablePush() {

        if (
            !window.endureNotifications ||
            typeof window.endureNotifications.enablePush !==
            'function'
        ) {

            console.error(
                '❌ El servicio de notificaciones PUSH no está disponible.'
            );

            return;
        }

        if (elements.pushButton) {

            elements.pushButton.disabled = true;

            elements.pushButton.textContent =
                'Activando...';
        }

        try {

            const result =
                await window.endureNotifications.enablePush();

            console.log(
                '✅ Resultado de activación PUSH:',
                result
            );

            renderPushStatus();

        } catch (error) {

            console.error(
                '❌ No se pudieron activar las notificaciones PUSH:',
                error
            );

            renderPushStatus();

        } finally {

            if (elements.pushButton) {
                elements.pushButton.disabled = false;
            }
        }
    }


    function renderPushStatus() {

        if (!elements.pushStatus) {
            return;
        }

        if (
            !window.endureNotifications ||
            typeof window.endureNotifications.getStatus !==
            'function'
        ) {

            elements.pushStatus.textContent =
                'No disponible en este momento.';

            if (elements.pushButton) {
                elements.pushButton.hidden = true;
            }

            return;
        }

        const status =
            window.endureNotifications.getStatus();


        // --------------------------------------------------
        // Navegador no compatible
        // --------------------------------------------------

        if (!status.supported) {

            elements.pushStatus.textContent =
                'No disponible en este navegador.';

            if (elements.pushButton) {
                elements.pushButton.hidden = true;
            }

            return;
        }


        // --------------------------------------------------
        // Permiso concedido
        // --------------------------------------------------

        if (status.permission === 'granted') {

            elements.pushStatus.textContent =
                'Las notificaciones están activadas.';

            if (elements.pushButton) {
                elements.pushButton.hidden = true;
            }

            return;
        }


        // --------------------------------------------------
        // Permiso bloqueado
        // --------------------------------------------------

        if (status.permission === 'denied') {

            elements.pushStatus.textContent =
                'Las notificaciones están bloqueadas por el navegador.';

            if (elements.pushButton) {
                elements.pushButton.hidden = true;
            }

            return;
        }


        // --------------------------------------------------
        // Permiso todavía no solicitado
        // --------------------------------------------------

        elements.pushStatus.textContent =
            'Activa las notificaciones para recibir avisos en tu navegador.';

        if (elements.pushButton) {

            elements.pushButton.hidden = false;

            elements.pushButton.textContent =
                'Activar';
        }
    }


    // ======================================================
    // PANEL
    // ======================================================

    async function togglePanel() {

        if (state.isOpen) {

            closePanel();

            return;
        }

        await openPanel();
    }


    async function openPanel() {

        state.isOpen = true;

        elements.panel.hidden = false;

        elements.button.setAttribute(
            'aria-expanded',
            'true'
        );

        // Actualizar estado PUSH al abrir
        renderPushStatus();

        resetPagination();

        showLoading();

        await loadNotifications();
    }


    function closePanel() {

        state.isOpen = false;

        elements.panel.hidden = true;

        elements.button.setAttribute(
            'aria-expanded',
            'false'
        );
    }


    // ======================================================
    // PAGINACIÓN
    // ======================================================

    function resetPagination() {

        state.page = 1;
        state.hasMore = true;
        state.notifications = [];
    }


    // ======================================================
    // CARGAR NOTIFICACIONES
    // ======================================================

    async function loadNotifications() {

        if (
            state.isLoading ||
            !state.hasMore
        ) {

            return;
        }

        state.isLoading = true;

        try {

            const response =
                await window.appNotificationsApi.getNotifications({
                    page: state.page,
                    limit: state.limit
                });

            const notifications =
                extractNotifications(response);

            const pagination =
                extractPagination(response);


            if (state.page === 1) {

                state.notifications =
                    notifications;

            } else {

                state.notifications.push(
                    ...notifications
                );
            }


            state.hasMore =
                pagination.hasMore !== undefined
                    ? pagination.hasMore
                    : notifications.length >= state.limit;


            renderNotifications();

        } catch (error) {

            console.error(
                '❌ Error cargando notificaciones:',
                error
            );

            showError();

        } finally {

            state.isLoading = false;
        }
    }


    // ======================================================
    // EXTRAER RESPUESTA API
    // ======================================================

    function extractNotifications(response) {

        if (Array.isArray(response)) {
            return response;
        }

        if (Array.isArray(response?.data)) {
            return response.data;
        }

        if (Array.isArray(response?.notifications)) {
            return response.notifications;
        }

        if (
            Array.isArray(
                response?.data?.notifications
            )
        ) {

            return response.data.notifications;
        }

        return [];
    }


    function extractPagination(response) {

        if (response?.pagination) {
            return response.pagination;
        }

        if (response?.data?.pagination) {
            return response.data.pagination;
        }

        return {};
    }


    // ======================================================
    // CONTADOR DE NO LEÍDAS
    // ======================================================

    async function refreshUnreadCount() {

        try {

            const response =
                await window.appNotificationsApi.getUnreadCount();

            const count =
                extractUnreadCount(response);

            state.unreadCount = count;

            renderUnreadCount();

        } catch (error) {

            console.error(
                '❌ Error obteniendo contador de notificaciones:',
                error
            );
        }
    }


    function extractUnreadCount(response) {

        if (typeof response === 'number') {
            return response;
        }

        if (typeof response?.count === 'number') {
            return response.count;
        }

        if (typeof response?.unreadCount === 'number') {
            return response.unreadCount;
        }

        if (typeof response?.data === 'number') {
            return response.data;
        }

        if (typeof response?.data?.count === 'number') {
            return response.data.count;
        }

        if (typeof response?.data?.unreadCount === 'number') {
            return response.data.unreadCount;
        }

        return 0;
    }


    function renderUnreadCount() {

        const count = state.unreadCount;

        if (!elements.badge) {
            console.error(
                '❌ No se encontró #notificationsBadge.'
            );
            return;
        }

        if (count > 0) {

            elements.badge.hidden = false;

            elements.badge.textContent =
                count > 99
                    ? '99+'
                    : String(count);

        } else {

            elements.badge.hidden = true;
            elements.badge.textContent = '0';
        }

        if (elements.unreadLabel) {

            elements.unreadLabel.textContent =
                count === 0
                    ? 'Sin notificaciones nuevas'
                    : count === 1
                        ? '1 sin leer'
                        : `${count} sin leer`;
        }
    }

    // ======================================================
    // RENDER
    // ======================================================

    function renderNotifications() {

        if (!elements.list) {
            return;
        }

        elements.list.innerHTML = '';


        if (state.notifications.length === 0) {

            showEmpty();

            return;
        }


        hideLoading();

        if (elements.empty) {
            elements.empty.hidden = true;
        }


        state.notifications.forEach(
            function (notification) {

                const element =
                    createNotificationElement(
                        notification
                    );

                elements.list.appendChild(element);
            }
        );
    }


    // ======================================================
    // CREAR NOTIFICACIÓN
    // ======================================================

    function createNotificationElement(notification) {

        const item =
            document.createElement('article');

        const isUnread =
            !notification.readAt;


        item.className =
            'notification-item' +
            (
                isUnread
                    ? ' notification-item-unread'
                    : ''
            );


        item.dataset.notificationId =
            notification.id;


        // --------------------------------------------------
        // Icono
        // --------------------------------------------------

        const iconContainer =
            document.createElement('div');

        iconContainer.className =
            'notification-item-icon';

        iconContainer.innerHTML =
            getNotificationIcon(
                notification.type
            );


        // --------------------------------------------------
        // Contenido
        // --------------------------------------------------

        const content =
            document.createElement('div');

        content.className =
            'notification-item-content';


        const title =
            document.createElement('h4');

        title.className =
            'notification-item-title';

        title.textContent =
            notification.title ||
            getDefaultTitle(
                notification.type
            );


        const body =
            document.createElement('p');

        body.className =
            'notification-item-body';

        body.textContent =
            notification.body || '';


        const date =
            document.createElement('time');

        date.className =
            'notification-item-date';

        date.textContent =
            formatNotificationDate(
                notification.createdAt
            );


        content.appendChild(title);
        content.appendChild(body);
        content.appendChild(date);

        item.appendChild(iconContainer);
        item.appendChild(content);


        // --------------------------------------------------
        // Click
        // --------------------------------------------------

        item.addEventListener(
            'click',
            function () {

                handleNotificationClick(
                    notification
                );
            }
        );


        return item;
    }


    // ======================================================
    // ICONOS
    // ======================================================

    function getNotificationIcon(type) {

        switch (type) {

            case 'NEW_SALE':
                return '<i class="fa-solid fa-bag-shopping"></i>';

            case 'ORDER_CREATED':
                return '<i class="fa-solid fa-receipt"></i>';

            case 'ORDER_STATUS_CHANGED':
                return '<i class="fa-solid fa-arrows-rotate"></i>';

            case 'PAYMENT_CONFIRMED':
                return '<i class="fa-solid fa-circle-check"></i>';

            case 'PAYMENT_FAILED':
                return '<i class="fa-solid fa-circle-xmark"></i>';

            case 'SHIPPING_UPDATE':
                return '<i class="fa-solid fa-truck"></i>';

            case 'STOCK_ALERT':
                return '<i class="fa-solid fa-box-open"></i>';

            case 'PROMOTION':
                return '<i class="fa-solid fa-tag"></i>';

            case 'SECURITY':
                return '<i class="fa-solid fa-shield-halved"></i>';

            case 'SYSTEM':
            default:
                return '<i class="fa-solid fa-bell"></i>';
        }
    }


    function getDefaultTitle(type) {

        switch (type) {

            case 'NEW_SALE':
                return 'Nueva venta';

            case 'ORDER_CREATED':
                return 'Nuevo pedido';

            case 'ORDER_STATUS_CHANGED':
                return 'Estado del pedido actualizado';

            case 'PAYMENT_CONFIRMED':
                return 'Pago confirmado';

            case 'PAYMENT_FAILED':
                return 'Pago rechazado';

            case 'SHIPPING_UPDATE':
                return 'Actualización de envío';

            case 'STOCK_ALERT':
                return 'Alerta de stock';

            case 'PROMOTION':
                return 'Promoción';

            case 'SECURITY':
                return 'Seguridad';

            default:
                return 'Notificación';
        }
    }


    // ======================================================
    // CLICK EN NOTIFICACIÓN
    // ======================================================

    async function handleNotificationClick(
        notification
    ) {

        if (!notification.readAt) {

            try {

                await window.appNotificationsApi.markAsRead(
                    notification.id
                );

                notification.readAt =
                    new Date().toISOString();

                state.unreadCount =
                    Math.max(
                        0,
                        state.unreadCount - 1
                    );

                renderUnreadCount();


                const element =
                    elements.list.querySelector(
                        `[data-notification-id="${notification.id}"]`
                    );


                if (element) {

                    element.classList.remove(
                        'notification-item-unread'
                    );
                }

            } catch (error) {

                console.error(
                    '❌ No se pudo marcar la notificación como leída:',
                    error
                );
            }
        }


        handleNotificationAction(
            notification
        );
    }


    // ======================================================
    // ACCIÓN DE LA NOTIFICACIÓN
    // ======================================================

    function handleNotificationAction(
        notification
    ) {

        const entityType =
            notification.entityType;

        const entityId =
            notification.entityId;


        if (
            entityType === 'ORDER' &&
            entityId
        ) {

            const target =
                `account.html?order=${encodeURIComponent(entityId)}`;

            window.location.href =
                target;

            return;
        }

        // Si todavía no existe una acción específica,
        // simplemente queda marcada como leída.
    }


    // ======================================================
    // MARCAR TODAS COMO LEÍDAS
    // ======================================================

    async function markAllAsRead() {

        if (state.unreadCount === 0) {
            return;
        }


        if (elements.markAllRead) {
            elements.markAllRead.disabled = true;
        }


        try {

            await window.appNotificationsApi.markAllAsRead();


            state.notifications.forEach(
                function (notification) {

                    notification.readAt =
                        new Date().toISOString();
                }
            );


            state.unreadCount = 0;

            renderUnreadCount();

            renderNotifications();

        } catch (error) {

            console.error(
                '❌ No se pudieron marcar todas las notificaciones:',
                error
            );

        } finally {

            if (elements.markAllRead) {
                elements.markAllRead.disabled = false;
            }
        }
    }


    // ======================================================
    // ESTADOS VISUALES
    // ======================================================

    function showLoading() {

        if (elements.loading) {
            elements.loading.hidden = false;
        }

        if (elements.empty) {
            elements.empty.hidden = true;
        }

        if (elements.list) {

            elements.list.innerHTML = '';

            if (elements.loading) {

                elements.list.appendChild(
                    elements.loading
                );
            }
        }
    }


    function hideLoading() {

        if (elements.loading) {
            elements.loading.hidden = true;
        }
    }


    function showEmpty() {

        hideLoading();

        if (elements.list) {
            elements.list.innerHTML = '';
        }

        if (elements.empty) {

            elements.empty.hidden = false;

            if (elements.list) {

                elements.list.appendChild(
                    elements.empty
                );
            }
        }
    }


    function showError() {

        if (!elements.list) {
            return;
        }

        elements.list.innerHTML = '';

        const error =
            document.createElement('div');

        error.className =
            'notifications-state';

        error.innerHTML = `
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>No se pudieron cargar las notificaciones.</span>
        `;

        elements.list.appendChild(error);
    }


    // ======================================================
    // FECHAS
    // ======================================================

    function formatNotificationDate(
        dateValue
    ) {

        if (!dateValue) {
            return '';
        }


        const date =
            new Date(dateValue);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return '';
        }


        const now =
            new Date();


        const diff =
            Math.floor(
                (
                    now.getTime() -
                    date.getTime()
                ) / 1000
            );


        if (diff < 60) {
            return 'Hace unos segundos';
        }


        if (diff < 3600) {

            const minutes =
                Math.floor(diff / 60);

            return minutes === 1
                ? 'Hace 1 minuto'
                : `Hace ${minutes} minutos`;
        }


        if (diff < 86400) {

            const hours =
                Math.floor(diff / 3600);

            return hours === 1
                ? 'Hace 1 hora'
                : `Hace ${hours} horas`;
        }


        if (diff < 604800) {

            const days =
                Math.floor(diff / 86400);

            return days === 1
                ? 'Ayer'
                : `Hace ${days} días`;
        }


        return date.toLocaleDateString(
            'es-PE',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }
        );
    }


    // ======================================================
    // CARGAR MÁS
    // ======================================================

    async function loadNextPage() {

        if (
            state.isLoading ||
            !state.hasMore
        ) {

            return;
        }

        state.page += 1;

        await loadNotifications();
    }




    // ======================================================
    // API PÚBLICA
    // ======================================================

    window.appNotifications = {

        init,

        open: openPanel,

        close: closePanel,

        toggle: togglePanel,

        refresh: loadNotifications,

        refreshUnreadCount,

        loadNextPage,

        refreshPushStatus: renderPushStatus,

    };

})();