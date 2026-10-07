// ==========================================================================
// ACCOUNT VARIANTS — Gestión de atributos y variantes de productos
// ==========================================================================
//
// Responsabilidades:
//
// 1. Cargar los atributos permitidos para un ProductType.
// 2. Mostrar sus opciones en el formulario.
// 3. Registrar las opciones seleccionadas.
// 4. Generar todas las combinaciones posibles.
// 5. Renderizar las variantes.
// 6. Permitir configurar precio e inventario por variante.
// 7. Mantener una única variante predeterminada.
// 8. Generar el payload compatible con el backend.
//
// El SKU NO se maneja aquí.
// El backend lo genera automáticamente.
// ==========================================================================


// ==========================================================================
// ESTADO DEL MÓDULO
// ==========================================================================

const accountVariantsState = {

    // Tipo de producto actualmente seleccionado
    productType: null,

    // Atributos devueltos por el backend
    attributes: [],

    // Variantes actualmente configuradas
    variants: [],

    // Indica si estamos editando un producto existente
    isEditing: false,

    selectedVariantIndex: null,

    editingVariantIndex: null,


    editingVariantImageKeys: []

};


// ==========================================================================
// REFERENCIAS DOM
// ==========================================================================

function getAttributesContainer() {
    return document.getElementById('adminProductAttributes');
}

function getVariantsContainer() {
    return document.getElementById('adminVariantsContainer');
}

function getVariantsSection() {
    return document.getElementById('variantsSection');
}

function getVariantsCount() {
    return document.getElementById('variantsCount');
}


// ==========================================================================
// CARGAR ATRIBUTOS DEL TIPO DE PRODUCTO
// ==========================================================================

async function cargarAtributosDelTipoProducto(productTypeSlug) {

    const container = getAttributesContainer();

    if (!container) return;

    // Limpiar estado anterior
    accountVariantsState.productType = null;
    accountVariantsState.attributes = [];
    accountVariantsState.variants = [];
    accountVariantsState.isEditing = false;

    limpiarVariantes();

    if (!productTypeSlug || productTypeSlug === '__NUEVO__') {

        container.innerHTML = `
            <div class="attributes-empty-state">
                <i class="fa-solid fa-sliders"></i>

                <p>
                    Selecciona un tipo de producto para cargar sus atributos.
                </p>
            </div>
        `;

        return;
    }

    // Estado de carga
    container.innerHTML = `
        <div class="attributes-loading">
            <i class="fa-solid fa-spinner fa-spin"></i>
            Cargando atributos...
        </div>
    `;

    try {

        if (
            !window.accountProductApi ||
            typeof window.accountProductApi.getProductTypeAttributes !== 'function'
        ) {
            throw new Error(
                'accountProductApi.getProductTypeAttributes() no está disponible.'
            );
        }

        const response =
            await window.accountProductApi.getProductTypeAttributes(
                productTypeSlug
            );

        /*
         * El backend devuelve el ProductType con:
         *
         * {
         *     id,
         *     name,
         *     slug,
         *     attributes: [
         *         {
         *             id,
         *             required,
         *             sortOrder,
         *             attribute: {
         *                 id,
         *                 name,
         *                 slug,
         *                 options: [...]
         *             }
         *         }
         *     ]
         * }
         */

        const productType =
            response?.data ?? response;

        if (!productType || !Array.isArray(productType.attributes)) {

            throw new Error(
                'La respuesta del servidor no contiene atributos válidos.'
            );
        }

        accountVariantsState.productType = productType;
        accountVariantsState.attributes = productType.attributes;

        renderAttributes();

    } catch (error) {

        console.error(
            'Error cargando atributos del producto:',
            error
        );

        container.innerHTML = `
            <div class="attributes-error">
                <i class="fa-solid fa-circle-exclamation"></i>

                <p>
                    No se pudieron cargar los atributos del tipo de producto.
                </p>
            </div>
        `;
    }
}


// ==========================================================================
// RENDERIZAR ATRIBUTOS
// ==========================================================================

function renderAttributes() {

    const container =
        getAttributesContainer();

    if (!container) return;


    const attributes =
        accountVariantsState.attributes;


    // ----------------------------------------------------------------------
    // SIN ATRIBUTOS
    // ----------------------------------------------------------------------

    if (!attributes.length) {

        container.innerHTML = `
            <div class="attributes-empty-state">

                <i class="fa-solid fa-circle-info"></i>

                <p>
                    Este tipo de producto no tiene atributos configurados.
                </p>

            </div>
        `;

        return;
    }


    // ----------------------------------------------------------------------
    // CONTENEDOR DE COLUMNAS
    // ----------------------------------------------------------------------

    container.innerHTML = '';

    container.classList.add(
        'admin-attributes-grid'
    );


    // ----------------------------------------------------------------------
    // CREAR UNA COLUMNA POR ATRIBUTO
    // ----------------------------------------------------------------------

    attributes.forEach(productTypeAttribute => {

        const attribute =
            productTypeAttribute.attribute;


        if (!attribute) return;


        const section =
            document.createElement('div');


        section.className =
            'admin-attribute-group';


        section.dataset.productTypeAttributeId =
            productTypeAttribute.id;


        section.dataset.attributeId =
            attribute.id;


        // ------------------------------------------------------------------
        // CABECERA + OPCIONES
        // ------------------------------------------------------------------

        section.innerHTML = `

            <div class="admin-attribute-header">

                <div>

                    <span class="admin-attribute-name">
                        ${escapeHtml(attribute.name)}
                    </span>

                    ${productTypeAttribute.required

                ? `
                                <span
                                    class="admin-attribute-required"
                                >
                                    *
                                </span>
                            `

                : `
                                <span
                                    class="admin-attribute-optional"
                                >
                                    Opcional
                                </span>
                            `
            }

                </div>


                <span class="admin-attribute-slug">
                    ${escapeHtml(attribute.slug)}
                </span>

            </div>


            <div class="admin-attribute-options">

                ${Array.isArray(attribute.options) &&
                attribute.options.length

                ? attribute.options
                    .map(option =>
                        createOptionHTML(
                            productTypeAttribute,
                            option
                        )
                    )
                    .join('')

                : `
                            <span class="admin-no-options">
                                No hay opciones configuradas.
                            </span>
                        `
            }

            </div>

        `;


        container.appendChild(
            section
        );

    });


    // ----------------------------------------------------------------------
    // ACTIVAR EVENTOS DE SELECCIÓN
    // ----------------------------------------------------------------------

    attachAttributeOptionListeners();

}


// ==========================================================================
// CREAR HTML DE UNA OPCIÓN
// ==========================================================================

function createOptionHTML(productTypeAttribute, option) {

    const attribute =
        productTypeAttribute.attribute;

    const isColor =
        attribute.slug === 'color' ||
        attribute.slug === 'colour' ||
        Boolean(option.hexColor);

    return `

        <button
            type="button"
            class="admin-attribute-option ${isColor ? 'color-option' : ''}"

            data-product-type-attribute-id="${productTypeAttribute.id}"

            data-attribute-id="${attribute.id}"

            data-attribute-option-id="${option.id}"

        >

            ${isColor && option.hexColor
            ? `
                    <span
                        class="attribute-color-preview"
                        style="background-color:${escapeAttribute(
                option.hexColor
            )};"
                    ></span>
                `
            : ''
        }

            <span class="admin-attribute-option-label">

                ${escapeHtml(option.value)}

            </span>

        </button>

    `;
}


