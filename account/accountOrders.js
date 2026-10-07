// ==========================================================================
// ACCOUNT ORDERS
// LÓGICA DEL PANEL "MIS COMPRAS"
// ==========================================================================


// ==========================================================================
// ESTADO
// ==========================================================================

let accountOrdersInitialized = false;

let ordersLoaded = false;

let ordersLoading = false;


// ==========================================================================
// INICIALIZAR
// ==========================================================================

async function init() {

    if (accountOrdersInitialized) {
        return;
    }

    accountOrdersInitialized = true;


    // ======================================================================
    // EVENTOS DE MIS COMPRAS
    // ======================================================================

    document.addEventListener(
        'click',
        handleOrdersClick
    );


    // ======================================================================
    // DETALLE DE PEDIDO
    // ======================================================================

    if (
        window.orderDetail &&
        typeof window.orderDetail.init === 'function'
    ) {

        orderDetail.init();

    }


    console.log(
        '📦 Inicializando módulo Mis Compras...'
    );

}


let currentOrdersPage = 1;
const ORDERS_PAGE_SIZE = 10;

// ==========================================================================
// CARGAR PEDIDOS
// ==========================================================================

async function loadOrders(page = currentOrdersPage) {

    if (ordersLoading) {
        return;
    }

    currentOrdersPage = page;

    const container =
        document.getElementById(
            'ordersContainer'
        );


    if (!container) {

        console.error(
            '❌ No se encontró #ordersContainer.'
        );

        return;
    }


    ordersLoading = true;


    try {

        console.log(
            '📦 Cargando pedidos del usuario...'
        );


        const response =
            await window.accountOrdersApi.listOrders({
                page,
                pageSize: ORDERS_PAGE_SIZE
            });


        const orders =
            response?.data?.items ??
            response?.items ??
            [];

        // Extraer metadata real proporcionada por el backend
        const total = response?.data?.total ?? response?.total ?? 0;
        const pagination = response?.data?.pagination ?? response?.pagination ?? {};

        const backendPageSize = pagination.pageSize ?? ORDERS_PAGE_SIZE;
        const totalPages = Math.ceil(total / backendPageSize) || 1;
        const hasNextPage = currentOrdersPage < totalPages;


        console.log(
            '📦 Pedidos recibidos:',
            orders
        );


        ordersLoaded = true;


        // ------------------------------------------------------------------
        // ESTADO VACÍO
        // ------------------------------------------------------------------

        if (
            !Array.isArray(orders) ||
            orders.length === 0
        ) {

            renderEmptyState();

            return;
        }


        // ------------------------------------------------------------------
        // RENDERIZAR PEDIDOS
        // ------------------------------------------------------------------

        renderOrders(orders);
        renderPaginationControls(currentOrdersPage, hasNextPage, totalPages);


    } catch (error) {

        console.error(
            '❌ Error cargando pedidos:',
            error
        );


        renderErrorState();

    } finally {

        ordersLoading = false;

    }

}


// ==========================================================================
// RENDERIZAR LISTA DE PEDIDOS
// ==========================================================================

function renderOrders(orders) {

    const container =
        document.getElementById(
            'ordersContainer'
        );


    if (!container) {
        return;
    }


    container.innerHTML = '';


    const ordersList =
        document.createElement('div');

    ordersList.className =
        'orders-list';


    orders.forEach(order => {

        const orderElement =
            createOrderElement(order);

        ordersList.appendChild(
            orderElement
        );

    });


    container.appendChild(
        ordersList
    );

}

// ==========================================================================
// RENDERIZAR CONTROLES DE PAGINACIÓN
// ==========================================================================

