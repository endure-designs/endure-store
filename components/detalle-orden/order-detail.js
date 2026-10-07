// ==========================================================================
// ENDURE - ORDER DETAIL
// ==========================================================================

let orderDetailInitialized = false;
let currentOrderId = null;
let currentOrderDetailOrigin = 'orders';
let currentOrderDetailReturnPage = 1;
let orderDetailPaymentEventSource = null;


// ==========================================================================
// INICIALIZAR
// ==========================================================================

function init() {

    if (orderDetailInitialized) {
        return;
    }

    orderDetailInitialized = true;

    document.addEventListener(
        'click',
        handleOrderDetailClick
    );


}


// ==========================================================================
// EVENTOS
// ==========================================================================

function handleOrderDetailClick(event) {

    const backButton = event.target.closest(
        '#accountOrderDetailBack, #accountOrderDetailBackBottom'
    );

    if (!backButton) {
        return;
    }

    // Si regresamos a Mis Compras, conservar la página
    // desde la cual se abrió el pedido.
    if (
        currentOrderDetailOrigin === 'orders' &&
        window.accountOrders &&
        typeof window.accountOrders.setCurrentPage === 'function'
    ) {
        window.accountOrders.setCurrentPage(
            currentOrderDetailReturnPage
        );
    }

    const targetTab = document.querySelector(
        `.menu-tab[data-tab="${currentOrderDetailOrigin}"]`
    );

    if (targetTab) {
        targetTab.click();
    }

    hide();
}


// ==========================================================================
// MOSTRAR DETALLE DE PEDIDO
// ==========================================================================

async function show(
    orderId,
    order,
    origin = 'orders',
    returnPage = 1
) {

    const id = Number(orderId);

    if (!Number.isInteger(id) || id <= 0) {

        console.error(
            '❌ ID de pedido no válido:',
            orderId
        );

        return;
    }


    const container =
        document.getElementById(
            'accountOrderDetailContainer'
        );

    if (!container) {

        console.error(
            '❌ No existe #accountOrderDetailContainer'
        );

        return;
    }


    if (!order || typeof order !== 'object') {

        console.error(
            '❌ No se recibieron datos válidos del pedido.'
        );

        return;
    }


    currentOrderId = id;
    currentOrderDetailOrigin = origin;
    currentOrderDetailReturnPage =
        Number.isInteger(Number(returnPage)) && Number(returnPage) > 0
            ? Number(returnPage)
            : 1;


    // ======================================================================
    // INICIALIZAR SSE DE PAGOS
    // ======================================================================

    if (
        window.checkout &&
        typeof window.checkout.initializePaymentEvents === 'function'
    ) {
        window.checkout.initializePaymentEvents();
    }

    // ======================================================================
    // RENDERIZAR PEDIDO
    // ======================================================================

    renderOrder(order);


    container.hidden = false;
    container.style.display = 'block';
    container.scrollTop = 0;

    document.body.classList.add('order-detail-open');


    // ======================================================================
    // MOSTRAR COMPONENTE
    // ======================================================================

    const detail =
        document.getElementById(
            'accountOrderDetail'
        );

    if (detail) {
        detail.style.display = 'block';
    }

}


// ==========================================================================
// OCULTAR DETALLE
// ==========================================================================

function hide() {

    const container =
        document.getElementById(
            'accountOrderDetailContainer'
        );

    if (!container) {
        return;
    }

    // ======================================================================
    // 1. QUITAR EL FOCO DEL BOTÓN DE VOLVER
    // ======================================================================

    if (
        document.activeElement &&
        typeof document.activeElement.blur === 'function'
    ) {
        document.activeElement.blur();
    }

    // ======================================================================
    // 2. OCULTAR DETALLE
    // ======================================================================

    container.hidden = true;
    container.style.display = 'none';

    document.body.classList.remove('order-detail-open');

    const detail =
        document.getElementById(
            'accountOrderDetail'
        );

    if (detail) {
        detail.style.display = 'none';
    }

    // ======================================================================
    // 4. LIMPIAR REFERENCIA
    // ======================================================================

    currentOrderId = null;

}


