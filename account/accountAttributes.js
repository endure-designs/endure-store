// ==========================================================================
// ENDURE - ACCOUNT ATTRIBUTES
// Administración de atributos globales
// ==========================================================================


// ==========================================================================
// ESTADO
// ==========================================================================

const accountAttributesState = {

    attributes: [],

    filteredAttributes: [],

    editingAttributeId: null,

    // Opciones existentes actualmente en BD
    existingOptions: [],

    // Copia original al abrir el modal
    originalOptions: [],

    // Opciones nuevas todavía no guardadas
    pendingOptions: [],

    // IDs de opciones existentes marcadas para eliminar
    optionsToDelete: [],

    editingOptionId: null

};

// ==========================================================================
// CARGAR ATRIBUTOS DESDE EL BACKEND
// ==========================================================================

async function loadAttributes() {

    try {

        const response =
            await accountProductTypeApi.getAttributes();

        const attributes =
            response?.data?.items ||
            response?.data ||
            [];

        accountAttributesState.attributes =
            Array.isArray(attributes)
                ? attributes
                : [];

        accountAttributesState.filteredAttributes =
            [...accountAttributesState.attributes];

        console.log(
            '✅ Atributos globales cargados:',
            accountAttributesState.attributes
        );

        renderGlobalAttributes();

        return accountAttributesState.attributes;

    } catch (error) {

        console.error(
            '❌ Error cargando atributos globales:',
            error
        );

        accountAttributesState.attributes = [];
        accountAttributesState.filteredAttributes = [];

        renderGlobalAttributes();

        return [];

    }

}


// ==========================================================================
// RENDERIZAR ATRIBUTOS
// ==========================================================================

