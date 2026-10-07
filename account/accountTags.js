// ==========================================================================
// ACCOUNT TAGS — Etiquetas, descuento y checkboxes
// ==========================================================================

// Control de selección de etiquetas (límite máximo 2)

function handleTagSelection(changedCheckbox) {

    console.log(
        '🏷️ Cambio de etiqueta:',
        {
            id: changedCheckbox?.id,
            value: changedCheckbox?.value,
            checked: changedCheckbox?.checked
        }
    );

    const checkedTags =
        document.querySelectorAll('.tag-checkbox:checked');


    // ----------------------------------------------------------------------
    // Restricción: Máximo 2 etiquetas
    // ----------------------------------------------------------------------

    if (checkedTags.length > 2) {

        changedCheckbox.checked = false;

        alert(
            'Solo puedes seleccionar un máximo de 2 etiquetas por producto.'
        );

        return;
    }


    // ----------------------------------------------------------------------
    // Controlar Oferta
    // ----------------------------------------------------------------------

    const ofertaCheck =
        document.getElementById('tagOfertaCheck');

    const discountWrapper =
        document.getElementById('discountInputWrapper');


    if (ofertaCheck && discountWrapper) {

        // ------------------------------------------------------------------
        // OFERTA ACTIVADA
        // ------------------------------------------------------------------

        console.log('🔎 Estado Oferta:', {
            ofertaChecked: ofertaCheck?.checked,
            discountWrapper: !!discountWrapper,
            discountInput:
                !!document.getElementById(
                    'adminDiscountPercent'
                )
        });


        if (ofertaCheck.checked) {

            console.log(
                '🟢 ENTRÓ A LÓGICA DE OFERTA'
            );

            discountWrapper.style.display =
                'inline-flex';

            document
                .getElementById(
                    'adminDiscountPercent'
                )
                ?.focus();

            // --------------------------------------------------------------
            // Calcular precios de oferta
            // --------------------------------------------------------------

            calcularPrecioConDescuento();

        }


        // ------------------------------------------------------------------
        // OFERTA DESACTIVADA
        // ------------------------------------------------------------------

        else {

            console.log(
                '🔴 OFERTA DESACTIVADA'
            );

            discountWrapper.style.display =
                'none';

            const discountInput =
                document.getElementById('adminDiscountPercent');

            if (discountInput) {
                discountInput.value = '';
            }


            // --------------------------------------------------------------
            // Obtener precio base
            // --------------------------------------------------------------

            const basePriceInput =
                document.getElementById(
                    'adminBasePrice'
                );

            const basePrice =
                basePriceInput
                    ? Number(
                        basePriceInput.value
                    )
                    : NaN;


            // --------------------------------------------------------------
            // Restaurar precios normales
            // --------------------------------------------------------------

            if (
                accountVariantsState &&
                Array.isArray(
                    accountVariantsState.variants
                )
            ) {

                accountVariantsState.variants.forEach(
                    variant => {

                        if (!variant) {
                            return;
                        }


                        // --------------------------------------------------
                        // El precio tachado deja de existir
                        // --------------------------------------------------

                        variant.compareAtPrice =
                            null;


                        // --------------------------------------------------
                        // Restaurar precio de venta normal
                        //
                        // Precio base + diferencia de variante
                        // --------------------------------------------------

                        if (
                            Number.isFinite(basePrice) &&
                            basePrice >= 0
                        ) {

                            const priceExtra =
                                Number(
                                    variant.priceExtra ?? 0
                                );

                            const extraValido =
                                Number.isFinite(
                                    priceExtra
                                )
                                    ? priceExtra
                                    : 0;


                            variant.price =
                                Number(
                                    (
                                        basePrice +
                                        extraValido
                                    ).toFixed(2)
                                );
                        }
                    }
                );
            }


            // --------------------------------------------------------------
            // Actualizar tarjetas
            // --------------------------------------------------------------

            renderVariants();
        }
    }


    // ----------------------------------------------------------------------
    // Auto-marcar checkbox de personalizada si se selecciona
    // ----------------------------------------------------------------------

    if (
        changedCheckbox.id === 'customTagCheck' &&
        changedCheckbox.checked
    ) {

        document
            .getElementById('customTagText')
            ?.focus();
    }
}