// ==========================================================================
// EVENTOS DE OPCIONES
// ==========================================================================

function attachAttributeOptionListeners() {

    const container =
        getAttributesContainer();

    if (!container) return;


    const options =
        container.querySelectorAll(
            '.admin-attribute-option'
        );


    options.forEach(option => {

        option.addEventListener(
            'click',
            () => {

                option.classList.toggle(
                    'selected'
                );

                actualizarEstadoGeneracion();

            }
        );

    });

}


// ==========================================================================
// OBTENER OPCIONES SELECCIONADAS
// ==========================================================================

function obtenerOpcionesSeleccionadas() {

    const result = [];

    const attributes =
        accountVariantsState.attributes;

    for (const productTypeAttribute of attributes) {

        const productTypeAttributeId =
            productTypeAttribute.id;

        const selectedButtons =
            document.querySelectorAll(
                `.admin-attribute-option.selected[data-product-type-attribute-id="${productTypeAttributeId}"]`
            );

        const selectedOptionIds =
            Array.from(selectedButtons)
                .map(
                    button =>
                        Number(
                            button.dataset.attributeOptionId
                        )
                );

        result.push({

            productTypeAttributeId,

            attribute:
                productTypeAttribute.attribute,

            required:
                productTypeAttribute.required,

            optionIds:
                selectedOptionIds

        });
    }

    return result;
}


// ==========================================================================
// VALIDAR ATRIBUTOS ANTES DE GENERAR
// ==========================================================================

function validarSeleccionDeAtributos() {

    const selectedAttributes =
        obtenerOpcionesSeleccionadas();

    const missingRequired =
        selectedAttributes.filter(
            attribute =>
                attribute.required &&
                attribute.optionIds.length === 0
        );

    if (missingRequired.length) {

        const names =
            missingRequired
                .map(attribute => attribute.attribute.name)
                .join(', ');

        mostrarError(
            `Debes seleccionar al menos una opción para: ${names}.`
        );

        return false;
    }

    const hasAnyOption =
        selectedAttributes.some(
            attribute => attribute.optionIds.length > 0
        );

    /*
     * Si el ProductType no tiene atributos, permitimos
     * una variante única sin attributeOptionIds.
     */

    if (
        accountVariantsState.attributes.length > 0 &&
        !hasAnyOption
    ) {

        mostrarError(
            'Selecciona al menos una opción de atributo.'
        );

        return false;
    }

    return true;
}


// ==========================================================================
// GENERAR VARIANTES
// ==========================================================================

function generarVariantes() {

    if (!validarSeleccionDeAtributos()) {
        return;
    }

    const selectedAttributes =
        obtenerOpcionesSeleccionadas();

    const combinations =
        generarCombinaciones(selectedAttributes);

    if (combinations.length === 0) {

        mostrarError(
            'No se pudieron generar variantes.'
        );

        return;
    }

    if (combinations.length > 200) {

        mostrarError(
            'La combinación de atributos genera más de 200 variantes.'
        );

        return;
    }

    const existingVariants =
        accountVariantsState.variants;

    /*
     * Intentamos conservar configuraciones existentes
     * cuando una combinación sigue existiendo.
     */

    const previousBySignature =
        new Map(
            existingVariants.map(variant => [
                crearFirmaDeVariante(
                    variant.attributeOptionIds
                ),
                variant
            ])
        );

    accountVariantsState.variants =
        combinations.map((combination, index) => {

            const signature =
                crearFirmaDeVariante(
                    combination.attributeOptionIds
                );

            const previous =
                previousBySignature.get(signature);

            if (previous) {

                return {
                    ...previous,

                    attributeOptionIds:
                        combination.attributeOptionIds,

                    attributes:
                        combination.attributes

                };

            }

            return {
                id: undefined,

                attributeOptionIds:
                    combination.attributeOptionIds,

                attributes:
                    combination.attributes,

                price:
                    obtenerPrecioBase(),

                compareAtPrice:
                    null,

                isDefault:
                    index === 0,

                inventory: {
                    stock: 0,
                    minimumStock: 3,
                    maximumStock: null,
                    allowBackorder: true
                },

                reservedStock: 0,

                images: []
            };
        });

    renderVariants();

    actualizarEstadoGeneracion();
}


// ==========================================================================
// GENERAR PRODUCTO CARTESIANO DE ATRIBUTOS
// ==========================================================================

function generarCombinaciones(attributes) {

    /*
     * Solo usamos atributos que tienen opciones seleccionadas.
     *
     * Los atributos obligatorios deben haber sido validados antes.
     * Los opcionales pueden omitirse completamente.
     */

    const activeAttributes =
        attributes.filter(
            attribute => attribute.optionIds.length > 0
        );

    /*
     * Producto sin atributos:
     * una única variante sin opciones.
     */

    if (!activeAttributes.length) {

        return [
            {
                attributeOptionIds: [],
                attributes: []
            }
        ];
    }

    let combinations = [
        {
            attributeOptionIds: [],
            attributes: []
        }
    ];

    for (const attribute of activeAttributes) {

        const nextCombinations = [];

        for (const combination of combinations) {

            for (const optionId of attribute.optionIds) {

                const option =
                    attribute.attribute.options.find(
                        option =>
                            Number(option.id) === Number(optionId)
                    );

                if (!option) continue;

                nextCombinations.push({

                    attributeOptionIds: [
                        ...combination.attributeOptionIds,
                        Number(option.id)
                    ],

                    attributes: [
                        ...combination.attributes,

                        {
                            productTypeAttributeId:
                                attribute.productTypeAttributeId,

                            attributeId:
                                attribute.attribute.id,

                            attributeSlug:
                                attribute.attribute.slug,

                            attributeName:
                                attribute.attribute.name,

                            attributeOptionId:
                                Number(option.id),

                            value:
                                option.value,

                            hexColor:
                                option.hexColor || null
                        }
                    ]

                });
            }
        }

        combinations = nextCombinations;
    }

    return combinations;
}


// ==========================================================================
// RENDERIZAR VARIANTES
// ==========================================================================

function renderVariants() {

    const container =
        getVariantsContainer();

    const section =
        getVariantsSection();

    if (!container || !section) return;

    const variants =
        accountVariantsState.variants;

    if (!variants.length) {

        section.style.display = 'none';

        container.innerHTML = '';

        actualizarContadorVariantes();

        return;
    }

    section.style.display = 'block';

    container.innerHTML = '';

    variants.forEach((variant, index) => {

        const card =
            document.createElement('div');

        card.className =
            `admin-variant-card ${variant.deleted ? 'variant-deleted' : ''
            }`;

        card.dataset.variantIndex = index;

        card.innerHTML =
            crearVarianteHTML(variant, index);

        container.appendChild(card);
    });

    attachVariantListeners();

    actualizarContadorVariantes();
}