// ==========================================================================
// RENDERIZAR PEDIDO
// ==========================================================================

function renderOrder(order) {

    renderHeader(order);

    renderProductsOrderDetail(order);

    renderShippingAddress(order);

    renderBillingAddress(order);

    renderSummaryOrderDetails(order);
}


// ==========================================================================
// CABECERA
// ==========================================================================

function renderHeader(order) {

    setText(
        'accountOrderDetailSubtitle',
        `Pedido #${order.id ?? '—'}`
    );


    setText(
        'accountOrderDetailOrderId',
        order.id ?? '—'
    );


    setText(
        'accountOrderDetailOrderDate',
        formatDate(order.createdAt)
    );


    // ======================================================================
    // ESTADO CON COLOR CONTEXTUAL
    // ======================================================================

    const statusElement =
        document.getElementById(
            'accountOrderDetailStatus'
        );

    if (statusElement) {

        statusElement.textContent =
            formatOrderStatus(order.status);

        // Limpiar clases de estado anteriores
        statusElement.classList.remove(
            'account-order-detail-status-pending',
            'account-order-detail-status-paid',
            'account-order-detail-status-cancelled'
        );

        // Aplicar clase según el estado
        const statusClassMap = {
            PENDING: 'account-order-detail-status-pending',
            PAID: 'account-order-detail-status-paid',
            PROCESSING: 'account-order-detail-status-paid',
            SHIPPED: 'account-order-detail-status-paid',
            DELIVERED: 'account-order-detail-status-paid',
            COMPLETED: 'account-order-detail-status-paid',
            CANCELLED: 'account-order-detail-status-cancelled',
            REFUNDED: 'account-order-detail-status-cancelled'
        };

        const statusClass =
            statusClassMap[order.status] || '';

        if (statusClass) {
            statusElement.classList.add(statusClass);
        }

    }


    setText(
        'accountOrderDetailPaymentMethod',
        formatPaymentMethod(order.paymentMethod)
    );


    setText(
        'accountOrderDetailPaymentStatus',
        formatPaymentStatus(order.paymentStatus)
    );


    // ======================================================================
    // INFORMACIÓN DE PAGO
    // ======================================================================

    const paymentSection =
        document.getElementById(
            'accountOrderDetailPaymentSection'
        );

    if (paymentSection) {

        // Ocultar y limpiar por defecto
        paymentSection.style.display = 'none';
        paymentSection.innerHTML = '';

        if (
            order.status === 'PENDING' &&
            order.paymentMethod === 'PAGO_EFECTIVO'
        ) {

            const paymentReference =
                order.paymentReference || '—';

            const paymentExpiresAt =
                formatDate(order.paymentExpiresAt);

            const paymentQrUrl =
                order.paymentQrUrl || null;

            const paymentUrl =
                order.paymentUrl || null;


            paymentSection.innerHTML = `

                <div class="checkout-completed-payment-header">

                    <div class="checkout-completed-payment-icon">
                        <i class="fa-solid fa-money-bill-wave"></i>
                    </div>

                    <div>

                        <h3>
                            Información de pago
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
                            ${escapeHTML(paymentReference)}
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
                            ${escapeHTML(paymentExpiresAt)}
                        </strong>

                    </div>


                    <!-- ==================================================
                         BOTÓN PAGAR
                         ================================================== -->

                    ${paymentUrl
                    ? `
                        <div class="checkout-completed-payment-action">

                            <a
                                href="${escapeAttribute(paymentUrl)}"
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
                                    src="${escapeAttribute(paymentQrUrl)}"
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


            paymentSection.style.display = '';

        }

    }


    // ======================================================================
    // SEGUIMIENTO
    // ======================================================================

    const trackingContainer =
        document.getElementById(
            'accountOrderDetailTrackingContainer'
        );

    const trackingCode =
        document.getElementById(
            'accountOrderDetailTrackingCode'
        );


    if (
        trackingContainer &&
        trackingCode
    ) {

        if (order.trackingCode) {

            trackingCode.textContent =
                order.trackingCode;

            trackingContainer.style.display =
                '';

        } else {

            trackingCode.textContent =
                '—';

            trackingContainer.style.display =
                'none';

        }

    }


    // ======================================================================
    // MÉTODO DE ENTREGA
    // ======================================================================

    const deliveryMethod =
        order.shippingAddress
            ? 'Envío a domicilio'
            : 'Recojo en tienda';


    setText(
        'accountOrderDetailDeliveryMethod',
        deliveryMethod
    );

}


