// ==========================================================================
// ACCOUNT SECURITY — Gestión de seguridad de la cuenta
// ==========================================================================

function getElement(id) {
    return document.getElementById(id);
}


// ==========================================================================
// MOSTRAR / OCULTAR CONTRASEÑA
// ==========================================================================

function togglePassword(button) {
    const targetId = button.dataset.target;
    const input = getElement(targetId);

    if (!input) return;

    const icon = button.querySelector('i');

    if (input.type === 'password') {

        input.type = 'text';

        if (icon) {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }

        button.setAttribute(
            'aria-label',
            'Ocultar contraseña'
        );

    } else {

        input.type = 'password';

        if (icon) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }

        button.setAttribute(
            'aria-label',
            'Mostrar contraseña'
        );
    }
}


// ==========================================================================
// VALIDAR COINCIDENCIA DE CONTRASEÑAS
// ==========================================================================

function validatePasswordMatch() {

    const newPassword = getElement('newPassword');
    const confirmPassword = getElement('confirmPassword');
    const message = getElement('passwordMatchMessage');

    if (!newPassword || !confirmPassword || !message) {
        return false;
    }

    if (!confirmPassword.value) {
        message.hidden = true;
        return false;
    }

    if (newPassword.value === confirmPassword.value) {

        message.textContent = 'Las contraseñas coinciden.';
        message.className =
            'password-match-message is-valid';
        message.hidden = false;

        return true;

    }

    message.textContent = 'Las contraseñas no coinciden.';
    message.className =
        'password-match-message is-invalid';
    message.hidden = false;

    return false;
}


// ==========================================================================
// ESTADO DE GUARDADO
// ==========================================================================

function setSavingState(saving) {

    const saveButton = getElement('passwordSaveBtn');
    const saveText = getElement('passwordSaveText');
    const saveLoader = getElement('passwordSaveLoader');

    if (saveButton) {
        saveButton.disabled = saving;
    }

    if (saveText) {
        saveText.hidden = saving;
    }

    if (saveLoader) {
        saveLoader.hidden = !saving;
    }
}


// ==========================================================================
// LIMPIAR FORMULARIO
// ==========================================================================

function resetForm() {

    const form = getElement('passwordForm');

    if (form) {
        form.reset();
    }

    const message = getElement('passwordMatchMessage');

    if (message) {
        message.hidden = true;
        message.textContent = '';
        message.className = 'password-match-message';
    }

    document
        .querySelectorAll('.password-toggle')
        .forEach(button => {

            const targetId = button.dataset.target;
            const input = getElement(targetId);
            const icon = button.querySelector('i');

            if (input) {
                input.type = 'password';
            }

            if (icon) {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }

            button.setAttribute(
                'aria-label',
                'Mostrar contraseña'
            );
        });
}


// ==========================================================================
// CAMBIAR CONTRASEÑA
// ==========================================================================

async function savePassword(event) {

    event.preventDefault();

    const currentPassword =
        getElement('currentPassword');

    const newPassword =
        getElement('newPassword');

    const confirmPassword =
        getElement('confirmPassword');

    if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
    ) {
        console.error(
            '❌ No se encontraron los campos de contraseña.'
        );
        return;
    }


    // --------------------------------------------------------------
    // VALIDACIÓN FRONTEND
    // --------------------------------------------------------------

    if (!currentPassword.value) {
        currentPassword.focus();
        return;
    }

    if (!newPassword.value) {
        newPassword.focus();
        return;
    }


    // --------------------------------------------------------------
    // VALIDACIÓN CENTRALIZADA DE CONTRASEÑA
    // --------------------------------------------------------------

    const passwordValidationResult =
        passwordValidation.validatePassword(newPassword.value);

    if (!passwordValidationResult.isValid) {

        alertModal.show({
            title: 'Contraseña no válida',
            message: passwordValidationResult.message,
            type: 'warning'
        });

        newPassword.focus();
        return;
    }


    // --------------------------------------------------------------
    // VALIDACIÓN DE LONGITUD MÁXIMA
    // --------------------------------------------------------------

    if (newPassword.value.length > 100) {

        alertModal.show({
            title: 'Contraseña no válida',
            message:
                'La nueva contraseña no puede superar los 100 caracteres.',
            type: 'warning'
        });

        newPassword.focus();
        return;
    }


    // --------------------------------------------------------------
    // CONFIRMACIÓN
    // --------------------------------------------------------------

    if (!confirmPassword.value) {
        confirmPassword.focus();
        return;
    }

    if (newPassword.value !== confirmPassword.value) {

        alertModal.show({
            title: 'Contraseñas no coinciden',
            message:
                'La confirmación de contraseña no coincide.',
            type: 'warning'
        });

        confirmPassword.focus();
        return;
    }


    // --------------------------------------------------------------
    // NUEVA CONTRASEÑA DIFERENTE DE LA ACTUAL
    // --------------------------------------------------------------

    if (currentPassword.value === newPassword.value) {

        alertModal.show({
            title: 'Contraseña no válida',
            message:
                'La nueva contraseña debe ser diferente a la actual.',
            type: 'warning'
        });

        newPassword.focus();
        return;
    }


    // --------------------------------------------------------------
    // PETICIÓN
    // --------------------------------------------------------------

    setSavingState(true);

    try {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/me/password`,
            {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: currentPassword.value,
                    newPassword: newPassword.value
                })
            }
        );

        const data = await response.json();


        if (!response.ok) {

            console.error(
                '❌ Error actualizando contraseña:',
                data
            );

            alertModal.show({
                title:
                    'No se pudo actualizar la contraseña',
                message:
                    data.message ||
                    'La contraseña actual es incorrecta.',
                type: 'error'
            });

            return;
        }


        // ----------------------------------------------------------
        // ÉXITO
        // ----------------------------------------------------------

        console.log(
            '✅ Contraseña actualizada correctamente.'
        );

        resetForm();

        alertModal.show({
            title: 'Contraseña actualizada',
            message:
                data.message ||
                'Contraseña actualizada correctamente.',
            type: 'success'
        });


    } catch (error) {

        console.error(
            '❌ Error actualizando contraseña:',
            error
        );

        alertModal.show({
            title: 'Error de conexión',
            message:
                'No se pudo conectar con el servidor.',
            type: 'error'
        });

    } finally {

        setSavingState(false);
    }
}


// ==========================================================================
// INICIALIZACIÓN
// ==========================================================================

function init() {

    const form = getElement('passwordForm');

    if (!form) {
        console.warn(
            '⚠️ No se encontró #passwordForm.'
        );

        return;
    }


    // Mostrar / ocultar contraseña

    document
        .querySelectorAll('.password-toggle')
        .forEach(button => {

            button.addEventListener(
                'click',
                () => togglePassword(button)
            );

        });


    // Validación en tiempo real

    const newPassword =
        getElement('newPassword');

    const confirmPassword =
        getElement('confirmPassword');

    if (newPassword) {
        newPassword.addEventListener(
            'input',
            validatePasswordMatch
        );
    }

    if (confirmPassword) {
        confirmPassword.addEventListener(
            'input',
            validatePasswordMatch
        );
    }


    // Submit

    form.addEventListener(
        'submit',
        savePassword
    );


    // Cancelar

    const cancelButton =
        getElement('passwordCancelBtn');

    if (cancelButton) {

        cancelButton.addEventListener(
            'click',
            resetForm
        );

    }
}


window.accountSecurity = {
    init
};