// Activar checkbox al escribir en "Otra etiqueta"
function handleCustomTagInput(inputElement) {
    const customCheck = document.getElementById('customTagCheck');
    if (!customCheck) return;

    if (inputElement.value.trim() !== '') {
        if (!customCheck.checked) {
            customCheck.click(); // Intenta marcar respetando el límite de 2
        }
    } else {
        customCheck.checked = false;
    }
}


// ==========================================================================
// CALCULAR PRECIO DE OFERTA
// ==========================================================================

function calcularPrecioConDescuento(
    index = null
) {

    const ofertaCheck =
        document.getElementById('tagOfertaCheck');

    const discountInput =
        document.getElementById('adminDiscountPercent');

    // ----------------------------------------------------------------------
    // OFERTA DEBE ESTAR ACTIVA
    // ----------------------------------------------------------------------

    if (
        !ofertaCheck ||
        !ofertaCheck.checked
    ) {
        return;
    }

    if (!discountInput) {
        return;
    }

    // ----------------------------------------------------------------------
    // OBTENER DESCUENTO
    // ----------------------------------------------------------------------

    const descuentoPorcentaje =
        parseFloat(
            discountInput.value
        );

    if (
        isNaN(descuentoPorcentaje) ||
        descuentoPorcentaje <= 0 ||
        descuentoPorcentaje >= 100
    ) {
        return;
    }

    // ----------------------------------------------------------------------
    // VALIDAR VARIANTES
    // ----------------------------------------------------------------------

    if (
        !accountVariantsState ||
        !Array.isArray(
            accountVariantsState.variants
        )
    ) {
        return;
    }

    // ----------------------------------------------------------------------
    // OBTENER PRECIO BASE DEL PRODUCTO
    // ----------------------------------------------------------------------

    const basePrice =
        Number(
            obtenerPrecioBase()
        );

    if (
        !Number.isFinite(basePrice) ||
        basePrice <= 0
    ) {
        return;
    }

    // ----------------------------------------------------------------------
    // FACTOR DE DESCUENTO
    // ----------------------------------------------------------------------

    const factorDescuento =
        1 -
        (
            descuentoPorcentaje / 100
        );

    // ----------------------------------------------------------------------
    // DETERMINAR VARIANTES A PROCESAR
    // ----------------------------------------------------------------------

    const variants =
        index === null
            ? accountVariantsState.variants
            : [
                accountVariantsState.variants[index]
            ];

    // ----------------------------------------------------------------------
    // CALCULAR PRECIOS
    // ----------------------------------------------------------------------

    variants.forEach(
        (variant) => {

            if (!variant) {
                return;
            }

            // --------------------------------------------------------------
            // VALOR EXTRA DE LA VARIANTE
            // --------------------------------------------------------------

            const priceExtra =
                Number(
                    variant.priceExtra ?? 0
                );

            const extraValido =
                Number.isFinite(priceExtra)
                    ? priceExtra
                    : 0;

            // --------------------------------------------------------------
            // PRECIO TACHADO
            //
            // Precio base del producto
            // +
            // diferencia específica de la variante
            // --------------------------------------------------------------

            const precioTachado =
                basePrice +
                extraValido;

            if (
                !Number.isFinite(precioTachado) ||
                precioTachado <= 0
            ) {
                variant.price = null;
                variant.compareAtPrice = null;
                return;
            }

            // --------------------------------------------------------------
            // PRECIO DE VENTA
            //
            // Se aplica el descuento sobre el precio tachado.
            // --------------------------------------------------------------

            const precioOferta =
                precioTachado *
                factorDescuento;

            variant.compareAtPrice =
                Number(
                    precioTachado.toFixed(2)
                );

            variant.price =
                Number(
                    precioOferta.toFixed(2)
                );
        }
    );

    // ----------------------------------------------------------------------
    // ACTUALIZAR INTERFAZ
    // ----------------------------------------------------------------------

    renderVariants();
}

