// ==========================================================================
// ACCOUNT INVENTORY MOVEMENTS MODAL
// Gestión de los movimientos de inventario administrativo
// ==========================================================================

const accountInventoryMovementsModal = {


    state: {
        variantId: null,
        variant: null,
        inventory: null,
        movements: [],
        filteredMovements: null,
        currentView: 'summary',
        movementType: null,
        loading: false,
        filters: {}
    },


    // ======================================================================
    // RECIBIR DATOS DE LA VARIANTE SELECCIONADA
    // ======================================================================

    setVariantData({ variantId, variant, inventory }) {

        if (!variantId) {

            console.error(
                '❌ No se recibió un variantId válido.'
            );

            return;
        }

        this.state.variantId = Number(variantId);

        this.state.variant = variant || null;

        this.state.inventory = inventory || null;

        this.state.movements =
            [];

        this.state.filteredMovements = null;

        this.state.filters = {
            fecha: {
                modo: 'day',
                desde: '',
                hasta: ''
            },
            usuarios: [],
            tipos: []
        };

        this.state.currentView = 'summary';

        this.state.movementType = null;

        console.log(
            '📦 Datos de variante recibidos por el modal:',
            {
                variantId: this.state.variantId,
                variant: this.state.variant,
                inventory: this.state.inventory
            }
        );
    },

    // ======================================================================
    // CARGAR MOVIMIENTOS DE LA VARIANTE
    // ======================================================================

    async cargarMovimientos() {

        if (!this.state.variantId) {

            console.warn(
                '⚠️ No hay una variante seleccionada para cargar movimientos.'
            );

            return;
        }

        try {

            this.state.loading = true;

            const response =
                await accountInventoryApi.getVariantMovements(
                    this.state.variantId
                );

            const data =
                response?.data ?? response;

            this.state.movements =
                Array.isArray(data)
                    ? data
                    : data?.movements ?? [];

            this.state.filteredMovements = null;

            console.log(
                '📋 Movimientos de la variante:',
                this.state.movements
            );

        } catch (error) {

            console.error(
                '❌ Error cargando movimientos de la variante:',
                error
            );

            this.state.movements = [];

        } finally {

            this.state.loading = false;

        }
    },


    // ======================================================================
    // ABRIR FORMULARIO DE AJUSTE DE STOCK
    // ======================================================================

    abrirAjusteStock() {

        if (this.state.variantId === null) {
            alert('No hay una variante seleccionada.');
            return;
        }

        this.state.currentView = 'adjustment';

        this.renderAjusteStockForm();
    },

    // ======================================================================
    // RENDERIZAR FORMULARIO DE AJUSTE
    // ======================================================================

    renderAjusteStockForm() {

        const container =
            document.getElementById(
                'adminProductDetailContent'
            );

        if (!container) {
            console.warn(
                'No se encontró #adminProductDetailContent'
            );
            return;
        }

        const currentStock =
            Number(
                this.state.inventory?.currentStock ?? 0
            );

        container.innerHTML = `

            <div class="inventory-form-view">

                <!-- ====================================================== -->
                <!-- CABECERA                                               -->
                <!-- ====================================================== -->

                <div class="inventory-form-header">

                    <div class="inventory-section-icon">
                        <i class="fa-solid fa-arrows-rotate"></i>
                    </div>

                    <div>

                        <h3>
                            Ajustar stock
                        </h3>

                        <p>
                            Corrige el stock físico mediante un ajuste.
                        </p>

                    </div>

                </div>


                <!-- ====================================================== -->
                <!-- STOCK ACTUAL                                           -->
                <!-- ====================================================== -->

                <div class="inventory-adjustment-current">

                    <span>
                        Stock registrado actualmente
                    </span>

                    <strong>
                        ${currentStock}
                    </strong>

                </div>


                <!-- ====================================================== -->
                <!-- NUEVO STOCK                                             -->
                <!-- ====================================================== -->

                <div class="inventory-form">

                    <div class="inventory-form-group">

                        <label for="inventoryAdjustmentTarget">

                            Nuevo stock físico

                        </label>

                        <input
                            type="number"
                            id="inventoryAdjustmentTarget"
                            class="form-input"
                            min="0"
                            step="1"
                            value="${currentStock}"
                        >

                        <small>
                            Ingresa la cantidad de unidades
                            que realmente existen físicamente.
                        </small>

                    </div>


                    <div class="inventory-form-group">

                        <label for="inventoryAdjustmentReason">

                            Motivo del ajuste

                        </label>

                        <textarea
                            id="inventoryAdjustmentReason"
                            class="form-input"
                            rows="4"
                            placeholder="Ej. Conteo físico"
                        >Conteo físico</textarea>

                    </div>

                </div>


                <!-- ====================================================== -->
                <!-- ACCIONES                                               -->
                <!-- ====================================================== -->

                <div class="inventory-form-actions">

                    <button
                        type="button"
                        class="btn-secondary"
                        onclick="
                            accountInventoryMovementsModal.volverResumen()
                        "
                    >

                        <i class="fa-solid fa-arrow-left"></i>

                        Atrás

                    </button>


                    <button
                        type="button"
                        class="btn-primary"
                        onclick="
                            accountInventoryMovementsModal.guardarAjusteStock()
                        "
                    >

                        <i class="fa-solid fa-floppy-disk"></i>

                        Guardar

                    </button>

                </div>

            </div>

        `;
    },

    // ======================================================================
    // GUARDAR AJUSTE DE STOCK
    // ======================================================================

    async guardarAjusteStock() {

        const targetInput =
            document.getElementById(
                'inventoryAdjustmentTarget'
            );

        const reasonInput =
            document.getElementById(
                'inventoryAdjustmentReason'
            );

        if (!targetInput || !reasonInput) {
            return;
        }

        const targetStock =
            Number(targetInput.value);

        const reason =
            reasonInput.value.trim();

        // ------------------------------------------------------------------
        // VALIDAR STOCK
        // ------------------------------------------------------------------

        if (
            !Number.isInteger(targetStock) ||
            targetStock < 0
        ) {

            alert(
                'El stock debe ser un número entero mayor o igual a cero.'
            );

            return;
        }

        // ------------------------------------------------------------------
        // VALIDAR MOTIVO
        // ------------------------------------------------------------------

        if (!reason) {

            alert(
                'Debes indicar el motivo del ajuste.'
            );

            reasonInput.focus();

            return;
        }

        try {

            // --------------------------------------------------------------
            // GUARDAR AJUSTE EN EL BACKEND
            // --------------------------------------------------------------

            const response =
                await accountInventoryApi.setStock(
                    this.state.variantId,
                    targetStock,
                    reason
                );

            console.log(
                '📦 RESPUESTA COMPLETA DE SET STOCK:',
                response
            );

            // --------------------------------------------------------------
            // OBTENER DATA ACTUALIZADA
            // --------------------------------------------------------------

            const data =
                response?.data ?? response;

            console.log(
                '🔄 INVENTARIO DESPUÉS DEL AJUSTE:',
                data
            );

            // --------------------------------------------------------------
            // ACTUALIZAR ESTADO DEL MODAL
            //
            // IMPORTANTE:
            // data contiene:
            //
            // {
            //     inventory: {...},
            //     currentStock,
            //     reservedStock,
            //     availableStock
            // }
            // --------------------------------------------------------------

            if (data?.inventory) {

                this.state.inventory =
                    data;

            }

            // --------------------------------------------------------------
            // SINCRONIZAR CON ACCOUNT INVENTORY MANAGER
            // --------------------------------------------------------------

            if (
                data?.inventory &&
                window.accountInventoryManager
            ) {

                accountInventoryManager.state.inventory =
                    data;

                accountInventoryManager.actualizarInventarioEnTabla(data);

                console.log(
                    '🔄 INVENTARIO DEL MANAGER:',
                    accountInventoryManager.state.inventory
                );

            }

            // --------------------------------------------------------------
            // VOLVER AL RESUMEN
            // --------------------------------------------------------------

            this.state.currentView =
                'summary';

            this.state.movementType =
                null;

            // --------------------------------------------------------------
            // ACTUALIZAR HISTORIAL
            // --------------------------------------------------------------

            await this.cargarMovimientos();

            // --------------------------------------------------------------
            // RENDERIZAR NUEVAMENTE EL RESUMEN
            // --------------------------------------------------------------

            if (
                window.accountInventoryManager &&
                typeof accountInventoryManager.renderInventario === 'function'
            ) {

                console.log(
                    '🎨 RENDERIZANDO CON STOCK:',
                    accountInventoryManager
                        .state
                        .inventory
                        ?.currentStock
                );

                accountInventoryManager.renderInventario();

            }

        } catch (error) {

            console.error(
                '❌ Error guardando ajuste de stock:',
                error
            );

            alert(
                error.message ||
                'No se pudo guardar el ajuste de stock.'
            );

        }

    },

    // ======================================================================
    // ABRIR FORMULARIO DE MOVIMIENTO
    // ======================================================================

    abrirMovimiento(type) {

        const allowedTypes = [
            'ENTRY',
            'RETURN',
            'LOSS'
        ];

        if (!allowedTypes.includes(type)) {
            console.error(
                '❌ Tipo de movimiento no válido:',
                type
            );
            return;
        }

        if (this.state.variantId === null) {
            alert('No hay una variante seleccionada.');
            return;
        }

        this.state.movementType = type;
        this.state.currentView = 'movement';

        this.renderMovimientoForm();
    },

    // ======================================================================
    // RENDERIZAR FORMULARIO DE MOVIMIENTO
    // ======================================================================

    renderMovimientoForm() {

        const container =
            document.getElementById(
                'adminProductDetailContent'
            );

        if (!container) {
            console.warn(
                'No se encontró #adminProductDetailContent'
            );
            return;
        }

        const labels = {
            ENTRY: {
                title: 'Registrar entrada',
                description: 'Registra el ingreso de unidades al inventario.',
                icon: 'fa-arrow-down',
                quantityLabel: 'Cantidad ingresada',
                reasonLabel: 'Motivo de la entrada',
                reasonPlaceholder: 'Ej. Compra de mercadería'
            },

            RETURN: {
                title: 'Registrar devolución',
                description: 'Registra unidades devueltas por un cliente.',
                icon: 'fa-rotate-left',
                quantityLabel: 'Cantidad devuelta',
                reasonLabel: 'Motivo de la devolución',
                reasonPlaceholder: 'Ej. Devolución de cliente'
            },

            LOSS: {
                title: 'Registrar pérdida',
                description: 'Registra una pérdida, daño o merma.',
                icon: 'fa-triangle-exclamation',
                quantityLabel: 'Cantidad perdida',
                reasonLabel: 'Motivo de la pérdida',
                reasonPlaceholder: 'Ej. Producto dañado'
            }
        };

        const config =
            labels[this.state.movementType];

        if (!config) return;

        container.innerHTML = `

        <div class="inventory-form-view">

            <!-- ====================================================== -->
            <!-- CABECERA DEL FORMULARIO                               -->
            <!-- ====================================================== -->

            <div class="inventory-form-header">

                <div class="inventory-section-icon">
                    <i class="fa-solid ${config.icon}"></i>
                </div>

                <div>
                    <h3>
                        ${config.title}
                    </h3>

                    <p>
                        ${config.description}
                    </p>
                </div>

            </div>


            <!-- ====================================================== -->
            <!-- FORMULARIO                                             -->
            <!-- ====================================================== -->

            <div class="inventory-form">

                <div class="inventory-form-group">

                    <label for="inventoryMovementQuantity">
                        ${config.quantityLabel}
                    </label>

                    <input
                        type="number"
                        id="inventoryMovementQuantity"
                        class="form-input"
                        min="1"
                        step="1"
                        placeholder="Ingrese una cantidad"
                    >

                </div>


                <div class="inventory-form-group">

                    <label for="inventoryMovementReason">
                        ${config.reasonLabel}
                    </label>

                    <textarea
                        id="inventoryMovementReason"
                        class="form-input"
                        rows="4"
                        placeholder="${config.reasonPlaceholder}"
                    ></textarea>

                </div>

            </div>


            <!-- ====================================================== -->
            <!-- ACCIONES                                               -->
            <!-- ====================================================== -->

            <div class="inventory-form-actions">

                <button
                    type="button"
                    class="btn-secondary"
                    onclick="
                        accountInventoryMovementsModal.volverResumen()
                    "
                >
                    <i class="fa-solid fa-arrow-left"></i>
                    Atrás
                </button>

                <button
                    type="button"
                    class="btn-primary"
                    onclick="
                        accountInventoryMovementsModal.guardarMovimiento()
                    "
                >
                    <i class="fa-solid fa-floppy-disk"></i>
                    Guardar
                </button>

            </div>

        </div>

    `;
    },


    // ======================================================================
    // RENDERIZAR HISTORIAL DE MOVIMIENTOS
    // ======================================================================

    renderHistorialMovimientos() {

        const movements =
            this.state.filteredMovements !== null
                ? this.state.filteredMovements
                : (this.state.movements || []);

        // ------------------------------------------------------------------
        // SIN MOVIMIENTOS
        // ------------------------------------------------------------------

        if (movements.length === 0) {

            const hayFiltrosAplicados =
                this.state.filteredMovements !== null;

            if (hayFiltrosAplicados) {

                return `
                    <div class="inventory-history">

                        <div class="inventory-history-header">

                            <div class="inventory-history-title">

                                <h3>
                                    Historial de movimientos
                                </h3>

                                <p>
                                    Movimientos registrados para esta variante.
                                </p>

                            </div>

                            <button
                                type="button"
                                class="inventory-history-filter-btn"
                                id="inventoryHistoryFilterBtn"
                                title="Filtrar movimientos"
                            >
                                <i class="fa-solid fa-filter"></i>
                                <span>Filtros</span>
                            </button>

                        </div>

                        <div class="inventory-history-empty">

                            <i class="fa-solid fa-filter-circle-xmark"></i>

                            <span>
                                No se encontraron movimientos con los filtros seleccionados.
                            </span>

                        </div>

                    </div>
                `;
            }


            // ------------------------------------------------------------
            // Realmente no existen movimientos
            // ------------------------------------------------------------

            return `
                <div class="inventory-history">

                    <div class="inventory-history-header">

                        <div class="inventory-history-title">

                            <h3>
                                Historial de movimientos
                            </h3>

                            <p>
                                Movimientos registrados para esta variante.
                            </p>

                        </div>

                    </div>

                    <div class="inventory-history-empty">

                        <i class="fa-solid fa-clock-rotate-left"></i>

                        <span>
                            No hay movimientos registrados.
                        </span>

                    </div>

                </div>
            `;
        }

        // ------------------------------------------------------------------
        // CONFIGURACIÓN DE TIPOS
        // ------------------------------------------------------------------

        const movementLabels = {

            ENTRY: {
                title: 'Entrada',
                icon: 'fa-arrow-down',
                className: 'entry'
            },

            RETURN: {
                title: 'Devolución',
                icon: 'fa-rotate-left',
                className: 'return'
            },

            LOSS: {
                title: 'Pérdida',
                icon: 'fa-triangle-exclamation',
                className: 'loss'
            },

            SALE: {
                title: 'Venta',
                icon: 'fa-cart-shopping',
                className: 'sale'
            },

            ADJUSTMENT: {
                title: 'Ajuste',
                icon: 'fa-arrows-rotate',
                className: 'adjustment'
            }

        };

        // ------------------------------------------------------------------
        // FORMATEAR FECHA
        // ------------------------------------------------------------------

        const formatDate = (date) => {

            if (!date) return '—';

            const parsedDate = new Date(date);

            if (Number.isNaN(parsedDate.getTime())) {
                return '—';
            }

            return parsedDate.toLocaleString('es-PE', {
                dateStyle: 'short',
                timeStyle: 'short'
            });

        };

        // ------------------------------------------------------------------
        // RENDERIZAR MOVIMIENTOS
        // ------------------------------------------------------------------

        const rows = movements.map(movement => {

            const config =
                movementLabels[movement.type] || {
                    label: movement.type || 'Desconocido',
                    icon: 'fa-circle'
                };

            const quantity =
                Number(movement.quantity ?? 0);

            const quantityClass =
                quantity > 0
                    ? 'positive'
                    : quantity < 0
                        ? 'negative'
                        : 'neutral';

            const quantityText =
                quantity > 0
                    ? `+${quantity}`
                    : quantity;

            const createdBy =
                movement.createdBy
                    ? [
                        movement.createdBy.firstName,
                        movement.createdBy.lastName
                    ]
                        .filter(Boolean)
                        .join(' ')
                    : '—';

            return `

            <div class="inventory-history-row">

                <div class="inventory-history-date">
                    ${formatDate(movement.createdAt)}
                </div>


                <div class="inventory-history-type">

                    <span
                        class="inventory-history-type-icon ${config.className}"
                        title="${escapeAttribute(config.title)}"
                        aria-label="${escapeAttribute(config.title)}"
                    >
                        <i class="fa-solid ${config.icon}"></i>
                    </span>

                </div>


                <div class="inventory-history-quantity ${quantityClass}">

                    ${quantityText}

                </div>


                <div class="inventory-history-reason">

                    ${movement.reason || '—'}

                </div>


                <div class="inventory-history-user">

                    ${createdBy}

                </div>

            </div>

        `;

        }).join('');

        // ------------------------------------------------------------------
        // CONTENEDOR DEL HISTORIAL
        // ------------------------------------------------------------------

        return `

            <div class="inventory-history">

                <div class="inventory-history-header">

                    <div class="inventory-history-title">

                        <h3>
                            Historial de movimientos
                        </h3>

                        <p>
                            Movimientos registrados para esta variante.
                        </p>

                    </div>

                    <button
                        type="button"
                        class="inventory-history-filter-btn"
                        id="inventoryHistoryFilterBtn"
                        title="Filtrar movimientos"
                    >
                        <i class="fa-solid fa-filter"></i>
                        <span>Filtros</span>
                    </button>

                </div>


                <div class="inventory-history-table">

                    <div class="inventory-history-table-header">

                        <div>
                            Fecha
                        </div>

                        <div>
                            Tipo
                        </div>

                        <div>
                            Cantidad
                        </div>

                        <div>
                            Motivo
                        </div>

                        <div>
                            Usuario
                        </div>

                    </div>


                    ${rows}

                </div>

            </div>

        `;
    },


    // ================================================================
    // ACTUALIZAR HISTORIAL DE MOVIMIENTOS
    // ================================================================

    actualizarHistorialMovimientos() {

        const currentHistory =
            document.querySelector(
                '#adminProductDetailContent .inventory-history'
            );

        if (!currentHistory) {
            return;
        }


        // ------------------------------------------------------------
        // Generar nuevo historial
        // ------------------------------------------------------------

        const temporaryContainer =
            document.createElement('div');

        temporaryContainer.innerHTML =
            this.renderHistorialMovimientos();


        const newHistory =
            temporaryContainer.firstElementChild;

        if (!newHistory) {
            return;
        }


        // ------------------------------------------------------------
        // Reemplazar solamente el historial
        // ------------------------------------------------------------

        currentHistory.replaceWith(newHistory);


        // ------------------------------------------------------------
        // Reactivar botón de filtros
        // ------------------------------------------------------------

        this.activarBotonFiltros();


        // ------------------------------------------------------------
        // Actualizar estado del botón de filtros
        // ------------------------------------------------------------ 

        this.actualizarEstadoBotonFiltros();

    },


    // ================================================================
    // ACTIVAR BOTON FILTROS
    // ================================================================

    activarBotonFiltros() {

        const button = document.getElementById(
            'inventoryHistoryFilterBtn'
        );

        if (!button) return;

        button.addEventListener('click', () => {

            accountInventoryFilterModal.open({
                data: this.state.movements,

                filters: this.state.filters,

                availableFilters: [
                    'date',
                    'movementType',
                    'user'
                ],

                onApply: filtros => {

                    console.log(
                        '🔎 Filtros recibidos:',
                        filtros
                    );


                    // ------------------------------------------------------------
                    // Guardar filtros seleccionados
                    // ------------------------------------------------------------

                    this.state.filters = filtros;


                    // ------------------------------------------------------------
                    // Aplicar filtros sobre los movimientos originales
                    // ------------------------------------------------------------

                    this.state.filteredMovements =
                        accountInventoryFilters.aplicarFiltros(
                            this.state.movements,
                            this.state.filters
                        );


                    // ------------------------------------------------------------
                    // Actualizar solamente el historial
                    // ------------------------------------------------------------

                    this.actualizarHistorialMovimientos();

                }
            });

        });
    },


    // ======================================================================
    // OBTENER CANTIDAD DE FILTROS ACTIVOS
    // ======================================================================

    obtenerCantidadFiltrosActivos() {

        const filters = this.state.filters || {};

        let cantidad = 0;

        // ================================================================
        // FECHA
        // ================================================================

        const fecha = filters.fecha || {};

        if (fecha.desde) {
            cantidad++;
        }

        // ================================================================
        // TIPO DE MOVIMIENTO
        // ================================================================

        if (
            Array.isArray(filters.tipos) &&
            filters.tipos.length > 0
        ) {
            cantidad++;
        }

        // ================================================================
        // USUARIO
        // ================================================================

        if (
            Array.isArray(filters.usuarios) &&
            filters.usuarios.length > 0
        ) {
            cantidad++;
        }

        return cantidad;
    },


    // ====================================================================
    // ACTUALIZAR ESTADO DEL BOTÓN DE FILTROS
    // ====================================================================

    actualizarEstadoBotonFiltros() {

        const button =
            document.getElementById(
                'inventoryHistoryFilterBtn'
            );

        if (!button) return;

        const cantidad =
            this.obtenerCantidadFiltrosActivos();

        if (cantidad > 0) {

            button.classList.add(
                'inventory-history-filter-btn-active'
            );

            button.innerHTML = `
            <i class="fa-solid fa-filter"></i>
            <span>Filtros (${cantidad})</span>
        `;

        } else {

            button.classList.remove(
                'inventory-history-filter-btn-active'
            );

            button.innerHTML = `
            <i class="fa-solid fa-filter"></i>
            <span>Filtros</span>
        `;
        }
    },


    // ======================================================================
    // VOLVER AL RESUMEN
    // ======================================================================

    volverResumen() {

        this.state.currentView = 'summary';
        this.state.movementType = null;

        if (
            window.accountInventoryManager &&
            typeof accountInventoryManager.renderInventario === 'function'
        ) {
            accountInventoryManager.renderInventario();
        }
    },

    // ======================================================================
    // GUARDAR MOVIMIENTO
    // ======================================================================

    async guardarMovimiento() {

        const quantityInput =
            document.getElementById(
                'inventoryMovementQuantity'
            );

        const reasonInput =
            document.getElementById(
                'inventoryMovementReason'
            );

        if (!quantityInput || !reasonInput) {
            return;
        }

        const quantity =
            Number(quantityInput.value);

        const reason =
            reasonInput.value.trim();

        if (
            !Number.isInteger(quantity) ||
            quantity <= 0
        ) {
            alert(
                'La cantidad debe ser un entero mayor que cero.'
            );
            return;
        }

        if (!reason) {
            alert(
                'Debes indicar el motivo del movimiento.'
            );

            reasonInput.focus();

            return;
        }

        if (
            this.state.variantId === null ||
            !this.state.movementType
        ) {
            alert(
                'No hay una variante o tipo de movimiento seleccionado.'
            );
            return;
        }

        console.log(
            '💾 Guardando movimiento:',
            {
                variantId: this.state.variantId,
                type: this.state.movementType,
                quantity,
                reason
            }
        );

        try {

            const response =
                await accountInventoryApi.createMovement(
                    this.state.variantId,
                    {
                        type: this.state.movementType,
                        quantity,
                        reason
                    }
                );

            console.log(
                '✅ Movimiento guardado correctamente:',
                response
            );

            const data =
                response?.data ?? response;

            // --------------------------------------------------------------
            // ACTUALIZAR INVENTARIO DEL MODAL
            // --------------------------------------------------------------

            if (data?.inventory) {

                this.state.inventory =
                    data.inventory;

            }

            // --------------------------------------------------------------
            // ACTUALIZAR HISTORIAL DE MOVIMIENTOS
            // --------------------------------------------------------------

            if (data?.movement) {

                this.state.movements.unshift(
                    data.movement
                );

            }

            // --------------------------------------------------------------
            // SINCRONIZAR INVENTARIO CON EL MANAGER
            // --------------------------------------------------------------

            if (
                data?.inventory &&
                window.accountInventoryManager
            ) {

                accountInventoryManager.state.inventory =
                    data.inventory;

                // ----------------------------------------------------------
                // ACTUALIZAR TABLA GENERAL DE INVENTARIO
                // ----------------------------------------------------------

                accountInventoryManager.actualizarInventarioEnTabla(
                    data.inventory
                );

            }

            // --------------------------------------------------------------
            // VOLVER AL RESUMEN
            // --------------------------------------------------------------

            this.state.currentView = 'summary';

            this.state.movementType = null;

            if (
                window.accountInventoryManager &&
                typeof accountInventoryManager.renderInventario === 'function'
            ) {

                accountInventoryManager.renderInventario();

            }

        } catch (error) {

            console.error(
                '❌ Error guardando movimiento:',
                error
            );

            alert(
                error.message ||
                'No se pudo guardar el movimiento.'
            );
        }
    },

};

window.accountInventoryMovementsModal =
    accountInventoryMovementsModal;