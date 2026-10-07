// ==========================================================================
// ENDURE — Locations API
// Comunicación con la API de países y ubicaciones
// ==========================================================================

const LOCATIONS_BASE_URL =
    `${CONFIG.API_BASE_URL}/locations`;


// ==========================================================================
// REQUEST
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
            'No se pudo obtener la información de ubicación.';

        const error = new Error(message);

        error.status = response.status;
        error.code = data?.code || null;
        error.data = data;

        throw error;
    }

    return data;
}


// ==========================================================================
// COUNTRIES
// ==========================================================================

async function listCountries() {

    const response = await request(
        `${LOCATIONS_BASE_URL}/countries`
    );

    return response.data?.items || [];
}


// ==========================================================================
// COUNTRY
// ==========================================================================

async function getCountry(iso2) {

    if (!iso2) {
        throw new Error(
            'Se requiere el código ISO2 del país.'
        );
    }

    const response = await request(
        `${LOCATIONS_BASE_URL}/countries/${encodeURIComponent(iso2)}`
    );

    return response.data?.country || null;
}


// ==========================================================================
// COUNTRY DIVISIONS
// ==========================================================================

async function listCountryDivisions(iso2) {

    if (!iso2) {
        throw new Error(
            'Se requiere el código ISO2 del país.'
        );
    }

    const response = await request(
        `${LOCATIONS_BASE_URL}/countries/${encodeURIComponent(iso2)}/divisions`
    );

    return {
        items: response.data?.items || [],
        levels: Array.isArray(response.data?.levels)
            ? response.data.levels
            : []
    };
}


// ==========================================================================
// DIVISION CHILDREN
// ==========================================================================

async function listDivisionChildren(divisionId) {

    if (!divisionId) {
        throw new Error(
            'Se requiere el ID de la división administrativa.'
        );
    }

    const response = await request(
        `${LOCATIONS_BASE_URL}/divisions/${encodeURIComponent(divisionId)}/children`
    );

    return response.data?.items || [];
}


// ==========================================================================
// SINGLE DIVISION
// ==========================================================================

async function getDivision(divisionId) {

    if (!divisionId) {
        throw new Error(
            'Se requiere el ID de la división administrativa.'
        );
    }

    const response = await request(
        `${LOCATIONS_BASE_URL}/divisions/${encodeURIComponent(divisionId)}`
    );

    return response.data?.division || null;
}


// ==========================================================================
// EXPORT
// ==========================================================================

window.appLocationApi = {

    listCountries,

    getCountry,

    listCountryDivisions,

    listDivisionChildren,

    getDivision

};