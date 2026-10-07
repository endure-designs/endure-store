// ==========================================================================
// ACCOUNT SELECTS — Desplegables híbridos, filtrado cascada y datos
// ==========================================================================
let ADMIN_PRODUCTS = [];

// ==========================================================================
// OBTENER VALOR REAL DE UN SELECT HÍBRIDO (NOMBRE)
// ==========================================================================

function getFieldValue(selectId) {

    const select =
        document.getElementById(selectId);

    if (!select) return '';

    if (select.value === '__NUEVO__') {

        const wrapper =
            select.closest(
                '.editable-select-wrapper'
            );

        const input =
            wrapper
                ? wrapper.querySelector('.editable-input')
                : null;

        return input
            ? input.value.trim()
            : '';
    }

    const option = select.options[select.selectedIndex];
    return option ? option.text.trim() : select.value.trim();
}


function getFieldId(selectId) {

    const select =
        document.getElementById(selectId);

    if (!select) return null;

    const option =
        select.options[select.selectedIndex];

    if (!option) return null;

    if (selectId === 'adminTheme') {
        return option.dataset.themeId
            ? Number(option.dataset.themeId)
            : null;
    }

    if (selectId === 'adminSubtheme') {
        return option.dataset.subthemeId
            ? Number(option.dataset.subthemeId)
            : null;
    }

    return null;
}


// ==========================================================================
// OBTENER TIPO DE PRODUCTO (NOMBRE)
// ==========================================================================

function getProductTypeValue() {

    const typeSelect =
        document.getElementById(
            'adminProductType'
        );

    if (!typeSelect) return '';

    // ----------------------------------------------------------------------
    // Solo se permiten tipos de producto existentes.
    // No se admite __NUEVO__ en este selector.
    // ----------------------------------------------------------------------

    const option =
        typeSelect.options[
        typeSelect.selectedIndex
        ];

    return option
        ? option.text.trim()
        : typeSelect.value.trim();
}

// ==========================================================================
// MANEJAR SELECT HÍBRIDO
// ==========================================================================

function handleEditableSelectChange(select) {

    const wrapper =
        select.closest(
            '.editable-select-wrapper'
        );

    const input =
        wrapper
            ? wrapper.querySelector('.editable-input')
            : null;


    // ======================================================================
    // OPCIÓN: AÑADIR NUEVO
    // ======================================================================

    if (select.value === '__NUEVO__') {
        if (input) {
            input.style.display = 'block';
            input.focus();
        }

        if (select.id === 'adminProductType') {
            if (window.accountVariants && typeof accountVariants.limpiarVariantes === 'function') {
                accountVariants.limpiarVariantes();
            }

            loadCategoriesByProductType(null);
        }

        return;
    }


    // ======================================================================
    // OPCIÓN EXISTENTE
    // ======================================================================

    if (input) {

        input.style.display = 'none';
        input.value = '';

    }


    // ======================================================================
    // PRODUCT TYPE → CARGAR ATRIBUTOS
    // ======================================================================

    if (select.id === 'adminProductType') {
        const productTypeSlug = select.value.trim();
        const selectedOption = select.options[select.selectedIndex];
        const productTypeId = selectedOption?.dataset?.productTypeId;

        if (window.accountVariants && typeof accountVariants.cargarAtributosDelTipoProducto === 'function') {
            accountVariants.cargarAtributosDelTipoProducto(productTypeSlug);
        }

        loadCategoriesByProductType(productTypeId);
    }
}


// ==========================================================================
// SELECCIONAR OPCIÓN EXISTENTE O CREAR NUEVA
// ==========================================================================

