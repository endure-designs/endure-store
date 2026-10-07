// ==========================================================================
// CHECKOUT
// ==========================================================================

// ==========================================================================
// ESTADO
// ==========================================================================

let checkoutInitialized = false;

let culqiCheckout = null;

let checkoutUser = null;

let deviceFingerPrintId = null;

let pending3DSPayment = null;

let checkoutContainer = null;
let checkoutOriginalZIndex = null;

let checkoutPaymentMethod = 'CARD';

let checkoutCustomerData = null;

let completedCheckoutData = null;

let pendingCulqiOrderId = null;

let pendingInternalOrderId = null;

let pendingPaymentReference = null;
let pendingPaymentExpiresAt = null;
let pendingPaymentQrUrl = null;
let pendingPaymentUrl = null;

let paymentEventSource = null;

let checkoutSelectedCartItemIds = [];

let checkoutCartSource = 'account';



// ==========================================================================
// CONFIGURACIÓN DE MÉTODOS DE PAGO CULQI
// ==========================================================================

const CULQI_PAYMENT_CONFIG = {

    CARD: {
        requiresOrder: false,
        culqiMethods: ['tarjeta']
    },

    YAPE: {
        requiresOrder: false,
        culqiMethods: ['yape']
    },

    WALLET: {
        requiresOrder: true,
        culqiMethods: ['billetera']
    },

    PAGO_EFECTIVO: {
        requiresOrder: true,
        culqiMethods: ['bancaMovil', 'agente']
    },

    CUOTEALO: {
        requiresOrder: true,
        culqiMethods: ['cuotealo']
    }

};


function getCulqiPaymentConfig(paymentMethod) {

    const config =
        CULQI_PAYMENT_CONFIG[paymentMethod];

    if (!config) {

        throw new Error(
            `Método de pago no configurado para Culqi: ${paymentMethod}`
        );

    }

    return config;
}


async function prepareCulqiOrder() {

    const paymentConfig =
        getCulqiPaymentConfig(
            checkoutPaymentMethod
        );

    // ----------------------------------------------------------------------
    // SI EL MÉTODO NO REQUIERE ORDER, NO HACER NADA
    // ----------------------------------------------------------------------

    if (!paymentConfig.requiresOrder) {

        return {
            orderId: null,
            culqiOrderId: null,
            orderTotal: null
        };
    }

    console.log(
        '🧾 El método requiere una Order de Culqi.'
    );

    // ----------------------------------------------------------------------
    // CREAR PEDIDO INTERNO DE ENDURE
    // ----------------------------------------------------------------------

    const orderResponse =
        await checkoutApi.createOrder({
            paymentMethod:
                checkoutPaymentMethod,

            customerData:
                checkoutCustomerData,

            selectedCartItemIds:
                checkoutSelectedCartItemIds
        });

    console.log(
        '✅ Pedido interno creado:',
        orderResponse
    );

    const order =
        orderResponse?.data?.order;

    if (!order?.id) {
        throw new Error(
            'No se recibió el ID del pedido interno.'
        );
    }

    if (
        order.total === undefined ||
        order.total === null
    ) {
        throw new Error(
            'No se recibió el total del pedido interno.'
        );
    }

    const orderId =
        order.id;

    const orderTotal =
        Number(order.total);

    if (!Number.isFinite(orderTotal)) {
        throw new Error(
            'El total del pedido interno no es válido.'
        );
    }

    console.log(
        '💰 Total real de la orden:',
        orderTotal
    );

    console.log(
        '🧾 Order ID:',
        orderId
    );

    // ----------------------------------------------------------------------
    // CREAR ORDER DE CULQI
    // ----------------------------------------------------------------------

    const culqiOrderResponse =
        await checkoutApi.createCulqiOrder(
            orderId
        );

    console.log(
        '✅ Order de Culqi creada:',
        culqiOrderResponse
    );

    const culqiOrderData =
        culqiOrderResponse?.data;

    const culqiOrderId =
        culqiOrderData?.culqiOrderId;

    if (!culqiOrderId) {
        throw new Error(
            'No se recibió el ID de la Order de Culqi.'
        );
    }

    console.log(
        '🧾 Culqi Order ID:',
        culqiOrderId
    );

    return {
        orderId,
        culqiOrderId,
        orderTotal,

        paymentReference:
            culqiOrderData?.paymentReference || null,

        paymentExpiresAt:
            culqiOrderData?.paymentExpiresAt || null,

        paymentQrUrl:
            culqiOrderData?.paymentQrUrl || null,

        paymentUrl:
            culqiOrderData?.paymentUrl || null
    };
}


// ==========================================================================
// SSE — EVENTOS DE PAGO
// ==========================================================================

function initializePaymentEvents() {

    if (paymentEventSource) {

        console.log(
            '📡 SSE de pagos ya está conectado.'
        );

        return;
    }

    console.log(
        '📡 Inicializando SSE de pagos...'
    );

    paymentEventSource =
        checkoutApi.connectPaymentEvents(
            handlePaymentStatusEvent
        );

}

// ==========================================================================
// SSE — RESPUESTA DEL PAGO
// ==========================================================================

