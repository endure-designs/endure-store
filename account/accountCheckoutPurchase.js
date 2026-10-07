// ==========================================================================
// ACCOUNT CHECKOUT PURCHASE
// ==========================================================================

// ==========================================================================
// ESTADO
// ==========================================================================

let accountCheckoutPurchaseInitialized = false;

let selectedPaymentMethod = 'CARD';

let cuotealoAvailable = false;

let savedAddresses = [];

let selectedShippingAddressId = null;

let selectedPickupAddressMode = 'SAVED';

let selectedPickupAddressId = null;

let shippingAddressSelector = null;

let pickupAddressSelector = null;

let sameBillingDocumentType = 'BOLETA';

let useSameBillingAddress = true;

let pickupDocumentType = 'BOLETA';


// ==========================================================================
// INICIALIZAR
// ==========================================================================

function init() {

    if (accountCheckoutPurchaseInitialized) {
        return;
    }

    accountCheckoutPurchaseInitialized = true;

    document.addEventListener(
        'click',
        handleAccountCheckoutPurchaseClick,
        true
    );

    document.addEventListener(
        'change',
        handleBillingAddressChange
    );

}


// ==========================================================================
// CAMBIO DE DIRECCIÓN DE FACTURACIÓN
// ==========================================================================

async function handleBillingAddressChange(event) {

    const checkbox =
        event.target.closest(
            '#checkoutSameBillingAddress'
        );

    if (!checkbox) {
        return;
    }

    await syncBillingAddress();
}


// ==========================================================================
// COMPROBANTE — MISMA DIRECCIÓN DE ENVÍO
// ==========================================================================

function renderSameBillingDocumentType() {

    const container =
        document.getElementById(
            'checkoutSameBillingDocumentType'
        );

    if (!container) {
        return;
    }

    // --------------------------------------------------------------
    // OBTENER DIRECCIÓN DE ENVÍO SELECCIONADA
    // --------------------------------------------------------------

    const shippingAddress =
        savedAddresses.find(
            address =>
                Number(address.id) ===
                Number(selectedShippingAddressId)
        ) || null;

    // --------------------------------------------------------------
    // RENDERIZAR SELECTOR
    // --------------------------------------------------------------

    renderDocumentTypeSelector({

        container,

        address:
            shippingAddress,

        selectedType:
            sameBillingDocumentType,

        inputName:
            'checkoutSameBillingDocumentType',

        onChange:
            type => {

                sameBillingDocumentType =
                    type;

                console.log(
                    '🧾 Comprobante — misma dirección:',
                    sameBillingDocumentType
                );

            }

    });
}


// ==========================================================================
// RENDERIZADOR DE TIPO DE COMPROBANTE
// ==========================================================================

function renderDocumentTypeSelector({
    container,
    address,
    selectedType,
    onChange,
    inputName
}) {

    if (!container) {
        return;
    }

    // --------------------------------------------------------------
    // VERIFICAR DATOS NECESARIOS PARA FACTURA
    // --------------------------------------------------------------

    const invoiceEligibility =
        getInvoiceEligibility(
            address
        );

    const {
        canInvoice
    } = invoiceEligibility;

    // --------------------------------------------------------------
    // DETERMINAR TIPO ACTUAL
    // --------------------------------------------------------------

    let currentType =
        selectedType;

    // --------------------------------------------------------------
    // SI NO CUMPLE LOS REQUISITOS,
    // BOLETA ES LA ÚNICA OPCIÓN VÁLIDA
    // --------------------------------------------------------------

    if (!canInvoice) {

        currentType =
            'BOLETA';

        // Mantener sincronizado el estado externo
        if (
            selectedType === 'FACTURA' &&
            typeof onChange === 'function'
        ) {
            onChange(
                currentType
            );
        }
    }

    // --------------------------------------------------------------
    // RENDER
    // --------------------------------------------------------------

    container.innerHTML = `

        <div class="checkout-billing-document-label">
            Tipo de comprobante
        </div>

        <div class="checkout-billing-document-options">

            <!-- ======================================================
                 BOLETA
                 ====================================================== -->

            <label class="checkout-billing-document-option">

                <input
                    type="radio"
                    name="${inputName}"
                    value="BOLETA"
                    ${currentType === 'BOLETA'
            ? 'checked'
            : ''
        }
                >

                <span>
                    Boleta
                </span>

            </label>


            <!-- ======================================================
                 FACTURA
                 ====================================================== -->

            <label class="checkout-billing-document-option">

                <input
                    type="radio"
                    name="${inputName}"
                    value="FACTURA"
                    ${currentType === 'FACTURA'
            ? 'checked'
            : ''
        }
                >

                <span>
                    Factura
                </span>

            </label>

        </div>
    `;

    // --------------------------------------------------------------
    // EVENTOS
    // --------------------------------------------------------------

    container
        .querySelectorAll(
            `input[name="${inputName}"]`
        )
        .forEach(option => {

            // ----------------------------------------------------------
            // CLICK
            // ----------------------------------------------------------

            option.addEventListener(
                'click',
                event => {

                    // --------------------------------------------------
                    // FACTURA NO DISPONIBLE
                    // --------------------------------------------------

                    if (
                        option.value === 'FACTURA' &&
                        !canInvoice
                    ) {

                        event.preventDefault();

                        const boleta =
                            container.querySelector(
                                'input[value="BOLETA"]'
                            );

                        if (boleta) {
                            boleta.checked = true;
                        }

                        currentType =
                            'BOLETA';

                        const message =
                            getInvoiceUnavailableMessage(
                                invoiceEligibility
                            );

                        window.alertModal?.show({

                            title:
                                'Factura no disponible',

                            message,

                            type:
                                'info'

                        });

                        return;
                    }
                }
            );

            // ----------------------------------------------------------
            // CAMBIO NORMAL
            // ----------------------------------------------------------

            option.addEventListener(
                'change',
                () => {

                    if (!option.checked) {
                        return;
                    }

                    currentType =
                        option.value;

                    if (
                        typeof onChange === 'function'
                    ) {
                        onChange(
                            currentType
                        );
                    }
                }
            );
        });
}

