// ==========================================================================
// ACCOUNT INVENTORY API
// ==========================================================================

const accountInventoryApi = {

    // ======================================================================
    // OBTENER LISTADO DE INVENTARIO
    // ======================================================================

    async getInventory() {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/inventory`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        return parseResponse(response);
    },


    // ======================================================================
    // OBTENER INVENTARIO DE UNA VARIANTE
    // ======================================================================

    async getStock(variantId) {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/inventory/${variantId}`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        return parseResponse(response);
    },


    // ======================================================================
    // AJUSTAR STOCK FÍSICO
    // ======================================================================

    async setStock(variantId, targetStock, reason = '') {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/inventory/${variantId}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    targetStock,
                    reason
                })
            }
        );

        return parseResponse(response);
    },


    // ======================================================================
    // REGISTRAR MOVIMIENTO
    // ======================================================================

    async createMovement(
        variantId,
        {
            type,
            quantity,
            reason = '',
            referenceType = null,
            referenceId = null
        }
    ) {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/inventory/${variantId}/movements`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    type,
                    quantity,
                    reason,
                    referenceType,
                    referenceId
                })
            }
        );

        return parseResponse(response);
    },


    async getVariantMovements(variantId) {

        const response =
            await fetch(
                `${CONFIG.API_BASE_URL}/admin/inventory/${variantId}/movements`,
                {
                    method: 'GET',
                    credentials: 'include'
                }
            );

        return parseResponse(response);
    },

    async getAllMovements() {
        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/inventory/movements`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        return parseResponse(response);
    }



};


window.accountInventoryApi = accountInventoryApi;