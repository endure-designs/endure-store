// ==========================================================================
// CONFIGURACIÓN GENERAL DEL FRONTEND
// ==========================================================================

const CONFIG = {

    // URL base del backend
    API_BASE_URL: "http://localhost:3000/api",
    //API_BASE_URL: "https://api.endure.com.pe/api",

    // Tiempo máximo de espera para peticiones
    REQUEST_TIMEOUT: 10000,

    // Nombre del localStorage del catálogo
    PRODUCTS_STORAGE_KEY: "endure_products",

    DEFAULT_PRODUCT_IMAGE: 'assets/ICONO_WEB.webp',

    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 4,

    // ======================================================================
    // CULQI
    // ======================================================================

    CULQI_PUBLIC_KEY: 'pk_test_Wa981z5P36SjE7rS',

    // ======================================================================
    // FIREBASE
    // ======================================================================

    FIREBASE: {

        apiKey: 'AIzaSyCL38pSXCFXFBaRM7V8uEcwIAL9gKjswxw',

        authDomain: 'endure-67eae.firebaseapp.com',

        projectId: 'endure-67eae',

        storageBucket: 'endure-67eae.firebasestorage.app',

        messagingSenderId: '428868038597',

        appId: '1:428868038597:web:e2294c8b0c3862929425ac',

        vapidKey: 'BE0mRhEcYxkIypZLYFFopqoZ-57m2Lz2ezY-u_m2Mb-gf5JmaxWXzAbqkvtGX5qVfpwoMO5Fs__f_6xHJ_cqC9M'

    },

    // ======================================================================
    // GOOGLE
    // ======================================================================

    GOOGLE: {
        CLIENT_ID: '373700110582-aobgbdipi7v03i4vva94k42vlv0vm6ht.apps.googleusercontent.com',

        MAPS_API_KEY: 'AIzaSyCTJq7JK1Ycx2dDWkBvPR_d7n73pT9it-8'
    },

    // ======================================================================
    // MAPAS Y GEOCODIFICACIÓN
    // ======================================================================

    MAPS: {

        // Proveedor que dibuja el mapa
        // Valores posibles:
        // 'osm'
        // 'google'
        MAP_PROVIDER: 'osm',

        // Proveedor encargado de convertir:
        // dirección ↔ coordenadas
        //
        // Valores posibles:
        // 'nominatim'
        // 'google'
        GEOCODING_PROVIDER: 'nominatim',

        // --------------------------------------------------------------
        // OpenStreetMap / Nominatim
        // --------------------------------------------------------------

        OSM: {
            TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            TILE_ATTRIBUTION:
                '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',

            NOMINATIM_URL: 'https://nominatim.openstreetmap.org'
        }

    }

};

window.CONFIG = CONFIG;