async function handlePaymentStatusEvent(data) {
    console.log(
        '💳 Procesando estado de pago:',
        data
    );

    if (data?.status !== 'PAID') {
        console.log(
            'ℹ️ Evento de pago no corresponde a una compra completada:',
            data
        );
        return;
    }

    if (
        pendingInternalOrderId &&
        Number(data.orderId) !== Number(pendingInternalOrderId)
    ) {
        console.log(
            'ℹ️ El evento corresponde a otra Order:',
            data.orderId
        );
        return;
    }

    console.log(
        '🎉 Pago confirmado por Culqi mediante SSE.'
    );

    try {
        // ==================================================================
        // OBTENER LA ORDER COMPLETA
        // ==================================================================
        const orderResponse =
            await window.accountOrdersApi.getOrder(
                data.orderId
            );

        console.log(
            '📦 Order completa recibida:',
            orderResponse
        );

        const order =
            orderResponse?.data?.order;

        if (!order) {
            throw new Error(
                'No se recibió la información completa del pedido.'
            );
        }

        // ==================================================================
        // GUARDAR DATOS DEL PEDIDO COMPLETO
        // ==================================================================
        completedCheckoutData = {
            order
        };

        console.log(
            '✅ Datos completos del pedido preparados:',
            completedCheckoutData
        );

        // ==================================================================
        // ACTUALIZAR DETALLE DE ORDEN SI ESTÁ ABIERTO
        // ==================================================================
        if (
            window.orderDetail &&
            typeof window.orderDetail.refreshOrder === 'function' &&
            typeof window.orderDetail.getCurrentOrderId === 'function' &&
            Number(window.orderDetail.getCurrentOrderId()) === Number(order.id)
        ) {
            console.log(
                '🔄 Actualizando el detalle de la Order después del pago.'
            );

            window.orderDetail.refreshOrder(order);
        }

        // ==================================================================
        // ACTUALIZAR CARRITO
        // ==================================================================
        await refreshCheckoutCart();

        // ==================================================================
        // VERIFICAR SI YA ESTAMOS EN LA ETAPA COMPLETED
        // ==================================================================
        const completedStep =
            document.getElementById(
                'checkoutStepCompleted'
            );

        const completedStepVisible =
            completedStep &&
            getComputedStyle(completedStep).display !== 'none';

        // ==================================================================
        // SI COMPLETED YA ESTÁ VISIBLE
        // ==================================================================
        if (completedStepVisible) {
            console.log(
                '🔄 La etapa completed ya está visible. Actualizando interfaz.'
            );

            if (
                window.accountCheckoutCompleted &&
                typeof window.accountCheckoutCompleted
                    .refreshCompletedOrder === 'function'
            ) {
                window.accountCheckoutCompleted
                    .refreshCompletedOrder(order);
            }

            return;
        }

        // ==================================================================
        // SI EL CHECKOUT TODAVÍA ESTÁ ABIERTO
        // ==================================================================
        console.log(
            '🚪 El checkout todavía está activo. Cerrando y mostrando completed.'
        );

        await closeSuccessfulCheckout();

    } catch (error) {
        console.error(
            '❌ Error obteniendo la Order después del pago:',
            error
        );
    }
}


// ==========================================================================
// INICIALIZAR
// ==========================================================================

async function init(user) {
    checkoutUser = user;

    if (checkoutInitialized) {
        return;
    }

    checkoutInitialized = true;

    initializePaymentEvents();

    await initializeCulqi3DS();

    window.addEventListener(
        "message",
        handleCulqi3DSMessage
    );
}


function setCheckoutCartSource(source) {

    if (source !== 'index' && source !== 'account') {
        console.warn(
            '⚠️ Fuente de carrito no válida:',
            source
        );

        return;
    }

    checkoutCartSource = source;

    console.log(
        '🛒 Fuente del carrito para checkout:',
        checkoutCartSource
    );
}


function getCheckoutSelectedCartItemIds() {

    if (checkoutCartSource === 'index') {

        if (
            typeof window.getCartSelectedItemIds === 'function'
        ) {

            return window.getCartSelectedItemIds();

        }

        console.warn(
            '⚠️ No existe getCartSelectedItemIds() para el carrito de index.'
        );

        return [];

    }


    if (
        window.accountCart &&
        typeof window.accountCart.getSelectedCartItemIds === 'function'
    ) {

        return window.accountCart.getSelectedCartItemIds();

    }


    console.warn(
        '⚠️ No existe accountCart.getSelectedCartItemIds().'
    );

    return [];

}


async function refreshCheckoutCart() {

    if (checkoutCartSource === 'index') {

        // ==============================================================
        // USUARIO LOGUEADO → DB es la fuente de verdad
        // ==============================================================

        if (window.currentUser) {

            try {

                const response = await apiGetCart();

                if (!response.ok) {
                    throw new Error(
                        `No se pudo actualizar el carrito: HTTP ${response.status}`
                    );
                }

                const cartData = await response.json();

                const updatedCart =
                    mapBackendCartToFrontend(cartData);

                setCart(updatedCart);

                updateCartUI();

            } catch (error) {

                console.error(
                    '❌ Error actualizando carrito después del checkout:',
                    error
                );
            }

            return;
        }

        // ==============================================================
        // VISITANTE → LocalStorage
        // ==============================================================

        if (typeof window.loadCart === 'function') {
            window.loadCart();
        }

        if (typeof window.updateCartUI === 'function') {
            window.updateCartUI();
        }

        return;
    }

    // ==============================================================
    // ACCOUNT CHECKOUT
    // ==============================================================

    if (
        window.accountCart &&
        typeof window.accountCart.loadUserCart === 'function'
    ) {
        await window.accountCart.loadUserCart();
        return;
    }

    console.warn(
        '⚠️ No se pudo actualizar el carrito del checkout.'
    );
}

