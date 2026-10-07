// ==========================================================================
// ACCOUNT PRODUCT TYPES
// Administración de tipos de producto y sus atributos
// ==========================================================================
//
// Responsabilidades:
//
// - Cargar tipos de producto
// - Renderizar tipos de producto
// - Seleccionar un tipo de producto
// - Cargar sus atributos
//
// Este módulo NO contiene:
//
// - llamadas HTTP directas
// - generación de variantes
// - lógica del formulario de productos
//
// ==========================================================================


// ==========================================================================
// ESTADO
// ==========================================================================

const accountProductTypesState = {

    productTypes: [],

    selectedProductType: null,

    attributes: [],

    originalAttributes: [],

    pendingAttributes: [],

    attributesToDelete: [],

    availableAttributes: []

};


let editingProductTypeId = null;


// ==========================================================================
// CARGAR TIPOS DE PRODUCTO
// ==========================================================================

async function loadProductTypes() {

    const container =
        document.getElementById('adminProductTypesList');

    if (!container) return;


    container.innerHTML = `
        <p style="
            padding:20px;
            text-align:center;
            color:var(--text-muted);
        ">
            Cargando tipos de producto...
        </p>
    `;


    try {

        // --------------------------------------------------------------
        // Verificar API
        // --------------------------------------------------------------

        if (
            !window.accountProductTypeApi ||
            typeof window.accountProductTypeApi.getProductTypes !== 'function'
        ) {
            throw new Error(
                'accountProductTypeApi.getProductTypes() no está disponible.'
            );
        }


        // --------------------------------------------------------------
        // Obtener datos del backend
        // --------------------------------------------------------------

        const response =
            await window.accountProductTypeApi.getProductTypes();


        // El backend devuelve:
        //
        // {
        //     success: true,
        //     data: {
        //         items: [...],
        //         pagination: {...}
        //     }
        // }

        const productTypes =
            response?.data?.items || [];


        // --------------------------------------------------------------
        // Guardar estado
        // --------------------------------------------------------------

        accountProductTypesState.productTypes =
            productTypes;


        console.log(
            'Tipos de producto cargados:',
            productTypes
        );


        // --------------------------------------------------------------
        // Renderizar
        // --------------------------------------------------------------

        renderProductTypes(productTypes);


    } catch (error) {

        console.error(
            'Error cargando tipos de producto:',
            error
        );


        container.innerHTML = `
            <p style="
                padding:20px;
                text-align:center;
                color:#dc2626;
            ">
                No se pudieron cargar los tipos de producto.
            </p>
        `;
    }
}


// ==========================================================================
// RENDERIZAR TIPOS DE PRODUCTO
// ==========================================================================

function renderProductTypes(productTypes) {

    const container =
        document.getElementById('adminProductTypesList');

    if (!container) return;


    if (
        !Array.isArray(productTypes) ||
        productTypes.length === 0
    ) {

        container.innerHTML = `
            <p style="
                padding:20px;
                text-align:center;
                color:var(--text-muted);
            ">
                No hay tipos de producto registrados.
            </p>
        `;

        return;
    }


    container.innerHTML =
        productTypes.map(productType => {

            return `
                <div
                    class="product-type-item"
                    data-product-type-id="${productType.id}"
                >

                    <!-- ================================================== -->
                    <!-- CABECERA                                            -->
                    <!-- ================================================== -->

                    <div class="product-type-header">

                        <strong class="product-type-name">
                            ${escapeHtml(productType.name)}
                        </strong>

                    </div>


                    <!-- ================================================== -->
                    <!-- ACCIONES                                            -->
                    <!-- ================================================== -->

                    <div class="product-type-actions">

                        <button
                            type="button"
                            class="btn-secondary"
                            onclick="
                                accountProductTypes
                                    .selectProductType(${productType.id})
                            "
                        >
                            <i class="fa-solid fa-list-check"></i>
                            Ver atributos
                        </button>

                        <button
                            type="button"
                            class="btn-secondary"
                            onclick="
                                accountProductTypes
                                    .editProductType(${productType.id})
                            "
                        >
                            <i class="fa-solid fa-pen"></i>
                            Editar
                        </button>

                        <button
                            type="button"
                            class="btn-danger"
                            onclick="
                                accountProductTypes
                                    .deleteProductType(${productType.id})
                            "
                        >
                            <i class="fa-solid fa-trash"></i>
                            Eliminar
                        </button>

                    </div>

                </div>
            `;

        }).join('');
}


// ==========================================================================
// SELECCIONAR TIPO DE PRODUCTO
// ==========================================================================

async function selectProductType(productTypeId) {

    const attributesContainer =
        document.getElementById(
            'adminProductAttributesList'
        );

    if (!attributesContainer) return;


    // --------------------------------------------------------------
    // Cambiar de la lista de tipos a la vista de atributos
    // --------------------------------------------------------------

    const productTypesListView =
        document.getElementById(
            'adminProductTypesListView'
        );

    const productTypeAttributesView =
        document.getElementById(
            'adminProductTypeAttributesView'
        );

    if (productTypesListView) {
        productTypesListView.style.display = 'none';
    }

    if (productTypeAttributesView) {
        productTypeAttributesView.style.display = '';
    }


    const productType =
        accountProductTypesState.productTypes.find(
            product =>
                product.id === productTypeId
        );


    if (!productType) {

        console.error(
            'Tipo de producto no encontrado:',
            productTypeId
        );

        return;
    }


    // --------------------------------------------------------------
    // Guardar selección
    // --------------------------------------------------------------

    accountProductTypesState.selectedProductType =
        productType;


    const createAttributeButton =
        document.getElementById(
            'adminCreateAttributeBtn'
        );

    if (createAttributeButton) {
        createAttributeButton.style.display = '';
    }


    // --------------------------------------------------------------
    // Actualizar cabecera
    // --------------------------------------------------------------

    const title =
        document.getElementById(
            'adminProductTypeAttributesTitle'
        );

    const description =
        document.getElementById(
            'adminProductTypeAttributesDescription'
        );


    if (title) {

        title.textContent =
            `Atributos de ${productType.name}`;
    }


    if (description) {

        description.textContent =
            `Administra los atributos disponibles para ${productType.name}.`;
    }


    // --------------------------------------------------------------
    // Estado de carga
    // --------------------------------------------------------------

    attributesContainer.innerHTML = `
        <div style="
            padding:30px;
            text-align:center;
            color:var(--text-muted);
        ">
            Cargando atributos...
        </div>
    `;


    try {

        // --------------------------------------------------------------
        // Verificar API
        // --------------------------------------------------------------

        if (
            !window.accountProductTypeApi ||
            typeof window.accountProductTypeApi.getProductTypeAttributes !== 'function'
        ) {
            throw new Error(
                'accountProductTypeApi.getProductTypeAttributes() no está disponible.'
            );
        }


        // --------------------------------------------------------------
        // Obtener configuración
        // --------------------------------------------------------------

        const response =
            await window.accountProductTypeApi
                .getProductTypeAttributes(
                    productTypeId
                );


        const configuration =
            response?.data || null;


        if (
            !configuration ||
            !Array.isArray(configuration.attributes)
        ) {
            throw new Error(
                'La respuesta del servidor no contiene atributos válidos.'
            );
        }


        // --------------------------------------------------------------
        // Guardar atributos actuales
        // --------------------------------------------------------------

        accountProductTypesState.attributes =
            Array.isArray(configuration.attributes)
                ? configuration.attributes
                : [];


        // --------------------------------------------------------------
        // Guardar copia original
        // --------------------------------------------------------------

        accountProductTypesState.originalAttributes =
            accountProductTypesState.attributes.map(
                relation => ({

                    id:
                        relation.id,

                    attributeId:
                        relation.attribute?.id,

                    required:
                        relation.required,

                    sortOrder:
                        relation.sortOrder

                })
            );


        // --------------------------------------------------------------
        // Limpiar cambios temporales anteriores
        // --------------------------------------------------------------

        accountProductTypesState.pendingAttributes = [];

        accountProductTypesState.attributesToDelete = [];


        console.log(
            `Atributos cargados para ProductType ${productTypeId}:`,
            configuration.attributes
        );


        renderProductTypeAttributes(
            configuration.attributes
        );


    } catch (error) {

        console.error(
            'Error cargando atributos:',
            error
        );


        attributesContainer.innerHTML = `
            <div style="
                padding:30px;
                text-align:center;
                color:#dc2626;
            ">
                No se pudieron cargar los atributos.
            </div>
        `;
    }
}


