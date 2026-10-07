// ==========================================================================
// LOCALSTORAGE DEL CARRITO
// ==========================================================================

const CART_STORAGE_KEY = "endure_cart";

// Cargar carrito desde LocalStorage
function loadCart() {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);

        if (!savedCart) {
            setCart([]);
            return;
        }

        const cart = JSON.parse(savedCart);

        setCart(Array.isArray(cart) ? cart : []);

    } catch (error) {
        console.warn("Error al cargar el carrito:", error);
        setCart([]);
    }
}

// Guardar carrito en LocalStorage
function saveCart() {
    try {
        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(getCart())
        );
    } catch (error) {
        console.warn("Error al guardar el carrito:", error);
    }
}

// Eliminar carrito del LocalStorage
function clearCartStorage() {
    localStorage.removeItem(CART_STORAGE_KEY);
}

// Exponer funciones
window.loadCart = loadCart;
window.saveCart = saveCart;
window.clearCartStorage = clearCartStorage;