// ==========================================================================
// API DEL CARRITO
// ==========================================================================

// Obtener carrito del usuario autenticado
async function apiGetCart() {
    return fetch(`${CONFIG.API_BASE_URL}/cart`, {
        method: 'GET',
        credentials: 'include'
    });
}

// Agregar producto al carrito
async function apiAddItem(productVariantId, quantity) {
    return fetch(`${CONFIG.API_BASE_URL}/cart/items`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            productVariantId,
            quantity
        })
    });

}

// Actualizar cantidad
async function apiUpdateItem(productVariantId, quantity) {
    return fetch(`${CONFIG.API_BASE_URL}/cart/items/${productVariantId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            quantity
        })
    });

}

// Eliminar producto
async function apiDeleteItem(productVariantId) {
    return fetch(`${CONFIG.API_BASE_URL}/cart/items/${productVariantId}`, {
        method: 'DELETE',
        credentials: 'include'
    });

}

// Logout
async function apiLogout() {
    return fetch(`${CONFIG.API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
    });

}

// Actualizar selección del producto
async function apiUpdateItemSelection(productVariantId, isSelected) {
    return fetch(`${CONFIG.API_BASE_URL}/cart/items/${productVariantId}/selection`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            isSelected
        })
    });
}

// Exponer funciones
window.apiGetCart = apiGetCart;
window.apiAddItem = apiAddItem;
window.apiUpdateItem = apiUpdateItem;
window.apiUpdateItemSelection = apiUpdateItemSelection;
window.apiDeleteItem = apiDeleteItem;
window.apiLogout = apiLogout;