// ==========================================================================
// RENDERIZAR ATRIBUTOS
// ==========================================================================

function renderProductTypeAttributes(attributes) {

    const container =
        document.getElementById(
            'adminProductAttributesList'
        );

    if (!container) return;


    // ----------------------------------------------------------------------
    // SIN ATRIBUTOS
    // ----------------------------------------------------------------------

    if (
        !Array.isArray(attributes) ||
        attributes.length === 0
    ) {

        container.innerHTML = `
            <div style="
                padding:30px;
                text-align:center;
                color:var(--text-muted);
            ">
                <i
                    class="fa-solid fa-circle-info"
                    style="
                        font-size:2rem;
                        margin-bottom:10px;
                        opacity:0.5;
                    "
                ></i>

                <p>
                    Este tipo de producto no tiene
                    atributos configurados.
                </p>
            </div>
        `;

        return;
    }


    // ----------------------------------------------------------------------
    // VARIABLE PARA SABER QUÉ ELEMENTO SE ESTÁ ARRASTRANDO
    // ----------------------------------------------------------------------

    let draggedIndex = null;


    // ----------------------------------------------------------------------
    // RENDERIZAR ATRIBUTOS
    // ----------------------------------------------------------------------

    container.innerHTML =
        attributes.map(
            (productTypeAttribute, index) => {

                const attribute =
                    productTypeAttribute.attribute;

                if (!attribute) return '';


                const options =
                    Array.isArray(attribute.options)
                        ? attribute.options
                        : [];


                return `
                    <div
                        class="product-attribute-item"
                        draggable="true"
                        data-attribute-index="${index}"
                    >

                        <!-- ================================================== -->
                        <!-- MANIJA PARA ARRASTRAR                              -->
                        <!-- ================================================== -->

                        <span
                            class="product-attribute-drag-handle"
                            title="Arrastrar para cambiar el orden"
                        >
                            <i class="fa-solid fa-grip-vertical"></i>
                        </span>


                        <!-- ================================================== -->
                        <!-- INFORMACIÓN DEL ATRIBUTO                           -->
                        <!-- ================================================== -->

                        <div class="product-attribute-info">

                            <div>

                                <strong>
                                    ${attribute.name}
                                </strong>

                                <span>
                                    ${productTypeAttribute.required
                        ? 'Obligatorio'
                        : 'Opcional'
                    }
                                </span>

                            </div>


                            <!-- ============================================== -->
                            <!-- OPCIONES                                      -->
                            <!-- ============================================== -->

                            <div class="product-attribute-options">

                                ${options.length

                        ? options.map(
                            option => `
                                                <span>
                                                    ${option.value}
                                                </span>
                                            `
                        ).join('')

                        : `
                                            <span>
                                                Sin opciones
                                            </span>
                                        `
                    }

                            </div>

                        </div>

                        <div class="product-attribute-actions">

                            <button
                                type="button"
                                class="btn-secondary"
                                data-action="edit-product-type-attribute"
                                data-attribute-index="${index}"
                                data-relation-id="${productTypeAttribute.id ?? ''}"
                            >
                                <i class="fa-solid fa-pen"></i>
                                Editar
                            </button>


                            <button
                                type="button"
                                class="btn-danger"
                                data-action="remove-product-type-attribute"
                                data-attribute-index="${index}"
                                data-relation-id="${productTypeAttribute.id ?? ''}"
                            >
                                <i class="fa-solid fa-trash"></i>
                                Quitar
                            </button>

                        </div>

                    </div>
                `;
            }
        ).join('');


    // ======================================================================
    // DRAG & DROP
    // ======================================================================

    const draggableAttributes =
        container.querySelectorAll(
            '.product-attribute-item[draggable="true"]'
        );


    draggableAttributes.forEach(
        attributeElement => {


            // ------------------------------------------------------------------
            // INICIO DEL ARRASTRE
            // ------------------------------------------------------------------

            attributeElement.addEventListener(
                'dragstart',
                event => {

                    draggedIndex =
                        Number(
                            attributeElement.dataset.attributeIndex
                        );


                    attributeElement.classList.add(
                        'dragging'
                    );


                    event.dataTransfer.effectAllowed =
                        'move';


                    event.dataTransfer.setData(
                        'text/plain',
                        String(draggedIndex)
                    );

                }
            );


            // ------------------------------------------------------------------
            // ARRASTRAR SOBRE OTRO ATRIBUTO
            // ------------------------------------------------------------------

            attributeElement.addEventListener(
                'dragover',
                event => {

                    event.preventDefault();

                    event.dataTransfer.dropEffect =
                        'move';

                }
            );


            // ------------------------------------------------------------------
            // SOLTAR
            // ------------------------------------------------------------------

            attributeElement.addEventListener(
                'drop',
                event => {

                    event.preventDefault();


                    const targetIndex =
                        Number(
                            attributeElement.dataset.attributeIndex
                        );


                    if (
                        draggedIndex === null ||
                        draggedIndex === targetIndex
                    ) {
                        return;
                    }


                    // ----------------------------------------------------------
                    // MOVER DENTRO DE LA LISTA COMPLETA
                    // ----------------------------------------------------------

                    const [draggedAttribute] =
                        attributes.splice(
                            draggedIndex,
                            1
                        );


                    attributes.splice(
                        targetIndex,
                        0,
                        draggedAttribute
                    );


                    // ----------------------------------------------------------
                    // RECALCULAR SORT ORDER TEMPORAL
                    // ----------------------------------------------------------

                    attributes.forEach(
                        (productTypeAttribute, index) => {

                            productTypeAttribute.sortOrder =
                                index + 1;

                        }
                    );


                    // ----------------------------------------------------------
                    // ASEGURAR QUE EL ESTADO USE LA MISMA LISTA
                    // ----------------------------------------------------------

                    accountProductTypesState.attributes =
                        attributes;


                    // ----------------------------------------------------------
                    // MOSTRAR NUEVO ORDEN EN CONSOLA
                    // ----------------------------------------------------------

                    console.log(
                        '🟡 Nuevo orden temporal:',
                        attributes.map(
                            (productTypeAttribute, index) => ({
                                id:
                                    productTypeAttribute.id,

                                attributeId:
                                    productTypeAttribute.attribute?.id,

                                name:
                                    productTypeAttribute.attribute?.name,

                                type:
                                    productTypeAttribute.type,

                                sortOrder:
                                    productTypeAttribute.sortOrder
                            })
                        )
                    );


                    // ----------------------------------------------------------
                    // RENDERIZAR NUEVAMENTE
                    // ----------------------------------------------------------

                    renderProductTypeAttributes(
                        attributes
                    );

                }
            );


            // ------------------------------------------------------------------
            // FINAL DEL ARRASTRE
            // ------------------------------------------------------------------

            attributeElement.addEventListener(
                'dragend',
                () => {

                    attributeElement.classList.remove(
                        'dragging'
                    );

                    draggedIndex = null;

                }
            );

        }
    );


    // ======================================================================
    // EDITAR ATRIBUTO
    // ======================================================================

    container
        .querySelectorAll(
            '[data-action="edit-product-type-attribute"]'
        )
        .forEach(button => {

            button.addEventListener(
                'click',
                () => {

                    const index =
                        Number(
                            button.dataset.attributeIndex
                        );

                    editProductTypeAttribute(index);

                }
            );

        });


    // ======================================================================
    // ELIMINAR / QUITAR ATRIBUTO
    // ======================================================================

    container
        .querySelectorAll(
            '[data-action="remove-product-type-attribute"]'
        )
        .forEach(button => {

            button.addEventListener(
                'click',
                () => {

                    const index =
                        Number(
                            button.dataset.attributeIndex
                        );

                    removeProductTypeAttribute(
                        index
                    );

                }
            );

        });

}