// ==========================================================================
// VALIDAR DATOS PARA FACTURA
// ==========================================================================

function getInvoiceEligibility(address) {

    const hasRucType =
        address?.identificationType?.code === 'RUC';

    const hasRucNumber =
        Boolean(
            address?.identificationNumber?.trim()
        );

    const hasCompanyName =
        Boolean(
            address?.companyName?.trim()
        );

    return {
        hasRucType,
        hasRucNumber,
        hasCompanyName,
        canInvoice:
            hasRucType &&
            hasRucNumber &&
            hasCompanyName
    };
}

// ==========================================================================
// MENSAJE DE FACTURA NO DISPONIBLE
// ==========================================================================

function getInvoiceUnavailableMessage({
    hasRucType,
    hasRucNumber,
    hasCompanyName
}) {

    if (!hasRucType) {

        return (
            'Para emitir una factura, la dirección debe estar registrada con ' +
            '<strong><u>RUC</u></strong> como tipo de identificación.'
        );

    }

    if (!hasRucNumber) {

        return (
            'Para emitir una factura, la dirección debe tener registrado un número de ' +
            '<strong><u>RUC</u></strong>.'
        );

    }

    if (!hasCompanyName) {

        return (
            'Para emitir una factura, la dirección debe tener registrada una ' +
            '<strong><u>Razón social</u></strong>.'
        );

    }

    return (
        'Para emitir una factura, la dirección debe tener registrados correctamente ' +
        '<strong><u>RUC</u></strong> y <strong><u>Razón social</u></strong>.'
    );
}


async function syncBillingAddress() {

    const checkbox =
        document.getElementById(
            'checkoutSameBillingAddress'
        );

    const billingAddress =
        document.getElementById(
            'checkoutBillingAddress'
        );

    const billingContent =
        document.getElementById(
            'checkoutBillingAddressContent'
        );

    const sameBillingDocumentTypeContainer =
        document.getElementById(
            'checkoutSameBillingDocumentType'
        );


    if (
        !checkbox ||
        !billingAddress ||
        !billingContent ||
        !sameBillingDocumentTypeContainer
    ) {
        console.warn(
            '⚠️ Elementos de facturación no encontrados.'
        );

        return;
    }


    // ==============================================================
    // MISMA DIRECCIÓN DE ENVÍO
    // ==============================================================

    if (checkbox.checked) {

        console.log(
            '🧾 Facturación: misma dirección de envío'
        );

        billingAddress.hidden = true;

        sameBillingDocumentTypeContainer.hidden = false;

        renderSameBillingDocumentType();

        return;
    }


    // ==============================================================
    // DIRECCIÓN DE FACTURACIÓN DIFERENTE
    // ==============================================================

    console.log(
        '🧾 Facturación: dirección diferente'
    );

    billingAddress.hidden = false;

    sameBillingDocumentTypeContainer.hidden = true;

    sameBillingDocumentTypeContainer.innerHTML = '';


    // --------------------------------------------------------------
    // RAPID FORM
    // --------------------------------------------------------------

    if (
        window.rapidForm &&
        typeof window.rapidForm.open === 'function'
    ) {

        await window.rapidForm.open(
            billingContent
        );
    }

}


// ==========================================================================
// CARGAR ETAPA DE COMPRA
// ==========================================================================

