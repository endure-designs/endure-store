// ==========================================================================
// ACCOUNT INVENTORY FILTER MODAL
// Modal para filtrar movimientos del inventario administrativo
// ==========================================================================

const accountInventoryFilterModal = {

    // ================================================================
    // ESTADO
    // ================================================================

    state: {
        data: [],
        filters: {
            fecha: {
                modo: 'day',
                desde: '',
                hasta: ''
            },
            usuarios: [],
            tipos: []
        },
        availableFilters: [],
        onApply: null
    },


    obtenerUsuarios() {

        const users = new Map();

        this.state.data.forEach(movement => {

            const user = movement?.createdBy;

            if (!user?.id) {
                return;
            }

            const name = [
                user.firstName,
                user.lastName
            ]
                .filter(Boolean)
                .join(' ')
                .trim();

            users.set(Number(user.id), {
                id: Number(user.id),
                name: name || user.email || `Usuario ${user.id}`
            });
        });

        return Array.from(users.values())
            .sort((a, b) =>
                a.name.localeCompare(b.name, 'es')
            );
    },



    obtenerTiposMovimiento() {

        const tipos = new Set();

        this.state.data.forEach(movement => {

            if (movement?.type) {
                tipos.add(movement.type);
            }
        });

        return Array.from(tipos);
    },


    // ================================================================
    // ABRIR MODAL
    // ================================================================

    open({
        data = [],
        filters = {},
        availableFilters = [],
        onApply = null
    } = {}) {

        this.state.data = Array.isArray(data) ? data : [];
        this.state.filters = {
            fecha: {
                modo: filters?.fecha?.modo || 'day',
                desde: filters?.fecha?.desde || '',
                hasta: filters?.fecha?.hasta || ''
            },

            usuarios: Array.isArray(filters?.usuarios)
                ? [...filters.usuarios]
                : [],

            tipos: Array.isArray(filters?.tipos)
                ? [...filters.tipos]
                : []
        };
        this.state.availableFilters = [...availableFilters];
        this.state.onApply = onApply;

        this.render();
        this.attachListeners();
    },


    // ================================================================
    // CERRAR MODAL
    // ================================================================

    close() {

        const modal =
            document.getElementById('accountInventoryFilterModal');

        if (!modal) return;

        modal.hidden = true;
    },


    // ================================================================
    // RENDER PRINCIPAL
    // ================================================================

    render() {

        let modal =
            document.getElementById('accountInventoryFilterModal');

        // ------------------------------------------------------------
        // Crear el modal si todavía no existe
        // ------------------------------------------------------------

        if (!modal) {

            modal = document.createElement('div');

            modal.id = 'accountInventoryFilterModal';
            modal.className = 'admin-modal';
            modal.hidden = true;

            document.body.appendChild(modal);
        }


        // ------------------------------------------------------------
        // Contenido
        // ------------------------------------------------------------

        modal.innerHTML = `

            <div class="admin-modal-backdrop"></div>

            <div
                class="admin-modal-content"
                role="dialog"
                aria-modal="true"
                aria-labelledby="accountInventoryFilterModalTitle"
            >

                <div class="admin-modal-header">

                    <div>

                        <h3 id="accountInventoryFilterModalTitle">
                            Filtrar
                        </h3>

                        <p>
                            Selecciona los criterios que deseas aplicar.
                        </p>

                    </div>

                    <button
                        type="button"
                        class="admin-modal-close"
                        id="accountInventoryFilterModalClose"
                        aria-label="Cerrar"
                    >
                        <i class="fa-solid fa-xmark"></i>
                    </button>

                </div>


                <div
                    class="admin-modal-body"
                    id="accountInventoryFilterModalBody"
                >

                    ${this.renderFilters()}

                </div>


                <div class="admin-modal-footer">

                    <button
                        type="button"
                        class="btn-secondary"
                        id="accountInventoryFilterModalClear"
                    >
                        Limpiar
                    </button>

                    <button
                        type="button"
                        class="btn-primary"
                        id="accountInventoryFilterModalApply"
                    >
                        Aplicar filtros
                    </button>

                </div>

            </div>
        `;

        modal.hidden = false;
    },


    // ================================================================
    // RENDER DE FILTROS
    // ================================================================

    renderFilters() {

        if (!this.state.availableFilters.length) {

            return `
                <div class="inventory-filter-empty">
                    No hay filtros disponibles.
                </div>
            `;
        }

        return this.state.availableFilters
            .map(filter => this.renderFilter(filter))
            .join('');
    },


    // ================================================================
    // RENDER INDIVIDUAL DE FILTRO
    // ================================================================

    renderFilter(filter) {

        switch (filter) {

            case 'date':
                return this.renderDateFilter();

            case 'movementType':
                return this.renderMovementTypeFilter();

            case 'user':
                return this.renderUserFilter();

            default:
                console.warn(
                    `⚠️ Filtro no reconocido: ${filter}`
                );

                return '';
        }
    },


    // ================================================================
    // FILTRO DE FECHA
    // ================================================================

    renderDateFilter() {

        const fecha = this.state.filters.fecha || {};

        const modo = fecha.modo || 'day';

        return `
            <div class="inventory-filter-section">

                <div class="inventory-filter-section-header">

                    <h4>Fecha</h4>

                </div>


                <div class="inventory-filter-date-mode">

                    <label class="inventory-filter-radio">

                        <input
                            type="radio"
                            name="inventoryFilterDateMode"
                            value="day"
                            ${modo === 'day' ? 'checked' : ''}
                        >

                        <span>Un día</span>

                    </label>


                    <label class="inventory-filter-radio">

                        <input
                            type="radio"
                            name="inventoryFilterDateMode"
                            value="range"
                            ${modo === 'range' ? 'checked' : ''}
                        >

                        <span>Rango de fechas</span>

                    </label>

                </div>


                <div
                    class="inventory-filter-date-fields"
                    id="inventoryFilterDateFields"
                >

                    ${modo === 'day'

                ? `

                            <div class="inventory-filter-field">

                                <label for="inventoryFilterDate">
                                    Día
                                </label>

                                <input
                                    type="date"
                                    id="inventoryFilterDate"
                                    value="${fecha.desde || ''}"
                                >

                            </div>

                        `

                : `

                            <div class="inventory-filter-date-range">

                                <div class="inventory-filter-field">

                                    <label for="inventoryFilterDateFrom">
                                        Desde
                                    </label>

                                    <input
                                        type="date"
                                        id="inventoryFilterDateFrom"
                                        value="${fecha.desde || ''}"
                                        max="${fecha.hasta || ''}"
                                    >

                                </div>


                                <div class="inventory-filter-date-range-arrow">

                                    <i class="fa-solid fa-arrow-right"></i>

                                </div>


                                <div class="inventory-filter-field">

                                    <label for="inventoryFilterDateTo">
                                        Hasta
                                    </label>

                                    <input
                                        type="date"
                                        id="inventoryFilterDateTo"
                                        value="${fecha.hasta || ''}"
                                        min="${fecha.desde || ''}"
                                    >

                                </div>

                            </div>

                        `
            }

                </div>

            </div>
        `;
    },


    // ================================================================
    // FILTRO DE TIPO DE MOVIMIENTO
    // ================================================================

    renderMovementTypeFilter() {

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

        const tipos = this.obtenerTiposMovimiento();

        return `
        <div class="inventory-filter-section">

            <div class="inventory-filter-section-header">

                <h4>Tipo de movimiento</h4>

            </div>

            <div class="inventory-filter-options">

                ${tipos.map(type => {

            const config =
                movementLabels[type] || {
                    title: type,
                    icon: 'fa-circle',
                    className: ''
                };

            const checked =
                this.state.filters.tipos.includes(type)
                    ? 'checked'
                    : '';

            return `
                        <label class="inventory-filter-option">

                            <input
                                type="checkbox"
                                class="inventory-filter-movement"
                                value="${type}"
                                ${checked}
                            >

                            <span class="inventory-filter-option-icon ${config.className}">
                                <i class="fa-solid ${config.icon}"></i>
                            </span>

                            <span class="inventory-filter-option-label">
                                ${config.title}
                            </span>

                        </label>
                    `;

        }).join('')}

            </div>

        </div>
    `;
    },


    // ================================================================
    // FILTRO DE USUARIO
    // ================================================================

    renderUserFilter() {

        const users = this.obtenerUsuarios();

        return `
        <div class="inventory-filter-section">

            <div class="inventory-filter-section-header">

                <h4>Usuario</h4>

            </div>

            <div class="inventory-filter-options">

                ${users.length === 0

                ? `
                            <p class="inventory-filter-empty">
                                No hay usuarios disponibles.
                            </p>
                        `

                : users.map(user => {

                    const checked =
                        this.state.filters.usuarios
                            .includes(user.id)
                            ? 'checked'
                            : '';

                    return `
                                <label class="inventory-filter-option">

                                    <input
                                        type="checkbox"
                                        class="inventory-filter-user"
                                        value="${user.id}"
                                        ${checked}
                                    >

                                    <span class="inventory-filter-option-label">
                                        ${user.name}
                                    </span>

                                </label>
                            `;

                }).join('')
            }

            </div>

        </div>
    `;
    },


    // ================================================================
    // LISTENERS
    // ================================================================

    attachListeners() {

        // ================================================================
        // REFERENCIAS A ELEMENTOS DEL MODAL
        // ================================================================

        const closeButton =
            document.getElementById(
                'accountInventoryFilterModalClose'
            );

        const backdrop =
            document.querySelector(
                '#accountInventoryFilterModal .admin-modal-backdrop'
            );

        const clearButton =
            document.getElementById(
                'accountInventoryFilterModalClear'
            );

        const applyButton =
            document.getElementById(
                'accountInventoryFilterModalApply'
            );


        // ================================================================
        // LISTENERS DE LOS FILTROS
        // ================================================================

        // Tipo de movimiento
        // Usuario
        // Fecha
        this.activarListenersFiltros();


        // ================================================================
        // CERRAR MODAL
        // ================================================================

        closeButton?.addEventListener('click', () => {
            this.close();
        });

        backdrop?.addEventListener('click', () => {
            this.close();
        });


        // ================================================================
        // LIMPIAR FILTROS
        // ================================================================

        clearButton?.addEventListener('click', () => {
            this.clearFilters();
        });


        // ================================================================
        // APLICAR FILTROS
        // ================================================================

        applyButton?.addEventListener('click', () => {
            this.applyFilters();
        });
    },



    // ================================================================
    // ACTUALIZAR FILTRO DE FECHA
    // ================================================================

    actualizarFiltroFecha() {

        // ------------------------------------------------------------
        // Buscar la sección de fecha actualmente renderizada
        // ------------------------------------------------------------

        const dateSection =
            document.querySelector(
                '#accountInventoryFilterModal .inventory-filter-section'
            );

        if (!dateSection) {
            return;
        }


        // ------------------------------------------------------------
        // Generar nuevamente solamente la sección de fecha
        // ------------------------------------------------------------

        const temporaryContainer =
            document.createElement('div');

        temporaryContainer.innerHTML =
            this.renderDateFilter();


        const newDateSection =
            temporaryContainer.firstElementChild;

        if (!newDateSection) {
            return;
        }


        // ------------------------------------------------------------
        // Reemplazar la sección anterior
        // ------------------------------------------------------------

        dateSection.replaceWith(newDateSection);


        // ------------------------------------------------------------
        // Volver a conectar los listeners de fecha
        // ------------------------------------------------------------

        this.activarListenersFecha();


        // ------------------------------------------------------------
        // Actualizar los límites del calendario
        // ------------------------------------------------------------

        if (
            this.state.filters.fecha?.modo === 'range'
        ) {

            this.actualizarLimitesFecha();

        }

    },


    // ================================================================
    // LISTENERS DEL FILTRO DE FECHA
    // ================================================================

    activarListenersFecha() {

        // ------------------------------------------------------------
        // MODO: UN DÍA / RANGO
        // ------------------------------------------------------------

        const dateModeInputs =
            document.querySelectorAll(
                '#accountInventoryFilterModal input[name="inventoryFilterDateMode"]'
            );

        dateModeInputs.forEach(input => {

            input.addEventListener('change', event => {

                this.state.filters.fecha.modo =
                    event.target.value;

                this.actualizarFiltroFecha();

            });

        });


        // ------------------------------------------------------------
        // UN SOLO DÍA
        // ------------------------------------------------------------

        const dateInput =
            document.getElementById(
                'inventoryFilterDate'
            );

        if (dateInput) {

            dateInput.addEventListener('change', event => {

                const selectedDate =
                    event.target.value;

                this.state.filters.fecha.desde =
                    selectedDate;

                this.state.filters.fecha.hasta =
                    selectedDate;

            });

        }


        // ------------------------------------------------------------
        // RANGO — DESDE
        // ------------------------------------------------------------

        const dateFromInput =
            document.getElementById(
                'inventoryFilterDateFrom'
            );

        if (dateFromInput) {

            dateFromInput.addEventListener('change', event => {

                const newValue =
                    event.target.value;

                const previousValue =
                    this.state.filters.fecha.desde;

                const hasta =
                    this.state.filters.fecha.hasta;


                // ----------------------------------------------------
                // Validar rango
                // ----------------------------------------------------

                if (hasta && newValue > hasta) {

                    this.marcarFechaInvalida(
                        dateFromInput
                    );

                    event.target.value =
                        previousValue;

                    return;
                }


                // ----------------------------------------------------
                // Guardar valor válido
                // ----------------------------------------------------

                this.state.filters.fecha.desde =
                    newValue;


                // ----------------------------------------------------
                // Actualizar límites
                // ----------------------------------------------------

                this.actualizarLimitesFecha();

            });

        }


        // ------------------------------------------------------------
        // RANGO — HASTA
        // ------------------------------------------------------------

        const dateToInput =
            document.getElementById(
                'inventoryFilterDateTo'
            );

        if (dateToInput) {

            dateToInput.addEventListener('change', event => {

                const newValue =
                    event.target.value;

                const previousValue =
                    this.state.filters.fecha.hasta;

                const desde =
                    this.state.filters.fecha.desde;


                // ----------------------------------------------------
                // Validar rango
                // ----------------------------------------------------

                if (desde && newValue < desde) {

                    this.marcarFechaInvalida(
                        dateToInput
                    );

                    event.target.value =
                        previousValue;

                    return;
                }


                // ----------------------------------------------------
                // Guardar valor válido
                // ----------------------------------------------------

                this.state.filters.fecha.hasta =
                    newValue;


                // ----------------------------------------------------
                // Actualizar límites
                // ----------------------------------------------------

                this.actualizarLimitesFecha();

            });

        }


        // ------------------------------------------------------------
        // Límites iniciales
        // ------------------------------------------------------------

        if (
            this.state.filters.fecha?.modo === 'range'
        ) {

            this.actualizarLimitesFecha();

        }
    },


    marcarFechaInvalida(input) {

        if (!input) return;

        input.classList.add('inventory-filter-input-error');

        setTimeout(() => {

            input.classList.remove(
                'inventory-filter-input-error'
            );

        }, 1000);
    },


    // ================================================================
    // ACTUALIZAR LÍMITES DEL CALENDARIO
    // ================================================================

    actualizarLimitesFecha() {

        const dateFromInput =
            document.getElementById('inventoryFilterDateFrom');

        const dateToInput =
            document.getElementById('inventoryFilterDateTo');

        if (!dateFromInput || !dateToInput) {
            return;
        }

        const desde =
            this.state.filters.fecha.desde || '';

        const hasta =
            this.state.filters.fecha.hasta || '';


        // ------------------------------------------------------------
        // Hasta no puede ser anterior a Desde
        // ------------------------------------------------------------

        dateToInput.min = desde;


        // ------------------------------------------------------------
        // Desde no puede ser posterior a Hasta
        // ------------------------------------------------------------

        dateFromInput.max = hasta;
    },


    // ================================================================
    // LIMPIAR FILTROS
    // ================================================================

    clearFilters() {

        this.state.filters = {
            fecha: {
                modo: 'day',
                desde: '',
                hasta: ''
            },
            usuarios: [],
            tipos: []
        };

        const body =
            document.getElementById(
                'accountInventoryFilterModalBody'
            );

        if (!body) return;

        body.innerHTML = this.renderFilters();

        // Solo listeners de los filtros
        this.activarListenersFiltros();
    },


    // ============================================================================
    // ACTIVAR LISTENERS DE LOS FILTROS
    // (NO incluye botón de aplicar ni cerrar)
    // ============================================================================

    activarListenersFiltros() {

        document
            .querySelectorAll('.inventory-filter-movement')
            .forEach(input => {

                input.addEventListener('change', () => {

                    this.state.filters.tipos =
                        Array.from(
                            document.querySelectorAll(
                                '.inventory-filter-movement:checked'
                            )
                        ).map(input => input.value);
                });
            });

        document
            .querySelectorAll('.inventory-filter-user')
            .forEach(input => {

                input.addEventListener('change', () => {

                    this.state.filters.usuarios =
                        Array.from(
                            document.querySelectorAll(
                                '.inventory-filter-user:checked'
                            )
                        ).map(input => Number(input.value));
                });
            });

        this.activarListenersFecha();
    },



    // ================================================================
    // APLICAR FILTROS
    // ================================================================

    applyFilters() {

        const fecha = this.state.filters.fecha;

        if (
            fecha.modo === 'range' &&
            fecha.desde &&
            fecha.hasta &&
            fecha.desde > fecha.hasta
        ) {

            alert(
                'La fecha inicial no puede ser posterior a la fecha final.'
            );

            return;
        }


        if (typeof this.state.onApply === 'function') {

            this.state.onApply({
                ...this.state.filters
            });
        }

        this.close();
    },



};


// ====================================================================
// EXPONER GLOBALMENTE
// ====================================================================

window.accountInventoryFilterModal =
    accountInventoryFilterModal;