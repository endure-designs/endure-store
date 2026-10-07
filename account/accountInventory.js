// ==========================================================================
// ACCOUNT INVENTORY — Tabla de inventario administrativo, paginación, etc.
// ==========================================================================

const adminInventoryState = {
    page: 1,
    limit: 10,
    search: '',
    typingTimeout: null
};

// ==========================================================================
// CARGAR PRODUCTOS INVENTARIO
// ==========================================================================

async function cargarProductosInventario(page = null, search = null) {

    if (page !== null) adminInventoryState.page = page;
    if (search !== null) adminInventoryState.search = search;

    const container = document.getElementById('adminProductsTableContainer');
    if (!container) return;

    container.innerHTML = `
        <div style="padding: 40px; text-align: center; color: var(--text-muted);">
            <i class="fa-solid fa-spinner fa-spin"
               style="font-size: 32px; margin-bottom: 10px; color: var(--royal-blue);"></i>
            <p>Cargando inventario...</p>
        </div>
    `;

    try {

        const response = await accountProductApi.getProducts({
            page: adminInventoryState.page,
            limit: adminInventoryState.limit,
            search: adminInventoryState.search
        });

        console.log(
            '🏷️ TAGS DEL PRIMER PRODUCTO:',
            response.data.items?.[0]?.tags
        );

        console.log(
            '📦 PRIMER PRODUCTO COMPLETO:',
            response.data.items?.[0]
        );

        renderAdminProductsTable(response.data.items);
        renderInventoryPagination(response.data.pagination);

    } catch (error) {

        console.error('❌ Error al cargar productos del inventario:', error);

        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: var(--text-muted);">
                <i class="fa-solid fa-triangle-exclamation"
                   style="font-size: 32px; margin-bottom: 10px; color: #ef4444;"></i>
                <p>Ocurrió un error al cargar el inventario.</p>
                <button class="btn-secondary"
                        style="margin-top: 15px;"
                        onclick="cargarProductosInventario()">
                    Reintentar
                </button>
            </div>
        `;
    }
}


// ==========================================================================
// RENDERIZAR TABLA DE PRODUCTOS
// ==========================================================================

function renderAdminProductsTable(products) {

    const container =
        document.getElementById(
            'adminProductsTableContainer'
        );

    if (!container) return;

    // ----------------------------------------------------------------------
    // SIN PRODUCTOS
    // ----------------------------------------------------------------------

    if (
        !products ||
        products.length === 0
    ) {
        container.innerHTML = `
            <div
                style="
                    padding: 40px;
                    text-align: center;
                    color: var(--text-muted);
                "
            >
                <i
                    class="fa-solid fa-box-open"
                    style="
                        font-size: 32px;
                        margin-bottom: 10px;
                        color: var(--quicksand);
                    "
                ></i>

                <p>No se encontraron productos.</p>
            </div>
        `;

        return;
    }

    // ----------------------------------------------------------------------
    // TABLA
    // ----------------------------------------------------------------------

    let html = `
        <table class="inventory-table">

            <thead>
                <tr>

                    <th style="width: 60px;">
                        Imagen
                    </th>

                    <th>
                        Producto
                    </th>

                    <th>
                        Categorización
                    </th>

                    <th>
                        Variantes
                    </th>

                    <th>
                        Precio (S/)
                    </th>

                    <th>
                        Inventario
                    </th>

                    <th style="width: 55px;">
                        Acciones
                    </th>

                </tr>
            </thead>

            <tbody>
    `;

    // ======================================================================
    // PRODUCTOS
    // ======================================================================

    products.forEach(p => {

        // ==================================================================
        // IMAGEN
        // ==================================================================

        let imgPath =
            CONFIG.DEFAULT_PRODUCT_IMAGE;

        if (
            Array.isArray(p.media) &&
            p.media.length > 0
        ) {

            const primary =
                p.media.find(
                    m => m.isPrimary === true
                ) ||
                p.media[0];

            imgPath =
                primary.storageKey ||
                primary.url ||
                imgPath;

        } else if (p.image) {

            imgPath = p.image;
        }

        // ==================================================================
        // VARIANTES
        // ==================================================================

        const variants =
            Array.isArray(p.variants)
                ? p.variants
                : [];


        // ==================================================================
        // PRECIO
        // ==================================================================

        let priceDisplay = '-';

        if (variants.length > 0) {

            const prices =
                variants
                    .map(v => Number(v.price))
                    .filter(
                        price =>
                            Number.isFinite(price)
                    );

            if (prices.length > 0) {

                const minPrice =
                    Math.min(...prices);

                const maxPrice =
                    Math.max(...prices);

                // ----------------------------------------------------------
                // TODOS LOS PRECIOS SON IGUALES
                // ----------------------------------------------------------
                if (minPrice === maxPrice) {

                    priceDisplay = `
                        <span class="price-single">
                            S/ ${minPrice.toFixed(2)}
                        </span>
                    `;

                }
                // ----------------------------------------------------------
                // EXISTE UN RANGO
                // ----------------------------------------------------------
                else {

                    priceDisplay = `
                        <span class="price-range">
                            <span>S/ ${minPrice.toFixed(2)}</span>
                            <span>S/ ${maxPrice.toFixed(2)}</span>
                        </span>
                    `;

                }
            }

        } else if (
            p.price !== undefined &&
            p.price !== null &&
            p.price !== ''
        ) {

            const price =
                Number(p.price);

            if (Number.isFinite(price)) {

                priceDisplay =
                    `S/ ${price.toFixed(2)}`;
            }
        }

        // ==================================================================
        // INVENTARIO
        // ==================================================================

        const inv =
            p.inventory || {};

        const stockTotal =
            Number(
                inv.stock ?? 0
            );

        const stockDisponible =
            Number(
                inv.availableStock ??
                stockTotal
            );

        const stockClass =
            stockDisponible <= 5
                ? 'stock-low'
                : 'stock-high';

        // ==================================================================
        // CATEGORIZACIÓN
        // ==================================================================

        const type =
            p.productType?.name ||
            '-';

        const cat =
            p.category?.name ||
            p.taxonomy?.category?.name ||
            '-';

        const theme =
            p.theme?.name ||
            p.taxonomy?.theme?.name ||
            '-';

        const sub =
            p.subtheme?.name ||
            p.taxonomy?.subtheme?.name ||
            '-';

        // ==================================================================
        // ETIQUETAS
        // ==================================================================

        const tags =
            Array.isArray(p.tags)
                ? p.tags
                : [];

        const hasOffer =
            tags.some(esEtiquetaOferta);

        const tagNames =
            tags
                .map(tag => {

                    if (
                        tag &&
                        typeof tag === 'object'
                    ) {
                        return tag.name;
                    }

                    return tag;
                })
                .filter(Boolean)
                .slice(0, 2);

        // ------------------------------------------------------------------
        // HTML DE ETIQUETAS
        // ------------------------------------------------------------------

        let tagsHtml = '';

        if (tagNames.length > 0) {

            tagsHtml =
                tagNames
                    .map(tagName => `
                        <span
                            class="badge-pill badge-tag"
                        >
                            <i class="fa-solid fa-tag"></i>
                            ${escapeHtml(tagName)}
                        </span>
                    `)
                    .join('');

        } else {

            tagsHtml = `
                <span
                    style="
                        color: var(--text-muted);
                        font-size: 0.75rem;
                    "
                >
                    -
                </span>
            `;
        }

        // ==================================================================
        // FILA
        // ==================================================================

        html += `

            <tr
                class="admin-product-row ${hasOffer ? 'product-offer-row' : ''}"
                data-product-id="${escapeHtml(p.id)}"
            >

                <!-- ====================================================== -->
                <!-- IMAGEN -->
                <!-- ====================================================== -->

                <td>

                    <img
                        src="${imgPath}"
                        alt="${escapeHtml(p.name)}"
                        class="product-thumb"
                        onerror="
                            this.onerror=null;
                            this.src='${CONFIG.DEFAULT_PRODUCT_IMAGE}'
                        "
                    >

                </td>


                <!-- ====================================================== -->
                <!-- PRODUCTO + DESCRIPCIÓN -->
                <!-- ====================================================== -->

                <td>
                    <div
                        style="
                            font-weight:700;
                            color:var(--royal-blue);
                            margin-bottom:4px;
                        "
                    >
                        ${escapeHtml(p.name || 'Producto sin nombre')}
                    </div>

                    <div
                        style="
                            color:var(--text-muted);
                            font-size:0.78rem;
                            line-height:1.4;
                        "
                    >
                        ${escapeHtml(
            p.description ||
            p.design?.description ||
            'Sin descripción'
        )}
                    </div>
                </td>


                <!-- ====================================================== -->
                <!-- CATEGORIZACIÓN -->
                <!-- ====================================================== -->

                <td>

                    <div
                        class="cat-badge-stack"
                        style="
                            display: flex;
                            flex-direction: column;
                            align-items: stretch;
                            gap: 0;
                        "
                    >

                        <!-- ============================================== -->
                        <!-- BLOQUE 1: TIPO + CATEGORÍA -->
                        <!-- ============================================== -->

                        <div
                            style="
                                display: flex;
                                flex-direction: column;
                                align-items: flex-start;
                                gap: 3px;
                                padding-bottom: 6px;
                                margin-bottom: 5px;
                                border-bottom: 1px solid #e2e8f0;
                            "
                        >

                            <span
                                class="badge-pill"
                                style="
                                    background: #f1f5f9;
                                    color: #475569;
                                    font-size: 0.75rem;
                                "
                            >
                                <i class="fa-solid fa-box"></i>
                                ${escapeHtml(type)}
                            </span>

                            <span
                                class="badge-pill badge-cat"
                            >
                                <i class="fa-solid fa-folder"></i>
                                ${escapeHtml(cat)}
                            </span>

                        </div>


                        <!-- ============================================== -->
                        <!-- BLOQUE 2: TEMA + SUBTEMA -->
                        <!-- ============================================== -->

                        <div
                            style="
                                display: flex;
                                flex-direction: column;
                                align-items: flex-start;
                                gap: 3px;
                                padding-bottom: 6px;
                                margin-bottom: 5px;
                                border-bottom: 1px solid #e2e8f0;
                            "
                        >

                            <span
                                class="badge-pill badge-theme"
                            >
                                <i class="fa-solid fa-layer-group"></i>
                                ${escapeHtml(theme)}
                            </span>

                            <span
                                class="badge-pill badge-subtheme"
                            >
                                <i class="fa-solid fa-tag"></i>
                                ${escapeHtml(sub)}
                            </span>

                        </div>


                        <!-- ============================================== -->
                        <!-- BLOQUE 3: ETIQUETAS -->
                        <!-- ============================================== -->

                        <div
                            style="
                                display: flex;
                                flex-direction: column;
                                align-items: flex-start;
                                gap: 3px;
                            "
                        >

                            ${tagsHtml}

                        </div>

                    </div>

                </td>


                <!-- ====================================================== -->
                <!-- VARIANTES -->
                <!-- ====================================================== -->

                <td>

                    <span
                        style="
                            font-size: 0.85rem;
                            color: #64748b;
                            font-weight: 600;
                        "
                    >
                        ${variants.length} var.
                    </span>

                </td>


                <!-- ====================================================== -->
                <!-- PRECIO -->
                <!-- ====================================================== -->

                <td>

                    <span
                        style="
                            font-weight: 700;
                            color: var(--text-dark);
                            white-space: nowrap;
                        "
                    >
                        ${priceDisplay}
                    </span>

                </td>


                <!-- ====================================================== -->
                <!-- INVENTARIO -->
                <!-- ====================================================== -->

                <td>

                    <div
                        style="
                            display: flex;
                            flex-direction: column;
                            gap: 4px;
                        "
                    >

                        <span
                            class="stock-indicator ${stockClass}"
                        >
                            ${stockDisponible} disp.
                        </span>

                        <span
                            style="
                                font-size: 0.75rem;
                                color: var(--text-muted);
                                font-weight: 600;
                            "
                        >
                            (Total: ${stockTotal})
                        </span>

                    </div>

                </td>


                <!-- ====================================================== -->
                <!-- ACCIONES -->
                <!-- ====================================================== -->

                <td>

                    <div
                        class="table-actions"
                        style="
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            gap: 6px;
                        "
                    >


                        <button
                            type="button"
                            class="btn-action-icon btn-publish ${p.isPublished ? 'published' : 'unpublished'}"
                            title="${p.isPublished ? 'Despublicar producto' : 'Publicar producto'}"
                            onclick="
                                accountInventory.togglePublicado(
                                    '${p.id}',
                                    ${p.isPublished}
                                )
                            "
                        >
                            <i class="fa-solid ${p.isPublished ? 'fa-eye' : 'fa-eye-slash'}"></i>
                        </button>

                        <button
                            type="button"
                            class="btn-action-icon btn-edit"
                            title="Editar Producto"
                            onclick="
                                accountProductForm.cargarProductoParaEditar('${p.id}')
                            "
                        >
                            <i
                                class="fa-solid fa-pen-to-square"
                            ></i>
                        </button>

                        <button
                            type="button"
                            class="btn-action-icon btn-delete"
                            title="Eliminar Producto"
                            onclick="
                                accountInventory.eliminarProductoAdmin(
                                    '${p.id}',
                                    '${escapeHtml(p.name)}'
                                )
                            "
                        >
                            <i
                                class="fa-solid fa-trash-can"
                            ></i>
                        </button>

                    </div>

                </td>

            </tr>
        `;
    });

    // ======================================================================
    // CERRAR TABLA
    // ======================================================================

    html += `
            </tbody>
        </table>
    `;

    container.innerHTML = html;

    // ==========================================================================
    // EVENTOS DE LAS FILAS DE PRODUCTOS
    // ==========================================================================

    container
        .querySelectorAll('.admin-product-row')
        .forEach(row => {

            row.addEventListener('click', event => {

                // --------------------------------------------------------------
                // Los botones Editar y Eliminar tienen su propio comportamiento
                // --------------------------------------------------------------
                if (event.target.closest('button')) {
                    return;
                }

                const productId =
                    row.dataset.productId;

                if (!productId) {
                    return;
                }

                abrirDetalleProducto(productId);
            });

        });
}


// ==========================================================================
// ABRIR DETALLE DEL PRODUCTO
// ==========================================================================

async function abrirDetalleProducto(productId) {

    try {

        // ------------------------------------------------------------------
        // OBTENER PRODUCTO COMPLETO
        // ------------------------------------------------------------------

        const response =
            await accountProductApi.getProductById(productId);

        const product = response.data;

        if (!product) {
            alert('No se encontraron los datos del producto.');
            return;
        }

        console.log(
            '🔎 PRODUCTO PARA DETALLE:',
            product
        );

        // ------------------------------------------------------------------
        // OBTENER MODAL
        // ------------------------------------------------------------------

        const modal =
            document.getElementById(
                'adminProductDetailModal'
            );

        if (!modal) {
            console.error(
                '❌ No se encontró #adminProductDetailModal'
            );
            return;
        }

        // ------------------------------------------------------------------
        // MOVER MODAL AL BODY
        // Para que position: fixed use el viewport
        // ------------------------------------------------------------------

        if (modal.parentElement !== document.body) {
            document.body.appendChild(modal);
        }

        // ------------------------------------------------------------------
        // RENDERIZAR CONTENIDO
        // ------------------------------------------------------------------

        renderProductDetailModal(product);

        // ------------------------------------------------------------------
        // MOSTRAR MODAL
        // ------------------------------------------------------------------

        modal.hidden = false;
        modal.style.display = 'flex';

    } catch (error) {

        console.error(
            '❌ Error cargando detalle del producto:',
            error
        );

        alert(
            error.message ||
            'No se pudo cargar el detalle del producto.'
        );
    }
}


// ======================================================================
// DETECTAR SI UNA ETIQUETA REPRESENTA UNA OFERTA
// ======================================================================

function esEtiquetaOferta(tag) {

    const tagName =
        tag &&
            typeof tag === 'object'
            ? tag.name
            : tag;

    if (!tagName) {
        return false;
    }

    return /^\d+(?:\.\d+)?%\s*OFF$/i.test(
        String(tagName).trim()
    );
}


// ==========================================================================
// RENDERIZAR DETALLE COMPLETO DEL PRODUCTO
// ==========================================================================

function renderProductDetailModal(product) {

    const content =
        document.getElementById(
            'adminProductDetailContent'
        );

    const title =
        document.getElementById(
            'adminProductDetailModalTitle'
        );

    const description =
        document.getElementById(
            'adminProductDetailModalDescription'
        );

    if (!content) {
        console.error(
            '❌ No se encontró #adminProductDetailContent'
        );
        return;
    }

    // ----------------------------------------------------------------------
    // DATOS PRINCIPALES
    // ----------------------------------------------------------------------

    const productName =
        product.design?.name ||
        'Producto sin nombre';

    const productType =
        product.productType?.name ||
        '-';

    const category =
        product.taxonomy?.category?.name ||
        '-';

    const theme =
        product.taxonomy?.theme?.name ||
        '-';

    const subtheme =
        product.taxonomy?.subtheme?.name ||
        '-';

    const tags =
        Array.isArray(product.tags)
            ? product.tags
            : [];

    const variants =
        Array.isArray(product.variants)
            ? product.variants
            : [];

    const hasOffer =
        tags.some(esEtiquetaOferta);

    // ----------------------------------------------------------------------
    // TÍTULO DEL MODAL
    // ----------------------------------------------------------------------

    if (title) {
        title.textContent =
            `Detalle: ${productName}`;
    }

    if (description) {
        description.textContent =
            `${variants.length} ${variants.length === 1
                ? 'variante'
                : 'variantes'
            }`;
    }

    // ----------------------------------------------------------------------
    // ETIQUETAS
    // ----------------------------------------------------------------------

    const tagsHtml =
        tags.length > 0

            ? tags
                .map(tag => `
                    <span
                        style="
                            display:inline-flex;
                            align-items:center;
                            gap:5px;
                            padding:5px 9px;
                            border-radius:999px;
                            background:#f3e8ff;
                            color:#7e22ce;
                            font-size:0.78rem;
                            font-weight:600;
                        "
                    >
                        <i class="fa-solid fa-tag"></i>
                        ${escapeHtml(tag.name || '-')}
                    </span>
                `)
                .join('')

            : `
                <span
                    style="
                        color:#64748b;
                        font-size:0.82rem;
                    "
                >
                    Sin etiquetas
                </span>
            `;

    // ----------------------------------------------------------------------
    // INFORMACIÓN GENERAL
    // ----------------------------------------------------------------------

    let html = `

        <!-- ========================================================== -->
        <!-- INFORMACIÓN GENERAL                                       -->
        <!-- ========================================================== -->

        <div
            style="
                padding-bottom:18px;
                border-bottom:1px solid #e2e8f0;
                margin-bottom:20px;
            "
        >

            <h4
                style="
                    margin:0 0 12px;
                    font-size:1.15rem;
                    color:var(--text-dark);
                "
            >
                ${escapeHtml(productName)}
            </h4>

            <div
                style="
                    display:flex;
                    flex-wrap:wrap;
                    gap:7px;
                    margin-bottom:12px;
                "
            >

                <span class="badge-pill">
                    <i class="fa-solid fa-box"></i>
                    ${escapeHtml(productType)}
                </span>

                <span class="badge-pill badge-cat">
                    <i class="fa-solid fa-folder"></i>
                    ${escapeHtml(category)}
                </span>

                <span class="badge-pill badge-theme">
                    <i class="fa-solid fa-layer-group"></i>
                    ${escapeHtml(theme)}
                </span>

                <span class="badge-pill badge-subtheme">
                    <i class="fa-solid fa-tag"></i>
                    ${escapeHtml(subtheme)}
                </span>

            </div>

            <div
                style="
                    display:flex;
                    flex-wrap:wrap;
                    gap:6px;
                "
            >
                ${tagsHtml}
            </div>

        </div>

        <!-- ========================================================== -->
        <!-- VARIANTES                                                 -->
        <!-- ========================================================== -->

        <div>

            <h4
                style="
                    margin:0 0 15px;
                    font-size:1rem;
                    color:var(--text-dark);
                "
            >
                Variantes
            </h4>

    `;

    // ----------------------------------------------------------------------
    // SIN VARIANTES
    // ----------------------------------------------------------------------

    if (variants.length === 0) {

        html += `
            <div
                style="
                    padding:30px;
                    text-align:center;
                    color:#64748b;
                    background:#f8fafc;
                    border-radius:10px;
                "
            >
                <i
                    class="fa-solid fa-box-open"
                    style="
                        font-size:28px;
                        margin-bottom:10px;
                    "
                ></i>

                <p>
                    Este producto no tiene variantes registradas.
                </p>
            </div>
        `;

    }

    // ----------------------------------------------------------------------
    // RENDERIZAR CADA VARIANTE
    // ----------------------------------------------------------------------

    variants.forEach((variant, index) => {

        const attributes =
            Array.isArray(variant.attributes)
                ? variant.attributes
                : [];

        const media =
            Array.isArray(variant.media)
                ? variant.media
                : [];

        const inventory =
            variant.inventory || {};

        const price =
            Number(variant.price);

        const compareAtPrice =
            variant.compareAtPrice !== null &&
                variant.compareAtPrice !== undefined
                ? Number(variant.compareAtPrice)
                : null;

        // ------------------------------------------------------------------
        // ATRIBUTOS
        // ------------------------------------------------------------------

        const attributesHtml =
            attributes.length > 0

                ? attributes
                    .map(attribute => {

                        const attributeName =
                            attribute.name ||
                            attribute.attribute ||
                            'Atributo';

                        const attributeValue =
                            attribute.value ||
                            '-';

                        return `
                            <div
                                style="
                                    display:flex;
                                    justify-content:space-between;
                                    align-items:center;
                                    gap:15px;
                                    padding:6px 0;
                                    border-bottom:1px solid #f1f5f9;
                                "
                            >

                                <span
                                    style="
                                        font-size:0.8rem;
                                        color:#64748b;
                                        font-weight:600;
                                    "
                                >
                                    ${escapeHtml(attributeName)}
                                </span>

                                <span
                                    style="
                                        font-size:0.82rem;
                                        color:#1e293b;
                                        font-weight:700;
                                        text-align:right;
                                    "
                                >
                                    ${escapeHtml(attributeValue)}
                                </span>

                            </div>
                        `;
                    })
                    .join('')

                : `
                    <span
                        style="
                            font-size:0.82rem;
                            color:#64748b;
                        "
                    >
                        Sin atributos
                    </span>
                `;

        // ------------------------------------------------------------------
        // IMÁGENES
        // ------------------------------------------------------------------

        const mediaHtml =
            media.length > 0

                ? `
                    <div
                        style="
                            display:flex;
                            flex-wrap:wrap;
                            gap:10px;
                            margin-top:12px;
                        "
                    >

                        ${media
                    .map(image => {

                        const imagePath =
                            image.storageKey ||
                            CONFIG.DEFAULT_PRODUCT_IMAGE;

                        return `
                                    <div
                                        style="
                                            width:76px;
                                            height:76px;
                                            border:1px solid #e2e8f0;
                                            border-radius:8px;
                                            overflow:hidden;
                                            background:#f8fafc;
                                        "
                                    >

                                        <img
                                            src="${escapeHtml(imagePath)}"
                                            alt="${escapeHtml(
                            image.originalName ||
                            'Imagen de variante'
                        )}"
                                            style="
                                                width:100%;
                                                height:100%;
                                                object-fit:cover;
                                            "
                                            onerror="
                                                this.onerror=null;
                                                this.src='${CONFIG.DEFAULT_PRODUCT_IMAGE}';
                                            "
                                        >

                                    </div>
                                `;
                    })
                    .join('')}

                    </div>
                `

                : `
                    <div
                        style="
                            margin-top:10px;
                            padding:12px;
                            border-radius:7px;
                            background:#f8fafc;
                            color:#64748b;
                            font-size:0.8rem;
                        "
                    >
                        <i class="fa-regular fa-image"></i>
                        Esta variante no tiene imágenes específicas.
                    </div>
                `;

        // ------------------------------------------------------------------
        // PRECIO
        // ------------------------------------------------------------------

        let priceHtml = '-';

        if (Number.isFinite(price)) {

            // --------------------------------------------------------------
            // PRODUCTO EN OFERTA
            // --------------------------------------------------------------

            if (
                hasOffer &&
                Number.isFinite(compareAtPrice) &&
                compareAtPrice > price
            ) {

                priceHtml = `
            <div
                style="
                    display:flex;
                    align-items:center;
                    justify-content:flex-end;
                    gap:7px;
                    white-space:nowrap;
                "
            >

                <!-- Precio anterior -->
                <span
                    style="
                        color:#94a3b8;
                        text-decoration:line-through;
                        font-size:0.82rem;
                        font-weight:600;
                    "
                >
                    S/ ${compareAtPrice.toFixed(2)}
                </span>

                <!-- Flecha -->
                <span
                    style="
                        color:#64748b;
                        font-size:0.9rem;
                        font-weight:700;
                    "
                >
                    →
                </span>

                <!-- Precio actual -->
                <span
                    style="
                        color:#dc2626;
                        font-size:1rem;
                        font-weight:800;
                    "
                >
                    S/ ${price.toFixed(2)}
                </span>

            </div>
        `;

            }

            // --------------------------------------------------------------
            // PRECIO NORMAL
            // --------------------------------------------------------------

            else {

                priceHtml = `
            <span
                style="
                    font-size:1rem;
                    font-weight:800;
                    color:var(--text-dark);
                "
            >
                S/ ${price.toFixed(2)}
            </span>
        `;
            }
        }

        // ------------------------------------------------------------------
        // BACKORDER
        // ------------------------------------------------------------------

        const backorderHtml =
            inventory.allowBackorder === true

                ? `
                    <span
                        style="
                            color:#15803d;
                            font-weight:700;
                        "
                    >
                        <i class="fa-solid fa-check"></i>
                        Permitido
                    </span>
                `

                : `
                    <span
                        style="
                            color:#dc2626;
                            font-weight:700;
                        "
                    >
                        <i class="fa-solid fa-xmark"></i>
                        No permitido
                    </span>
                `;

        // ------------------------------------------------------------------
        // STOCK
        // ------------------------------------------------------------------

        const stock =
            Number(inventory.stock ?? 0);

        const reservedStock =
            Number(inventory.reservedStock ?? 0);

        const availableStock =
            Number(
                inventory.availableStock ??
                (stock - reservedStock)
            );

        const minimumStock =
            inventory.minimumStock ??
            0;

        const maximumStock =
            inventory.maximumStock ??
            null;

        const maximumStockText =
            maximumStock === null
                ? 'Sin límite'
                : maximumStock;

        // ------------------------------------------------------------------
        // VARIANTE
        // ------------------------------------------------------------------

        html += `

            <div
                style="
                    border:1px solid #dbe3ee;
                    border-radius:12px;
                    padding:16px;
                    margin-bottom:15px;
                    background:#ffffff;
                "
            >

                <!-- ====================================================== -->
                <!-- CABECERA DE VARIANTE                                  -->
                <!-- ====================================================== -->

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:flex-start;
                        gap:15px;
                        padding-bottom:12px;
                        border-bottom:1px solid #e2e8f0;
                    "
                >

                    <div>

                        <h5
                            style="
                                margin:0 0 5px;
                                font-size:0.95rem;
                                color:var(--royal-blue);
                            "
                        >
                            Variante ${index + 1}

                            ${variant.isDefault
                ? `
                                        <span
                                            style="
                                                margin-left:6px;
                                                font-size:0.7rem;
                                                color:#92400e;
                                                background:#fef3c7;
                                                padding:4px 7px;
                                                border-radius:999px;
                                            "
                                        >
                                            Principal
                                        </span>
                                    `
                : ''
            }

                        </h5>

                        <div
                            style="
                                display:flex;
                                align-items:center;
                                gap:7px;
                                font-family:monospace;
                                font-size:0.72rem;
                                color:#64748b;
                                word-break:break-all;
                            "
                        >
                            <span>
                                SKU:
                                ${escapeHtml(
                variant.sku || 'SIN-SKU'
            )}
                            </span>

                            ${variant.sku
                ? `
                                        <button
                                            type="button"
                                            class="btn-copy-sku"
                                            title="Copiar SKU"
                                            data-sku="${escapeHtml(variant.sku)}"
                                            onclick="accountInventory.copiarSKU(this)"
                                            style="
                                                flex-shrink:0;
                                                border:none;
                                                background:#f1f5f9;
                                                color:#475569;
                                                width:26px;
                                                height:26px;
                                                border-radius:6px;
                                                cursor:pointer;
                                                display:flex;
                                                align-items:center;
                                                justify-content:center;
                                                padding:0;
                                            "
                                        >
                                            <i class="fa-regular fa-copy"></i>
                                        </button>
                                    `
                : ''
            }
                        </div>

                    </div>

                    <div
                        style="
                            text-align:right;
                            white-space:nowrap;
                        "
                    >
                        ${priceHtml}
                    </div>

                </div>

                <!-- ====================================================== -->
                <!-- ATRIBUTOS                                              -->
                <!-- ====================================================== -->

                <div
                    style="
                        margin-top:14px;
                    "
                >

                    <div
                        style="
                            font-size:0.78rem;
                            font-weight:700;
                            color:#475569;
                            margin-bottom:6px;
                        "
                    >
                        <i class="fa-solid fa-sliders"></i>
                        Atributos
                    </div>

                    <div>
                        ${attributesHtml}
                    </div>

                </div>

                <!-- ====================================================== -->
                <!-- IMÁGENES                                               -->
                <!-- ====================================================== -->

                <div
                    style="
                        margin-top:14px;
                    "
                >

                    <div
                        style="
                            font-size:0.78rem;
                            font-weight:700;
                            color:#475569;
                        "
                    >
                        <i class="fa-regular fa-images"></i>
                        Imágenes de la variante
                    </div>

                    ${mediaHtml}

                </div>

                <!-- ====================================================== -->
                <!-- INVENTARIO                                             -->
                <!-- ====================================================== -->

                <div
                    style="
                        margin-top:15px;
                        padding-top:14px;
                        border-top:1px solid #e2e8f0;
                    "
                >

                    <div
                        style="
                            font-size:0.78rem;
                            font-weight:700;
                            color:#475569;
                            margin-bottom:10px;
                        "
                    >
                        <i class="fa-solid fa-boxes-stacked"></i>
                        Inventario
                    </div>

                    <div
                        style="
                            display:grid;
                            grid-template-columns:
                                repeat(2, minmax(0, 1fr));
                            gap:8px 20px;
                            font-size:0.8rem;
                        "
                    >

                        <div>
                            <span style="color:#64748b;">
                                Stock:
                            </span>
                            <strong>
                                ${stock}
                            </strong>
                        </div>

                        <div>
                            <span style="color:#64748b;">
                                Reservado:
                            </span>
                            <strong>
                                ${reservedStock}
                            </strong>
                        </div>

                        <div>
                            <span style="color:#64748b;">
                                Disponible:
                            </span>
                            <strong>
                                ${availableStock}
                            </strong>
                        </div>

                        <div>
                            <span style="color:#64748b;">
                                Stock mínimo:
                            </span>
                            <strong>
                                ${minimumStock}
                            </strong>
                        </div>

                        <div>
                            <span style="color:#64748b;">
                                Stock máximo:
                            </span>
                            <strong>
                                ${maximumStockText}
                            </strong>
                        </div>

                        <div>
                            <span style="color:#64748b;">
                                Backorder:
                            </span>

                            ${backorderHtml}
                        </div>

                    </div>

                </div>

            </div>

        `;
    });

    html += `
        </div>
    `;

    // ----------------------------------------------------------------------
    // INSERTAR CONTENIDO
    // ----------------------------------------------------------------------

    content.innerHTML = html;
}


// ==========================================================================
// EVENTOS DEL MODAL DE DETALLE DEL PRODUCTO
// ==========================================================================

function initProductDetailModalEvents() {

    const modal =
        document.getElementById(
            'adminProductDetailModal'
        );

    const closeButton =
        document.getElementById(
            'adminProductDetailModalClose'
        );

    const cancelButton =
        document.getElementById(
            'adminProductDetailModalCancel'
        );

    // ----------------------------------------------------------------------
    // Si el modal todavía no existe, no hacer nada
    // ----------------------------------------------------------------------

    if (!modal) {
        console.warn(
            '⚠️ No se encontró el modal de detalle del producto.'
        );
        return;
    }

    // ----------------------------------------------------------------------
    // BOTÓN X
    // ----------------------------------------------------------------------

    if (closeButton) {

        closeButton.addEventListener(
            'click',
            closeProductDetailModal
        );

    }

    // ----------------------------------------------------------------------
    // BOTÓN CERRAR
    // ----------------------------------------------------------------------

    if (cancelButton) {

        cancelButton.addEventListener(
            'click',
            closeProductDetailModal
        );

    }

    // ----------------------------------------------------------------------
    // BACKDROP
    // ----------------------------------------------------------------------

    const backdrop =
        modal.querySelector(
            '.admin-modal-backdrop'
        );

    if (backdrop) {

        backdrop.addEventListener(
            'click',
            closeProductDetailModal
        );

    }

}


// ==========================================================================
// CERRAR MODAL DE DETALLE DEL PRODUCTO
// ==========================================================================

function closeProductDetailModal() {

    const modal =
        document.getElementById(
            "adminProductDetailModal"
        );

    if (!modal) return;

    modal.hidden = true;
    modal.style.display = "none";

    const title =
        document.getElementById(
            "adminProductDetailModalTitle"
        );

    const description =
        document.getElementById(
            "adminProductDetailModalDescription"
        );

    if (title) {
        title.textContent =
            "Detalle del producto";
    }

    if (description) {
        description.textContent =
            "Información detallada del producto y sus variantes.";
    }
}


// ==========================================================================
// COPIAR SKU AL PORTAPAPELES
// ==========================================================================

async function copiarSKU(button) {

    const sku = button?.dataset?.sku;

    if (!sku) {
        console.warn('⚠️ No se encontró un SKU para copiar.');
        return;
    }

    try {

        await navigator.clipboard.writeText(sku);

        // --------------------------------------------------------------
        // CAMBIAR ICONO TEMPORALMENTE
        // --------------------------------------------------------------

        const icon = button.querySelector('i');

        if (icon) {
            icon.className = 'fa-solid fa-check';
        }

        button.title = 'SKU copiado';

        // --------------------------------------------------------------
        // RESTAURAR DESPUÉS DE UN MOMENTO
        // --------------------------------------------------------------

        setTimeout(() => {

            if (icon) {
                icon.className = 'fa-regular fa-copy';
            }

            button.title = 'Copiar SKU';

        }, 1200);

        console.log('📋 SKU copiado:', sku);

    } catch (error) {

        console.error(
            '❌ No se pudo copiar el SKU:',
            error
        );

    }
}


// ==========================================================================
// RENDERIZAR PAGINACIÓN
// ==========================================================================

function renderInventoryPagination(pagination) {
    const container = document.getElementById('inventoryPagination');
    if (!container) return;

    if (!pagination || pagination.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    const { page, totalPages, total } = pagination;

    let html = `
        <div class="pagination-controls" style="display:flex; align-items:center; justify-content:space-between; margin-top:20px; padding-top:15px; border-top:1px solid #e2e8f0;">
            
            <div style="font-size:0.85rem; color:var(--text-muted);">
                Mostrando página <strong>${page}</strong> de <strong>${totalPages}</strong> (Total: ${total})
            </div>

            <div style="display:flex; gap:8px;">
                <button type="button" class="btn-secondary" style="padding:6px 12px; font-size:0.85rem;" 
                    ${page === 1 ? 'disabled' : ''} 
                    onclick="accountInventory.cargarProductosInventario(${page - 1})">
                    <i class="fa-solid fa-chevron-left" style="margin-right:4px;"></i> Anterior
                </button>
                
                <button type="button" class="btn-secondary" style="padding:6px 12px; font-size:0.85rem;"
                    ${page === totalPages ? 'disabled' : ''} 
                    onclick="accountInventory.cargarProductosInventario(${page + 1})">
                    Siguiente <i class="fa-solid fa-chevron-right" style="margin-left:4px;"></i>
                </button>
            </div>

        </div>
    `;

    container.innerHTML = html;
}

// ==========================================================================
// FILTRAR (BÚSQUEDA)
// ==========================================================================

function filtrarTablaInventario(query) {
    const term = (query || '').trim();

    clearTimeout(adminInventoryState.typingTimeout);

    adminInventoryState.typingTimeout = setTimeout(() => {
        cargarProductosInventario(1, term);
    }, 400); // 400ms debounce
}


// ==========================================================================
// ELIMINAR PRODUCTO (DELETE)
// ==========================================================================

async function eliminarProductoAdmin(id, name) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el producto "${name}"?`)) {
        return;
    }

    try {
        await accountProductApi.deleteProduct(id);

        alert(`El producto "${name}" ha sido eliminado.`);

        // Recargar la tabla actual
        await cargarProductosInventario();

        // Limpiar catálogo público en caché si existe
        if (typeof catalogManager !== 'undefined' && typeof catalogManager.loadProducts === 'function') {
            await catalogManager.loadProducts(true);
        }

    } catch (err) {
        console.error('Error al eliminar:', err);
        alert(err.message || 'Error de conexión con el servidor.');
    }
}


// Escape de HTML simple para botones
function escapeHtml(unsafe) {

    if (unsafe === null || unsafe === undefined) {
        return '';
    }

    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Publicar / despublicar producto
async function togglePublicado(id, estadoActual) {
    try {
        await accountProductApi.setPublished(
            id,
            !estadoActual
        );

        await cargarProductosInventario();

    } catch (error) {
        console.error('Error al cambiar publicación:', error);

        alert(
            error.message ||
            'No se pudo cambiar el estado de publicación.'
        );
    }
}


// ==========================================================================
// INICIALIZAR MÓDULO DE INVENTARIO
// ==========================================================================

function init() {

    console.log(
        '🚀 Inicializando módulo accountInventory...'
    );

    initProductDetailModalEvents();


}


window.accountInventory = {
    init,
    cargarProductosInventario,
    renderAdminProductsTable,
    renderInventoryPagination,
    filtrarTablaInventario,
    eliminarProductoAdmin,
    abrirDetalleProducto,
    initProductDetailModalEvents,
    closeProductDetailModal,
    copiarSKU,
    togglePublicado
};

