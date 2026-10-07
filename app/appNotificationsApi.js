// ==========================================================================
// APP NOTIFICATIONS API
// ==========================================================================
//
// Responsabilidades:
//
// - Obtener notificaciones
// - Obtener cantidad de no leídas
// - Marcar una notificación como leída
// - Marcar todas como leídas
// - Archivar una notificación
//
// Este módulo NO contiene:
// - lógica de UI
// - manipulación del DOM
// - renderizado
//
// ==========================================================================


// ==========================================================================
// API
// ==========================================================================

const appNotificationsApi = {

    // ======================================================================
    // OBTENER NOTIFICACIONES
    // ======================================================================

    async getNotifications({
        page = 1,
        limit = 20
    } = {}) {

        const query = new URLSearchParams({
            page,
            limit
        });

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/notifications?${query.toString()}`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        return await parseResponse(response);
    },


    // ======================================================================
    // OBTENER CANTIDAD DE NOTIFICACIONES NO LEÍDAS
    // ======================================================================

    async getUnreadCount() {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/notifications/unread-count`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        return await parseResponse(response);
    },


    // ======================================================================
    // MARCAR UNA NOTIFICACIÓN COMO LEÍDA
    // ======================================================================

    async markAsRead(notificationId) {

        if (!notificationId) {
            throw new Error(
                'Se requiere notificationId para marcar la notificación como leída.'
            );
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/notifications/${encodeURIComponent(notificationId)}/read`,
            {
                method: 'PATCH',
                credentials: 'include'
            }
        );

        return await parseResponse(response);
    },


    // ======================================================================
    // MARCAR TODAS COMO LEÍDAS
    // ======================================================================

    async markAllAsRead() {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/notifications/read-all`,
            {
                method: 'PATCH',
                credentials: 'include'
            }
        );

        return await parseResponse(response);
    },


    // ======================================================================
    // ARCHIVAR NOTIFICACIÓN
    // ======================================================================

    async archiveNotification(notificationId) {

        if (!notificationId) {
            throw new Error(
                'Se requiere notificationId para archivar la notificación.'
            );
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/notifications/${encodeURIComponent(notificationId)}/archive`,
            {
                method: 'PATCH',
                credentials: 'include'
            }
        );

        return await parseResponse(response);
    }

};


// ==========================================================================
// PROCESAR RESPUESTA HTTP
// ==========================================================================

async function parseResponse(response) {

    let data = null;

    try {

        data = await response.json();

    } catch (error) {

        console.error(
            '❌ ERROR PARSEANDO RESPUESTA DE NOTIFICACIONES:',
            {
                status: response.status,
                statusText: response.statusText,
                error
            }
        );

        if (!response.ok) {
            throw new Error(
                `Error HTTP ${response.status}`
            );
        }

        return null;
    }


    // ----------------------------------------------------------------------
    // ERROR HTTP
    // ----------------------------------------------------------------------

    if (!response.ok) {

        const message =
            data?.message ||
            data?.error?.message ||
            `Error HTTP ${response.status}`;

        console.error(
            '❌ ERROR COMPLETO DEL BACKEND:',
            {
                status: response.status,
                data
            }
        );

        const error = new Error(message);

        error.status = response.status;

        error.code =
            data?.code ||
            data?.error?.code ||
            null;

        error.data = data;

        throw error;
    }


    return data;
}


// ==========================================================================
// API PÚBLICA
// ==========================================================================

window.appNotificationsApi = appNotificationsApi;