// ==========================================================================
// ACTUALIZAR PRECIOS DESDE PRECIO BASE
// ==========================================================================

function actualizarPreciosDesdePrecioBase() {

    const basePriceInput =
        document.getElementById('adminBasePrice');

    // ----------------------------------------------------------------------
    // VALIDAR CAMPO
    // ----------------------------------------------------------------------

    if (!basePriceInput) {
        return;
    }

    // ----------------------------------------------------------------------
    // OBTENER PRECIO BASE
    // ----------------------------------------------------------------------

    const basePrice =
        parseFloat(
            basePriceInput.value
        );

    // ----------------------------------------------------------------------
    // PRECIO BASE INVÁLIDO
    // ----------------------------------------------------------------------

    if (
        isNaN(basePrice) ||
        basePrice <= 0
    ) {
        return;
    }

    // ----------------------------------------------------------------------
    // VALIDAR ESTADO DE VARIANTES
    // ----------------------------------------------------------------------

    if (
        !accountVariantsState ||
        !Array.isArray(
            accountVariantsState.variants
        )
    ) {
        return;
    }

    // ----------------------------------------------------------------------
    // ACTUALIZAR CADA VARIANTE
    //
    // El priceExtra NO se modifica.
    // Solamente se recalcula el precio a partir de:
    //
    // basePrice + priceExtra
    // ----------------------------------------------------------------------

    accountVariantsState.variants.forEach(
        variant => {

            if (!variant) {
                return;
            }

            // --------------------------------------------------------------
            // OBTENER VALOR EXTRA
            // --------------------------------------------------------------

            const priceExtra =
                Number(
                    variant.priceExtra ?? 0
                );

            const extraValido =
                Number.isFinite(priceExtra)
                    ? priceExtra
                    : 0;

            // --------------------------------------------------------------
            // PRECIO NORMAL DE LA VARIANTE
            // --------------------------------------------------------------

            const precioVariante =
                basePrice +
                extraValido;

            // --------------------------------------------------------------
            // GUARDAR PRECIO
            // --------------------------------------------------------------

            variant.price =
                Number(
                    precioVariante.toFixed(2)
                );

            // --------------------------------------------------------------
            // EL PRECIO TACHADO SE REINICIA AQUÍ.
            //
            // Si Oferta está activa, calcularPrecioConDescuento()
            // lo volverá a calcular inmediatamente.
            // --------------------------------------------------------------

            variant.compareAtPrice = null;
        }
    );

    // ----------------------------------------------------------------------
    // COMPROBAR OFERTA
    // ----------------------------------------------------------------------

    const ofertaCheck =
        document.getElementById(
            'tagOfertaCheck'
        );

    const discountInput =
        document.getElementById(
            'adminDiscountPercent'
        );

    const descuentoPorcentaje =
        discountInput
            ? parseFloat(
                discountInput.value
            )
            : NaN;

    // ----------------------------------------------------------------------
    // CON OFERTA
    // ----------------------------------------------------------------------

    if (
        ofertaCheck &&
        ofertaCheck.checked &&
        !isNaN(descuentoPorcentaje) &&
        descuentoPorcentaje > 0 &&
        descuentoPorcentaje < 100
    ) {

        calcularPrecioConDescuento();

        return;
    }

    // ----------------------------------------------------------------------
    // SIN OFERTA
    // ----------------------------------------------------------------------

    renderVariants();
}


// ==========================================================================
// OBTENER LAS ETIQUETAS SELECCIONADAS AL GUARDAR EL PRODUCTO
// ==========================================================================

