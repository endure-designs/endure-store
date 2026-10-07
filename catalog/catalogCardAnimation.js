// ==========================================================================
// CATALOG CARD ANIMATION — Estados y animaciones de tarjetas
// ==========================================================================


// ==========================================================================
// Estado de la tarjeta actualmente seleccionada
// ==========================================================================

let selectedCard = null;
let selectedState = null;
let selectedProductId = null;


// ==========================================================================
// INIT
// ==========================================================================
// La tarjeta YA llega con:
//
//     product-card entrada
//
// Esta función solamente espera a que termine la animación de entrada
// y posteriormente pasa la tarjeta a su estado de reposo:
//
//     entrada → normal
//     entrada → oferta
// ==========================================================================

function init(card, product) {

    if (!card || !product) return;


    // ----------------------------------------------------------------------
    // Determinar si el producto está en oferta
    // ----------------------------------------------------------------------

    const isOnSale =
        product.compareAtPrice != null &&
        parseFloat(product.compareAtPrice) >
        parseFloat(product.price);


    // ----------------------------------------------------------------------
    // Guardar información de la tarjeta
    // ----------------------------------------------------------------------

    card.dataset.isSale =
        isOnSale ? 'true' : 'false';

    card.dataset.animationState =
        'entrada';


    // ----------------------------------------------------------------------
    // Esperar a que termine la entrada
    // ----------------------------------------------------------------------

    const handleEntryEnd = event => {

        if (event.animationName !== 'entrada') {
            return;
        }


        card.removeEventListener(
            'animationend',
            handleEntryEnd
        );


        // ------------------------------------------------------------------
        // Pasar al estado de reposo
        // ------------------------------------------------------------------

        stay(card, product);

    };


    card.addEventListener(
        'animationend',
        handleEntryEnd
    );
}



// ==========================================================================
// STAY
// ==========================================================================
// Estado de reposo.
//
// Producto normal:
//
//     normal
//
// Producto en oferta:
//
//     oferta
//
// La función decide qué estado corresponde.
// ==========================================================================

function stay(card, product) {

    if (!card || !product) return;


    // ----------------------------------------------------------------------
    // Determinar si el producto está en oferta
    // ----------------------------------------------------------------------

    const isOnSale =
        product.compareAtPrice != null &&
        parseFloat(product.compareAtPrice) >
        parseFloat(product.price);


    // ----------------------------------------------------------------------
    // Eliminar cualquier estado anterior
    // ----------------------------------------------------------------------

    card.classList.remove(
        'entrada',
        'normal',
        'oferta',
        'despegue',
        'aterrizaje'
    );


    // ----------------------------------------------------------------------
    // Producto en oferta
    // ----------------------------------------------------------------------

    if (isOnSale) {

        card.classList.add('oferta');

        card.dataset.animationState =
            'oferta';

        return;
    }


    // ----------------------------------------------------------------------
    // Producto normal
    // ----------------------------------------------------------------------

    card.classList.add('normal');

    card.dataset.animationState =
        'normal';
}



// ==========================================================================
// LAUNCH
// ==========================================================================
// Al hacer click:
//
//     normal / oferta
//            ↓
//         despegue
//
// Antes de cambiar la clase se guarda el estado anterior para poder
// recuperarlo después del aterrizaje.
// ==========================================================================

function launch(card, productId) {

    if (!card) return;


    // ----------------------------------------------------------------------
    // Guardar tarjeta seleccionada
    // ----------------------------------------------------------------------

    selectedCard = card;

    selectedProductId = productId;


    // ----------------------------------------------------------------------
    // Guardar estado anterior
    // ----------------------------------------------------------------------

    selectedState =
        card.dataset.animationState;


    // ----------------------------------------------------------------------
    // Seguridad: determinar estado mediante clases si no existe dataset
    // ----------------------------------------------------------------------

    if (!selectedState) {

        if (card.classList.contains('oferta')) {

            selectedState = 'oferta';

        } else {

            selectedState = 'normal';

        }
    }


    // ----------------------------------------------------------------------
    // Eliminar estado anterior
    // ----------------------------------------------------------------------

    card.classList.remove(
        'entrada',
        'normal',
        'oferta',
        'aterrizaje'
    );


    // ----------------------------------------------------------------------
    // Despegue
    // ----------------------------------------------------------------------

    card.classList.add('despegue');

    card.dataset.animationState =
        'despegue';
}



// ==========================================================================
// RETURN
// ==========================================================================
// Al cerrar el modal:
//
//     despegue
//         ↓
//     aterrizaje
//         ↓
//     estado anterior
//
// Si antes era oferta:
//
//     oferta
//
// Si antes era normal:
//
//     normal
// ==========================================================================

function returnCard(card) {

    // ----------------------------------------------------------------------
    // Si no se recibe tarjeta, utilizar la seleccionada
    // ----------------------------------------------------------------------

    if (!card) {
        card = selectedCard;
    }

    if (!card) return;


    // ----------------------------------------------------------------------
    // Esperar a que termine el aterrizaje
    // ----------------------------------------------------------------------

    const handleLandingEnd = event => {

        if (
            event.animationName !==
            'aterrizaje'
        ) {
            return;
        }


        card.removeEventListener(
            'animationend',
            handleLandingEnd
        );


        // --------------------------------------------------------------
        // Eliminar aterrizaje
        // --------------------------------------------------------------

        card.classList.remove(
            'aterrizaje'
        );


        // --------------------------------------------------------------
        // Restaurar estado anterior
        // --------------------------------------------------------------

        if (selectedState === 'oferta') {

            card.classList.add('oferta');

            card.dataset.animationState =
                'oferta';

        } else {

            card.classList.add('normal');

            card.dataset.animationState =
                'normal';
        }

    };


    card.addEventListener(
        'animationend',
        handleLandingEnd
    );


    // ----------------------------------------------------------------------
    // Cambiar directamente de DESPEGUE a ATERRIZAJE
    // ----------------------------------------------------------------------

    card.classList.replace(
        'despegue',
        'aterrizaje'
    );

    card.dataset.animationState =
        'aterrizaje';
}



// ==========================================================================
// API PÚBLICA
// ==========================================================================

window.catalogCardAnimation = {

    init,
    stay,
    launch,
    return: returnCard

};