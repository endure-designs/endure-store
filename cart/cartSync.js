// ==========================================================================
// SINCRONIZACIÓN DEL CARRITO
// ==========================================================================

async function syncCartFromBackend() {

    try {

        // ------------------------------------------------------------------
        // 1. Obtener carrito actual de la BD
        // ------------------------------------------------------------------

        const res = await apiGetCart();

        // Usuario visitante
        if (res.status === 401 || res.status === 403) {

            console.log(
                "🛒 Modo visitante: Conservando carrito local."
            );

            updateCartUI();

            return;
        }

        if (!res.ok) {

            console.warn(
                `⚠️ Error obteniendo carrito de BD: HTTP ${res.status}`
            );

            return;
        }

        const dbCartData = await res.json();

        const dbCart =
            mapBackendCartToFrontend(dbCartData);


        // ------------------------------------------------------------------
        // 2. Obtener carrito local
        // ------------------------------------------------------------------

        const localCart = [...getCart()];


        // ------------------------------------------------------------------
        // 3. Sincronizar carrito LOCAL → BD
        //
        // Si la variante ya existe en BD:
        //      LOCAL reemplaza cantidad BD.
        //
        // Si no existe:
        //      LOCAL se agrega a BD.
        //
        // Las variantes que solo existen en BD se conservan.
        // ------------------------------------------------------------------

        for (const localItem of localCart) {

            if (
                localItem?.variantId == null ||
                Number(localItem.qty) <= 0
            ) {
                continue;
            }


            const dbItem = dbCart.find(item =>
                String(item.variantId) ===
                String(localItem.variantId)
            );


            // --------------------------------------------------------------
            // Variante ya existe en BD
            // → REEMPLAZAR cantidad
            // --------------------------------------------------------------

            if (dbItem) {

                const localQty =
                    Number(localItem.qty);

                const dbQty =
                    Number(dbItem.qty);

                // Ya tienen la misma cantidad.
                // No necesitamos hacer ninguna petición.
                if (localQty === dbQty) {
                    continue;
                }

                const updateRes =
                    await apiUpdateItem(
                        localItem.variantId,
                        localQty
                    );

                if (!updateRes.ok) {

                    throw new Error(
                        `No se pudo actualizar la variante ${localItem.variantId}. HTTP ${updateRes.status}`
                    );
                }

                console.log(
                    `✅ Variante ${localItem.variantId} actualizada: ${dbQty} → ${localQty}`
                );

            }


            // --------------------------------------------------------------
            // Variante no existe en BD
            // → AGREGAR
            // --------------------------------------------------------------

            else {

                const addRes =
                    await apiAddItem(
                        localItem.variantId,
                        Number(localItem.qty)
                    );

                if (!addRes.ok) {

                    throw new Error(
                        `No se pudo agregar la variante ${localItem.variantId}. HTTP ${addRes.status}`
                    );
                }

                console.log(
                    `✅ Variante ${localItem.variantId} agregada: ×${localItem.qty}`
                );
            }
        }


        // ------------------------------------------------------------------
        // 4. Obtener carrito definitivo desde BD
        //
        // Esto garantiza que el estado del frontend coincida exactamente
        // con DB después de la sincronización.
        // ------------------------------------------------------------------

        const finalRes =
            await apiGetCart();

        if (!finalRes.ok) {

            throw new Error(
                `No se pudo obtener el carrito final. HTTP ${finalRes.status}`
            );
        }

        const finalCartData =
            await finalRes.json();


        // ------------------------------------------------------------------
        // 5. Convertir BD → formato frontend
        // ------------------------------------------------------------------

        const finalCart =
            mapBackendCartToFrontend(finalCartData);


        // ------------------------------------------------------------------
        // 6. La BD pasa a ser la fuente activa del carrito
        // ------------------------------------------------------------------

        setCart(finalCart);


        // ------------------------------------------------------------------
        // 7. El carrito local ya fue sincronizado correctamente
        // ------------------------------------------------------------------

        clearCartStorage();


        // ------------------------------------------------------------------
        // 8. Actualizar interfaz
        // ------------------------------------------------------------------

        updateCartUI();


        console.log(
            "✅ Carrito local sincronizado correctamente con DB."
        );

    }
    catch (err) {

        console.warn(
            "⚠️ La sincronización del carrito no pudo completarse:",
            err
        );

        // IMPORTANTE:
        // No se borra LocalStorage si alguna operación falla.
        // El carrito local queda intacto para poder intentar sincronizarlo
        // nuevamente.

    }
}




function mapBackendCartToFrontend(cartData) {

    const items =
        cartData?.data?.items ??
        cartData?.items ??
        [];

    if (!Array.isArray(items)) {
        return [];
    }

    return items.map(item => {

        // ==============================================================
        // PRODUCTO
        // El backend lo entrega directamente dentro de item.product
        // ==============================================================

        const product = item.product ?? {};

        // ==============================================================
        // ATRIBUTOS
        // El backend ya los entrega simplificados
        // ==============================================================

        const attributes =
            Array.isArray(product.attributes)
                ? product.attributes.map(attribute => ({
                    attribute: {
                        name: attribute.name ?? "",
                        slug: attribute.slug ?? "",
                        id: attribute.id ?? null
                    },
                    option: {
                        value: attribute.value ?? "",
                        hexColor: attribute.hexColor ?? ""
                    }
                }))
                : [];

        // ==============================================================
        // PRECIO
        // Viene directamente del backend
        // ==============================================================

        const price = Number(
            item.unitPrice ?? 0
        );

        // ==============================================================
        // PRECIO ANTERIOR / TACHADO
        // Viene directamente del backend
        // ==============================================================

        const compareAtPrice = Number(
            item.compareAtPrice ?? 0
        );

        // ==============================================================
        // IMAGEN
        // ==============================================================

        const image =
            product.image ?? "";

        // ==============================================================
        // OBJETO FINAL DEL CARRITO
        // ==============================================================

        return {
            // ID REAL DEL CART ITEM
            id: item.id,

            // ID DE LA VARIANTE
            variantId: item.productVariantId,

            // PRODUCTO
            name: product.name ?? "Producto",

            // PRECIOS
            price,
            compareAtPrice,

            // IMAGEN
            image,

            // ATRIBUTOS
            attributes,

            // CANTIDAD
            qty: Number(item.quantity ?? 1),

            // SELECCIÓN PARA CHECKOUT
            isSelected: item.isSelected === true
        };
    });
}

window.syncCartFromBackend = syncCartFromBackend;