function renderGlobalAttributes() {

    const container =
        document.getElementById(
            'adminAttributesList'
        );

    if (!container) {

        console.warn(
            '⚠️ No existe #adminAttributesList'
        );

        return;
    }


    const attributes =
        accountAttributesState.filteredAttributes;


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
                    class="fa-solid fa-sliders"
                    style="
                        font-size:2rem;
                        margin-bottom:10px;
                        opacity:0.5;
                    "
                ></i>

                <p>
                    No hay atributos registrados.
                </p>

            </div>

        `;

        return;
    }


    // ----------------------------------------------------------------------
    // RENDERIZAR
    // ----------------------------------------------------------------------

    container.innerHTML =

        attributes.map(attribute => {

            const options =
                Array.isArray(attribute.options)
                    ? attribute.options
                    : [];


            return `
                    <div
                        class="global-attribute-item"
                        data-attribute-id="${attribute.id}"
                    >

                        <!-- ================================================== -->
                        <!-- CABECERA                                            -->
                        <!-- ================================================== -->

                        <div class="global-attribute-header">

                            <strong class="global-attribute-name">
                                ${escapeHtml(attribute.name)}
                            </strong>

                        </div>


                        <!-- ================================================== -->
                        <!-- OPCIONES                                            -->
                        <!-- ================================================== -->

                        <div class="global-attribute-options">

                            ${options.length
                    ? options.map(option => `
                                        <span class="global-attribute-option">
                                            ${escapeHtml(option.value)}
                                        </span>
                                    `).join('')
                    : `
                                        <span class="global-attribute-no-options">
                                            Sin opciones
                                        </span>
                                    `
                }

                        </div>


                        <!-- ================================================== -->
                        <!-- ACCIONES                                            -->
                        <!-- ================================================== -->

                        <div class="global-attribute-actions">

                            <button
                                type="button"
                                class="btn-secondary"
                                data-action="view-attribute-product-types"
                                data-attribute-id="${attribute.id}"
                            >
                                <i class="fa-solid fa-link"></i>
                                Ver tipos
                            </button>

                            <button
                                type="button"
                                class="btn-secondary"
                                data-action="edit-global-attribute"
                                data-attribute-id="${attribute.id}"
                            >
                                <i class="fa-solid fa-pen"></i>
                                Editar
                            </button>

                            <button
                                type="button"
                                class="btn-danger"
                                data-action="delete-global-attribute"
                                data-attribute-id="${attribute.id}"
                            >
                                <i class="fa-solid fa-trash"></i>
                                Eliminar
                            </button>

                        </div>

                    </div>
                `;

        }).join('');

    attachGlobalAttributeActionListeners();

}


// ==========================================================================
// EVENTOS DE ACCIONES DE ATRIBUTOS
// ==========================================================================

function attachGlobalAttributeActionListeners() {

    const container =
        document.getElementById(
            'adminAttributesList'
        );

    if (!container) return;


    // ----------------------------------------------------------------------
    // VER TIPOS DE PRODUCTO
    // ----------------------------------------------------------------------

    container
        .querySelectorAll(
            '[data-action="view-attribute-product-types"]'
        )
        .forEach(button => {

            button.addEventListener(
                'click',
                () => {

                    const attributeId =
                        Number(
                            button.dataset.attributeId
                        );

                    viewAttributeProductTypes(
                        attributeId
                    );

                }
            );

        });


    // ----------------------------------------------------------------------
    // EDITAR ATRIBUTO
    // ----------------------------------------------------------------------

    container
        .querySelectorAll(
            '[data-action="edit-global-attribute"]'
        )
        .forEach(button => {

            button.addEventListener(
                'click',
                () => {

                    const attributeId =
                        Number(
                            button.dataset.attributeId
                        );

                    editGlobalAttribute(
                        attributeId
                    );

                }
            );

        });


    // ----------------------------------------------------------------------
    // ELIMINAR ATRIBUTO
    // ----------------------------------------------------------------------

    container
        .querySelectorAll(
            '[data-action="delete-global-attribute"]'
        )
        .forEach(button => {

            button.addEventListener(
                'click',
                () => {

                    const attributeId =
                        Number(
                            button.dataset.attributeId
                        );


                    // ------------------------------------------------------
                    // Buscar atributo para obtener su nombre
                    // ------------------------------------------------------

                    const attribute =
                        accountAttributesState.attributes.find(
                            item =>
                                item.id === attributeId
                        );


                    if (!attribute) {

                        console.error(
                            '❌ No se encontró el atributo:',
                            attributeId
                        );

                        return;

                    }


                    // ------------------------------------------------------
                    // Ejecutar eliminación
                    // ------------------------------------------------------

                    deleteGlobalAttribute(
                        attributeId,
                        attribute.name
                    );

                }
            );

        });

}


// ==========================================================================
// VER TIPOS DE PRODUCTO DE UN ATRIBUTO
// ==========================================================================

function viewAttributeProductTypes(attributeId) {

    // ----------------------------------------------------------------------
    // Buscar atributo
    // ----------------------------------------------------------------------

    const attribute =
        accountAttributesState.attributes.find(
            item =>
                item.id === attributeId
        );

    if (!attribute) {

        console.error(
            '❌ No se encontró el atributo:',
            attributeId
        );

        return;
    }


    // ----------------------------------------------------------------------
    // Obtener tipos relacionados
    // ----------------------------------------------------------------------

    const productTypes =
        Array.isArray(attribute.productTypes)
            ? attribute.productTypes
            : [];


    console.log(
        '🔎 Tipos de producto del atributo:',
        {
            attributeId,
            attribute: attribute.name,
            productTypes
        }
    );


    // ----------------------------------------------------------------------
    // Obtener modal
    // ----------------------------------------------------------------------

    const modal =
        document.getElementById(
            'adminAttributeProductTypesModal'
        );

    if (!modal) {

        console.error(
            '❌ No existe #adminAttributeProductTypesModal'
        );

        return;
    }


    // ----------------------------------------------------------------------
    // Título
    // ----------------------------------------------------------------------

    const title =
        document.getElementById(
            'adminAttributeProductTypesModalTitle'
        );

    if (title) {

        title.textContent =
            `Tipos de producto — ${attribute.name}`;

    }


    // ----------------------------------------------------------------------
    // Contenedor de tipos
    // ----------------------------------------------------------------------

    const list =
        document.getElementById(
            'adminAttributeProductTypesList'
        );

    if (!list) {

        console.error(
            '❌ No existe #adminAttributeProductTypesList'
        );

        return;
    }


    // ----------------------------------------------------------------------
    // Sin tipos relacionados
    // ----------------------------------------------------------------------

    if (productTypes.length === 0) {

        list.innerHTML = `
            <div style="
                padding:20px;
                text-align:center;
                color:var(--text-muted);
            ">

                <i
                    class="fa-solid fa-link-slash"
                    style="
                        font-size:1.8rem;
                        margin-bottom:10px;
                        opacity:0.5;
                    "
                ></i>

                <p>
                    Este atributo no está asignado
                    a ningún tipo de producto.
                </p>

            </div>
        `;

    }

    // ----------------------------------------------------------------------
    // Mostrar tipos relacionados
    // ----------------------------------------------------------------------

    else {

        list.innerHTML =
            productTypes.map(
                relation => {

                    const productType =
                        relation.productType;

                    if (!productType) {
                        return '';
                    }

                    return `
                        <div
                            class="admin-attribute-product-type-item"
                        >

                            <div>

                                <strong>
                                    ${productType.name}
                                </strong>

                                <small>
                                    ${productType.slug}
                                </small>

                            </div>

                        </div>
                    `;

                }
            ).join('');

    }


    // ----------------------------------------------------------------------
    // Mostrar modal
    // ----------------------------------------------------------------------

    modal.hidden = false;

}


// ==========================================================================
// EDITAR ATRIBUTO GLOBAL
// ==========================================================================

async function editGlobalAttribute(attributeId) {

    try {

        console.log(
            '🟡 Cargando atributo para editar:',
            attributeId
        );

        // --------------------------------------------------------------
        // Guardar atributo que estamos editando
        // --------------------------------------------------------------

        accountAttributesState.editingAttributeId =
            attributeId;


        // --------------------------------------------------------------
        // Buscar atributo en el estado actual
        // --------------------------------------------------------------

        const attribute =
            accountAttributesState.attributes.find(
                item =>
                    item.id === attributeId
            );


        if (!attribute) {

            throw new Error(
                'No se encontró el atributo seleccionado.'
            );

        }


        // --------------------------------------------------------------
        // Obtener opciones actuales desde el backend
        // --------------------------------------------------------------

        const response =
            await accountProductTypeApi.getAttributeOptions(
                attributeId
            );


        const existingOptions =
            response?.data?.options ||
            response?.options ||
            [];


        console.log(
            '🟢 Atributo obtenido:',
            attribute
        );

        console.log(
            '🟢 Opciones actuales:',
            existingOptions
        );


        // --------------------------------------------------------------
        // Guardar estado de edición
        // --------------------------------------------------------------

        const options =
            Array.isArray(existingOptions)
                ? existingOptions
                : [];

        // --------------------------------------------------------------
        // Guardar copia original para poder cancelar los cambios
        // --------------------------------------------------------------

        accountAttributesState.originalOptions =
            structuredClone(options);

        // --------------------------------------------------------------
        // Copia editable temporal
        // --------------------------------------------------------------

        accountAttributesState.existingOptions =
            structuredClone(options);

        // --------------------------------------------------------------
        // Limpiar cambios temporales anteriores
        // --------------------------------------------------------------

        accountAttributesState.pendingOptions = [];

        accountAttributesState.optionsToDelete = [];

        accountAttributesState.editingOptionId = null;


        // --------------------------------------------------------------
        // Abrir modal y cargar información
        // --------------------------------------------------------------

        const modal =
            document.getElementById(
                'adminAttributeModal'
            );

        if (!modal) {

            throw new Error(
                'No existe #adminAttributeModal'
            );

        }


        const title =
            document.getElementById(
                'adminAttributeModalTitle'
            );

        if (title) {

            title.textContent =
                'Editar atributo';

        }


        const nameInput =
            document.getElementById(
                'adminAttributeName'
            );

        const slugInput =
            document.getElementById(
                'adminAttributeSlug'
            );


        if (nameInput) {

            nameInput.value =
                attribute.name || '';

        }


        if (slugInput) {

            slugInput.value =
                attribute.slug || '';

        }


        // --------------------------------------------------------------
        // La descripción no se carga porque el backend actual
        // no la almacena para Attribute.
        // --------------------------------------------------------------

        const descriptionInput =
            document.getElementById(
                'adminAttributeDescription'
            );

        if (descriptionInput) {

            descriptionInput.value = '';

        }


        // --------------------------------------------------------------
        // Renderizar opciones existentes
        // --------------------------------------------------------------

        renderPendingOptions();


        // --------------------------------------------------------------
        // Mostrar modal
        // --------------------------------------------------------------

        modal.hidden = false;


        // --------------------------------------------------------------
        // Resaltar tarjeta en edición
        // --------------------------------------------------------------

        document.querySelectorAll('.global-attribute-item').forEach(item => {
            item.classList.remove('is-editing');
        });

        const activeCard = document.querySelector(
            `.global-attribute-item[data-attribute-id="${attributeId}"]`
        );

        if (activeCard) {
            activeCard.classList.add('is-editing');
            activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }


        console.log(
            '🟢 Modal de edición preparado.'
        );


    } catch (error) {

        console.error(
            '❌ Error editando atributo:',
            error
        );

        alert(
            error.message ||
            'No se pudo cargar el atributo.'
        );

    }

}


// ==========================================================================
// BUSCAR ATRIBUTOS
// ==========================================================================

function filterAttributes(searchTerm) {

    const term =
        String(searchTerm || '')
            .trim()
            .toLowerCase();


    if (!term) {

        accountAttributesState.filteredAttributes =
            [...accountAttributesState.attributes];

    } else {

        accountAttributesState.filteredAttributes =
            accountAttributesState.attributes.filter(
                attribute =>
                    String(attribute.name || '')
                        .toLowerCase()
                        .includes(term)
            );

    }


    renderGlobalAttributes();

}


// ==========================================================================
// ABRIR MODAL DE ATRIBUTO GLOBAL
// ==========================================================================

function openGlobalAttributeModal(attributeId = null) {

    const modal =
        document.getElementById(
            'adminAttributeModal'
        );

    if (!modal) {

        console.error(
            '❌ No existe #adminAttributeModal'
        );

        return;
    }


    // --------------------------------------------------------------
    // Guardar estado
    // --------------------------------------------------------------

    accountAttributesState.editingAttributeId =
        attributeId;

    accountAttributesState.originalOptions = [];

    accountAttributesState.existingOptions = [];

    accountAttributesState.pendingOptions = [];

    accountAttributesState.optionsToDelete = [];

    accountAttributesState.editingOptionId = null;


    // --------------------------------------------------------------
    // Título
    // --------------------------------------------------------------

    const title =
        document.getElementById(
            'adminAttributeModalTitle'
        );

    if (title) {

        title.textContent =
            attributeId
                ? 'Editar atributo'
                : 'Nuevo atributo';

    }


    // --------------------------------------------------------------
    // Limpiar formulario
    // --------------------------------------------------------------

    const nameInput =
        document.getElementById(
            'adminAttributeName'
        );

    const slugInput =
        document.getElementById(
            'adminAttributeSlug'
        );

    const descriptionInput =
        document.getElementById(
            'adminAttributeDescription'
        );


    if (nameInput) {
        nameInput.value = '';
    }

    if (slugInput) {
        slugInput.value = '';
    }

    if (descriptionInput) {
        descriptionInput.value = '';
    }


    // --------------------------------------------------------------
    // Limpiar lista de opciones
    // --------------------------------------------------------------

    renderPendingOptions();


    // --------------------------------------------------------------
    // Mostrar modal
    // --------------------------------------------------------------

    modal.hidden = false;

}


// ==========================================================================
// CERRAR MODAL DE ATRIBUTO GLOBAL
// ==========================================================================

function closeGlobalAttributeModal() {

    // --------------------------------------------------------------
    // Cerrar modal principal de atributo
    // --------------------------------------------------------------

    const modal =
        document.getElementById(
            'adminAttributeModal'
        );

    if (modal) {
        modal.hidden = true;
    }


    // --------------------------------------------------------------
    // Quitar resaltado de tarjeta
    // --------------------------------------------------------------

    document.querySelectorAll('.global-attribute-item.is-editing').forEach(item => {
        item.classList.remove('is-editing');
    });


    // --------------------------------------------------------------
    // Cerrar también el modal de opción
    // --------------------------------------------------------------

    const optionModal =
        document.getElementById(
            'adminAttributeOptionModal'
        );

    if (optionModal) {
        optionModal.hidden = true;
    }

}


// ==========================================================================
// CERRAR MODAL — VER TIPOS DE PRODUCTO
// ==========================================================================

function closeAttributeProductTypesModal() {

    const modal =
        document.getElementById(
            'adminAttributeProductTypesModal'
        );

    if (modal) {

        modal.hidden = true;

    }

}


// ==========================================================================
// RENDERIZAR OPCIONES
// ==========================================================================

function renderPendingOptions() {

    const container =
        document.getElementById(
            'adminAttributeOptionsList'
        );

    if (!container) {
        return;
    }


    // --------------------------------------------------------------
    // Opciones existentes en BD
    // --------------------------------------------------------------

    const existingOptions =
        Array.isArray(
            accountAttributesState.existingOptions
        )
            ? accountAttributesState.existingOptions
            : [];


    // --------------------------------------------------------------
    // Opciones nuevas pendientes
    // --------------------------------------------------------------

    const pendingOptions =
        Array.isArray(
            accountAttributesState.pendingOptions
        )
            ? accountAttributesState.pendingOptions
            : [];


    let draggedOptionKey = null;


    // --------------------------------------------------------------
    // Lista visual combinada
    // --------------------------------------------------------------

    const allOptions = [
        ...existingOptions.map(option => ({
            ...option,
            optionType: 'existing'
        })),

        ...pendingOptions.map((option, index) => ({
            ...option,
            optionType: 'pending',
            pendingIndex: index
        }))
    ].sort(
        (a, b) =>
            (a.sortOrder ?? 0) -
            (b.sortOrder ?? 0)
    );


    // --------------------------------------------------------------
    // Si no hay ninguna opción
    // --------------------------------------------------------------

    if (
        existingOptions.length === 0 &&
        pendingOptions.length === 0
    ) {

        container.innerHTML = `
            <p style="
                padding:15px;
                text-align:center;
                color:var(--text-muted);
            ">
                No hay opciones registradas.
            </p>
        `;

        return;
    }

    // --------------------------------------------------------------
    // RENDERIZAR TODAS LAS OPCIONES
    // --------------------------------------------------------------

    container.innerHTML = allOptions
        .map(option => {

            const optionKey =
                option.optionType === 'existing'
                    ? `existing-${option.id}`
                    : `pending-${option.pendingIndex}`;

            const optionId =
                option.optionType === 'existing'
                    ? `data-option-id="${option.id}"`
                    : `data-option-index="${option.pendingIndex}"`;

            return `

                    <div
                        class="admin-pending-option"
                        draggable="true"
                        data-option-key="${optionKey}"
                        ${optionId}
                    >

                        <span
                            class="admin-option-drag-handle"
                            title="Arrastrar para cambiar el orden"
                        >
                            <i class="fa-solid fa-grip-vertical"></i>
                        </span>

                        ${option.hexColor
                    ? `
                                <span
                                    class="admin-option-color-swatch"
                                    style="background-color:${option.hexColor};"
                                    title="${option.hexColor}"
                                ></span>
                            `
                    : ''
                }

                        <span class="admin-option-value">
                            ${option.value}
                        </span>

                        ${option.optionType === 'existing'
                    ? `
                                    <div>

                                        <button
                                            type="button"
                                            class="btn-secondary"
                                            data-action="edit-existing-option"
                                            data-option-id="${option.id}"
                                        >
                                            <i class="fa-solid fa-pen"></i>
                                            Editar
                                        </button>

                                        <button
                                            type="button"
                                            class="btn-danger"
                                            data-action="remove-existing-option"
                                            data-option-id="${option.id}"
                                        >
                                            <i class="fa-solid fa-trash"></i>
                                            Eliminar
                                        </button>

                                    </div>
                                `
                    : `
                                    <button
                                        type="button"
                                        class="btn-danger"
                                        data-action="remove-pending-option"
                                        data-option-index="${option.pendingIndex}"
                                        title="Eliminar opción"
                                    >
                                        <i class="fa-solid fa-trash"></i>
                                        Eliminar
                                    </button>
                                `
                }

                    </div>

                `;

        })
        .join('');


    // --------------------------------------------------------------
    // DRAG & DROP — TODAS LAS OPCIONES
    // --------------------------------------------------------------

    const draggableOptions =
        container.querySelectorAll(
            '.admin-pending-option[draggable="true"]'
        );

    draggableOptions.forEach(optionElement => {

        // ----------------------------------------------------------
        // INICIO DEL ARRASTRE
        // ----------------------------------------------------------

        optionElement.addEventListener(
            'dragstart',
            event => {

                draggedOptionKey =
                    optionElement.dataset.optionKey;

                optionElement.classList.add(
                    'dragging'
                );

                event.dataTransfer.effectAllowed =
                    'move';

                event.dataTransfer.setData(
                    'text/plain',
                    draggedOptionKey
                );

            }
        );


        // ----------------------------------------------------------
        // ARRASTRAR SOBRE OTRA OPCIÓN
        // ----------------------------------------------------------

        optionElement.addEventListener(
            'dragover',
            event => {

                event.preventDefault();

                event.dataTransfer.dropEffect =
                    'move';

            }
        );


        // ----------------------------------------------------------
        // SOLTAR
        // ----------------------------------------------------------

        optionElement.addEventListener(
            'drop',
            event => {

                event.preventDefault();

                const targetOptionKey =
                    optionElement.dataset.optionKey;

                if (
                    !draggedOptionKey ||
                    draggedOptionKey === targetOptionKey
                ) {
                    return;
                }


                // ------------------------------------------------------
                // Buscar índices en la lista visual
                // ------------------------------------------------------

                const draggedIndex =
                    allOptions.findIndex(
                        option => {

                            const key =
                                option.optionType === 'existing'
                                    ? `existing-${option.id}`
                                    : `pending-${option.pendingIndex}`;

                            return (
                                key ===
                                draggedOptionKey
                            );

                        }
                    );


                const targetIndex =
                    allOptions.findIndex(
                        option => {

                            const key =
                                option.optionType === 'existing'
                                    ? `existing-${option.id}`
                                    : `pending-${option.pendingIndex}`;

                            return (
                                key ===
                                targetOptionKey
                            );

                        }
                    );


                if (
                    draggedIndex === -1 ||
                    targetIndex === -1
                ) {
                    return;
                }


                // ------------------------------------------------------
                // Mover dentro de la lista visual
                // ------------------------------------------------------

                const [
                    draggedOption
                ] =
                    allOptions.splice(
                        draggedIndex,
                        1
                    );


                allOptions.splice(
                    targetIndex,
                    0,
                    draggedOption
                );


                // ------------------------------------------------------
                // Recalcular orden temporal
                // ------------------------------------------------------

                allOptions.forEach(
                    (option, index) => {

                        option.sortOrder =
                            index + 1;

                    }
                );


                // ------------------------------------------------------
                // Sincronizar existingOptions
                // ------------------------------------------------------

                allOptions
                    .filter(
                        option =>
                            option.optionType ===
                            'existing'
                    )
                    .forEach(option => {

                        const original =
                            accountAttributesState
                                .existingOptions
                                .find(
                                    item =>
                                        item.id ===
                                        option.id
                                );

                        if (original) {

                            original.sortOrder =
                                option.sortOrder;

                        }

                    });


                // ------------------------------------------------------
                // Sincronizar pendingOptions
                // ------------------------------------------------------

                allOptions
                    .filter(
                        option =>
                            option.optionType ===
                            'pending'
                    )
                    .forEach(option => {

                        const pending =
                            accountAttributesState
                                .pendingOptions[
                            option.pendingIndex
                            ];

                        if (pending) {

                            pending.sortOrder =
                                option.sortOrder;

                        }

                    });


                console.log(
                    '🟡 Nuevo orden temporal:',
                    allOptions.map(
                        option => ({
                            id:
                                option.optionType ===
                                    'existing'
                                    ? option.id
                                    : null,

                            value:
                                option.value,

                            type:
                                option.optionType,

                            sortOrder:
                                option.sortOrder
                        })
                    )
                );


                // ------------------------------------------------------
                // Renderizar nuevamente
                // ------------------------------------------------------

                renderPendingOptions();

            }
        );


        // ----------------------------------------------------------
        // FINAL DEL ARRASTRE
        // ----------------------------------------------------------

        optionElement.addEventListener(
            'dragend',
            () => {

                optionElement.classList.remove(
                    'dragging'
                );

                draggedOptionKey =
                    null;

            }
        );

    });


    // --------------------------------------------------------------
    // ELIMINAR OPCIÓN EXISTENTE
    // --------------------------------------------------------------

    container
        .querySelectorAll(
            '[data-action="remove-existing-option"]'
        )
        .forEach(button => {

            button.addEventListener(
                'click',
                () => {

                    const optionId =
                        Number(
                            button.dataset.optionId
                        );

                    const option =
                        accountAttributesState
                            .existingOptions
                            .find(
                                item =>
                                    item.id === optionId
                            );

                    if (!option) {
                        return;
                    }


                    // ------------------------------------------------------
                    // Confirmar eliminación
                    // ------------------------------------------------------

                    const confirmed =
                        confirm(
                            `¿Deseas eliminar la opción "${option.value}"?\n\n` +
                            `La opción dejará de estar disponible para nuevas variantes ` +
                            `cuando guardes el atributo.`
                        );

                    if (!confirmed) {
                        return;
                    }


                    // ------------------------------------------------------
                    // Marcar para eliminación
                    // ------------------------------------------------------

                    if (
                        !accountAttributesState
                            .optionsToDelete
                            .includes(optionId)
                    ) {

                        accountAttributesState
                            .optionsToDelete
                            .push(optionId);

                    }


                    console.log(
                        '🟡 Opción marcada para eliminación:',
                        {
                            optionId,
                            value: option.value
                        }
                    );


                    // ------------------------------------------------------
                    // Retirar temporalmente de la vista
                    // ------------------------------------------------------

                    accountAttributesState
                        .existingOptions =

                        accountAttributesState
                            .existingOptions
                            .filter(
                                item =>
                                    item.id !== optionId
                            );


                    // ------------------------------------------------------
                    // Actualizar interfaz
                    // ------------------------------------------------------

                    renderPendingOptions();

                }
            );

        });


    // --------------------------------------------------------------
    // ELIMINAR OPCIÓN NUEVA/PENDIENTE
    // --------------------------------------------------------------

    container
        .querySelectorAll(
            '[data-action="remove-pending-option"]'
        )
        .forEach(button => {

            button.addEventListener(
                'click',
                () => {

                    const index =
                        Number(
                            button.dataset.optionIndex
                        );


                    accountAttributesState
                        .pendingOptions
                        .splice(index, 1);


                    renderPendingOptions();

                }
            );

        });


    // --------------------------------------------------------------
    // EDITAR OPCIÓN EXISTENTE
    // --------------------------------------------------------------

    container
        .querySelectorAll(
            '[data-action="edit-existing-option"]'
        )
        .forEach(button => {

            button.addEventListener(
                'click',
                () => {

                    const optionId =
                        Number(
                            button.dataset.optionId
                        );

                    editExistingAttributeOption(
                        optionId
                    );

                }
            );

        });

}


// ==========================================================================
// EDITAR OPCIÓN EXISTENTE
// ==========================================================================

function editExistingAttributeOption(optionId) {

    const option =
        accountAttributesState.existingOptions.find(
            item => item.id === optionId
        );

    if (!option) {

        console.error(
            '❌ No se encontró la opción:',
            optionId
        );

        return;
    }


    // --------------------------------------------------------------
    // Guardar opción que estamos editando
    // --------------------------------------------------------------

    accountAttributesState.editingOptionId =
        optionId;


    // --------------------------------------------------------------
    // Obtener elementos del modal
    // --------------------------------------------------------------

    const modal =
        document.getElementById(
            'adminAttributeOptionModal'
        );

    const title =
        document.getElementById(
            'adminAttributeOptionModalTitle'
        );

    const valueInput =
        document.getElementById(
            'adminAttributeOptionValue'
        );

    const colorNameInput =
        document.getElementById(
            'adminAttributeColorName'
        );


    if (!modal || !valueInput) {

        console.error(
            '❌ No se encontró el modal de opción.'
        );

        return;
    }


    // --------------------------------------------------------------
    // Cambiar título
    // --------------------------------------------------------------

    if (title) {

        title.textContent =
            'Editar opción';

    }


    // --------------------------------------------------------------
    // Cargar valor actual
    // --------------------------------------------------------------

    if (option.hexColor) {

        // ----------------------------------------------------------
        // Es un color
        // ----------------------------------------------------------

        valueInput.value =
            option.hexColor;

        if (colorNameInput) {

            colorNameInput.value =
                option.value || '';

        }

    } else {

        // ----------------------------------------------------------
        // Es una opción normal
        // ----------------------------------------------------------

        valueInput.value =
            option.value || '';

        if (colorNameInput) {

            colorNameInput.value =
                '';

        }

    }


    // --------------------------------------------------------------
    // Actualizar campos de color
    // --------------------------------------------------------------

    updateColorFields();


    // --------------------------------------------------------------
    // Cambiar texto del botón
    // --------------------------------------------------------------

    const saveButton =
        document.getElementById(
            'adminAttributeOptionModalSave'
        );

    if (saveButton) {

        saveButton.textContent =
            'Actualizar';

    }


    // --------------------------------------------------------------
    // Mostrar modal
    // --------------------------------------------------------------

    modal.hidden = false;

}


// ==========================================================================
// ACTUALIZAR ESTADO DEL BOTÓN AGREGAR / ACTUALIZAR
// ==========================================================================

function updateAttributeOptionSaveButton() {

    const saveButton =
        document.getElementById(
            'adminAttributeOptionModalSave'
        );

    const valueInput =
        document.getElementById(
            'adminAttributeOptionValue'
        );

    const colorNameInput =
        document.getElementById(
            'adminAttributeColorName'
        );


    if (!saveButton || !valueInput) {
        return;
    }


    // ----------------------------------------------------------------------
    // Comprobar valor principal
    // ----------------------------------------------------------------------

    const value =
        valueInput.value.trim();


    if (!value) {

        saveButton.disabled = true;

        return;

    }


    // ----------------------------------------------------------------------
    // Detectar HEX
    // ----------------------------------------------------------------------

    const isHexColor =
        /^#[0-9A-Fa-f]{6}$/.test(value);


    // ----------------------------------------------------------------------
    // Opción normal
    // ----------------------------------------------------------------------

    if (!isHexColor) {

        const result =
            checkOptionAvailability(value);

        saveButton.disabled =
            !result.available;

        return;

    }


    // ----------------------------------------------------------------------
    // Color
    // ----------------------------------------------------------------------

    const colorName =
        colorNameInput?.value.trim();


    // El nombre del color es obligatorio
    if (!colorName) {

        saveButton.disabled = true;

        return;

    }


    // ----------------------------------------------------------------------
    // Comprobar disponibilidad del HEX
    // ----------------------------------------------------------------------

    const hexResult =
        checkOptionAvailability(
            value
        );


    // ----------------------------------------------------------------------
    // Comprobar disponibilidad del nombre
    // ----------------------------------------------------------------------

    const nameResult =
        checkOptionAvailability(
            colorName
        );


    saveButton.disabled =
        !hexResult.available ||
        !nameResult.available;

}


// ==========================================================================
// ABRIR MODAL DE OPCIÓN DE ATRIBUTO
// ==========================================================================

function openAttributeOptionModal() {

    const modal =
        document.getElementById(
            'adminAttributeOptionModal'
        );

    if (!modal) {

        console.error(
            '❌ No existe #adminAttributeOptionModal'
        );

        return;
    }


    // --------------------------------------------------------------
    // Indicar que estamos creando una opción nueva
    // --------------------------------------------------------------

    accountAttributesState.editingOptionId =
        null;


    // --------------------------------------------------------------
    // Título
    // --------------------------------------------------------------

    const title =
        document.getElementById(
            'adminAttributeOptionModalTitle'
        );

    if (title) {

        title.textContent =
            'Nueva opción';

    }


    // --------------------------------------------------------------
    // Limpiar valor
    // --------------------------------------------------------------

    const valueInput =
        document.getElementById(
            'adminAttributeOptionValue'
        );

    if (valueInput) {

        valueInput.value = '';

    }

    // --------------------------------------------------------------
    // Limpiar nombre del color
    // --------------------------------------------------------------

    const colorNameInput =
        document.getElementById(
            'adminAttributeColorName'
        );

    if (colorNameInput) {

        colorNameInput.value = '';

    }


    // --------------------------------------------------------------
    // Restablecer campos de color
    // --------------------------------------------------------------

    updateColorFields();

    updateAttributeOptionSaveButton();

    // --------------------------------------------------------------
    // Botón
    // --------------------------------------------------------------

    const saveButton =
        document.getElementById(
            'adminAttributeOptionModalSave'
        );

    if (saveButton) {

        saveButton.textContent =
            'Agregar';

    }


    // --------------------------------------------------------------
    // Mostrar
    // --------------------------------------------------------------

    modal.hidden = false;

}


// ==========================================================================
// CERRAR MODAL DE OPCIÓN
// ==========================================================================

function closeAttributeOptionModal() {

    const modal =
        document.getElementById(
            'adminAttributeOptionModal'
        );

    const valueInput =
        document.getElementById(
            'adminAttributeOptionValue'
        );

    const colorNameInput =
        document.getElementById(
            'adminAttributeColorName'
        );


    // --------------------------------------------------------------
    // Ocultar modal
    // --------------------------------------------------------------

    if (modal) {
        modal.hidden = true;
    }


    // --------------------------------------------------------------
    // Limpiar campos
    // --------------------------------------------------------------

    if (valueInput) {
        valueInput.value = '';
    }

    if (colorNameInput) {
        colorNameInput.value = '';
    }


    // --------------------------------------------------------------
    // Actualizar estado visual de los campos de color
    // --------------------------------------------------------------

    updateColorFields();


    // --------------------------------------------------------------
    // Salir del modo edición
    // --------------------------------------------------------------

    accountAttributesState.editingOptionId =
        null;

}


// ==========================================================================
// GUARDAR ATRIBUTO GLOBAL
// ==========================================================================

async function saveGlobalAttribute() {

    const nameInput =
        document.getElementById(
            'adminAttributeName'
        );

    const slugInput =
        document.getElementById(
            'adminAttributeSlug'
        );

    const descriptionInput =
        document.getElementById(
            'adminAttributeDescription'
        );


    const name =
        nameInput?.value.trim();

    const slug =
        slugInput?.value.trim();

    const description =
        descriptionInput?.value.trim();


    // ----------------------------------------------------------------------
    // VALIDACIÓN
    // ----------------------------------------------------------------------

    if (!name) {

        alert(
            'El nombre del atributo es obligatorio.'
        );

        nameInput?.focus();

        return;
    }


    try {

        // ------------------------------------------------------------------
        // COMPROBAR MODO
        // ------------------------------------------------------------------

        const editingAttributeId =
            accountAttributesState.editingAttributeId;

        console.log(
            '🔎 ID DE EDICIÓN AL GUARDAR:',
            editingAttributeId,
            accountAttributesState
        );


        let attributeId;


        // ==================================================================
        // MODO EDICIÓN
        // ==================================================================

        if (editingAttributeId !== null && editingAttributeId !== undefined) {

            console.log(
                '🟢🟢🟢 ENTRÓ REALMENTE A MODO EDICIÓN',
                editingAttributeId
            );

            console.trace('TRACE MODO EDICIÓN');

            await accountProductTypeApi.updateAttribute(
                editingAttributeId,
                {
                    name,
                    slug:
                        slug || undefined
                }
            );

            attributeId =
                editingAttributeId;

            console.log(
                '🟢 Atributo actualizado:',
                attributeId
            );

        }


        // ==================================================================
        // MODO CREACIÓN
        // ==================================================================

        else {

            console.log(
                '🔴🔴🔴 ENTRÓ A MODO CREACIÓN',
                editingAttributeId
            );

            console.trace('TRACE MODO CREACIÓN');


            console.log(
                '🟡 Creando atributo:',
                {
                    name,
                    slug,
                    description
                }
            );


            const response =
                await accountProductTypeApi.createAttribute({

                    name,

                    slug:
                        slug || undefined,

                    description:
                        description || undefined

                });


            console.log(
                '🟢 Respuesta creación atributo:',
                response
            );


            attributeId =
                response?.data?.id;


            if (!attributeId) {

                throw new Error(
                    'El backend creó el atributo pero no devolvió su ID.'
                );

            }


            console.log(
                '🆔 ID del atributo creado:',
                attributeId
            );

        }


        // ==================================================================
        // ACTUALIZAR ORDEN DE OPCIONES EXISTENTES
        // ==================================================================

        const existingOptions =
            Array.isArray(
                accountAttributesState.existingOptions
            )
                ? accountAttributesState.existingOptions
                : [];


        // ------------------------------------------------------------------
        // Guardar cambios de las opciones existentes.
        // Incluye valor, color y orden.
        // ------------------------------------------------------------------

        for (const option of existingOptions) {

            // --------------------------------------------------------------
            // En una creación no existen opciones previas en BD.
            // --------------------------------------------------------------

            if (!editingAttributeId) {
                continue;
            }


            console.log(
                '🟡 Guardando orden de opción existente:',
                {
                    optionId: option.id,
                    value: option.value,
                    sortOrder: option.sortOrder
                }
            );


            await accountProductTypeApi
                .updateAttributeOption(
                    option.id,
                    {
                        value:
                            option.value,

                        hexColor:
                            option.hexColor,

                        sortOrder:
                            option.sortOrder
                    }
                );


            console.log(
                '🟢 Orden de opción guardado:',
                {
                    optionId: option.id,
                    sortOrder: option.sortOrder
                }
            );

        }

        // ==================================================================
        // ELIMINAR OPCIONES MARCADAS
        // ==================================================================

        const optionsToDelete =
            Array.isArray(
                accountAttributesState.optionsToDelete
            )
                ? accountAttributesState.optionsToDelete
                : [];

        for (
            const optionId
            of optionsToDelete
        ) {

            console.log(
                '🟡 Eliminando opción marcada:',
                optionId
            );

            await accountProductTypeApi
                .deleteAttributeOption(
                    optionId
                );

            console.log(
                '🟢 Opción eliminada:',
                optionId
            );
        }


        // ==================================================================
        // CREAR OPCIONES NUEVAS
        // ==================================================================

        const pendingOptions =
            accountAttributesState.pendingOptions;


        for (
            const option
            of pendingOptions
        ) {

            console.log(
                '🟡 Creando opción:',
                option
            );


            await accountProductTypeApi.createAttributeOption(
                attributeId,
                {
                    value:
                        option.value,

                    hexColor:
                        option.hexColor,

                    sortOrder:
                        option.sortOrder
                }
            );

        }


        console.log(
            '🟢 Opciones nuevas procesadas.'
        );


        // ------------------------------------------------------------------
        // LIMPIAR ESTADO
        // ------------------------------------------------------------------

        accountAttributesState.pendingOptions = [];

        accountAttributesState.existingOptions = [];

        accountAttributesState.optionsToDelete = [];

        accountAttributesState.editingAttributeId = null;

        accountAttributesState.editingOptionId = null;


        // ------------------------------------------------------------------
        // CERRAR MODAL
        // ------------------------------------------------------------------

        closeGlobalAttributeModal();


        // ------------------------------------------------------------------
        // RECARGAR ATRIBUTOS
        // ------------------------------------------------------------------

        await loadAttributes();


        console.log(
            editingAttributeId
                ? '✅ Atributo actualizado correctamente.'
                : '✅ Atributo global creado correctamente.'
        );


    } catch (error) {

        console.error(
            '❌ Error guardando atributo global:',
            error
        );


        alert(
            error.message ||
            'No se pudo guardar el atributo.'
        );

    }

}


// ==========================================================================
// AGREGAR / ACTUALIZAR OPCIÓN
// ==========================================================================

async function saveAttributeOption() {

    const valueInput =
        document.getElementById(
            'adminAttributeOptionValue'
        );

    const colorNameInput =
        document.getElementById(
            'adminAttributeColorName'
        );

    const value =
        valueInput?.value.trim();


    // ----------------------------------------------------------------------
    // VALIDACIÓN
    // ----------------------------------------------------------------------

    if (!value) {

        alert(
            'El valor de la opción es obligatorio.'
        );

        valueInput?.focus();

        return;
    }


    // ----------------------------------------------------------------------
    // DETECTAR SI ES UN COLOR HEX
    // ----------------------------------------------------------------------

    const isHexColor =
        /^#[0-9A-Fa-f]{6}$/.test(value);


    // ======================================================================
    // OPCIÓN NORMAL
    // ======================================================================

    if (!isHexColor) {

        const availability =
            checkOptionAvailability(value);

        if (!availability.available) {

            alert(
                'Este valor ya está utilizado.'
            );

            valueInput?.focus();

            return;
        }


        await saveResolvedAttributeOption(
            value,
            null
        );

        return;
    }


    // ======================================================================
    // COLOR
    // ======================================================================

    const colorName =
        colorNameInput?.value.trim();


    // ----------------------------------------------------------------------
    // El nombre del color es obligatorio
    // ----------------------------------------------------------------------

    if (!colorName) {

        alert(
            'Debes ingresar el nombre del color.'
        );

        colorNameInput?.focus();

        return;
    }


    // ----------------------------------------------------------------------
    // Comprobar disponibilidad del HEX
    // ----------------------------------------------------------------------

    const hexAvailability =
        checkOptionAvailability(value);

    if (!hexAvailability.available) {

        alert(
            'Este código HEX ya está utilizado.'
        );

        valueInput?.focus();

        return;
    }


    // ----------------------------------------------------------------------
    // Comprobar disponibilidad del nombre
    // ----------------------------------------------------------------------

    const nameAvailability =
        checkOptionAvailability(colorName);

    if (!nameAvailability.available) {

        alert(
            'Este nombre de color ya está utilizado.'
        );

        colorNameInput?.focus();

        return;
    }


    // ----------------------------------------------------------------------
    // GUARDAR COLOR
    // ----------------------------------------------------------------------

    await saveResolvedAttributeOption(
        colorName,
        value.toUpperCase()
    );

}

async function saveResolvedAttributeOption(resolvedValue, hexColor) {

    // ----------------------------------------------------------------------
    // ¿ESTAMOS EDITANDO UNA OPCIÓN EXISTENTE?
    // ----------------------------------------------------------------------

    const editingOptionId =
        accountAttributesState.editingOptionId;


    // ======================================================================
    // MODO EDICIÓN
    // ======================================================================

    if (editingOptionId) {

        const option =
            accountAttributesState.existingOptions.find(
                item =>
                    item.id === editingOptionId
            );

        if (!option) {

            alert(
                'No se encontró la opción que deseas editar.'
            );

            return;
        }


        // --------------------------------------------------------------
        // Actualizar solamente el estado temporal
        // --------------------------------------------------------------

        option.value = resolvedValue;
        option.hexColor = hexColor;


        console.log(
            '🟡 Opción modificada temporalmente:',
            {
                optionId: editingOptionId,
                value: resolvedValue,
                hexColor
            }
        );


        // --------------------------------------------------------------
        // Limpiar estado de edición
        // --------------------------------------------------------------

        accountAttributesState.editingOptionId =
            null;


        // --------------------------------------------------------------
        // Restaurar botón
        // --------------------------------------------------------------

        const saveButton =
            document.getElementById(
                'adminAttributeOptionModalSave'
            );

        if (saveButton) {

            saveButton.textContent =
                'Agregar';

        }


        // --------------------------------------------------------------
        // Renderizar cambios temporales
        // --------------------------------------------------------------

        renderPendingOptions();


        // --------------------------------------------------------------
        // Cerrar modal de opción
        // --------------------------------------------------------------

        closeAttributeOptionModal();


        console.log(
            '🟢 Opción modificada temporalmente.'
        );

        return;
    }


    // ======================================================================
    // MODO CREACIÓN
    // ======================================================================

    const sortOrder =
        accountAttributesState
            .existingOptions.length +
        accountAttributesState
            .pendingOptions.length +
        1;


    accountAttributesState.pendingOptions.push({
        value: resolvedValue,
        hexColor,
        sortOrder
    });


    console.log(
        '🟡 Nueva opción agregada temporalmente:',
        {
            value: resolvedValue,
            hexColor,
            sortOrder
        }
    );


    // ----------------------------------------------------------------------
    // Renderizar
    // ----------------------------------------------------------------------

    renderPendingOptions();


    // ----------------------------------------------------------------------
    // Cerrar modal
    // ----------------------------------------------------------------------

    closeAttributeOptionModal();

}


// ==========================================================================
// AUTONOMBRAR COLOR
// ==========================================================================

async function autoNameAttributeColor() {

    const valueInput =
        document.getElementById(
            'adminAttributeOptionValue'
        );

    const colorNameInput =
        document.getElementById(
            'adminAttributeColorName'
        );

    const autoNameButton =
        document.getElementById(
            'adminAttributeColorAutoName'
        );

    if (!valueInput || !colorNameInput) {
        return;
    }

    const hexColor =
        valueInput.value.trim();

    // ----------------------------------------------------------------------
    // VALIDAR HEX
    // ----------------------------------------------------------------------

    if (!/^#[0-9A-Fa-f]{6}$/.test(hexColor)) {
        return;
    }

    // ----------------------------------------------------------------------
    // Estado de carga
    // ----------------------------------------------------------------------

    if (autoNameButton) {
        autoNameButton.disabled = true;
        autoNameButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Identificando...
        `;
    }

    try {

        // --------------------------------------------------------------
        // Consultar backend
        // --------------------------------------------------------------

        const response =
            await accountProductTypeApi.identifyColor(
                hexColor.toUpperCase()
            );

        const result =
            response?.data;

        // --------------------------------------------------------------
        // Validar respuesta
        // --------------------------------------------------------------

        if (
            !result ||
            typeof result.value !== 'string' ||
            !result.value.trim()
        ) {
            throw new Error(
                'El servidor no devolvió un nombre de color válido.'
            );
        }

        // --------------------------------------------------------------
        // Colocar nombre en el segundo campo
        // --------------------------------------------------------------

        colorNameInput.value =
            result.value.trim();

        // --------------------------------------------------------------
        // Actualizar disponibilidad
        // --------------------------------------------------------------

        updateOptionAvailability(
            colorNameInput
        );

    } catch (error) {

        console.error(
            '❌ Error al autonombrar color:',
            error
        );

        alert(
            error.message ||
            'No se pudo identificar el color.'
        );

    } finally {

        // --------------------------------------------------------------
        // Restaurar botón
        // --------------------------------------------------------------

        if (autoNameButton) {

            autoNameButton.disabled = false;

            autoNameButton.innerHTML = `
                <i class="fa-solid fa-wand-magic-sparkles"></i>
                Autonombrar color
            `;
        }
    }
}



