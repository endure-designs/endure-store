// ==========================================================================
// ACCOUNT CHECKOUT COMPLETED
// ==========================================================================


let completedInitialized = false;


// ==========================================================================
// INICIALIZACIÓN
// ==========================================================================

function init() {

    if (completedInitialized) {
        return;
    }

    completedInitialized = true;

    bindEvents();

    console.log('✅ Lógica de checkout completado inicializada.');
}


// ==========================================================================
// EVENTOS
// ==========================================================================

function bindEvents() {

    document.addEventListener('click', event => {

        // ------------------------------------------------------------------
        // VER MIS PEDIDOS
        // ------------------------------------------------------------------

        const viewOrdersButton =
            event.target.closest(
                '#checkoutCompletedViewOrders'
            );

        if (viewOrdersButton) {

            event.preventDefault();

            handleViewOrders();

            return;
        }


        // ------------------------------------------------------------------
        // SEGUIR COMPRANDO
        // ------------------------------------------------------------------

        const continueShoppingButton =
            event.target.closest(
                '#checkoutCompletedContinueShopping'
            );

        if (continueShoppingButton) {

            event.preventDefault();

            handleContinueShopping();

            return;
        }

    });

}

// ==========================================================================
// DESPLAZAR AL INICIO DEL CHECKOUT COMPLETADO
// Funciona en modal y en checkout dentro de una página
// ==========================================================================

function scrollToCompletedStepTop() {
    const completedSection = document.getElementById(
        'checkoutStepCompleted'
    );

    if (!completedSection) {
        console.warn(
            'No se encontró #checkoutStepCompleted.'
        );
        return;
    }

    // Buscar el ancestro que realmente tiene el scroll vertical.
    let scrollContainer = completedSection.parentElement;

    while (scrollContainer && scrollContainer !== document.body) {
        const styles = window.getComputedStyle(scrollContainer);
        const overflowY = styles.overflowY;

        const allowsScroll =
            ['auto', 'scroll', 'overlay'].includes(overflowY);

        const hasScrollableContent =
            scrollContainer.scrollHeight >
            scrollContainer.clientHeight + 1;

        if (allowsScroll && hasScrollableContent) {
            break;
        }

        scrollContainer = scrollContainer.parentElement;
    }

    // Si se encontró un contenedor desplazable, calcular
    // la posición exacta de la etapa dentro de él.
    if (
        scrollContainer &&
        scrollContainer !== document.body
    ) {
        const containerRect =
            scrollContainer.getBoundingClientRect();

        const sectionRect =
            completedSection.getBoundingClientRect();

        const targetScrollTop =
            scrollContainer.scrollTop +
            sectionRect.top -
            containerRect.top;

        scrollContainer.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: 'auto'
        });

        console.log(
            'Scroll del checkout aplicado al contenedor:',
            scrollContainer
        );

        return;
    }

    // Si no existe un contenedor interno desplazable,
    // utilizar el scroll de la página.
    const sectionTop =
        completedSection.getBoundingClientRect().top +
        window.scrollY;

    window.scrollTo({
        top: Math.max(0, sectionTop),
        behavior: 'auto'
    });

    console.log(
        'Scroll del checkout aplicado a la página.'
    );
}


// ==========================================================================
// CARGAR ETAPA COMPLETADA
// ==========================================================================