async function seleccionarOCrearOpcion(
    selectId,
    valorSugerido
) {

    const select =
        document.getElementById(selectId);

    if (!select || !valorSugerido) return;

    const valorLimpio =
        valorSugerido.trim();

    const wrapper =
        select.closest(
            '.editable-select-wrapper'
        );

    const input =
        wrapper
            ? wrapper.querySelector('.editable-input')
            : null;

    // ----------------------------------------------------------------------
    // BUSCAR OPCIÓN EXISTENTE
    // ----------------------------------------------------------------------

    const opcionExistente =
        Array.from(select.options).find(
            opt =>
                opt.value.toLowerCase() ===
                valorLimpio.toLowerCase() ||

                opt.text.toLowerCase() ===
                valorLimpio.toLowerCase()
        );

    // ----------------------------------------------------------------------
    // OPCIÓN EXISTENTE
    // ----------------------------------------------------------------------

    if (opcionExistente) {

        select.value =
            opcionExistente.value;

        if (input) {
            input.style.display = 'none';
            input.value = '';
        }

        // ==================================================================
        // PRODUCT TYPE
        // ==================================================================

        if (selectId === 'adminProductType') {

            const productTypeId =
                opcionExistente.dataset?.productTypeId;

            // --------------------------------------------------------------
            // Cargar atributos del tipo de producto
            // --------------------------------------------------------------

            if (
                window.accountVariants &&
                typeof accountVariants.cargarAtributosDelTipoProducto ===
                'function'
            ) {

                await accountVariants.cargarAtributosDelTipoProducto(
                    opcionExistente.value
                );
            }

            // --------------------------------------------------------------
            // Cargar categorías y ESPERAR a que termine
            // --------------------------------------------------------------

            await loadCategoriesByProductType(
                productTypeId
            );
        }

        return;
    }

    // ----------------------------------------------------------------------
    // OPCIÓN NO EXISTE → CREAR NUEVA
    // ----------------------------------------------------------------------

    select.value =
        '__NUEVO__';

    if (input) {

        input.style.display =
            'block';

        input.value =
            valorLimpio;
    }

    // ----------------------------------------------------------------------
    // SI ES PRODUCT TYPE NUEVO → LIMPIAR VARIANTES
    // ----------------------------------------------------------------------

    if (
        selectId === 'adminProductType' &&
        window.accountVariants &&
        typeof accountVariants.limpiarVariantes ===
        'function'
    ) {

        accountVariants.limpiarVariantes();
    }
}


// ==========================================================================
// CAMBIO DE TEMA
// ==========================================================================

async function handleThemeChange(select) {

    handleEditableSelectChange(select);

    await updateSubthemesBySelectedTheme();

}

// ==========================================================================
// ACTUALIZAR SUBTEMAS SEGÚN TEMA
// ==========================================================================

async function updateSubthemesBySelectedTheme() {

    const subthemeSelect =
        document.getElementById('adminSubtheme');

    if (!subthemeSelect) return;

    // ======================================================================
    // OBTENER ID DEL TEMA SELECCIONADO
    // ======================================================================

    const themeId =
        getFieldId('adminTheme');

    // ======================================================================
    // SIN TEMA SELECCIONADO
    // ======================================================================

    if (!themeId) {

        subthemeSelect.innerHTML =
            `<option value="__NUEVO__" selected>
                + Añadir nuevo...
            </option>`;

        subthemeSelect.value =
            '__NUEVO__';

        handleEditableSelectChange(
            subthemeSelect
        );

        return [];
    }

    // ======================================================================
    // CARGAR SUBTEMAS DESDE LA BASE DE DATOS
    // ======================================================================

    return await loadSubthemes(themeId);
}



// ==========================================================================
// CARGAR TEMAS DESDE EL BACKEND
// ==========================================================================

