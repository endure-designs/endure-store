// ==========================================================================
// ENDURE - ADDRESS MAP SERVICE
// Gestión independiente del proveedor de mapas
// ==========================================================================


// ==========================================================================
// ESTADO
// ==========================================================================

let addressMap = null;
let addressMapMarker = null;
let addressMapGeocoder = null;
let addressMapProviderLoaded = false;

const ADDRESS_MAP_DEFAULT_CENTER = {
    lat: -12.0464,
    lng: -77.0428
};

const ADDRESS_MAP_DEFAULT_ZOOM = 13;


// ==========================================================================
// CONFIGURACIÓN
// ==========================================================================

function getMapConfig() {

    return window.CONFIG?.MAPS || {};
}


function getMapProvider() {

    return String(
        getMapConfig().MAP_PROVIDER || 'osm'
    ).toLowerCase();
}


function getGeocodingProvider() {

    return String(
        getMapConfig().GEOCODING_PROVIDER || 'nominatim'
    ).toLowerCase();
}


// ==========================================================================
// UTILIDADES GENERALES
// ==========================================================================

function getElement(id) {

    return document.getElementById(id);
}


function setAddressFieldValue(id, value) {

    const element = getElement(id);

    if (!element) {
        return;
    }

    element.value = value ?? '';

    element.dispatchEvent(
        new Event('input', {
            bubbles: true
        })
    );

    element.dispatchEvent(
        new Event('change', {
            bubbles: true
        })
    );
}


function setAddressMapStatus(message) {

    const status = getElement('addressMapStatus');

    if (status) {
        status.textContent = message;
    }
}


function normalizeCoordinates(position) {

    if (!position) {
        return null;
    }

    const latitude = Number(position.lat);
    const longitude = Number(position.lng);

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {
        return null;
    }

    if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        return null;
    }

    return {
        lat: latitude,
        lng: longitude
    };
}


// ==========================================================================
// CARGA DINÁMICA DEL PROVEEDOR
// ==========================================================================

function loadExternalScript(src) {

    return new Promise((resolve, reject) => {

        const existingScript =
            document.querySelector(
                `script[src="${src}"]`
            );

        if (existingScript) {
            resolve();
            return;
        }

        const script =
            document.createElement('script');

        script.src = src;
        script.async = true;
        script.defer = true;

        script.onload = resolve;

        script.onerror = () => {

            reject(
                new Error(
                    `No se pudo cargar el script: ${src}`
                )
            );

        };

        document.head.appendChild(script);

    });
}


function loadExternalStylesheet(href) {

    return new Promise((resolve, reject) => {

        const existingStylesheet =
            document.querySelector(
                `link[href="${href}"]`
            );

        if (existingStylesheet) {
            resolve();
            return;
        }

        const link =
            document.createElement('link');

        link.rel = 'stylesheet';
        link.href = href;

        link.onload = resolve;

        link.onerror = () => {

            reject(
                new Error(
                    `No se pudo cargar el CSS: ${href}`
                )
            );

        };

        document.head.appendChild(link);

    });
}


