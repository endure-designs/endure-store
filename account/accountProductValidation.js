// ==========================================================================
// VALIDACIÓN DEL PRODUCTO ANTES DE GUARDAR
// ==========================================================================

function validarProductoAntesDeGuardar() {

    const errores = [];

    console.log('🔵 INICIO validarProductoAntesDeGuardar');

    console.log('1️⃣ Antes de validarInformacionGeneral');
    validarInformacionGeneral(errores);

    console.log('2️⃣ Antes de validarCategorizacion');
    validarCategorizacion(errores);

    console.log('3️⃣ Antes de validarEtiquetas');
    validarEtiquetas(errores);

    console.log('4️⃣ Antes de validarPrecioBase');
    validarPrecioBase(errores);

    console.log('5️⃣ Antes de validarGaleria');
    validarGaleria(errores);

    console.log('6️⃣ Antes de validarVariantes');
    validarVariantes(errores);

    console.log(
        '🟢 FIN validarProductoAntesDeGuardar',
        errores
    );

    return errores;
}


// ==========================================================================
// INFORMACIÓN GENERAL
// ==========================================================================

function validarInformacionGeneral(errores) {

    const designName =
        document.getElementById('adminDesignName')?.value.trim();

    const productType =
        accountSelects.getProductTypeValue();

    // ----------------------------------------------------------------------
    // NOMBRE
    // ----------------------------------------------------------------------

    if (!designName) {

        errores.push({
            section: 'Información general',
            message: 'Debes ingresar el nombre del diseño.'
        });

    }

    // ----------------------------------------------------------------------
    // TIPO DE PRODUCTO
    // ----------------------------------------------------------------------

    if (!productType) {

        errores.push({
            section: 'Información general',
            message: 'Debes seleccionar o ingresar un tipo de producto.'
        });

    }
}


// ==========================================================================
// CATEGORIZACIÓN
// ==========================================================================

function validarCategorizacion(errores) {

    const category =
        accountSelects.getFieldValue('adminCategory');

    const theme =
        accountSelects.getFieldValue('adminTheme');

    const subtheme =
        accountSelects.getFieldValue('adminSubtheme');

    // ----------------------------------------------------------------------
    // CATEGORÍA
    // ----------------------------------------------------------------------

    if (!category) {

        errores.push({
            section: 'Categorización',
            message: 'Debes seleccionar o ingresar una categoría.'
        });

    }

    // ----------------------------------------------------------------------
    // TEMA
    // ----------------------------------------------------------------------

    if (!theme) {

        errores.push({
            section: 'Categorización',
            message: 'Debes seleccionar o ingresar un tema.'
        });

    }

    // ----------------------------------------------------------------------
    // SUBTEMA
    // ----------------------------------------------------------------------

    if (!subtheme) {

        errores.push({
            section: 'Categorización',
            message: 'Debes seleccionar o ingresar un subtema.'
        });

    }
}


// ==========================================================================
// ETIQUETAS
// ==========================================================================

function validarEtiquetas(errores) {

    const selectedTags =
        accountTags.getSelectedTags();

    const checkedTags =
        document.querySelectorAll(
            '.tag-checkbox:checked'
        );

    // ----------------------------------------------------------------------
    // MÍNIMO UNA ETIQUETA
    // ----------------------------------------------------------------------

    if (selectedTags.length === 0) {

        errores.push({
            section: 'Etiquetas',
            message: 'Debes seleccionar al menos una etiqueta.'
        });

    }

    // ----------------------------------------------------------------------
    // MÁXIMO DOS ETIQUETAS
    // ----------------------------------------------------------------------

    if (checkedTags.length > 2) {

        errores.push({
            section: 'Etiquetas',
            message: 'Puedes seleccionar un máximo de 2 etiquetas.'
        });

    }

    // ----------------------------------------------------------------------
    // OFERTA
    // ----------------------------------------------------------------------

    const ofertaCheck =
        document.getElementById('tagOfertaCheck');

    const discountInput =
        document.getElementById('adminDiscountPercent');

    if (ofertaCheck?.checked) {

        const descuento =
            parseFloat(discountInput?.value);

        if (
            !Number.isFinite(descuento) ||
            descuento <= 0 ||
            descuento >= 100
        ) {

            errores.push({
                section: 'Etiquetas',
                message:
                    'Si la etiqueta Oferta está activa, debes ingresar un descuento válido entre 1% y 99%.'
            });

        }

    }

    // ----------------------------------------------------------------------
    // ETIQUETA PERSONALIZADA
    // ----------------------------------------------------------------------

    const customCheck =
        document.getElementById('customTagCheck');

    const customInput =
        document.getElementById('customTagText');

    if (customCheck?.checked) {

        const customText =
            customInput?.value.trim();

        if (!customText) {

            errores.push({
                section: 'Etiquetas',
                message:
                    'Si seleccionas una etiqueta personalizada, debes ingresar su nombre.'
            });

        }

    }
}