function renderPaginationControls(currentPage, hasNextPage, totalPages) {
    const container = document.getElementById('ordersContainer');
    if (!container) return;

    if (totalPages <= 1) {
        return;
    }

    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'orders-pagination';
    paginationDiv.style.cssText = 'display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 30px; margin-bottom: 20px; flex-wrap: wrap;';

    const createButton = (text, isDisabled, isActive, onClick) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerHTML = text;

        let baseStyle = 'padding: 8px 14px; font-size: 0.9rem; border-radius: 6px; cursor: pointer; transition: all 0.2s ease; border: 1px solid var(--border-color); background: var(--white); color: var(--text-dark);';

        if (isActive) {
            baseStyle = 'padding: 8px 14px; font-size: 0.9rem; border-radius: 6px; cursor: default; border: 1px solid var(--royal-blue); background: var(--royal-blue); color: var(--white); font-weight: bold;';
            btn.disabled = true;
        } else if (isDisabled) {
            baseStyle += ' opacity: 0.5; cursor: not-allowed;';
            btn.disabled = true;
        }

        btn.style.cssText = baseStyle;

        if (!isDisabled && !isActive) {
            btn.onmouseover = () => { btn.style.background = 'var(--gray-100)'; };
            btn.onmouseout = () => { btn.style.background = 'var(--white)'; };
            btn.onclick = () => {
                onClick();
                document.querySelector('.panel-header')?.scrollIntoView({ behavior: 'smooth' });
            };
        }

        return btn;
    };

    // Botón Anterior
    const prevBtn = createButton('‹ Anterior', currentPage <= 1, false, () => {
        currentOrdersPage = currentPage - 1;
        loadOrders(currentOrdersPage);
    });
    paginationDiv.appendChild(prevBtn);

    // Números de página con elipsis
    const delta = 2; // Rango a mostrar alrededor de la página actual
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
            range.push(i);
        }
    }

    for (let i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    }

    rangeWithDots.forEach(pageItem => {
        if (pageItem === '...') {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.cssText = 'padding: 8px 4px; color: var(--text-muted);';
            paginationDiv.appendChild(ellipsis);
        } else {
            const pageBtn = createButton(pageItem, false, pageItem === currentPage, () => {
                currentOrdersPage = pageItem;
                loadOrders(currentOrdersPage);
            });
            paginationDiv.appendChild(pageBtn);
        }
    });

    // Botón Siguiente
    const nextBtn = createButton('Siguiente ›', !hasNextPage, false, () => {
        currentOrdersPage = currentPage + 1;
        loadOrders(currentOrdersPage);
    });
    paginationDiv.appendChild(nextBtn);

    container.appendChild(paginationDiv);
}

// ==========================================================================
// CREAR TARJETA DE PEDIDO
// ==========================================================================

