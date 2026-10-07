// ==========================================================================
// OPERACIONES DEL CARRITO (Base de Datos + LocalStorage)
// ==========================================================================
// ==========================================================================
// 1. AÑADIR PRODUCTO
// ==========================================================================

async function addToCart(productId, variant, quantity = 1) {

    console.log("🛒 addToCart recibió:", {
        productId,
        variant,
        quantity,
        currentUser: window.currentUser
    });


    try {
        // ------------------------------------------------------------------
        // Obtener producto
        // ------------------------------------------------------------------

        const productList = catalogManager.getProducts() || [];

        const product = productList.find(
            p => String(p.id) === String(productId)
        );

        if (!product) {
            console.error(
                `Producto con ID ${productId} no encontrado.`
            );
            return;
        }

        // ------------------------------------------------------------------
        // Validar variante
        // ------------------------------------------------------------------

        if (!variant || variant.id == null) {
            console.error(
                'No se recibió una variante válida.'
            );
            return;
        }

        // ------------------------------------------------------------------
        // Verificar que la variante pertenece al producto
        // ------------------------------------------------------------------

        const exactVariant = product.variants?.find(
            item =>
                String(item.id) ===
                String(variant.id)
        );

        if (!exactVariant) {
            console.error(
                `La variante ${variant.id} no pertenece al producto ${productId}.`
            );
            return;
        }

        // ------------------------------------------------------------------
        // Datos de la variante
        // ------------------------------------------------------------------

        const exactVariantId = exactVariant.id;

        const attributes =
            Array.isArray(exactVariant.attributes)
                ? exactVariant.attributes
                : [];

        const price = Number(
            exactVariant.price ??
            product.price ??
            0
        );

        const compareAtPrice = Number(
            exactVariant.compareAtPrice ??
            product.compareAtPrice ??
            0
        );

        // ==================================================================
        // USUARIO LOGUEADO → SOLO DB
        // ==================================================================

        if (window.currentUser) {

            const res = await apiAddItem(
                exactVariantId,
                quantity
            );

            if (!res.ok) {
                console.warn(
                    `⚠️ Error agregando al carrito: HTTP ${res.status}`
                );
                return;
            }

            console.log(
                "✅ Producto agregado al carrito de DB."
            );

            // Obtener nuevamente el carrito desde BD
            const cartRes = await apiGetCart();

            if (!cartRes.ok) {
                console.warn(
                    `⚠️ Producto agregado, pero no se pudo actualizar la vista: HTTP ${cartRes.status}`
                );
                return;
            }

            const cartData = await cartRes.json();


            console.log(
                "🛒 RESPUESTA REAL DE apiGetCart:",
                JSON.stringify(cartData, null, 2)
            );

            console.log("🛒 RESPUESTA CRUDA DE apiGetCart():", cartData);

            const backendCart =
                mapBackendCartToFrontend(cartData);

            console.log("🛒 CARRITO MAPEADO:", backendCart);

            setCart(backendCart);
            updateCartUI();

            return;
        }

        // ==================================================================
        // VISITANTE → SOLO LOCALSTORAGE
        // ==================================================================

        const cart = getCart();

        const existingIndex = cart.findIndex(
            item =>
                String(item.variantId) ===
                String(exactVariantId)
        );

        if (existingIndex > -1) {

            cart[existingIndex].qty =
                Number(cart[existingIndex].qty || 0) +
                Number(quantity);

        } else {

            cart.push({
                id: product.id,
                variantId: exactVariantId,
                name: product.name || product.designName,
                price,
                compareAtPrice,
                image: product.image || '',
                attributes,
                qty: Number(quantity)
            });
        }

        saveCart();
        updateCartUI();

        console.log(
            "🛒 Producto agregado al carrito local."
        );

    } catch (err) {

        console.error(
            "Error agregando producto:",
            err
        );
    }
}


// ==========================================================================
// 2. SELECCIÓN DE ÍTEMS
// ==========================================================================