// ==========================================================================
// CLICK — PROCEDER AL PAGO
// ==========================================================================

function handleCheckoutClick(event) {

    const checkoutButton =
        event.target.closest('.account-cart-checkout');

    if (!checkoutButton) {
        return;
    }

    startCheckout();

}


// ==========================================================================
// INICIAR CHECKOUT
// ==========================================================================

async function startCheckout(
    paymentMethod = 'CARD',
    customerData = null
) {

    checkoutPaymentMethod =
        paymentMethod;

    checkoutCustomerData =
        customerData;

    checkoutSelectedCartItemIds =
        getCheckoutSelectedCartItemIds();

    console.log(
        '🛒 CartItems seleccionados para checkout:',
        checkoutSelectedCartItemIds
    );

    console.log(
        '💳 Método de pago para checkout:',
        checkoutPaymentMethod
    );

    console.log(
        '👤 Datos del cliente para checkout:',
        checkoutCustomerData
    );

    console.log(
        '💳 Iniciando proceso de checkout...'
    );

    try {

        // ------------------------------------------------------------------
        // OBTENER CARRITO ACTUALIZADO
        // ------------------------------------------------------------------

        const response =
            await apiGetCart();

        if (!response.ok) {

            throw new Error(
                `Error HTTP ${response.status}`
            );

        }

        const cartData =
            await response.json();

        const items =
            cartData?.data?.items ?? [];

        // ------------------------------------------------------------------
        // VALIDAR CARRITO
        // ------------------------------------------------------------------

        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {

            console.warn(
                '⚠️ El carrito está vacío.'
            );

            return;
        }

        const selectedItems =
            items.filter(item =>
                checkoutSelectedCartItemIds.includes(
                    Number(item.id)
                )
            );

        if (selectedItems.length === 0) {

            console.warn(
                '⚠️ No existen productos seleccionados para checkout.'
            );

            return;
        }

        // ------------------------------------------------------------------
        // CALCULAR TOTAL
        // ------------------------------------------------------------------

        const total =
            selectedItems.reduce(
                (sum, item) => {

                    return sum +
                        Number(item.lineTotal ?? 0);

                },
                0
            );

        console.log(
            '🛒 Carrito seleccionado para checkout:',
            selectedItems
        );

        console.log(
            '💰 Total:',
            total
        );

        // ------------------------------------------------------------------
        // VALIDAR CUOTÉALO
        // ------------------------------------------------------------------

        if (
            checkoutPaymentMethod === 'CUOTEALO' &&
            total <= 100
        ) {

            console.log(
                '⚠️ Cuotéalo no disponible. Total:',
                total
            );

            window.alertModal?.show({

                title:
                    'Cuotéalo no disponible',

                message:
                    'Cuotéalo está disponible únicamente para órdenes superiores a S/100.',

                type:
                    'info'

            });

            return;
        }

        // ------------------------------------------------------------------
        // CONVERTIR A CÉNTIMOS
        // ------------------------------------------------------------------

        const amount =
            Math.round(total * 100);

        console.log(
            '💰 Monto Culqi:',
            amount
        );

        // ------------------------------------------------------------------
        // PREPARAR ORDER SI EL MÉTODO LO REQUIERE
        // ------------------------------------------------------------------

        const {
            orderId,
            culqiOrderId,
            orderTotal,
            paymentReference,
            paymentExpiresAt,
            paymentQrUrl,
            paymentUrl
        } = await prepareCulqiOrder();

        pendingInternalOrderId =
            orderId;

        pendingCulqiOrderId =
            culqiOrderId;

        pendingPaymentReference =
            paymentReference;

        pendingPaymentExpiresAt =
            paymentExpiresAt;

        pendingPaymentQrUrl =
            paymentQrUrl;

        pendingPaymentUrl =
            paymentUrl;

        // ------------------------------------------------------------------
        // DETERMINAR MONTO FINAL
        // ------------------------------------------------------------------

        const finalTotal =
            orderTotal !== null
                ? orderTotal
                : total;

        const finalAmount =
            Math.round(finalTotal * 100);

        console.log(
            '💰 Total final para Culqi:',
            finalTotal
        );

        console.log(
            '💰 Monto final para Culqi:',
            finalAmount
        );

        // ------------------------------------------------------------------
        // ABRIR CULQI
        // ------------------------------------------------------------------

        openCulqiCheckout(
            finalAmount,
            checkoutPaymentMethod,
            culqiOrderId
        );

    } catch (error) {

        console.error(
            '❌ Error iniciando checkout:',
            error
        );

    }

}


// ==========================================================================
// ABRIR CULQI CHECKOUT
// ==========================================================================