// ==========================================================================
// ELIMINAR ATRIBUTO
// ==========================================================================

async function deleteGlobalAttribute(attributeId, attributeName) {

    if (!attributeId) {
        console.error(
            '❌ No se recibió attributeId para eliminar.'
        );
        return;
    }

    const confirmed = confirm(
        `¿Estás seguro de eliminar el atributo "${attributeName}"?\n\n` +
        `El atributo dejará de estar disponible y sus relaciones ` +
        `con los tipos de producto serán desactivadas.`
    );

    if (!confirmed) {
        return;
    }

    try {

        console.log(
            '🟡 Eliminando atributo:',
            attributeId,
            attributeName
        );

        await accountProductTypeApi.deleteAttribute(
            attributeId
        );

        console.log(
            '🟢 Atributo eliminado correctamente:',
            attributeId
        );

        await loadAttributes();

    } catch (error) {

        console.error(
            '❌ Error eliminando atributo:',
            error
        );

        alert(
            error.message ||
            'No se pudo eliminar el atributo.'
        );
    }
}


// ==========================================================================
// RESOLVER VALOR DE OPCIÓN
// ==========================================================================

async function resolveAttributeOptionValue(value) {

    // ----------------------------------------------------------------------
    // Detectar hexadecimal
    // ----------------------------------------------------------------------

    const isHexColor =
        /^#[0-9A-Fa-f]{6}$/.test(value);

    // ----------------------------------------------------------------------
    // No es hexadecimal
    // ----------------------------------------------------------------------

    if (!isHexColor) {

        return {
            value,
            hexColor: null
        };
    }

    // ----------------------------------------------------------------------
    // Identificar color mediante backend
    // ----------------------------------------------------------------------

    const response =
        await accountProductTypeApi.identifyColor(value);

    // ----------------------------------------------------------------------
    // Extraer resultado
    // ----------------------------------------------------------------------

    const result =
        response?.data;

    if (
        !result ||
        typeof result.value !== 'string' ||
        !result.value.trim() ||
        typeof result.hexColor !== 'string' ||
        !result.hexColor.trim()
    ) {
        throw new Error(
            'El servidor no devolvió una identificación de color válida.'
        );
    }

    return {
        value: result.value.trim(),
        hexColor: result.hexColor.trim()
    };
}