async function loadPurchaseStep() {

    console.log(
        '🛒 Cargando etapa de proceso de compra...'
    );

    const deliveryMethod =
        window.accountCheckoutSummary?.getDeliveryMethod();

    if (!deliveryMethod) {

        console.warn(
            '⚠️ No se encontró la modalidad de entrega.'
        );

        return;
    }

    console.log(
        '🚚 Modalidad seleccionada:',
        deliveryMethod
    );


    // ----------------------------------------------------------------------
    // CARGAR DIRECCIONES GUARDADAS
    // ----------------------------------------------------------------------

    await loadSavedAddresses();

    await accountCheckoutOrderSummary.load();


    // ----------------------------------------------------------------------
    // MOSTRAR INTERFAZ CORRESPONDIENTE
    // ----------------------------------------------------------------------

    if (deliveryMethod === 'DELIVERY') {

        await renderDeliveryAddressSelection();

        await updateCuotealoAvailability();

        return;
    }


    if (deliveryMethod === 'STORE_PICKUP') {

        await renderPickupAddressSelection();

        await updateCuotealoAvailability();

        return;
    }


    console.warn(
        '⚠️ Modalidad de entrega desconocida:',
        deliveryMethod
    );
}


// ==========================================================================
// ICONO DEL TIPO DE DIRECCIÓN
// ==========================================================================

function getCheckoutAddressTypeIcon(addressType) {

    const icons = {

        HOME:
            'fa-solid fa-house',

        WORK:
            'fa-solid fa-briefcase',

        BUSINESS:
            'fa-solid fa-building',

        OTHER:
            'fa-solid fa-location-dot'

    };

    return (
        icons[addressType] ||
        icons.OTHER
    );
}


// ==========================================================================
// CREAR OPCIONES DE DIRECCIONES
// ==========================================================================

function createAddressSelectorOptions() {

    return savedAddresses.map(address => {

        const locationParts = [
            address.address,
            address.addressNumber
        ].filter(Boolean);

        const geographicPart =
            address.division?.name ||
            '';

        const alias =
            escapeHTML(
                address.alias ||
                'Dirección'
            );

        const recipientName =
            escapeHTML(
                [
                    address.firstName,
                    address.lastName
                ]
                    .filter(Boolean)
                    .join(' ')
            );

        const identification =
            escapeHTML(
                [
                    address.identificationType?.name ||
                    address.identificationType?.code,
                    address.identificationNumber
                ]
                    .filter(Boolean)
                    .join(': ')
            );

        const companyName =
            address.companyName
                ? escapeHTML(
                    `Empresa / Razón Social : ${address.companyName}`
                )
                : '';

        const location =
            escapeHTML(
                locationParts.join(' ')
            );

        const geographicLocation =
            escapeHTML(
                geographicPart
            );

        console.log(
            '🔎 ICONO DIRECCIÓN:',
            address.addressType,
            '→',
            getCheckoutAddressTypeIcon(address.addressType)
        );

        return {

            value:
                Number(address.id),

            icon:
                getCheckoutAddressTypeIcon(
                    address.addressType
                ),

            label:
                alias,

            content: `

                <span class="checkout-selector-address-name">
                    ${alias}
                </span>

                ${recipientName || identification
                    ? `
                            <span class="checkout-selector-address-line">
                                ${recipientName || ''}

                                ${recipientName && identification
                        ? ' · '
                        : ''
                    }

                                ${identification || ''}
                            </span>
                          `
                    : ''
                }

                ${companyName
                    ? `
                            <span class="checkout-selector-address-line">
                                ${companyName}
                            </span>
                          `
                    : ''
                }

                ${location || geographicLocation
                    ? `
                            <span class="checkout-selector-address-line">
                                ${location || ''}

                                ${location && geographicLocation
                        ? ' · '
                        : ''
                    }

                                ${geographicLocation || ''}
                            </span>
                          `
                    : ''
                }

            `
        };
    });
}


// ==========================================================================
// CARGAR DIRECCIONES GUARDADAS
// ==========================================================================

async function loadSavedAddresses() {

    if (
        !window.accountAddressesApi ||
        typeof accountAddressesApi.listAddresses !== 'function'
    ) {

        console.error(
            '❌ accountAddressesApi no está disponible.'
        );

        savedAddresses = [];

        return;
    }

    try {

        savedAddresses =
            await accountAddressesApi.listAddresses();

        if (!Array.isArray(savedAddresses)) {
            savedAddresses = [];
        }

        console.log(
            '📍 Direcciones guardadas:',
            savedAddresses
        );

    } catch (error) {

        console.error(
            '❌ Error cargando direcciones para checkout:',
            error
        );

        savedAddresses = [];
    }
}


// ==========================================================================
// DIRECCIÓN GUARDADA DESDE CHECKOUT
// ==========================================================================