function openCulqiCheckout(
    amount,
    paymentMethod,
    culqiOrderId = null
) {

    if (
        typeof CulqiCheckout === 'undefined'
    ) {

        console.error(
            '❌ CulqiCheckout no está disponible.'
        );

        return;
    }

    if (
        !CONFIG.CULQI_PUBLIC_KEY
    ) {

        console.error(
            '❌ No se encontró CONFIG.CULQI_PUBLIC_KEY.'
        );

        return;
    }


    // ----------------------------------------------------------------------
    // CONFIGURACIÓN
    // ----------------------------------------------------------------------

    const settings = {

        title: 'Endure',

        currency: 'PEN',

        amount: amount

    };


    // ----------------------------------------------------------------------
    // ORDER DE CULQI
    // ----------------------------------------------------------------------

    if (
        culqiOrderId
    ) {

        settings.order =
            culqiOrderId;

        console.log(
            '🧾 Order de Culqi enviada al Checkout:',
            culqiOrderId
        );

    }


    // ----------------------------------------------------------------------
    // CORREO CLIENTE
    // ----------------------------------------------------------------------

    const client = {

        email:
            checkoutCustomerData?.email ||
            checkoutUser?.email ||
            ''

    };


    const paymentConfig =
        getCulqiPaymentConfig(
            paymentMethod
        );

    const paymentMethods = {

        tarjeta: false,

        yape: false,

        billetera: false,

        bancaMovil: false,

        agente: false,

        cuotealo: false

    };

    paymentConfig.culqiMethods.forEach(method => {

        paymentMethods[method] = true;

    });

    // ----------------------------------------------------------------------
    // OPCIONES
    // ----------------------------------------------------------------------

    const paymentMethodSort =
        paymentConfig.culqiMethods;


    const options = {

        lang: 'es',

        installments: true,

        modal: true,

        paymentMethods,

        paymentMethodsSort: paymentMethodSort

    };


    // ----------------------------------------------------------------------
    // APARIENCIA
    // ----------------------------------------------------------------------

    const appearance = {

        theme: 'default',

        // --------------------------------------------------------------
        // ELEMENTOS DE CULQI
        // --------------------------------------------------------------

        hiddenCulqiLogo: false,

        hiddenBannerContent: false,

        hiddenBanner: false,

        hiddenToolBarAmount: false,

        hiddenEmail: false,

        menuType: 'sidebar',

        buttonCardPayText: 'Pagar',

        logo: null,


        // --------------------------------------------------------------
        // ESTILOS BÁSICOS
        // --------------------------------------------------------------

        defaultStyle: {

            bannerColor: '#112250',

            buttonBackground: '#E0C58F',

            menuColor: '#112250',

            linksColor: '#3C507D',

            buttonTextColor: '#112250',

            priceColor: '#112250'

        },


        // --------------------------------------------------------------
        // VARIABLES
        // --------------------------------------------------------------

        variables: {

            fontFamily: 'Inter, sans-serif',

            fontWeightNormal: '400',

            borderRadius: '8px',

            colorBackground: '#FAF9F6',

            colorPrimary: '#E0C58F',

            colorPrimaryText: '#112250',

            colorText: '#112250',

            colorTextSecondary: '#3C507D',

            colorTextPlaceholder: '#6b7280',

            colorIconTab: '#112250',

            colorLogo: 'dark'

        },


        // --------------------------------------------------------------
        // REGLAS PERSONALIZADAS
        // --------------------------------------------------------------

        rules: {

            // ----------------------------------------------------------
            // CONTENEDOR PRINCIPAL
            // ----------------------------------------------------------

            '.Culqi-Main-Container': {

                background: '#FAF9F6',

                fontFamily: 'var(--fontFamily)'

            },


            // ----------------------------------------------------------
            // CABECERA
            // ----------------------------------------------------------

            '.Culqi-ToolBanner': {

                background: '#112250',

                fontFamily: 'var(--fontFamily)',

                color: '#F5F0E9'

            },


            // ----------------------------------------------------------
            // PRECIO
            // ----------------------------------------------------------

            '.Culqi-Toolbar-Price': {

                color: '#112250',

                fontFamily: 'var(--fontFamily)'

            },

            '.Culqi-Toolbar-Price .Culqi-Icon': {

                color: '#3C507D'

            },


            // ----------------------------------------------------------
            // FORMULARIO
            // ----------------------------------------------------------

            '.Culqi-Main-Method': {

                background: '#FAF9F6',

                color: '#112250',

                fontFamily: 'var(--fontFamily)'

            },


            // ----------------------------------------------------------
            // LABELS
            // ----------------------------------------------------------

            '.Culqi-Label': {

                color: '#112250',

                fontFamily: 'var(--fontFamily)'

            },


            // ----------------------------------------------------------
            // INPUTS
            // ----------------------------------------------------------

            '.Culqi-Input': {

                background: '#FFFFFF',

                border: '1px solid #D9CBC2',

                color: '#112250',

                fontFamily: 'var(--fontFamily)',

                borderRadius: '8px'

            },


            '.Culqi-Input:focus': {

                border: '1px solid #3C507D',

                outline: 'none'

            },


            '.Culqi-Input.input-valid': {

                border: '1px solid #3C507D',

                background: '#FFFFFF',

                color: '#112250'

            },


            // ----------------------------------------------------------
            // PLACEHOLDER
            // ----------------------------------------------------------

            '.Culqi-Input::placeholder': {

                color: '#6b7280'

            },


            // ----------------------------------------------------------
            // SELECT — CUOTAS
            // ----------------------------------------------------------

            '.Culqi-Input-Select': {

                background: '#FFFFFF',

                border: '1px solid #D9CBC2',

                color: '#112250',

                borderRadius: '8px'

            },


            '.Culqi-Input-Select.active': {

                border: '1px solid #3C507D',

                background: '#FFFFFF'

            },


            '.Culqi-Input-Select-Options': {

                background: '#FFFFFF'

            },


            '.Culqi-Input-Select-Options-Hover': {

                background: '#F5F0E9',

                color: '#112250'

            },


            '.Culqi-Input-Select-Selected': {

                color: '#112250'

            },


            // ----------------------------------------------------------
            // BOTÓN PAGAR
            // ----------------------------------------------------------

            '.Culqi-Button': {

                background: '#E0C58F',

                color: '#112250',

                fontFamily: 'var(--fontFamily)',

                borderRadius: '8px'

            },


            // ----------------------------------------------------------
            // LINKS
            // ----------------------------------------------------------

            '.Culqi-Text-Link': {

                color: '#3C507D'

            },


            '.Culqi-Text-Link .Culqi-Icon': {

                color: '#3C507D'

            },


            // ----------------------------------------------------------
            // MENÚ
            // ----------------------------------------------------------

            '.Culqi-Menu': {

                color: '#112250'

            },


            '.Culqi-Menu .Culqi-Icon': {

                color: '#3C507D'

            },


            // ----------------------------------------------------------
            // MENÚ SELECCIONADO
            // ----------------------------------------------------------

            '.Culqi-Menu-Selected': {

                color: '#112250'

            },


            '.Culqi-Menu-Selected .Culqi-Icon': {

                color: '#3C507D'

            }

        }

    };


    // ----------------------------------------------------------------------
    // CONFIGURACIÓN COMPLETA
    // ----------------------------------------------------------------------

    const config = {

        settings,

        client,

        options,

        appearance

    };


    // ----------------------------------------------------------------------
    // CREAR CHECKOUT
    // ----------------------------------------------------------------------

    culqiCheckout =
        new CulqiCheckout(
            CONFIG.CULQI_PUBLIC_KEY,
            config
        );

    console.log('🔍 CulqiCheckout completo:', culqiCheckout);
    console.log(
        '🔍 Propiedades de CulqiCheckout:',
        Object.getOwnPropertyNames(Object.getPrototypeOf(culqiCheckout))
    );
    console.log(
        '🔍 Propiedades propias:',
        Object.keys(culqiCheckout)
    );


    // Escuchar el cierre del Checkout de Culqi
    window.removeEventListener('message', handleCulqiCheckoutMessage);
    window.addEventListener('message', handleCulqiCheckoutMessage);

    // ----------------------------------------------------------------------
    // MANEJAR RESPUESTA DE CULQI
    // ----------------------------------------------------------------------

    culqiCheckout.culqi =
        handleCulqiAction;


    // ----------------------------------------------------------------------
    // ABRIR
    // ----------------------------------------------------------------------

    console.log(
        '💳 Método de pago que llegará a Culqi:',
        paymentMethod
    );

    console.log(
        '💳 Métodos habilitados en Culqi:',
        paymentMethods
    );


    culqiCheckout.open();

}