// ==========================================================================
// PRECIO BASE
// ==========================================================================

function validarPrecioBase(errores) {

    const basePriceInput =
        document.getElementById('adminBasePrice');

    const basePrice =
        parseFloat(basePriceInput?.value);

    if (
        !Number.isFinite(basePrice) ||
        basePrice <= 0
    ) {

        errores.push({
            section: 'Configuración de precios',
            message:
                'Debes ingresar un precio base mayor que 0.'
        });
    }
}


// ==========================================================================
// GALERÍA
// ==========================================================================

function validarGaleria(errores) {

    const images =
        Array.isArray(productGalleryState?.images)
            ? productGalleryState.images
            : [];

    const primaryImageKey =
        productGalleryState?.primaryImageKey;

    // ----------------------------------------------------------------------
    // AL MENOS UNA IMAGEN
    // ----------------------------------------------------------------------

    if (images.length === 0) {

        errores.push({
            section: 'Galería',
            message:
                'Debes agregar al menos una imagen a la galería.'
        });

        return;
    }

    // ----------------------------------------------------------------------
    // IMAGEN PRINCIPAL
    // ----------------------------------------------------------------------

    if (!primaryImageKey) {

        errores.push({
            section: 'Galería',
            message:
                'Debes seleccionar una imagen principal.'
        });

        return;
    }

    // ----------------------------------------------------------------------
    // LA PRINCIPAL DEBE EXISTIR EN LA GALERÍA
    // ----------------------------------------------------------------------

    const primaryExists =
        images.some(
            image =>
                image &&
                image.key === primaryImageKey
        );

    if (!primaryExists) {

        errores.push({
            section: 'Galería',
            message:
                'La imagen principal seleccionada no pertenece a la galería.'
        });

    }
}


// ==========================================================================
// VARIANTES
// ==========================================================================

