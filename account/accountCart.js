// ==========================================================================
// ACCOUNT CART — Cargar y mostrar ítems del carrito del usuario
// ==========================================================================

// ==========================================================================
// SELECCIÓN DE ÍTEMS DEL CARRITO
// ==========================================================================

let currentCartItems = [];

// ==========================================================================
// ACCOUNT CART
// ==========================================================================

async function loadUserCart() {

    const container =
        document.getElementById('accountCartContainer');

    initializeCartSelectionEvents();

    if (!container) {
        console.warn(
            '⚠️ No se encontró #accountCartContainer.'
        );
        return;
    }

    // ----------------------------------------------------------------------
    // LOADING
    // ----------------------------------------------------------------------

    container.innerHTML = `
        <div class="account-cart-loading">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Cargando tu carrito...</p>
        </div>
    `;

    try {

        // ------------------------------------------------------------------
        // OBTENER CARRITO DESDE BD
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
        // CARGAR PEDIDOS PENDIENTES
        // ------------------------------------------------------------------
        try {
            const ordersData = await window.accountOrdersApi.listOrders({ page: 1, pageSize: 50 });
            const orders = ordersData?.data?.items ?? ordersData?.items ?? [];
            const pendingOrders = orders.filter(
                order => order.status === 'PENDING' && order.paymentStatus === 'PENDING'
            );
            renderPendingOrders(pendingOrders);
        } catch (e) {
            console.error('❌ Error cargando pedidos pendientes en el carrito:', e);
            renderPendingOrders([]);
        }

        // ------------------------------------------------------------------
        // CARRITO VACÍO
        // ------------------------------------------------------------------

        if (!Array.isArray(items) || items.length === 0) {

            renderEmptyUserCart(container);

            return;
        }

        // ------------------------------------------------------------------
        // RENDER
        // ------------------------------------------------------------------

        renderUserCart(container, items);

    } catch (error) {

        console.error(
            '❌ Error cargando carrito de usuario:',
            error
        );

        container.innerHTML = `
            <div class="account-cart-error">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>No se pudo cargar tu carrito</h3>

                <p>
                    Ocurrió un problema al consultar tus productos.
                </p>

                <button
                    type="button"
                    class="btn-primary-action"
                    onclick="accountCart.loadUserCart()"
                >
                    Reintentar
                </button>

            </div>
        `;
    }
}




function renderEmptyUserCart(container) {

    container.innerHTML = `
        <div class="empty-state">

            <i class="fa-solid fa-cart-flatbed empty-icon"></i>

            <h3>Tu carrito está vacío</h3>

            <p>
                Explora nuestras colecciones y agrega
                productos a tu carrito.
            </p>

            <a
                href="index.html#productos"
                class="btn-primary-action"
            >
                Ir a la Tienda
            </a>

        </div>
    `;
}