// ==========================================================================
// PRODUCTOS
// ==========================================================================

function renderProductsOrderDetail(order) {

    const container =
        document.getElementById(
            'accountOrderDetailProducts'
        );

    const countElement =
        document.getElementById(
            'accountOrderDetailProductCount'
        );


    if (!container) {

        console.error(
            '❌ NO SE ENCONTRÓ #accountOrderDetailProducts'
        );

        return;
    }


    const items =
        Array.isArray(order.items)
            ? order.items
            : [];

    if (countElement) {

        countElement.textContent =
            `${items.length} ${items.length === 1
                ? 'producto'
                : 'productos'
            }`;

    } else {

        console.error(
            '❌ NO SE ENCONTRÓ #accountOrderDetailProductCount'
        );

    }


    if (!items.length) {

        container.innerHTML = `
            <div class="account-order-detail-empty">
                No hay productos registrados en este pedido.
            </div>
        `;

        return;
    }


    container.innerHTML =
        items
            .map(createProductHTML)
            .join('');
}


// ==========================================================================
// HTML DE PRODUCTO
// ==========================================================================

function createProductHTML(item) {

    const image =
        item.image
            ? getMediaUrl(item.image)
            : '';


    const attributes =
        Array.isArray(item.attributes)
            ? item.attributes
            : [];


    const attributesHTML =
        attributes.length
            ? `
                <div class="account-order-detail-product-attributes">
                    ${attributes
                .map(attribute => `
                            <span>
                                <strong>${escapeHTML(attribute.name)}:</strong>
                                ${escapeHTML(attribute.value)}
                            </span>
                        `)
                .join('')}
                </div>
            `
            : '';


    const oldPrice =
        item.compareAtPrice !== null &&
            item.compareAtPrice !== undefined &&
            Number(item.compareAtPrice) >
            Number(item.unitPrice)
            ? `
                <span class="account-order-detail-product-price-old">
                    ${formatMoney(item.compareAtPrice)}
                </span>
            `
            : '';


    const imageHTML =
        image
            ? `
                <img
                    src="${escapeAttribute(image)}"
                    alt="${escapeAttribute(item.productName || 'Producto')}"
                    class="account-order-detail-product-image"
                >
            `
            : `
                <div class="account-order-detail-product-image-placeholder">
                    <i class="fa-solid fa-image"></i>
                </div>
            `;


    const quantity =
        Number(item.quantity) || 0;


    const unitPrice =
        Number(item.unitPrice) || 0;


    const total =
        unitPrice * quantity;


    return `
        <div class="account-order-detail-product">

            <div class="account-order-detail-product-image-container">
                ${imageHTML}
            </div>


            <div class="account-order-detail-product-info">

                <h4 class="account-order-detail-product-name">
                    ${escapeHTML(item.productName || 'Producto')}
                </h4>


                ${item.sku
            ? `
                            <span class="account-order-detail-product-sku">
                                SKU: ${escapeHTML(item.sku)}
                            </span>
                        `
            : ''
        }


                ${attributesHTML}


                <div class="account-order-detail-product-meta">

                    <span>
                        Cantidad: ${quantity}
                    </span>


                    <span>
                        Precio unitario:
                        ${oldPrice}
                        <strong>
                            ${formatMoney(unitPrice)}
                        </strong>
                    </span>

                </div>

            </div>


            <div class="account-order-detail-product-total">
                ${formatMoney(total)}
            </div>

        </div>
    `;

}


// ==========================================================================
// DIRECCIÓN DE ENTREGA
// ==========================================================================