function validarVariantes(errores) {

    const variants =
        accountVariantsState?.variants;

    // ----------------------------------------------------------------------
    // EXISTENCIA DE VARIANTES
    // ----------------------------------------------------------------------

    if (
        !Array.isArray(variants) ||
        variants.length === 0
    ) {

        errores.push({
            section: 'Variantes',
            message:
                'Debes generar al menos una variante.'
        });

        return;
    }

    // ----------------------------------------------------------------------
    // VARIANTE PREDETERMINADA
    // ----------------------------------------------------------------------

    const defaultVariants =
        variants.filter(
            variant =>
                variant &&
                variant.deleted !== true &&
                variant.isDefault === true
        );

    if (defaultVariants.length !== 1) {

        errores.push({
            section: 'Variantes',
            message:
                'Debe existir exactamente una variante predeterminada.'
        });

    }

    // ----------------------------------------------------------------------
    // PRECIO BASE
    // ----------------------------------------------------------------------

    const basePrice =
        parseFloat(
            document.getElementById('adminBasePrice')?.value
        );


    // ----------------------------------------------------------------------
    // VALIDAR CADA VARIANTE
    // ----------------------------------------------------------------------

    variants.forEach(
        (variant, index) => {

            if (variant?.deleted === true) {
                return;
            }

            if (!variant) {

                errores.push({
                    section: 'Variantes',
                    message:
                        `La variante ${index + 1} no es válida.`
                });

                return;
            }

            // --------------------------------------------------------------
            // PRECIOS
            // --------------------------------------------------------------

            const price =
                Number(variant.price);

            const priceExtra =
                Number(variant.priceExtra ?? 0);

            const ofertaActiva =
                document.getElementById('tagOfertaCheck')?.checked === true;

            const discountPercent =
                parseFloat(
                    document.getElementById('adminDiscountPercent')?.value
                );

            const compareAtPrice =
                variant.compareAtPrice === null ||
                    variant.compareAtPrice === '' ||
                    variant.compareAtPrice === undefined
                    ? null
                    : Number(variant.compareAtPrice);


            // --------------------------------------------------------------
            // PRECIO DE VENTA
            // --------------------------------------------------------------

            if (
                !Number.isFinite(price) ||
                price <= 0
            ) {

                errores.push({
                    section: 'Variantes',
                    message:
                        `La variante ${index + 1} debe tener un precio mayor que 0.`
                });

            }


            // --------------------------------------------------------------
            // PRECIO EXTRA
            // --------------------------------------------------------------

            if (
                !Number.isFinite(priceExtra) ||
                priceExtra < 0
            ) {

                errores.push({
                    section: 'Variantes',
                    message:
                        `El valor extra de la variante ${index + 1} no es válido.`
                });

            }


            // --------------------------------------------------------------
            // VALIDACIONES RELACIONADAS CON PRECIO BASE
            // --------------------------------------------------------------

            if (
                Number.isFinite(basePrice) &&
                basePrice > 0 &&
                Number.isFinite(priceExtra) &&
                priceExtra >= 0
            ) {

                const precioNormal =
                    Number(
                        (
                            basePrice +
                            priceExtra
                        ).toFixed(2)
                    );


                // ==============================================================
                // SIN OFERTA
                // ==============================================================

                if (!ofertaActiva) {

                    if (compareAtPrice !== null) {

                        errores.push({
                            section: 'Variantes',
                            message:
                                `La variante ${index + 1} no debe tener precio tachado porque el producto no está en oferta.`
                        });

                    }

                    if (
                        Math.abs(price - precioNormal) > 0.01
                    ) {

                        errores.push({
                            section: 'Variantes',
                            message:
                                `El precio de la variante ${index + 1} debe ser igual al precio base más su valor extra (S/ ${precioNormal.toFixed(2)}).`
                        });

                    }

                }


                // ==============================================================
                // CON OFERTA
                // ==============================================================

                else if (
                    Number.isFinite(discountPercent) &&
                    discountPercent > 0 &&
                    discountPercent < 100
                ) {

                    // ----------------------------------------------------------
                    // El precio tachado debe ser:
                    //
                    // basePrice + priceExtra
                    // ----------------------------------------------------------

                    if (
                        compareAtPrice === null ||
                        Math.abs(
                            compareAtPrice -
                            precioNormal
                        ) > 0.01
                    ) {

                        errores.push({
                            section: 'Variantes',
                            message:
                                `El precio tachado de la variante ${index + 1} debe ser S/ ${precioNormal.toFixed(2)}.`
                        });

                    }


                    // ----------------------------------------------------------
                    // El precio de venta debe aplicar el descuento
                    // ----------------------------------------------------------

                    const precioOfertaEsperado =
                        Number(
                            (
                                precioNormal *
                                (
                                    1 -
                                    discountPercent / 100
                                )
                            ).toFixed(2)
                        );

                    if (
                        Math.abs(
                            price -
                            precioOfertaEsperado
                        ) > 0.01
                    ) {

                        errores.push({
                            section: 'Variantes',
                            message:
                                `El precio de venta de la variante ${index + 1} no coincide con el descuento aplicado. Debe ser S/ ${precioOfertaEsperado.toFixed(2)}.`
                        });

                    }

                }

            }


            // --------------------------------------------------------------
            // STOCK
            // --------------------------------------------------------------

            const inventory =
                variant.inventory || {};

            const stock =
                Number(inventory.stock ?? 0);

            const minimumStock =
                Number(inventory.minimumStock ?? 3);

            const maximumStock =
                inventory.maximumStock === null ||
                    inventory.maximumStock === ''
                    ? null
                    : Number(inventory.maximumStock);

            // --------------------------------------------------------------
            // STOCK
            // --------------------------------------------------------------

            if (
                !Number.isFinite(stock) ||
                stock < 0
            ) {

                errores.push({
                    section: 'Variantes',
                    message:
                        `El stock de la variante ${index + 1} no es válido.`
                });

            }

            // --------------------------------------------------------------
            // STOCK MÍNIMO
            // --------------------------------------------------------------

            if (
                !Number.isFinite(minimumStock) ||
                minimumStock < 0
            ) {

                errores.push({
                    section: 'Variantes',
                    message:
                        `El stock mínimo de la variante ${index + 1} no es válido.`
                });

            }

            // --------------------------------------------------------------
            // STOCK MÁXIMO
            // --------------------------------------------------------------

            if (maximumStock !== null) {

                if (
                    !Number.isFinite(maximumStock) ||
                    maximumStock < 0
                ) {

                    errores.push({
                        section: 'Variantes',
                        message:
                            `El stock máximo de la variante ${index + 1} no es válido.`
                    });

                }
                else if (
                    maximumStock < minimumStock
                ) {

                    errores.push({
                        section: 'Variantes',
                        message:
                            `El stock máximo de la variante ${index + 1} no puede ser menor que el stock mínimo.`
                    });

                }

            }

            // --------------------------------------------------------------
            // ATRIBUTOS
            // --------------------------------------------------------------

            if (
                !Array.isArray(
                    variant.attributeOptionIds
                )
            ) {

                errores.push({
                    section: 'Variantes',
                    message:
                        `La variante ${index + 1} no tiene correctamente definidos sus atributos.`
                });

            }

        }
    );
}




function mostrarErroresValidacion(errores) {

    const container =
        document.getElementById(
            'productValidationErrors'
        );

    if (!container) {
        return;
    }

    if (
        !Array.isArray(errores) ||
        errores.length === 0
    ) {
        container.innerHTML = '';
        container.hidden = true;
        return;
    }

    container.innerHTML = `
        <div class="product-validation-header">

            <i class="fa-solid fa-triangle-exclamation"></i>

            <strong>
                No se puede guardar el producto
            </strong>

        </div>

        <div class="product-validation-list">

            ${errores.map(error => `
                <div class="product-validation-item">

                    <strong>
                        ${escapeHtml(error.section)}
                    </strong>

                    <span>
                        ${escapeHtml(error.message)}
                    </span>

                </div>
            `).join('')}

        </div>
    `;

    container.hidden = false;

    container.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}