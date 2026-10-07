// ==========================================================================
// ACCOUNT CHECKOUT
// ORQUESTADOR DE LAS ETAPAS DEL CHECKOUT
// ==========================================================================


// ==========================================================================
// ESTADO
// ==========================================================================

let accountCheckoutInitialized = false;

let currentCheckoutStep = 'summary';

let checkoutContext = 'account';
// --------------------------------------------------------------------------
// HISTORIAL DEL CHECKOUT
// --------------------------------------------------------------------------

let checkoutHistoryActive = false;

let previousAccountTab = null;


// ==========================================================================
// INICIALIZAR
// ==========================================================================

function init() {

    if (accountCheckoutInitialized) {
        return;
    }

    accountCheckoutInitialized = true;


    // ----------------------------------------------------------------------
    // CLICK
    // ----------------------------------------------------------------------

    document.addEventListener(
        'click',
        handleAccountCheckoutClick
    );


    // ----------------------------------------------------------------------
    // BOTÓN ATRÁS DEL NAVEGADOR
    // ----------------------------------------------------------------------

    window.addEventListener(
        'popstate',
        handleCheckoutPopState
    );


    console.log(
        '✅ Account Checkout inicializado.'
    );

}


function handleAccountCheckoutClick(event) {

    // ======================================================================
    // PROCEDER AL PAGO DESDE EL CARRITO
    // ======================================================================

    const checkoutButton =
        event.target.closest('.account-cart-checkout');

    if (checkoutButton) {

        // --------------------------------------------------------------
        // VALIDAR PRODUCTOS SELECCIONADOS
        // --------------------------------------------------------------

        const selectedCartItemIds =
            window.accountCart?.getSelectedCartItemIds?.() || [];

        if (selectedCartItemIds.length === 0) {

            event.preventDefault();
            event.stopImmediatePropagation();

            showAlert({
                title: 'Selecciona un producto',
                message:
                    'Debes seleccionar al menos un producto para proceder al pago.',
                type: 'info'
            });

            return;
        }

        window.checkout.setCheckoutCartSource('account');
        // --------------------------------------------------------------
        // CONTINUAR AL CHECKOUT
        // --------------------------------------------------------------

        showCheckout();

        return;
    }


    // ======================================================================
    // VOLVER AL CARRITO
    // ======================================================================

    const backButton =
        event.target.closest('#accountCheckoutBack');

    if (backButton) {

        // --------------------------------------------------------------
        // No permitir volver manualmente desde la etapa completada
        // --------------------------------------------------------------

        if (currentCheckoutStep === 'completed') {
            return;
        }

        showCart();

        return;
    }


    // ======================================================================
    // ETAPAS DEL CHECKOUT
    // ======================================================================

    const stepButton =
        event.target.closest('.checkout-status-step');

    if (stepButton && !stepButton.disabled) {

        const step =
            stepButton.dataset.checkoutStep;

        if (step) {
            showStep(step);
        }

        return;
    }
}


// ==========================================================================
// MOSTRAR CHECKOUT
// ==========================================================================

function showCheckout(context = 'account') {

    setCheckoutContext(context);

    const checkoutContent =
        document.getElementById('checkoutContent');

    const checkoutModalContent =
        document.getElementById('checkoutModalContent');

    // ==============================================================
    // CHECKOUT DENTRO DE ACCOUNT
    // ==============================================================

    if (checkoutContext === 'account') {

        const accountContent =
            document.getElementById('accountContent');

        if (!accountContent || !checkoutContent) {

            console.error(
                '❌ No se encontraron los contenedores de cuenta y checkout.'
            );

            return;
        }

        const activeTab =
            document.querySelector(
                '.menu-tab.active'
            );

        previousAccountTab =
            activeTab?.dataset.tab || 'cart';

        if (!checkoutHistoryActive) {

            history.pushState(
                {
                    ...(history.state || {}),
                    endureCheckout: true
                },
                '',
                window.location.href
            );

            checkoutHistoryActive = true;
        }

        accountContent.style.display = 'none';
        checkoutContent.style.display = 'block';

    }

    // ==============================================================
    // CHECKOUT DENTRO DEL MODAL
    // ==============================================================

    if (checkoutContext === 'modal') {

        if (!checkoutModalContent) {

            console.error(
                '❌ No existe #checkoutModalContent.'
            );

            return;
        }

        checkoutModalContent.style.display = 'block';
    }

    // ----------------------------------------------------------------------
    // COMENZAR UN NUEVO CHECKOUT
    // ----------------------------------------------------------------------

    currentCheckoutStep = 'summary';

    // ==============================================================
    // COMENZAR EN RESUMEN
    // ==============================================================

    showStep('summary');

    console.log(
        '✅ Vista de checkout mostrada:',
        checkoutContext
    );
}


