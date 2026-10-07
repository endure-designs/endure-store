// ==========================================================================
// ACCOUNT PRODUCT FORM — Crear/Editar producto, autodetectar tema, imagen
// ==========================================================================

// Variable para controlar si estamos editando (ID del producto) o creando (null)
let editingProductId = null;
let selectedImageFile = null;


// ==========================================================================
// ESTADO DE GALERÍA DEL PRODUCTO
// ==========================================================================

const productGalleryState = {

    // Imágenes cargadas en la galería
    images: [],

    // key de la imagen principal
    primaryImageKey: null

};


// ==========================================================================
// AGREGAR IMÁGENES A LA GALERÍA
// ==========================================================================

function agregarImagenesGaleria(files) {

    if (!files || !files.length) {
        return;
    }


    Array.from(files).forEach(file => {

        // ------------------------------------------------------------------
        // Solo aceptar archivos de imagen
        // ------------------------------------------------------------------

        if (!file.type.startsWith('image/')) {
            return;
        }


        // ------------------------------------------------------------------
        // Crear identificador único para la imagen
        // ------------------------------------------------------------------

        const key =
            `${file.name}_${file.size}_${file.lastModified}`;


        // ------------------------------------------------------------------
        // Evitar imágenes duplicadas
        // ------------------------------------------------------------------

        const alreadyExists =
            productGalleryState.images.some(
                image =>
                    image.key === key
            );

        if (alreadyExists) {
            return;
        }


        // ------------------------------------------------------------------
        // Crear URL temporal para la previsualización
        // ------------------------------------------------------------------

        const previewUrl =
            URL.createObjectURL(file);


        // ------------------------------------------------------------------
        // Guardar imagen en el estado
        // ------------------------------------------------------------------

        productGalleryState.images.push({

            key,

            file,

            fileName:
                file.name,

            previewUrl

        });

    });


    // ----------------------------------------------------------------------
    // Si todavía no hay imagen principal,
    // la primera imagen agregada será la principal.
    // ----------------------------------------------------------------------

    if (
        !productGalleryState.primaryImageKey &&
        productGalleryState.images.length > 0
    ) {

        productGalleryState.primaryImageKey =
            productGalleryState.images[0].key;

    }


    // ----------------------------------------------------------------------
    // RENDERIZAR GALERÍA
    // ----------------------------------------------------------------------

    renderProductGallery();


    // ----------------------------------------------------------------------
    // DEPURACIÓN
    // ----------------------------------------------------------------------

    console.log(
        '🟡 Galería actualizada:',
        productGalleryState
    );

}


// ==========================================================================
// RENDERIZAR GALERÍA
// ==========================================================================

