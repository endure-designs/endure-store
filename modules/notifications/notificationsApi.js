// ==========================================================================
// ENDURE - NOTIFICATIONS API
// Comunicación con el backend para dispositivos de notificaciones
// ==========================================================================

window.notificationsApi = {

    async registerDevice(data) {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/notifications/devices`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                credentials: 'include',

                body: JSON.stringify(data)
            }
        );

        let result;

        try {
            result = await response.json();
        } catch (error) {
            throw new Error(
                `El servidor respondió con ${response.status}.`
            );
        }

        if (!response.ok) {

            const message =
                result?.message ||
                result?.error ||
                'No se pudo registrar el dispositivo para notificaciones.';

            throw new Error(message);
        }

        return result;
    }
};