function renderUserCart(container, items) {

    currentCartItems = items;

    let subtotal = 0;
    let totalItems = 0;

    const itemsHTML = items.map(item => {

        const product =
            item.product ?? {};

        const quantity =
            Number(item.quantity ?? 0);

        const price =
            Number(item.unitPrice ?? 0);

        const compareAtPrice =
            item.compareAtPrice !== null
                ? Number(item.compareAtPrice)
                : 0;

        const lineTotal =
            price * quantity;

        if (item.isSelected === true) {
            subtotal += lineTotal;
        }
        totalItems += quantity;

        const image =
            product.image || '';

        const name =
            product.name || 'Producto';

        const attributes =
            Array.isArray(product.attributes)
                ? product.attributes
                : [];

        const attributesHTML =
            attributes
                .map(attribute => `
                    <span class="account-cart-attribute">
                        ${escapeHTML(attribute.name)}:
                        ${escapeHTML(attribute.value)}
                    </span>
                `)
                .join('');

        const priceHTML =
            compareAtPrice > price
                ? `
                    <span class="account-cart-price-old">
                        S/${compareAtPrice.toFixed(2)}
                    </span>

                    <span class="account-cart-price-current">
                        S/${price.toFixed(2)}
                    </span>
                `
                : `
                    <span class="account-cart-price-current">
                        S/${price.toFixed(2)}
                    </span>
                `;

        return `
            <article
                class="account-cart-item"
                data-cart-item-id="${item.id}"
                data-variant-id="${item.productVariantId}"
            >
                <div class="account-cart-item-selection">
                    <input
                        type="checkbox"
                        class="account-cart-item-checkbox"
                        data-cart-item-id="${item.id}"
                        ${item.isSelected === true ? 'checked' : ''}
                        aria-label="Seleccionar ${escapeHTML(name)}"
                    >
                </div>

                <div class="account-cart-item-image">
                    <img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(name)}"
                        loading="lazy"
                    >
                </div>

                <div class="account-cart-item-info">

                    <h3 class="account-cart-item-name">
                        ${escapeHTML(name)}
                    </h3>

                    <div class="account-cart-item-attributes">
                        ${attributesHTML}
                    </div>

                    <div class="account-cart-item-price">
                        ${priceHTML}
                    </div>

                    <div class="account-cart-item-controls">

                        <div class="account-cart-quantity">

                            <button
                                type="button"
                                onclick="
                                    accountCart.decreaseQuantity(
                                        '${item.productVariantId}'
                                    )
                                "
                                aria-label="Disminuir cantidad"
                            >
                                <i class="fa-solid fa-minus"></i>
                            </button>

                            <span>
                                ${quantity}
                            </span>

                            <button
                                type="button"
                                onclick="
                                    accountCart.increaseQuantity(
                                        '${item.productVariantId}'
                                    )
                                "
                                aria-label="Aumentar cantidad"
                            >
                                <i class="fa-solid fa-plus"></i>
                            </button>

                        </div>

                        <button
                            type="button"
                            class="account-cart-remove"
                            onclick="
                                accountCart.removeItem(
                                    '${item.productVariantId}'
                                )
                            "
                        >
                            <i class="fa-solid fa-trash-can"></i>
                            Eliminar
                        </button>

                    </div>

                </div>

                <div class="account-cart-line-total">
                    S/${lineTotal.toFixed(2)}
                </div>

            </article>
        `;
    }).join('');

    container.innerHTML = `

        <div class="account-cart">

            <div class="account-cart-toolbar">

                <span>
                    ${totalItems}
                    ${totalItems === 1 ? 'artículo' : 'artículos'}
                </span>

                <div class="account-cart-toolbar-actions">

                    <button
                        type="button"
                        class="account-cart-select-all"
                        onclick="accountCart.selectAllItems()"
                    >
                        <i class="fa-solid fa-check-double"></i>
                        Seleccionar todo
                    </button>

                    <button
                        type="button"
                        class="account-cart-clear"
                        onclick="accountCart.clearUserCart()"
                    >
                        <i class="fa-solid fa-trash-can"></i>
                        Vaciar carrito
                    </button>

                </div>

            </div>

            <div class="account-cart-items">
                ${itemsHTML}
            </div>

            <div class="account-cart-summary">

                <div class="account-cart-subtotal">

                    <span>Subtotal</span>

                    <strong>
                        S/${subtotal.toFixed(2)}
                    </strong>

                </div>

                <p class="account-cart-note">
                    El precio final se confirmará durante el proceso de compra.
                </p>

                <button
                    type="button"
                    class="btn-primary-action account-cart-checkout"
                >
                    <i class="fa-solid fa-credit-card"></i>
                    Proceder al pago
                </button>

            </div>

        </div>
    `;

    updateSelectedSubtotal();
    updateSelectAllButton();
}


// ==========================================================================
// ACTUALIZAR SUBTOTAL SEGÚN SELECCIÓN
// ==========================================================================