// ==========================================================================
// CREAR HTML DE UNA VARIANTE
// ==========================================================================

function crearVarianteHTML(variant, index) {

    const isExisting = variant.id !== undefined;
    const isDeleted = variant.deleted === true;
    const isNew = !isExisting;

    const attributeLabels =
        variant.attributes.length
            ? variant.attributes.map(attribute => {
                return `
                    <span class="variant-attribute-chip">
                        ${attribute.hexColor
                        ? `
                                <span
                                    class="variant-color-dot"
                                    style="background-color:${escapeAttribute(
                            attribute.hexColor
                        )};"
                                ></span>
                            `
                        : ''
                    }

                        <strong>
                            ${escapeHtml(attribute.attributeName)}:
                        </strong>

                        ${escapeHtml(attribute.value)}
                    </span>
                `;
            }).join('')
            : `
                <span class="variant-attribute-chip">
                    Variante única
                </span>
            `;

    const inventory = variant.inventory || {};

    const stock =
        inventory.stock ?? 0;

    const stockReadonly =
        accountVariantsState.isEditing ? 'readonly' : '';

    const minimumStock =
        inventory.minimumStock ?? 3;

    const maximumStock =
        inventory.maximumStock ?? '';

    const allowBackorder =
        inventory.allowBackorder === true;

    const price =
        variant.price ?? '';

    const ofertaActiva =
        document.getElementById('tagOfertaCheck')?.checked === true;

    const compareAtPrice =
        ofertaActiva && variant.compareAtPrice != null
            ? variant.compareAtPrice
            : 'No se acepta';

    const reservedStock =
        variant.reservedStock ?? 0;

    console.log('🔍 Render stock variante:', {
        index,
        variantId: variant.id,
        inventory: variant.inventory,
        stock
    });

    console.log('🧪 HTML STOCK:', {
        index,
        variantId: variant.id,
        inventory: variant.inventory,
        stock,
        escaped: escapeAttribute(stock)
    });

    return `
    <div class="admin-variant-card-header">

            <!-- TÍTULO -->
            <div class="variant-header-title">
                <span class="variant-number">
                    ${isNew
            ? `Variante nueva ${index + 1}`
            : `Variante ${index + 1}`
        }
                </span>
            </div>

            <!-- ACCIONES -->
            <div class="variant-header-actions">

                <!-- ELIMINAR / RESTAURAR -->
                <button
                    type="button"
                    class="variant-delete-btn ${isDeleted
            ? 'variant-restore'
            : 'variant-delete'
        }"
                    data-variant-action="${isDeleted
            ? 'restore'
            : 'delete'
        }"
                    data-variant-index="${index}"
                    title="${isDeleted
            ? 'Restaurar variante'
            : 'Eliminar variante'
        }"
                >
                    <i class="fa-solid ${isDeleted
            ? 'fa-rotate-left'
            : 'fa-trash-can'
        }"></i>
                </button>

                <!-- VARIANTE PREDETERMINADA -->
                <label class="variant-default-control">

                    <input
                        type="radio"
                        name="variantDefault"
                        value="${index}"
                        ${variant.isDefault && !isDeleted ? 'checked' : ''}
                        data-variant-field="isDefault"
                        ${isDeleted ? 'disabled' : ''}
                    >

                    <span>
                        Principal
                    </span>

                </label>

            </div>

            <!-- ATRIBUTOS -->
            <div class="variant-attributes-list">
                ${attributeLabels}
            </div>

        </div>


        <div class="admin-variant-card-body">

            <!-- PRECIO -->
            <div class="variant-field">

                <label>
                    Precio (S/) *
                </label>

                <input
                    type="number"
                    class="form-input"
                    min="0"
                    step="0.01"
                    value="${escapeAttribute(price)}"
                    data-variant-field="price"
                >

            </div>


            <!-- PRECIO TACHADO -->
            <div class="variant-field">

                <label>
                    Precio tachado (S/)
                </label>

                <input
                    type="text"
                    class="form-input"
                    value="${escapeAttribute(
            compareAtPrice ?? 'No se acepta'
        )}"
                    data-variant-field="compareAtPrice"
                    readonly
                >

            </div>


            <!-- STOCK -->
            <div class="variant-field">

                <label>
                    Stock${accountVariantsState.isEditing ? '' : ' *'}
                </label>

                <input
                    type="number"
                    class="form-input"
                    min="0"
                    step="1"
                    value="${escapeAttribute(stock)}"
                    data-variant-field="stock"
                    ${stockReadonly}
                >

            </div>


            <!-- STOCK RESERVADO -->
            <div class="variant-field">

                <label>
                    Stock reservado
                </label>

                <input
                    type="number"
                    class="form-input"
                    value="${escapeAttribute(reservedStock)}"
                    readonly
                    disabled
                >

            </div>


            <!-- STOCK MÍNIMO -->
            <div class="variant-field">

                <label>
                    Stock mínimo
                </label>

                <input
                    type="number"
                    class="form-input"
                    min="0"
                    step="1"
                    value="${escapeAttribute(minimumStock)}"
                    data-variant-field="minimumStock"
                >

            </div>


            <!-- STOCK MÁXIMO -->
            <div class="variant-field">

                <label>
                    Stock máximo
                </label>

                <input
                    type="number"
                    class="form-input"
                    min="0"
                    step="1"
                    value="${escapeAttribute(maximumStock)}"
                    data-variant-field="maximumStock"
                    placeholder="Sin límite"
                >

            </div>


            <!-- BACKORDER -->
            <div class="variant-field variant-backorder-field">

                <label>
                    Venta sin stock
                </label>

                <label class="variant-switch">

                    <input
                        type="checkbox"
                        ${allowBackorder ? 'checked' : ''}
                        data-variant-field="allowBackorder"
                    >

                    <span>
                        Permitir backorder
                    </span>

                </label>

            </div>


            <!-- SKU -->
            <div class="variant-field variant-sku-field">

                <label>
                    SKU
                </label>

                ${variant.sku
            ? `
                            <input
                                type="text"
                                class="form-input"
                                value="${escapeAttribute(variant.sku)}"
                                readonly
                                disabled
                            >
                        `
            : `
                            <div class="variant-generated-value">
                                Generado automáticamente
                            </div>
                        `
        }

            </div>

        </div>
    `;
}

// ==========================================================================
// EVENTOS DEL PANEL DE IMÁGENES
// ==========================================================================

function initVariantImagesModalEvents() {

    const saveButton =
        document.getElementById(
            'adminVariantImagesModalSave'
        );

    const cancelButton =
        document.getElementById(
            'adminVariantImagesModalCancel'
        );

    const closeButton =
        document.getElementById(
            'adminVariantImagesModalClose'
        );


    // ----------------------------------------------------------------------
    // GUARDAR
    // ----------------------------------------------------------------------

    if (saveButton) {

        saveButton.addEventListener(
            'click',
            saveVariantImages
        );

    }


    // ----------------------------------------------------------------------
    // CANCELAR
    // ----------------------------------------------------------------------

    if (cancelButton) {

        cancelButton.addEventListener(
            'click',
            closeVariantImagesModal
        );

    }


    // ----------------------------------------------------------------------
    // X
    // ----------------------------------------------------------------------

    if (closeButton) {

        closeButton.addEventListener(
            'click',
            closeVariantImagesModal
        );

    }

}


