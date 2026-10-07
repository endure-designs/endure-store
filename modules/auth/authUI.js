
// ==========================================================================
// INTERFAZ DE AUTENTICACIÓN
// ==========================================================================

// --------------------------------------------------------------------------
// Actualizar la barra de navegación según el estado de la sesión
// --------------------------------------------------------------------------

function updateNavbarUI(user) {

    const guestUserBtn = document.getElementById('guestUserBtn');
    const userDropdown = document.getElementById('userDropdown');

    if (user) {

        // Usuario autenticado
        guestUserBtn?.style.setProperty('display', 'none');
        userDropdown?.style.setProperty('display', 'inline-block');

        document.getElementById('userFirstName').innerText = user.firstName;
        document.getElementById('userFullName').innerText =
            `${user.firstName} ${user.lastName}`;
        document.getElementById('userEmail').innerText = user.email;

    } else {
        // Usuario visitante
        guestUserBtn?.style.setProperty('display', 'inline-block');
        userDropdown?.style.setProperty('display', 'none');

    }

}

window.authUI = {

    updateNavbarUI

};