// ==========================================================================
// COMPROBAR DISPONIBILIDAD DE UNA OPCIÓN
// ==========================================================================

function checkOptionAvailability(value) {

    const normalizedValue =
        String(value || '')
            .trim()
            .toLowerCase();


    // ----------------------------------------------------------------------
    // Sin valor
    // ----------------------------------------------------------------------

    if (!normalizedValue) {

        return {
            available: false,
            type: 'EMPTY'
        };

    }


    // ----------------------------------------------------------------------
    // Detectar si el valor es un hexadecimal
    // ----------------------------------------------------------------------

    const isHexColor =
        /^#[0-9A-Fa-f]{6}$/.test(
            normalizedValue
        );


    // ----------------------------------------------------------------------
    // ID de la opción que estamos editando
    // ----------------------------------------------------------------------

    const editingOptionId =
        accountAttributesState.editingOptionId;


    // ----------------------------------------------------------------------
    // Obtener todas las opciones existentes conocidas por el frontend
    // ----------------------------------------------------------------------

    const existingOptions = [];


    // --------------------------------------------------------------
    // Opciones de todos los atributos cargados
    // --------------------------------------------------------------

    accountAttributesState.attributes.forEach(
        attribute => {

            const options =
                Array.isArray(attribute.options)
                    ? attribute.options
                    : [];

            options.forEach(option => {

                existingOptions.push(option);

            });

        }
    );


    // --------------------------------------------------------------
    // Opciones del atributo actualmente editado
    // --------------------------------------------------------------

    accountAttributesState.existingOptions.forEach(
        option => {

            existingOptions.push(option);

        }
    );


    // --------------------------------------------------------------
    // Opciones nuevas todavía no guardadas
    // --------------------------------------------------------------

    accountAttributesState.pendingOptions.forEach(
        option => {

            existingOptions.push(option);

        }
    );


    // ----------------------------------------------------------------------
    // Buscar coincidencia
    // ----------------------------------------------------------------------

    const duplicate =
        existingOptions.find(option => {

            // --------------------------------------------------------------
            // Ignorar la misma opción cuando estamos editándola
            // --------------------------------------------------------------

            if (
                editingOptionId &&
                option.id === editingOptionId
            ) {
                return false;
            }


            // --------------------------------------------------------------
            // Si es HEX, comparar contra hexColor
            // --------------------------------------------------------------

            if (isHexColor) {

                const optionHex =
                    String(
                        option.hexColor || ''
                    )
                        .trim()
                        .toLowerCase();

                return (
                    optionHex ===
                    normalizedValue
                );

            }


            // --------------------------------------------------------------
            // Si no es HEX, comparar contra value
            // --------------------------------------------------------------

            const optionValue =
                String(
                    option.value || ''
                )
                    .trim()
                    .toLowerCase();

            return (
                optionValue ===
                normalizedValue
            );

        });


    // ----------------------------------------------------------------------
    // Resultado
    // ----------------------------------------------------------------------

    if (duplicate) {

        return {
            available: false,
            type: isHexColor
                ? 'HEX'
                : 'VALUE',
            existingOption: duplicate
        };

    }


    return {
        available: true,
        type: isHexColor
            ? 'HEX'
            : 'VALUE'
    };

}