function getSelectedTags() {

    const selectedTags = [];

    const checkedBoxes =
        document.querySelectorAll(
            '.tag-checkbox:checked'
        );

    checkedBoxes.forEach(cb => {

        // ------------------------------------------------------------------
        // ETIQUETA PERSONALIZADA
        // ------------------------------------------------------------------

        if (cb.value === '__CUSTOM__') {

            const customText =
                document
                    .getElementById('customTagText')
                    ?.value
                    .trim();

            if (customText) {
                selectedTags.push(customText);
            }

            return;
        }


        // ------------------------------------------------------------------
        // ETIQUETA OFERTA
        // ------------------------------------------------------------------

        if (cb.id === 'tagOfertaCheck') {

            const discountInput =
                document.getElementById(
                    'adminDiscountPercent'
                );

            const discount =
                discountInput
                    ? parseFloat(
                        discountInput.value
                    )
                    : NaN;

            // --------------------------------------------------------------
            // Solo guardar la etiqueta si existe un descuento válido
            // --------------------------------------------------------------

            if (
                Number.isFinite(discount) &&
                discount > 0 &&
                discount < 100
            ) {

                selectedTags.push(
                    `${discount}% OFF`
                );
            }

            return;
        }


        // ------------------------------------------------------------------
        // RESTO DE ETIQUETAS
        // ------------------------------------------------------------------

        if (cb.value) {
            selectedTags.push(
                cb.value
            );
        }
    });

    return selectedTags;
}

// ==========================================================================
// MARCAR ETIQUETAS AL EDITAR UN PRODUCTO EXISTENTE
// ==========================================================================

function restablecerCheckboxesEtiquetas(
    tagsData,
    discountPercent = null
) {

    // ----------------------------------------------------------------------
    // 1. DESMARCAR TODAS LAS ETIQUETAS
    // ----------------------------------------------------------------------

    document
        .querySelectorAll('.tag-checkbox')
        .forEach(cb => {
            cb.checked = false;
        });


    // ----------------------------------------------------------------------
    // 2. OCULTAR Y LIMPIAR PORCENTAJE DE DESCUENTO
    // ----------------------------------------------------------------------

    const discountWrapper =
        document.getElementById(
            'discountInputWrapper'
        );

    const discountInput =
        document.getElementById(
            'adminDiscountPercent'
        );

    if (discountWrapper) {
        discountWrapper.style.display = 'none';
    }

    if (discountInput) {
        discountInput.value = '';
    }


    // ----------------------------------------------------------------------
    // 3. LIMPIAR ETIQUETA PERSONALIZADA
    // ----------------------------------------------------------------------

    const customInput =
        document.getElementById(
            'customTagText'
        );

    if (customInput) {
        customInput.value = '';
    }

    const customCheck =
        document.getElementById(
            'customTagCheck'
        );

    if (customCheck) {
        customCheck.checked = false;
    }


    // ----------------------------------------------------------------------
    // 4. NORMALIZAR A ARRAY
    // ----------------------------------------------------------------------

    if (!tagsData) {
        return;
    }

    const tagsArray =
        Array.isArray(tagsData)
            ? tagsData
            : [tagsData];


    // ----------------------------------------------------------------------
    // 5. PROCESAR CADA ETIQUETA
    // ----------------------------------------------------------------------

    tagsArray.forEach(tagData => {

        if (!tagData) {
            return;
        }


        // ------------------------------------------------------------------
        // El backend devuelve normalmente:
        //
        // {
        //     id,
        //     name,
        //     slug
        // }
        //
        // También mantenemos compatibilidad con strings.
        // ------------------------------------------------------------------

        const tagName =
            typeof tagData === 'object'
                ? tagData.name
                : tagData;

        if (!tagName) {
            return;
        }


        const normalizedTagName =
            String(tagName)
                .trim()
                .toLowerCase();


        // ------------------------------------------------------------------
        // OFERTA
        // ------------------------------------------------------------------
        //
        // La etiqueta almacenada ahora será, por ejemplo:
        //
        // "10% OFF"
        //
        // pero el checkbox sigue teniendo:
        //
        // value="Oferta"
        //
        // Por eso Oferta se detecta por el formato de la etiqueta.
        // ------------------------------------------------------------------

        const isOfertaTag =
            /^\d+(?:\.\d+)?%\s*off$/i.test(
                String(tagName).trim()
            );


        if (isOfertaTag) {

            const ofertaCheck =
                document.getElementById(
                    'tagOfertaCheck'
                );

            if (ofertaCheck) {
                ofertaCheck.checked = true;
            }

            // --------------------------------------------------------------
            // Utilizar el porcentaje oficial del producto
            // --------------------------------------------------------------

            const porcentaje =
                Number(discountPercent);

            if (
                discountInput &&
                Number.isFinite(porcentaje) &&
                porcentaje > 0 &&
                porcentaje < 100
            ) {

                discountInput.value =
                    porcentaje;

            }

            if (discountWrapper) {
                discountWrapper.style.display =
                    'inline-flex';
            }

            return;
        }


        // ------------------------------------------------------------------
        // BUSCAR CHECKBOX DE ETIQUETA ESTÁNDAR
        // ------------------------------------------------------------------

        const foundCheckbox =
            Array
                .from(
                    document.querySelectorAll(
                        '.tag-checkbox'
                    )
                )
                .find(cb => {

                    // No volver a tratar Oferta como
                    // una etiqueta estándar.
                    if (
                        cb.id ===
                        'tagOfertaCheck'
                    ) {
                        return false;
                    }

                    const checkboxValue =
                        String(
                            cb.value || ''
                        )
                            .trim()
                            .toLowerCase();

                    return (
                        checkboxValue ===
                        normalizedTagName
                    );
                });


        // ------------------------------------------------------------------
        // ETIQUETA ESTÁNDAR
        // ------------------------------------------------------------------

        if (foundCheckbox) {

            foundCheckbox.checked = true;

            return;
        }


        // ------------------------------------------------------------------
        // ETIQUETA PERSONALIZADA
        // ------------------------------------------------------------------

        if (
            customCheck &&
            customInput
        ) {

            customCheck.checked = true;

            customInput.value =
                String(tagName).trim();
        }

    });
}