async function loadThemes() {

    const themeSelect =
        document.getElementById('adminTheme');

    if (!themeSelect) return [];

    try {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/themes`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error ||
                data.message ||
                'No se pudieron cargar los temas.'
            );
        }

        const themes =
            data.data?.items ||
            data.data ||
            [];

        // --------------------------------------------------------------
        // Construir opciones
        // --------------------------------------------------------------

        let html =
            `<option value="__NUEVO__" selected>
                + Añadir nuevo...
            </option>`;

        themes
            .filter(theme =>
                theme &&
                theme.id &&
                theme.slug &&
                theme.name
            )
            .sort((a, b) =>
                a.name.localeCompare(b.name)
            )
            .forEach(theme => {

                html +=
                    `<option
                        value="${theme.slug}"
                        data-theme-id="${theme.id}">
                        ${theme.name}
                    </option>`;

            });

        // --------------------------------------------------------------
        // Aplicar al select
        // --------------------------------------------------------------

        themeSelect.innerHTML = html;

        themeSelect.value = '__NUEVO__';

        const wrapper =
            themeSelect.closest(
                '.editable-select-wrapper'
            );

        const input =
            wrapper
                ? wrapper.querySelector('.editable-input')
                : null;

        if (input) {
            input.style.display = 'block';
        }

        console.log(
            '✅ Temas cargados:',
            themes
        );

        return themes;

    } catch (error) {

        console.error(
            '❌ Error cargando temas:',
            error
        );

        themeSelect.innerHTML =
            `<option value="__NUEVO__" selected>
                + Añadir nuevo...
            </option>`;

        themeSelect.value =
            '__NUEVO__';

        return [];
    }
}


// ==========================================================================
// CARGAR SUBTEMAS SEGÚN TEMA
// ==========================================================================

async function loadSubthemes(themeId) {

    const subthemeSelect =
        document.getElementById('adminSubtheme');

    if (!subthemeSelect) return [];

    if (!themeId) {
        subthemeSelect.innerHTML =
            `<option value="__NUEVO__" selected>
                + Añadir nuevo...
            </option>`;

        subthemeSelect.value = '__NUEVO__';

        return [];
    }

    try {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/themes/${encodeURIComponent(themeId)}/subthemes`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error ||
                data.message ||
                'No se pudieron cargar los subtemas.'
            );
        }

        const subthemes =
            data.data?.items ||
            data.data ||
            [];

        // --------------------------------------------------------------
        // Construir opciones
        // --------------------------------------------------------------

        let html =
            `<option value="__NUEVO__" selected>
                + Añadir nuevo...
            </option>`;

        subthemes
            .filter(subtheme =>
                subtheme &&
                subtheme.id &&
                subtheme.slug &&
                subtheme.name
            )
            .sort((a, b) =>
                a.name.localeCompare(b.name)
            )
            .forEach(subtheme => {

                html +=
                    `<option
                        value="${subtheme.slug}"
                        data-subtheme-id="${subtheme.id}">
                        ${subtheme.name}
                    </option>`;

            });

        // --------------------------------------------------------------
        // Aplicar al select
        // --------------------------------------------------------------

        subthemeSelect.innerHTML = html;

        subthemeSelect.value = '__NUEVO__';

        const wrapper =
            subthemeSelect.closest(
                '.editable-select-wrapper'
            );

        const input =
            wrapper
                ? wrapper.querySelector('.editable-input')
                : null;

        if (input) {
            input.style.display = 'block';
        }

        console.log(
            '✅ Subtemas cargados para Theme:',
            themeId,
            subthemes
        );

        return subthemes;

    } catch (error) {

        console.error(
            '❌ Error cargando subtemas:',
            error
        );

        subthemeSelect.innerHTML =
            `<option value="__NUEVO__" selected>
                + Añadir nuevo...
            </option>`;

        subthemeSelect.value = '__NUEVO__';

        return [];
    }
}


// ==========================================================================
// CARGAR TIPOS DE PRODUCTO PARA SELECT
// ==========================================================================

