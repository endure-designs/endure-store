// ==========================================================================
// ENDURE — Account Addresses API
// Comunicación con la API de direcciones del usuario
// ==========================================================================

const BASE_URL = `${CONFIG.API_BASE_URL}/users/addresses`;

// ==========================================================================
// HELPER — REQUEST
// ==========================================================================

async function request(url, options = {}) {
    const response = await fetch(url, {
        credentials: 'include',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        const message =
            data?.message ||
            'No se pudo completar la solicitud.';

        const error = new Error(message);

        error.status = response.status;
        error.code = data?.code || null;
        error.data = data;

        throw error;
    }

    return data;
}

// ==========================================================================
// LISTAR DIRECCIONES
// ==========================================================================

async function listAddresses() {
    const response = await request(BASE_URL);

    return response.data?.items || [];
}

// ==========================================================================
// OBTENER UNA DIRECCIÓN
// ==========================================================================

async function getAddress(addressId) {
    const response = await request(
        `${BASE_URL}/${addressId}`
    );

    return response.data?.address || null;
}

// ==========================================================================
// CREAR DIRECCIÓN
// ==========================================================================

async function createAddress(addressData) {
    const response = await request(BASE_URL, {
        method: 'POST',
        body: JSON.stringify(addressData)
    });

    return response.data?.address || null;
}

// ==========================================================================
// ACTUALIZAR DIRECCIÓN
// ==========================================================================

async function updateAddress(addressId, addressData) {
    const response = await request(
        `${BASE_URL}/${addressId}`,
        {
            method: 'PATCH',
            body: JSON.stringify(addressData)
        }
    );

    return response.data?.address || null;
}

// ==========================================================================
// ESTABLECER COMO PREDETERMINADA
// ==========================================================================

async function setDefaultAddress(addressId) {
    const response = await request(
        `${BASE_URL}/${addressId}/default`,
        {
            method: 'PATCH'
        }
    );

    return response.data?.address || null;
}

// ==========================================================================
// ELIMINAR DIRECCIÓN
// ==========================================================================

async function deleteAddress(addressId) {
    const response = await request(
        `${BASE_URL}/${addressId}`,
        {
            method: 'DELETE'
        }
    );

    return response.data?.address || null;
}

// ==========================================================================
// EXPORTS
// ==========================================================================

window.accountAddressesApi = {
    listAddresses,
    getAddress,
    createAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress
};