// ==========================================================================
// EVENTOS DE VARIANTES
// ==========================================================================

function attachVariantListeners() {

    const container =
        getVariantsContainer();

    if (!container) return;


    // --------------------------------------------------------------
    // Inputs generales
    // --------------------------------------------------------------

    container.querySelectorAll(
        '[data-variant-field]'
    ).forEach(input => {

        input.addEventListener(
            'input',
            event => {

                const card =
                    event.target.closest(
                        '.admin-variant-card'
                    );

                if (!card) return;

                const index =
                    Number(
                        card.dataset.variantIndex
                    );

                actualizarVarianteDesdeInput(
                    index,
                    event.target
                );
            }
        );


        input.addEventListener(
            'change',
            event => {

                const card =
                    event.target.closest(
                        '.admin-variant-card'
                    );

                if (!card) return;

                const index =
                    Number(
                        card.dataset.variantIndex
                    );

                actualizarVarianteDesdeInput(
                    index,
                    event.target
                );
            }
        );
    });


    // --------------------------------------------------------------
    // Variante predeterminada
    // --------------------------------------------------------------

    container.querySelectorAll(
        '[data-variant-field="isDefault"]'
    ).forEach(input => {

        input.addEventListener(
            'change',
            event => {

                if (!event.target.checked) return;

                const selectedIndex =
                    Number(
                        event.target.value
                    );

                establecerVariantePredeterminada(
                    selectedIndex
                );
            }
        );
    });


    // --------------------------------------------------------------
    // SELECCIONAR VARIANTE Y ABRIR PANEL DE IMÁGENES
    // --------------------------------------------------------------

    container.querySelectorAll(
        '.admin-variant-card'
    ).forEach(card => {

        card.addEventListener(
            'click',
            event => {

                // ----------------------------------------------------------
                // No seleccionar la variante cuando se interactúa
                // directamente con alguno de sus controles.
                // ----------------------------------------------------------

                if (
                    event.target.closest(
                        'input, button, select, textarea, label'
                    )
                ) {
                    return;
                }

                // ----------------------------------------------------------
                // Obtener índice
                // ----------------------------------------------------------

                const index =
                    Number(
                        card.dataset.variantIndex
                    );

                const variant =
                    accountVariantsState.variants[index];

                if (!variant) return;

                // ----------------------------------------------------------
                // VARIANTE ELIMINADA
                // No permitir abrir el modal de imágenes
                // ----------------------------------------------------------

                if (variant.deleted === true) {
                    return;
                }

                // ----------------------------------------------------------
                // ¿Ya estaba seleccionada?
                // ----------------------------------------------------------

                if (
                    accountVariantsState.selectedVariantIndex ===
                    index
                ) {
                    accountVariantsState.selectedVariantIndex =
                        null;

                    card.classList.remove(
                        'selected'
                    );

                    // ------------------------------------------------------
                    // Cerrar modal
                    // ------------------------------------------------------

                    const modal =
                        document.getElementById(
                            'adminVariantImagesModal'
                        );

                    if (modal) {
                        modal.style.display = 'none';
                        modal.hidden = true;
                    }

                    console.log(
                        '🟡 Variante deseleccionada:',
                        index
                    );

                    return;
                }

                // ----------------------------------------------------------
                // Seleccionar nueva variante
                // ----------------------------------------------------------

                accountVariantsState.selectedVariantIndex =
                    index;

                // ----------------------------------------------------------
                // Quitar selección de las demás
                // ----------------------------------------------------------

                container
                    .querySelectorAll(
                        '.admin-variant-card'
                    )
                    .forEach(item => {

                        const itemIndex =
                            Number(
                                item.dataset.variantIndex
                            );

                        item.classList.toggle(
                            'selected',
                            itemIndex === index
                        );
                    });

                // ----------------------------------------------------------
                // Abrir modal de imágenes
                // ----------------------------------------------------------

                openVariantImagesModal(
                    index
                );

                console.log(
                    '🟢 Variante seleccionada:',
                    index
                );
            }
        );
    });


    // --------------------------------------------------------------
    // ELIMINAR / RESTAURAR VARIANTE
    // IMPORTANTE: este bloque está FUERA del click de la tarjeta.
    // --------------------------------------------------------------

    container.querySelectorAll(
        '[data-variant-action]'
    ).forEach(button => {

        button.addEventListener(
            'click',
            event => {

                // Evita que el click llegue a .admin-variant-card
                // y abra el modal de imágenes.
                event.stopPropagation();

                const index =
                    Number(
                        event.currentTarget.dataset.variantIndex
                    );

                const variant =
                    accountVariantsState.variants[index];

                if (!variant) return;

                const action =
                    event.currentTarget.dataset.variantAction;

                // ==============================================================
                // ELIMINAR
                // ==============================================================

                if (action === 'delete') {

                    // ----------------------------------------------------------
                    // Determinar si era la variante principal
                    // ----------------------------------------------------------

                    const eraPrincipal =
                        variant.isDefault === true;

                    // ----------------------------------------------------------
                    // Marcar como eliminada
                    // ----------------------------------------------------------

                    variant.deleted = true;
                    variant.isDefault = false;

                    // ----------------------------------------------------------
                    // Si era la principal, asignar una nueva
                    // ----------------------------------------------------------

                    if (eraPrincipal) {

                        const nuevaPrincipal =
                            accountVariantsState.variants.find(
                                candidate =>
                                    candidate &&
                                    candidate.deleted !== true
                            );

                        if (nuevaPrincipal) {

                            nuevaPrincipal.isDefault = true;

                            console.log(
                                '⭐ Nueva variante principal:',
                                nuevaPrincipal
                            );

                        } else {

                            console.warn(
                                '⚠️ No quedan variantes activas para asignar como principal.'
                            );
                        }
                    }
                }

                // ==============================================================
                // RESTAURAR
                // ==============================================================

                if (action === 'restore') {

                    // ----------------------------------------------------------
                    // Restaurar variante
                    // ----------------------------------------------------------

                    variant.deleted = false;

                    // ----------------------------------------------------------
                    // Verificar si ya existe una principal activa
                    // ----------------------------------------------------------

                    const existingDefault =
                        accountVariantsState.variants.find(
                            candidate =>
                                candidate &&
                                candidate !== variant &&
                                candidate.deleted !== true &&
                                candidate.isDefault === true
                        );

                    // ----------------------------------------------------------
                    // Si NO existe principal, la restaurada será la principal
                    // ----------------------------------------------------------

                    if (!existingDefault) {

                        variant.isDefault = true;

                        console.log(
                            '⭐ La variante restaurada ahora es la principal:',
                            variant
                        );

                    } else {

                        // ------------------------------------------------------
                        // Si ya existe principal, conservarla.
                        // ------------------------------------------------------

                        variant.isDefault = false;

                        console.log(
                            '↩️ Variante restaurada. Se conserva la principal existente:',
                            existingDefault
                        );
                    }
                }

                // ==============================================================
                // ACTUALIZAR INTERFAZ
                // ==============================================================

                renderVariants();
            }
        );
    });
}