async function handleAddressSaved(savedAddress) {

    if (!savedAddress || !savedAddress.id) {

        console.warn(
            '⚠️ No se recibió una dirección válida después de guardar.'
        );

        return;
    }

    // ----------------------------------------------------------------------
    // ACTUALIZAR LISTA LOCAL DE DIRECCIONES
    // ----------------------------------------------------------------------

    const savedAddressId =
        Number(savedAddress.id);

    const existingIndex =
        savedAddresses.findIndex(
            address =>
                Number(address.id) === savedAddressId
        );

    if (existingIndex >= 0) {

        savedAddresses[existingIndex] =
            savedAddress;

    } else {

        savedAddresses.push(
            savedAddress
        );
    }


    // ----------------------------------------------------------------------
    // OBTENER MODALIDAD DE ENTREGA
    // ----------------------------------------------------------------------

    const deliveryMethod =
        window.accountCheckoutSummary?.getDeliveryMethod();

    if (!deliveryMethod) {

        console.warn(
            '⚠️ No se encontró la modalidad de entrega.'
        );

        return;
    }


    // ----------------------------------------------------------------------
    // DELIVERY
    // ----------------------------------------------------------------------

    if (deliveryMethod === 'DELIVERY') {

        selectedShippingAddressId =
            savedAddressId;

        await renderDeliveryAddressSelection();

        return;
    }


    // ----------------------------------------------------------------------
    // PICKUP
    // ----------------------------------------------------------------------

    if (deliveryMethod === 'STORE_PICKUP') {

        selectedPickupAddressMode =
            'SAVED';

        selectedPickupAddressId =
            savedAddressId;

        await renderPickupAddressSelection();

        return;
    }


    console.warn(
        '⚠️ Modalidad de entrega desconocida:',
        deliveryMethod
    );
}


// ==========================================================================
// DELIVERY
// ==========================================================================

async function renderDeliveryAddressSelection() {

    const deliveryContainer =
        document.getElementById(
            'checkoutDeliveryAddress'
        );

    const pickupContainer =
        document.getElementById(
            'checkoutPickupAddress'
        );

    const billingSection =
        document.querySelector(
            '.checkout-billing-section'
        );

    const selectorContainer =
        document.getElementById(
            'checkoutShippingAddressSelector'
        );


    // ----------------------------------------------------------------------
    // MOSTRAR / OCULTAR SECCIONES
    // ----------------------------------------------------------------------

    if (deliveryContainer) {
        deliveryContainer.hidden = false;
    }

    if (pickupContainer) {
        pickupContainer.hidden = true;
    }

    if (billingSection) {
        billingSection.hidden = false;
    }


    if (!selectorContainer) {

        console.warn(
            '⚠️ No se encontró #checkoutShippingAddressSelector.'
        );

        return;
    }


    // ----------------------------------------------------------------------
    // DESTRUIR SELECTOR ANTERIOR
    // ----------------------------------------------------------------------

    if (shippingAddressSelector) {

        shippingAddressSelector.destroy();

        shippingAddressSelector = null;
    }


    // ----------------------------------------------------------------------
    // SIN DIRECCIONES
    // ----------------------------------------------------------------------

    if (savedAddresses.length === 0) {

        selectedShippingAddressId = null;

        selectorContainer.innerHTML = `
            <div class="checkout-no-addresses">

                <i class="fa-solid fa-location-dot"></i>

                <p>
                    No tienes direcciones guardadas.
                </p>

            </div>
        `;

        return;
    }


    // ----------------------------------------------------------------------
    // BUSCAR DIRECCIÓN PREDETERMINADA
    // ----------------------------------------------------------------------

    if (selectedShippingAddressId === null) {

        const defaultAddress =
            savedAddresses.find(
                address => Boolean(address.isDefault)
            );

        selectedShippingAddressId =
            defaultAddress
                ? Number(defaultAddress.id)
                : Number(savedAddresses[0].id);
    }


    // ----------------------------------------------------------------------
    // CREAR SELECTOR
    // ----------------------------------------------------------------------

    shippingAddressSelector =
        new AppSelector({

            container:
                '#checkoutShippingAddressSelector',

            placeholder:
                'Seleccionar dirección',

            options:
                createAddressSelectorOptions(),

            value:
                selectedShippingAddressId,

            onChange:
                (value) => {

                    selectedShippingAddressId =
                        Number(value);

                    console.log(
                        '📍 Dirección de envío seleccionada:',
                        selectedShippingAddressId
                    );


                    // ----------------------------------------------------------
                    // ACTUALIZAR TIPO DE COMPROBANTE
                    // SI SE USA LA MISMA DIRECCIÓN
                    // ----------------------------------------------------------

                    const checkbox =
                        document.getElementById(
                            'checkoutSameBillingAddress'
                        );

                    if (
                        checkbox?.checked
                    ) {

                        renderSameBillingDocumentType();

                    }

                }

        });


    await syncBillingAddress();

}


// ==========================================================================
// PICKUP
// ==========================================================================