function renderProductGallery() {

    const container =
        document.getElementById(
            'productGalleryPreview'
        );

    const primaryInfo =
        document.getElementById(
            'productGalleryPrimaryInfo'
        );

    const primaryName =
        document.getElementById(
            'productGalleryPrimaryName'
        );

    const fileInfo =
        document.getElementById(
            'productGalleryFileInfo'
        );

    // ----------------------------------------------------------------------
    // VALIDAR CONTENEDOR
    // ----------------------------------------------------------------------

    if (!container) {
        console.error(
            'No existe #productGalleryPreview'
        );
        return;
    }

    // ----------------------------------------------------------------------
    // GALERÍA VACÍA
    // ----------------------------------------------------------------------

    if (
        !Array.isArray(productGalleryState.images) ||
        productGalleryState.images.length === 0
    ) {

        // --------------------------------------------------------------
        // Limpiar tarjetas
        // --------------------------------------------------------------

        container.innerHTML = '';
        container.hidden = true;
        container.style.display = 'none';

        // --------------------------------------------------------------
        // Ocultar información de imagen principal
        // --------------------------------------------------------------

        if (primaryInfo) {
            primaryInfo.hidden = true;
            primaryInfo.style.display = 'none';
        }

        // --------------------------------------------------------------
        // Limpiar nombre de imagen principal
        // --------------------------------------------------------------

        if (primaryName) {
            primaryName.textContent = '';
        }

        // --------------------------------------------------------------
        // Información inferior
        // --------------------------------------------------------------

        if (fileInfo) {
            fileInfo.textContent =
                'Ninguna imagen seleccionada';
        }

        return;
    }

    // ----------------------------------------------------------------------
    // MOSTRAR CONTENEDOR
    // ----------------------------------------------------------------------

    container.hidden = false;
    container.style.display = '';

    // ----------------------------------------------------------------------
    // INFORMACIÓN DE CANTIDAD
    // ----------------------------------------------------------------------

    if (fileInfo) {

        const count =
            productGalleryState.images.length;

        fileInfo.textContent =
            `${count} ${count === 1
                ? 'imagen seleccionada'
                : 'imágenes seleccionadas'
            }`;
    }

    // ----------------------------------------------------------------------
    // GENERAR TARJETAS
    // ----------------------------------------------------------------------

    container.innerHTML =
        productGalleryState.images
            .map(image => {

                const isPrimary =
                    image.key ===
                    productGalleryState.primaryImageKey;

                return `
                    <div
                        class="product-gallery-item
                            ${isPrimary ? 'is-primary' : ''}"
                        data-image-key="${escapeHtml(
                    image.key
                )}"
                    >

                        <!-- ==================================================
                             PREVIEW
                             ================================================== -->

                        <div class="product-gallery-image-wrapper">

                            <img
                                src="${image.previewUrl}"
                                alt="${escapeHtml(image.fileName)}"
                                onerror="this.onerror=null; this.src=CONFIG.DEFAULT_PRODUCT_IMAGE;"
                            >

                            ${isPrimary
                        ? `
                                        <span
                                            class="product-gallery-primary-badge"
                                        >
                                            <i class="fa-solid fa-star"></i>
                                            Principal
                                        </span>
                                    `
                        : ''
                    }

                        </div>

                        <!-- ==================================================
                             INFORMACIÓN
                             ================================================== -->

                        <div class="product-gallery-item-info">

                            <span
                                class="product-gallery-item-name"
                                title="${escapeHtml(
                        image.fileName
                    )}"
                            >
                                ${escapeHtml(
                        image.fileName
                    )}
                            </span>

                            <!-- ==============================================
                                 USAR COMO PRINCIPAL
                                 ============================================== -->

                            <button
                                type="button"
                                class="product-gallery-primary-btn
                                    ${isPrimary ? 'active' : ''}"
                                data-gallery-action="primary"
                                data-image-key="${escapeHtml(
                        image.key
                    )}"
                                title="${isPrimary
                        ? 'Imagen principal'
                        : 'Usar como imagen principal'
                    }"
                            >
                                <i class="fa-solid fa-star"></i>
                            </button>

                            <!-- ==============================================
                                 ELIMINAR
                                 ============================================== -->

                            <button
                                type="button"
                                class="product-gallery-remove-btn"
                                data-gallery-action="remove"
                                data-image-key="${escapeHtml(
                        image.key
                    )}"
                                title="Eliminar imagen"
                            >
                                <i class="fa-solid fa-trash"></i>
                            </button>

                        </div>

                    </div>
                `;
            })
            .join('');

    // ----------------------------------------------------------------------
    // BUSCAR IMAGEN PRINCIPAL
    // ----------------------------------------------------------------------

    const primaryImage =
        productGalleryState.images.find(
            image =>
                image.key ===
                productGalleryState.primaryImageKey
        );

    // ----------------------------------------------------------------------
    // MOSTRAR / OCULTAR INFORMACIÓN DE IMAGEN PRINCIPAL
    // ----------------------------------------------------------------------

    if (primaryImage) {

        if (primaryInfo) {
            primaryInfo.hidden = false;
            primaryInfo.style.display = '';
        }

        if (primaryName) {
            primaryName.textContent =
                primaryImage.fileName;
        }

    } else {

        if (primaryInfo) {
            primaryInfo.hidden = true;
            primaryInfo.style.display = 'none';
        }

        if (primaryName) {
            primaryName.textContent = '';
        }
    }
}


// ==========================================================================
// INICIALIZAR GALERÍA DEL PRODUCTO
// ==========================================================================