// ==========================================================================
// DESACTIVAR OFERTA
// ==========================================================================

function desactivarOferta() {

    const basePriceInput =
        document.getElementById('adminBasePrice');

    const discountInput =
        document.getElementById('adminDiscountPercent');

    // ----------------------------------------------------------------------
    // OBTENER PRECIO BASE
    // ----------------------------------------------------------------------

    const basePrice =
        basePriceInput
            ? Number(basePriceInput.value)
            : NaN;

    // ----------------------------------------------------------------------
    // LIMPIAR DESCUENTO
    // ----------------------------------------------------------------------

    if (discountInput) {
        discountInput.value = '';
    }

    // ----------------------------------------------------------------------
    // ACTUALIZAR VARIANTES
    // ----------------------------------------------------------------------

    if (
        !accountVariantsState ||
        !Array.isArray(accountVariantsState.variants)
    ) {
        return;
    }

    accountVariantsState.variants.forEach(
        variant => {

            if (!variant) {
                return;
            }

            // --------------------------------------------------------------
            // EL PRECIO TACHADO DEJA DE EXISTIR
            // --------------------------------------------------------------

            variant.compareAtPrice = null;

            // --------------------------------------------------------------
            // RESTAURAR PRECIO NORMAL
            //
            // basePrice + priceExtra
            // --------------------------------------------------------------

            if (
                Number.isFinite(basePrice) &&
                basePrice >= 0
            ) {

                const priceExtra =
                    Number(
                        variant.priceExtra ?? 0
                    );

                const extraValido =
                    Number.isFinite(priceExtra)
                        ? priceExtra
                        : 0;

                variant.price =
                    Number(
                        (
                            basePrice +
                            extraValido
                        ).toFixed(2)
                    );
            }
        }
    );

    // ----------------------------------------------------------------------
    // OCULTAR CAMPO DE DESCUENTO
    // ----------------------------------------------------------------------

    const discountWrapper =
        document.getElementById(
            'discountInputWrapper'
        );

    if (discountWrapper) {
        discountWrapper.style.display = 'none';
    }

    // ----------------------------------------------------------------------
    // RENDERIZAR VARIANTES
    // ----------------------------------------------------------------------

    if (
        typeof renderVariants === 'function'
    ) {
        renderVariants();
    }
}

window.accountTags = {
    handleTagSelection,
    handleCustomTagInput,
    calcularPrecioConDescuento,
    actualizarPreciosDesdePrecioBase,
    getSelectedTags,
    restablecerCheckboxesEtiquetas,
    desactivarOferta
};
