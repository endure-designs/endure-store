// ==========================================================================
// MODAL DE CONFIRMACIÓN
// ==========================================================================

let confirmationModalInitialized = false;
let confirmationResolve = null;


// ==========================================================================
// INICIALIZACIÓN
// ==========================================================================

function initConfirmationModal() {

    if (confirmationModalInitialized) {
        return;
    }

    const modal = document.getElementById(
        'confirmationModal'
    );

    if (!modal) {
        console.error(
            '❌ No se encontró #confirmationModal.'
        );
        return;
    }

    const cancelBtn = document.getElementById(
        'confirmationModalCancel'
    );

    const confirmBtn = document.getElementById(
        'confirmationModalConfirm'
    );

    const closeBtn = document.getElementById(
        'confirmationModalClose'
    );

    const backdrop = modal.querySelector(
        '.confirmation-modal-backdrop'
    );

    cancelBtn?.addEventListener(
        'click',
        () => resolveConfirmation(false)
    );

    closeBtn?.addEventListener(
        'click',
        () => resolveConfirmation(false)
    );

    backdrop?.addEventListener(
        'click',
        () => resolveConfirmation(false)
    );

    confirmBtn?.addEventListener(
        'click',
        () => resolveConfirmation(true)
    );

    document.addEventListener(
        'keydown',
        handleConfirmationKeydown
    );

    confirmationModalInitialized = true;
}


// ==========================================================================
// MOSTRAR
// ==========================================================================

function showConfirmation(options = {}) {

    initConfirmationModal();

    const modal = document.getElementById(
        'confirmationModal'
    );

    if (!modal) {
        return Promise.resolve(false);
    }

    const title =
        options.title ||
        '¿Confirmar acción?';

    const message =
        options.message ||
        '¿Estás seguro de que deseas continuar?';

    const confirmText =
        options.confirmText ||
        'Confirmar';

    const cancelText =
        options.cancelText ||
        'Cancelar';

    const type =
        options.type ||
        'danger';

    document.getElementById(
        'confirmationModalTitle'
    ).textContent = title;

    document.getElementById(
        'confirmationModalMessage'
    ).textContent = message;

    document.getElementById(
        'confirmationModalConfirm'
    ).textContent = confirmText;

    document.getElementById(
        'confirmationModalCancel'
    ).textContent = cancelText;

    applyConfirmationType(type);

    modal.hidden = false;

    requestAnimationFrame(() => {
        modal.classList.add('is-visible');
    });

    document.body.classList.add(
        'confirmation-modal-open'
    );

    return new Promise(resolve => {

        confirmationResolve = resolve;

    });
}


// ==========================================================================
// RESOLVER
// ==========================================================================

function resolveConfirmation(result) {

    const modal = document.getElementById(
        'confirmationModal'
    );

    if (!modal) {
        return;
    }

    modal.classList.remove('is-visible');

    document.body.classList.remove(
        'confirmation-modal-open'
    );

    setTimeout(() => {

        modal.hidden = true;

    }, 200);

    if (confirmationResolve) {

        const resolve =
            confirmationResolve;

        confirmationResolve = null;

        resolve(result);
    }
}


// ==========================================================================
// TIPO VISUAL
// ==========================================================================

function applyConfirmationType(type) {

    const modal =
        document.getElementById(
            'confirmationModal'
        );

    const icon =
        document.getElementById(
            'confirmationModalIcon'
        );

    const confirmBtn =
        document.getElementById(
            'confirmationModalConfirm'
        );

    if (!modal || !icon || !confirmBtn) {
        return;
    }

    modal.dataset.type = type;

    icon.className =
        'confirmation-modal-icon';

    confirmBtn.className =
        'confirmation-modal-btn';

    if (type === 'warning') {

        icon.innerHTML =
            '<i class="fa-solid fa-triangle-exclamation"></i>';

        icon.classList.add(
            'confirmation-modal-icon-warning'
        );

        confirmBtn.classList.add(
            'confirmation-modal-btn-warning'
        );

    } else {

        icon.innerHTML =
            '<i class="fa-solid fa-trash"></i>';

        icon.classList.add(
            'confirmation-modal-icon-danger'
        );

        confirmBtn.classList.add(
            'confirmation-modal-btn-danger'
        );
    }
}


// ==========================================================================
// TECLADO
// ==========================================================================

function handleConfirmationKeydown(event) {

    const modal = document.getElementById(
        'confirmationModal'
    );

    if (!modal || modal.hidden) {
        return;
    }

    if (event.key === 'Escape') {
        resolveConfirmation(false);
    }
}


// ==========================================================================
// API PÚBLICA
// ==========================================================================

window.confirmationModal = {
    init: initConfirmationModal,
    show: showConfirmation
};