function createOrderElement(order) {

    const card =
        document.createElement('article');

    card.className =
        'order-card';

    card.dataset.orderId = order.id;


    // ----------------------------------------------------------------------
    // ENCABEZADO
    // ----------------------------------------------------------------------

    const header =
        document.createElement('div');

    header.className =
        'order-card-header';


    const orderInfo =
        document.createElement('div');

    orderInfo.className =
        'order-card-info';


    const orderNumber =
        document.createElement('h3');

    orderNumber.textContent =
        `Pedido #${order.id}`;


    const orderDate =
        document.createElement('span');

    orderDate.textContent =
        formatDate(order.createdAt);


    orderInfo.appendChild(orderNumber);
    orderInfo.appendChild(orderDate);


    // ----------------------------------------------------------------------
    // ESTADO
    // ----------------------------------------------------------------------

    const status =
        document.createElement('span');

    status.className =
        `order-status order-status-${String(
            order.status || ''
        ).toLowerCase()}`;

    status.textContent =
        formatOrderStatus(order.status);


    header.appendChild(orderInfo);
    header.appendChild(status);


    // ----------------------------------------------------------------------
    // INFORMACIÓN DEL PEDIDO
    // ----------------------------------------------------------------------

    const orderDetails =
        document.createElement('div');

    orderDetails.className =
        'order-card-details';


    // ----------------------------------------------------------------------
    // MÉTODO DE PAGO
    // ----------------------------------------------------------------------

    const paymentDetail =
        createOrderDetail(
            'Método de pago',
            formatPaymentMethod(order.paymentMethod)
        );

    orderDetails.appendChild(
        paymentDetail
    );


    // ----------------------------------------------------------------------
    // MÉTODO DE ENTREGA
    // ----------------------------------------------------------------------

    const deliveryMethod =
        order.shippingAddress
            ? 'Delivery'
            : 'Recojo en tienda';


    const deliveryDetail =
        createOrderDetail(
            'Entrega',
            deliveryMethod
        );

    orderDetails.appendChild(
        deliveryDetail
    );


    // ----------------------------------------------------------------------
    // SEGUIMIENTO
    // ----------------------------------------------------------------------

    if (order.trackingCode) {

        const trackingDetail =
            createOrderDetail(
                'Seguimiento',
                order.trackingCode
            );

        orderDetails.appendChild(
            trackingDetail
        );

    }


    // ----------------------------------------------------------------------
    // PRODUCTOS
    // ----------------------------------------------------------------------

    const products =
        document.createElement('div');

    products.className =
        'order-card-products';


    if (
        Array.isArray(order.items) &&
        order.items.length > 0
    ) {

        order.items.forEach(item => {

            products.appendChild(
                createOrderItemElement(item)
            );

        });

    }


    // ----------------------------------------------------------------------
    // RESUMEN ECONÓMICO
    // ----------------------------------------------------------------------

    const summary =
        document.createElement('div');

    summary.className =
        'order-card-summary';


    summary.appendChild(
        createOrderSummaryRow(
            'Subtotal',
            formatCurrency(order.subtotal)
        )
    );


    summary.appendChild(
        createOrderSummaryRow(
            'Envío',
            formatCurrency(order.shipping)
        )
    );


    if (Number(order.discount || 0) > 0) {

        summary.appendChild(
            createOrderSummaryRow(
                'Descuento',
                `-${formatCurrency(order.discount)}`,
                true
            )
        );

    }


    const totalRow =
        document.createElement('div');

    totalRow.className =
        'order-card-summary-total';


    const totalLabel =
        document.createElement('span');

    totalLabel.textContent =
        'Total';


    const totalValue =
        document.createElement('strong');

    totalValue.textContent =
        formatCurrency(order.total);


    totalRow.appendChild(totalLabel);
    totalRow.appendChild(totalValue);


    summary.appendChild(
        totalRow
    );


    // ----------------------------------------------------------------------
    // PIE
    // ----------------------------------------------------------------------

    const footer =
        document.createElement('div');

    footer.className =
        'order-card-footer';


    const itemCount =
        document.createElement('span');

    itemCount.className =
        'order-card-item-count';


    const totalItems =
        Array.isArray(order.items)
            ? order.items.reduce(
                (total, item) =>
                    total + Number(item.quantity || 0),
                0
            )
            : 0;


    itemCount.textContent =
        `${totalItems} ${totalItems === 1
            ? 'producto'
            : 'productos'
        }`;


    const viewButton =
        document.createElement('button');

    viewButton.type =
        'button';

    viewButton.className =
        'order-card-view-button';

    viewButton.dataset.orderId =
        order.id;

    viewButton.innerHTML = `
        <i class="fa-solid fa-eye"></i>
        <span>Ver pedido</span>
    `;


    footer.appendChild(
        itemCount
    );

    footer.appendChild(
        viewButton
    );


    // ----------------------------------------------------------------------
    // ENSAMBLAR
    // ----------------------------------------------------------------------

    card.appendChild(header);

    card.appendChild(orderDetails);

    card.appendChild(products);

    card.appendChild(summary);

    card.appendChild(footer);


    return card;

}


// ==========================================================================
// CREAR DETALLE DEL PEDIDO
// ==========================================================================

function createOrderDetail(label, value) {

    const element =
        document.createElement('div');

    element.className =
        'order-card-detail';


    const labelElement =
        document.createElement('span');

    labelElement.textContent =
        label;


    const valueElement =
        document.createElement('strong');

    valueElement.textContent =
        value || '—';


    element.appendChild(
        labelElement
    );

    element.appendChild(
        valueElement
    );


    return element;

}

// ==========================================================================
// CREAR PRODUCTO DEL PEDIDO
// ==========================================================================