// ==========================================================================
// RESPUESTA DE CULQI
// ==========================================================================

async function handleCulqiAction() {

    const paymentConfig =
        getCulqiPaymentConfig(
            checkoutPaymentMethod
        );

    // ======================================================================
    // MÉTODOS BASADOS EN ORDER
    // ======================================================================

    if (paymentConfig.requiresOrder) {

        console.log(
            '🧾 Método basado en Order de Culqi.'
        );

        if (culqiCheckout.order) {

            console.log(
                '✅ Respuesta de Order Culqi:',
                culqiCheckout.order
            );

        }

        if (culqiCheckout.error) {

            console.error(
                '❌ Error de Culqi:',
                culqiCheckout.error
            );

        }

        return;
    }


    // ======================================================================
    // MÉTODOS BASADOS EN TOKEN
    // ======================================================================

    if (culqiCheckout.token) {

        const token = culqiCheckout.token;

        console.log(
            '✅ Token Culqi generado:',
            token
        );

        try {

            // --------------------------------------------------------------
            // 1. CREAR PEDIDO
            // --------------------------------------------------------------

            const orderResponse =
                await checkoutApi.createOrder({

                    paymentMethod:
                        checkoutPaymentMethod,

                    customerData:
                        checkoutCustomerData,

                    selectedCartItemIds:
                        checkoutSelectedCartItemIds

                });

            console.log(
                '✅ Pedido creado:',
                orderResponse
            );

            const order = orderResponse.data.order;

            // --------------------------------------------------------------
            // 2. OBTENER ID DEL PEDIDO
            // --------------------------------------------------------------

            const orderId = order.id;

            console.log(
                '🧾 Order ID:',
                orderId
            );

            // --------------------------------------------------------------
            // 3. CREAR CARGO EN CULQI
            // --------------------------------------------------------------

            const paymentResponse =
                await checkoutApi.createCulqiCharge(
                    orderId,
                    token.id,
                    deviceFingerPrintId
                );

            console.log(
                '📦 Respuesta del pago:',
                paymentResponse
            );

            // --------------------------------------------------------------
            // 4. VERIFICAR SI REQUIERE 3DS
            // --------------------------------------------------------------

            if (paymentResponse?.data?.requires3DS) {

                console.log(
                    '🔐 El pago requiere autenticación 3DS.'
                );

                start3DSAuthentication(
                    paymentResponse.data
                );

                return;
            }

            // ======================================================================
            // 5. PAGO COMPLETADO
            // ======================================================================

            if (
                paymentResponse?.data?.order?.paymentStatus === 'PAID'
            ) {

                console.log(
                    '🎉 Compra completada.'
                );

                completedCheckoutData = {
                    order: paymentResponse.data.order
                };

                await refreshCheckoutCart();

                closeSuccessfulCheckout();
            }

        } catch (error) {

            console.error(
                '❌ Error procesando el pago:',
                error
            );
        }

        return;
    }


    // ======================================================================
    // ORDER DE CULQI
    // ======================================================================

    if (culqiCheckout.order) {
        console.log('✅ Order Culqi generada:', culqiCheckout.order);

        console.log(
            '🧾 ORDER CULQI COMPLETA:',
            JSON.stringify(culqiCheckout.order, null, 2)
        );

        console.log(
            '🔑 CAMPOS DISPONIBLES:',
            Object.keys(culqiCheckout.order)
        );

        console.log(
            '💳 payment_code:',
            culqiCheckout.order.payment_code
        );

        console.log(
            '⏰ expiration_date:',
            culqiCheckout.order.expiration_date
        );

        console.log(
            '📱 qr:',
            culqiCheckout.order.qr
        );

        console.log(
            '🔗 url_pe:',
            culqiCheckout.order.url_pe
        );

        console.log(
            '📌 state:',
            culqiCheckout.order.state
        );

        return;
    }


    // ======================================================================
    // ERROR
    // ======================================================================

    console.error(
        '❌ Error de Culqi:',
        culqiCheckout.error
    );
}