function updateSelectedSubtotal() {

    const subtotal = currentCartItems.reduce(
        (total, item) => {

            if (item.isSelected !== true) {
                return total;
            }

            const quantity = Number(item.quantity ?? 0);
            const price = Number(item.unitPrice ?? 0);

            return total + (price * quantity);
        },
        0
    );

    const subtotalElement =
        document.querySelector('.account-cart-subtotal strong');

    if (!subtotalElement) {
        return;
    }

    subtotalElement.textContent =
        `S/${subtotal.toFixed(2)}`;
}


// ==========================================================================
// ACTUALIZAR BOTÓN DE SELECCIÓN GENERAL
// ==========================================================================

function updateSelectAllButton() {

    const button = document.querySelector(
        '.account-cart-select-all'
    );

    if (!button) {
        return;
    }

    const checkboxes = document.querySelectorAll(
        '.account-cart-item-checkbox'
    );

    if (!checkboxes.length) {
        return;
    }

    const allSelected =
        [...checkboxes].every(
            checkbox => checkbox.checked
        );

    if (allSelected) {

        button.innerHTML = `
            <i class="fa-solid fa-square-minus"></i>
            Deseleccionar todo
        `;

    } else {

        button.innerHTML = `
            <i class="fa-solid fa-check-double"></i>
            Seleccionar todo
        `;
    }
}


// ==========================================================================
// SELECCIONAR / DESELECCIONAR TODOS LOS ÍTEMS
// ==========================================================================

async function selectAllItems() {

    const checkboxes = document.querySelectorAll(
        '.account-cart-item-checkbox'
    );

    if (!checkboxes.length) {
        return;
    }

    const allSelected =
        [...checkboxes].every(
            checkbox => checkbox.checked
        );

    const newValue = !allSelected;

    // --------------------------------------------------------------
    // ACTUALIZAR UI Y ESTADO LOCAL
    // --------------------------------------------------------------

    checkboxes.forEach(checkbox => {

        checkbox.checked = newValue;

        const cartItemId = Number(
            checkbox.dataset.cartItemId
        );

        const cartItem = currentCartItems.find(
            item => Number(item.id) === cartItemId
        );

        if (cartItem) {
            cartItem.isSelected = newValue;
        }
    });

    updateSelectedSubtotal();
    updateSelectAllButton();

    // --------------------------------------------------------------
    // GUARDAR SELECCIÓN EN BACKEND
    // --------------------------------------------------------------

    try {

        await Promise.all(
            [...checkboxes].map(async checkbox => {

                const cartItemId = Number(
                    checkbox.dataset.cartItemId
                );

                const cartItem = currentCartItems.find(
                    item => Number(item.id) === cartItemId
                );

                if (!cartItem) {
                    return;
                }

                const response =
                    await apiUpdateItemSelection(
                        cartItem.productVariantId,
                        newValue
                    );

                if (!response.ok) {
                    throw new Error(
                        `Error HTTP ${response.status}`
                    );
                }
            })
        );

        console.log(
            `🛒 Todos los productos → isSelected: ${newValue}`
        );

    } catch (error) {

        console.error(
            '❌ Error actualizando selección de todos los productos:',
            error
        );

        // ----------------------------------------------------------
        // RECARGAR DESDE BACKEND PARA RECUPERAR EL ESTADO REAL
        // ----------------------------------------------------------

        await loadUserCart();
    }
}


// ==========================================================================
// SELECCIÓN INDIVIDUAL DE ÍTEMS
// ==========================================================================

