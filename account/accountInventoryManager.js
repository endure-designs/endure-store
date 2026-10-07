// ==========================================================================
// ACCOUNT INVENTORY MANAGER
// Gestión del inventario administrativo
// ==========================================================================

const accountInventoryManager = {

    // ======================================================================
    // ESTADO
    // ======================================================================

    state: {
        inventoryList: [],
        inventory: null,
        selectedVariantId: null,
        selectedVariant: null,
        movements: [],
        loading: false,

        // Control de la vista actual
        currentView: 'products',

        // Evita volver a consultar el inventario
        // cada vez que cambiamos de pestaña
        inventoryLoaded: false
    },


    // ==========================================================================
    // CAMBIAR VISTA: PRODUCTOS / CONTROL DE INVENTARIO
    // ==========================================================================

    async cambiarVista(view) {

        const productsView =
            document.getElementById('adminProductsView');

        const inventoryView =
            document.getElementById('adminInventoryView');

        const tabs =
            document.querySelectorAll('.inventory-view-tab');

        const title =
            document.getElementById('inventoryViewTitle');

        const description =
            document.getElementById('inventoryViewDescription');

        if (!productsView || !inventoryView) {
            console.warn(
                'No se encontraron los contenedores de las vistas de inventario.'
            );
            return;
        }

        // ======================================================================
        // VISTA PRODUCTOS
        // ======================================================================

        if (view === 'products') {

            productsView.style.display = 'block';
            inventoryView.style.display = 'none';

            this.state.currentView = 'products';

            tabs.forEach(tab => {

                tab.classList.toggle(
                    'active',
                    tab.dataset.inventoryView === 'products'
                );

            });

            if (title) {
                title.textContent =
                    'Productos Registrados';
            }

            if (description) {
                description.textContent =
                    'Gestiona el catálogo, actualiza precios, controla stock y edita prendas cargadas.';
            }

            return;
        }

        // ======================================================================
        // VISTA CONTROL DE INVENTARIO
        // ======================================================================

        if (view === 'inventory') {

            productsView.style.display = 'none';
            inventoryView.style.display = 'block';

            this.state.currentView = 'inventory';

            tabs.forEach(tab => {

                tab.classList.toggle(
                    'active',
                    tab.dataset.inventoryView === 'inventory'
                );

            });

            // --------------------------------------------------------------
            // Cargar únicamente la primera vez
            // --------------------------------------------------------------

            if (!this.state.inventoryLoaded) {

                await this.cargarInventario();

                this.state.inventoryLoaded = true;
            }

            return;
        }

        console.warn(
            'Vista de inventario no reconocida:',
            view
        );
    },


    // ==========================================================================
    // EVENTOS DEL SELECTOR DE VISTAS
    // ==========================================================================

    attachViewListeners() {

        const tabs =
            document.querySelectorAll('.inventory-view-tab');

        if (!tabs.length) {
            console.warn(
                'No se encontraron botones de vista de inventario.'
            );
            return;
        }

        tabs.forEach(tab => {

            tab.addEventListener('click', () => {

                const view =
                    tab.dataset.inventoryView;

                this.cambiarVista(view);

            });

        });

    },


    // ==========================================================================
    // CARGAR LISTADO COMPLETO DE INVENTARIO
    // ==========================================================================

    async cargarInventario() {

        this.state.loading = true;

        try {

            const response =
                await accountInventoryApi.getInventory();

            const inventory =
                response?.data ?? response;

            if (!Array.isArray(inventory)) {
                throw new Error(
                    'La respuesta del inventario no tiene un formato válido.'
                );
            }

            this.state.inventoryList = inventory;

            this.renderTablaInventario();

            return true;

        } catch (error) {

            console.error(
                '❌ Error cargando listado de inventario:',
                error
            );

            const container =
                document.getElementById(
                    'adminInventoryTableContainer'
                );

            if (container) {
                container.innerHTML = `
                <div class="inventory-error-state">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <p>
                        No se pudo cargar el inventario.
                    </p>
                </div>
            `;
            }

            alert(
                error.message ||
                'No se pudo cargar el inventario.'
            );

            return false;

        } finally {

            this.state.loading = false;
        }
    },


    // ==========================================================================
    // RENDERIZAR TABLA GENERAL DE INVENTARIO
    // ==========================================================================

    renderTablaInventario() {

        const container =
            document.getElementById(
                'adminInventoryTableContainer'
            );

        if (!container) {
            console.warn(
                'No se encontró #adminInventoryTableContainer'
            );
            return;
        }

        const inventoryList =
            this.state.inventoryList || [];

        // ----------------------------------------------------------------------
        // SIN INVENTARIO
        // ----------------------------------------------------------------------

        if (!inventoryList.length) {

            container.innerHTML = `
            <div class="inventory-empty-state">
                <i class="fa-solid fa-box-open"></i>
                <p>
                    No hay variantes disponibles en el inventario.
                </p>
            </div>
        `;

            return;
        }

        // ----------------------------------------------------------------------
        // AGRUPAR VARIANTES POR PRODUCTO
        // ----------------------------------------------------------------------

        const productsMap = new Map();

        inventoryList.forEach(variant => {

            if (!productsMap.has(variant.productId)) {

                productsMap.set(
                    variant.productId,
                    {
                        productId: variant.productId,
                        productName: variant.productName,
                        productImage: variant.productImage,
                        variants: []
                    }
                );
            }

            productsMap
                .get(variant.productId)
                .variants
                .push(variant);
        });

        // ----------------------------------------------------------------------
        // CONSTRUIR TABLA
        // ----------------------------------------------------------------------

        let rowsHtml = '';

        productsMap.forEach(product => {

            const variants =
                product.variants;

            variants.forEach(
                (variant, index) => {

                    rowsHtml +=
                        this.renderFilaInventario(
                            variant,
                            product,
                            index === 0,
                            variants.length
                        );
                }
            );
        });

        container.innerHTML = `

        <div class="inventory-table-wrapper">

            <table class="inventory-table">

                <thead>

                    <tr>

                        <th>Producto</th>

                        <th>Variante</th>

                        <th>SKU</th>

                        <th>Precio</th>

                        <th>Stock</th>

                        <th>Reservado</th>

                        <th>Disponible</th>

                        <th>Estado</th>

                    </tr>

                </thead>

                <tbody>
                    ${rowsHtml}
                </tbody>

            </table>

        </div>
    `;

        this.attachInventoryTableListeners();
    },




    // ==========================================================================
    // RENDERIZAR FILA DE UNA VARIANTE
    // ==========================================================================

    renderFilaInventario(
        variant,
        product,
        isFirstVariant,
        variantCount
    ) {

        const inventory =
            variant.inventory || {};

        const stock =
            Number(inventory.stock ?? 0);

        const reservedStock =
            Number(inventory.reservedStock ?? 0);

        const availableStock =
            Number(inventory.availableStock ?? 0);

        // ----------------------------------------------------------------------
        // DETERMINAR ESTADO
        // ----------------------------------------------------------------------

        let estado;
        let estadoClass;

        if (availableStock <= 0) {

            if (inventory.allowBackorder) {
                estado = 'Backorder';
                estadoClass = 'inventory-status-backorder';
            } else {
                estado = 'Sin stock';
                estadoClass = 'inventory-status-out';
            }

        } else if (
            inventory.minimumStock !== null &&
            availableStock <=
            Number(inventory.minimumStock)
        ) {

            estado = 'Stock bajo';
            estadoClass = 'inventory-status-low';

        } else {

            estado = 'Disponible';
            estadoClass = 'inventory-status-ok';
        }

        // ----------------------------------------------------------------------
        // ATRIBUTOS DE LA VARIANTE
        // ----------------------------------------------------------------------

        const variantName =
            Array.isArray(variant.attributes) &&
                variant.attributes.length

                ? variant.attributes
                    .map(attribute => {

                        return `
                        <span class="inventory-attribute-chip">

                            <strong>
                                ${escapeHtml(
                            attribute.attributeName
                        )}:
                            </strong>

                            ${escapeHtml(
                            attribute.value
                        )}

                        </span>
                    `;
                    })
                    .join('')

                : `
                <span class="inventory-attribute-chip">
                    Variante única
                </span>
            `;

        // ----------------------------------------------------------------------
        // PRECIO
        // ----------------------------------------------------------------------

        const price =
            Number(variant.price ?? 0)
                .toFixed(2);

        const compareAtPrice =
            variant.compareAtPrice !== null &&
                variant.compareAtPrice !== undefined
                ? Number(
                    variant.compareAtPrice
                ).toFixed(2)
                : null;

        const priceHtml =
            compareAtPrice !== null &&
                Number(compareAtPrice) >
                Number(price)

                ? `
                <div class="inventory-price">

                    <strong>
                        S/ ${price}
                    </strong>

                    <del>
                        S/ ${compareAtPrice}
                    </del>

                </div>
            `

                : `
                <strong>
                    S/ ${price}
                </strong>
            `;

        // ----------------------------------------------------------------------
        // PRODUCTO
        // ----------------------------------------------------------------------

        const productHtml =
            isFirstVariant

                ? `
                <td
                    class="inventory-product-cell"
                    rowspan="${variantCount}"
                >

                    <div class="inventory-product">

                        ${product.productImage

                    ? `
                                    <img
                                        src="${escapeAttribute(
                        product.productImage
                    )}"
                                        alt="${escapeAttribute(
                        product.productName
                    )}"
                                        class="inventory-product-image"
                                    >
                                `

                    : `
                                    <div class="inventory-product-image-placeholder">
                                        <i class="fa-solid fa-image"></i>
                                    </div>
                                `
                }

                        <div class="inventory-product-info">

                            <strong>
                                ${escapeHtml(
                    product.productName
                )}
                            </strong>

                        </div>

                    </div>

                </td>
            `

                : '';

        // ----------------------------------------------------------------------
        // FILA
        // ----------------------------------------------------------------------

        return `

        <tr
            class="inventory-variant-row ${estadoClass}"
            data-variant-id="${variant.productVariantId}"
            title="Abrir control de inventario"
        >

            ${productHtml}

            <td class="inventory-variant-cell">

                <div class="inventory-variant">

                    ${variantName}

                </div>

            </td>

            <td class="inventory-sku-cell">

                ${escapeHtml(
            variant.sku || ''
        )}

            </td>

            <td class="inventory-price-cell">

                ${priceHtml}

            </td>

            <td class="inventory-stock-cell">

                <strong>
                    ${stock}
                </strong>

            </td>

            <td class="inventory-reserved-cell">

                ${reservedStock}

            </td>

            <td class="inventory-available-cell">

                <strong>
                    ${availableStock}
                </strong>

            </td>

            <td class="inventory-status-cell">

                <span
                    class="inventory-status ${estadoClass}"
                >
                    ${estado}
                </span>

            </td>

        </tr>
    `;
    },


    // ==========================================================================
    // EVENTOS DE LA TABLA DE INVENTARIO
    // ==========================================================================

    attachInventoryTableListeners() {

        const container =
            document.getElementById(
                'adminInventoryTableContainer'
            );

        if (!container) return;

        container
            .querySelectorAll(
                '.inventory-variant-row'
            )
            .forEach(row => {

                row.addEventListener(
                    'click',
                    event => {

                        // ------------------------------------------------------
                        // CELDA DEL PRODUCTO
                        // ------------------------------------------------------
                        // Esta celda utiliza rowspan y pertenece técnicamente
                        // a la primera fila del producto.
                        //
                        // Por eso debemos impedir que su click llegue a la
                        // lógica de apertura de la variante.
                        // ------------------------------------------------------

                        if (
                            event.target.closest(
                                '.inventory-product-cell'
                            )
                        ) {
                            return;
                        }

                        // ------------------------------------------------------
                        // VARIANTE
                        // ------------------------------------------------------

                        const variantId =
                            Number(
                                row.dataset.variantId
                            );

                        if (!variantId) return;

                        this.abrirInventario(
                            variantId
                        );

                    }
                );

            });

    },



    // ======================================================================
    // ABRIR INVENTARIO DE UNA VARIANTE
    // ======================================================================

    async abrirInventario(variantId) {

        if (!variantId) {
            console.error("No se recibió un variantId válido.");
            return;
        }

        this.state.selectedVariantId = Number(variantId);

        const variant =
            this.state.inventoryList?.find(
                item =>
                    Number(item.productVariantId) ===
                    this.state.selectedVariantId
            );

        this.state.selectedVariant = variant || null;

        this.state.loading = true;

        try {

            const response =
                await accountInventoryApi.getStock(
                    this.state.selectedVariantId
                );

            const inventory =
                response?.data ?? response;

            if (!inventory) {
                throw new Error(
                    "No se recibió información del inventario."
                );
            }



            this.state.inventory = inventory;

            accountInventoryMovementsModal.setVariantData({
                variantId: this.state.selectedVariantId,
                variant: this.state.selectedVariant,
                inventory: this.state.inventory
            });



            // ==============================================================
            // CARGAR HISTORIAL DE MOVIMIENTOS
            // ==============================================================

            await accountInventoryMovementsModal.cargarMovimientos();

            // ==============================================================
            // CAMBIAR ENCABEZADO DEL MODAL
            // ==============================================================

            const title =
                document.getElementById(
                    "adminProductDetailModalTitle"
                );

            const description =
                document.getElementById(
                    "adminProductDetailModalDescription"
                );

            if (title) {
                title.textContent = "Control de inventario";
            }

            if (description) {
                description.textContent =
                    "Gestiona el stock y los movimientos de esta variante.";
            }

            // ==============================================================
            // RENDERIZAR INVENTARIO
            // ==============================================================

            this.renderInventario();

            // ==============================================================
            // ABRIR MODAL
            // ==============================================================

            const modal =
                document.getElementById(
                    "adminProductDetailModal"
                );

            if (modal) {
                modal.hidden = false;
                modal.style.display = "flex";
            }

        } catch (error) {

            console.error(
                "❌ Error cargando inventario:",
                error
            );

            alert(
                error.message ||
                "No se pudo cargar el inventario."
            );

        } finally {

            this.state.loading = false;

        }
    },

    // ==========================================================================
    // RENDERIZAR INVENTARIO
    // ==========================================================================

    renderInventario() {

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

        const inventory =
            this.state.inventory;

        const variant =
            this.state.selectedVariant;

        const productName =
            variant?.productName || 'Producto';

        const attributes =
            Array.isArray(variant?.attributes)
                ? variant.attributes
                : [];

        if (!inventory) {

            container.innerHTML = `
            <div class="inventory-empty-state">
                <i class="fa-solid fa-box-open"></i>

                <p>
                    No hay información de inventario.
                </p>
            </div>
        `;

            return;
        }

        // ----------------------------------------------------------------------
        // DATOS DEL INVENTARIO
        // ----------------------------------------------------------------------

        const stock =
            Number(
                inventory.currentStock ?? 0
            );

        const reservedStock =
            Number(
                inventory.reservedStock ?? 0
            );

        const availableStock =
            Number(
                inventory.availableStock ?? 0
            );

        const minimumStock =
            Number(
                inventory.inventory?.minimumStock ??
                inventory.minimumStock ??
                0
            );

        const maximumStock =
            inventory.inventory?.maximumStock ??
            inventory.maximumStock ??
            null;

        const allowBackorder =
            inventory.inventory?.allowBackorder ??
            inventory.allowBackorder ??
            false;


        console.log("🧪 VARIANTE PARA RENDER:", {
            productName,
            attributes
        });

        // ----------------------------------------------------------------------
        // RENDERIZADO
        // ----------------------------------------------------------------------

        container.innerHTML = `

            <div class="inventory-detail">

                <!-- ========================================================== -->
                <!-- RESUMEN                                                     -->
                <!-- ========================================================== -->

                <div class="inventory-variant-header">

                    <h3 class="inventory-variant-name">
                        ${escapeHtml(productName)}
                    </h3>

                    <div class="inventory-variant-tags">

                        ${attributes.length
                ? attributes.map(attribute => `
                        <span
                            class="inventory-variant-tag"
                            title="${escapeAttribute(attribute.attributeName)}"
                        >
                            ${escapeHtml(attribute.value)}
                        </span>
                    `).join('')
                : ''
            }

                    </div>

                </div>

                <section class="inventory-detail-section">

                    <div class="inventory-detail-section-header">

                        <div class="inventory-detail-section-icon">
                            <i class="fa-solid fa-boxes-stacked"></i>
                        </div>

                        <div>

                            <h4>
                                Estado del inventario
                            </h4>

                            <p>
                                Existencias actuales de esta variante.
                            </p>

                        </div>

                    </div>


                    <div class="inventory-detail-stats">

                        <!-- STOCK ACTUAL -->
                        <div class="inventory-detail-stat">

                            <span>
                                <i class="fa-solid fa-box"></i>
                                Stock actual
                            </span>

                            <strong>
                                ${stock}
                            </strong>

                        </div>


                        <!-- RESERVADO -->
                        <div class="inventory-detail-stat">

                            <span>
                                <i class="fa-solid fa-lock"></i>
                                Reservado
                            </span>

                            <strong>
                                ${reservedStock}
                            </strong>

                        </div>


                        <!-- DISPONIBLE -->
                        <div class="inventory-detail-stat inventory-detail-stat-available">

                            <span>
                                <i class="fa-solid fa-circle-check"></i>
                                Disponible
                            </span>

                            <strong>
                                ${availableStock}
                            </strong>

                        </div>

                    </div>

                </section>


                <!-- ========================================================== -->
                <!-- CONFIGURACIÓN                                               -->
                <!-- ========================================================== -->

                <section class="inventory-detail-section">

                    <div class="inventory-detail-section-header">

                        <div class="inventory-detail-section-icon">
                            <i class="fa-solid fa-sliders"></i>
                        </div>

                        <div>

                            <h4>
                                Configuración
                            </h4>

                            <p>
                                Parámetros de control de esta variante.
                            </p>

                        </div>

                    </div>


                    <div class="inventory-detail-config">

                        <!-- STOCK MÍNIMO -->
                        <div class="inventory-detail-config-item">

                            <span>
                                Stock mínimo
                            </span>

                            <strong>
                                ${minimumStock}
                            </strong>

                        </div>


                        <!-- STOCK MÁXIMO -->
                        <div class="inventory-detail-config-item">

                            <span>
                                Stock máximo
                            </span>

                            <strong>
                                ${maximumStock === null
                ? 'Sin límite'
                : maximumStock
            }
                            </strong>

                        </div>


                        <!-- BACKORDER -->
                        <div class="inventory-detail-config-item">

                            <span>
                                Venta sin stock
                            </span>

                            <strong
                                class="${allowBackorder
                ? 'inventory-detail-positive'
                : 'inventory-detail-negative'
            }"
                            >
                                ${allowBackorder
                ? 'Permitida'
                : 'No permitida'
            }
                            </strong>

                        </div>

                    </div>

                </section>


                <!-- ========================================================== -->
                <!-- AJUSTE DE STOCK                                             -->
                <!-- ========================================================== -->

                <section class="inventory-detail-section">

                    <div class="inventory-detail-section-header">

                        <div class="inventory-detail-section-icon">
                            <i class="fa-solid fa-arrows-rotate"></i>
                        </div>

                        <div>

                            <h4>
                                Ajuste de stock
                            </h4>

                            <p>
                                Corrige el stock físico mediante un ajuste.
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        class="inventory-detail-action inventory-detail-action-primary"
                        onclick="
                            accountInventoryMovementsModal.abrirAjusteStock()
                        "
                    >

                        <i class="fa-solid fa-arrows-rotate"></i>

                        Ajustar stock

                    </button>

                </section>


                <!-- ========================================================== -->
                <!-- MOVIMIENTOS                                                  -->
                <!-- ========================================================== -->

                <section class="inventory-detail-section">

                    <div class="inventory-detail-section-header">

                        <div class="inventory-detail-section-icon">
                            <i class="fa-solid fa-clock-rotate-left"></i>
                        </div>

                        <div>

                            <h4>
                                Registrar movimiento
                            </h4>

                            <p>
                                Registra una entrada, devolución o pérdida.
                            </p>

                        </div>

                    </div>


                    <div class="inventory-detail-actions">

                        <!-- ENTRADA -->
                        <button
                            type="button"
                            class="inventory-detail-action"
                            onclick="
                                accountInventoryMovementsModal.abrirMovimiento('ENTRY')
                            "
                        >

                            <i class="fa-solid fa-arrow-down"></i>

                            Registrar entrada

                        </button>


                        <!-- DEVOLUCIÓN -->
                        <button
                            type="button"
                            class="inventory-detail-action"
                            onclick="
                                accountInventoryMovementsModal.abrirMovimiento('RETURN')
                            "
                        >

                            <i class="fa-solid fa-rotate-left"></i>

                            Registrar devolución

                        </button>


                        <!-- PÉRDIDA -->
                        <button
                            type="button"
                            class="inventory-detail-action inventory-detail-action-danger"
                            onclick="
                                accountInventoryMovementsModal.abrirMovimiento('LOSS')
                            "
                        >

                            <i class="fa-solid fa-triangle-exclamation"></i>

                            Registrar pérdida

                        </button>

                    </div>

                </section>

                <!-- ========================================================== -->
                <!-- HISTORIAL DE MOVIMIENTOS                                   -->
                <!-- ========================================================== -->

                ${accountInventoryMovementsModal.renderHistorialMovimientos()}

            </div>

        `;

        this.activarArrastreHistorial();

        accountInventoryMovementsModal.activarBotonFiltros();
    },


    // ======================================================================
    // ACTIVAR ARRASTRE HORIZONTAL DEL HISTORIAL
    // ======================================================================

    activarArrastreHistorial() {

        const table =
            document.querySelector(
                '.inventory-history-table'
            );

        if (!table) return;

        let isDragging = false;
        let startX = 0;
        let startScrollLeft = 0;

        table.addEventListener('mousedown', (event) => {

            isDragging = true;

            startX = event.pageX;

            startScrollLeft = table.scrollLeft;

            table.classList.add('is-dragging');

        });

        table.addEventListener('mousemove', (event) => {

            if (!isDragging) return;

            event.preventDefault();

            const distance =
                event.pageX - startX;

            table.scrollLeft =
                startScrollLeft - distance;

        });

        table.addEventListener('mouseup', () => {

            isDragging = false;

            table.classList.remove('is-dragging');

        });

        table.addEventListener('mouseleave', () => {

            isDragging = false;

            table.classList.remove('is-dragging');

        });
    },


    // ======================================================================
    // ACTUALIZAR INVENTARIO DE UNA VARIANTE EN LA TABLA
    // ======================================================================

    actualizarInventarioEnTabla(inventoryData) {

        if (!inventoryData) {
            return;
        }

        const variantId =
            Number(inventoryData.inventory?.productVariantId);

        if (!variantId) {
            console.warn(
                '⚠️ No se pudo determinar el productVariantId para actualizar la tabla.'
            );
            return;
        }

        const variant =
            this.state.inventoryList?.find(
                item =>
                    Number(item.productVariantId) === variantId
            );

        if (!variant) {
            console.warn(
                `⚠️ No se encontró la variante ${variantId} en inventoryList.`
            );
            return;
        }

        // --------------------------------------------------------------
        // Actualizar solamente los datos de inventario
        // --------------------------------------------------------------

        variant.inventory = {
            ...(variant.inventory || {}),
            stock: Number(
                inventoryData.currentStock ?? 0
            ),
            reservedStock: Number(
                inventoryData.reservedStock ?? 0
            ),
            availableStock: Number(
                inventoryData.availableStock ?? 0
            ),
            minimumStock:
                inventoryData.inventory?.minimumStock ??
                variant.inventory?.minimumStock ??
                null,
            maximumStock:
                inventoryData.inventory?.maximumStock ??
                variant.inventory?.maximumStock ??
                null,
            allowBackorder:
                inventoryData.inventory?.allowBackorder ??
                variant.inventory?.allowBackorder ??
                false
        };

        // --------------------------------------------------------------
        // Volver a renderizar la tabla
        // --------------------------------------------------------------

        this.renderTablaInventario();
    },



    // ==========================================================================
    // INICIALIZAR ACCOUNT INVENTORY MANAGER
    // ==========================================================================

    async init() {

        console.log(
            '🚀 Inicializando accountInventoryManager...'
        );

        // ----------------------------------------------------------------------
        // Inicializar botones de cambio de vista
        // ----------------------------------------------------------------------

        this.attachViewListeners();

        // ----------------------------------------------------------------------
        // Iniciar mostrando Productos
        // ----------------------------------------------------------------------

        await this.cambiarVista('products');

    }

};


// ==========================================================================
// EXPONER MÓDULO
// ==========================================================================

window.accountInventoryManager =
    accountInventoryManager;