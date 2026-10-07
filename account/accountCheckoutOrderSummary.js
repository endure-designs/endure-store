// ==========================================================================
// ACCOUNT CHECKOUT ORDER SUMMARY
// ==========================================================================

// ==========================================================================
// ESTADO
// ==========================================================================

let accountCheckoutOrderSummaryInitialized = false;

let checkoutOrderItems = [];

let checkoutOrderSubtotal = 0;

let checkoutOrderDiscount = 0;

let checkoutOrderShipping = 0;

let checkoutOrderTotal = 0;


// ==========================================================================
// INICIALIZAR
// ==========================================================================

function init() {

    if (accountCheckoutOrderSummaryInitialized) {
        return;
    }

    accountCheckoutOrderSummaryInitialized = true;

}


// ==========================================================================
// CARGAR RESUMEN
// ==========================================================================

async function load() {

    const container =
        document.querySelector(
            '.account-checkout-summary'
        );

    if (!container) {

        console.warn(
            '⚠️ No se encontró .account-checkout-summary.'
        );

        return;
    }

    try {

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

        checkoutOrderItems =
            Array.isArray(items)
                ? items.filter(
                    item => item.isSelected === true
                )
                : [];

        calculateTotals();

        render(container);

    } catch (error) {

        console.error(
            '❌ Error cargando resumen del pedido:',
            error
        );

        container.innerHTML = `
            <div class="checkout-order-summary-error">
                <p>
                    No se pudo cargar el resumen del pedido.
                </p>
            </div>
        `;
    }
}

// ==========================================================================
// CALCULAR TOTALES
// ==========================================================================

function calculateTotals() {

    checkoutOrderSubtotal = 0;

    let productDiscount = 0;

    checkoutOrderItems.forEach(item => {

        const quantity =
            Number(
                item.quantity ?? 0
            );

        const unitPrice =
            Number(
                item.unitPrice ?? 0
            );

        const compareAtPrice =
            Number(
                item.compareAtPrice ?? 0
            );

        const originalUnitPrice =
            compareAtPrice > unitPrice
                ? compareAtPrice
                : unitPrice;

        checkoutOrderSubtotal +=
            originalUnitPrice * quantity;

        if (
            compareAtPrice > unitPrice
        ) {

            productDiscount +=
                (
                    compareAtPrice -
                    unitPrice
                ) * quantity;
        }
    });

    // Descuento por cupones
    // Por ahora no está implementado.
    const couponDiscount = 0;

    checkoutOrderDiscount =
        productDiscount +
        couponDiscount;

    checkoutOrderShipping = 0;

    checkoutOrderTotal =
        checkoutOrderSubtotal -
        checkoutOrderDiscount +
        checkoutOrderShipping;
}


// ==========================================================================
// RENDERIZAR
// ==========================================================================

function render(container) {

    if (
        !Array.isArray(
            checkoutOrderItems
        ) ||
        checkoutOrderItems.length === 0
    ) {

        container.innerHTML = `
            <p class="checkout-order-summary-empty">
                No hay productos en el pedido.
            </p>
        `;

        return;
    }

    const itemsHTML =
        checkoutOrderItems
            .map(renderItem)
            .join('');

    container.innerHTML = `

        <div class="checkout-order-items">
            ${itemsHTML}
        </div>

        <div class="checkout-order-totals">

            <div class="checkout-order-total-row">

                <span>
                    Subtotal
                </span>

                <span>
                    S/${checkoutOrderSubtotal.toFixed(2)}
                </span>

            </div>


            <div class="checkout-order-total-row">

                <span>
                    Descuento
                </span>

                <span>
                    -S/${checkoutOrderDiscount.toFixed(2)}
                </span>

            </div>


            <div class="checkout-order-total-row">

                <span>
                    Envío
                </span>

                <span>
                    S/${checkoutOrderShipping.toFixed(2)}
                </span>

            </div>


            <div class="checkout-order-total-final">

                <span>
                    Total
                </span>

                <strong>
                    S/${checkoutOrderTotal.toFixed(2)}
                </strong>

            </div>

        </div>
    `;
}


// ==========================================================================
// RENDERIZAR PRODUCTO
// ==========================================================================

function renderItem(item) {

    const product =
        item.product ?? {};

    const quantity =
        Number(
            item.quantity ?? 0
        );

    const unitPrice =
        Number(
            item.unitPrice ?? 0
        );

    const compareAtPrice =
        Number(
            item.compareAtPrice ?? 0
        );

    const lineTotal =
        unitPrice * quantity;

    const image =
        product.image || '';

    const name =
        product.name || 'Producto';

    const attributes =
        Array.isArray(
            product.attributes
        )
            ? product.attributes
            : [];

    const attributesHTML =
        attributes
            .map(attribute => `
                <span class="checkout-order-item-attribute">
                    ${escapeHTML(attribute.name)}:
                    ${escapeHTML(attribute.value)}
                </span>
            `)
            .join('');

    return `

        <article
            class="checkout-order-item"
            data-variant-id="${item.productVariantId}"
        >

            <div class="checkout-order-item-image">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(name)}"
                    loading="lazy"
                >

                <span class="checkout-order-item-quantity">
                    ${quantity}
                </span>

            </div>


            <div class="checkout-order-item-info">

                <h4>
                    ${escapeHTML(name)}
                </h4>

                <div class="checkout-order-item-attributes">
                    ${attributesHTML}
                </div>

            </div>


            <div class="checkout-order-item-price">

                ${compareAtPrice > unitPrice
            ? `
                            <span class="checkout-order-item-price-original">
                                S/${compareAtPrice.toFixed(2)}
                            </span>

                            <strong class="checkout-order-item-price-current">
                                S/${unitPrice.toFixed(2)}
                            </strong>
                        `
            : `
                            <strong class="checkout-order-item-price-current">
                                S/${unitPrice.toFixed(2)}
                            </strong>
                        `
        }

            </div>

        </article>
    `;
}


// ==========================================================================
// EXPONER MÓDULO
// ==========================================================================

window.accountCheckoutOrderSummary = {

    init,

    load

};