// ==========================================================================
// ABRIR MODAL DE IMÁGENES DE UNA VARIANTE
// ==========================================================================

function openVariantImagesModal(index) {

    // ----------------------------------------------------------------------
    // OBTENER VARIANTE
    // ----------------------------------------------------------------------

    const variants = accountVariantsState.variants;

    if (
        !Array.isArray(variants) ||
        index < 0 ||
        index >= variants.length
    ) {
        console.error(
            '❌ Índice de variante inválido:',
            index
        );
        return;
    }

    const variant = variants[index];

    if (!variant) {
        console.error(
            '❌ No se encontró la variante:',
            index
        );
        return;
    }

    // ----------------------------------------------------------------------
    // OBTENER MODAL
    // ----------------------------------------------------------------------

    const modal =
        document.getElementById(
            'adminVariantImagesModal'
        );

    const title =
        document.getElementById(
            'adminVariantImagesModalTitle'
        );

    const description =
        document.getElementById(
            'adminVariantImagesModalDescription'
        );

    if (!modal) {
        console.error(
            '❌ No se encontró el modal de imágenes de variantes.'
        );
        return;
    }

    // ----------------------------------------------------------------------
    // GUARDAR VARIANTE EN EDICIÓN
    // ----------------------------------------------------------------------

    accountVariantsState.editingVariantIndex = index;

    // ----------------------------------------------------------------------
    // OBTENER IMÁGENES ACTUALMENTE ASOCIADAS
    // ----------------------------------------------------------------------
    //
    // Al cargar un producto existente desde el backend,
    // las imágenes de la variante llegan como:
    //
    // variant.media[]
    //
    // Cada elemento contiene storageKey, que coincide con
    // productGalleryState.images[].key
    // ----------------------------------------------------------------------

    const currentImages =
        Array.isArray(variant.media)
            ? variant.media
            : Array.isArray(variant.images)
                ? variant.images
                : [];

    // ----------------------------------------------------------------------
    // NORMALIZAR KEYS
    // ----------------------------------------------------------------------
    //
    // Convertimos las imágenes de la variante a los mismos
    // "key" utilizados por productGalleryState.images.
    //
    // Backend:
    //     variant.media[].storageKey
    //
    // Galería:
    //     productGalleryState.images[].key
    // ----------------------------------------------------------------------

    accountVariantsState.editingVariantImageKeys =
        currentImages
            .map(image => {

                if (
                    image &&
                    typeof image === 'object'
                ) {

                    return (
                        image.key ||
                        image.storageKey ||
                        null
                    );
                }

                return image;
            })
            .filter(Boolean);

    // ----------------------------------------------------------------------
    // LA IMAGEN PRINCIPAL NO PUEDE SER ESPECÍFICA DE LA VARIANTE
    // ----------------------------------------------------------------------

    if (productGalleryState.primaryImageKey) {

        accountVariantsState.editingVariantImageKeys =
            accountVariantsState.editingVariantImageKeys.filter(
                key =>
                    key !==
                    productGalleryState.primaryImageKey
            );
    }

    // ----------------------------------------------------------------------
    // TÍTULO
    // ----------------------------------------------------------------------

    if (title) {
        title.textContent =
            `Imágenes de la variante ${index + 1}`;
    }

    // ----------------------------------------------------------------------
    // DESCRIPCIÓN
    // ----------------------------------------------------------------------

    if (description) {
        description.textContent =
            'Selecciona las imágenes que deseas asociar a esta variante.';
    }

    // ----------------------------------------------------------------------
    // MOVER MODAL AL BODY PARA QUE position: fixed USE EL VIEWPORT
    // ----------------------------------------------------------------------

    if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
    }

    // ----------------------------------------------------------------------
    // MOSTRAR MODAL
    // ----------------------------------------------------------------------

    modal.hidden = false;
    modal.style.display = 'block';

    // ----------------------------------------------------------------------
    // RENDERIZAR CONTENIDO
    // ----------------------------------------------------------------------

    refreshVariantImagesModal();

    // ----------------------------------------------------------------------
    // DEBUG
    // ----------------------------------------------------------------------

    console.log(
        '🟡 Abriendo imágenes de variante:',
        {
            index,
            variant,
            selectedImageKeys:
                accountVariantsState.editingVariantImageKeys
        }
    );
}


// ==========================================================================
// ACTUALIZAR MODAL DE IMÁGENES DE VARIANTE
// ==========================================================================

function refreshVariantImagesModal() {

    const modal =
        document.getElementById(
            'adminVariantImagesModal'
        );

    const imagesList =
        document.getElementById(
            'adminVariantImagesList'
        );

    const emptyMessage =
        document.getElementById(
            'adminVariantImagesEmpty'
        );

    // ----------------------------------------------------------------------
    // El modal debe estar abierto
    // ----------------------------------------------------------------------

    if (
        !modal ||
        !imagesList
    ) {
        return;
    }

    if (
        modal.hidden ||
        modal.style.display === 'none'
    ) {
        return;
    }


    // ----------------------------------------------------------------------
    // Obtener galería
    // ----------------------------------------------------------------------

    const galleryImages =
        Array.isArray(
            productGalleryState.images
        )
            ? productGalleryState.images
            : [];


    // ----------------------------------------------------------------------
    // Obtener imagen principal actual
    // ----------------------------------------------------------------------

    const primaryImageKey =
        productGalleryState.primaryImageKey;


    // ----------------------------------------------------------------------
    // La imagen principal NO puede pertenecer
    // a la selección de imágenes de la variante.
    //
    // Si estaba seleccionada temporalmente y ahora se convirtió
    // en principal, la quitamos automáticamente.
    // ----------------------------------------------------------------------

    if (
        primaryImageKey &&
        Array.isArray(
            accountVariantsState.editingVariantImageKeys
        )
    ) {

        accountVariantsState.editingVariantImageKeys =
            accountVariantsState
                .editingVariantImageKeys
                .filter(
                    key =>
                        key !== primaryImageKey
                );

    }


    // ----------------------------------------------------------------------
    // Ocultar imagen principal del modal
    // ----------------------------------------------------------------------

    const availableImages =
        galleryImages.filter(
            image =>
                image.key !== primaryImageKey
        );


    // ----------------------------------------------------------------------
    // No hay imágenes disponibles
    // ----------------------------------------------------------------------

    if (
        availableImages.length === 0
    ) {

        imagesList.innerHTML = '';

        if (emptyMessage) {
            emptyMessage.hidden = false;
        }

        return;
    }


    // ----------------------------------------------------------------------
    // Hay imágenes disponibles
    // ----------------------------------------------------------------------

    if (emptyMessage) {
        emptyMessage.hidden = true;
    }


    // ----------------------------------------------------------------------
    // Renderizar nuevamente las imágenes
    // ----------------------------------------------------------------------

    imagesList.innerHTML =
        availableImages
            .map(image => {

                const selected =
                    Array.isArray(
                        accountVariantsState.editingVariantImageKeys
                    ) &&
                    accountVariantsState.editingVariantImageKeys.includes(
                        image.key
                    );

                return `

                    <button
                        type="button"
                        class="admin-variant-image-option ${selected
                        ? 'selected'
                        : ''
                    }"
                        data-variant-image-key="${escapeAttribute(
                        image.key
                    )}"
                    >

                        <span
                            class="admin-variant-image-preview"
                        >

                            <img
                                src="${image.previewUrl}"
                                alt="${escapeAttribute(
                        image.fileName
                    )}"
                            >

                        </span>

                        <span
                            class="admin-variant-image-name"
                        >
                            ${escapeHtml(
                        image.fileName
                    )}
                        </span>

                        ${selected
                        ? `
                                <span
                                    class="admin-variant-image-check"
                                >
                                    <i class="fa-solid fa-check"></i>
                                </span>
                            `
                        : ''
                    }

                    </button>

                `;

            })
            .join('');


    // ----------------------------------------------------------------------
    // Volver a conectar los eventos
    // ----------------------------------------------------------------------

    attachVariantImagesListeners();

}


