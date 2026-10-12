
/* ==========================================================================
   APP CHECKOUT MODAL
   ========================================================================== */

let checkoutModalInitialized = false;
let checkoutMarkupLoaded = false;
let checkoutOpenRequest = 0;


/* ==========================================================================
   ELEMENTOS
   ========================================================================== */

function getCheckoutModalElements() {
    const modal = document.getElementById('checkoutModal');

    return {
        modal,
        overlay: modal?.querySelector('.checkout-modal-overlay'),
        closeButton: document.getElementById('checkoutModalClose'),
        loginRequired: document.getElementById('checkoutLoginRequired'),
        loginButton: document.getElementById('checkoutLoginButton'),
        checkoutContent: document.getElementById('checkoutModalContent')
    };
}


/* ==========================================================================
   CARGAR CONTENIDO DEL CHECKOUT AUTENTICADO
   ========================================================================== */

async function loadCheckoutMarkup() {
    if (checkoutMarkupLoaded) {
        return true;
    }

    const container = document.getElementById('checkoutModalContent');

    if (!container) {
        console.error(
            '❌ No existe #checkoutModalContent.'
        );
        return false;
    }

    try {
        const response = await fetch(
            './partials/account/account-checkout.html'
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();

        // Evitar marcar como cargado si el contenedor fue eliminado.
        if (!document.getElementById('checkoutModalContent')) {
            return false;
        }

        container.innerHTML = html;
        checkoutMarkupLoaded = true;

        console.log(
            '✅ Checkout de cuenta cargado dentro del modal.'
        );

        return true;

    } catch (error) {
        console.error(
            '❌ Error cargando account-checkout.html:',
            error
        );

        return false;
    }
}


/* ==========================================================================
   ABRIR MODAL
   ========================================================================== */

async function openCheckoutModal() {
    const requestId = ++checkoutOpenRequest;

    // Asegurar que estén cargados los recursos necesarios.
    if (
        window.resourceLoader &&
        typeof window.resourceLoader.load === 'function'
    ) {
        try {
            await window.resourceLoader.load('appCheckoutModal');
            await window.resourceLoader.load('checkout');
        } catch (error) {
            console.error(
                '❌ No se pudieron cargar los recursos del checkout:',
                error
            );
            return;
        }
    }

    // Si el usuario cerró el modal durante la carga, cancelar.
    if (requestId !== checkoutOpenRequest) {
        return;
    }

    const {
        modal,
        loginRequired,
        checkoutContent
    } = getCheckoutModalElements();

    if (!modal) {
        console.error('❌ No existe #checkoutModal.');
        return;
    }

    if (typeof closeCart === 'function') {
        closeCart();
    }

    // ==========================================================
    // USUARIO NO AUTENTICADO
    // ==========================================================

    if (!window.currentUser) {
        if (checkoutContent) {
            checkoutContent.style.display = 'none';
        }

        if (loginRequired) {
            loginRequired.style.display = 'block';
        }

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';

        return;
    }

    // ==========================================================
    // USUARIO AUTENTICADO
    // ==========================================================

    if (loginRequired) {
        loginRequired.style.display = 'none';
    }

    if (checkoutContent) {
        checkoutContent.style.display = 'block';
    }

    const loaded = await loadCheckoutMarkup();

    // La petición puede haber quedado obsoleta mientras esperaba.
    if (requestId !== checkoutOpenRequest) {
        return;
    }

    if (!loaded) {
        return;
    }

    if (
        !window.accountCheckout ||
        typeof window.accountCheckout.showCheckout !== 'function'
    ) {
        console.error(
            '❌ accountCheckout.showCheckout no está disponible.'
        );
        return;
    }

    if (
        window.checkout &&
        typeof window.checkout.setCheckoutCartSource === 'function'
    ) {
        window.checkout.setCheckoutCartSource('index');
    }

    const backButton = document.getElementById('accountCheckoutBack');

    if (backButton) {
        backButton.style.display = 'none';
    }

    try {
        await window.accountCheckout.showCheckout('modal');
    } catch (error) {
        console.error(
            '❌ Error mostrando el checkout:',
            error
        );
        return;
    }

    // No abrir si el usuario cerró durante la preparación.
    if (requestId !== checkoutOpenRequest) {
        return;
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}


/* ==========================================================================
   CERRAR MODAL
   ========================================================================== */

function closeCheckoutModal() {
    // Invalida cualquier apertura que siga pendiente.
    checkoutOpenRequest++;

    const { modal } = getCheckoutModalElements();

    if (!modal) {
        return;
    }

    modal.classList.remove('open');
    document.body.style.overflow = '';

    const backButton = document.getElementById('accountCheckoutBack');

    if (backButton) {
        backButton.style.display = '';
    }

    if (
        window.accountCheckout &&
        typeof window.accountCheckout.resetCheckoutState === 'function'
    ) {
        window.accountCheckout.resetCheckoutState();
    }
}


/* ==========================================================================
   REDIRECCIÓN AL LOGIN
   ========================================================================== */

function handleCheckoutLogin() {
    sessionStorage.setItem('returnToCheckout', 'true');

    window.location.href = 'auth.html?mode=login';
}


/* ==========================================================================
   INICIALIZACIÓN
   ========================================================================== */

function initCheckoutModal() {
    if (checkoutModalInitialized) {
        return;
    }

    const {
        overlay,
        closeButton,
        loginButton
    } = getCheckoutModalElements();

    if (!document.getElementById('checkoutModal')) {
        console.warn(
            '⚠️ No se puede inicializar checkout: el HTML aún no existe.'
        );
        return;
    }

    checkoutModalInitialized = true;

    closeButton?.addEventListener('click', closeCheckoutModal);
    overlay?.addEventListener('click', closeCheckoutModal);
    loginButton?.addEventListener('click', handleCheckoutLogin);

    console.log('✅ Modal de checkout inicializado.');
}


/* ==========================================================================
   API GLOBAL
   ========================================================================== */

window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.initCheckoutModal = initCheckoutModal;