function renderShippingAddress(order) {

    const section =
        document.getElementById(
            'accountOrderDetailShippingSection'
        );

    const container =
        document.getElementById(
            'accountOrderDetailShipping'
        );


    if (!section || !container) {
        return;
    }


    const address =
        order.shippingAddress;


    // STORE_PICKUP
    if (!address) {

        section.style.display = 'none';

        return;
    }


    section.style.display = '';


    container.innerHTML =
        createAddressHTML(address);

}


// ==========================================================================
// DATOS DE FACTURACIÓN
// ==========================================================================

function renderBillingAddress(order) {

    const container =
        document.getElementById(
            'accountOrderDetailBilling'
        );


    if (!container) {
        return;
    }


    const billing =
        order.billingAddress;


    if (!billing) {

        container.innerHTML = `
            <div class="account-order-detail-empty">
                No hay datos de facturación registrados.
            </div>
        `;

        return;
    }


    const documentType =
        formatDocumentType(
            billing.documentType
        );


    let html = '';


    html += createBillingRow(
        'Tipo de comprobante',
        documentType
    );


    if (billing.identificationTypeCode) {

        html += createBillingRow(
            'Tipo de documento',
            billing.identificationTypeCode
        );

    }


    if (billing.identificationNumber) {

        html += createBillingRow(
            'Número de documento',
            billing.identificationNumber
        );

    }


    if (billing.companyName) {

        html += createBillingRow(
            'Razón social',
            billing.companyName
        );

    }


    if (billing.firstName || billing.lastName) {

        html += createBillingRow(
            'Nombre',
            `${billing.firstName || ''} ${billing.lastName || ''}`.trim()
        );

    }


    if (billing.email) {

        html += createBillingRow(
            'Correo electrónico',
            billing.email
        );

    }


    if (billing.phone) {

        html += createBillingRow(
            'Teléfono',
            billing.phone
        );

    }


    if (billing.address) {

        html += createBillingRow(
            'Dirección',
            formatFullAddress(billing)
        );

    }


    container.innerHTML = html;

}


// ==========================================================================
// RESUMEN
// ==========================================================================

function renderSummaryOrderDetails(order) {

    const subtotalElement =
        document.getElementById(
            'accountOrderDetailSubtotal'
        );

    const shippingElement =
        document.getElementById(
            'accountOrderDetailShippingCost'
        );

    const discountRow =
        document.getElementById(
            'accountOrderDetailDiscountRow'
        );

    const discountElement =
        document.getElementById(
            'accountOrderDetailDiscount'
        );

    const totalElement =
        document.getElementById(
            'accountOrderDetailTotal'
        );

    setText(
        'accountOrderDetailSubtotal',
        formatMoney(order?.subtotal)
    );

    setText(
        'accountOrderDetailShippingCost',
        formatMoney(order?.shipping)
    );

    const discount =
        Number(order?.discount) || 0;

    if (discountRow) {

        if (discount > 0) {

            discountRow.style.display = '';

            setText(
                'accountOrderDetailDiscount',
                `-${formatMoney(discount)}`
            );

        } else {

            discountRow.style.display = 'none';

        }

    }

    setText(
        'accountOrderDetailTotal',
        formatMoney(order?.total)
    );
}


// ==========================================================================
// HTML DE DIRECCIÓN
// ==========================================================================

function createAddressHTML(address) {

    const fullName =
        `${address.firstName || ''} ${address.lastName || ''}`.trim();


    let html = '';


    if (fullName) {

        html += createBillingRow(
            'Nombre',
            fullName
        );

    }


    if (address.phone) {

        html += createBillingRow(
            'Teléfono',
            address.phone
        );

    }


    if (address.email) {

        html += createBillingRow(
            'Correo electrónico',
            address.email
        );

    }


    if (address.address) {

        html += createBillingRow(
            'Dirección',
            formatFullAddress(address)
        );

    }


    if (address.reference) {

        html += createBillingRow(
            'Referencia',
            address.reference
        );

    }


    if (address.neighborhood) {

        html += createBillingRow(
            'Urbanización / zona',
            address.neighborhood
        );

    }


    if (address.divisionName) {

        html += createBillingRow(
            'Departamento / región',
            address.divisionName
        );

    }


    if (address.countryName) {

        html += createBillingRow(
            'País',
            address.countryName
        );

    }


    return html;

}


