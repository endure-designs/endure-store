// ==========================================================================
// ACCOUNT PROFILE — Gestión de la información personal
// ==========================================================================

let currentUser = null;


// ==========================================================================
// UTILIDADES
// ==========================================================================

function setProfileText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.innerText = value;
    }
}

function getElement(id) {
    return document.getElementById(id);
}


// ==========================================================================
// RENDERIZAR PERFIL
// ==========================================================================

function render(user) {

    if (!user) return;

    currentUser = user;

    // ----------------------------------------------------------------------
    // Información visible
    // ----------------------------------------------------------------------

    setProfileText(
        'profileFullName',
        `${user.firstName} ${user.lastName}`
    );

    setProfileText(
        'profileEmail',
        user.email
    );

    setProfileText(
        'profilePhone',
        user.phone || 'No registrado'
    );

    // ----------------------------------------------------------------------
    // Fecha de registro
    // ----------------------------------------------------------------------

    if (user.createdAt) {

        const dateObj = new Date(user.createdAt);

        setProfileText(
            'profileCreatedAt',
            dateObj.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
        );

    } else {

        setProfileText(
            'profileCreatedAt',
            '-'
        );

    }
}


// ==========================================================================
// INICIAR EDICIÓN
// ==========================================================================

function startEdit() {

    if (!currentUser) return;

    const profileView = getElement('profileView');
    const profileForm = getElement('profileForm');

    const firstNameInput = getElement('profileFirstName');
    const lastNameInput = getElement('profileLastName');
    const emailInput = getElement('profileEmailEdit');
    const phoneInput = getElement('profilePhoneEdit');

    // ----------------------------------------------------------------------
    // Cargar datos actuales en el formulario
    // ----------------------------------------------------------------------

    if (firstNameInput) {
        firstNameInput.value = currentUser.firstName || '';
    }

    if (lastNameInput) {
        lastNameInput.value = currentUser.lastName || '';
    }

    if (emailInput) {
        emailInput.value = currentUser.email || '';
    }

    if (phoneInput) {
        phoneInput.value = currentUser.phone || '';
    }

    // ----------------------------------------------------------------------
    // Cambiar a modo edición
    // ----------------------------------------------------------------------

    if (profileView) {
        profileView.hidden = true;
    }

    if (profileForm) {
        profileForm.hidden = false;
    }

    const editButton = getElement('profileEditBtn');

    if (editButton) {
        editButton.hidden = true;
    }

    // ----------------------------------------------------------------------
    // Enfocar primer campo
    // ----------------------------------------------------------------------

    if (firstNameInput) {
        firstNameInput.focus();
    }
}


// ==========================================================================
// CANCELAR EDICIÓN
// ==========================================================================

function cancelEdit() {

    const profileView = getElement('profileView');
    const profileForm = getElement('profileForm');
    const editButton = getElement('profileEditBtn');

    if (profileForm) {
        profileForm.hidden = true;
    }

    if (profileView) {
        profileView.hidden = false;
    }

    if (editButton) {
        editButton.hidden = false;
    }
}


// ==========================================================================
// ESTADO DE GUARDADO
// ==========================================================================

function setSavingState(saving) {

    const saveButton = getElement('profileSaveBtn');
    const saveText = document.querySelector('.profile-save-text');
    const saveLoader = document.querySelector('.profile-save-loader');

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
// GUARDAR CAMBIOS
// ==========================================================================

async function saveProfile(event) {

    event.preventDefault();

    if (!currentUser) return;

    const firstNameInput = getElement('profileFirstName');
    const lastNameInput = getElement('profileLastName');
    const phoneInput = getElement('profilePhoneEdit');

    if (!firstNameInput || !lastNameInput || !phoneInput) {
        console.error(
            '❌ No se encontraron los campos del formulario de perfil.'
        );
        return;
    }

    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const phone = phoneInput.value.trim();

    // ----------------------------------------------------------------------
    // Validaciones básicas frontend
    // ----------------------------------------------------------------------

    if (!firstName) {
        firstNameInput.focus();
        return;
    }

    if (!lastName) {
        lastNameInput.focus();
        return;
    }

    // ----------------------------------------------------------------------
    // Estado de carga
    // ----------------------------------------------------------------------

    setSavingState(true);

    try {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/me`,
            {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    phone
                })
            }
        );

        const data = await response.json();

        // ------------------------------------------------------------------
        // Error del backend
        // ------------------------------------------------------------------

        if (!response.ok) {

            console.error(
                '❌ Error actualizando perfil:',
                data
            );

            alert(
                data.message ||
                'No se pudo actualizar el perfil.'
            );

            return;
        }

        // ------------------------------------------------------------------
        // Usuario actualizado
        // ------------------------------------------------------------------

        const updatedUser = data?.data?.user;

        if (!updatedUser) {

            console.error(
                '❌ La respuesta no contiene el usuario actualizado.',
                data
            );

            return;
        }

        currentUser = updatedUser;

        // ------------------------------------------------------------------
        // Actualizar vista
        // ------------------------------------------------------------------

        render(currentUser);

        cancelEdit();

        console.log(
            '✅ Perfil actualizado correctamente.'
        );

    } catch (error) {

        console.error(
            '❌ Error actualizando perfil:',
            error
        );

        alert(
            'No se pudo conectar con el servidor.'
        );

    } finally {

        setSavingState(false);

    }
}


// ==========================================================================
// INICIALIZAR EVENTOS
// ==========================================================================

function init() {

    const editButton =
        getElement('profileEditBtn');

    const cancelButton =
        getElement('profileCancelBtn');

    const profileForm =
        getElement('profileForm');

    // ----------------------------------------------------------------------
    // Editar
    // ----------------------------------------------------------------------

    if (editButton) {
        editButton.addEventListener(
            'click',
            startEdit
        );
    }

    // ----------------------------------------------------------------------
    // Cancelar
    // ----------------------------------------------------------------------

    if (cancelButton) {
        cancelButton.addEventListener(
            'click',
            cancelEdit
        );
    }

    // ----------------------------------------------------------------------
    // Guardar
    // ----------------------------------------------------------------------

    if (profileForm) {
        profileForm.addEventListener(
            'submit',
            saveProfile
        );
    }
}


// ==========================================================================
// API PÚBLICA
// ==========================================================================

window.accountProfile = {
    init,
    render,
    startEdit,
    cancelEdit
};