async function renderPickupAddressSelection() {

    const deliveryContainer =
        document.getElementById(
            'checkoutDeliveryAddress'
        );

    const pickupContainer =
        document.getElementById(
            'checkoutPickupAddress'
        );

    const billingSection =
        document.querySelector(
            '.checkout-billing-section'
        );

    const savedChoice =
        document.getElementById(
            'checkoutSavedAddressRadio'
        );

    const newChoice =
        document.getElementById(
            'checkoutNewAddressRadio'
        );

    const savedAddressContainer =
        document.getElementById(
            'checkoutPickupSavedAddress'
        );

    const newAddressContainer =
        document.getElementById(
            'checkoutPickupNewAddress'
        );

    const selectorContainer =
        document.getElementById(
            'checkoutPickupAddressSelector'
        );

    const documentTypeContainer =
        document.getElementById(
            'checkoutPickupDocumentType'
        );


    // ----------------------------------------------------------------------
    // MOSTRAR / OCULTAR SECCIONES
    // ----------------------------------------------------------------------

    if (deliveryContainer) {
        deliveryContainer.hidden = true;
    }

    if (pickupContainer) {
        pickupContainer.hidden = false;
    }

    if (billingSection) {
        billingSection.hidden = true;
    }


    // ----------------------------------------------------------------------
    // SIN DIRECCIONES GUARDADAS
    // ----------------------------------------------------------------------

    if (savedAddresses.length === 0) {

        selectedPickupAddressMode =
            'NEW';

        selectedPickupAddressId =
            null;

        if (savedChoice) {
            savedChoice.checked =
                false;

            savedChoice.disabled =
                true;
        }

        if (newChoice) {
            newChoice.checked =
                true;
        }

        if (savedAddressContainer) {
            savedAddressContainer.hidden =
                true;
        }

        if (newAddressContainer) {
            newAddressContainer.hidden =
                false;
        }

        // --------------------------------------------------------------
        // DESTRUIR SELECTOR DE DIRECCIÓN
        // --------------------------------------------------------------

        if (selectorContainer) {

            if (pickupAddressSelector) {
                pickupAddressSelector.destroy();
                pickupAddressSelector = null;
            }

            selectorContainer.innerHTML = '';
        }

        // --------------------------------------------------------------
        // OCULTAR / LIMPIAR COMPROBANTE DE DIRECCIÓN GUARDADA
        // --------------------------------------------------------------

        if (documentTypeContainer) {
            documentTypeContainer.innerHTML = '';
        }

        // --------------------------------------------------------------
        // MOSTRAR RAPID FORM
        // --------------------------------------------------------------

        const newAddressFormContainer =
            document.getElementById(
                'checkoutPickupNewAddressForm'
            );

        if (
            newAddressFormContainer &&
            window.rapidForm &&
            typeof window.rapidForm.open === 'function'
        ) {

            await window.rapidForm.open(
                newAddressFormContainer
            );
        }

        return;
    }


    // ----------------------------------------------------------------------
    // EXISTEN DIRECCIONES
    // ----------------------------------------------------------------------

    if (savedChoice) {
        savedChoice.disabled =
            false;
    }


    // ----------------------------------------------------------------------
    // DIRECCIÓN PREDETERMINADA
    // ----------------------------------------------------------------------

    if (selectedPickupAddressId === null) {

        const defaultAddress =
            savedAddresses.find(
                address =>
                    Boolean(
                        address.isDefault
                    )
            );

        selectedPickupAddressId =
            defaultAddress
                ? Number(defaultAddress.id)
                : Number(
                    savedAddresses[0].id
                );
    }


    // ----------------------------------------------------------------------
    // MODO DIRECCIÓN GUARDADA
    // ----------------------------------------------------------------------

    if (selectedPickupAddressMode === 'SAVED') {

        if (savedChoice) {
            savedChoice.checked =
                true;
        }

        if (newChoice) {
            newChoice.checked =
                false;
        }

        if (savedAddressContainer) {
            savedAddressContainer.hidden =
                false;
        }

        if (newAddressContainer) {
            newAddressContainer.hidden =
                true;
        }


        // --------------------------------------------------------------
        // DESTRUIR SELECTOR ANTERIOR
        // --------------------------------------------------------------

        if (pickupAddressSelector) {
            pickupAddressSelector.destroy();
            pickupAddressSelector = null;
        }


        // --------------------------------------------------------------
        // CREAR SELECTOR DE DIRECCIÓN
        // --------------------------------------------------------------

        if (selectorContainer) {

            pickupAddressSelector =
                new AppSelector({

                    container:
                        '#checkoutPickupAddressSelector',

                    placeholder:
                        'Seleccionar dirección',

                    options:
                        createAddressSelectorOptions(),

                    value:
                        selectedPickupAddressId,

                    onChange:
                        value => {

                            selectedPickupAddressId =
                                Number(value);

                            console.log(
                                '📍 Dirección de recojo seleccionada:',
                                selectedPickupAddressId
                            );

                            // --------------------------------------------------
                            // ACTUALIZAR COMPROBANTE SEGÚN NUEVA DIRECCIÓN
                            // --------------------------------------------------

                            const pickupAddress =
                                savedAddresses.find(
                                    address =>
                                        Number(address.id) ===
                                        Number(
                                            selectedPickupAddressId
                                        )
                                ) || null;

                            renderDocumentTypeSelector({

                                container:
                                    documentTypeContainer,

                                address:
                                    pickupAddress,

                                selectedType:
                                    pickupDocumentType,

                                inputName:
                                    'checkoutPickupDocumentType',

                                onChange:
                                    type => {

                                        pickupDocumentType =
                                            type;

                                        console.log(
                                            '🧾 Comprobante — pickup:',
                                            pickupDocumentType
                                        );
                                    }
                            });
                        }
                });
        }


        // --------------------------------------------------------------
        // RENDERIZAR COMPROBANTE INICIAL
        // --------------------------------------------------------------

        const pickupAddress =
            savedAddresses.find(
                address =>
                    Number(address.id) ===
                    Number(
                        selectedPickupAddressId
                    )
            ) || null;

        renderDocumentTypeSelector({

            container:
                documentTypeContainer,

            address:
                pickupAddress,

            selectedType:
                pickupDocumentType,

            inputName:
                'checkoutPickupDocumentType',

            onChange:
                type => {

                    pickupDocumentType =
                        type;

                    console.log(
                        '🧾 Comprobante — pickup:',
                        pickupDocumentType
                    );
                }
        });

        return;
    }


    // ----------------------------------------------------------------------
    // MODO NUEVA DIRECCIÓN
    // ----------------------------------------------------------------------

    if (savedChoice) {
        savedChoice.checked =
            false;
    }

    if (newChoice) {
        newChoice.checked =
            true;
    }

    if (savedAddressContainer) {
        savedAddressContainer.hidden =
            true;
    }

    if (newAddressContainer) {
        newAddressContainer.hidden =
            false;
    }


    // ----------------------------------------------------------------------
    // DESTRUIR SELECTOR DE DIRECCIÓN
    // ----------------------------------------------------------------------

    if (pickupAddressSelector) {
        pickupAddressSelector.destroy();
        pickupAddressSelector = null;
    }

    if (selectorContainer) {
        selectorContainer.innerHTML = '';
    }


    // ----------------------------------------------------------------------
    // OCULTAR COMPROBANTE DE DIRECCIÓN GUARDADA
    // ----------------------------------------------------------------------

    if (documentTypeContainer) {
        documentTypeContainer.innerHTML = '';
    }


    // ----------------------------------------------------------------------
    // MOSTRAR RAPID FORM
    // ----------------------------------------------------------------------

    const newAddressFormContainer =
        document.getElementById(
            'checkoutPickupNewAddressForm'
        );

    if (
        newAddressFormContainer &&
        window.rapidForm &&
        typeof window.rapidForm.open === 'function'
    ) {

        await window.rapidForm.open(
            newAddressFormContainer
        );
    }
}