// ==========================================================================
// EVENTOS DE IMÁGENES DE LA VARIANTE
// ==========================================================================

function attachVariantImagesListeners() {

    const imagesList =
        document.getElementById(
            'adminVariantImagesList'
        );

    if (!imagesList) return;


    // ----------------------------------------------------------------------
    // SELECCIONAR / DESELECCIONAR IMAGEN
    // ----------------------------------------------------------------------

    imagesList
        .querySelectorAll(
            '.admin-variant-image-option'
        )
        .forEach(button => {

            button.addEventListener(
                'click',
                () => {

                    const imageKey =
                        button.dataset
                            .variantImageKey;

                    if (!imageKey) {
                        return;
                    }


                    // ------------------------------------------------------
                    // Comprobar si ya estaba seleccionada
                    // ------------------------------------------------------

                    if (
                        !Array.isArray(
                            accountVariantsState.editingVariantImageKeys
                        )
                    ) {
                        accountVariantsState.editingVariantImageKeys = [];
                    }


                    const selectedKeys =
                        accountVariantsState
                            .editingVariantImageKeys;


                    const index =
                        selectedKeys.indexOf(
                            imageKey
                        );


                    // ------------------------------------------------------
                    // Si ya está seleccionada → quitarla
                    // ------------------------------------------------------

                    if (index !== -1) {

                        selectedKeys.splice(
                            index,
                            1
                        );

                        button.classList.remove(
                            'selected'
                        );

                        const check =
                            button.querySelector(
                                '.admin-variant-image-check'
                            );

                        if (check) {
                            check.remove();
                        }

                    }


                    // ------------------------------------------------------
                    // Si no está seleccionada → agregarla
                    // ------------------------------------------------------

                    else {

                        selectedKeys.push(
                            imageKey
                        );

                        button.classList.add(
                            'selected'
                        );


                        const check =
                            document.createElement(
                                'span'
                            );

                        check.className =
                            'admin-variant-image-check';

                        check.innerHTML =
                            '<i class="fa-solid fa-check"></i>';

                        button.appendChild(
                            check
                        );

                    }


                    console.log(
                        '🟡 Imágenes seleccionadas para variante:',
                        {
                            variantIndex:
                                accountVariantsState
                                    .editingVariantIndex,

                            imageKeys:
                                [
                                    ...accountVariantsState
                                        .editingVariantImageKeys
                                ]
                        }
                    );

                }
            );

        });

}



// ==========================================================================
// CERRAR PANEL DE IMÁGENES DE VARIANTE
// ==========================================================================

function closeVariantImagesModal() {

    const modal =
        document.getElementById(
            'adminVariantImagesModal'
        );

    // ----------------------------------------------------------------------
    // OBTENER VARIANTE QUE ESTABA EN EDICIÓN
    // ----------------------------------------------------------------------

    const editingIndex =
        accountVariantsState.editingVariantIndex;

    // ----------------------------------------------------------------------
    // QUITAR SELECCIÓN VISUAL DE LA TARJETA
    // ----------------------------------------------------------------------

    if (editingIndex !== null && editingIndex !== undefined) {

        const variantCard =
            document.querySelector(
                `.admin-variant-card[data-variant-index="${editingIndex}"]`
            );

        if (variantCard) {
            variantCard.classList.remove('selected');
        }
    }

    // ----------------------------------------------------------------------
    // CERRAR MODAL
    // ----------------------------------------------------------------------

    if (modal) {
        modal.style.display = 'none';
        modal.hidden = true;
    }

    // ----------------------------------------------------------------------
    // LIMPIAR ESTADO TEMPORAL
    // ----------------------------------------------------------------------

    accountVariantsState.selectedVariantIndex = null;

    accountVariantsState.editingVariantIndex = null;

    accountVariantsState.editingVariantImageKeys = [];

    // ----------------------------------------------------------------------
    // DEBUG
    // ----------------------------------------------------------------------

    console.log(
        '🟢 Edición de imágenes de variante finalizada.'
    );
}


// ==========================================================================
// GUARDAR IMÁGENES DE LA VARIANTE
// ==========================================================================

function saveVariantImages() {

    const index =
        accountVariantsState.editingVariantIndex;

    const variants =
        accountVariantsState.variants;

    // ----------------------------------------------------------------------
    // Validar variante
    // ----------------------------------------------------------------------

    if (
        !Array.isArray(variants) ||
        index === null ||
        index === undefined ||
        index < 0 ||
        index >= variants.length
    ) {

        console.error(
            '❌ No hay una variante válida en edición.'
        );

        return;

    }


    const variant =
        variants[index];

    if (!variant) {

        console.error(
            '❌ No se encontró la variante en edición:',
            index
        );

        return;

    }


    // ----------------------------------------------------------------------
    // Obtener selección temporal
    // ----------------------------------------------------------------------

    const selectedKeys =
        Array.isArray(
            accountVariantsState.editingVariantImageKeys
        )
            ? accountVariantsState.editingVariantImageKeys
            : [];


    // ----------------------------------------------------------------------
    // Guardar selección en la variante
    // ----------------------------------------------------------------------

    variant.images = [
        ...selectedKeys
    ];


    console.log(
        '🟢 Imágenes guardadas en variante:',
        {
            variantIndex: index,
            imageKeys: variant.images
        }
    );


    // ----------------------------------------------------------------------
    // Finalizar edición
    // ----------------------------------------------------------------------

    closeVariantImagesModal();

}


// ==========================================================================
// ACTUALIZAR VARIANTE DESDE INPUT
// ==========================================================================