async function loadMapProvider() {

    if (addressMapProviderLoaded) {
        return;
    }

    const provider =
        getMapProvider();

    // ----------------------------------------------------------------------
    // OPENSTREETMAP / LEAFLET
    // ----------------------------------------------------------------------

    if (provider === 'osm') {

        await loadExternalStylesheet(
            'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        );

        await loadExternalScript(
            'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        );

        if (!window.L) {
            throw new Error(
                'Leaflet se cargó pero no está disponible.'
            );
        }

        addressMapProviderLoaded = true;

        console.log(
            '🗺️ Proveedor de mapas: OpenStreetMap / Leaflet'
        );

        return;
    }


    // ----------------------------------------------------------------------
    // GOOGLE MAPS
    // ----------------------------------------------------------------------

    if (provider === 'google') {

        const apiKey =
            window.CONFIG?.GOOGLE?.MAPS_API_KEY;

        if (!apiKey) {
            throw new Error(
                'No existe CONFIG.GOOGLE.MAPS_API_KEY.'
            );
        }

        await loadExternalScript(
            `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&libraries=places`
        );

        if (!window.google?.maps) {
            throw new Error(
                'Google Maps se cargó pero no está disponible.'
            );
        }

        addressMapProviderLoaded = true;

        console.log(
            '🗺️ Proveedor de mapas: Google Maps'
        );

        return;
    }


    throw new Error(
        `Proveedor de mapas no soportado: ${provider}`
    );
}


// ==========================================================================
// COORDENADAS GUARDADAS
// ==========================================================================

function getAddressMapCoordinates() {

    const latitudeElement =
        getElement('addressLatitude');

    const longitudeElement =
        getElement('addressLongitude');

    if (
        !latitudeElement ||
        !longitudeElement
    ) {
        return null;
    }

    const latitudeValue =
        latitudeElement.value.trim();

    const longitudeValue =
        longitudeElement.value.trim();

    if (
        latitudeValue === '' ||
        longitudeValue === ''
    ) {
        return null;
    }

    return normalizeCoordinates({
        lat: latitudeValue,
        lng: longitudeValue
    });
}


// ==========================================================================
// POSICIÓN INICIAL
// ==========================================================================

async function getInitialAddressMapPosition() {

    const savedCoordinates =
        getAddressMapCoordinates();

    if (savedCoordinates) {

        return {
            position: savedCoordinates,
            zoom: 17
        };

    }


    // ----------------------------------------------------------------------
    // UBICACIÓN DEL NAVEGADOR
    // ----------------------------------------------------------------------

    if (
        'geolocation' in navigator
    ) {

        try {

            const position =
                await new Promise(
                    (resolve, reject) => {

                        navigator.geolocation.getCurrentPosition(
                            resolve,
                            reject,
                            {
                                enableHighAccuracy: true,
                                timeout: 5000,
                                maximumAge: 300000
                            }
                        );

                    }
                );

            const coordinates =
                normalizeCoordinates({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });

            if (coordinates) {

                return {
                    position: coordinates,
                    zoom: 16
                };

            }

        } catch (error) {

            console.warn(
                '⚠️ No se pudo obtener la ubicación del navegador.',
                error
            );

        }

    }


    // ----------------------------------------------------------------------
    // FALLBACK — LIMA
    // ----------------------------------------------------------------------

    return {
        position: {
            ...ADDRESS_MAP_DEFAULT_CENTER
        },
        zoom: ADDRESS_MAP_DEFAULT_ZOOM
    };
}


// ==========================================================================
// API PÚBLICA
// ==========================================================================

async function initializeAddressMap() {

    await loadMapProvider();

    const provider =
        getMapProvider();

    if (provider === 'osm') {

        return initializeOpenStreetMap();

    }

    if (provider === 'google') {

        return initializeGoogleMap();

    }

}


function resetAddressMap() {

    const provider =
        getMapProvider();

    if (provider === 'osm') {

        return resetOpenStreetMap();

    }

    if (provider === 'google') {

        return resetGoogleMap();

    }

}


async function searchAddressFromForm(addressData) {

    const provider =
        getGeocodingProvider();

    if (provider === 'nominatim') {

        return searchAddressWithNominatim(
            addressData
        );

    }

    if (provider === 'google') {

        return searchAddressWithGoogle(
            addressData
        );

    }

    throw new Error(
        `Proveedor de geocodificación no soportado: ${provider}`
    );

}


// ==========================================================================
// PLACEHOLDERS DE PROVEEDORES
// ==========================================================================
// Estas funciones las implementaremos en el siguiente paso.
// ==========================================================================


async function initializeOpenStreetMap() {

    const mapElement =
        getElement('addressMap');

    if (!mapElement) {
        return;
    }

    if (!window.L) {
        throw new Error(
            'Leaflet no está disponible.'
        );
    }

    try {

        // ------------------------------------------------------------------
        // POSICIÓN INICIAL
        // ------------------------------------------------------------------

        const initialLocation =
            await getInitialAddressMapPosition();

        const initialCenter =
            initialLocation.position;

        const initialZoom =
            initialLocation.zoom;


        // ------------------------------------------------------------------
        // CREAR MAPA
        // ------------------------------------------------------------------

        if (!addressMap) {

            addressMap =
                L.map(mapElement, {
                    center: [
                        initialCenter.lat,
                        initialCenter.lng
                    ],
                    zoom: initialZoom,
                    zoomControl: true,
                    attributionControl: true
                });


            // --------------------------------------------------------------
            // CAPA DE OPENSTREETMAP
            // --------------------------------------------------------------

            const osmConfig =
                getMapConfig().OSM || {};

            const tileUrl =
                osmConfig.TILE_URL ||
                'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

            const attribution =
                osmConfig.TILE_ATTRIBUTION ||
                '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';


            L.tileLayer(
                tileUrl,
                {
                    attribution,
                    maxZoom: 19
                }
            ).addTo(addressMap);

        } else {

            // --------------------------------------------------------------
            // MAPA YA EXISTENTE
            // --------------------------------------------------------------

            addressMap.setView(
                [
                    initialCenter.lat,
                    initialCenter.lng
                ],
                initialZoom
            );

        }


        // ------------------------------------------------------------------
        // MARCADOR
        // ------------------------------------------------------------------

        if (!addressMapMarker) {

            addressMapMarker =
                L.marker(
                    [
                        initialCenter.lat,
                        initialCenter.lng
                    ],
                    {
                        draggable: true
                    }
                ).addTo(addressMap);


            // --------------------------------------------------------------
            // MARCADOR MOVIDO
            // --------------------------------------------------------------

            addressMapMarker.on(
                'dragend',
                async event => {

                    const marker =
                        event.target;

                    const position =
                        marker.getLatLng();

                    const coordinates =
                        normalizeCoordinates({
                            lat: position.lat,
                            lng: position.lng
                        });

                    if (!coordinates) {
                        return;
                    }

                    setAddressFieldValue(
                        'addressLatitude',
                        coordinates.lat
                    );

                    setAddressFieldValue(
                        'addressLongitude',
                        coordinates.lng
                    );

                    setAddressMapStatus(
                        'Obteniendo la dirección...'
                    );

                    await reverseGeocodeAddressMapPosition(
                        coordinates
                    );

                }
            );

        } else {

            // --------------------------------------------------------------
            // MARCADOR YA EXISTENTE
            // --------------------------------------------------------------

            addressMapMarker.setLatLng([
                initialCenter.lat,
                initialCenter.lng
            ]);

        }


        // ------------------------------------------------------------------
        // GUARDAR COORDENADAS INICIALES
        // ------------------------------------------------------------------

        setAddressFieldValue(
            'addressLatitude',
            initialCenter.lat
        );

        setAddressFieldValue(
            'addressLongitude',
            initialCenter.lng
        );


        // ------------------------------------------------------------------
        // AJUSTAR TAMAÑO
        // ------------------------------------------------------------------

        setTimeout(() => {

            if (addressMap) {
                addressMap.invalidateSize();
            }

        }, 100);


        setAddressMapStatus(
            'Arrastra el marcador para precisar la ubicación.'
        );


        return addressMap;

    } catch (error) {

        console.error(
            '❌ Error inicializando OpenStreetMap:',
            error
        );

        setAddressMapStatus(
            'No se pudo inicializar el mapa.'
        );

        throw error;
    }
}

async function reverseGeocodeAddressMapPosition(position) {

    const provider =
        getGeocodingProvider();

    if (provider === 'nominatim') {

        return reverseGeocodeWithNominatim(position);

    }

    if (provider === 'google') {

        return reverseGeocodeWithGoogle(position);

    }

    throw new Error(
        `Proveedor de geocodificación no soportado: ${provider}`
    );
}

async function reverseGeocodeWithNominatim(position) {

    const coordinates =
        normalizeCoordinates(position);

    if (!coordinates) {
        return;
    }

    const osmConfig =
        getMapConfig().OSM || {};

    const baseUrl =
        osmConfig.NOMINATIM_URL ||
        'https://nominatim.openstreetmap.org';

    const params =
        new URLSearchParams({
            format: 'jsonv2',
            lat: coordinates.lat,
            lon: coordinates.lng,
            zoom: '18',
            addressdetails: '1',
            'accept-language': 'es'
        });

    try {

        const response =
            await fetch(
                `${baseUrl}/reverse?${params.toString()}`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            );

        if (!response.ok) {

            throw new Error(
                `Nominatim respondió HTTP ${response.status}`
            );

        }

        const result =
            await response.json();

        if (!result?.address) {

            setAddressMapStatus(
                'No se encontró una dirección para esta ubicación.'
            );

            return;
        }

        const addressData =
            await applyNominatimResult(
                result
            );

        setAddressMapStatus(
            'Ubicación actualizada.'
        );

        return addressData;

    } catch (error) {

        console.error(
            '❌ Error en reverse geocoding con Nominatim:',
            error
        );

        setAddressMapStatus(
            'No se pudo obtener la dirección.'
        );

    }
}

async function applyNominatimResult(result) {

    const address =
        result?.address || {};

    const countryCode =
        String(
            address.country_code || ''
        ).toUpperCase();

    return {

        coordinates: normalizeCoordinates({
            lat: result?.lat,
            lng: result?.lon
        }),

        displayName:
            result?.display_name || '',

        street:
            address.road ||
            address.pedestrian ||
            address.footway ||
            address.path ||
            '',

        number:
            address.house_number || '',

        neighborhood:
            address.neighbourhood ||
            address.suburb ||
            address.city_district ||
            '',

        postalCode:
            address.postcode || '',

        countryCode,

        administrative: {

            state:
                address.state || '',

            region:
                address.region || '',

            province:
                address.province || '',

            county:
                address.county || '',

            city:
                address.city || '',

            town:
                address.town || '',

            municipality:
                address.municipality || ''

        }

    };
}


async function reverseGeocodeWithGoogle() {

    throw new Error(
        'reverseGeocodeWithGoogle() todavía no está implementado.'
    );

}

function resetOpenStreetMap() {

    const defaultPosition =
        ADDRESS_MAP_DEFAULT_CENTER;


    // ----------------------------------------------------------------------
    // MAPA
    // ----------------------------------------------------------------------

    if (addressMap) {

        addressMap.setView(
            [
                defaultPosition.lat,
                defaultPosition.lng
            ],
            ADDRESS_MAP_DEFAULT_ZOOM
        );

    }


    // ----------------------------------------------------------------------
    // MARCADOR
    // ----------------------------------------------------------------------

    if (addressMapMarker) {

        addressMapMarker.setLatLng([
            defaultPosition.lat,
            defaultPosition.lng
        ]);

    }


    // ----------------------------------------------------------------------
    // COORDENADAS
    // ----------------------------------------------------------------------

    setAddressFieldValue(
        'addressLatitude',
        ''
    );

    setAddressFieldValue(
        'addressLongitude',
        ''
    );


    // ----------------------------------------------------------------------
    // ESTADO
    // ----------------------------------------------------------------------

    setAddressMapStatus(
        'Arrastra el marcador para precisar la ubicación.'
    );

}


async function searchAddressWithNominatim(addressData = {}) {

    // ----------------------------------------------------------------------
    // VALIDAR DATOS RECIBIDOS
    // ----------------------------------------------------------------------

    const streetAndNumber = String(
        addressData.streetAndNumber || ''
    ).trim();

    const neighborhood = String(
        addressData.neighborhood || ''
    ).trim();

    const divisions = Array.isArray(addressData.divisions)
        ? addressData.divisions
            .map(value => String(value || '').trim())
            .filter(Boolean)
        : [];

    const postalCode = String(
        addressData.postalCode || ''
    ).trim();

    const countryName = String(
        addressData.countryName || ''
    ).trim();

    if (
        !streetAndNumber &&
        !neighborhood &&
        divisions.length === 0
    ) {
        setAddressMapStatus(
            'Completa primero los datos de la dirección.'
        );
        return;
    }

    // ----------------------------------------------------------------------
    // CONFIGURACIÓN NOMINATIM
    // ----------------------------------------------------------------------

    const osmConfig = getMapConfig().OSM || {};

    const baseUrl =
        osmConfig.NOMINATIM_URL ||
        'https://nominatim.openstreetmap.org';

    // ----------------------------------------------------------------------
    // ORDENAR DIVISIONES ADMINISTRATIVAS
    //
    // El formulario entrega:
    // Departamento → Provincia → Distrito
    //
    // Nominatim recibirá:
    // Distrito → Provincia → Departamento
    // ----------------------------------------------------------------------

    const uniqueDivisions = [
        ...new Set(divisions)
    ];

    const reversedDivisions = [
        ...uniqueDivisions
    ].reverse();

    const district =
        reversedDivisions[0] || '';

    const province =
        reversedDivisions[1] || '';

    const region =
        reversedDivisions[2] || '';

    // ----------------------------------------------------------------------
    // CONSTRUIR CONSULTAS PROGRESIVAS
    // ----------------------------------------------------------------------

    const queries = [];

    // 1. Dirección + urbanización + distrito + provincia +
    //    departamento + código postal + país
    queries.push([
        streetAndNumber,
        neighborhood,
        district,
        province,
        region,
        postalCode,
        countryName
    ].filter(Boolean));

    // 2. Dirección + urbanización + distrito + provincia + país
    queries.push([
        streetAndNumber,
        neighborhood,
        district,
        province,
        countryName
    ].filter(Boolean));

    // 3. Dirección + distrito + provincia + país
    queries.push([
        streetAndNumber,
        district,
        province,
        countryName
    ].filter(Boolean));

    // 4. Dirección + distrito + país
    queries.push([
        streetAndNumber,
        district,
        countryName
    ].filter(Boolean));

    // 5. Dirección + provincia + país
    queries.push([
        streetAndNumber,
        province,
        countryName
    ].filter(Boolean));

    // 6. Dirección + país
    queries.push([
        streetAndNumber,
        countryName
    ].filter(Boolean));

    // ----------------------------------------------------------------------
    // ELIMINAR CONSULTAS DUPLICADAS
    // ----------------------------------------------------------------------

    const uniqueQueries = [
        ...new Map(
            queries
                .filter(parts => parts.length > 0)
                .map(parts => [
                    parts.join(', ').toLowerCase(),
                    parts
                ])
        ).values()
    ];

    console.log(
        '🗺️ Consultas que se intentarán en Nominatim:',
        uniqueQueries
    );

    // ----------------------------------------------------------------------
    // BUSCAR PROGRESIVAMENTE
    // ----------------------------------------------------------------------

    try {

        setAddressMapStatus(
            'Buscando dirección...'
        );

        let result = null;
        let successfulQuery = null;

        for (const parts of uniqueQueries) {

            const query = parts.join(', ');

            console.log(
                '🔎 Intentando búsqueda:',
                query
            );

            const params = new URLSearchParams({
                format: 'jsonv2',
                q: query,
                addressdetails: '1',
                limit: '1',
                'accept-language': 'es'
            });

            // --------------------------------------------------------------
            // RESTRICCIÓN POR PAÍS
            // --------------------------------------------------------------

            if (addressData?.countryCode) {

                params.set(
                    'countrycodes',
                    String(
                        addressData.countryCode
                    ).toLowerCase()
                );

            }

            const response = await fetch(
                `${baseUrl}/search?${params.toString()}`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Nominatim respondió HTTP ${response.status}`
                );
            }

            const results = await response.json();

            if (
                Array.isArray(results) &&
                results.length > 0
            ) {

                result = results[0];

                successfulQuery = query;

                console.log(
                    '✅ Nominatim encontró resultado con:',
                    query
                );

                break;
            }

            console.log(
                '❌ Sin resultados para:',
                query
            );
        }

        // ------------------------------------------------------------------
        // NO ENCONTRADO
        // ------------------------------------------------------------------

        if (!result) {

            setAddressMapStatus(
                'No se encontró la dirección. Puedes ubicarla manualmente en el mapa.'
            );

            return;
        }

        // ------------------------------------------------------------------
        // COORDENADAS
        // ------------------------------------------------------------------

        const position = normalizeCoordinates({
            lat: result.lat,
            lng: result.lon
        });

        if (!position) {

            setAddressMapStatus(
                'La ubicación encontrada no tiene coordenadas válidas.'
            );

            return;
        }

        // ------------------------------------------------------------------
        // MOVER MAPA
        // ------------------------------------------------------------------

        if (addressMap) {

            addressMap.setView(
                [
                    position.lat,
                    position.lng
                ],
                17
            );

        }

        // ------------------------------------------------------------------
        // MOVER MARCADOR
        // ------------------------------------------------------------------

        if (addressMapMarker) {

            addressMapMarker.setLatLng([
                position.lat,
                position.lng
            ]);

        }

        // ------------------------------------------------------------------
        // GUARDAR COORDENADAS
        // ----------------------------------------------------------------------

        setAddressFieldValue(
            'addressLatitude',
            position.lat
        );

        setAddressFieldValue(
            'addressLongitude',
            position.lng
        );

        // ------------------------------------------------------------------
        // APLICAR RESULTADO
        // ----------------------------------------------------------------------

        const resultData =
            await applyNominatimResult(
                result
            );

        console.log(
            '📍 Consulta exitosa:',
            successfulQuery
        );

        setAddressMapStatus(
            'Dirección encontrada. Puedes mover el marcador para precisarla.'
        );

        return resultData;

    } catch (error) {

        console.error(
            '❌ Error buscando dirección con Nominatim:',
            error
        );

        setAddressMapStatus(
            'No se pudo encontrar la dirección.'
        );
    }
}

async function initializeGoogleMap() {

    throw new Error(
        'initializeGoogleMap() todavía no está implementado.'
    );

}


function resetGoogleMap() {

    throw new Error(
        'resetGoogleMap() todavía no está implementado.'
    );

}


async function searchAddressWithGoogle() {

    throw new Error(
        'searchAddressWithGoogle() todavía no está implementado.'
    );

}


// ==========================================================================
// EXPORTS
// ==========================================================================

window.addressMapService = {
    initializeAddressMap,
    resetAddressMap,
    searchAddressFromForm,
    reverseGeocodeAddressMapPosition
};