function initProductGallery() {

    const fileInput =
        document.getElementById(
            'adminProductImages'
        );

    const selectButton =
        document.getElementById(
            'selectProductImagesBtn'
        );

    const dropZone =
        document.getElementById(
            'productGalleryDropZone'
        );

    const gallery =
        document.getElementById(
            'productGalleryPreview'
        );


    // ----------------------------------------------------------------------
    // VALIDAR ELEMENTOS
    // ----------------------------------------------------------------------

    if (
        !fileInput ||
        !selectButton ||
        !dropZone
    ) {

        console.warn(
            'No se pudieron inicializar los elementos de la galería.'
        );

        return;
    }


    // ----------------------------------------------------------------------
    // BOTÓN "SELECCIONAR IMÁGENES"
    // ----------------------------------------------------------------------

    selectButton.addEventListener(
        'click',
        () => {

            fileInput.click();

        }
    );


    // ----------------------------------------------------------------------
    // SELECCIÓN DESDE EXPLORADOR
    // ----------------------------------------------------------------------

    fileInput.addEventListener(
        'change',
        event => {

            agregarImagenesGaleria(
                event.target.files
            );


            // --------------------------------------------------------------
            // Permitir volver a seleccionar el mismo archivo
            // --------------------------------------------------------------

            fileInput.value = '';

        }
    );


    // ----------------------------------------------------------------------
    // DRAGOVER
    // ----------------------------------------------------------------------

    dropZone.addEventListener(
        'dragover',
        event => {

            event.preventDefault();

            dropZone.classList.add(
                'drag-over'
            );

        }
    );


    // ----------------------------------------------------------------------
    // DRAGLEAVE
    // ----------------------------------------------------------------------

    dropZone.addEventListener(
        'dragleave',
        event => {

            if (
                !dropZone.contains(
                    event.relatedTarget
                )
            ) {

                dropZone.classList.remove(
                    'drag-over'
                );

            }

        }
    );


    // ----------------------------------------------------------------------
    // DROP
    // ----------------------------------------------------------------------

    dropZone.addEventListener(
        'drop',
        event => {

            event.preventDefault();

            dropZone.classList.remove(
                'drag-over'
            );


            agregarImagenesGaleria(
                event.dataTransfer.files
            );

        }
    );


    // ----------------------------------------------------------------------
    // ACCIONES SOBRE LAS IMÁGENES
    // ----------------------------------------------------------------------

    if (gallery) {

        gallery.addEventListener(
            'click',
            event => {

                const button =
                    event.target.closest(
                        '[data-gallery-action]'
                    );


                if (!button) {
                    return;
                }


                const action =
                    button.dataset.galleryAction;


                const imageKey =
                    button.dataset.imageKey;


                // ----------------------------------------------------------
                // CAMBIAR IMAGEN PRINCIPAL
                // ----------------------------------------------------------

                if (
                    action === 'primary'
                ) {

                    productGalleryState.primaryImageKey =
                        imageKey;


                    // ------------------------------------------------------
                    // La imagen principal no puede pertenecer a ninguna
                    // variante como imagen específica.
                    // ------------------------------------------------------

                    accountVariantsState.variants.forEach(
                        variant => {

                            if (
                                !Array.isArray(
                                    variant.images
                                )
                            ) {
                                return;
                            }

                            variant.images =
                                variant.images.filter(
                                    image => {

                                        const key =
                                            image &&
                                                typeof image === 'object'
                                                ? image.key
                                                : image;

                                        return key !== imageKey;
                                    }
                                );

                        }
                    );


                    // ------------------------------------------------------
                    // Actualizar galería
                    // ------------------------------------------------------

                    renderProductGallery();


                    // ------------------------------------------------------
                    // Actualizar modal de imágenes de variante
                    // si está abierto
                    // ------------------------------------------------------

                    refreshVariantImagesModal();

                    return;
                }


                // ----------------------------------------------------------
                // ELIMINAR IMAGEN
                // ----------------------------------------------------------

                if (
                    action === 'remove'
                ) {

                    eliminarImagenGaleria(
                        imageKey
                    );

                }

            }
        );

    }

}


// ==========================================================================
// ELIMINAR IMAGEN DE LA GALERÍA
// ==========================================================================

function eliminarImagenGaleria(imageKey) {

    // ----------------------------------------------------------------------
    // Buscar imagen
    // ----------------------------------------------------------------------

    const image =
        productGalleryState.images.find(
            item =>
                item.key === imageKey
        );


    if (!image) {

        console.error(
            'No se encontró la imagen para eliminar:',
            imageKey
        );

        return;
    }


    // ----------------------------------------------------------------------
    // Liberar URL temporal
    // ----------------------------------------------------------------------

    if (image.previewUrl) {

        URL.revokeObjectURL(
            image.previewUrl
        );

    }


    // ----------------------------------------------------------------------
    // Eliminar imagen del estado
    // ----------------------------------------------------------------------

    productGalleryState.images =
        productGalleryState.images.filter(
            item =>
                item.key !== imageKey
        );


    // ----------------------------------------------------------------------
    // Si la imagen eliminada era la principal
    // ----------------------------------------------------------------------

    if (
        productGalleryState.primaryImageKey ===
        imageKey
    ) {

        // Si quedan imágenes,
        // la primera pasa a ser la principal.

        productGalleryState.primaryImageKey =
            productGalleryState.images.length > 0
                ? productGalleryState.images[0].key
                : null;

    }


    // ----------------------------------------------------------------------
    // Volver a renderizar
    // ----------------------------------------------------------------------

    renderProductGallery();


    console.log(
        '🟢 Imagen eliminada:',
        image.fileName
    );

}

