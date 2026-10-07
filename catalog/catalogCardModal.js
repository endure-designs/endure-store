// ==========================================================================
// CATALOG CARD MODAL — Lógica del modal de vista rápida de producto
// ==========================================================================

function openProductModal(productId) {

    // ----------------------------------------------------------------------
    // Obtener producto desde catalogManager
    // ----------------------------------------------------------------------

    const productList = catalogManager.getProducts();

    const product = productList.find(
        p => String(p.id) === String(productId)
    );

    if (!product) return;


    // ----------------------------------------------------------------------
    // Estado inicial del producto seleccionado
    // ----------------------------------------------------------------------

    appState.selectedProduct = product;
    appState.selectedQty = 1;
    appState.selectedAttributes = {};
    appState.selectedVariant = null;


    // ----------------------------------------------------------------------
    // Cantidad
    // ----------------------------------------------------------------------

    const qtyVal =
        document.getElementById('qtyVal');

    if (qtyVal) {
        qtyVal.textContent =
            appState.selectedQty;
    }


    // ----------------------------------------------------------------------
    // Elementos del modal
    // ----------------------------------------------------------------------

    const modalImg =
        document.getElementById('modalImg');

    const modalCategory =
        document.getElementById('modalCategory');

    const modalTitle =
        document.getElementById('modalTitle');

    const modalPrice =
        document.getElementById('modalPrice');

    const modalDescription =
        document.getElementById('modalDescription');

    const modalAttributes =
        document.getElementById('modalAttributes');


    // ----------------------------------------------------------------------
    // Datos principales
    // ----------------------------------------------------------------------

    if (modalImg) {

        modalImg.src =
            product.image || '';

        modalImg.alt =
            product.name || '';

    }


    if (modalCategory) {

        modalCategory.textContent =
            product.category?.name || '-';

    }


    if (modalTitle) {

        modalTitle.textContent =
            product.name || '';

    }


    function updateModalPrice(variant = null) {

        if (!modalPrice) return;

        const currentPrice =
            variant?.price != null
                ? parseFloat(variant.price)
                : parseFloat(product.price || 0);

        const comparePrice =
            variant?.compareAtPrice != null
                ? parseFloat(variant.compareAtPrice)
                : parseFloat(product.compareAtPrice || 0);


        // Hay oferta solamente si compareAtPrice
        // es mayor que el precio actual

        const isOnSale =
            comparePrice > currentPrice;


        if (isOnSale) {

            modalPrice.innerHTML = `
            <span class="modal-price-compare">
                S/${comparePrice.toFixed(2)}
            </span>

            <span class="modal-price-current">
                S/${currentPrice.toFixed(2)}
            </span>
        `;

        } else {

            modalPrice.innerHTML =
                `<span class="modal-price-current">
                S/${currentPrice.toFixed(2)}
            </span>`;

        }

    }


    if (modalDescription) {

        modalDescription.textContent =
            product.description || '';

    }


    // ----------------------------------------------------------------------
    // Obtener variantes disponibles
    // ----------------------------------------------------------------------

    const variants =
        Array.isArray(product.variants)
            ? product.variants
            : [];

    updateModalPrice();

    // ----------------------------------------------------------------------
    // Funciones auxiliares para atributos
    // ----------------------------------------------------------------------

    const getAttributeKey = attribute => {

        const slug =
            attribute?.attribute?.slug;

        const name =
            attribute?.attribute?.name;

        const id =
            attribute?.attribute?.id;

        return String(
            slug ||
            name ||
            id ||
            ''
        ).trim().toLowerCase();

    };


    const getAttributeName = attribute => {

        return String(
            attribute?.attribute?.name ||
            attribute?.attribute?.slug ||
            ''
        ).trim();

    };


    const getAttributeValue = attribute => {

        return attribute?.option?.value ?? '';

    };


    const getAttributeColor = attribute => {

        return attribute?.option?.hexColor || '';

    };


    // ----------------------------------------------------------------------
    // Construir grupos de atributos
    // ----------------------------------------------------------------------

    const attributeGroups = {};


    variants.forEach(variant => {

        if (!Array.isArray(variant.attributes)) {
            return;
        }


        variant.attributes.forEach(attribute => {

            const key =
                getAttributeKey(attribute);

            if (!key) {
                return;
            }


            const name =
                getAttributeName(attribute);

            const value =
                getAttributeValue(attribute);

            const hexColor =
                getAttributeColor(attribute);


            if (!value) {
                return;
            }


            if (!attributeGroups[key]) {

                attributeGroups[key] = {

                    key,

                    name,

                    options: []

                };

            }


            const alreadyExists =
                attributeGroups[key].options.some(
                    option =>
                        String(option.value) ===
                        String(value)
                );


            if (!alreadyExists) {

                attributeGroups[key].options.push({

                    value,

                    hexColor

                });

            }

        });

    });


    // ----------------------------------------------------------------------
    // Seleccionar variante por defecto
    // ----------------------------------------------------------------------

    const defaultVariant =
        variants.find(variant => variant.isDefault === true) ||
        variants[0] ||
        null;

    appState.selectedAttributes = {};
    appState.selectedVariant = defaultVariant;

    if (
        defaultVariant &&
        Array.isArray(defaultVariant.attributes)
    ) {
        defaultVariant.attributes.forEach(attribute => {

            const key =
                getAttributeKey(attribute);

            const value =
                getAttributeValue(attribute);

            if (key && value !== '') {
                appState.selectedAttributes[key] = value;
            }
        });
    }


    // ----------------------------------------------------------------------
    // Generar selectores dinámicamente
    // ----------------------------------------------------------------------

    if (modalAttributes) {

        modalAttributes.innerHTML = '';


        Object.values(attributeGroups)
            .forEach(group => {


                // ----------------------------------------------------------
                // Contenedor del atributo
                // ----------------------------------------------------------

                const attributeGroup =
                    document.createElement('div');

                attributeGroup.classList.add(
                    'attribute-group'
                );


                // ----------------------------------------------------------
                // Nombre del atributo
                // ----------------------------------------------------------

                const label =
                    document.createElement('label');

                label.textContent =
                    `${group.name}:`;


                // ----------------------------------------------------------
                // Contenedor de opciones
                // ----------------------------------------------------------

                const optionsContainer =
                    document.createElement('div');


                // Determinar si este grupo contiene colores
                const hasColorOptions =
                    group.options.some(
                        option =>
                            option.hexColor
                    );


                optionsContainer.classList.add(
                    'attribute-options'
                );

                if (hasColorOptions) {
                    optionsContainer.classList.add(
                        'color-options'
                    );
                }


                // ----------------------------------------------------------
                // Generar opciones
                // ----------------------------------------------------------

                group.options.forEach(option => {

                    const button =
                        document.createElement('button');

                    button.type = 'button';


                    const isDefaultOption =
                        String(
                            appState.selectedAttributes[group.key]
                        ) === String(option.value);

                    if (isDefaultOption) {
                        button.classList.add('active');
                    }


                    // ------------------------------------------------------
                    // Opción de color
                    // ------------------------------------------------------

                    if (option.hexColor) {

                        button.classList.add(
                            'color-option'
                        );

                        button.style.backgroundColor =
                            option.hexColor;

                        button.title =
                            option.value;

                        button.setAttribute(
                            'aria-label',
                            option.value
                        );

                    }

                    // ------------------------------------------------------
                    // Opción normal
                    // ------------------------------------------------------

                    else {

                        button.classList.add(
                            'attribute-option'
                        );

                        button.textContent =
                            option.value;
                    }


                    // ------------------------------------------------------
                    // Seleccionar opción
                    // ------------------------------------------------------

                    button.addEventListener(
                        'click',
                        () => {


                            // Quitar selección
                            // solamente dentro de
                            // este atributo

                            optionsContainer
                                .querySelectorAll(
                                    'button'
                                )
                                .forEach(
                                    btn =>
                                        btn.classList
                                            .remove('active')
                                );


                            // Activar botón actual

                            button.classList.add(
                                'active'
                            );


                            // Guardar selección

                            appState
                                .selectedAttributes[
                                group.key
                            ] = option.value;


                            // Buscar variante

                            updateSelectedVariant();

                        }
                    );


                    optionsContainer.appendChild(
                        button
                    );

                });


                // ----------------------------------------------------------
                // Añadir al DOM
                // ----------------------------------------------------------

                attributeGroup.appendChild(label);

                attributeGroup.appendChild(
                    optionsContainer
                );

                modalAttributes.appendChild(
                    attributeGroup
                );

            });

    }


    // ----------------------------------------------------------------------
    // Buscar variante seleccionada
    // ----------------------------------------------------------------------

    function updateSelectedVariant() {

        const selectedAttributes =
            appState.selectedAttributes || {};


        const selectedKeys =
            Object.keys(selectedAttributes);


        // --------------------------------------------------------------
        // Si todavía no se seleccionó ningún atributo
        // --------------------------------------------------------------

        if (selectedKeys.length === 0) {

            appState.selectedVariant =
                variants.length === 1
                    ? variants[0]
                    : null;

            return;

        }


        // --------------------------------------------------------------
        // Buscar variante compatible
        // --------------------------------------------------------------

        const selectedVariant =
            variants.find(variant => {

                if (
                    !Array.isArray(
                        variant.attributes
                    )
                ) {
                    return false;
                }


                // Crear mapa de atributos
                // de esta variante

                const variantAttributes = {};


                variant.attributes.forEach(
                    attribute => {

                        const key =
                            getAttributeKey(
                                attribute
                            );

                        const value =
                            getAttributeValue(
                                attribute
                            );

                        if (key) {

                            variantAttributes[key] =
                                value;

                        }

                    }
                );


                // ----------------------------------------------------------
                // La variante debe coincidir con
                // todas las selecciones realizadas
                // ----------------------------------------------------------

                return selectedKeys.every(
                    key => {

                        return (
                            String(
                                variantAttributes[key]
                            ) ===
                            String(
                                selectedAttributes[key]
                            )
                        );

                    }
                );

            });


        appState.selectedVariant =
            selectedVariant || null;
        updateModalPrice(
            appState.selectedVariant
        );

    }


    // ----------------------------------------------------------------------
    // Selección inicial de variante
    // ----------------------------------------------------------------------

    updateSelectedVariant();


    // ----------------------------------------------------------------------
    // Abrir modal
    // ----------------------------------------------------------------------

    const productModal =
        document.getElementById('productModal');


    if (productModal) {

        productModal.classList.add('open');

        document.body.style.overflow =
            'hidden';

    }

}


