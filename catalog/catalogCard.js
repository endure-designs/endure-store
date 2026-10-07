// ==========================================================================
// CATALOG CARD - Tarjeta individual de producto
// ==========================================================================


function createProductCard(product) {

    const isOnSale =
        product.compareAtPrice != null &&
        parseFloat(product.compareAtPrice) > parseFloat(product.price);


    // ----------------------------------------------------------------------
    // Crear tarjeta
    // ----------------------------------------------------------------------

    const card = document.createElement('div');

    card.classList.add('product-card', 'entrada');

    card.dataset.productId = product.id;


    // ----------------------------------------------------------------------
    // Tags
    // ----------------------------------------------------------------------

    const badgeHTML =
        product.tags && product.tags.length > 0
            ? `
            <div class="product-badge-flip">
                <div class="product-badge-inner">

                    <span class="product-badge">
                        ${product.tags[0].name}
                    </span>

                    ${product.tags.length > 1
                ? `
                            <span class="product-badge product-badge-back">
                                ${product.tags[1].name}
                            </span>
                            `
                : ''
            }

                </div>
            </div>
            `
            : '';


    // ----------------------------------------------------------------------
    // Categoría
    // ----------------------------------------------------------------------

    const categoryName =
        product.category?.name || '-';


    // ----------------------------------------------------------------------
    // Precio
    // ----------------------------------------------------------------------

    const price =
        product.price != null
            ? parseFloat(product.price).toFixed(2)
            : '0.00';


    const compareAtPrice =
        product.compareAtPrice != null
            ? parseFloat(product.compareAtPrice).toFixed(2)
            : null;


    const priceHTML =
        compareAtPrice &&
            parseFloat(product.compareAtPrice) >
            parseFloat(product.price)

            ? `
            <div class="product-price">

                <span class="product-price-old">
                    S/${compareAtPrice}
                </span>

                <span class="product-price-current">
                    S/${price}
                </span>

            </div>
            `

            : `
            <div class="product-price">
                S/${price}
            </div>
            `;


    // ----------------------------------------------------------------------
    // HTML de la tarjeta
    // ----------------------------------------------------------------------

    card.innerHTML = `

        <div
            class="product-img-wrapper"
            onclick="catalogCard.launchProductCard(
                this.closest('.product-card'),
                '${product.id}'
            )"
        >

            ${badgeHTML}

            <img
                class="product-img"
                src="${product.image || ''}"
                alt="${product.name}"
                loading="lazy"
            >

            <div class="product-quick-view">
                Vista Rápida
            </div>

        </div>


        <div class="product-details">

            <span class="product-category">
                ${categoryName}
            </span>


            <h3
                class="product-name"
                onclick="catalogCard.launchProductCard(
                    this.closest('.product-card'),
                    '${product.id}'
                )"
            >
                ${product.name}
            </h3>


            ${priceHTML}


            <button
                class="product-add-btn"
                onclick="quickAdd('${product.id}')"
            >

                <i class="fa-solid fa-bag-shopping"></i>

                Añadir

            </button>

        </div>

    `;


    // ----------------------------------------------------------------------
    // Iniciar sistema de animación
    // ----------------------------------------------------------------------

    catalogCardAnimation.init(card, product);


    return card;
}



function launchProductCard(card, productId) {

    if (!card) return;


    // ----------------------------------------------------------------------
    // Guardar tarjeta actualmente seleccionada
    // ----------------------------------------------------------------------

    window.lastProductCard = card;


    // ----------------------------------------------------------------------
    // Lanzar animación de salida
    // ----------------------------------------------------------------------

    catalogCardAnimation.launch(card, productId);


    // ----------------------------------------------------------------------
    // Abrir modal después del despegue
    // ----------------------------------------------------------------------

    setTimeout(() => {

        catalogCardModal.openProductModal(productId);

    }, 300);

}



window.catalogCard = {

    createProductCard,

    launchProductCard

};