async function handleCartItemSelection(event) {

    const checkbox = event.target.closest(
        '.cart-item-checkbox'
    );

    if (!checkbox) {
        return;
    }

    const cartItemId = Number(
        checkbox.dataset.cartItemId
    );

    if (!Number.isInteger(cartItemId) || cartItemId <= 0) {

        console.warn(
            '⚠️ CartItem ID no válido:',
            checkbox.dataset.cartItemId
        );

        return;
    }

    const cart = getCart();

    const cartItem = cart.find(
        item => Number(item.id) === cartItemId
    );

    if (!cartItem) {

        console.warn(
            '⚠️ No se encontró el CartItem:',
            cartItemId
        );

        return;
    }

    const previousValue =
        cartItem.isSelected === true;

    const newValue =
        checkbox.checked;


    // ----------------------------------------------------------------------
    // ACTUALIZACIÓN LOCAL INMEDIATA
    // ----------------------------------------------------------------------

    cartItem.isSelected = newValue;

    updateCartUI();


    // ----------------------------------------------------------------------
    // USUARIO LOGUEADO → GUARDAR EN DB
    // ----------------------------------------------------------------------

    if (window.currentUser) {

        try {

            const response =
                await apiUpdateItemSelection(
                    cartItem.variantId,
                    newValue
                );

            if (!response.ok) {

                throw new Error(
                    `Error HTTP ${response.status}`
                );
            }

            console.log(
                `🛒 CartItem ${cartItemId} → isSelected: ${newValue}`
            );

        } catch (error) {

            console.error(
                '❌ Error actualizando selección del carrito:',
                error
            );

            // --------------------------------------------------------------
            // REVERTIR ESTADO LOCAL
            // --------------------------------------------------------------

            cartItem.isSelected =
                previousValue;

            updateCartUI();
        }

        return;
    }


    // ----------------------------------------------------------------------
    // VISITANTE → LOCALSTORAGE
    // ----------------------------------------------------------------------

    saveCart();

    console.log(
        `🛒 Producto local → isSelected: ${newValue}`
    );
}


// ==========================================================================
// SELECCIONAR / DESELECCIONAR TODOS
// ==========================================================================

async function selectAllCartItems() {

    const cart = getCart();

    if (!Array.isArray(cart) || cart.length === 0) {
        return;
    }

    const allSelected =
        cart.every(
            item => item.isSelected === true
        );

    const newValue = !allSelected;


    // ----------------------------------------------------------------------
    // ACTUALIZAR ESTADO LOCAL
    // ----------------------------------------------------------------------

    cart.forEach(item => {
        item.isSelected = newValue;
    });

    updateCartUI();


    // ----------------------------------------------------------------------
    // USUARIO LOGUEADO → DB
    // ----------------------------------------------------------------------

    if (window.currentUser) {

        try {

            await Promise.all(
                cart.map(async item => {

                    const response =
                        await apiUpdateItemSelection(
                            item.variantId,
                            newValue
                        );

                    if (!response.ok) {

                        throw new Error(
                            `Error HTTP ${response.status}`
                        );
                    }
                })
            );

            console.log(
                `🛒 Todos los productos → isSelected: ${newValue}`
            );

        } catch (error) {

            console.error(
                '❌ Error actualizando selección de todos los productos:',
                error
            );

            // Recuperar estado real del backend
            const response =
                await apiGetCart();

            if (response.ok) {

                const data =
                    await response.json();

                setCart(
                    mapBackendCartToFrontend(data)
                );

                updateCartUI();
            }
        }

        return;
    }


    // ----------------------------------------------------------------------
    // VISITANTE → LOCALSTORAGE
    // ----------------------------------------------------------------------

    saveCart();

    console.log(
        `🛒 Todos los productos locales → isSelected: ${newValue}`
    );
}


// ==========================================================================
// 2.5. ACTUALIZAR CANTIDAD
// ==========================================================================

async function updateCartQty(index, change) {

    const cart = getCart();
    const item = cart[index];

    if (!item) return;

    const currentQty =
        Number(item.qty ?? item.quantity ?? 0);

    const newQty =
        currentQty + Number(change);

    // ----------------------------------------------------------------------
    // Si la cantidad llega a 0 → eliminar
    // ----------------------------------------------------------------------

    if (newQty <= 0) {
        await removeCartItem(index);
        return;
    }

    // ======================================================================
    // USUARIO LOGUEADO → SOLO DB
    // ======================================================================

    if (window.currentUser) {

        try {

            const res = await apiUpdateItem(
                item.variantId ?? item.id,
                newQty
            );

            if (!res.ok) {
                console.warn(
                    `⚠️ Error actualizando cantidad: HTTP ${res.status}`
                );
                return;
            }

            // Obtener estado real de BD
            const cartRes = await apiGetCart();

            if (!cartRes.ok) {
                console.warn(
                    `⚠️ Cantidad actualizada, pero no se pudo refrescar el carrito: HTTP ${cartRes.status}`
                );
                return;
            }

            const cartData = await cartRes.json();

            setCart(
                mapBackendCartToFrontend(cartData)
            );

            updateCartUI();

        } catch (err) {

            console.warn(
                "⚠️ Error actualizando carrito:",
                err
            );
        }

        return;
    }

    // ======================================================================
    // VISITANTE → SOLO LOCALSTORAGE
    // ======================================================================

    item.qty = newQty;

    saveCart();
    updateCartUI();
}


