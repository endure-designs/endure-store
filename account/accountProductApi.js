// ==========================================================================
// ACCOUNT PRODUCT API — API administrativa de productos
// ==========================================================================
//
// Responsabilidades:
//
// - Obtener productos administrativos
// - Obtener un producto completo para edición
// - Obtener atributos de un tipo de producto
// - Crear productos
// - Actualizar productos
// - Eliminar productos
//
// Este módulo NO contiene:
// - lógica de UI
// - manipulación del DOM
// - generación de variantes
// - lógica de inventario
//
// ==========================================================================


// ==========================================================================
// CONFIGURACIÓN
// ==========================================================================

const accountProductApi = {

    // ----------------------------------------------------------------------
    // Obtener lista administrativa de productos
    // ----------------------------------------------------------------------

    async getProducts(params = {}) {

        const query = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {

            if (
                value !== undefined &&
                value !== null &&
                value !== ''
            ) {
                query.append(key, value);
            }

        });

        const queryString =
            query.toString()
                ? `?${query.toString()}`
                : '';

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/products${queryString}`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        const data = await parseResponse(response);

        return data;
    },


    // ----------------------------------------------------------------------
    // Obtener producto administrativo completo
    // ----------------------------------------------------------------------
    //
    // Este endpoint se utilizará para EDITAR un producto.
    //
    // A diferencia de catalogApi.getProducts(), aquí necesitamos:
    //
    // - información del diseño
    // - productType
    // - taxonomy
    // - media
    // - tags
    // - variantes
    // - inventario
    //
    // ----------------------------------------------------------------------

    async getProductById(productId) {

        if (!productId) {
            throw new Error(
                'Se requiere productId para obtener el producto.'
            );
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/products/${encodeURIComponent(productId)}`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        const data = await parseResponse(response);

        return data;
    },


    // ----------------------------------------------------------------------
    // Obtener atributos permitidos para un tipo de producto
    // ----------------------------------------------------------------------
    //
    // Ejemplo:
    //
    // GET /api/admin/products/product-types/polo/attributes
    //
    // Devuelve las opciones que accountVariants.js utilizará para
    // construir las combinaciones.
    //
    // ----------------------------------------------------------------------

    async getProductTypeAttributes(productTypeSlug) {

        if (
            !productTypeSlug ||
            productTypeSlug === '__NUEVO__'
        ) {
            throw new Error(
                'Se requiere un tipo de producto válido.'
            );
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/products/product-types/${encodeURIComponent(productTypeSlug)}/attributes`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        const data = await parseResponse(response);

        return data;
    },


    // ----------------------------------------------------------------------
    // Crear producto
    // ----------------------------------------------------------------------

    async createProduct(productData) {

        if (!productData || typeof productData !== 'object') {
            throw new Error(
                'Los datos del producto son obligatorios.'
            );
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/products`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                credentials: 'include',

                body: JSON.stringify(productData)
            }
        );

        const data = await parseResponse(response);

        return data;
    },


    // ----------------------------------------------------------------------
    // Actualizar producto
    // ----------------------------------------------------------------------

    async updateProduct(productId, productData) {

        if (!productId) {
            throw new Error(
                'Se requiere productId para actualizar el producto.'
            );
        }

        if (!productData || typeof productData !== 'object') {
            throw new Error(
                'Los datos del producto son obligatorios.'
            );
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/products/${encodeURIComponent(productId)}`,
            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                credentials: 'include',

                body: JSON.stringify(productData)
            }
        );

        const data = await parseResponse(response);

        return data;
    },


    // ----------------------------------------------------------------------
    // Eliminar producto
    // ----------------------------------------------------------------------

    async deleteProduct(productId) {

        if (!productId) {
            throw new Error(
                'Se requiere productId para eliminar el producto.'
            );
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/products/${encodeURIComponent(productId)}`,
            {
                method: 'DELETE',
                credentials: 'include'
            }
        );

        const data = await parseResponse(response);

        return data;
    },



    // ----------------------------------------------------------------------
    // Publicar / despublicar producto
    // ----------------------------------------------------------------------
    async setPublished(productId, isPublished) {
        if (!productId) {
            throw new Error('Se requiere productId para actualizar la publicación.');
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/products/${encodeURIComponent(productId)}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    isPublished: Boolean(isPublished)
                })
            }
        );

        return await parseResponse(response);
    }

};


// ==========================================================================
// PROCESAR RESPUESTA HTTP
// ==========================================================================

async function parseResponse(response) {

    let data = null;

    try {

        data = await response.json();

    } catch (error) {

        console.error(
            '❌ ERROR PARSEANDO RESPUESTA:',
            {
                status: response.status,
                statusText: response.statusText,
                error: error
            }
        );

        if (!response.ok) {

            throw new Error(
                `Error HTTP ${response.status}`
            );
        }

        return null;
    }

    if (!response.ok) {

        const message =
            data?.message ||
            data?.error?.message ||
            `Error HTTP ${response.status}`;

        console.error(
            '❌ ERROR COMPLETO DEL BACKEND:',
            {
                status: response.status,
                data: data
            }
        );

        const error = new Error(message);

        error.status = response.status;

        error.code =
            data?.code ||
            data?.error?.code ||
            null;

        error.data = data;

        throw error;
    }

    return data;
}


// ==========================================================================
// API PÚBLICA
// ==========================================================================

window.accountProductApi = accountProductApi;