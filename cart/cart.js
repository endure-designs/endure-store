// ==========================================================================
// ESTADO GLOBAL DEL CARRITO
// ==========================================================================

let cart = [];


// Obtener el carrito completo

function getCart() {

    return cart;

}


// Obtener únicamente los productos seleccionados

function getCartSelectedItems() {

    return cart.filter(
        item => item.isSelected === true
    );

}


// Obtener IDs de CartItem seleccionados

function getCartSelectedItemIds() {

    return cart
        .filter(item => item.isSelected === true)
        .map(item => Number(item.id));

}


let lastCartMutationTime = 0;

function notifyCartMutation() {
    lastCartMutationTime = Date.now();
}

function getCartMutationTime() {
    return lastCartMutationTime;
}

// Reemplazar completamente el carrito

function setCart(newCart) {

    cart =
        Array.isArray(newCart)
            ? [...newCart]
            : [];

    notifyCartMutation();

}


// Agregar un elemento

function addCartItem(item) {

    cart.push(item);
    notifyCartMutation();

}


// Vaciar carrito

function resetCart() {

    cart = [];
    notifyCartMutation();

}


// Obtener cantidad de items

function getCartCount() {

    return cart.length;

}


// Exponer funciones globalmente

window.getCart = getCart;
window.setCart = setCart;
window.addCartItem = addCartItem;
window.resetCart = resetCart;
window.getCartCount = getCartCount;

window.getCartSelectedItems = getCartSelectedItems;
window.getCartSelectedItemIds = getCartSelectedItemIds;
window.notifyCartMutation = notifyCartMutation;
window.getCartMutationTime = getCartMutationTime;