function createOrderItemElement(item) {

    const element =
        document.createElement('div');

    element.className =
        'order-card-item';


    // ----------------------------------------------------------------------
    // IMAGEN
    // ----------------------------------------------------------------------

    const imageContainer =
        document.createElement('div');

    imageContainer.className =
        'order-card-item-image';


    if (item.image) {

        const image =
            document.createElement('img');

        image.src =
            item.image;

        image.alt =
            item.productName || 'Producto';

        image.loading =
            'lazy';


        imageContainer.appendChild(
            image
        );

    }


    // ----------------------------------------------------------------------
    // INFORMACIÓN
    // ----------------------------------------------------------------------

    const info =
        document.createElement('div');

    info.className =
        'order-card-item-info';


    const name =
        document.createElement('strong');

    name.textContent =
        item.productName || 'Producto';


    info.appendChild(
        name
    );


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
            'order-card-item-attributes';


        item.attributes.forEach(attribute => {

            const attributeElement =
                document.createElement('span');

            attributeElement.textContent =
                `${attribute.name}: ${attribute.value}`;


            attributes.appendChild(
                attributeElement
            );

        });


        info.appendChild(
            attributes
        );

    }


    // ----------------------------------------------------------------------
    // CANTIDAD
    // ----------------------------------------------------------------------

    const quantity =
        document.createElement('span');

    quantity.textContent =
        `Cantidad: ${item.quantity}`;


    info.appendChild(
        quantity
    );


    // ----------------------------------------------------------------------
    // PRECIO
    // ----------------------------------------------------------------------

    const price =
        document.createElement('div');

    price.className =
        'order-card-item-price';


    const unitPrice =
        Number(item.unitPrice || 0);


    const compareAtPrice =
        item.compareAtPrice !== null &&
            item.compareAtPrice !== undefined
            ? Number(item.compareAtPrice)
            : null;


    // ----------------------------------------------------------------------
    // PRECIO ANTERIOR
    // ----------------------------------------------------------------------

    if (
        compareAtPrice !== null &&
        compareAtPrice > unitPrice
    ) {

        const oldPrice =
            document.createElement('span');

        oldPrice.className =
            'order-card-item-price-old';

        oldPrice.textContent =
            formatCurrency(compareAtPrice);


        price.appendChild(
            oldPrice
        );

    }


    // ----------------------------------------------------------------------
    // PRECIO UNITARIO
    // ----------------------------------------------------------------------

    const currentPrice =
        document.createElement('span');

    currentPrice.className =
        'order-card-item-price-current';

    currentPrice.textContent =
        formatCurrency(unitPrice);


    price.appendChild(
        currentPrice
    );


    // ----------------------------------------------------------------------
    // TOTAL DEL PRODUCTO
    // ----------------------------------------------------------------------

    const itemTotal =
        unitPrice *
        Number(item.quantity || 0);


    const totalPrice =
        document.createElement('strong');

    totalPrice.textContent =
        formatCurrency(itemTotal);


    price.appendChild(
        totalPrice
    );


    // ----------------------------------------------------------------------
    // ENSAMBLAR
    // ----------------------------------------------------------------------

    element.appendChild(
        imageContainer
    );

    element.appendChild(
        info
    );

    element.appendChild(
        price
    );


    return element;

}


// ==========================================================================
// CREAR FILA DEL RESUMEN
// ==========================================================================

function createOrderSummaryRow(
    label,
    value,
    isDiscount = false
) {

    const row =
        document.createElement('div');

    row.className =
        'order-card-summary-row';


    if (isDiscount) {

        row.classList.add(
            'order-card-summary-discount'
        );

    }


    const labelElement =
        document.createElement('span');

    labelElement.textContent =
        label;


    const valueElement =
        document.createElement('span');

    valueElement.textContent =
        value;


    row.appendChild(
        labelElement
    );

    row.appendChild(
        valueElement
    );


    return row;

}


// ==========================================================================
// ESTADO VACÍO
// ==========================================================================

