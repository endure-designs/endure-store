// ==========================================================================
// ACCOUNT CHECKOUT SUMMARY
// Lógica de la etapa "Resumen de pedido"
// ==========================================================================

// ==========================================================================
// ESTADO
// ==========================================================================

let accountCheckoutSummaryInitialized = false;

let checkoutSummaryTotal = 0;

let selectedDeliveryMethod = 'DELIVERY';


// ==========================================================================
// INICIALIZAR
// ==========================================================================

async function init() {

    if (accountCheckoutSummaryInitialized) {
        return;
    }

    accountCheckoutSummaryInitialized = true;

    document.addEventListener(
        'click',
        handleAccountCheckoutSummaryClick
    );

    document.addEventListener(
        'change',
        handleAccountCheckoutSummaryChange
    );

    console.log(
        '✅ Módulo accountCheckoutSummary inicializado.'
    );
}


// ==========================================================================
// CLICK
// ==========================================================================

function handleAccountCheckoutSummaryClick(event) {

    // ----------------------------------------------------------------------
    // MODALIDAD DE ENTREGA
    // ----------------------------------------------------------------------

    const deliveryOption =
        event.target.closest(
            '.checkout-delivery-option'
        );

    if (deliveryOption) {

        const radio =
            deliveryOption.querySelector(
                'input[name="deliveryMethod"]'
            );

        if (radio) {

            selectedDeliveryMethod =
                radio.value;

            console.log(
                '🚚 Modalidad de entrega:',
                selectedDeliveryMethod
            );

            updateCheckoutSummaryTotal();
        }

        return;
    }


    // ----------------------------------------------------------------------
    // CONTINUAR
    // ----------------------------------------------------------------------

    const continueButton =
        event.target.closest(
            '#checkoutSummaryContinue'
        );

    if (!continueButton) {
        return;
    }

    if (!window.accountCheckout) {

        console.error(
            '❌ accountCheckout no está disponible.'
        );

        return;
    }

    window.accountCheckout.showStep(
        'purchase'
    );
}


// ==========================================================================
// CARGAR RESUMEN DEL CARRITO
// ==========================================================================

async function loadCheckoutSummary() {

    const container =
        document.getElementById(
            'checkoutSummaryProducts'
        );

    if (!container) {
        console.warn(
            '⚠️ No se encontró #checkoutSummaryProducts.'
        );
        return;
    }

    container.innerHTML = `
        <div class="checkout-summary-loading">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Cargando tu pedido...</p>
        </div>
    `;

    try {

        // ------------------------------------------------------------------
        // OBTENER CARRITO ACTUAL DESDE BACKEND
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
        // SOLO PRODUCTOS SELECCIONADOS EN DB
        // ------------------------------------------------------------------

        const selectedItems =
            Array.isArray(items)
                ? items.filter(
                    item => item.isSelected === true
                )
                : [];

        console.log(
            '🛒 Productos seleccionados para checkout:',
            selectedItems
        );

        if (selectedItems.length === 0) {
            renderEmptyCheckoutSummary(container);
            return;
        }

        renderCheckoutSummaryProducts(
            container,
            selectedItems
        );

    } catch (error) {

        console.error(
            '❌ Error cargando resumen del checkout:',
            error
        );

        container.innerHTML = `
            <div class="checkout-summary-error">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>No se pudo cargar tu pedido</h3>

                <p>
                    Ocurrió un problema al consultar
                    los productos de tu carrito.
                </p>

            </div>
        `;
    }
}


// ==========================================================================
// RENDERIZAR PRODUCTOS
// ==========================================================================

function renderCheckoutSummaryProducts(
    container,
    items
) {

    checkoutSummaryTotal = 0;

    const itemsHTML =
        items.map(item => {

            const product =
                item.product ?? {};

            const quantity =
                Number(item.quantity ?? 0);

            const price =
                Number(item.unitPrice ?? 0);

            const lineTotal =
                price * quantity;

            checkoutSummaryTotal += lineTotal;

            const compareAtPrice =
                item.compareAtPrice !== null
                    ? Number(item.compareAtPrice)
                    : 0;

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
                        <span class="checkout-summary-product-attribute">
                            ${escapeHTML(attribute.name)}:
                            ${escapeHTML(attribute.value)}
                        </span>
                    `)
                    .join('');

            return `
                <article
                    class="checkout-summary-product"
                    data-variant-id="${escapeHTML(
                item.productVariantId
            )}"
                >

                    <div class="checkout-summary-product-image">

                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(name)}"
                            loading="lazy"
                        >

                    </div>

                    <div class="checkout-summary-product-info">

                        <h4>
                            ${escapeHTML(name)}
                        </h4>

                        <div class="checkout-summary-product-attributes">
                            ${attributesHTML}
                        </div>

                        <span class="checkout-summary-product-quantity">
                            Cantidad: ${quantity}
                        </span>

                    </div>

                    <div class="checkout-summary-product-price">

                        ${compareAtPrice > price
                    ? `
                                    <span class="checkout-summary-product-price-old">
                                        S/${compareAtPrice.toFixed(2)}
                                    </span>

                                    <span class="checkout-summary-product-price-current">
                                        S/${price.toFixed(2)}
                                    </span>
                                `
                    : `
                                    <span class="checkout-summary-product-price-current">
                                        S/${price.toFixed(2)}
                                    </span>
                                `
                }

                        <strong>
                            S/${lineTotal.toFixed(2)}
                        </strong>

                    </div>

                </article>
            `;

        }).join('');

    container.innerHTML = itemsHTML;

    updateCheckoutSummaryTotal();
}


// ==========================================================================
// ACTUALIZAR TOTAL
// ==========================================================================

function updateCheckoutSummaryTotal() {

    const totalElement =
        document.getElementById(
            'checkoutSummaryTotal'
        );

    if (!totalElement) {
        return;
    }

    totalElement.textContent =
        `S/ ${checkoutSummaryTotal.toFixed(2)}`;
}


// ==========================================================================
// CARRITO VACÍO
// ==========================================================================

function renderEmptyCheckoutSummary(container) {

    container.innerHTML = `
        <div class="checkout-summary-empty">

            <i class="fa-solid fa-cart-shopping"></i>

            <h3>Tu carrito está vacío</h3>

            <p>
                No hay productos para procesar.
            </p>

        </div>
    `;
}


// ==========================================================================
// OBTENER TOTAL
// ==========================================================================

function getTotal() {

    return checkoutSummaryTotal;
}


// ==========================================================================
// OBTENER MODALIDAD DE ENTREGA
// ==========================================================================

function getDeliveryMethod() {

    const selectedRadio =
        document.querySelector(
            'input[name="deliveryMethod"]:checked'
        );

    if (!selectedRadio) {
        return selectedDeliveryMethod;
    }

    selectedDeliveryMethod =
        selectedRadio.value;

    return selectedDeliveryMethod;
}

// ==========================================================================
// CAMBIO DE MODALIDAD
// ==========================================================================

function handleAccountCheckoutSummaryChange(event) {

    if (
        event.target.matches(
            'input[name="deliveryMethod"]'
        )
    ) {

        selectedDeliveryMethod =
            event.target.value;

        console.log(
            '🚚 Modalidad de entrega:',
            selectedDeliveryMethod
        );

        updateCheckoutSummaryTotal();
    }
}


// ==========================================================================
// EXPONER MÓDULO
// ==========================================================================

window.accountCheckoutSummary = {
    init,
    loadCheckoutSummary,

    getTotal,

    getDeliveryMethod
};