// ==========================================================================
// ACTUALIZAR CAMPOS DE COLOR
// ==========================================================================

function updateColorFields() {

    const valueInput =
        document.getElementById(
            'adminAttributeOptionValue'
        );

    const colorNameGroup =
        document.getElementById(
            'adminAttributeColorNameGroup'
        );

    const autoNameButton =
        document.getElementById(
            'adminAttributeColorAutoName'
        );

    const colorNameInput =
        document.getElementById(
            'adminAttributeColorName'
        );


    if (!valueInput) {
        return;
    }


    const value =
        valueInput.value.trim();


    // ----------------------------------------------------------------------
    // Comprobar disponibilidad del valor principal
    // ----------------------------------------------------------------------

    updateOptionAvailability(
        valueInput
    );


    // ----------------------------------------------------------------------
    // Detectar hexadecimal válido
    // ----------------------------------------------------------------------

    const isHexColor =
        /^#[0-9A-Fa-f]{6}$/.test(
            value
        );


    // ----------------------------------------------------------------------
    // Mostrar / ocultar elementos de color
    // ----------------------------------------------------------------------

    if (colorNameGroup) {
        colorNameGroup.hidden =
            !isHexColor;
    }


    if (autoNameButton) {
        autoNameButton.hidden =
            !isHexColor;
    }


    // ----------------------------------------------------------------------
    // Comprobar disponibilidad del nombre del color
    // ----------------------------------------------------------------------

    if (colorNameInput) {

        if (isHexColor) {

            updateOptionAvailability(
                colorNameInput
            );

        } else {

            colorNameInput.value = '';

            updateOptionAvailability(
                colorNameInput
            );

        }

    }

}