function actualizarVarianteDesdeInput(index, input) {

    const variant =
        accountVariantsState.variants[index];

    if (!variant) return;

    const field =
        input.dataset.variantField;

    switch (field) {

        // ------------------------------------------------------------------
        // PRECIO
        // ------------------------------------------------------------------

        case 'price': {

            // --------------------------------------------------------------
            // OBTENER PRECIO INTRODUCIDO
            // --------------------------------------------------------------

            if (input.value === '') {

                variant.price = '';
                variant.priceExtra = 0;
                variant.compareAtPrice = null;

                break;
            }

            const precio =
                Number(input.value);

            if (
                !Number.isFinite(precio) ||
                precio < 0
            ) {
                return;
            }

            // --------------------------------------------------------------
            // OBTENER PRECIO BASE DEL PRODUCTO
            // --------------------------------------------------------------

            const basePriceInput =
                document.getElementById(
                    'adminBasePrice'
                );

            const basePrice =
                basePriceInput
                    ? Number(basePriceInput.value)
                    : NaN;

            // --------------------------------------------------------------
            // CALCULAR DIFERENCIA DE LA VARIANTE
            //
            // Ejemplo:
            //
            // Base = 90
            // Variante = 100
            //
            // priceExtra = 10
            // --------------------------------------------------------------

            if (
                Number.isFinite(basePrice) &&
                basePrice >= 0
            ) {

                variant.priceExtra =
                    Number(
                        (
                            precio -
                            basePrice
                        ).toFixed(2)
                    );

            } else {

                // Si todavía no existe precio base,
                // no podemos determinar la diferencia.

                variant.priceExtra = 0;
            }

            // --------------------------------------------------------------
            // GUARDAR PRECIO ACTUAL
            // --------------------------------------------------------------

            variant.price =
                precio;

            // --------------------------------------------------------------
            // SI HAY OFERTA
            // --------------------------------------------------------------

            if (
                document
                    .getElementById(
                        'tagOfertaCheck'
                    )
                    ?.checked
            ) {

                calcularPrecioConDescuento(
                    index
                );

            } else {

                // ----------------------------------------------------------
                // SIN OFERTA
                //
                // El precio tachado no aplica.
                // ----------------------------------------------------------

                variant.compareAtPrice =
                    null;
            }

            break;
        }


        // ------------------------------------------------------------------
        // PRECIO TACHADO
        // ------------------------------------------------------------------

        case 'compareAtPrice':

            // El precio tachado es calculado automáticamente.
            // No se permite modificarlo desde el input.

            break;


        // ------------------------------------------------------------------
        // STOCK
        // ------------------------------------------------------------------

        case 'stock':

            if (accountVariantsState.isEditing) {
                return;
            }

            variant.inventory.stock =
                input.value === ''
                    ? 0
                    : Number(input.value);

            break;


        // ------------------------------------------------------------------
        // STOCK MÍNIMO
        // ------------------------------------------------------------------

        case 'minimumStock':

            variant.inventory.minimumStock =
                input.value === ''
                    ? 0
                    : Number(input.value);

            break;


        // ------------------------------------------------------------------
        // STOCK MÁXIMO
        // ------------------------------------------------------------------

        case 'maximumStock':

            variant.inventory.maximumStock =
                input.value === ''
                    ? null
                    : Number(input.value);

            break;


        // ------------------------------------------------------------------
        // BACKORDER
        // ------------------------------------------------------------------

        case 'allowBackorder':

            variant.inventory.allowBackorder =
                input.checked;

            break;
    }
}

// ==========================================================================
// ESTABLECER VARIANTE PREDETERMINADA
// ==========================================================================

function establecerVariantePredeterminada(index) {

    accountVariantsState.variants.forEach(
        (variant, variantIndex) => {

            variant.isDefault =
                variantIndex === index;

        }
    );

}


// ==========================================================================
// OBTENER PRECIO BASE
// ==========================================================================

function obtenerPrecioBase() {

    const input =
        document.getElementById('adminBasePrice');

    if (!input || input.value === '') {
        return '';
    }

    return Number(input.value);
}


// ==========================================================================
// OBTENER PRECIO TACHADO BASE
// ==========================================================================

function obtenerPrecioTachadoBase() {

    const input =
        document.getElementById('adminBaseComparePrice');

    if (!input || input.value === '') {
        return null;
    }

    return Number(input.value);
}


// ==========================================================================
// ACTUALIZAR PRECIOS BASE EN VARIANTES NUEVAS
// ==========================================================================

function aplicarPrecioBaseATodasLasVariantes() {

    const price =
        obtenerPrecioBase();

    const compareAtPrice =
        obtenerPrecioTachadoBase();

    accountVariantsState.variants.forEach(
        variant => {

            variant.price = price;

            variant.compareAtPrice =
                compareAtPrice;

        }
    );

    renderVariants();
}


// ==========================================================================
// CREAR FIRMA DE VARIANTE
// ==========================================================================

function crearFirmaDeVariante(attributeOptionIds) {

    return attributeOptionIds
        .slice()
        .sort((a, b) => a - b)
        .join(':');

}


// ==========================================================================
// OBTENER PAYLOAD PARA BACKEND
// ==========================================================================

function obtenerVariantsPayload() {

    return accountVariantsState.variants

        // ------------------------------------------------------------------
        // NO ENVIAR VARIANTES MARCADAS COMO ELIMINADAS
        // ------------------------------------------------------------------

        .filter(
            variant => variant.deleted !== true
        )

        .map(variant => {

            // ==============================================================
            // PAYLOAD BASE DE LA VARIANTE
            // ==============================================================

            const payload = {

                price:
                    Number(
                        variant.price
                    ),

                compareAtPrice:
                    variant.compareAtPrice === null ||
                        variant.compareAtPrice === ''
                        ? null
                        : Number(
                            variant.compareAtPrice
                        ),

                priceExtra:
                    variant.priceExtra === undefined ||
                        variant.priceExtra === null ||
                        variant.priceExtra === ''
                        ? 0
                        : Number(variant.priceExtra),


                isDefault:
                    variant.isDefault === true,

                attributeOptionIds:
                    Array.isArray(
                        variant.attributeOptionIds
                    )
                        ? variant.attributeOptionIds.map(
                            Number
                        )
                        : [],

                inventory: {
                    minimumStock:
                        Number(
                            variant.inventory?.minimumStock ?? 3
                        ),

                    maximumStock:
                        variant.inventory?.maximumStock === null ||
                            variant.inventory?.maximumStock === ''
                            ? null
                            : Number(
                                variant.inventory.maximumStock
                            ),

                    allowBackorder:
                        variant.inventory?.allowBackorder === true,

                    // --------------------------------------------------------------
                    // STOCK:
                    // Solo se envía al CREAR el producto.
                    // Durante la edición el stock se administra desde
                    // el módulo de Control de Inventario.
                    // --------------------------------------------------------------
                    ...(
                        accountVariantsState.isEditing
                            ? {}
                            : {
                                stock:
                                    Number(
                                        variant.inventory?.stock ?? 0
                                    )
                            }
                    )
                },

                // ==========================================================
                // IMÁGENES ESPECÍFICAS DE LA VARIANTE
                // ==========================================================

                media:
                    Array.isArray(
                        variant.images
                    )
                        ? variant.images
                            .map((image, index) => {

                                // --------------------------------------------------
                                // NORMALIZAR LA IMAGEN
                                //
                                // Puede venir como:
                                //
                                // 1. String:
                                //    "assets/gogeta_ssjb.webp"
                                //
                                // 2. Objeto existente:
                                //    {
                                //        key: "assets/gogeta_ssjb.webp",
                                //        ...
                                //    }
                                // --------------------------------------------------

                                const imageKey =
                                    image &&
                                        typeof image === 'object'
                                        ? (
                                            image.key ||
                                            image.storageKey
                                        )
                                        : image;

                                if (!imageKey) {

                                    console.warn(
                                        '⚠️ Imagen de variante sin key válida:',
                                        image
                                    );

                                    return null;
                                }

                                // --------------------------------------------------
                                // BUSCAR IMAGEN EN LA GALERÍA GENERAL
                                // --------------------------------------------------

                                const galleryImage =
                                    productGalleryState.images.find(
                                        galleryItem =>
                                            galleryItem.key === imageKey ||
                                            galleryItem.storageKey === imageKey
                                    );

                                // --------------------------------------------------
                                // SI NO ESTÁ EN LA GALERÍA
                                // --------------------------------------------------

                                if (!galleryImage) {

                                    console.warn(
                                        '⚠️ No se encontró la imagen en la galería:',
                                        imageKey
                                    );

                                    return null;
                                }

                                // --------------------------------------------------
                                // STORAGE KEY
                                // --------------------------------------------------

                                const storageKey =
                                    galleryImage.storageKey ||
                                    galleryImage.key ||
                                    (
                                        galleryImage.fileName
                                            ? `assets/${galleryImage.fileName}`
                                            : null
                                    );

                                if (!storageKey) {

                                    console.warn(
                                        '⚠️ La imagen no tiene storageKey válido:',
                                        galleryImage
                                    );

                                    return null;
                                }

                                // --------------------------------------------------
                                // OBJETO PARA BACKEND
                                // --------------------------------------------------

                                return {

                                    storageKey:

                                        storageKey,

                                    sortOrder:
                                        index
                                };
                            })

                            .filter(Boolean)

                        : []
            };

            // ==============================================================
            // EN EDICIÓN:
            // CONSERVAR ID DE LA VARIANTE EXISTENTE
            // ==============================================================

            if (
                variant.id !== undefined &&
                variant.id !== null
            ) {

                payload.id =
                    Number(
                        variant.id
                    );
            }

            return payload;
        });

}