async function cargarProductoParaEditar(id) {
    try {
        const response = await accountProductApi.getProductById(id);
        const product = response.data;

        if (!product) {
            alert('No se encontraron los datos del producto.');
            return;
        }

        // A. ID activo
        editingProductId = product.id;

        // ----------------------------------------------------------------------
        // PRECIO BASE NO ES OBLIGATORIO DURANTE LA EDICIÓN
        // ----------------------------------------------------------------------

        const basePriceInput =
            document.getElementById('adminBasePrice');

        if (basePriceInput) {
            basePriceInput.required = true;
            basePriceInput.value =
                product.basePrice ?? '';
        }

        // B. Cambiar a formulario
        const formSubtabBtn =
            document.querySelector('[data-subtab="subpanel-product-form"]') ||
            document.querySelector('[data-subtab="create-product"]') ||
            document.querySelector('.subtab-btn');

        if (formSubtabBtn) formSubtabBtn.click();

        // C. Banner
        const banner = document.getElementById('editingModeBanner');
        const nameSpan = document.getElementById('editingProductName');

        if (banner && nameSpan) {
            nameSpan.innerText = `"${product.design?.name || ''}"`;
            banner.style.display = 'flex';
        }

        // D. Información general
        const designInput = document.getElementById('adminDesignName');
        const descInput = document.getElementById('adminProductDesc');

        if (designInput) {
            designInput.value = product.design?.name || '';
        }

        if (descInput) {
            descInput.value = product.design?.description || '';
        }

        // ======================================================================
        // E. TAXONOMÍA
        // ======================================================================

        await accountSelects.seleccionarOCrearOpcion(
            'adminProductType',
            product.productType?.name || ''
        );

        await accountSelects.seleccionarOCrearOpcion(
            'adminCategory',
            product.taxonomy?.category?.name || ''
        );

        await accountSelects.seleccionarOCrearOpcion(
            'adminTheme',
            product.taxonomy?.theme?.name || ''
        );

        await accountSelects.updateSubthemesBySelectedTheme();

        await accountSelects.seleccionarOCrearOpcion(
            'adminSubtheme',
            product.taxonomy?.subtheme?.name || ''
        );

        // ======================================================================
        // F. CONFIGURACIÓN DE PRECIOS
        // ======================================================================

        const discountInput =
            document.getElementById('adminDiscountPercent');

        const ofertaCheck =
            document.getElementById('tagOfertaCheck');

        const discountWrapper =
            document.getElementById('discountInputWrapper');


        // ----------------------------------------------------------------------
        // PRECIO BASE
        // ----------------------------------------------------------------------

        if (basePriceInput) {

            basePriceInput.value =
                product.basePrice !== null &&
                    product.basePrice !== undefined
                    ? product.basePrice
                    : '';
        }


        // ----------------------------------------------------------------------
        // DESCUENTO
        // ----------------------------------------------------------------------

        if (discountInput) {

            discountInput.value =
                product.discountPercent !== null &&
                    product.discountPercent !== undefined
                    ? product.discountPercent
                    : '';
        }


        // ----------------------------------------------------------------------
        // DETERMINAR SI EL PRODUCTO ESTÁ EN OFERTA
        // ----------------------------------------------------------------------
        //
        // La fuente principal ahora es discountPercent.
        // Si existe un descuento válido, Oferta debe estar activa.
        // ----------------------------------------------------------------------

        const discountPercent =
            Number(product.discountPercent);

        const ofertaActiva =
            Number.isFinite(discountPercent) &&
            discountPercent > 0 &&
            discountPercent < 100;


        // ----------------------------------------------------------------------
        // CHECKBOX OFERTA
        // ----------------------------------------------------------------------

        if (ofertaCheck) {
            ofertaCheck.checked =
                ofertaActiva;
        }


        // ----------------------------------------------------------------------
        // MOSTRAR / OCULTAR CAMPO DE DESCUENTO
        // ----------------------------------------------------------------------

        if (discountWrapper) {

            discountWrapper.style.display =
                ofertaActiva
                    ? 'inline-flex'
                    : 'none';
        }

        // ======================================================================
        // G. TAGS
        // ======================================================================

        accountTags.restablecerCheckboxesEtiquetas(
            product.tags || [],
            product.discountPercent
        );

        // H. Variantes
        accountVariants.cargarVariantesExistentes(product);

        // I. Galería
        productGalleryState.images =
            Array.isArray(product.media)
                ? product.media.map(media => ({
                    id: media.id,
                    mediaId: media.mediaId,
                    key: media.storageKey,
                    storageKey: media.storageKey,
                    fileName: media.originalName,
                    originalName: media.originalName,
                    previewUrl: media.storageKey,
                    isPrimary: media.isPrimary,
                    sortOrder: media.sortOrder,
                    file: null,
                    existing: true
                }))
                : [];

        productGalleryState.primaryImageKey =
            product.media?.find(media => media.isPrimary)?.storageKey || null;

        renderProductGallery();

        // J. Botón actualizar
        const submitBtn =
            document.querySelector(
                '#createProductForm button[type="submit"]'
            );

        if (submitBtn) {
            submitBtn.innerHTML =
                '<i class="fa-solid fa-pen-to-square"></i> Actualizar Producto en la BD';

            submitBtn.style.backgroundColor = '#0284c7';
        }

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

    } catch (error) {
        console.error(
            'Error cargando producto para edición:',
            error
        );

        alert(
            error.message ||
            'No se pudo cargar el producto para editar.'
        );
    }
}