async function loadProductTypesForSelect() {

    try {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/attributes/product-types`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error ||
                'No se pudieron cargar los tipos de producto.'
            );
        }

        const productTypes =
            data.data?.items ||
            data.data ||
            [];

        const productTypeSelect =
            document.getElementById(
                'adminProductType'
            );

        if (!productTypeSelect) {
            return productTypes;
        }

        // ==================================================================
        // CONSTRUIR OPCIONES
        // ==================================================================
        //
        // Solo se muestran tipos existentes en la BD.
        // No se permite crear un tipo desde este selector.
        //
        // ==================================================================

        let html = `
            <option value="" selected disabled>
                Seleccionar tipo de producto...
            </option>
        `;

        productTypes
            .filter(
                productType =>
                    productType &&
                    productType.slug
            )
            .sort(
                (a, b) =>
                    a.name.localeCompare(b.name)
            )
            .forEach(productType => {

                html += `
                    <option
                        value="${productType.slug}"
                        data-product-type-id="${productType.id}">
                        ${productType.name}
                    </option>
                `;
            });

        productTypeSelect.innerHTML = html;

        // ==================================================================
        // DEJAR SIN SELECCIÓN
        // ==================================================================

        productTypeSelect.value = '';

        // ==================================================================
        // OCULTAR INPUT EDITABLE
        // ==================================================================

        const wrapper =
            productTypeSelect.closest(
                '.editable-select-wrapper'
            );

        const input =
            wrapper
                ? wrapper.querySelector(
                    '.editable-input'
                )
                : null;

        if (input) {
            input.style.display = 'none';
            input.value = '';
        }

        // ==================================================================
        // RESULTADO
        // ==================================================================

        console.log(
            '✅ Tipos de producto cargados:',
            productTypes
        );

        return productTypes;

    } catch (error) {

        console.error(
            '❌ Error cargando tipos de producto:',
            error
        );

        return [];
    }
}


// ==========================================================================
// CARGAR CATEGORÍAS SEGÚN TIPO DE PRODUCTO
// ==========================================================================

async function loadCategoriesByProductType(productTypeId) {
    const categorySelect = document.getElementById('adminCategory');

    if (!categorySelect) return [];

    if (!productTypeId) {
        categorySelect.innerHTML = `<option value="__NUEVO__" selected>+ Añadir nuevo...</option>`;
        categorySelect.value = '__NUEVO__';
        handleEditableSelectChange(categorySelect);
        return [];
    }

    try {
        const response = await fetch(
            `${CONFIG.API_BASE_URL}/admin/categories?productTypeId=${productTypeId}`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || 'No se pudieron cargar las categorías.'
            );
        }

        const categories =
            data.data?.items ||
            data.data ||
            [];

        let html = `<option value="__NUEVO__" selected>+ Añadir nuevo...</option>`;

        categories
            .filter(category => category && category.slug)
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(category => {
                html += `<option value="${category.slug}">${category.name}</option>`;
            });

        categorySelect.innerHTML = html;
        categorySelect.value = '__NUEVO__';

        const wrapper = categorySelect.closest('.editable-select-wrapper');
        const input = wrapper ? wrapper.querySelector('.editable-input') : null;

        if (input) {
            input.style.display = 'block';
        }

        console.log('✅ Categorías cargadas para ProductType:', productTypeId, categories);

        return categories;

    } catch (error) {
        console.error('❌ Error cargando categorías:', error);

        categorySelect.innerHTML =
            `<option value="__NUEVO__" selected>+ Añadir nuevo...</option>`;

        categorySelect.value = '__NUEVO__';
        handleEditableSelectChange(categorySelect);

        return [];
    }
}


// ==========================================================================
// POBLAR DESPLEGABLES
// ==========================================================================

function populateCategorizationSelects(products) {

    // Guardar los productos administrativos recibidos
    ADMIN_PRODUCTS = Array.isArray(products)
        ? products
        : [];


    // ======================================================================
    // PRODUCT TYPE
    // ======================================================================

    // Los ProductType vienen directamente del backend.
    loadProductTypesForSelect();


    // ======================================================================
    // THEME
    // ======================================================================

    // Los Themes vienen directamente del endpoint
    // /admin/themes y ya incluyen su ID.
    loadThemes();


    // ======================================================================
    // SUBTHEMES
    // ======================================================================

    updateSubthemesBySelectedTheme();

}






// ==========================================================================
// API PÚBLICA
// ==========================================================================

window.accountSelects = {

    getFieldValue,

    getFieldId,

    getProductTypeValue,

    handleEditableSelectChange,

    seleccionarOCrearOpcion,

    handleThemeChange,

    updateSubthemesBySelectedTheme,

    populateCategorizationSelects,

    loadProductTypesForSelect,

    loadThemes,

    loadSubthemes,

    loadCategoriesByProductType

};