// ==========================================================================
// 3. ELIMINAR PRODUCTO
// ==========================================================================

async function removeCartItem(index) {

    const cart = getCart();
    const item = cart[index];

    if (!item) return;

    const variantId =
        item.variantId ?? item.id;

    // ======================================================================
    // USUARIO LOGUEADO → SOLO DB
    // ======================================================================

    if (window.currentUser) {

        try {

            const res =
                await apiDeleteItem(variantId);

            if (!res.ok) {
                console.warn(
                    `⚠️ Error eliminando producto: HTTP ${res.status}`
                );
                return;
            }

            // Obtener estado real de BD
            const cartRes =
                await apiGetCart();

            if (!cartRes.ok) {
                console.warn(
                    `⚠️ Producto eliminado, pero no se pudo refrescar el carrito: HTTP ${cartRes.status}`
                );
                return;
            }

            const cartData =
                await cartRes.json();

            setCart(
                mapBackendCartToFrontend(cartData)
            );

            updateCartUI();

        } catch (err) {

            console.warn(
                "⚠️ Error eliminando producto:",
                err
            );
        }

        return;
    }

    // ======================================================================
    // VISITANTE → SOLO LOCALSTORAGE
    // ======================================================================

    cart.splice(index, 1);

    saveCart();
    updateCartUI();
}


// ==========================================================================
// 4. LIMPIAR CARRITO
// ==========================================================================

async function clearCart() {

    // ======================================================================
    // USUARIO LOGUEADO
    // ======================================================================

    if (window.currentUser) {

        const cart = getCart();

        try {

            // Eliminar cada variante existente en BD
            for (const item of cart) {

                const variantId =
                    item.variantId ?? item.id;

                const res =
                    await apiDeleteItem(variantId);

                if (!res.ok) {
                    throw new Error(
                        `Error eliminando variante ${variantId}. HTTP ${res.status}`
                    );
                }
            }

            setCart([]);
            updateCartUI();

            console.log(
                "🛒 Carrito de DB limpiado."
            );

        } catch (err) {

            console.warn(
                "⚠️ No se pudo limpiar completamente el carrito:",
                err
            );
        }

        return;
    }

    // ======================================================================
    // VISITANTE
    // ======================================================================

    resetCart();
    clearCartStorage();
    updateCartUI();
}


// ==========================================================================
// 5. LOGOUT
// ==========================================================================

async function handleLogout() {

    try {

        await apiLogout();

    } catch (err) {

        console.warn(
            "Error notificando logout:",
            err
        );
    }

    // ----------------------------------------------------------------------
    // IMPORTANTE:
    // NO eliminar el carrito de DB.
    //
    // Solo limpiamos el estado local del frontend.
    // ----------------------------------------------------------------------

    resetCart();
    clearCartStorage();
    updateCartUI();

    localStorage.removeItem("user_profile");

    console.log("🔒 Sesión cerrada.");

    window.location.reload();
}


// ==========================================================================
// QUICK ADD
// ==========================================================================

async function quickAdd(productId) {

    productId = Number(productId);

    const productList =
        catalogManager.getProducts() || [];

    const product =
        productList.find(
            p => p.id === productId
        );

    if (!product) {
        console.error(
            `Producto con ID ${productId} no encontrado.`
        );
        return;
    }


    // ----------------------------------------------------------------------
    // Obtener variantes
    // ----------------------------------------------------------------------

    const variants =
        Array.isArray(product.variants)
            ? product.variants
            : [];


    // ----------------------------------------------------------------------
    // Buscar variante por defecto
    // ----------------------------------------------------------------------

    const defaultVariant =
        variants.find(
            variant => variant.isDefault === true
        );


    // Por definición, todo producto debe tener una variante default.
    if (!defaultVariant) {

        console.error(
            `El producto ${productId} no tiene una variante por defecto.`
        );

        return;
    }


    // ----------------------------------------------------------------------
    // Si tiene varias variantes → abrir modal
    // ----------------------------------------------------------------------

    if (variants.length > 1) {

        if (typeof openProductModal === 'function') {
            openProductModal(productId);
        }

        return;
    }


    // ----------------------------------------------------------------------
    // Si tiene una sola variante → añadir directamente
    // ----------------------------------------------------------------------

    await addToCart(
        productId,
        defaultVariant,
        1
    );

    openCart();
}


// ==========================================================================
// EXPORTACIONES
// ==========================================================================

window.addToCart = addToCart;
window.updateCartQty = updateCartQty;
window.removeCartItem = removeCartItem;
window.clearCart = clearCart;
window.handleLogout = handleLogout;
window.quickAdd = quickAdd;
window.handleCartItemSelection = handleCartItemSelection;
window.selectAllCartItems = selectAllCartItems;