// ==========================================================================
// CANCELAR MODO EDICIÓN Y VOLVER A CREACIÓN
// ==========================================================================

function cancelarModoEdicion() {

    editingProductId = null;

    // ----------------------------------------------------------------------
    // RESTAURAR PRECIO BASE COMO OBLIGATORIO EN CREACIÓN
    // ----------------------------------------------------------------------

    const basePriceInput =
        document.getElementById('adminBasePrice');

    if (basePriceInput) {
        basePriceInput.required = true;
    }

    // ----------------------------------------------------------------------
    // DESACTIVAR MODO EDICIÓN
    // ----------------------------------------------------------------------

    accountVariantsState.isEditing = false;

    // ----------------------------------------------------------------------
    // OCULTAR BANNER
    // ----------------------------------------------------------------------

    const banner =
        document.getElementById('editingModeBanner');

    if (banner) {
        banner.style.display = 'none';
    }

    // ----------------------------------------------------------------------
    // RESETEAR FORMULARIO
    // ----------------------------------------------------------------------

    const form =
        document.getElementById('createProductForm');

    if (form) {
        form.reset();
    }

    // ----------------------------------------------------------------------
    // OCULTAR Y LIMPIAR PORCENTAJE DE DESCUENTO
    // ----------------------------------------------------------------------

    const discountWrapper =
        document.getElementById('discountInputWrapper');

    const discountInput =
        document.getElementById('adminDiscountPercent');

    if (discountWrapper) {
        discountWrapper.style.display = 'none';
    }

    if (discountInput) {
        discountInput.value = '';
    }

    // ----------------------------------------------------------------------
    // LIMPIAR GALERÍA
    // ----------------------------------------------------------------------

    productGalleryState.images = [];
    productGalleryState.primaryImageKey = null;

    renderProductGallery();

    // ----------------------------------------------------------------------
    // LIMPIAR VARIANTES
    // ----------------------------------------------------------------------

    accountVariantsState.variants = [];
    accountVariantsState.selectedVariantIndex = null;
    accountVariantsState.editingVariantIndex = null;
    accountVariantsState.editingVariantImageKeys = [];

    renderVariants();

    // ----------------------------------------------------------------------
    // LIMPIAR ATRIBUTOS DEL TIPO DE PRODUCTO
    // ----------------------------------------------------------------------

    limpiarAtributosProducto();

    // ----------------------------------------------------------------------
    // RESETEAR IMAGEN INDIVIDUAL
    // ----------------------------------------------------------------------

    const previewContainer =
        document.getElementById('imagePreviewContainer') ||
        document.getElementById('previewContainer');

    const fileNameLabel =
        document.getElementById('selectedFileName') ||
        document.getElementById('imageFileName') ||
        document.getElementById('fileNameLabel');

    if (previewContainer) {
        previewContainer.style.display = 'none';
    }

    if (fileNameLabel) {
        fileNameLabel.innerText =
            'Ningún archivo seleccionado';

        fileNameLabel.style.color = '';
    }

    selectedImageFile = null;
    window.selectedImageFile = null;

    // ----------------------------------------------------------------------
    // RESTAURAR BOTÓN PRINCIPAL
    // ----------------------------------------------------------------------

    const submitBtn =
        document.querySelector(
            '#createProductForm button[type="submit"]'
        );

    if (submitBtn) {
        submitBtn.innerHTML =
            `<i class="fa-solid fa-floppy-disk"></i> Guardar Producto en la Base de Datos`;

        submitBtn.style.backgroundColor = '';
    }

}