// ==========================================================================
// CERRAR MODAL
// ==========================================================================

function closeProductModal() {

    const productModal =
        document.getElementById('productModal');


    // ----------------------------------------------------------------------
    // Cerrar modal
    // ----------------------------------------------------------------------

    if (productModal) {

        productModal.classList.remove('open');

        document.body.style.overflow = '';

    }


    // ----------------------------------------------------------------------
    // Recuperar tarjeta seleccionada
    // ----------------------------------------------------------------------

    const card =
        window.lastProductCard;


    if (!card) {
        return;
    }


    // ----------------------------------------------------------------------
    // Ejecutar aterrizaje de la tarjeta
    // ----------------------------------------------------------------------

    if (
        window.catalogCardAnimation &&
        typeof catalogCardAnimation.return ===
        'function'
    ) {

        catalogCardAnimation.return(card);

    }

}


// ----------------------------------------------------------------------
// Validar variante seleccionada
// ----------------------------------------------------------------------

function validateSelectedVariant() {

    const product = appState.selectedProduct;

    if (!product) {
        return {
            valid: false,
            variant: null,
            message: 'No se encontró el producto seleccionado.'
        };
    }

    const variants =
        Array.isArray(product.variants)
            ? product.variants
            : [];

    const variant =
        appState.selectedVariant;

    // --------------------------------------------------------------
    // No existe una variante para la combinación seleccionada
    // --------------------------------------------------------------

    if (!variant) {

        const selectedValues =
            Object.entries(
                appState.selectedAttributes || {}
            )
                .filter(([, value]) =>
                    value !== undefined &&
                    value !== null &&
                    String(value).trim() !== ''
                )
                .map(([key, value]) =>
                    `${key}: ${value}`
                );

        const combination =
            selectedValues.length > 0
                ? selectedValues.join(' → ')
                : 'la combinación seleccionada';

        return {
            valid: false,
            variant: null,
            message:
                `No contamos con ${combination}.`
        };
    }

    // --------------------------------------------------------------
    // Verificar que la variante realmente pertenece al producto
    // --------------------------------------------------------------

    const exists =
        variants.some(item =>
            String(item.id) === String(variant.id)
        );

    if (!exists) {

        return {
            valid: false,
            variant: null,
            message:
                'La variante seleccionada ya no está disponible.'
        };
    }

    // --------------------------------------------------------------
    // Variante válida
    // --------------------------------------------------------------

    return {
        valid: true,
        variant
    };
}


// ==========================================================================
// EXPONER API
// ==========================================================================

window.catalogCardModal = {

    openProductModal,

    closeProductModal,

    validateSelectedVariant

};
