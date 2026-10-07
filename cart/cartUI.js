// ==========================================================================
// UI DEL CARRITO
// ==========================================================================

// Sanitizador simple para evitar ataques XSS al renderizar HTML dinámico
function escapeHTML(str) {
    if (!str) return '';

    return String(str).replace(/[&<>"']/g, match => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[match]));
}





function renderEmptyCart(emptyState) {

    const {
        subtotal,
        checkoutBtn,
        badges
    } = getCartElements();

    if (emptyState) {
        emptyState.style.display = 'flex';
    }

    if (subtotal) {
        subtotal.innerHTML = `
            <span class="cart-subtotal-current">
                S/0.00
            </span>
        `;
    }

    badges.forEach(badge => {
        badge.textContent = '0';
    });

    if (checkoutBtn) {
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = '.5';
        checkoutBtn.style.pointerEvents = 'none';
    }
}


function updateCartSummary(total, compareTotal, itemCount) {

    const {
        subtotal,
        badges
    } = getCartElements();

    if (subtotal) {

        if (compareTotal > total) {

            subtotal.innerHTML = `
                <span class="cart-subtotal-old">
                    S/${compareTotal.toFixed(2)}
                </span>

                <span class="cart-subtotal-current">
                    S/${total.toFixed(2)}
                </span>
            `;

        } else {

            subtotal.innerHTML = `
                <span class="cart-subtotal-current">
                    S/${total.toFixed(2)}
                </span>
            `;
        }
    }

    badges.forEach(badge => {
        badge.textContent = itemCount;
    });
}


function updateCartUI() {

    const { container } = getCartElements();

    // 🔍 MENSAJE DE DIAGNÓSTICO:
    console.log(
        `%c🔍 Diagnóstico container:%c`,
        "background: #2196F3; color: white; padding: 2px 5px; font-weight: bold; border-radius: 3px;", // Azul llamativo
        "",
        container
    );

    if (!container) return;



    clearRenderedItems();

    const emptyState = container.querySelector('.cart-empty-state');

    const cart = getCart();

    if (cart.length === 0) {
        renderEmptyCart(emptyState);
        return;
    }

    prepareCartUI(emptyState);

    renderCartSelectionToolbar();

    const summary = renderCartItems(cart);

    updateCartSummary(summary.total, summary.compareTotal, summary.itemCount);

}


function clearRenderedItems() {

    const { container } = getCartElements();

    if (!container) return;

    container
        .querySelectorAll('.cart-item')
        .forEach(item => item.remove());

}


function prepareCartUI(emptyState) {

    const {
        checkoutBtn
    } = getCartElements();

    if (emptyState)
        emptyState.style.display = 'none';


    if (checkoutBtn) {

        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = '1';
        checkoutBtn.style.pointerEvents = 'auto';

    }

}

function renderCartSelectionToolbar() {

    const {
        container
    } = getCartElements();

    if (!container) {
        return;
    }

    const existingToolbar =
        container.querySelector(
            '.cart-selection-toolbar'
        );

    if (existingToolbar) {
        existingToolbar.remove();
    }

    const cart = getCart();

    const allSelected =
        Array.isArray(cart) &&
        cart.length > 0 &&
        cart.every(
            item => item.isSelected === true
        );

    const toolbar =
        document.createElement('div');

    toolbar.className =
        'cart-selection-toolbar';

    toolbar.innerHTML = `
        <button
            type="button"
            class="cart-select-all"
            onclick="selectAllCartItems()"
        >
            <span class="cart-select-all-checkbox"></span>

            <span class="cart-select-all-label">
                ${allSelected
            ? 'Deseleccionar todo'
            : 'Seleccionar todo'
        }
            </span>
        </button>
    `;

    if (allSelected) {
        toolbar
            .querySelector('.cart-select-all')
            .classList.add('is-selected');
    }

    container.prepend(toolbar);
}


function renderCartItems(cart) {

    const { container } = getCartElements();

    let total = 0;
    let compareTotal = 0;
    let itemCount = 0;

    const productList = window.PRODUCTS ?? [];

    cart.forEach((item, index) => {

        const originalProduct =
            findOriginalProduct(item, productList);

        const price =
            getItemPrice(item, originalProduct);

        const compareAtPrice =
            Number(
                item.compareAtPrice ??
                originalProduct?.compareAtPrice ??
                price
            );

        const qty =
            getItemQty(item);


        // ========================================================
        // TOTAL ACTUAL
        // ========================================================

        total += price * qty;


        // ========================================================
        // TOTAL ORIGINAL
        // ========================================================

        compareTotal +=
            Math.max(compareAtPrice, price) * qty;


        // ========================================================
        // CANTIDAD TOTAL DE PRODUCTOS
        // ========================================================

        itemCount += qty;


        // ========================================================
        // RENDER ITEM
        // ========================================================

        container.appendChild(
            createCartItemElement(
                item,
                index,
                originalProduct
            )
        );

    });

    return {
        total,
        compareTotal,
        itemCount
    };
}


function findOriginalProduct(item, productList) {

    const targetId = item.id ?? item.productId;

    return productList.find(
        p => String(p.id) === String(targetId)
    );

}


function createCartItemElement(item, index, product) {

    const imageSrc =
        item.image ??
        product?.image ??
        '';

    const itemName =
        item.name ??
        product?.name ??
        'Producto';

    const itemPrice =
        getItemPrice(item, product);

    const itemCompareAtPrice =
        Number(
            item.compareAtPrice ??
            product?.compareAtPrice ??
            0
        );

    const itemQty =
        getItemQty(item);

    const element =
        document.createElement('div');

    element.classList.add('cart-item');


    // ============================================================
    // ATRIBUTOS
    // ============================================================

    const attributesHTML =
        Array.isArray(item.attributes)
            ? item.attributes
                .map(attribute => {

                    const attributeName =
                        attribute?.attribute?.name ||
                        attribute?.attribute?.slug ||
                        '';

                    const attributeValue =
                        attribute?.option?.value ??
                        '';

                    const hexColor =
                        attribute?.option?.hexColor ||
                        '';

                    if (
                        !attributeName ||
                        !attributeValue
                    ) {
                        return '';
                    }

                    // Color
                    if (hexColor) {
                        return `
                            <div class="cart-item-meta cart-item-color">

                                <span class="cart-item-attribute-name">
                                    ${escapeHTML(attributeName)}:
                                </span>

                                <span
                                    class="cart-color-dot"
                                    style="background-color:${escapeHTML(hexColor)};"
                                    title="${escapeHTML(attributeValue)}"
                                ></span>

                                <span class="cart-item-attribute-value">
                                    ${escapeHTML(attributeValue)}
                                </span>

                            </div>
                        `;
                    }

                    // Atributo normal
                    return `
                        <div class="cart-item-meta">

                            <span class="cart-item-attribute-name">
                                ${escapeHTML(attributeName)}:
                            </span>

                            <span class="cart-item-attribute-value">
                                ${escapeHTML(attributeValue)}
                            </span>

                        </div>
                    `;
                })
                .join('')
            : '';


    // ============================================================
    // PRECIO
    // ============================================================

    const priceHTML =
        itemCompareAtPrice > itemPrice
            ? `
                <div class="cart-item-prices">

                    <span class="cart-item-price-old">
                        S/${itemCompareAtPrice.toFixed(2)}
                    </span>

                    <span class="cart-item-price">
                        S/${itemPrice.toFixed(2)}
                    </span>

                </div>
            `
            : `
                <div class="cart-item-prices">

                    <span class="cart-item-price">
                        S/${itemPrice.toFixed(2)}
                    </span>

                </div>
            `;


    // ============================================================
    // HTML DEL ITEM
    // ============================================================

    element.innerHTML = `
            <div class="cart-item-selection">
                <input
                    type="checkbox"
                    class="cart-item-checkbox"
                    data-cart-item-id="${item.id}"
                    ${item.isSelected === true ? 'checked' : ''}
                    aria-label="Seleccionar ${escapeHTML(itemName)}"
                >
            </div>
    
            <img
                class="cart-item-img"
                src="${escapeHTML(imageSrc)}"
                alt="${escapeHTML(itemName)}"
                loading="lazy"
            >

            <div class="cart-item-info">

                <div class="cart-item-top">
                    <h4 class="cart-item-title">
                        ${escapeHTML(itemName)}
                    </h4>

                    ${priceHTML}
                </div>

                <div class="cart-item-body">

                    <div class="cart-item-attributes">
                        ${attributesHTML}
                    </div>

                    <div class="cart-item-controls">

                        <div class="cart-item-qty">
                            <button
                                type="button"
                                onclick="updateCartQty(${index}, -1)"
                                aria-label="Disminuir cantidad"
                            >
                                <i class="fa-solid fa-minus"></i>
                            </button>

                            <span>${itemQty}</span>

                            <button
                                type="button"
                                onclick="updateCartQty(${index}, 1)"
                                aria-label="Aumentar cantidad"
                            >
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        </div>

                        <button
                            type="button"
                            class="cart-item-remove"
                            onclick="removeCartItem(${index})"
                        >
                            Eliminar
                        </button>

                    </div>

                </div>

            </div>
        `;

    return element;
}


function getItemPrice(item, product) {
    return Number(item.price ?? product?.price ?? 0);
}


function getItemQty(item) {
    return Number(item.qty ?? item.quantity ?? 0);
}


window.updateCartUI = updateCartUI;