// ==========================================================================
// CARGAR VARIANTES EXISTENTES PARA EDICIÓN
// ==========================================================================

function cargarVariantesExistentes(product) {

    if (
        !product ||
        !Array.isArray(product.variants)
    ) {
        limpiarVariantes();
        return;
    }

    accountVariantsState.isEditing = true;

    accountVariantsState.variants =
        product.variants.map(variant => {

            // --------------------------------------------------------------
            // IMÁGENES DE LA VARIANTE
            // --------------------------------------------------------------

            const images =
                Array.isArray(variant.media)
                    ? variant.media.map(media => ({
                        id: media.id,
                        mediaId: media.mediaId,
                        key: media.storageKey,
                        storageKey: media.storageKey,
                        fileName: media.originalName,
                        originalName: media.originalName,
                        mimeType: media.mimeType,
                        size: media.size,
                        alt: media.alt,
                        title: media.title,
                        isPrimary: media.isPrimary,
                        sortOrder: media.sortOrder,
                        existing: true
                    }))
                    : [];

            // --------------------------------------------------------------
            // VARIANTE
            // --------------------------------------------------------------

            return {

                id: variant.id,

                sku: variant.sku,

                deleted: false,

                // ----------------------------------------------------------
                // ATRIBUTOS
                // ----------------------------------------------------------

                attributeOptionIds:
                    Array.isArray(variant.attributes)
                        ? variant.attributes.map(
                            attribute =>
                                Number(
                                    attribute.attributeOptionId
                                )
                        )
                        : [],

                attributes:
                    Array.isArray(variant.attributes)
                        ? variant.attributes.map(
                            attribute => ({
                                productTypeAttributeId:
                                    attribute.productTypeAttributeId,

                                attributeId:
                                    null,

                                attributeSlug:
                                    attribute.attribute,

                                attributeName:
                                    attribute.name,

                                attributeOptionId:
                                    attribute.attributeOptionId,

                                value:
                                    attribute.value,

                                hexColor:
                                    attribute.hexColor || null
                            })
                        )
                        : [],

                // ----------------------------------------------------------
                // PRECIO
                // ----------------------------------------------------------

                price:
                    variant.price,

                compareAtPrice:
                    variant.compareAtPrice,

                // ----------------------------------------------------------
                // PREDETERMINADA
                // ----------------------------------------------------------

                isDefault:
                    variant.isDefault === true,

                // ----------------------------------------------------------
                // INVENTARIO
                // ----------------------------------------------------------

                inventory: {

                    stock:
                        variant.inventory?.stock ?? 0,

                    minimumStock:
                        variant.inventory?.minimumStock ?? 3,

                    maximumStock:
                        variant.inventory?.maximumStock ?? null,

                    allowBackorder:
                        variant.inventory?.allowBackorder === true
                },

                reservedStock:
                    variant.inventory?.reservedStock ?? 0,

                // ----------------------------------------------------------
                // IMÁGENES
                // ----------------------------------------------------------

                images
            };
        });

    renderVariants();
}


// ==========================================================================
// LIMPIAR VARIANTES
// ==========================================================================

function limpiarVariantes() {

    accountVariantsState.variants = [];

    const container =
        getVariantsContainer();

    const section =
        getVariantsSection();

    if (container) {
        container.innerHTML = '';
    }

    if (section) {
        section.style.display = 'none';
    }

    actualizarContadorVariantes();
}


// ==========================================================================
// CONTADOR DE VARIANTES
// ==========================================================================

function actualizarContadorVariantes() {

    const counter =
        getVariantsCount();

    if (!counter) return;

    const count =
        accountVariantsState.variants.length;

    counter.textContent =
        `${count} ${count === 1 ? 'variante' : 'variantes'}`;
}


// ==========================================================================
// ESTADO DEL BOTÓN DE GENERAR
// ==========================================================================

function actualizarEstadoGeneracion() {

    const button =
        document.getElementById(
            'generateVariantsBtn'
        );

    if (!button) return;

    const selected =
        obtenerOpcionesSeleccionadas();

    const hasSelection =
        selected.some(
            attribute =>
                attribute.optionIds.length > 0
        );

    button.disabled =
        accountVariantsState.attributes.length > 0 &&
        !hasSelection;
}


// ==========================================================================
// UTILIDADES
// ==========================================================================

function mostrarError(message) {

    console.error(
        '❌ Variantes:',
        message
    );

    if (typeof mostrarEnConsola === 'function') {
        mostrarEnConsola(message);
    }

    alert(message);
}


function escapeHtml(value) {

    if (value === null || value === undefined) {
        return '';
    }

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

}


function escapeAttribute(value) {

    return escapeHtml(value);

}


// ==========================================================================
// API PÚBLICA DEL MÓDULO
// ==========================================================================

window.accountVariants = {

    cargarAtributosDelTipoProducto,

    renderAttributes,

    obtenerOpcionesSeleccionadas,

    validarSeleccionDeAtributos,

    generarVariantes,

    generarCombinaciones,

    renderVariants,

    establecerVariantePredeterminada,

    obtenerVariantsPayload,

    cargarVariantesExistentes,

    aplicarPrecioBaseATodasLasVariantes,

    limpiarVariantes,

    initVariantImagesModalEvents

};