function updateOptionAvailability(input) {

    if (!input) {
        return;
    }


    const value =
        input.value.trim();


    const result =
        checkOptionAvailability(value);


    // ----------------------------------------------------------------------
    // Buscar indicador existente
    // ----------------------------------------------------------------------

    let status =
        input.parentElement.querySelector(
            '.admin-option-availability'
        );


    // ----------------------------------------------------------------------
    // Crear indicador si todavía no existe
    // ----------------------------------------------------------------------

    if (!status) {

        status =
            document.createElement('small');

        status.className =
            'admin-option-availability';

        input.parentElement.appendChild(
            status
        );

    }


    // ----------------------------------------------------------------------
    // Campo vacío
    // ----------------------------------------------------------------------

    if (!value) {

        status.textContent = '';

        status.className =
            'admin-option-availability';

        updateAttributeOptionSaveButton();

        return;

    }


    // ----------------------------------------------------------------------
    // Disponible
    // ----------------------------------------------------------------------

    if (result.available) {

        status.textContent =
            '✓ Disponible';

        status.className =
            'admin-option-availability available';

        updateAttributeOptionSaveButton();

        return;

    }


    // ----------------------------------------------------------------------
    // Ya utilizado
    // ----------------------------------------------------------------------

    status.textContent =
        '✕ Este valor ya está utilizado';

    status.className =
        'admin-option-availability unavailable';

    updateAttributeOptionSaveButton();

}