async function loadCompletedStep() {

    console.log('📦 Cargando etapa de pedido completado...');


    // ----------------------------------------------------------------------
    // OBTENER DATOS DEL PEDIDO
    // ----------------------------------------------------------------------

    if (
        !window.checkout ||
        typeof window.checkout.getCompletedCheckoutData !== 'function'
    ) {

        console.error(
            '❌ No está disponible getCompletedCheckoutData().'
        );

        return;

    }


    const completedCheckoutData =
        window.checkout.getCompletedCheckoutData();


    if (
        !completedCheckoutData ||
        !completedCheckoutData.order
    ) {

        console.error(
            '❌ No existen datos del pedido completado.'
        );

        return;

    }


    const order = completedCheckoutData.order;


    console.log(
        '📦 Pedido completado recibido:',
        order
    );


    // ----------------------------------------------------------------------
    // ESTADO DEL CHECKOUT
    // ----------------------------------------------------------------------

    renderCompletionState(order);

    // ----------------------------------------------------------------------
    // DATOS PRINCIPALES
    // ----------------------------------------------------------------------

    renderOrderInfo(order);


    // ----------------------------------------------------------------------
    // INFORMACIÓN DE PAGO
    // ----------------------------------------------------------------------

    renderPaymentInfo(order);


    // ----------------------------------------------------------------------
    // PRODUCTOS
    // ----------------------------------------------------------------------

    renderProducts(order);


    // ----------------------------------------------------------------------
    // RESUMEN
    // ----------------------------------------------------------------------

    renderSummary(order);


    // Llevar la vista al inicio al completar la compra.
    requestAnimationFrame(() => {
        scrollToCompletedStepTop();
    });

    console.log(
        '✅ Etapa de pedido completado cargada.'
    );

}


// ==========================================================================
// ESTADO DE LA ETAPA COMPLETADA
// ==========================================================================

function renderCompletionState(order) {

    const completedSection =
        document.getElementById('checkoutStepCompleted');

    if (!completedSection) {
        console.warn(
            '⚠️ No se encontró checkoutStepCompleted.'
        );
        return;
    }

    const titleElement =
        completedSection.querySelector(
            '.checkout-completed-title'
        );

    const messageElement =
        completedSection.querySelector(
            '.checkout-completed-message'
        );

    if (!titleElement || !messageElement) {
        console.warn(
            '⚠️ No se encontraron el título o mensaje del checkout completado.'
        );
        return;
    }

    // ----------------------------------------------------------------------
    // PAGO PENDIENTE — PAGOEFECTIVO
    // ----------------------------------------------------------------------

    if (
        order.paymentStatus === 'PENDING' &&
        order.paymentMethod === 'PAGO_EFECTIVO'
    ) {

        titleElement.textContent =
            'Completa tu pago para recibir tu compra';

        messageElement.textContent =
            'Tu pedido fue generado correctamente. Completa el pago mediante PagoEfectivo dentro del plazo indicado.';

        return;
    }

    // ----------------------------------------------------------------------
    // PAGO REALIZADO
    // ----------------------------------------------------------------------

    if (order.paymentStatus === 'PAID') {

        titleElement.textContent =
            '¡Pedido realizado correctamente!';

        messageElement.textContent =
            'Hemos recibido tu pedido y el pago se procesó correctamente.';

        return;
    }

    // ----------------------------------------------------------------------
    // OTROS ESTADOS
    // ----------------------------------------------------------------------

    titleElement.textContent =
        '¡Pedido realizado correctamente!';

    messageElement.textContent =
        'Tu pedido fue generado correctamente.';
}


// ==========================================================================
// INFORMACIÓN PRINCIPAL DEL PEDIDO
// ==========================================================================