async function handleCartItemSelection(event) {

    const checkbox = event.target.closest(
        '.account-cart-item-checkbox'
    );

    if (!checkbox) {
        return;
    }

    const cartItemId = Number(
        checkbox.dataset.cartItemId
    );

    if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
        console.warn(
            '⚠️ CartItem ID no válido:',
            checkbox.dataset.cartItemId
        );
        return;
    }

    const cartItem = currentCartItems.find(
        item => Number(item.id) === cartItemId
    );

    if (!cartItem) {
        console.warn(
            '⚠️ No se encontró el CartItem:',
            cartItemId
        );
        return;
    }

    const previousValue = cartItem.isSelected === true;
    const newValue = checkbox.checked;

    // Actualización visual/local inmediata
    cartItem.isSelected = newValue;

    updateSelectedSubtotal();
    updateSelectAllButton();

    try {

        const response = await apiUpdateItemSelection(
            cartItem.productVariantId,
            newValue
        );

        if (!response.ok) {
            throw new Error(
                `Error HTTP ${response.status}`
            );
        }

        console.log(
            `🛒 CartItem ${cartItemId} → isSelected: ${newValue}`
        );

    } catch (error) {

        console.error(
            '❌ Error actualizando selección del carrito:',
            error
        );

        // Revertir si el backend no pudo guardar el cambio
        cartItem.isSelected = previousValue;
        checkbox.checked = previousValue;

        updateSelectedSubtotal();
        updateSelectAllButton();
    }
}


// ==========================================================================
// EVENTOS DE SELECCIÓN DEL CARRITO
// ==========================================================================

function initializeCartSelectionEvents() {

    const container = document.getElementById(
        'accountCartContainer'
    );

    if (!container) {
        return;
    }

    // Evitar registrar el mismo evento más de una vez
    if (container.dataset.selectionEventsInitialized === 'true') {
        return;
    }

    container.addEventListener(
        'change',
        handleCartItemSelection
    );

    container.dataset.selectionEventsInitialized = 'true';
}


// ==========================================================================
// AUMENTAR CANTIDAD
// ==========================================================================

async function increaseQuantity(productVariantId) {

    const item = currentCartItems.find(
        item =>
            Number(item.productVariantId) ===
            Number(productVariantId)
    );

    if (!item) {
        console.warn(
            '⚠️ No se encontró el producto:',
            productVariantId
        );
        return;
    }

    const currentQuantity =
        Number(item.quantity ?? 0);

    const newQuantity =
        currentQuantity + 1;

    try {

        const response =
            await apiUpdateItem(
                productVariantId,
                newQuantity
            );

        if (!response.ok) {
            throw new Error(
                `Error HTTP ${response.status}`
            );
        }

        await loadUserCart();

    } catch (error) {

        console.error(
            '❌ Error aumentando cantidad:',
            error
        );
    }
}


// ==========================================================================
// DISMINUIR CANTIDAD
// ==========================================================================

async function decreaseQuantity(productVariantId) {

    const item = currentCartItems.find(
        item =>
            Number(item.productVariantId) ===
            Number(productVariantId)
    );

    if (!item) {
        console.warn(
            '⚠️ No se encontró el producto:',
            productVariantId
        );
        return;
    }

    const currentQuantity =
        Number(item.quantity ?? 0);

    const newQuantity =
        currentQuantity - 1;

    if (newQuantity < 0) {
        return;
    }

    try {

        const response =
            await apiUpdateItem(
                productVariantId,
                newQuantity
            );

        if (!response.ok) {
            throw new Error(
                `Error HTTP ${response.status}`
            );
        }

        await loadUserCart();

    } catch (error) {

        console.error(
            '❌ Error disminuyendo cantidad:',
            error
        );
    }
}


// ==========================================================================
// ELIMINAR ÍTEM DEL CARRITO
// ==========================================================================

async function removeItem(productVariantId) {

    const item = currentCartItems.find(
        item =>
            Number(item.productVariantId) ===
            Number(productVariantId)
    );

    if (!item) {
        console.warn(
            '⚠️ No se encontró el producto:',
            productVariantId
        );
        return;
    }

    try {

        const response =
            await apiDeleteItem(productVariantId);

        if (!response.ok) {
            throw new Error(
                `Error HTTP ${response.status}`
            );
        }

        await loadUserCart();

    } catch (error) {

        console.error(
            '❌ Error eliminando producto del carrito:',
            error
        );
    }
}


