async function checkAuthSession() {

    try {

        const response = await window.authApi.getCurrentUser();

        if (response.ok) {

            const authenticated = await response.json();
            // Aquí se muestra el valor de 'authenticated' en la consola
            console.log("Contenido de authenticated:", authenticated);

            authUI.updateNavbarUI(authenticated.data.user);

            return authenticated.data.user;

        }

        authUI.updateNavbarUI(null);

        return null;

    } catch (error) {

        console.error(error);

        authUI.updateNavbarUI(null);

        return null;

    }

}

window.authManager = {

    checkAuthSession

};


