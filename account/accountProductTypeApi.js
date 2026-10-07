// ==========================================================================
// ACCOUNT PRODUCT TYPE API — API administrativa de tipos y atributos
// ==========================================================================
//
// Responsabilidades:
//
// - Obtener tipos de producto
// - Obtener un tipo de producto
// - Obtener atributos de un tipo de producto
// - Obtener atributos disponibles
// - Obtener opciones de un atributo
//
// Este módulo NO contiene:
//
// - lógica de UI
// - manipulación del DOM
// - renderizado
// - modales
// - generación de variantes
//
// ==========================================================================


// ==========================================================================
// CONFIGURACIÓN
// ==========================================================================

const accountProductTypeApi = {

    // ----------------------------------------------------------------------
    // Obtener lista de tipos de producto
    // ----------------------------------------------------------------------

    async getProductTypes(params = {}) {

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
            `${CONFIG.API_BASE_URL}/admin/attributes/product-types${queryString}`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        const data =
            await parseResponse(response);

        return data;
    },


    // ----------------------------------------------------------------------
    // Obtener un tipo de producto
    // ----------------------------------------------------------------------

    async getProductTypeById(productTypeId) {

        if (!productTypeId) {
            throw new Error(
                'Se requiere productTypeId para obtener el tipo de producto.'
            );
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/attributes/product-types/${encodeURIComponent(productTypeId)}`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        const data =
            await parseResponse(response);

        return data;
    },


    // ----------------------------------------------------------------------
    // Crear tipo de producto
    // ----------------------------------------------------------------------

    async createProductType(productTypeData) {

        if (
            !productTypeData ||
            typeof productTypeData !== 'object'
        ) {
            throw new Error(
                'Los datos del tipo de producto son obligatorios.'
            );
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/attributes/product-types`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                credentials: 'include',

                body: JSON.stringify(productTypeData)
            }
        );

        const data =
            await parseResponse(response);

        return data;
    },


    // ----------------------------------------------------------------------
    // Actualizar tipo de producto
    // ----------------------------------------------------------------------

    async updateProductType(productTypeId, productTypeData) {

        if (!productTypeId) {
            throw new Error(
                'Se requiere productTypeId para actualizar el tipo de producto.'
            );
        }

        if (
            !productTypeData ||
            typeof productTypeData !== 'object'
        ) {
            throw new Error(
                'Los datos del tipo de producto son obligatorios.'
            );
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/attributes/product-types/${encodeURIComponent(productTypeId)}`,
            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                credentials: 'include',

                body: JSON.stringify(productTypeData)
            }
        );

        const data =
            await parseResponse(response);

        return data;
    },


    // ----------------------------------------------------------------------
    // Eliminar tipo de producto
    // ----------------------------------------------------------------------

    async deleteProductType(productTypeId) {

        if (!productTypeId) {
            throw new Error(
                'Se requiere productTypeId para eliminar el tipo de producto.'
            );
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/attributes/product-types/${encodeURIComponent(productTypeId)}`,
            {
                method: 'DELETE',
                credentials: 'include'
            }
        );

        const data =
            await parseResponse(response);

        return data;
    },


    // ----------------------------------------------------------------------
    // Obtener configuración de atributos de un tipo de producto
    // ----------------------------------------------------------------------

    async getProductTypeAttributes(productTypeId) {

        if (!productTypeId) {
            throw new Error(
                'Se requiere productTypeId para obtener sus atributos.'
            );
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/attributes/product-types/${encodeURIComponent(productTypeId)}/attributes`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        const data =
            await parseResponse(response);

        return data;
    },


    // ----------------------------------------------------------------------
    // Asignar atributo a un tipo de producto
    // ----------------------------------------------------------------------

    async assignAttributeToProductType(productTypeId, attributeData) {

        if (!productTypeId) {
            throw new Error(
                'Se requiere productTypeId para asignar el atributo.'
            );
        }

        if (
            !attributeData ||
            typeof attributeData !== 'object'
        ) {
            throw new Error(
                'Los datos del atributo son obligatorios.'
            );
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/attributes/product-types/${encodeURIComponent(productTypeId)}/attributes`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(attributeData)
            }
        );

        const data =
            await parseResponse(response);

        return data;
    },

    // ----------------------------------------------------------------------
    // Actualizar configuración de atributo de un tipo de producto
    // ----------------------------------------------------------------------

    async updateProductTypeAttribute(relationId, relationData) {

        if (!relationId) {
            throw new Error(
                'Se requiere relationId para actualizar la configuración del atributo.'
            );
        }

        if (
            !relationData ||
            typeof relationData !== 'object'
        ) {
            throw new Error(
                'Los datos de configuración son obligatorios.'
            );
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/attributes/product-types/attributes/${encodeURIComponent(relationId)}`,
            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                credentials: 'include',

                body: JSON.stringify(relationData)
            }
        );

        const data =
            await parseResponse(response);

        return data;
    },


    // ----------------------------------------------------------------------
    // Retirar atributo de un tipo de producto
    // ----------------------------------------------------------------------

    async removeAttributeFromProductType(relationId) {

        if (!relationId) {
            throw new Error(
                'Se requiere relationId para retirar el atributo.'
            );
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/attributes/product-types/attributes/${encodeURIComponent(relationId)}`,
            {
                method: 'DELETE',
                credentials: 'include'
            }
        );

        const data =
            await parseResponse(response);

        return data;
    },


    // ----------------------------------------------------------------------
    // Obtener lista de atributos disponibles
    // ----------------------------------------------------------------------

    async getAttributes(params = {}) {

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
            `${CONFIG.API_BASE_URL}/admin/attributes${queryString}`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        const data =
            await parseResponse(response);

        return data;
    },


    // ----------------------------------------------------------------------
    // Crear atributo
    // ----------------------------------------------------------------------

    async createAttribute(attributeData) {

        if (
            !attributeData ||
            typeof attributeData !== 'object'
        ) {
            throw new Error(
                'Los datos del atributo son obligatorios.'
            );
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/attributes`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(attributeData)
            }
        );

        const data =
            await parseResponse(response);

        return data;
    },


    // ----------------------------------------------------------------------
    // Actualizar atributo
    // ----------------------------------------------------------------------

    async updateAttribute(attributeId, attributeData) {

        if (!attributeId) {
            throw new Error(
                'Se requiere attributeId para actualizar el atributo.'
            );
        }

        if (
            !attributeData ||
            typeof attributeData !== 'object'
        ) {
            throw new Error(
                'Los datos del atributo son obligatorios.'
            );
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/attributes/${encodeURIComponent(attributeId)}`,
            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                credentials: 'include',

                body: JSON.stringify(attributeData)
            }
        );

        const data =
            await parseResponse(response);

        return data;
    },


    // ----------------------------------------------------------------------
    // Eliminar atributo
    // ----------------------------------------------------------------------

    async deleteAttribute(attributeId) {

        if (!attributeId) {
            throw new Error(
                'Se requiere attributeId para eliminar el atributo.'
            );
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/attributes/${encodeURIComponent(attributeId)}`,
            {
                method: 'DELETE',
                credentials: 'include'
            }
        );

        const data =
            await parseResponse(response);

        return data;
    },


    // ----------------------------------------------------------------------
    // Obtener opciones de un atributo
    // ----------------------------------------------------------------------

    async getAttributeOptions(attributeId) {

        if (!attributeId) {
            throw new Error(
                'Se requiere attributeId para obtener sus opciones.'
            );
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/attributes/${encodeURIComponent(attributeId)}/options`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        const data =
            await parseResponse(response);

        return data;
    },


    // ----------------------------------------------------------------------
    // Crear opción de atributo
    // ----------------------------------------------------------------------

    async createAttributeOption(attributeId, optionData) {

        if (!attributeId) {
            throw new Error(
                'Se requiere attributeId para crear la opción.'
            );
        }

        if (
            !optionData ||
            typeof optionData !== 'object'
        ) {
            throw new Error(
                'Los datos de la opción son obligatorios.'
            );
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/attributes/${encodeURIComponent(attributeId)}/options`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(optionData)
            }
        );

        const data =
            await parseResponse(response);

        return data;
    },

    // ----------------------------------------------------------------------
    // Actualizar opción de atributo
    // ----------------------------------------------------------------------

    async updateAttributeOption(optionId, optionData) {

        if (!optionId) {
            throw new Error(
                'Se requiere optionId para actualizar la opción.'
            );
        }

        if (
            !optionData ||
            typeof optionData !== 'object'
        ) {
            throw new Error(
                'Los datos de la opción son obligatorios.'
            );
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/attributes/options/${encodeURIComponent(optionId)}`,
            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                credentials: 'include',

                body: JSON.stringify(optionData)
            }
        );

        const data =
            await parseResponse(response);

        return data;
    },


    // ----------------------------------------------------------------------
    // Eliminar opción de atributo
    // ----------------------------------------------------------------------

    async deleteAttributeOption(optionId) {

        if (!optionId) {
            throw new Error(
                'Se requiere optionId para eliminar la opción.'
            );
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/attributes/options/${encodeURIComponent(optionId)}`,
            {
                method: 'DELETE',
                credentials: 'include'
            }
        );

        const data =
            await parseResponse(response);

        return data;
    },


    // ----------------------------------------------------------------------
    // Identificar color por hexadecimal
    // ----------------------------------------------------------------------

    async identifyColor(hexColor) {

        if (!hexColor) {
            throw new Error(
                'Se requiere hexColor para identificar el color.'
            );
        }

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/identificar-color`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                credentials: 'include',

                body: JSON.stringify({
                    hexColor
                })
            }
        );

        const data =
            await parseResponse(response);

        return data;
    }



};




// ==========================================================================
// PROCESAR RESPUESTA HTTP
// ==========================================================================

async function parseResponse(response) {

    const rawText =
        await response.text();

    console.log('📡 RESPUESTA DEL SERVIDOR:', {
        status: response.status,
        ok: response.ok,
        body: rawText
    });

    let data = null;

    try {
        data = rawText
            ? JSON.parse(rawText)
            : null;
    } catch (error) {

        console.error(
            '❌ RESPUESTA NO JSON:',
            rawText
        );

        if (!response.ok) {
            throw new Error(
                `Error HTTP ${response.status}: ${rawText}`
            );
        }

        return null;
    }

    if (!response.ok) {

        console.error(
            '❌ ERROR COMPLETO DEL BACKEND:',
            data
        );

        const message =
            data?.message ||
            data?.error?.message ||
            `Error HTTP ${response.status}`;

        const error =
            new Error(message);

        error.status =
            response.status;

        error.code =
            data?.code ||
            data?.error?.code ||
            null;

        error.data =
            data;

        throw error;
    }

    return data;
}



// ==========================================================================
// API PÚBLICA
// ==========================================================================

window.accountProductTypeApi =
    accountProductTypeApi;