// ==========================================================================
// LIMPIAR ATRIBUTOS DEL TIPO DE PRODUCTO
// ==========================================================================

function limpiarAtributosProducto() {

    accountVariantsState.productType = null;
    accountVariantsState.attributes = [];

    const container = getAttributesContainer();

    if (container) {
        container.innerHTML = `
            <div class="attributes-empty-state">
                <i class="fa-solid fa-sliders"></i>
                <p>
                    Selecciona un tipo de producto para cargar sus atributos.
                </p>
            </div>
        `;
    }
}


// ==========================================================================
// AUTODETECTAR TEMA CON IA
// ==========================================================================

async function autodetectarTema() {

    const nombreInput =
        document.getElementById('adminDesignName')?.value?.trim();

    const descriptionInput =
        document.getElementById('adminProductDesc')?.value?.trim() || '';

    if (!nombreInput) {
        alert('Ingresa un nombre de producto primero');
        return;
    }

    try {

        // ==================================================================
        // SOLICITAR CLASIFICACIÓN AL BACKEND
        // ==================================================================

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/categorizar`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    nombreProducto: nombreInput,
                    description: descriptionInput
                })
            }
        );

        const respuesta = await response.json();

        // ==================================================================
        // ERROR HTTP
        // ==================================================================

        if (!response.ok) {

            console.error(
                'Error de clasificación:',
                respuesta
            );

            alert(
                respuesta?.error?.message ||
                respuesta?.error ||
                'No se pudo clasificar el producto.'
            );

            return;
        }

        // ==================================================================
        // VALIDAR RESPUESTA
        // ==================================================================

        if (
            !respuesta.success ||
            !respuesta.data ||
            !respuesta.data.theme ||
            !respuesta.data.subtheme ||
            !respuesta.data.theme.name ||
            !respuesta.data.subtheme.name
        ) {

            console.error(
                'Respuesta de clasificación inválida:',
                respuesta
            );

            alert(
                'La clasificación automática devolvió una respuesta inválida.'
            );

            return;
        }

        const { theme, subtheme } =
            respuesta.data;

        console.log(
            'Tema detectado:',
            theme
        );

        console.log(
            'Subtema detectado:',
            subtheme
        );

        // ==================================================================
        // 1. SELECCIONAR O CREAR THEME
        // ==================================================================
        //
        // La IA devuelve nombres, no IDs.
        //
        // Si el theme ya existe:
        //     → se selecciona la opción existente.
        //
        // Si el theme es nuevo:
        //     → se selecciona __NUEVO__
        //     → se coloca el nombre en el input editable.
        //
        // ==================================================================

        await accountSelects.seleccionarOCrearOpcion(
            'adminTheme',
            theme.name
        );

        // ==================================================================
        // 2. ACTUALIZAR SUBTHEMES SEGÚN EL THEME
        // ==================================================================
        //
        // Si el theme existe, se obtiene internamente su ID y se
        // cargan sus subtemas.
        //
        // Si el theme es nuevo, no existe ID todavía y
        // updateSubthemesBySelectedTheme() prepara el selector
        // de subtema como __NUEVO__.
        //
        // ==================================================================

        await accountSelects.updateSubthemesBySelectedTheme();

        // ==================================================================
        // 3. SELECCIONAR O CREAR SUBTHEME
        // ==================================================================

        // ------------------------------------------------------------------
        // IMPORTANTE:
        // La función pertenece a accountSelects, no a accountTags.
        // ------------------------------------------------------------------

        await accountSelects.seleccionarOCrearOpcion(
            'adminSubtheme',
            subtheme.name
        );

        // ==================================================================
        // 4. VERIFICAR RESULTADO
        // ==================================================================

        const themeSelect =
            document.getElementById('adminTheme');

        const subthemeSelect =
            document.getElementById('adminSubtheme');

        if (!themeSelect) {
            throw new Error(
                'No se encontró el selector de tema.'
            );
        }

        if (!subthemeSelect) {
            throw new Error(
                'No se encontró el selector de subtema.'
            );
        }

        const themeOption =
            themeSelect.options[
            themeSelect.selectedIndex
            ];

        const subthemeOption =
            subthemeSelect.options[
            subthemeSelect.selectedIndex
            ];

        if (!themeOption || !subthemeOption) {
            throw new Error(
                'No se pudieron seleccionar las opciones detectadas.'
            );
        }

        // ==================================================================
        // MOSTRAR RESULTADO EN CONSOLA
        // ==================================================================

        console.log(
            'Theme seleccionado:',
            themeOption.textContent.trim(),
            'ID:',
            themeOption.dataset.themeId || null
        );

        console.log(
            'Subtheme seleccionado:',
            subthemeOption.textContent.trim(),
            'ID:',
            subthemeOption.dataset.subthemeId || null
        );

        console.log(
            '✅ Clasificación automática aplicada correctamente.'
        );

    } catch (error) {

        console.error(
            'Error al autodetectar tema con IA:',
            error
        );

        alert(
            error.message ||
            'No se pudo realizar la clasificación automática.'
        );
    }
}

// ==========================================================================
// INICIALIZACIÓN DEL FORMULARIO DE PRODUCTO
// ==========================================================================

function initProductForm() {


    // Cargar tipos de producto desde el backend
    if (
        window.accountSelects &&
        typeof accountSelects.loadProductTypesForSelect === 'function'
    ) {
        accountSelects.loadProductTypesForSelect();
    }

    // ======================================================================
    // 1. GALERÍA DEL PRODUCTO
    // ======================================================================

    initProductGallery();


    // ======================================================================
    // 1.1 PRECIO BASE
    // ======================================================================

    const basePriceInput =
        document.getElementById('adminBasePrice');

    if (basePriceInput) {

        basePriceInput.addEventListener(
            'input',
            () => {

                accountTags.actualizarPreciosDesdePrecioBase();

            }
        );
    }


    // ======================================================================
    // 2. MODAL DE IMÁGENES DE VARIANTES
    // ======================================================================

    accountVariants.initVariantImagesModalEvents();


    // ======================================================================
    // 3. ENVÍO DEL FORMULARIO 
    // ======================================================================

    const createProductForm =
        document.getElementById('createProductForm');


    if (!createProductForm) return;


    createProductForm.addEventListener(
        'submit',
        async (e) => {

            e.preventDefault();


            // ==============================================================
            // VALIDAR PRODUCTO ANTES DE GUARDAR
            // ==============================================================

            const errores =
                validarProductoAntesDeGuardar();

            if (errores.length > 0) {

                console.log(
                    '❌ Errores de validación:',
                    errores
                );

                mostrarErroresValidacion(errores);

                return;
            }

            // Limpiar errores anteriores si el producto ahora es válido
            mostrarErroresValidacion([]);





            const isEditing =
                Boolean(editingProductId);





            // ==================================================================
            // OBTENER GALERÍA DEL PRODUCTO
            // ==================================================================

            const media =
                Array.isArray(productGalleryState.images)
                    ? productGalleryState.images.map((image, index) => ({
                        storageKey: `assets/${image.fileName}`,
                        isPrimary:
                            image.key ===
                            productGalleryState.primaryImageKey,
                        sortOrder: index
                    }))
                    : [];


            console.log(
                '📸 Galería del producto:',
                media
            );

            // ==================================================================
            // OBTENER VARIANTES
            // ==================================================================

            let variants = [];


            if (
                window.accountVariants &&
                typeof accountVariants.obtenerVariantsPayload === 'function'
            ) {

                variants =
                    accountVariants.obtenerVariantsPayload();

            }


            console.log(
                '🧩 Variantes que se enviarán:',
                variants
            );


            // ==================================================================
            // VALIDACIÓN BÁSICA DE VARIANTES
            // ==================================================================

            if (
                !Array.isArray(variants) ||
                variants.length === 0
            ) {

                alert(
                    'Debes agregar al menos una variante del producto.'
                );

                return;
            }


            // ==================================================================
            // RECOPILAR DATOS DEL PRODUCTO
            // ==================================================================

            const productData = {

                designName:
                    document
                        .getElementById('adminDesignName')
                        ?.value
                        .trim(),

                productTypeName:
                    accountSelects
                        .getProductTypeValue(),

                description:
                    document
                        .getElementById('adminProductDesc')
                        ?.value
                        .trim(),

                basePrice:
                    document
                        .getElementById('adminBasePrice')
                        ?.value,

                discountPercent:
                    document
                        .getElementById('adminDiscountPercent')
                        ?.value,

                categoryName:
                    accountSelects
                        .getFieldValue('adminCategory'),

                themeName:
                    accountSelects
                        .getFieldValue('adminTheme'),

                subthemeName:
                    accountSelects
                        .getFieldValue('adminSubtheme'),

                tags:
                    accountTags.getSelectedTags(),

                media:
                    media,

                variants:
                    variants

            };


            console.log(
                `📦 Enviando [${isEditing ? 'PUT' : 'POST'}] al servidor:`,
                productData
            );


            // ==================================================================
            // GUARDAR MEDIANTE accountProductApi
            // ==================================================================

            try {

                let response;


                if (isEditing) {

                    response =
                        await accountProductApi.updateProduct(
                            editingProductId,
                            productData
                        );

                } else {

                    response =
                        await accountProductApi.createProduct(
                            productData
                        );

                }


                console.log(
                    '✅ Respuesta del servidor:',
                    response
                );


                // ==================================================================
                // FALLBACK: CLASIFICACIÓN MANUAL
                // ==================================================================

                if (
                    !isEditing &&
                    response?.data?.requiresManualClassification === true
                ) {

                    console.log(
                        '⚠️ Gemini no disponible. Se requiere clasificación manual.'
                    );

                    alert(
                        'La clasificación automática no está disponible. ' +
                        'Selecciona manualmente el tema y subtema.'
                    );

                    return;
                }


                // ==================================================================
                // ÉXITO
                // ==================================================================

                const accionTexto =
                    isEditing
                        ? 'actualizado'
                        : 'registrado';


                alert(
                    `¡Éxito! El producto "${productData.designName}" ` +
                    `ha sido ${accionTexto} correctamente.`
                );


                // ==================================================================
                // CANCELAR MODO EDICIÓN
                // ==================================================================

                cancelarModoEdicion();


                // ==================================================================
                // RESET FORMULARIO
                // ==================================================================

                createProductForm.reset();

                // Reiniciar galería
                productGalleryState.images = [];
                productGalleryState.primaryImageKey = null;

                renderProductGallery();


                // ==================================================================
                // REINICIAR VARIANTES
                // ==================================================================

                if (
                    window.accountVariants &&
                    typeof accountVariants.limpiarVariantes === 'function'
                ) {

                    accountVariants.limpiarVariantes();

                }


                // ==================================================================
                // RECARGAR PRODUCTOS ADMINISTRATIVOS
                // ==================================================================

                const productsResponse =
                    await accountProductApi.getProducts();


                const products =
                    productsResponse?.data?.items || [];


                console.log(
                    '🔄 Productos administrativos actualizados:',
                    products
                );


                // Actualizar productos administrativos
                accountSelects.populateCategorizationSelects(
                    products
                );


                // Actualizar tabla
                if (
                    window.accountInventory &&
                    typeof accountInventory.renderAdminProductsTable === 'function'
                ) {

                    accountInventory.renderAdminProductsTable(
                        products
                    );

                }


                // ==================================================================
                // RESTAURAR SELECTS
                // ==================================================================

                const selects = [
                    'adminProductType',
                    'adminCategory',
                    'adminTheme',
                    'adminSubtheme'
                ];


                selects.forEach(id => {

                    const select =
                        document.getElementById(id);

                    if (!select) return;


                    select.value =
                        '__NUEVO__';


                    accountSelects
                        .handleEditableSelectChange(
                            select
                        );

                });


                // ==================================================================
                // IR A LISTA E INVENTARIO
                // ==================================================================

                const listSubtabBtn =
                    document.querySelector(
                        '[data-subtab="product-list"]'
                    );


                if (listSubtabBtn) {

                    listSubtabBtn.click();

                }

            } catch (error) {

                console.error(
                    '❌ Error al guardar/editar producto:',
                    error
                );


                alert(
                    error.message ||
                    'Error de conexión con el servidor.'
                );

            }

        }
    );
}

window.accountProductForm = {
    cargarProductoParaEditar,
    cancelarModoEdicion,
    autodetectarTema,
    initProductForm
};