// ==========================================================================
// CLICK
// ==========================================================================

async function handleAccountCheckoutPurchaseClick(event) {


    const checkoutSubmitOrder =
        event.target.closest(
            '#checkoutSubmitOrder'
        );

    if (checkoutSubmitOrder) {

        await handleSubmitOrder();

        return;
    }


    // ======================================================================
    // MÉTODO DE PAGO
    // ======================================================================

    const paymentButton =
        event.target.closest(
            '.account-payment-method'
        );

    if (paymentButton) {

        selectPaymentMethod(paymentButton, event);

        return;
    }


    // ==========================================================================
    // MODALIDAD DE DIRECCIÓN — PICKUP
    // ==========================================================================

    const pickupChoice =
        event.target.closest(
            '.checkout-address-choice'
        );

    if (pickupChoice) {

        const radio =
            pickupChoice.querySelector(
                'input[name="pickupAddressMode"]'
            );

        if (!radio) {
            return;
        }


        // ----------------------------------------------------------------------
        // NO EXISTEN DIRECCIONES GUARDADAS
        // ----------------------------------------------------------------------

        if (radio.disabled) {

            window.alertModal?.show({

                title:
                    'Direcciones guardadas',

                message:
                    'No existen direcciones guardadas. Ingresa una nueva dirección para continuar.',

                type:
                    'info'

            });

            return;
        }


        // ----------------------------------------------------------------------
        // CAMBIAR MODALIDAD
        // ----------------------------------------------------------------------

        selectedPickupAddressMode =
            radio.value;

        await renderPickupAddressSelection();

        return;
    }


    // ==========================================================================
    // AGREGAR NUEVA DIRECCIÓN — DELIVERY
    // ==========================================================================

    const addShippingAddressButton =
        event.target.closest(
            '#checkoutAddShippingAddress'
        );

    if (addShippingAddressButton) {

        const container =
            document.getElementById(
                'checkoutDeliveryNewAddress'
            );

        if (!container) {

            console.warn(
                '⚠️ No se encontró #checkoutDeliveryNewAddress.'
            );

            return;
        }

        if (
            window.accountAddresses &&
            typeof window.accountAddresses
                .openAddressFormInCheckout === 'function'
        ) {

            window.accountAddresses.openAddressFormInCheckout(
                container
            );

        } else {

            console.error(
                '❌ accountAddresses.openAddressFormInCheckout no está disponible.'
            );
        }

        return;
    }

}


// ==========================================================================
// REALIZAR EL PEDIDO
// ==========================================================================