// ==========================================================================
// FILA DE INFORMACIÓN
// ==========================================================================

function createBillingRow(label, value) {

    return `
        <div class="account-order-detail-billing-row">

            <span>
                ${escapeHTML(label)}
            </span>

            <strong>
                ${escapeHTML(value ?? '—')}
            </strong>

        </div>
    `;

}


// ==========================================================================
// FORMATEAR DIRECCIÓN COMPLETA
// ==========================================================================

function formatFullAddress(address) {

    const parts = [
        address.address,
        address.addressNumber,
        address.building,
        address.floor
            ? `Piso ${address.floor}`
            : null,
        address.unit
            ? `Unidad ${address.unit}`
            : null,
        address.entrance
            ? `Entrada ${address.entrance}`
            : null,
        address.postalCode
            ? `CP ${address.postalCode}`
            : null
    ];


    return parts
        .filter(Boolean)
        .join(', ');

}


// ==========================================================================
// FORMATOS
// ==========================================================================

function formatMoney(value) {

    const amount =
        Number(value) || 0;


    return new Intl.NumberFormat(
        'es-PE',
        {
            style: 'currency',
            currency: 'PEN'
        }
    ).format(amount);

}


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
            dateStyle: 'medium',
            timeStyle: 'short'
        }
    ).format(date);

}


function formatOrderStatus(status) {

    const labels = {
        PENDING: 'Pendiente',
        PAID: 'Pagado',
        PROCESSING: 'Procesando',
        SHIPPED: 'Enviado',
        DELIVERED: 'Entregado',
        CANCELLED: 'Cancelado',
        COMPLETED: 'Completado'
    };


    return labels[status] || status || '—';

}


function formatPaymentStatus(status) {

    const labels = {
        PENDING: 'Pendiente',
        PAID: 'Pagado',
        FAILED: 'Fallido',
        REFUNDED: 'Reembolsado',
        PARTIALLY_REFUNDED: 'Reembolso parcial'
    };


    return labels[status] || status || '—';

}


function formatPaymentMethod(method) {

    const labels = {

        CARD: 'Tarjeta',

        YAPE: 'Yape',

        WALLET: 'Billetera digital',

        PAGO_EFECTIVO: 'PagoEfectivo',

        CUOTEALO: 'Cuotéalo'

    };


    return labels[method] || method || '—';

}


function formatDocumentType(type) {

    const labels = {
        BOLETA: 'Boleta',
        FACTURA: 'Factura'
    };


    return labels[type] || type || '—';

}


// ==========================================================================
// UTILIDADES
// ==========================================================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }

}


function escapeHTML(value) {

    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

}


function escapeAttribute(value) {

    return escapeHTML(value);

}


function getMediaUrl(storageKey) {

    /*
     * Mantener la misma construcción de URL
     * utilizada actualmente por el resto
     * del sistema para las imágenes.
     */

    if (!storageKey) {
        return '';
    }

    return storageKey;

}

// ==========================================================================
// ACTUALIZAR PEDIDO
// ==========================================================================

function refreshOrder(order) {

    if (!order || typeof order !== 'object') {
        console.warn(
            '⚠️ No se puede actualizar el detalle: Order inválida.'
        );
        return;
    }

    if (
        currentOrderId === null ||
        Number(order.id) !== Number(currentOrderId)
    ) {
        return;
    }

    console.log(
        '🔄 Actualizando detalle de Order:',
        order.id
    );

    renderOrder(order);
}


// ==========================================================================
// OBTENER ID DEL PEDIDO ACTUAL
// ==========================================================================

function getCurrentOrderId() {

    return currentOrderId;
}


// ==========================================================================
// EXPORTAR
// ==========================================================================

window.orderDetail = {

    init,
    show,
    hide,
    refreshOrder,
    getCurrentOrderId

};