// ==========================================================================
// 3DS DE CULQI
// ==========================================================================

async function initializeCulqi3DS() {
    if (!window.Culqi3DS) {
        console.error('❌ Culqi3DS no está disponible.');
        return;
    }

    Culqi3DS.publicKey = CONFIG.CULQI_PUBLIC_KEY;

    try {
        deviceFingerPrintId = await Culqi3DS.generateDevice();

        console.log('✅ Culqi3DS configurado.');
        console.log(
            '🔐 Device Fingerprint ID:',
            deviceFingerPrintId
        );

    } catch (error) {
        console.error(
            '❌ Error generando Device Fingerprint ID:',
            error
        );

        deviceFingerPrintId = null;
    }
}



// ==========================================================================
// RESPUESTA DE 3DS DE CULQI
// ==========================================================================

function handleCulqi3DSMessage(event) {
    // Culqi3DS envía el resultado al mismo origin
    if (event.origin !== window.location.origin) {
        return;
    }

    const response = event.data;

    console.log("📩 Mensaje recibido de Culqi3DS:", response);

    // --------------------------------------------------------------
    // Loading
    // --------------------------------------------------------------

    if (response?.loading) {
        console.log("⏳ Culqi3DS procesando autenticación...");
        return;
    }

    // --------------------------------------------------------------
    // Autenticación exitosa
    // --------------------------------------------------------------

    if (response?.parameters3DS) {
        console.log(
            "✅ Autenticación 3DS completada:",
            response.parameters3DS
        );

        handle3DSSuccess(response.parameters3DS);
        return;
    }

    // --------------------------------------------------------------
    // Error de autenticación
    // --------------------------------------------------------------

    if (response?.error) {
        console.error(
            "❌ Error en autenticación 3DS:",
            response.error
        );

        handle3DSFailure(response.error);
    }
}


// ==========================================================================
// INICIAR 3DS DE CULQI
// ==========================================================================

function start3DSAuthentication(paymentData) {
    if (!window.Culqi3DS) {
        console.error("❌ Culqi3DS no está disponible.");
        return;
    }

    if (!paymentData?.tokenId) {
        console.error(
            "❌ No se recibió tokenId para iniciar 3DS."
        );
        return;
    }

    pending3DSPayment = {
        orderId: paymentData.orderId,
        tokenId: paymentData.tokenId,
        deviceFingerPrintId: paymentData.deviceFingerPrintId
    };

    console.log(
        "🔐 Iniciando autenticación 3DS:",
        pending3DSPayment
    );

    setCheckoutBehind3DS(true);

    // Configuración requerida para esta generación de cargo
    Culqi3DS.settings = {
        charge: {
            totalAmount: paymentData.amount,
            returnUrl:
                `${window.location.origin}${window.location.pathname}`
        },

        card: {
            email: checkoutUser?.email || ""
        }
    };

    Culqi3DS.initAuthentication(
        paymentData.tokenId
    );
}


// ==========================================================================
// RESPUESTAS DE 3DS DE CULQI
// ==========================================================================

