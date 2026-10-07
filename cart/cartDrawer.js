
// ==========================================================================
// DRAWER DEL CARRITO
// ==========================================================================

function getCartElements() {

    try {
        const drawer = document.getElementById("cartDrawer");
        const overlay = document.getElementById("cartOverlay");
        const button = document.getElementById("cartBtn");
        const closeButton = document.getElementById("cartClose");
        const container = document.getElementById('cartItemsContainer');
        const subtotal = document.getElementById('cartSubtotal');
        const checkoutBtn = document.getElementById('checkoutBtn');
        const badges = document.querySelectorAll('.cart-count');
        const emptyCartButton = document.getElementById("emptyCartAction");


        // Validamos manualmente si el botón (o cualquier elemento crítico) no existe
        if (!button) {
            throw new Error("El elemento con ID 'cartBtn' no existe en el DOM actual.");
        }

        if (!drawer) {
            throw new Error("El elemento con ID 'cartDrawer' no existe en el DOM actual.");
        }

        // Si todo está bien, retornamos el objeto normalmente
        return {
            drawer,
            overlay,
            button,
            closeButton,
            emptyCartButton,
            container,
            subtotal,
            checkoutBtn,
            badges
        };
    } catch (error) {


        // Aquí capturas el error y lo muestras de forma muy visible en tu consola
        console.error("%c[Error en getCartElements]:", "background: red; color: white; padding: 2px 5px;", error.message);

        // Retornamos un objeto vacío o valores por defecto para que el código no explote por completo
        return {
            drawer: null,
            overlay: null,
            button: null,
            closeButton: null,
            emptyCartButton: null,
            container: null,
            subtotal: null,
            checkoutBtn: null,
            badges: []
        };
    }


}

// --------------------------------------------------------------------------
// Abrir drawer
// --------------------------------------------------------------------------

function openCart() {


    const { drawer } = getCartElements();

    if (!drawer) return;

    drawer.classList.add("open");
    document.body.style.overflow = "hidden";

}

// --------------------------------------------------------------------------
// Cerrar drawer
// --------------------------------------------------------------------------

function closeCart() {


    const { drawer } = getCartElements();

    if (!drawer) return;

    drawer.classList.remove("open");
    document.body.style.overflow = "";

}

// --------------------------------------------------------------------------
// Inicializar eventos del drawer
// --------------------------------------------------------------------------

function initCartDrawer() {


    const {
        overlay,
        button,
        closeButton,
        emptyCartButton
    } = getCartElements();


    button?.addEventListener("click", openCart);

    closeButton?.addEventListener("click", closeCart);

    overlay?.addEventListener("click", closeCart);

    emptyCartButton?.addEventListener("click", closeCart);

    const container =
        document.getElementById('cartItemsContainer');

    container?.addEventListener(
        'change',
        handleCartItemSelection
    );

}

// --------------------------------------------------------------------------
// Exportaciones
// --------------------------------------------------------------------------
window.getCartElements = getCartElements;
window.openCart = openCart;
window.closeCart = closeCart;
window.initCartDrawer = initCartDrawer;