function renderOrderInfo(order) {

    const orderId = document.getElementById(
        'checkoutCompletedOrderId'
    );

    const orderDate = document.getElementById(
        'checkoutCompletedOrderDate'
    );

    const paymentMethod = document.getElementById(
        'checkoutCompletedPaymentMethod'
    );

    const total = document.getElementById(
        'checkoutCompletedTotal'
    );

    const orderStatus = document.getElementById(
        'checkoutCompletedOrderStatus'
    );


    // ----------------------------------------------------------------------
    // NÚMERO DE PEDIDO
    // ----------------------------------------------------------------------

    if (orderId) {

        orderId.textContent = `#${order.id}`;

    }


    // ----------------------------------------------------------------------
    // FECHA
    // ----------------------------------------------------------------------

    if (orderDate) {

        orderDate.textContent = formatDate(
            order.createdAt
        );

    }


    // ----------------------------------------------------------------------
    // MÉTODO DE PAGO
    // ----------------------------------------------------------------------

    if (paymentMethod) {

        paymentMethod.textContent =
            formatPaymentMethod(order.paymentMethod);

    }


    // ----------------------------------------------------------------------
    // TOTAL
    // ----------------------------------------------------------------------

    if (total) {

        total.textContent =
            formatCurrency(order.total);

    }


    // ----------------------------------------------------------------------
    // ESTADO
    // ----------------------------------------------------------------------

    if (orderStatus) {

        orderStatus.textContent =
            formatOrderStatus(order.paymentStatus);

    }

}


// ==========================================================================
// INFORMACIÓN DE PAGO
// ==========================================================================

function renderPaymentInfo(order) {

    const paymentSection =
        document.getElementById(
            'checkoutCompletedPaymentInfo'
        );


    if (!paymentSection) {
        return;
    }


    // ----------------------------------------------------------------------
    // OCULTAR Y LIMPIAR POR DEFECTO
    // ----------------------------------------------------------------------

    paymentSection.style.display = 'none';
    paymentSection.innerHTML = '';


    // ----------------------------------------------------------------------
    // PAGOEFECTIVO PENDIENTE
    // ----------------------------------------------------------------------

    if (
        order.paymentMethod === 'PAGO_EFECTIVO' &&
        order.paymentStatus === 'PENDING'
    ) {

        const paymentReference =
            order.paymentReference || '—';


        const paymentExpiresAt =
            formatDate(order.paymentExpiresAt);


        const paymentQrUrl =
            order.paymentQrUrl || null;


        const paymentUrl =
            order.paymentUrl || null;


        // ------------------------------------------------------------------
        // CONTENIDO
        // ------------------------------------------------------------------

        paymentSection.innerHTML = `

            <div class="checkout-completed-payment-header">

                <div class="checkout-completed-payment-icon">
                    <i class="fa-solid fa-money-bill-wave"></i>
                </div>

                <div>

                    <h3>
                        Datos para realizar el pago
                    </h3>

                    <p>
                        Utiliza los siguientes datos para completar
                        el pago de tu pedido mediante PagoEfectivo.
                    </p>

                </div>

            </div>


            <div class="checkout-completed-payment-content">


                <!-- ==================================================
                     CÓDIGO DE PAGO
                     ================================================== -->

                <div class="checkout-completed-payment-code">

                    <span class="checkout-completed-payment-label">
                        Código CIP
                    </span>

                    <strong class="checkout-completed-payment-reference">
                        ${paymentReference}
                    </strong>

                </div>


                <!-- ==================================================
                     EXPIRACIÓN
                     ================================================== -->

                <div class="checkout-completed-payment-expiration">

                    <span class="checkout-completed-payment-label">
                        Válido hasta
                    </span>

                    <strong>
                        ${paymentExpiresAt}
                    </strong>

                </div>


                <!-- ==================================================
                     BOTÓN PAGAR
                     ================================================== -->

                ${paymentUrl
                ? `
                            <div class="checkout-completed-payment-action">

                                <a
                                    href="${paymentUrl}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="checkout-completed-payment-button"
                                >

                                    <img
                                        src="assets/checkout/Pago-Efectivo-logo.svg"
                                        alt="PagoEfectivo"
                                        class="checkout-completed-payment-button-logo"
                                    >

                                    <span>
                                        Pagar con PagoEfectivo
                                    </span>

                                </a>

                            </div>
                        `
                : ''
            }


                <!-- ==================================================
                     QR
                     ================================================== -->

                ${paymentQrUrl
                ? `
                            <div class="checkout-completed-payment-qr">

                                <div class="checkout-completed-payment-qr-header">

                                    <h4>
                                        Paga con código QR
                                    </h4>

                                    <p>
                                        Escanea este código QR para completar el pago.
                                    </p>

                                </div>


                                <div class="checkout-completed-payment-qr-box">

                                    <img
                                        src="${paymentQrUrl}"
                                        alt="Código QR de PagoEfectivo"
                                        class="checkout-completed-payment-qr-image"
                                    >

                                </div>

                            </div>
                        `
                : ''
            }


            </div>

        `;


        // ------------------------------------------------------------------
        // MOSTRAR SECCIÓN
        // ------------------------------------------------------------------

        paymentSection.style.display = 'block';

        return;
    }


    // ----------------------------------------------------------------------
    // PAGOEFECTIVO YA PAGADO
    // ----------------------------------------------------------------------

    if (
        order.paymentMethod === 'PAGO_EFECTIVO' &&
        order.paymentStatus === 'PAID'
    ) {

        paymentSection.innerHTML = `

            <div class="checkout-completed-payment-success">

                <div class="checkout-completed-payment-success-icon">
                    <i class="fa-solid fa-circle-check"></i>
                </div>

                <div>

                    <h3>
                        Pago confirmado
                    </h3>

                    <p>
                        Hemos recibido correctamente el pago
                        de tu pedido.
                    </p>

                </div>

            </div>

        `;


        paymentSection.style.display = 'block';

        return;
    }


    // ----------------------------------------------------------------------
    // OTROS MÉTODOS
    // ----------------------------------------------------------------------

    // Para CARD, YAPE, WALLET y CUOTEALO no mostramos
    // información adicional en esta sección por ahora.

}