async function handle3DSSuccess(parameters3DS) {

    // ======================================================================
    // VERIFICAR PAGO PENDIENTE
    // ======================================================================

    if (!pending3DSPayment) {

        console.error(
            '❌ No existe un pago pendiente para completar con 3DS.'
        );

        return;
    }

    console.log(
        '🔐 Completando pago con autenticación 3DS:',
        parameters3DS
    );

    let paymentSuccessful = false;

    try {

        // ==================================================================
        // 1. OBTENER DATOS DEL PAGO PENDIENTE
        // ==================================================================

        const {
            orderId,
            tokenId,
            deviceFingerPrintId
        } = pending3DSPayment;

        console.log(
            '🧾 Order ID:',
            orderId
        );

        console.log(
            '🔑 Token ID:',
            tokenId
        );

        console.log(
            '🔐 Device Fingerprint ID:',
            deviceFingerPrintId
        );

        // ==================================================================
        // 2. ENVIAR SEGUNDO CARGO A BACKEND
        // ==================================================================

        const paymentResponse =
            await checkoutApi.createCulqiCharge(
                orderId,
                tokenId,
                deviceFingerPrintId,
                parameters3DS
            );

        if (
            paymentResponse?.data?.order?.paymentStatus === 'PAID'
        ) {

            console.log(
                '🎉 Compra completada correctamente.'
            );

            completedCheckoutData = {
                order: paymentResponse.data.order
            };

            await refreshCheckoutCart();

            paymentSuccessful = true;

        } else {

            console.warn(
                '⚠️ El backend respondió, pero la orden no figura como PAID:',
                paymentResponse
            );
        }

    } catch (error) {

        console.error(
            '❌ Error completando el pago 3DS:',
            error
        );

    } finally {

        pending3DSPayment = null;

        if (window.Culqi3DS) {
            Culqi3DS.reset();
        }

        if (paymentSuccessful) {

            await closeCheckoutAfter3DS();

        }

        setCheckoutBehind3DS(false);

    }
}

function handle3DSFailure(error) {

    // ======================================================================
    // ERROR DE AUTENTICACIÓN 3DS
    // ======================================================================

    console.error(
        '❌ La autenticación 3DS no pudo completarse:',
        error
    );

    // ======================================================================
    // LIMPIAR PAGO PENDIENTE
    // ======================================================================
    setCheckoutBehind3DS(false);

    pending3DSPayment = null;

    // ======================================================================
    // REINICIAR CULQI3DS
    // ======================================================================

    if (window.Culqi3DS) {
        Culqi3DS.reset();
    }

    console.log(
        '🔄 Estado de Culqi3DS reiniciado.'
    );
}


// ==========================================================================
// CAPA — CUSTOM CHECKOUT DURANTE 3DS
// ==========================================================================

function setCheckoutBehind3DS(behind) {

    // --------------------------------------------------------------
    // BUSCAR EL IFRAME DEL CUSTOM CHECKOUT
    // --------------------------------------------------------------

    const checkoutFrame =
        document.querySelector('iframe.culqi_checkout');

    if (!checkoutFrame) {

        console.warn(
            '⚠️ No se encontró el iframe del Custom Checkout.'
        );

        return;
    }

    // --------------------------------------------------------------
    // OBTENER CONTENEDOR PADRE
    // --------------------------------------------------------------

    const container =
        checkoutFrame.parentElement;

    if (!container) {

        console.warn(
            '⚠️ No se encontró el contenedor del Custom Checkout.'
        );

        return;
    }

    // --------------------------------------------------------------
    // BAJAR CHECKOUT
    // --------------------------------------------------------------

    if (behind) {

        checkoutContainer = container;

        checkoutOriginalZIndex =
            getComputedStyle(
                checkoutContainer
            ).zIndex;

        checkoutContainer.style.zIndex = '9998';

        console.log(
            '⬇️ Custom Checkout enviado detrás de Culqi3DS.'
        );

        console.log(
            '🔢 z-index original:',
            checkoutOriginalZIndex
        );

        console.log(
            '🔢 z-index temporal:',
            getComputedStyle(
                checkoutContainer
            ).zIndex
        );

        return;
    }

    // --------------------------------------------------------------
    // RESTAURAR CHECKOUT
    // --------------------------------------------------------------

    if (!checkoutContainer) {
        return;
    }

    if (
        checkoutOriginalZIndex &&
        checkoutOriginalZIndex !== 'auto'
    ) {

        checkoutContainer.style.zIndex =
            checkoutOriginalZIndex;

    } else {

        checkoutContainer.style.removeProperty(
            'z-index'
        );
    }

    console.log(
        '⬆️ Custom Checkout restaurado.'
    );

    console.log(
        '🔢 z-index restaurado:',
        getComputedStyle(
            checkoutContainer
        ).zIndex
    );

    checkoutContainer = null;
    checkoutOriginalZIndex = null;
}


// ==========================================================================
// CERRAR CHECKOUT DESPUÉS DE 3DS
// ==========================================================================

