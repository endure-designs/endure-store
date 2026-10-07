// ==========================================================================
// CHECKOUT API
// ==========================================================================

const checkoutApi = {

    // ======================================================================
    // CREAR PEDIDO
    // ======================================================================

    async createOrder({
        paymentMethod = 'CARD',
        shipping = 0,
        discount = 0,
        customerData = null,
        selectedCartItemIds = []
    } = {}) {

        const response =
            await fetch(
                `${CONFIG.API_BASE_URL}/orders/checkout`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    credentials: 'include',

                    body: JSON.stringify({
                        paymentMethod,
                        shipping,
                        discount,
                        customerData,
                        selectedCartItemIds
                    })
                }
            );

        return parseResponse(response);
    },


    // ======================================================================
    // CREAR CARGO CON CULQI
    // ======================================================================

    async createCulqiCharge(
        orderId,
        tokenId,
        deviceFingerPrintId,
        authentication3DS = null
    ) {

        const response =
            await fetch(
                `${CONFIG.API_BASE_URL}/payments/culqi`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    credentials: 'include',

                    body: JSON.stringify({

                        orderId,

                        tokenId,

                        deviceFingerPrintId,

                        authentication3DS

                    })
                }
            );

        return parseResponse(response);
    },

    // ======================================================================
    // CREAR ORDEN CULQI
    // ======================================================================

    async createCulqiOrder(orderId) {
        const response = await fetch(
            `${CONFIG.API_BASE_URL}/payments/culqi/order`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    orderId
                })
            }
        );

        return parseResponse(response);
    },


    // ==========================================================================
    // SINCRONIZAR ORDEN CULQI
    // ==========================================================================

    async syncCulqiOrder(orderId) {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/payments/culqi/order/sync`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    orderId
                })
            }
        );

        return parseResponse(response);
    },

    // ======================================================================
    // CONECTAR EVENTOS SSE DE PAGOS
    // ======================================================================

    connectPaymentEvents(onPaymentStatus) {

        const eventSource =
            new EventSource(
                `${CONFIG.API_BASE_URL}/payments/events`,
                {
                    withCredentials: true
                }
            );

        eventSource.addEventListener(
            'connected',
            event => {

                console.log(
                    '📡 SSE de pagos conectado:',
                    event.data
                );

            }
        );

        eventSource.addEventListener(
            'payment.status',
            event => {

                console.log(
                    '📡 Estado de pago recibido:',
                    event.data
                );

                let data;

                try {

                    data = JSON.parse(event.data);

                } catch (error) {

                    console.error(
                        '❌ No se pudo interpretar el evento SSE:',
                        error
                    );

                    return;
                }

                if (typeof onPaymentStatus === 'function') {
                    onPaymentStatus(data);
                }

            }
        );

        eventSource.addEventListener(
            'notification.created',
            event => {

                console.log(
                    '🔔 Nueva notificación recibida por SSE:',
                    event.data
                );

                let data;

                try {

                    data = JSON.parse(event.data);

                } catch (error) {

                    console.error(
                        '❌ No se pudo interpretar la notificación SSE:',
                        error
                    );

                    return;
                }

                window.dispatchEvent(
                    new CustomEvent(
                        'endure:notification',
                        {
                            detail: data
                        }
                    )
                );
            }
        );

        eventSource.onerror =
            error => {

                console.error(
                    '❌ Error en SSE de pagos:',
                    error
                );

            };

        return eventSource;
    },

};


window.checkoutApi = checkoutApi;