function renderEmptyState() {

    const container =
        document.getElementById(
            'ordersContainer'
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="empty-state">

            <i class="fa-solid fa-bag-shopping empty-icon"></i>

            <h3>
                Aún no has realizado ninguna compra
            </h3>

            <p>
                Explora nuestras colecciones exclusivas
                para realizar tu primer pedido.
            </p>

            <a
                href="index.html#productos"
                class="btn-primary-action"
            >
                Explorar Colección
            </a>

        </div>

    `;

}


// ==========================================================================
// ESTADO DE ERROR
// ==========================================================================

function renderErrorState() {

    const container =
        document.getElementById(
            'ordersContainer'
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="empty-state">

            <i class="fa-solid fa-triangle-exclamation empty-icon"></i>

            <h3>
                No se pudieron cargar tus pedidos
            </h3>

            <p>
                Ocurrió un problema al consultar tu historial de compras.
            </p>

            <button
                type="button"
                class="btn-primary-action"
                id="accountOrdersRetry"
            >
                Intentar nuevamente
            </button>

        </div>

    `;


    const retryButton =
        document.getElementById(
            'accountOrdersRetry'
        );


    if (retryButton) {

        retryButton.addEventListener('click', () => {
            loadOrders(currentOrdersPage);
        });

    }

}


// ==========================================================================
// EVENTOS
// ==========================================================================

function handleOrdersClick(event) {

    const viewButton =
        event.target.closest(
            '.order-card-view-button'
        );

    console.log(
        '🔎 Botón Ver pedido encontrado:',
        viewButton
    );

    if (!viewButton) {
        return;
    }

    const orderId =
        viewButton.dataset.orderId;

    console.log(
        '📦 ID del pedido desde el botón:',
        orderId
    );

    if (!orderId) {
        return;
    }

    openOrder(orderId, 'orders', currentOrdersPage);
}


// ==========================================================================
// ABRIR PEDIDO
// ==========================================================================

async function openOrder(
    orderId,
    origin = 'orders',
    returnPage = currentOrdersPage
) {

    console.log(
        '📦 Abriendo pedido:',
        orderId
    );

    try {

        const response =
            await window.accountOrdersApi.getOrder(
                orderId
            );


        const order =
            response?.data?.order ??
            response?.order ??
            null;


        if (!order) {

            throw new Error(
                'No se recibió información del pedido.'
            );

        }


        console.log(
            '📦 Pedido obtenido:',
            order
        );


        // --------------------------------------------------------------
        // ABRIR COMPONENTE DE DETALLE
        // --------------------------------------------------------------

        if (
            window.orderDetail &&
            typeof window.orderDetail.show === 'function'
        ) {

            await window.orderDetail.show(
                orderId,
                order,
                origin,
                returnPage
            );

        } else {

            console.error(
                '❌ El componente orderDetail no está disponible.'
            );

        }


    } catch (error) {

        console.error(
            '❌ Error obteniendo pedido:',
            error
        );

    }

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
// FORMATEAR MONEDA
// ==========================================================================

function formatCurrency(value) {

    return new Intl.NumberFormat(
        'es-PE',
        {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(
        Number(value || 0)
    );

}


// ==========================================================================
// FORMATEAR MÉTODO DE PAGO
// ==========================================================================

function formatPaymentMethod(method) {

    const methods = {

        CARD: 'Tarjeta',

        YAPE: 'Yape',

        WALLET: 'Billetera digital'

    };


    return methods[method] ||
        method ||
        '—';

}


// ==========================================================================
// FORMATEAR ESTADO
// ==========================================================================

function formatOrderStatus(status) {

    const statuses = {

        PENDING: 'Pendiente',

        PAID: 'Pagado',

        PROCESSING: 'En preparación',

        SHIPPED: 'Enviado',

        DELIVERED: 'Entregado',

        CANCELLED: 'Cancelado',

        REFUNDED: 'Reembolsado'

    };


    return statuses[status] ||
        status ||
        '—';

}


function setCurrentPage(page) {

    const normalizedPage = Number(page);

    if (
        Number.isInteger(normalizedPage) &&
        normalizedPage > 0
    ) {
        currentOrdersPage = normalizedPage;
    }

}


// ==========================================================================
// EXPONER MÓDULO
// ==========================================================================

window.accountOrders = {

    init,

    loadOrders,

    openOrder,

    setCurrentPage

};