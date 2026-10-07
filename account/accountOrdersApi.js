// ==========================================================================
// ENDURE — ACCOUNT ORDERS API
// Comunicación con los endpoints de pedidos
// ==========================================================================


// ==========================================================================
// LISTAR PEDIDOS
// ==========================================================================

async function listOrders({
    page = 1,
    pageSize = 10
} = {}) {

    const params = new URLSearchParams({

        page: String(page),

        pageSize: String(pageSize)

    });


    const response =
        await fetch(
            `${CONFIG.API_BASE_URL}/orders?${params.toString()}`,
            {
                method: 'GET',

                credentials: 'include'
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data?.message ||
            'No se pudieron cargar los pedidos.'
        );

    }


    return data;

}


// ==========================================================================
// OBTENER PEDIDO
// ==========================================================================

async function getOrder(orderId) {

    const id =
        Number(orderId);


    if (!Number.isInteger(id) || id <= 0) {

        throw new Error(
            'El ID del pedido no es válido.'
        );

    }


    const response =
        await fetch(
            `${CONFIG.API_BASE_URL}/orders/${id}`,
            {
                method: 'GET',

                credentials: 'include'
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data?.message ||
            'No se pudo obtener el pedido.'
        );

    }


    return data;

}


// ==========================================================================
// EXPORTAR MÓDULO
// ==========================================================================

window.accountOrdersApi = {

    listOrders,

    getOrder

};