function closeCheckoutAfter3DS() {

    return new Promise(resolve => {

        let finished = false;

        let observer = null;

        let timeout = null;


        const finish = async () => {
            if (finished) {
                return;
            }

            finished = true;

            if (observer) {
                observer.disconnect();
            }

            if (timeout) {
                clearTimeout(timeout);
            }

            await closeSuccessfulCheckout();

            console.log(
                '✅ Culqi3DS cerrado. Custom Checkout cerrado.'
            );

            resolve();
        };


        const check3DSClosed = () => {

            const challenge =
                document.querySelector('.modal-challenge');


            // --------------------------------------------------------------
            // El modal ya no existe
            // --------------------------------------------------------------

            if (!challenge) {

                finish();

                return true;
            }


            // --------------------------------------------------------------
            // Verificar si está oculto
            // --------------------------------------------------------------

            const style =
                getComputedStyle(challenge);


            if (
                style.display === 'none' ||
                style.visibility === 'hidden' ||
                style.opacity === '0'
            ) {

                finish();

                return true;
            }


            return false;

        };


        // --------------------------------------------------------------
        // Comprobar inmediatamente
        // --------------------------------------------------------------

        if (check3DSClosed()) {
            return;
        }


        // --------------------------------------------------------------
        // Observar cambios del DOM
        // --------------------------------------------------------------

        observer =
            new MutationObserver(() => {

                check3DSClosed();

            });


        observer.observe(document.body, {

            childList: true,

            subtree: true,

            attributes: true,

            attributeFilter: [
                'style',
                'class'
            ]

        });


        // --------------------------------------------------------------
        // Seguridad
        // --------------------------------------------------------------

        timeout =
            setTimeout(() => {

                if (finished) {
                    return;
                }

                console.warn(
                    '⚠️ Tiempo de espera 3DS agotado.'
                );

                finish();

            }, 3000);

    });

}

// ==========================================================================
// CERRAR CHECKOUT
// ==========================================================================

function closeSuccessfulCheckout() {
    return new Promise(resolve => {

        if (!culqiCheckout) {
            resolve();
            return;
        }

        const checkoutFrame =
            document.querySelector('iframe.culqi_checkout');

        const container =
            checkoutFrame?.parentElement;

        if (!container) {
            culqiCheckout.close();
            resolve();
            return;
        }

        container.style.transition =
            'opacity 250ms ease, transform 250ms ease';

        container.style.opacity = '0';

        container.style.transform =
            'scale(0.96)';

        setTimeout(async () => {

            culqiCheckout.close();

            console.log(
                '✅ Custom Checkout cerrado.'
            );

            container.style.removeProperty('transition');
            container.style.removeProperty('opacity');
            container.style.removeProperty('transform');

            if (
                window.accountCheckout &&
                typeof window.accountCheckout.showStep === 'function'
            ) {
                await window.accountCheckout.showStep('completed');
            }

            resolve();

        }, 250);
    });
}


function getCompletedCheckoutData() {
    return completedCheckoutData;
}


async function handleCulqiCheckoutMessage(event) {

    if (
        event.origin !==
        'https://checkoutview.culqi.com'
    ) {
        return;
    }

    if (
        event.data?.object !==
        'closeCheckout'
    ) {
        return;
    }

    console.log(
        '🔴 Checkout Culqi cerrado por el usuario.'
    );

    // ======================================================================
    // VERIFICAR QUE TENEMOS UNA ORDER INTERNA PENDIENTE
    // ======================================================================

    if (!pendingInternalOrderId) {

        console.warn(
            '⚠️ No existe una Order interna pendiente.'
        );

        return;
    }

    console.log(
        '🧾 Consultando Order interna:',
        pendingInternalOrderId
    );

    try {

        // ==================================================================
        // SINCRONIZAR DATOS DE PAGO DESDE CULQI
        // ==================================================================

        const syncResponse =
            await window.checkoutApi.syncCulqiOrder(
                pendingInternalOrderId
            );

        console.log(
            '🔄 Datos de pago sincronizados desde Culqi:',
            syncResponse
        );

        // ==================================================================
        // OBTENER LA ORDER ACTUALIZADA DESDE EL BACKEND
        // ==================================================================

        const orderResponse =
            await window.accountOrdersApi.getOrder(
                pendingInternalOrderId
            );

        console.log(
            '📦 Order recibida después del cierre:',
            orderResponse
        );

        const order =
            orderResponse?.data?.order;

        if (!order) {

            throw new Error(
                'No se recibió la información completa del pedido.'
            );

        }

        console.log(
            '📊 Estado actual del pedido:',
            order.paymentStatus
        );

        // ==================================================================
        // GUARDAR LOS DATOS DE LA ORDER
        // ==================================================================

        completedCheckoutData = {
            order
        };

        console.log(
            '✅ Datos del pedido preparados:',
            completedCheckoutData
        );

        // ==================================================================
        // ACTUALIZAR CARRITO
        // ==================================================================

        await refreshCheckoutCart();

        // ==================================================================
        // PASAR A LA ETAPA COMPLETED
        // ==================================================================

        if (
            window.accountCheckout &&
            typeof window.accountCheckout.showStep === 'function'
        ) {

            await window.accountCheckout.showStep(
                'completed'
            );

        }

    } catch (error) {

        console.error(
            '❌ Error obteniendo la Order después del cierre de Culqi:',
            error
        );

    }

}


// ==========================================================================
// EXPONER MÓDULO
// ==========================================================================

window.checkout = {

    init,
    startCheckout,
    getCompletedCheckoutData,
    initializePaymentEvents,
    setCheckoutCartSource

};