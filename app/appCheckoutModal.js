// ==========================================================================
// APP CHECKOUT MODAL
// ==========================================================================

let checkoutModalInitialized = false;
let checkoutMarkupLoaded = false;


// ==========================================================================
// ELEMENTOS
// ==========================================================================

function getCheckoutModalElements() {

    const modal =
        document.getElementById('checkoutModal');

    const overlay =
        modal?.querySelector('.checkout-modal-overlay');

    const closeButton =
        document.getElementById('checkoutModalClose');

    const loginRequired =
        document.getElementById('checkoutLoginRequired');

    const loginButton =
        document.getElementById('checkoutLoginButton');

    const checkoutContent =
        document.getElementById('checkoutModalContent');

    return {
        modal,
        overlay,
        closeButton,
        loginRequired,
        loginButton,
        checkoutContent
    };
}


async function loadCheckoutMarkup() {

    if (checkoutMarkupLoaded) {
        return true;
    }

    const container =
        document.getElementById(
            'checkoutModalContent'
        );

    if (!container) {

        console.error(
            '❌ No existe #checkoutModalContent.'
        );

        return false;
    }

    try {

        const response =
            await fetch(
                './partials/account/account-checkout.html'
            );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const html =
            await response.text();

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


async function openCheckoutModal() {

    const {
        modal,
        loginRequired,
        checkoutContent
    } = getCheckoutModalElements();

    if (!modal) {
        return;
    }



    window.checkout.setCheckoutCartSource('index');

    // ==============================================================
    // CERRAR CARRITO
    // ==============================================================

    if (typeof closeCart === 'function') {
        closeCart();
    }

    // ==============================================================
    // VALIDAR SESIÓN
    // ==============================================================

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

    // ==============================================================
    // USUARIO AUTENTICADO
    // ==============================================================

    if (loginRequired) {
        loginRequired.style.display = 'none';
    }

    const loaded =
        await loadCheckoutMarkup();

    if (!loaded) {
        return;
    }

    // Ocultar "Volver al carrito" del checkout de cuenta
    const backButton =
        document.getElementById('accountCheckoutBack');

    if (backButton) {
        backButton.style.display = 'none';
    }

    if (checkoutContent) {
        checkoutContent.style.display = 'block';
    }

    // ==============================================================
    // USAR EL CHECKOUT REAL
    // ==============================================================

    if (
        window.accountCheckout &&
        typeof window.accountCheckout.showCheckout === 'function'
    ) {

        window.accountCheckout.showCheckout('modal');

    } else {

        console.error(
            '❌ accountCheckout no está disponible.'
        );

        return;
    }

    modal.classList.add('open');

    document.body.style.overflow = 'hidden';
}


function closeCheckoutModal() {

    const {
        modal
    } = getCheckoutModalElements();

    if (!modal) {
        return;
    }

    modal.classList.remove('open');

    document.body.style.overflow = '';

    const backButton =
        document.getElementById('accountCheckoutBack');

    if (backButton) {
        backButton.style.display = '';
    }

    // ==============================================================
    // FINALIZAR CHECKOUT ACTUAL
    // ==============================================================

    if (
        window.accountCheckout &&
        typeof window.accountCheckout.resetCheckoutState === 'function'
    ) {
        window.accountCheckout.resetCheckoutState();
    }


}


function handleCheckoutLogin() {

    sessionStorage.setItem(
        'returnToCheckout',
        'true'
    );

    window.location.href = 'auth.html';
}


function initCheckoutModal() {

    if (checkoutModalInitialized) {
        return;
    }

    checkoutModalInitialized = true;

    const {
        overlay,
        closeButton,
        loginButton
    } = getCheckoutModalElements();

    if (closeButton) {

        closeButton.addEventListener(
            'click',
            closeCheckoutModal
        );

    }

    if (overlay) {

        overlay.addEventListener(
            'click',
            closeCheckoutModal
        );

    }

    if (loginButton) {

        loginButton.addEventListener(
            'click',
            handleCheckoutLogin
        );

    }

}



window.openCheckoutModal =
    openCheckoutModal;

window.closeCheckoutModal =
    closeCheckoutModal;

window.initCheckoutModal =
    initCheckoutModal;