// ==========================================================================
// EDITAR ATRIBUTO DEL TIPO DE PRODUCTO
// ==========================================================================

async function editProductTypeAttribute(index) {

    // ----------------------------------------------------------------------
    // OBTENER ATRIBUTO DESDE EL ESTADO
    // ----------------------------------------------------------------------

    const attributes =
        accountProductTypesState.attributes;

    if (
        !Array.isArray(attributes) ||
        index < 0 ||
        index >= attributes.length
    ) {

        console.error(
            '❌ Índice de atributo inválido:',
            index
        );

        return;
    }


    const productTypeAttribute =
        attributes[index];

    if (!productTypeAttribute) {

        console.error(
            '❌ No se encontró el atributo:',
            index
        );

        return;
    }


    // ----------------------------------------------------------------------
    // Cerrar modal de agregar atributo si estuviera abierto
    // ----------------------------------------------------------------------

    closeAssignAttributeModal();

    // ----------------------------------------------------------------------
    // OBTENER MODAL Y CAMPOS
    // ----------------------------------------------------------------------

    const modal =
        document.getElementById(
            'adminProductTypeAttributeModal'
        );

    const select =
        document.getElementById(
            'adminProductTypeAttributeSelect'
        );

    const requiredSelect =
        document.getElementById(
            'adminProductTypeAttributeRequired'
        );


    if (
        !modal ||
        !select ||
        !requiredSelect
    ) {

        console.error(
            '❌ No se encontraron los elementos del modal de configuración.'
        );

        return;
    }


    try {

        // ------------------------------------------------------------------
        // OBTENER ATRIBUTOS GLOBALES
        // ------------------------------------------------------------------

        const response =
            await accountProductTypeApi.getAttributes();

        const attributesList =
            Array.isArray(response?.data?.items)
                ? response.data.items
                : Array.isArray(response?.data)
                    ? response.data
                    : [];


        // ------------------------------------------------------------------
        // GUARDAR ATRIBUTOS DISPONIBLES TEMPORALMENTE
        // ------------------------------------------------------------------

        accountProductTypesState.availableAttributes =
            attributesList;


        // ------------------------------------------------------------------
        // OBTENER IDS DE ATRIBUTOS YA ASIGNADOS
        // ------------------------------------------------------------------

        const assignedAttributeIds =
            new Set(
                attributes
                    .map(
                        item =>
                            item.attribute?.id
                    )
                    .filter(
                        Boolean
                    )
            );


        // ------------------------------------------------------------------
        // ID DEL ATRIBUTO ACTUAL
        // ------------------------------------------------------------------

        const currentAttributeId =
            productTypeAttribute
                .attribute
                ?.id;


        // ------------------------------------------------------------------
        // LIMPIAR SELECT
        // ------------------------------------------------------------------

        select.innerHTML = `

            <option value="">
                Selecciona un atributo...
            </option>

        `;


        // ------------------------------------------------------------------
        // AGREGAR ATRIBUTOS DISPONIBLES
        // ------------------------------------------------------------------

        attributesList
            .filter(attribute => {

                // ----------------------------------------------------------
                // El atributo actual siempre debe permanecer disponible
                // ----------------------------------------------------------

                if (
                    attribute.id ===
                    currentAttributeId
                ) {

                    return true;

                }


                // ----------------------------------------------------------
                // Los demás solo aparecen si NO están asignados
                // ----------------------------------------------------------

                return !assignedAttributeIds.has(
                    attribute.id
                );

            })
            .sort(
                (a, b) =>
                    a.name.localeCompare(
                        b.name
                    )
            )
            .forEach(attribute => {

                const option =
                    document.createElement(
                        'option'
                    );

                option.value =
                    attribute.id;

                option.textContent =
                    attribute.name;

                select.appendChild(
                    option
                );

            });


        // ------------------------------------------------------------------
        // SELECCIONAR ATRIBUTO ACTUAL
        // ------------------------------------------------------------------

        select.value =
            currentAttributeId
                ? String(currentAttributeId)
                : '';


        // ------------------------------------------------------------------
        // CARGAR REQUIRED ACTUAL
        // ------------------------------------------------------------------

        requiredSelect.value =
            productTypeAttribute.required
                ? 'true'
                : 'false';


        // ------------------------------------------------------------------
        // GUARDAR ÍNDICE EN EDICIÓN
        // ------------------------------------------------------------------

        accountProductTypesState
            .editingAttributeIndex =
            index;


        // ------------------------------------------------------------------
        // MOSTRAR MODAL
        // ------------------------------------------------------------------

        modal.style.display =
            'flex';


        // ------------------------------------------------------------------
        // DEBUG
        // ------------------------------------------------------------------

        console.log(
            '🟡 Editando atributo del ProductType:',
            {
                index,

                relationId:
                    productTypeAttribute.id,

                attributeId:
                    currentAttributeId,

                name:
                    productTypeAttribute
                        .attribute
                        ?.name,

                required:
                    productTypeAttribute.required,

                sortOrder:
                    productTypeAttribute.sortOrder,

                type:
                    productTypeAttribute.type
            }
        );


    } catch (error) {

        console.error(
            '❌ Error cargando atributos para edición:',
            error
        );

        alert(
            error.message ||
            'No se pudieron cargar los atributos disponibles.'
        );

    }

}