// ==========================================================================
// INICIALIZACIÓN
// ==========================================================================

async function init() {


    try {

        // --------------------------------------------------------------
        // Buscador
        // --------------------------------------------------------------

        const searchInput =
            document.getElementById(
                'adminAttributeSearchInput'
            );


        if (searchInput) {

            searchInput.addEventListener(
                'input',
                event => {

                    filterAttributes(
                        event.target.value
                    );

                }
            );
        }


        // --------------------------------------------------------------
        // Botón 'Nuevo atributo' 
        // --------------------------------------------------------------

        const createAttributeButton =
            document.getElementById(
                'adminCreateGlobalAttributeBtn'
            );

        if (createAttributeButton) {

            createAttributeButton.addEventListener(
                'click',
                () => openGlobalAttributeModal()
            );
        }

        // --------------------------------------------------------------
        // Botón cerrar/cancelar modal
        // --------------------------------------------------------------

        const closeAttributeModalButton =
            document.getElementById(
                'adminAttributeModalClose'
            );

        const cancelAttributeModalButton =
            document.getElementById(
                'adminAttributeModalCancel'
            );

        if (closeAttributeModalButton) {

            closeAttributeModalButton.addEventListener(
                'click',
                closeGlobalAttributeModal
            );
        }


        if (cancelAttributeModalButton) {

            cancelAttributeModalButton.addEventListener(
                'click',
                closeGlobalAttributeModal
            );
        }


        // --------------------------------------------------------------
        // Botón 'Guardar' 
        // --------------------------------------------------------------

        const saveAttributeModalButton =
            document.getElementById(
                'adminAttributeModalSave'
            );

        if (saveAttributeModalButton) {

            saveAttributeModalButton.addEventListener(
                'click',
                saveGlobalAttribute
            );
        }

        // --------------------------------------------------------------
        // Modal Agregar Opcion
        // --------------------------------------------------------------

        const addAttributeOptionButton =
            document.getElementById(
                'adminAddAttributeOptionBtn'
            );

        const saveAttributeOptionButton =
            document.getElementById(
                'adminAttributeOptionModalSave'
            );

        const closeAttributeOptionModalButton =
            document.getElementById(
                'adminAttributeOptionModalClose'
            );

        const cancelAttributeOptionModalButton =
            document.getElementById(
                'adminAttributeOptionModalCancel'
            );

        if (addAttributeOptionButton) {

            addAttributeOptionButton.addEventListener(
                'click',
                openAttributeOptionModal
            );
        }

        // --------------------------------------------------------------
        // Campo de valor — detectar HEX en tiempo real
        // --------------------------------------------------------------

        const attributeOptionValueInput =
            document.getElementById(
                'adminAttributeOptionValue'
            );

        if (attributeOptionValueInput) {

            attributeOptionValueInput.addEventListener(
                'input',
                updateColorFields
            );

        }


        // --------------------------------------------------------------
        // Nombre del color — comprobar disponibilidad
        // --------------------------------------------------------------

        const attributeColorNameInput =
            document.getElementById(
                'adminAttributeColorName'
            );

        if (attributeColorNameInput) {

            attributeColorNameInput.addEventListener(
                'input',
                () => {
                    updateOptionAvailability(
                        attributeColorNameInput
                    );
                }
            );

        }

        const attributeColorAutoName =
            document.getElementById(
                'adminAttributeColorAutoName'
            );


        if (attributeColorAutoName) {
            attributeColorAutoName.addEventListener(
                'click',
                autoNameAttributeColor
            );
        }

        if (saveAttributeOptionButton) {

            saveAttributeOptionButton.addEventListener(
                'click',
                saveAttributeOption
            );
        }

        if (closeAttributeOptionModalButton) {

            closeAttributeOptionModalButton.addEventListener(
                'click',
                closeAttributeOptionModal
            );
        }


        if (cancelAttributeOptionModalButton) {

            cancelAttributeOptionModalButton.addEventListener(
                'click',
                closeAttributeOptionModal
            );
        }


        // --------------------------------------------------------------
        // CERRAR MODAL "VER TIPOS"
        // --------------------------------------------------------------

        const closeAttributeProductTypesModalButton =
            document.getElementById(
                'adminAttributeProductTypesModalClose'
            );

        const cancelAttributeProductTypesModalButton =
            document.getElementById(
                'adminAttributeProductTypesModalCancel'
            );


        if (closeAttributeProductTypesModalButton) {

            closeAttributeProductTypesModalButton.addEventListener(
                'click',
                closeAttributeProductTypesModal
            );

        }


        if (cancelAttributeProductTypesModalButton) {

            cancelAttributeProductTypesModalButton.addEventListener(
                'click',
                closeAttributeProductTypesModal
            );

        }


    } catch (error) {

        console.error(
            '🔴 ERROR EN accountAttributes.init():',
            error
        );

        throw error;

    }

}


// ==========================================================================
// API PÚBLICA
// ==========================================================================

window.accountAttributes = {

    init,

    loadAttributes,

    renderGlobalAttributes,

    filterAttributes

};