function resetCheckoutState() {

    currentCheckoutStep = 'summary';

    checkoutHistoryActive = false;

    previousAccountTab = null;

    console.log(
        '🧹 Estado del checkout restablecido.'
    );

}


// ==========================================================================
// MOSTRAR ETAPA
// ==========================================================================

async function showStep(step) {

    // ----------------------------------------------------------------------
    // BLOQUEO DE NAVEGACIÓN DESDE PEDIDO COMPLETADO
    // ----------------------------------------------------------------------

    if (
        currentCheckoutStep === 'completed' &&
        (
            step === 'summary' ||
            step === 'purchase'
        )
    ) {

        console.warn(
            '⚠️ No se puede regresar a una etapa anterior después de completar el pedido.'
        );

        return;
    }


    // ----------------------------------------------------------------------
    // ELEMENTOS DE LAS ETAPAS
    // ----------------------------------------------------------------------

    const steps = {

        summary:
            document.getElementById(
                'checkoutStepSummary'
            ),

        purchase:
            document.getElementById(
                'checkoutStepPurchase'
            ),

        completed:
            document.getElementById(
                'checkoutStepCompleted'
            )

    };


    const selectedStep =
        steps[step];


    if (!selectedStep) {

        console.warn(
            '⚠️ Etapa de checkout no encontrada:',
            step
        );

        return;
    }


    // ----------------------------------------------------------------------
    // OCULTAR TODAS LAS ETAPAS
    // ----------------------------------------------------------------------

    Object.values(steps).forEach(
        stepElement => {

            if (stepElement) {

                stepElement.style.display =
                    'none';

            }

        }
    );


    // ----------------------------------------------------------------------
    // MOSTRAR ETAPA SELECCIONADA
    // ----------------------------------------------------------------------

    selectedStep.style.display =
        'block';

    currentCheckoutStep =
        step;


    // ----------------------------------------------------------------------
    // CARGAR RESUMEN DEL CHECKOUT
    // ----------------------------------------------------------------------

    if (
        step === 'summary' &&
        window.accountCheckoutSummary
    ) {

        await window.accountCheckoutSummary
            .loadCheckoutSummary();

    }


    // ----------------------------------------------------------------------
    // CARGAR PROCESO DE COMPRA
    // ----------------------------------------------------------------------

    if (
        step === 'purchase' &&
        window.accountCheckoutPurchase
    ) {

        await window.accountCheckoutPurchase
            .loadPurchaseStep();

    }


    // ----------------------------------------------------------------------
    // CARGAR PEDIDO COMPLETADO
    // ----------------------------------------------------------------------

    if (
        step === 'completed' &&
        window.accountCheckoutCompleted
    ) {

        await window.accountCheckoutCompleted
            .loadCompletedStep();

    }


    // ----------------------------------------------------------------------
    // ACTUALIZAR BANNER
    // ----------------------------------------------------------------------

    updateCheckoutStatus(step);


    console.log(
        '🔄 Etapa de checkout:',
        currentCheckoutStep
    );

}


// ==========================================================================
// ACTUALIZAR ESTADO DEL BANNER
// ==========================================================================

