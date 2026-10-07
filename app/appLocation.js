// ==========================================================================
// ENDURE — Location Manager
// Gestión global de países y ubicaciones
// ==========================================================================

const countriesCache = new Map();
const divisionsCache = new Map();

// ==========================================================================
// COUNTRIES
// ==========================================================================

async function getCountries() {

    if (countriesCache.has('all')) {

        return countriesCache.get('all');
    }

    const countries =
        await appLocationApi.listCountries();

    countriesCache.set('all', countries);

    return countries;
}

// ==========================================================================
// COUNTRY
// ==========================================================================

async function getCountry(iso2) {

    const key = String(iso2).trim().toUpperCase();

    if (!key) {
        return null;
    }

    if (countriesCache.has(key)) {
        return countriesCache.get(key);
    }

    const country =
        await appLocationApi.getCountry(key);

    if (country) {
        countriesCache.set(key, country);
    }

    return country;
}

// ==========================================================================
// COUNTRY DIVISIONS
// ==========================================================================

async function getCountryDivisions(iso2) {

    const key = String(iso2).trim().toUpperCase();

    if (!key) {
        return {
            items: [],
            levels: []
        };
    }

    const cacheKey = `country:${key}`;

    if (divisionsCache.has(cacheKey)) {
        return divisionsCache.get(cacheKey);
    }

    const result =
        await appLocationApi.listCountryDivisions(key);

    const normalizedResult = {
        items: Array.isArray(result?.items)
            ? result.items
            : [],

        levels: Array.isArray(result?.levels)
            ? result.levels
            : []
    };

    divisionsCache.set(cacheKey, normalizedResult);

    return normalizedResult;
}

// ==========================================================================
// DIVISION CHILDREN
// ==========================================================================

async function getDivisionChildren(divisionId) {

    const id = Number(divisionId);

    if (!Number.isInteger(id) || id <= 0) {
        return [];
    }

    const cacheKey = `division:${id}`;

    if (divisionsCache.has(cacheKey)) {
        return divisionsCache.get(cacheKey);
    }

    const children =
        await appLocationApi.listDivisionChildren(id);

    divisionsCache.set(cacheKey, children);

    return children;
}

// ==========================================================================
// SINGLE DIVISION
// ==========================================================================

async function getDivision(divisionId) {

    const id = Number(divisionId);

    if (!Number.isInteger(id) || id <= 0) {
        return null;
    }

    const cacheKey = `division-single:${id}`;

    if (divisionsCache.has(cacheKey)) {
        return divisionsCache.get(cacheKey);
    }

    const division =
        await appLocationApi.getDivision(id);

    if (division) {
        divisionsCache.set(cacheKey, division);
    }

    return division;
}

// ==========================================================================
// SELECTOR OPTIONS
// ==========================================================================

function countriesToOptions(countries) {

    return countries.map(country => ({
        value: country.id,
        label: country.name
    }));
}

function divisionsToOptions(divisions) {

    return divisions.map(division => ({
        value: division.id,
        label: division.name
    }));
}

// ==========================================================================
// EXPORT
// ==========================================================================

window.appLocation = {
    getCountries,
    getCountry,
    getCountryDivisions,
    getDivisionChildren,
    getDivision,
    countriesToOptions,
    divisionsToOptions
};