// ==========================================================================
// VACIAR CARRITO
// ==========================================================================

async function clearUserCart() {

    if (!currentCartItems.length) {
        return;
    }

    try {

        await Promise.all(
            currentCartItems.map(async item => {

                const response =
                    await apiDeleteItem(
                        item.productVariantId
                    );

                if (!response.ok) {
                    throw new Error(
                        `Error HTTP ${response.status}`
                    );
                }
            })
        );

        await loadUserCart();

    } catch (error) {

        console.error(
            '❌ Error vaciando el carrito:',
            error
        );

        // Recuperar el estado real desde backend
        await loadUserCart();
    }
}


function escapeHTML(str) {
    if (str === null || str === undefined) {
        return '';
    }

    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


function getSelectedCartItemIds() {

    return currentCartItems
        .filter(item => item.isSelected === true)
        .map(item => Number(item.id));

}


function getSelectedCartItems() {

    return currentCartItems.filter(
        item => item.isSelected === true
    );

}


// ==========================================================================
// PEDIDOS PENDIENTES
// ==========================================================================

function renderPendingOrders(orders) {

    const container =
        document.getElementById(
            'accountPendingOrdersContainer'
        );

    if (!container) return;

    if (!Array.isArray(orders) || orders.length === 0) {

        container.innerHTML = '';

        return;
    }

    const ordersHTML = orders.map(order => {

        const totalItems =
            Array.isArray(order.items)
                ? order.items.reduce(
                    (sum, item) =>
                        sum + Number(item.quantity || 0),
                    0
                )
                : 0;

        const paymentMethod =
            order.paymentMethod
                ? order.paymentMethod.replace(/\_/g, ' ')
                : '—';

        const total =
            Number(order.total || 0).toFixed(2);

        return `
            <article class="account-cart-pending-item">

                <div class="account-cart-pending-info">

                    <span class="account-cart-pending-id">
                        Pedido #${order.id}
                    </span>

                    <span class="account-cart-pending-separator">
                        &middot;
                    </span>

                    <span class="account-cart-pending-detail">
                        ${totalItems}
                        ${totalItems === 1 ? 'producto' : 'productos'}
                    </span>

                    <span class="account-cart-pending-separator">
                        &middot;
                    </span>

                    <span class="account-cart-pending-detail">
                        S/${total}
                    </span>

                    <span class="account-cart-pending-separator">
                        &middot;
                    </span>

                    <span class="account-cart-pending-detail account-cart-pending-payment">
                        ${paymentMethod}
                    </span>

                </div>

                <div class="account-cart-pending-actions">

                    <button
                        type="button"
                        class="account-cart-pending-btn"
                        onclick="accountCart.openPendingOrder(${order.id})"
                        title="Ver pedido"
                        aria-label="Ver pedido #${order.id}"
                    >
                        <i class="fa-solid fa-eye"></i>
                    </button>

                </div>

            </article>
        `;

    }).join('');

    container.innerHTML = `

        <div class="panel-card account-cart-pending-card">

            <h3 class="account-cart-pending-title">

                <i class="fa-solid fa-clock-rotate-left"></i>

                Pedidos pendientes de pago

            </h3>

            <div class="account-cart-pending-list">

                ${ordersHTML}

            </div>

        </div>

    `;
}

function openPendingOrder(orderId) {
    if (window.accountOrders && typeof window.accountOrders.openOrder === 'function') {
        window.accountOrders.openOrder(orderId, 'cart');
    }
}


window.accountCart = {
    loadUserCart,
    renderUserCart,
    renderEmptyUserCart,
    selectAllItems,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearUserCart,
    getSelectedCartItemIds,
    getSelectedCartItems,
    openPendingOrder
};