function updateCheckoutStatus(step) {

    const statusSteps =
        document.querySelectorAll(
            '.checkout-status-step'
        );


    statusSteps.forEach(button => {

        const buttonStep =
            button.dataset.checkoutStep;


        // ------------------------------------------------------------------
        // LIMPIAR ESTADOS VISUALES
        // ------------------------------------------------------------------

        button.classList.remove(
            'checkout-status-step-completed',
            'checkout-status-step-active'
        );


        // ------------------------------------------------------------------
        // ESTADO DISABLED
        // ------------------------------------------------------------------

        if (step === 'completed') {

            // --------------------------------------------------------------
            // En la etapa final no se puede volver a 1 ni a 2.
            // --------------------------------------------------------------

            if (
                buttonStep === 'summary' ||
                buttonStep === 'purchase'
            ) {

                button.disabled = true;

            }

        } else {

            // --------------------------------------------------------------
            // Al volver a una etapa normal, restaurar navegación.
            // --------------------------------------------------------------

            if (buttonStep === 'summary') {

                button.disabled = false;

            }

            if (buttonStep === 'purchase') {

                button.disabled = false;

            }

            // --------------------------------------------------------------
            // La etapa completed siempre permanece bloqueada hasta
            // que el pago la active.
            // --------------------------------------------------------------

            if (buttonStep === 'completed') {

                button.disabled = true;

            }

        }


        // ------------------------------------------------------------------
        // ETAPA ACTIVA
        // ------------------------------------------------------------------

        if (buttonStep === step) {

            button.classList.add(
                'checkout-status-step-active'
            );

            return;
        }


        // ------------------------------------------------------------------
        // ETAPAS COMPLETADAS
        // ------------------------------------------------------------------

        if (
            (
                step === 'purchase' &&
                buttonStep === 'summary'
            ) ||

            (
                step === 'completed' &&
                (
                    buttonStep === 'summary' ||
                    buttonStep === 'purchase'
                )
            )
        ) {

            button.classList.add(
                'checkout-status-step-completed'
            );

        }

    });

}


// ==========================================================================
// ATRÁS DEL NAVEGADOR
// ==========================================================================

function handleCheckoutPopState(event) {

    // ----------------------------------------------------------------------
    // No estamos dentro de una entrada del checkout
    // ----------------------------------------------------------------------

    if (!checkoutHistoryActive) {

        return;
    }


    // ----------------------------------------------------------------------
    // El usuario salió de la entrada del checkout
    // ----------------------------------------------------------------------

    checkoutHistoryActive =
        false;


    console.log(
        '↩️ Navegación atrás detectada. Saliendo del checkout.'
    );


    // ----------------------------------------------------------------------
    // MOSTRAR CUENTA
    // ----------------------------------------------------------------------

    showCart();


    // ----------------------------------------------------------------------
    // RESTAURAR PANEL ANTERIOR
    // ----------------------------------------------------------------------

    restorePreviousAccountTab();

}

// ----------------------------------------------------------------------
// CONTEXTO DEL CHECKOUT
// ----------------------------------------------------------------------
function setCheckoutContext(context = 'account') {

    checkoutContext =
        context === 'modal'
            ? 'modal'
            : 'account';

    console.log(
        '🛒 Contexto del checkout:',
        checkoutContext
    );
}


// ==========================================================================
// RESTAURAR PANEL DE CUENTA
// ==========================================================================

function restorePreviousAccountTab() {

    const tab =
        previousAccountTab || 'cart';


    const accountTab =
        document.querySelector(
            `.menu-tab[data-tab="${tab}"]`
        );


    if (accountTab) {

        accountTab.click();

        console.log(
            '📂 Panel de cuenta restaurado:',
            tab
        );

    }


    previousAccountTab =
        null;

}


// ==========================================================================
// VOLVER AL CARRITO
// ==========================================================================

function showCart() {

    // ==============================================================
    // MODAL
    // ==============================================================

    if (checkoutContext === 'modal') {

        const checkoutModalContent =
            document.getElementById('checkoutModalContent');

        if (checkoutModalContent) {

            checkoutModalContent.style.display = 'none';

        }

        currentCheckoutStep = 'summary';

        updateCheckoutStatus('summary');

        return;
    }

    // ==============================================================
    // ACCOUNT
    // ==============================================================

    const accountContent =
        document.getElementById('accountContent');

    const checkoutContent =
        document.getElementById('checkoutContent');

    if (!accountContent || !checkoutContent) {

        console.error(
            '❌ No se encontraron los contenedores de cuenta y checkout.'
        );

        return;
    }

    checkoutContent.style.display = 'none';

    accountContent.style.display = '';

    currentCheckoutStep = 'summary';

    updateCheckoutStatus('summary');

    console.log(
        '↩️ Regresando al carrito.'
    );
}


// ==========================================================================
// EXPONER MÓDULO
// ==========================================================================

window.accountCheckout = {

    init,

    showCheckout,

    resetCheckoutState,

    showCart,

    showStep,

    setCheckoutContext,

};