// ==========================================================================
// GUARDAR EDICIÓN TEMPORAL DEL ATRIBUTO
// ==========================================================================

function saveProductTypeAttributeEdit() {

    // ----------------------------------------------------------------------
    // OBTENER CAMPOS
    // ----------------------------------------------------------------------

    const select =
        document.getElementById(
            'adminProductTypeAttributeSelect'
        );

    const requiredSelect =
        document.getElementById(
            'adminProductTypeAttributeRequired'
        );


    // ----------------------------------------------------------------------
    // VALIDAR ELEMENTOS
    // ----------------------------------------------------------------------

    if (
        !select ||
        !requiredSelect
    ) {

        console.error(
            '❌ No se encontraron los campos del modal de configuración.'
        );

        return;
    }


    // ----------------------------------------------------------------------
    // OBTENER ÍNDICE EN EDICIÓN
    // ----------------------------------------------------------------------

    const index =
        accountProductTypesState
            .editingAttributeIndex;


    if (
        index === null ||
        index === undefined
    ) {

        console.error(
            '❌ No hay ningún atributo en edición.'
        );

        return;
    }


    // ----------------------------------------------------------------------
    // OBTENER ATRIBUTO ACTUAL
    // ----------------------------------------------------------------------

    const productTypeAttribute =
        accountProductTypesState
            .attributes[index];


    if (!productTypeAttribute) {

        console.error(
            '❌ No se encontró el atributo en edición:',
            index
        );

        return;
    }


    // ----------------------------------------------------------------------
    // OBTENER NUEVO ATTRIBUTE ID
    // ----------------------------------------------------------------------

    const attributeId =
        Number(select.value);


    if (!attributeId) {

        alert(
            'Debes seleccionar un atributo.'
        );

        select.focus();

        return;
    }


    // ----------------------------------------------------------------------
    // OBTENER INFORMACIÓN COMPLETA DEL ATRIBUTO
    // ----------------------------------------------------------------------

    const attributeData =
        accountProductTypesState
            .availableAttributes
            ?.find(
                attribute =>
                    attribute.id === attributeId
            );


    if (!attributeData) {

        console.error(
            '❌ No se encontró la información del atributo:',
            attributeId
        );

        return;
    }


    // ----------------------------------------------------------------------
    // OBTENER NUEVO VALOR DE REQUIRED
    // ----------------------------------------------------------------------

    const required =
        requiredSelect.value === 'true';


    // ----------------------------------------------------------------------
    // GUARDAR CAMBIOS TEMPORALMENTE
    // ----------------------------------------------------------------------

    productTypeAttribute.attribute =
        attributeData;

    productTypeAttribute.required =
        required;


    // ----------------------------------------------------------------------
    // IMPORTANTE:
    // NO MODIFICAMOS:
    //
    // productTypeAttribute.id
    // productTypeAttribute.sortOrder
    // productTypeAttribute.type
    //
    // El ID de la relación existente debe conservarse.
    // El atributo pending continúa siendo pending.
    // ----------------------------------------------------------------------


    console.log(
        '🟡 Configuración del atributo modificada temporalmente:',
        {
            index,

            relationId:
                productTypeAttribute.id,

            attributeId:
                attributeData.id,

            attributeName:
                attributeData.name,

            required,

            sortOrder:
                productTypeAttribute.sortOrder,

            type:
                productTypeAttribute.type
        }
    );


    // ----------------------------------------------------------------------
    // LIMPIAR ESTADO DE EDICIÓN
    // ----------------------------------------------------------------------

    accountProductTypesState
        .editingAttributeIndex = null;


    // ----------------------------------------------------------------------
    // CERRAR MODAL
    // ----------------------------------------------------------------------

    const modal =
        document.getElementById(
            'adminProductTypeAttributeModal'
        );

    if (modal) {

        modal.style.display =
            'none';

    }


    // ----------------------------------------------------------------------
    // RENDERIZAR LISTA ACTUALIZADA
    // ----------------------------------------------------------------------

    renderProductTypeAttributes(
        accountProductTypesState.attributes
    );

}


// ==========================================================================
// MODAL DE TIPO DE PRODUCTO
// ==========================================================================

// --------------------------------------------------------------------------
// ABRIR MODAL
// --------------------------------------------------------------------------