async function handleSubmitOrder() {

    const termsCheckbox =
        document.getElementById(
            'checkoutTermsAccepted'
        );

    if (
        !termsCheckbox ||
        !termsCheckbox.checked
    ) {
        window.alertModal?.show({
            title:
                'Términos y condiciones',

            message:
                'Debes aceptar los términos y condiciones de la web para realizar el pedido.',

            type:
                'info'
        });

        return;
    }


    // ----------------------------------------------------------------------
    // VERIFICAR MÓDULO CHECKOUT
    // ----------------------------------------------------------------------

    if (
        !window.checkout ||
        typeof window.checkout.startCheckout !== 'function'
    ) {
        console.error(
            '❌ El módulo checkout no está disponible.'
        );

        return;
    }


    // ----------------------------------------------------------------------
    // OBTENER DATOS DEL CLIENTE
    // ----------------------------------------------------------------------

    const customerData =
        getCheckoutCustomerData();

    if (!customerData) {
        return;
    }

    console.log(
        '👤 Datos del cliente para checkout:',
        customerData
    );


    // ----------------------------------------------------------------------
    // OBTENER MÉTODO DE PAGO
    // ----------------------------------------------------------------------

    const paymentMethod =
        window.accountCheckoutPurchase
            ?.getSelectedPaymentMethod();

    console.log(
        '💳 Método obtenido para iniciar checkout:',
        paymentMethod
    );


    // ----------------------------------------------------------------------
    // INICIAR CHECKOUT
    // ----------------------------------------------------------------------

    await window.checkout.startCheckout(
        paymentMethod,
        customerData
    );
}


function syncPaymentMethodRadios() {

    const radios = document.querySelectorAll(
        '.account-payment-method-radio'
    );

    radios.forEach(radio => {

        radio.checked =
            radio.value === selectedPaymentMethod;

    });
}


// ==========================================================================
// SELECCIONAR MÉTODO DE PAGO
// ==========================================================================

function selectPaymentMethod(button, event) {

    const paymentMethod =
        button.dataset.paymentMethod;

    if (!paymentMethod) {

        console.warn(
            '⚠️ El botón de pago no tiene data-payment-method.'
        );

        return;
    }

    // --------------------------------------------------------------
    // CUOTÉALO NO DISPONIBLE
    // --------------------------------------------------------------

    if (
        paymentMethod === 'CUOTEALO' &&
        !cuotealoAvailable
    ) {

        event.preventDefault();
        event.stopImmediatePropagation();

        // Mantener visualmente el método anterior
        syncPaymentMethodRadios();

        window.alertModal?.show({

            title:
                'Cuotéalo no disponible',

            message:
                'Cuotéalo está disponible únicamente para órdenes superiores a S/100.',

            type:
                'info'

        });

        return;
    }

    // --------------------------------------------------------------
    // SELECCIONAR MÉTODO
    // --------------------------------------------------------------

    selectedPaymentMethod =
        paymentMethod;

    syncPaymentMethodRadios();

    console.log(
        '💳 Método de pago seleccionado:',
        selectedPaymentMethod
    );
}


async function updateCuotealoAvailability() {

    const cuotealoButton =
        document.querySelector(
            '.account-payment-method[data-payment-method="CUOTEALO"]'
        );

    if (!cuotealoButton) {
        return;
    }

    try {

        const response =
            await apiGetCart();

        if (!response.ok) {
            throw new Error(
                `Error HTTP ${response.status}`
            );
        }

        const cartData =
            await response.json();

        const items =
            cartData?.data?.items ?? [];

        const selectedItems =
            items.filter(
                item =>
                    item.isSelected === true
            );

        const total =
            selectedItems.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.lineTotal ?? 0
                    ),
                0
            );

        console.log(
            '💰 Total para disponibilidad de Cuotéalo:',
            total
        );

        // --------------------------------------------------------------
        // DETERMINAR DISPONIBILIDAD
        // --------------------------------------------------------------

        cuotealoAvailable =
            total > 100;

        // --------------------------------------------------------------
        // ACTUALIZAR APARIENCIA
        // --------------------------------------------------------------

        cuotealoButton.classList.toggle(
            'account-payment-method-disabled',
            !cuotealoAvailable
        );

        // --------------------------------------------------------------
        // SI CUOTÉALO YA NO ESTÁ DISPONIBLE
        // --------------------------------------------------------------

        if (
            !cuotealoAvailable &&
            selectedPaymentMethod === 'CUOTEALO'
        ) {

            selectedPaymentMethod =
                'CARD';
        }

        // --------------------------------------------------------------
        // SINCRONIZAR RADIO CON EL ESTADO REAL
        // --------------------------------------------------------------

        syncPaymentMethodRadios();

        console.log(
            '💳 Método actual:',
            selectedPaymentMethod
        );

        console.log(
            '🟢 Cuotéalo disponible:',
            cuotealoAvailable
        );

    } catch (error) {

        console.error(
            '❌ Error verificando disponibilidad de Cuotéalo:',
            error
        );

        // Por seguridad:
        cuotealoAvailable = false;

        cuotealoButton.classList.add(
            'account-payment-method-disabled'
        );

        if (
            selectedPaymentMethod === 'CUOTEALO'
        ) {

            selectedPaymentMethod =
                'CARD';
        }

        syncPaymentMethodRadios();
    }
}