// ==========================================================================
// PRODUCTOS
// ==========================================================================

function renderProducts(order) {

    const container = document.getElementById(
        'checkoutCompletedProductsList'
    );


    if (!container) {
        return;
    }


    container.innerHTML = '';


    if (
        !Array.isArray(order.items) ||
        order.items.length === 0
    ) {

        container.innerHTML = `
            <div class="checkout-completed-product-empty">
                No se encontraron productos en este pedido.
            </div>
        `;

        return;

    }


    order.items.forEach(item => {

        const productElement =
            createProductElement(item);

        container.appendChild(productElement);

    });

}


// ==========================================================================
// CREAR PRODUCTO
// ==========================================================================

function createProductElement(item) {

    const productElement =
        document.createElement('div');

    productElement.className =
        'checkout-completed-product';


    // ----------------------------------------------------------------------
    // IMAGEN DEL PRODUCTO
    // ----------------------------------------------------------------------

    const imageContainer =
        document.createElement('div');

    imageContainer.className =
        'checkout-completed-product-image';


    if (item.image) {

        const image =
            document.createElement('img');

        image.src = item.image;

        image.alt =
            item.productName || 'Producto';

        image.loading = 'lazy';

        imageContainer.appendChild(image);

    }


    // ----------------------------------------------------------------------
    // INFORMACIÓN DEL PRODUCTO
    // ----------------------------------------------------------------------

    const productInfo =
        document.createElement('div');

    productInfo.className =
        'checkout-completed-product-info';


    const productName =
        document.createElement('h4');

    productName.textContent =
        item.productName || 'Producto';


    productInfo.appendChild(productName);


    // ----------------------------------------------------------------------
    // ATRIBUTOS
    // ----------------------------------------------------------------------

    if (
        Array.isArray(item.attributes) &&
        item.attributes.length > 0
    ) {

        const attributes =
            document.createElement('div');

        attributes.className =
            'checkout-completed-product-attributes';


        item.attributes.forEach(attribute => {

            const attributeElement =
                document.createElement('span');

            attributeElement.className =
                'checkout-completed-product-attribute';

            attributeElement.textContent =
                `${attribute.name}: ${attribute.value}`;


            attributes.appendChild(
                attributeElement
            );

        });


        productInfo.appendChild(
            attributes
        );

    }


    // ----------------------------------------------------------------------
    // CANTIDAD
    // ----------------------------------------------------------------------

    const quantity =
        document.createElement('span');

    quantity.className =
        'checkout-completed-product-quantity';

    quantity.textContent =
        `Cantidad: ${item.quantity}`;


    productInfo.appendChild(
        quantity
    );


    // ----------------------------------------------------------------------
    // PRECIO
    // ----------------------------------------------------------------------

    const price =
        document.createElement('div');

    price.className =
        'checkout-completed-product-price';


    const unitPrice =
        Number(item.unitPrice || 0);

    const compareAtPrice =
        item.compareAtPrice !== null &&
            item.compareAtPrice !== undefined
            ? Number(item.compareAtPrice)
            : null;


    // ----------------------------------------------------------------------
    // PRECIO ANTERIOR — SOLO SI ES MAYOR AL PRECIO ACTUAL
    // ----------------------------------------------------------------------

    if (
        compareAtPrice !== null &&
        compareAtPrice > unitPrice
    ) {

        const oldPrice =
            document.createElement('span');

        oldPrice.className =
            'checkout-completed-product-price-old';

        oldPrice.textContent =
            formatCurrency(compareAtPrice);


        price.appendChild(
            oldPrice
        );

    }


    // ----------------------------------------------------------------------
    // PRECIO UNITARIO ACTUAL
    // ----------------------------------------------------------------------

    const currentPrice =
        document.createElement('span');

    currentPrice.className =
        'checkout-completed-product-price-current';

    currentPrice.textContent =
        `Precio unitario: ${formatCurrency(unitPrice)}`;


    price.appendChild(
        currentPrice
    );


    // ----------------------------------------------------------------------
    // TOTAL DEL PRODUCTO
    // ----------------------------------------------------------------------

    const totalPrice =
        document.createElement('strong');

    const itemTotal =
        unitPrice *
        Number(item.quantity || 0);

    totalPrice.textContent =
        formatCurrency(itemTotal);


    price.appendChild(
        totalPrice
    );


    // ----------------------------------------------------------------------
    // ENSAMBLAR
    // ----------------------------------------------------------------------

    productElement.appendChild(
        imageContainer
    );

    productElement.appendChild(
        productInfo
    );

    productElement.appendChild(
        price
    );


    return productElement;

}