function openProductTypeModal(productType = null) {

    const modal = document.getElementById('adminProductTypeModal');

    const title = document.getElementById(
        'adminProductTypeModalTitle'
    );

    const nameInput = document.getElementById(
        'adminProductTypeName'
    );

    const slugInput = document.getElementById(
        'adminProductTypeSlug'
    );

    const descriptionInput = document.getElementById(
        'adminProductTypeDescription'
    );

    if (!modal || !title || !nameInput || !slugInput || !descriptionInput) {
        console.error(
            'No se encontraron los elementos del modal de tipo de producto.'
        );
        return;
    }

    editingProductTypeId = productType?.id || null;


    // ----------------------------------------------------------------------
    // Resaltar tarjeta en edición
    // ----------------------------------------------------------------------

    document.querySelectorAll('.product-type-item').forEach(item => {
        item.classList.remove('is-editing');
    });

    if (editingProductTypeId) {

        title.textContent = 'Editar tipo de producto';

        nameInput.value =
            productType.name || '';

        slugInput.value =
            productType.slug || '';

        descriptionInput.value =
            productType.description || '';


        // Resaltar la tarjeta correspondiente
        const activeCard = document.querySelector(
            `.product-type-item[data-product-type-id="${editingProductTypeId}"]`
        );

        if (activeCard) {
            activeCard.classList.add('is-editing');
            activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

    } else {

        title.textContent = 'Nuevo tipo de producto';

        nameInput.value = '';
        slugInput.value = '';
        descriptionInput.value = '';
    }

    modal.hidden = false;

    nameInput.focus();
}


// --------------------------------------------------------------------------
// CERRAR MODAL
// --------------------------------------------------------------------------

function closeProductTypeModal() {

    const modal =
        document.getElementById(
            'adminProductTypeModal'
        );

    if (!modal) return;

    modal.hidden = true;

    editingProductTypeId = null;


    // Quitar resaltado de tarjeta
    document.querySelectorAll('.product-type-item.is-editing').forEach(item => {
        item.classList.remove('is-editing');
    });
}


// --------------------------------------------------------------------------
// GUARDAR TIPO DE PRODUCTO
// --------------------------------------------------------------------------

async function saveProductType() {

    const nameInput =
        document.getElementById(
            'adminProductTypeName'
        );

    const slugInput =
        document.getElementById(
            'adminProductTypeSlug'
        );

    const descriptionInput =
        document.getElementById(
            'adminProductTypeDescription'
        );

    if (!nameInput || !slugInput || !descriptionInput) {
        return;
    }

    const name =
        nameInput.value.trim();

    const slug =
        slugInput.value.trim();

    const description =
        descriptionInput.value.trim();

    if (!name) {

        alert(
            'Ingresa el nombre del tipo de producto.'
        );

        nameInput.focus();

        return;
    }

    const productTypeData = {
        name
    };

    if (slug) {
        productTypeData.slug = slug;
    }

    if (description) {
        productTypeData.description = description;
    }

    try {

        const saveButton =
            document.getElementById(
                'adminProductTypeModalSave'
            );

        if (saveButton) {
            saveButton.disabled = true;
        }

        if (editingProductTypeId) {

            await accountProductTypeApi.updateProductType(
                editingProductTypeId,
                productTypeData
            );

        } else {

            await accountProductTypeApi.createProductType(
                productTypeData
            );
        }

        closeProductTypeModal();

        await loadProductTypes();

    } catch (error) {

        console.error(
            'Error guardando tipo de producto:',
            error
        );

        alert(
            error.message ||
            'No se pudo guardar el tipo de producto.'
        );

    } finally {

        const saveButton =
            document.getElementById(
                'adminProductTypeModalSave'
            );

        if (saveButton) {
            saveButton.disabled = false;
        }
    }
}


// ==========================================================================
// EDITAR TIPO DE PRODUCTO
// ==========================================================================

async function editProductType(productTypeId) {

    try {

        const response =
            await accountProductTypeApi.getProductTypeById(
                productTypeId
            );

        const productType =
            response?.data;

        if (!productType) {
            throw new Error(
                'No se pudo obtener el tipo de producto.'
            );
        }

        openProductTypeModal(productType);

    } catch (error) {

        console.error(
            'Error obteniendo tipo de producto:',
            error
        );

        alert(
            error.message ||
            'No se pudo cargar el tipo de producto.'
        );
    }
}


// ==========================================================================
// ELIMINAR TIPO DE PRODUCTO
// ==========================================================================

async function deleteProductType(productTypeId) {

    const productType =
        accountProductTypesState.productTypes.find(
            type => type.id === productTypeId
        );

    if (!productType) return;

    const confirmed =
        confirm(
            `¿Deseas eliminar el tipo de producto "${productType.name}"?`
        );

    if (!confirmed) return;

    try {

        await accountProductTypeApi.deleteProductType(
            productTypeId
        );

        if (
            accountProductTypesState.selectedProductType?.id ===
            productTypeId
        ) {

            accountProductTypesState.selectedProductType = null;
            accountProductTypesState.attributes = [];

            renderProductTypeAttributes(null);

            const title =
                document.getElementById(
                    'adminProductTypeAttributesTitle'
                );

            const description =
                document.getElementById(
                    'adminProductTypeAttributesDescription'
                );

            const createAttributeButton =
                document.getElementById(
                    'adminCreateAttributeBtn'
                );

            if (title) {
                title.textContent = 'Atributos';
            }

            if (description) {
                description.textContent =
                    'Selecciona un tipo de producto para administrar sus atributos.';
            }

            if (createAttributeButton) {
                createAttributeButton.style.display = 'none';
            }
        }

        await loadProductTypes();

    } catch (error) {

        console.error(
            'Error eliminando tipo de producto:',
            error
        );

        alert(
            error.message ||
            'No se pudo eliminar el tipo de producto.'
        );
    }
}


// ==========================================================================
// VOLVER A LISTA DE TIPOS DE PRODUCTO
// ==========================================================================

function showProductTypesList() {

    const productTypesListView =
        document.getElementById(
            'adminProductTypesListView'
        );

    const productTypeAttributesView =
        document.getElementById(
            'adminProductTypeAttributesView'
        );

    if (productTypesListView) {
        productTypesListView.style.display = '';
    }

    if (productTypeAttributesView) {
        productTypeAttributesView.style.display = 'none';
    }

}

// ==========================================================================
// ABRIR MODAL: AGREGAR ATRIBUTO AL TIPO DE PRODUCTO
// ==========================================================================

async function openAssignAttributeModal() {

    const selectedProductType =
        accountProductTypesState.selectedProductType;



    if (!selectedProductType) {

        alert(
            'Selecciona un tipo de producto antes de agregar un atributo.'
        );

        return;
    }


    // ----------------------------------------------------------------------
    // Cerrar modal de edición si estuviera abierto
    // ----------------------------------------------------------------------

    closeProductTypeAttributeModal();


    const modal =
        document.getElementById(
            'adminAssignAttributeModal'
        );

    const select =
        document.getElementById(
            'adminAssignAttributeSelect'
        );

    if (!modal || !select) {

        console.error(
            'No se encontró el modal de asignación de atributos.'
        );

        return;
    }


    try {

        // --------------------------------------------------------------
        // Obtener todos los atributos globales
        // --------------------------------------------------------------

        const response =
            await accountProductTypeApi.getAttributes();


        const attributes =
            response?.data?.items ||
            response?.data ||
            [];


        accountProductTypesState.availableAttributes =
            attributes;


        // --------------------------------------------------------------
        // Obtener atributos que ya tiene este Product Type
        // --------------------------------------------------------------

        const currentAttributes =
            accountProductTypesState.attributes || [];


        const assignedAttributeIds =
            new Set(
                currentAttributes
                    .map(
                        relation =>
                            relation.attribute?.id
                    )
                    .filter(Boolean)
            );


        // --------------------------------------------------------------
        // Filtrar atributos ya asignados
        // --------------------------------------------------------------

        const availableAttributes =
            attributes.filter(
                attribute =>
                    !assignedAttributeIds.has(
                        attribute.id
                    )
            );


        // --------------------------------------------------------------
        // Guardar atributos disponibles temporalmente
        // --------------------------------------------------------------

        accountProductTypesState.availableAttributes =
            availableAttributes;


        // --------------------------------------------------------------
        // Poblar SELECT
        // --------------------------------------------------------------

        select.innerHTML = `
            <option value="">
                Selecciona un atributo...
            </option>
        `;


        availableAttributes
            .sort(
                (a, b) =>
                    a.name.localeCompare(b.name)
            )
            .forEach(attribute => {

                const option =
                    document.createElement('option');

                option.value =
                    attribute.id;

                option.textContent =
                    attribute.name;

                select.appendChild(option);

            });


        // --------------------------------------------------------------
        // Mostrar modal
        // --------------------------------------------------------------

        modal.style.display = 'flex';


    } catch (error) {

        console.error(
            'Error cargando atributos disponibles:',
            error
        );

        alert(
            error.message ||
            'No se pudieron cargar los atributos disponibles.'
        );
    }
}


// ==========================================================================
// AGREGAR ATRIBUTO TEMPORALMENTE
// ==========================================================================

function saveAssignAttribute() {

    const select =
        document.getElementById(
            'adminAssignAttributeSelect'
        );

    const requiredSelect =
        document.getElementById(
            'adminAssignAttributeRequired'
        );


    // ----------------------------------------------------------------------
    // VALIDAR ELEMENTOS
    // ----------------------------------------------------------------------

    if (
        !select ||
        !requiredSelect
    ) {

        console.error(
            'No se encontraron los campos del modal de asignación.'
        );

        return;
    }


    // ----------------------------------------------------------------------
    // OBTENER VALORES
    // ----------------------------------------------------------------------

    const attributeId =
        Number(select.value);

    const required =
        requiredSelect.value === 'true';


    // ----------------------------------------------------------------------
    // VALIDAR ATRIBUTO
    // ----------------------------------------------------------------------

    if (!attributeId) {

        alert(
            'Debes seleccionar un atributo.'
        );

        select.focus();

        return;
    }


    // ----------------------------------------------------------------------
    // OBTENER INFORMACIÓN COMPLETA DEL ATRIBUTO
    // ----------------------------------------------------------------------

    const attributeData =
        accountProductTypesState
            .availableAttributes
            ?.find(
                item =>
                    item.id === attributeId
            );


    if (!attributeData) {

        console.error(
            'No se encontró la información completa del atributo:',
            attributeId
        );

        return;
    }


    // ----------------------------------------------------------------------
    // ASIGNAR ORDEN AUTOMÁTICAMENTE
    // ----------------------------------------------------------------------

    const sortOrder =
        accountProductTypesState
            .attributes
            .length + 1;


    // ----------------------------------------------------------------------
    // CREAR RELACIÓN TEMPORAL
    // ----------------------------------------------------------------------

    const pendingAttribute = {

        id: null,

        type: 'pending',

        attribute: attributeData,

        required,

        sortOrder

    };


    // ----------------------------------------------------------------------
    // AGREGAR A PENDIENTES
    // ----------------------------------------------------------------------

    accountProductTypesState
        .pendingAttributes
        .push(
            pendingAttribute
        );


    // ----------------------------------------------------------------------
    // AGREGAR A LA LISTA ACTUAL
    // ----------------------------------------------------------------------

    accountProductTypesState
        .attributes
        .push(
            pendingAttribute
        );


    console.log(
        '🟡 Atributo agregado temporalmente:',
        pendingAttribute
    );


    console.log(
        '🟡 Atributos actuales:',
        accountProductTypesState.attributes
    );


    // ----------------------------------------------------------------------
    // CERRAR MODAL
    // ----------------------------------------------------------------------

    const modal =
        document.getElementById(
            'adminAssignAttributeModal'
        );

    if (modal) {

        modal.style.display = 'none';

    }


    // ----------------------------------------------------------------------
    // RENDERIZAR LISTA ACTUALIZADA
    // ----------------------------------------------------------------------

    renderProductTypeAttributes(
        accountProductTypesState.attributes
    );

}


// ==========================================================================
// ELIMINAR / QUITAR ATRIBUTO DEL TIPO DE PRODUCTO
// ==========================================================================

function removeProductTypeAttribute(index) {

    // ----------------------------------------------------------------------
    // OBTENER ATRIBUTOS ACTUALES
    // ----------------------------------------------------------------------

    const attributes =
        accountProductTypesState.attributes;

    if (
        !Array.isArray(attributes) ||
        index < 0 ||
        index >= attributes.length
    ) {

        console.error(
            '❌ Índice de atributo inválido:',
            index
        );

        return;
    }


    const productTypeAttribute =
        attributes[index];

    if (!productTypeAttribute) {

        console.error(
            '❌ No se encontró el atributo:',
            index
        );

        return;
    }


    const attribute =
        productTypeAttribute.attribute;


    if (!attribute) {

        console.error(
            '❌ La relación no contiene información del atributo:',
            productTypeAttribute
        );

        return;
    }


    // ----------------------------------------------------------------------
    // CONFIRMAR
    // ----------------------------------------------------------------------

    const confirmed =
        confirm(
            `¿Deseas quitar el atributo "${attribute.name}"?\n\n` +
            `El atributo dejará de estar asociado a este tipo de producto ` +
            `cuando guardes los cambios.`
        );


    if (!confirmed) {
        return;
    }


    // ----------------------------------------------------------------------
    // ATRIBUTO EXISTENTE
    // ----------------------------------------------------------------------

    if (
        productTypeAttribute.type !== 'pending' &&
        productTypeAttribute.id !== null &&
        productTypeAttribute.id !== undefined
    ) {

        const relationId =
            productTypeAttribute.id;


        // --------------------------------------------------------------
        // MARCAR RELACIÓN PARA ELIMINACIÓN
        // --------------------------------------------------------------

        if (
            !Array.isArray(
                accountProductTypesState
                    .attributesToDelete
            )
        ) {

            accountProductTypesState
                .attributesToDelete = [];

        }


        if (
            !accountProductTypesState
                .attributesToDelete
                .includes(relationId)
        ) {

            accountProductTypesState
                .attributesToDelete
                .push(relationId);

        }


        console.log(
            '🟡 Relación marcada para eliminación:',
            {
                relationId,
                attributeId:
                    attribute.id,
                attributeName:
                    attribute.name
            }
        );

    }


    // ----------------------------------------------------------------------
    // ATRIBUTO NUEVO / PENDIENTE
    // ----------------------------------------------------------------------

    else {

        // --------------------------------------------------------------
        // El atributo nunca llegó a BD.
        // Simplemente desaparecerá del estado temporal.
        // --------------------------------------------------------------

        accountProductTypesState
            .pendingAttributes =
            Array.isArray(
                accountProductTypesState
                    .pendingAttributes
            )
                ? accountProductTypesState
                    .pendingAttributes
                    .filter(
                        item =>
                            item !==
                            productTypeAttribute
                    )
                : [];


        console.log(
            '🟡 Atributo pendiente eliminado temporalmente:',
            {
                attributeId:
                    attribute.id,
                attributeName:
                    attribute.name
            }
        );

    }


    // ----------------------------------------------------------------------
    // RETIRAR DE LA LISTA ACTUAL
    // ----------------------------------------------------------------------

    accountProductTypesState
        .attributes
        .splice(
            index,
            1
        );


    // ----------------------------------------------------------------------
    // RECALCULAR ORDEN TEMPORAL
    // ----------------------------------------------------------------------

    accountProductTypesState
        .attributes
        .forEach(
            (item, newIndex) => {

                item.sortOrder =
                    newIndex + 1;

            }
        );


    // ----------------------------------------------------------------------
    // DEBUG
    // ----------------------------------------------------------------------

    console.log(
        '🟡 Atributos después de quitar:',
        accountProductTypesState
            .attributes
            .map(
                item => ({
                    id:
                        item.id,
                    attributeId:
                        item.attribute?.id,
                    value:
                        item.attribute?.name,
                    type:
                        item.type,
                    sortOrder:
                        item.sortOrder
                })
            )
    );


    console.log(
        '🟡 Atributos marcados para eliminar:',
        accountProductTypesState
            .attributesToDelete
    );


    // ----------------------------------------------------------------------
    // RENDERIZAR
    // ----------------------------------------------------------------------

    renderProductTypeAttributes(
        accountProductTypesState.attributes
    );

}


// ==========================================================================
// EVENTOS
// ==========================================================================

function initProductTypeEvents() {

    const createButton =
        document.getElementById(
            'adminCreateProductTypeBtn'
        );

    const createAttributeButton =
        document.getElementById(
            'adminCreateAttributeBtn'
        );

    const backToProductTypesButton =
        document.getElementById(
            'adminBackToProductTypesBtn'
        );

    const closeButton =
        document.getElementById(
            'adminProductTypeModalClose'
        );

    const cancelButton =
        document.getElementById(
            'adminProductTypeModalCancel'
        );

    const saveButton =
        document.getElementById(
            'adminProductTypeModalSave'
        );



    // --------------------------------------------------------------
    // GUARDAR ATRIBUTO TEMPORALMENTE
    // --------------------------------------------------------------

    const assignAttributeSaveButton =
        document.getElementById(
            'adminAssignAttributeModalSave'
        );

    if (assignAttributeSaveButton) {

        assignAttributeSaveButton.addEventListener(
            'click',
            saveAssignAttribute
        );
    }


    // ==========================================================================
    // GUARDAR EDICIÓN DEL ATRIBUTO
    // ==========================================================================

    const productTypeAttributeModalSave =
        document.getElementById(
            'adminProductTypeAttributeModalSave'
        );

    if (productTypeAttributeModalSave) {

        productTypeAttributeModalSave.addEventListener(
            'click',
            saveProductTypeAttributeEdit
        );

    }


    // --------------------------------------------------------------
    // GUARDAR CAMBIOS DE ATRIBUTOS DEL TIPO DE PRODUCTO
    // --------------------------------------------------------------

    const saveProductTypeAttributesButton =
        document.getElementById(
            'adminSaveProductTypeAttributesBtn'
        );

    if (saveProductTypeAttributesButton) {

        saveProductTypeAttributesButton.addEventListener(
            'click',
            saveProductTypeAttributes
        );

    }


    // --------------------------------------------------------------
    // AGREGAR ATRIBUTO
    // --------------------------------------------------------------

    if (createAttributeButton) {

        createAttributeButton.addEventListener(
            'click',
            openAssignAttributeModal
        );
    }


    // --------------------------------------------------------------
    // NUEVO TIPO
    // --------------------------------------------------------------

    if (createButton) {

        createButton.addEventListener(
            'click',
            () => openProductTypeModal()
        );
    }


    // --------------------------------------------------------------
    // VOLVER A TIPOS
    // --------------------------------------------------------------

    if (backToProductTypesButton) {

        backToProductTypesButton.addEventListener(
            'click',
            () => {

                // ----------------------------------------------------------
                // Cerrar cualquier modal abierto
                // ----------------------------------------------------------

                closeAssignAttributeModal();

                closeProductTypeAttributeModal();


                // ----------------------------------------------------------
                // Volver a la lista de tipos
                // ----------------------------------------------------------

                showProductTypesList();

            }
        );

    }


    // --------------------------------------------------------------
    // CERRAR MODAL
    // --------------------------------------------------------------

    if (closeButton) {

        closeButton.addEventListener(
            'click',
            closeProductTypeModal
        );
    }


    // --------------------------------------------------------------
    // CANCELAR MODAL
    // --------------------------------------------------------------

    if (cancelButton) {

        cancelButton.addEventListener(
            'click',
            closeProductTypeModal
        );
    }


    // --------------------------------------------------------------
    // GUARDAR TIPO
    // --------------------------------------------------------------

    if (saveButton) {

        saveButton.addEventListener(
            'click',
            saveProductType
        );
    }
}

// ==========================================================================
// GUARDAR CAMBIOS DE ATRIBUTOS DEL TIPO DE PRODUCTO
// ==========================================================================

async function saveProductTypeAttributes() {

    const productType =
        accountProductTypesState.selectedProductType;

    if (!productType) {

        alert(
            'No hay un tipo de producto seleccionado.'
        );

        return;
    }


    const productTypeId =
        productType.id;


    // ----------------------------------------------------------------------
    // OBTENER ESTADOS
    // ----------------------------------------------------------------------

    const originalAttributes =
        Array.isArray(
            accountProductTypesState.originalAttributes
        )
            ? accountProductTypesState.originalAttributes
            : [];


    const currentAttributes =
        Array.isArray(
            accountProductTypesState.attributes
        )
            ? accountProductTypesState.attributes
            : [];


    const attributesToDelete =
        Array.isArray(
            accountProductTypesState.attributesToDelete
        )
            ? accountProductTypesState.attributesToDelete
            : [];


    const pendingAttributes =
        Array.isArray(
            accountProductTypesState.pendingAttributes
        )
            ? accountProductTypesState.pendingAttributes
            : [];


    // ----------------------------------------------------------------------
    // BOTÓN
    // ----------------------------------------------------------------------

    const saveButton =
        document.getElementById(
            'adminSaveProductTypeAttributesBtn'
        );


    try {

        if (saveButton) {
            saveButton.disabled = true;
        }


        // ==================================================================
        // 1. PROCESAR RELACIONES EXISTENTES
        // ==================================================================

        for (
            const relation
            of currentAttributes
        ) {

            // --------------------------------------------------------------
            // Los atributos nuevos se procesan más adelante.
            // --------------------------------------------------------------

            if (
                relation.type === 'pending' ||
                relation.id === null ||
                relation.id === undefined
            ) {
                continue;
            }


            // --------------------------------------------------------------
            // Buscar estado original
            // --------------------------------------------------------------

            const original =
                originalAttributes.find(
                    item =>
                        item.id === relation.id
                );


            if (!original) {
                continue;
            }


            // --------------------------------------------------------------
            // Detectar cambios
            // --------------------------------------------------------------

            const attributeChanged =
                relation.attribute?.id !==
                original.attributeId;


            const requiredChanged =
                relation.required !==
                original.required;


            const sortOrderChanged =
                relation.sortOrder !==
                original.sortOrder;


            // --------------------------------------------------------------
            // Si cambió el atributo
            // --------------------------------------------------------------

            if (attributeChanged) {

                console.log(
                    '🟡 Sustituyendo atributo:',
                    {
                        relationId:
                            relation.id,

                        oldAttributeId:
                            original.attributeId,

                        newAttributeId:
                            relation.attribute?.id,

                        required:
                            relation.required,

                        sortOrder:
                            relation.sortOrder
                    }
                );


                // ----------------------------------------------------------
                // 1. Desactivar relación anterior
                // ----------------------------------------------------------

                await accountProductTypeApi
                    .removeAttributeFromProductType(
                        relation.id
                    );


                console.log(
                    '🟢 Relación anterior desactivada:',
                    relation.id
                );


                // ----------------------------------------------------------
                // 2. Crear/reactivar relación con nuevo atributo
                // ----------------------------------------------------------

                await accountProductTypeApi
                    .assignAttributeToProductType(
                        productTypeId,
                        {
                            attributeId:
                                relation.attribute.id,

                            required:
                                relation.required,

                            sortOrder:
                                relation.sortOrder
                        }
                    );


                console.log(
                    '🟢 Nuevo atributo asignado:',
                    relation.attribute.id
                );


                // ----------------------------------------------------------
                // Ya procesamos esta relación.
                // ----------------------------------------------------------

                continue;
            }


            // --------------------------------------------------------------
            // Si solamente cambió required o sortOrder
            // --------------------------------------------------------------

            if (
                requiredChanged ||
                sortOrderChanged
            ) {

                const relationData = {};


                if (requiredChanged) {

                    relationData.required =
                        relation.required;

                }


                if (sortOrderChanged) {

                    relationData.sortOrder =
                        relation.sortOrder;

                }


                console.log(
                    '🟡 Actualizando configuración de relación:',
                    {
                        relationId:
                            relation.id,

                        relationData
                    }
                );


                await accountProductTypeApi
                    .updateProductTypeAttribute(
                        relation.id,
                        relationData
                    );


                console.log(
                    '🟢 Relación actualizada:',
                    relation.id
                );

            }

        }


        // ==================================================================
        // 2. ELIMINAR RELACIONES MARCADAS
        // ==================================================================

        for (
            const relationId
            of attributesToDelete
        ) {

            // --------------------------------------------------------------
            // Si la relación ya fue sustituida arriba, podría estar
            // incluida aquí. Evitamos procesarla dos veces.
            // --------------------------------------------------------------

            const currentRelation =
                currentAttributes.find(
                    relation =>
                        relation.id === relationId
                );


            if (currentRelation) {

                console.log(
                    'ℹ️ Relación marcada pero todavía presente:',
                    relationId
                );

                continue;
            }


            console.log(
                '🟡 Eliminando relación:',
                relationId
            );


            await accountProductTypeApi
                .removeAttributeFromProductType(
                    relationId
                );


            console.log(
                '🟢 Relación eliminada:',
                relationId
            );

        }


        // ==================================================================
        // 3. CREAR ATRIBUTOS NUEVOS
        // ==================================================================

        for (
            const pending
            of pendingAttributes
        ) {

            if (
                !pending.attribute?.id
            ) {
                continue;
            }


            console.log(
                '🟡 Creando/reactivando relación nueva:',
                {
                    productTypeId,

                    attributeId:
                        pending.attribute.id,

                    required:
                        pending.required,

                    sortOrder:
                        pending.sortOrder
                }
            );


            await accountProductTypeApi
                .assignAttributeToProductType(
                    productTypeId,
                    {
                        attributeId:
                            pending.attribute.id,

                        required:
                            pending.required,

                        sortOrder:
                            pending.sortOrder
                    }
                );


            console.log(
                '🟢 Relación nueva procesada:',
                pending.attribute.id
            );

        }


        // ==================================================================
        // 4. LIMPIAR ESTADO TEMPORAL
        // ==================================================================

        accountProductTypesState.attributes = [];

        accountProductTypesState.originalAttributes = [];

        accountProductTypesState.pendingAttributes = [];

        accountProductTypesState.attributesToDelete = [];

        accountProductTypesState.availableAttributes = [];


        // ==================================================================
        // 5. RECARGAR DESDE BD
        // ==================================================================

        await selectProductType(
            productTypeId
        );


        console.log(
            '✅ Cambios de atributos guardados correctamente.'
        );


    } catch (error) {

        console.error(
            '❌ Error guardando atributos del tipo de producto:',
            error
        );


        alert(
            error.message ||
            'No se pudieron guardar los cambios de los atributos.'
        );


    } finally {

        if (saveButton) {
            saveButton.disabled = false;
        }

    }

}


// ==========================================================================
// CERRAR MODAL: AGREGAR ATRIBUTO
// ==========================================================================

function closeAssignAttributeModal() {

    const modal =
        document.getElementById(
            'adminAssignAttributeModal'
        );

    if (modal) {
        modal.style.display = 'none';
    }

}

// ==========================================================================
// CERRAR MODAL: EDITAR ATRIBUTO DEL TIPO DE PRODUCTO
// ==========================================================================

function closeProductTypeAttributeModal() {

    const modal =
        document.getElementById(
            'adminProductTypeAttributeModal'
        );

    if (modal) {
        modal.style.display = 'none';
    }

    accountProductTypesState.editingAttributeIndex =
        null;

}

// ==========================================================================
// CAMBIO DE VISTA: TIPOS DE PRODUCTO / ATRIBUTOS
// ==========================================================================

function initResourceViewTabs() {

    const viewButtons =
        document.querySelectorAll(
            '[data-resource-view]'
        );

    const productTypesView =
        document.getElementById(
            'adminProductTypesView'
        );

    const attributesView =
        document.getElementById(
            'adminAttributesView'
        );


    const assignAttributeModalClose =
        document.getElementById(
            'adminAssignAttributeModalClose'
        );

    const assignAttributeModalCancel =
        document.getElementById(
            'adminAssignAttributeModalCancel'
        );

    const productTypeAttributeModalClose =
        document.getElementById(
            'adminProductTypeAttributeModalClose'
        );

    const productTypeAttributeModalCancel =
        document.getElementById(
            'adminProductTypeAttributeModalCancel'
        );


    // --------------------------------------------------------------
    // CERRAR MODAL: AGREGAR ATRIBUTO
    // --------------------------------------------------------------

    if (assignAttributeModalClose) {

        assignAttributeModalClose.addEventListener(
            'click',
            closeAssignAttributeModal
        );

    }


    if (assignAttributeModalCancel) {

        assignAttributeModalCancel.addEventListener(
            'click',
            closeAssignAttributeModal
        );

    }


    // --------------------------------------------------------------
    // CERRAR MODAL: EDITAR ATRIBUTO
    // --------------------------------------------------------------

    if (productTypeAttributeModalClose) {

        productTypeAttributeModalClose.addEventListener(
            'click',
            closeProductTypeAttributeModal
        );

    }


    if (productTypeAttributeModalCancel) {

        productTypeAttributeModalCancel.addEventListener(
            'click',
            closeProductTypeAttributeModal
        );

    }

    if (
        !productTypesView ||
        !attributesView
    ) {
        console.error(
            'No se encontraron las vistas internas de Tipos y Atributos.'
        );
        return;
    }

    viewButtons.forEach(button => {

        button.addEventListener(
            'click',
            () => {

                const targetView =
                    button.getAttribute(
                        'data-resource-view'
                    );

                // ------------------------------------------------------
                // Actualizar botones
                // ------------------------------------------------------

                viewButtons.forEach(btn => {
                    btn.classList.remove('active');
                });

                button.classList.add('active');


                // ------------------------------------------------------
                // Mostrar vista correspondiente
                // ------------------------------------------------------

                if (targetView === 'product-types') {

                    productTypesView.style.display = '';

                    attributesView.style.display = 'none';

                }

                else if (targetView === 'attributes') {

                    productTypesView.style.display = 'none';

                    attributesView.style.display = '';


                    // --------------------------------------------------------------
                    // Cargar atributos globales
                    // --------------------------------------------------------------

                    if (
                        window.accountAttributes &&
                        typeof accountAttributes.loadAttributes === 'function'
                    ) {

                        accountAttributes.loadAttributes();

                    } else {

                        console.error(
                            'accountAttributes.loadAttributes() no está disponible.'
                        );

                    }

                }

            }
        );

    });
}

// ==========================================================================
// INICIALIZACIÓN
// ==========================================================================

async function init() {


    try {


        initProductTypeEvents();

        initResourceViewTabs();


        await loadProductTypes();



    } catch (error) {

        console.error(
            '🔴 ERROR EN accountProductTypes.init():',
            error
        );

        throw error;
    }
}

// ==========================================================================
// API PÚBLICA
// ==========================================================================

window.accountProductTypes = {

    init,

    loadProductTypes,

    selectProductType,

    createProductType: openProductTypeModal,

    editProductType,

    deleteProductType

};