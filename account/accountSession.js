// ==========================================================================
// ACCOUNT SESSION — Verificación de sesión, llenado de UI y logout
// ==========================================================================

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.innerText = value;
    }
}

async function init() {

    const loadingOverlay =
        document.getElementById('loadingOverlay');

    const accountContent =
        document.getElementById('accountContent');

    // ======================================================================
    // 1. VERIFICAR SESIÓN CON EL BACKEND
    // ======================================================================

    try {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/me`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        if (!response.ok) {
            window.location.href = 'auth.html';
            return;
        }

        const data = await response.json();

        const user = data.data.user;

        // ==================================================================
        // 2. RELLENAR DATOS GENERALES DE LA INTERFAZ
        // ==================================================================

        setText(
            'navUserFirstName',
            user.firstName
        );

        setText(
            'userFullNameHeader',
            `${user.firstName} ${user.lastName}`
        );

        setText(
            'userEmailHeader',
            user.email
        );

        setText(
            'sidebarUserName',
            `${user.firstName} ${user.lastName}`
        );

        setText(
            'sidebarUserEmail',
            user.email
        );

        // ==================================================================
        // 3.0. INFORMACIÓN PERSONAL
        // ==================================================================

        if (window.accountProfile) {
            accountProfile.render(user);
            accountProfile.init();
        }

        // ==================================================================
        // 3.1. SECCIÓN SEGURIDAD
        // ==================================================================
        if (window.accountSecurity) {
            accountSecurity.init();
        }

        // ======================================================================
        // 3.2. SECCIÓN DIRECCIONES
        // ======================================================================

        if (window.accountAddresses) {

            accountAddresses.init();

        }


        // ======================================================================
        // 3.3. SECCIÓN MIS COMPRAS
        // ======================================================================

        if (
            window.accountOrders &&
            typeof accountOrders.init === 'function'
        ) {

            accountOrders.init();

        }


        // ======================================================================
        // 3.4. CHECKOUT
        // ======================================================================

        if (window.checkout) {

            await checkout.init(user);

        }

        // ==================================================================
        // 4. MOSTRAR PESTAÑA ADMIN SI ES ADMINISTRADOR
        // ==================================================================

        if (user?.role === 'ADMIN') {

            const adminTabBtn =
                document.getElementById('adminMenuTab');

            if (adminTabBtn) {
                adminTabBtn.style.display = 'flex';
            }
        }

        // ==================================================================
        // 5. MOSTRAR CONTENIDO
        // ==================================================================

        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }

        if (accountContent) {
            accountContent.style.display = 'grid';
        }

        return user;

    } catch (error) {

        console.error(
            'Error cargando datos de usuario:',
            error
        );

        window.location.href = 'auth.html';
    }
}

// ==========================================================================
// CERRAR SESIÓN
// ==========================================================================

async function logout() {

    try {

        const res = await fetch(
            `${CONFIG.API_BASE_URL}/logout`,
            {
                method: 'POST',
                credentials: 'include'
            }
        );

        if (res.ok) {
            window.location.href = 'auth.html';
        }

    } catch (err) {

        console.error(
            'Error al cerrar sesión:',
            err
        );
    }
}

window.accountSession = {
    init,
    logout
};