// ==========================================================================
// OBTENER MÉTODO DE PAGO SELECCIONADO
// ==========================================================================

function getSelectedPaymentMethod() {

    return selectedPaymentMethod;

}


// ==========================================================================
// OBTENER DATOS DEL CLIENTE PARA CHECKOUT
// ==========================================================================

function getCheckoutCustomerData() {

    const deliveryMethod =
        window.accountCheckoutSummary?.getDeliveryMethod();


    // ----------------------------------------------------------------------
    // DIRECCIÓN DE ENVÍO
    // ----------------------------------------------------------------------

    let shippingAddress = null;

    // ======================================================================
    // DELIVERY
    // ======================================================================

    if (deliveryMethod === 'DELIVERY') {

        if (selectedShippingAddressId !== null) {

            shippingAddress =
                savedAddresses.find(
                    address =>
                        Number(address.id) ===
                        Number(selectedShippingAddressId)
                ) || null;
        }
    }


    // ======================================================================
    // STORE PICKUP
    // ======================================================================

    if (deliveryMethod === 'STORE_PICKUP') {

        // --------------------------------------------------------------
        // DIRECCIÓN GUARDADA
        // --------------------------------------------------------------

        if (
            selectedPickupAddressMode === 'SAVED' &&
            selectedPickupAddressId !== null
        ) {

            shippingAddress =
                savedAddresses.find(
                    address =>
                        Number(address.id) ===
                        Number(selectedPickupAddressId)
                ) || null;
        }
    }


    // ----------------------------------------------------------------------
    // FACTURACIÓN
    // ----------------------------------------------------------------------

    const sameBillingAddress =
        deliveryMethod === 'DELIVERY'
            ? (
                document.getElementById(
                    'checkoutSameBillingAddress'
                )?.checked ?? true
            )
            : null;


    let billingFormData = null;
    let billingDocumentType = null;


    // ======================================================================
    // DELIVERY
    // ======================================================================

    if (deliveryMethod === 'DELIVERY') {

        // --------------------------------------------------------------
        // MISMA DIRECCIÓN DE ENVÍO
        // --------------------------------------------------------------

        if (sameBillingAddress) {

            billingDocumentType =
                sameBillingDocumentType;
        }

        // --------------------------------------------------------------
        // DATOS DE FACTURACIÓN DIFERENTES
        // --------------------------------------------------------------

        else {

            if (
                window.rapidForm &&
                typeof window.rapidForm.validateAndGetData === 'function'
            ) {

                const rapidResult =
                    window.rapidForm.validateAndGetData();


                if (!rapidResult.valid) {

                    window.alertModal?.show({
                        title: 'Datos de facturación incompletos',
                        message:
                            rapidResult.errors.join('<br>'),
                        type: 'warning'
                    });

                    return null;
                }


                billingFormData =
                    rapidResult.data;

                billingDocumentType =
                    billingFormData?.documentType ||
                    null;
            }
        }
    }


    // ======================================================================
    // STORE PICKUP
    // ======================================================================

    if (deliveryMethod === 'STORE_PICKUP') {

        // --------------------------------------------------------------
        // FACTURACIÓN CON DIRECCIÓN GUARDADA
        // --------------------------------------------------------------

        if (
            selectedPickupAddressMode === 'SAVED'
        ) {

            billingDocumentType =
                pickupDocumentType;
        }


        // --------------------------------------------------------------
        // FACTURACIÓN MEDIANTE RAPID FORM
        // --------------------------------------------------------------

        if (
            selectedPickupAddressMode === 'NEW'
        ) {

            if (
                window.rapidForm &&
                typeof window.rapidForm.validateAndGetData === 'function'
            ) {

                const rapidResult =
                    window.rapidForm.validateAndGetData();


                if (!rapidResult.valid) {

                    window.alertModal?.show({
                        title: 'Datos de facturación incompletos',
                        message:
                            rapidResult.errors.join('<br>'),
                        type: 'warning'
                    });

                    return null;
                }


                billingFormData =
                    rapidResult.data;

                billingDocumentType =
                    billingFormData?.documentType ||
                    null;
            }
        }
    }


    // ----------------------------------------------------------------------
    // CORREO
    // ----------------------------------------------------------------------

    const billingEmail =
        billingFormData?.email?.trim() ||
        '';

    const shippingEmail =
        shippingAddress?.email?.trim() ||
        '';


    // ----------------------------------------------------------------------
    // RESULTADO
    // ----------------------------------------------------------------------

    return {
        deliveryMethod,

        email:
            billingEmail ||
            shippingEmail ||
            '',

        shippingAddress,

        billingFormData,

        sameBillingAddress,

        billingDocumentType
    };
}

// ==========================================================================
// EXPONER MÓDULO
// ==========================================================================

window.accountCheckoutPurchase = {

    init,

    loadPurchaseStep,

    handleAddressSaved,

    getSelectedPaymentMethod,

    getCheckoutCustomerData,
};