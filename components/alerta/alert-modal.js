// ==========================================================================
// APP ALERT MODAL — Sistema global de notificaciones
// ==========================================================================

let alertTimeout = null;


// --------------------------------------------------------------------------
// Mostrar notificación
// --------------------------------------------------------------------------

function showAlertModal({
    title = 'Aviso',
    message = '',
    type = 'info',
    duration = 5000
} = {}) {

    const modal = document.getElementById('alertModal');
    const titleElement =
        document.getElementById('alertModalTitle');
    const messageElement =
        document.getElementById('alertModalMessage');
    const iconElement =
        document.getElementById('alertModalIcon');

    if (
        !modal ||
        !titleElement ||
        !messageElement ||
        !iconElement
    ) {
        console.warn(
            '⚠️ Alert modal no está disponible'
        );
        return;
    }

    // ------------------------------------------------------
    // Contenido
    // ------------------------------------------------------

    titleElement.textContent = title;
    messageElement.innerHTML = message;

    // ------------------------------------------------------
    // Tipo de alerta
    // ------------------------------------------------------

    modal.classList.remove(
        'info',
        'success',
        'warning',
        'error'
    );

    modal.classList.add(type);

    // ------------------------------------------------------
    // Icono
    // ------------------------------------------------------

    const icons = {
        info: 'ⓘ',
        success: '✓',
        warning: '!',
        error: '×'
    };

    iconElement.textContent =
        icons[type] || icons.info;

    // ------------------------------------------------------
    // Mostrar
    // ------------------------------------------------------

    // Cancelar temporizador anterior
    if (alertTimeout) {
        clearTimeout(alertTimeout);
        alertTimeout = null;
    }

    modal.classList.remove('open');

    // Forzar reinicio de la animación
    void modal.offsetWidth;

    modal.classList.add('open');

    // ------------------------------------------------------
    // Cierre automático
    // ------------------------------------------------------

    if (duration > 0) {
        alertTimeout = setTimeout(() => {
            closeAlertModal();
        }, duration);
    }
}


// --------------------------------------------------------------------------
// Cerrar notificación
// --------------------------------------------------------------------------

function closeAlertModal() {

    const modal =
        document.getElementById('alertModal');

    if (!modal) return;

    modal.classList.remove('open');

    if (alertTimeout) {
        clearTimeout(alertTimeout);
        alertTimeout = null;
    }
}


// --------------------------------------------------------------------------
// Inicialización
// --------------------------------------------------------------------------

function initAlertModal() {

    const modal =
        document.getElementById('alertModal');

    const closeButton =
        document.getElementById('alertModalClose');

    if (!modal) {
        console.warn(
            '⚠️ Alert modal no está disponible al inicializar'
        );
        return;
    }

    // ------------------------------------------------------
    // Botón cerrar
    // ------------------------------------------------------

    if (closeButton) {
        closeButton.addEventListener(
            'click',
            closeAlertModal
        );
    }

    // ------------------------------------------------------
    // Tecla Escape
    // ------------------------------------------------------

    document.addEventListener(
        'keydown',
        event => {

            if (
                event.key === 'Escape' &&
                modal.classList.contains('open')
            ) {
                closeAlertModal();
            }

        }
    );
}


// ==========================================================================
// API GLOBAL
// ==========================================================================

window.alertModal = {

    init: initAlertModal,

    show: showAlertModal,

    close: closeAlertModal

};