// ==========================================================================
// RESUMEN ECONÓMICO
// ==========================================================================

function renderSummary(order) {

    const subtotal =
        document.getElementById(
            'checkoutCompletedSubtotal'
        );

    const shipping =
        document.getElementById(
            'checkoutCompletedShipping'
        );

    const discount =
        document.getElementById(
            'checkoutCompletedDiscount'
        );

    const total =
        document.getElementById(
            'checkoutCompletedFinalTotal'
        );


    if (subtotal) {

        subtotal.textContent =
            formatCurrency(order.subtotal);

    }


    if (shipping) {

        shipping.textContent =
            formatCurrency(order.shipping);

    }


    if (discount) {

        discount.textContent =
            formatCurrency(order.discount);

    }


    if (total) {

        total.textContent =
            formatCurrency(order.total);

    }

}


// ==========================================================================
// FORMATEAR MONEDA
// ==========================================================================

function formatCurrency(value) {

    const amount =
        Number(value || 0);


    return new Intl.NumberFormat(
        'es-PE',
        {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(amount);

}


// ==========================================================================
// FORMATEAR FECHA
// ==========================================================================

function formatDate(value) {

    if (!value) {
        return '—';
    }


    const date =
        new Date(value);


    if (Number.isNaN(date.getTime())) {
        return '—';
    }


    return new Intl.DateTimeFormat(
        'es-PE',
        {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }
    ).format(date);

}


// ==========================================================================
// FORMATEAR MÉTODO DE PAGO
// ==========================================================================

function formatPaymentMethod(method) {

    const methods = {

        CARD: 'Tarjeta',

        YAPE: 'Yape',

        WALLET: 'Billetera digital',

        PAGO_EFECTIVO: 'PagoEfectivo',

        CUOTEALO: 'Cuotéalo'

    };


    return methods[method] || method || '—';

}


// ==========================================================================
// FORMATEAR ESTADO DEL PAGO
// ==========================================================================

function formatOrderStatus(status) {

    const statuses = {

        PAID: 'Pagado',

        PENDING: 'Pendiente',

        FAILED: 'Pago rechazado',

        REFUNDED: 'Reembolsado',

        CANCELLED: 'Cancelado'

    };


    return statuses[status] || status || '—';

}


// ==========================================================================
// ACTUALIZAR PEDIDO COMPLETADO
// ==========================================================================

function refreshCompletedOrder(order) {

    if (!order) {
        console.warn(
            '⚠️ No se recibió una Order para actualizar.'
        );

        return;
    }


    console.log(
        '🔄 Actualizando etapa completed:',
        order
    );


    // ----------------------------------------------------------------------
    // ACTUALIZAR ESTADO DEL CHECKOUT
    // ----------------------------------------------------------------------

    renderCompletionState(order);


    // ----------------------------------------------------------------------
    // ACTUALIZAR INFORMACIÓN PRINCIPAL
    // ----------------------------------------------------------------------

    renderOrderInfo(order);


    // ----------------------------------------------------------------------
    // ACTUALIZAR INFORMACIÓN DE PAGO
    // ----------------------------------------------------------------------

    renderPaymentInfo(order);


    console.log(
        '✅ Etapa completed actualizada.'
    );

}


// ==========================================================================
// VER MIS PEDIDOS
// ==========================================================================

function handleViewOrders() {

    console.log('🟣 VER MIS PEDIDOS EJECUTADO');


    // ------------------------------------------------------------------
    // CHECKOUT ABIERTO DESDE INDEX
    // ------------------------------------------------------------------

    const checkoutModal =
        document.getElementById('checkoutModal');

    const modalIsOpen =
        checkoutModal &&
        checkoutModal.classList.contains('open');


    if (modalIsOpen) {

        if (
            window.closeCheckoutModal &&
            typeof window.closeCheckoutModal === 'function'
        ) {
            window.closeCheckoutModal();
        }


        // Indicar a account.html que debe abrir "Mis compras"
        sessionStorage.setItem(
            'openAccountTab',
            'orders'
        );


        window.location.href =
            'account.html';

        return;
    }


    // ------------------------------------------------------------------
    // CHECKOUT ABIERTO DESDE ACCOUNT
    // ------------------------------------------------------------------

    if (
        window.accountCheckout &&
        typeof window.accountCheckout.showCart === 'function'
    ) {
        window.accountCheckout.showCart();
    }


    const ordersTab =
        document.querySelector(
            '.menu-tab[data-tab="orders"]'
        );

    if (ordersTab) {

        ordersTab.click();

    }

}


// ==========================================================================
// SEGUIR COMPRANDO
// ==========================================================================

function handleContinueShopping() {

    console.log('🟣 SEGUIR COMPRANDO EJECUTADO');


    // Si estamos dentro del modal, cerrarlo
    const checkoutModal =
        document.getElementById('checkoutModal');

    const modalIsOpen =
        checkoutModal &&
        checkoutModal.classList.contains('open');


    if (modalIsOpen) {

        if (
            window.closeCheckoutModal &&
            typeof window.closeCheckoutModal === 'function'
        ) {
            window.closeCheckoutModal();
        }

    }


    window.location.href =
        'index.html#productos';

}

// ==========================================================================
// EXPORTACIÓN
// ==========================================================================

window.accountCheckoutCompleted = {

    init,

    loadCompletedStep,

    refreshCompletedOrder

};