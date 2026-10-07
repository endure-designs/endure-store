// ==========================================================================
// RAPID FORM
// Formulario temporal de datos para Checkout
// ==========================================================================

let rapidFormInitialized = false;

let rapidCountrySelector = null;
let rapidCountries = [];
let rapidSelectedCountry = null;
let rapidDocumentType = 'BOLETA';
let rapidIdentificationTypeSelector = null;

let rapidDivisionSelectors = [];
let rapidDivisionLevels = [];
let rapidSelectedDivisionPath = [];


// ==========================================================================
// INICIALIZACIÓN
// ==========================================================================

async function rapidInit() {

    if (rapidFormInitialized) {
        return;
    }

    rapidFormInitialized = true;

    rapidInitDocumentType();

    rapidRenderBillingIdentity();

    rapidInitIdentificationType();

    await rapidInitCountrySelector();

}

// ==========================================================================
// TIPO DE COMPROBANTE
// ==========================================================================

function rapidInitDocumentType() {

    const options =
        document.querySelectorAll(
            'input[name="rapidDocumentType"]'
        );

    if (!options.length) {
        console.warn(
            '⚠️ No se encontraron opciones de tipo de comprobante.'
        );

        return;
    }

    options.forEach(option => {

        option.addEventListener(
            'change',
            () => {

                if (!option.checked) {
                    return;
                }

                rapidDocumentType =
                    option.value;

                console.log(
                    '🧾 Tipo de comprobante:',
                    rapidDocumentType
                );

                // Regenerar los campos
                rapidRenderBillingIdentity();
            }
        );
    });

}

// ==========================================================================
// DATOS DE FACTURACIÓN — RENDERIZADO
// ==========================================================================

function rapidRenderBillingIdentity() {

    const container =
        document.getElementById(
            'rapidBillingIdentity'
        );

    if (!container) {
        console.warn(
            '⚠️ No existe #rapidBillingIdentity.'
        );

        return;
    }

    // Limpiar contenido anterior
    container.innerHTML = '';


    // ==============================================================
    // BOLETA
    // ==============================================================

    if (rapidDocumentType === 'BOLETA') {

        container.innerHTML = `

            <!-- Nombres -->
            <div class="rapid-form-field">

                <label for="rapidFirstName">
                    Nombres
                    <span class="rapid-required">*</span>
                </label>

                <input
                    type="text"
                    id="rapidFirstName"
                    name="firstName"
                    autocomplete="given-name"
                    required
                >

            </div>


            <!-- Apellidos -->
            <div class="rapid-form-field">

                <label for="rapidLastName">
                    Apellidos
                    <span class="rapid-required">*</span>
                </label>

                <input
                    type="text"
                    id="rapidLastName"
                    name="lastName"
                    autocomplete="family-name"
                    required
                >

            </div>


            <!-- Tipo de identificación -->
            <div class="rapid-form-field">

                <label for="rapidIdentificationType">
                    Tipo de identificación
                    <span class="rapid-required">*</span>
                </label>

                <div
                    id="rapidIdentificationType"
                    class="rapid-form-selector"
                    aria-required="true"
                ></div>

            </div>


            <!-- Número de identificación -->
            <div class="rapid-form-field">

                <label for="rapidIdentificationNumber">
                    Número de identificación
                    <span class="rapid-required">*</span>
                </label>

                <input
                    type="text"
                    id="rapidIdentificationNumber"
                    name="identificationNumber"
                    autocomplete="off"
                    readonly
                    required
                    placeholder="Selecciona primero el tipo"
                >

            </div>

        `;

        rapidInitIdentificationType();

        if (rapidSelectedCountry) {
            rapidUpdateIdentificationTypes(
                rapidSelectedCountry
            );
        }

        return;
    }


    // ==============================================================
    // FACTURA
    // ==============================================================

    if (rapidDocumentType === 'FACTURA') {

        container.innerHTML = `

            <!-- Razón social -->
            <div class="rapid-form-field">

                <label for="rapidBusinessName">
                    Razón social
                    <span class="rapid-required">*</span>
                </label>

                <input
                    type="text"
                    id="rapidBusinessName"
                    name="businessName"
                    autocomplete="organization"
                    required
                >

            </div>


            <!-- RUC -->
            <div class="rapid-form-field">

                <label for="rapidRuc">
                    RUC
                    <span class="rapid-required">*</span>
                </label>

                <input
                    type="text"
                    id="rapidRuc"
                    name="ruc"
                    autocomplete="off"
                    inputmode="numeric"
                    maxlength="11"
                    required
                >

            </div>

        `;

        return;
    }

}


// ==========================================================================
// SELECTOR — TIPO DE IDENTIFICACIÓN
// ==========================================================================

function rapidInitIdentificationType() {

    const container =
        document.getElementById(
            'rapidIdentificationType'
        );

    if (!container) {
        console.warn(
            '⚠️ No existe #rapidIdentificationType.'
        );

        rapidIdentificationTypeSelector = null;

        return;
    }

    if (!window.AppSelector) {
        console.error(
            '❌ AppSelector no está disponible.'
        );

        return;
    }

    rapidIdentificationTypeSelector =
        new AppSelector({
            container,
            placeholder: 'Seleccionar...',
            value: null,
            options: [],
            disabled: true,
            onChange:
                rapidHandleIdentificationTypeChange
        });

    const input =
        document.getElementById(
            'rapidIdentificationNumber'
        );

    if (input) {
        input.addEventListener(
            'input',
            rapidHandleIdentificationNumberInput
        );
    }

}


// ==========================================================================
// CAMBIO DE TIPO DE IDENTIFICACIÓN
// ==========================================================================

function rapidHandleIdentificationTypeChange(typeId) {

    const input =
        document.getElementById(
            'rapidIdentificationNumber'
        );

    if (!input) {
        return;
    }

    // Limpiar número anterior
    input.value = '';

    // Eliminar restricciones anteriores
    input.removeAttribute('minlength');
    input.removeAttribute('maxlength');
    input.removeAttribute('pattern');

    // Sin tipo seleccionado
    if (
        typeId === null ||
        typeId === undefined ||
        String(typeId).trim() === ''
    ) {

        input.readOnly = true;
        input.placeholder =
            'Selecciona primero el tipo';
        input.inputMode = 'text';

        return;
    }

    const identificationTypes =
        Array.isArray(
            rapidSelectedCountry?.identificationTypes
        )
            ? rapidSelectedCountry.identificationTypes
            : [];

    const identificationType =
        identificationTypes.find(
            type =>
                String(type.id) ===
                String(typeId)
        );

    if (!identificationType) {

        input.readOnly = false;
        input.placeholder =
            'Número de identificación';
        input.inputMode = 'text';

        return;
    }

    // Habilitar campo
    input.readOnly = false;
    input.placeholder =
        'Número de identificación';

    // ==============================================================
    // LONGITUD MÍNIMA
    // ==============================================================

    if (
        identificationType.minLength !== null &&
        identificationType.minLength !== undefined
    ) {

        input.minLength =
            Number(
                identificationType.minLength
            );
    }

    // ==============================================================
    // LONGITUD MÁXIMA
    // ==============================================================

    if (
        identificationType.maxLength !== null &&
        identificationType.maxLength !== undefined
    ) {

        input.maxLength =
            Number(
                identificationType.maxLength
            );
    }

    // ==============================================================
    // PATRÓN DE VALIDACIÓN
    // ==============================================================

    if (
        identificationType.validationPattern
    ) {

        input.setAttribute(
            'pattern',
            identificationType.validationPattern
        );
    }

    // ==============================================================
    // MODO DE ENTRADA
    // ==============================================================

    if (
        identificationType.validationPattern &&
        identificationType.validationPattern.includes(
            '[0-9]'
        )
    ) {

        input.inputMode = 'numeric';

    } else {

        input.inputMode = 'text';
    }

}

// ==========================================================================
// FILTRO DE NÚMERO DE IDENTIFICACIÓN
// ==========================================================================

function rapidHandleIdentificationNumberInput(event) {

    const input = event.target;

    const selectedType =
        rapidIdentificationTypeSelector?.getValue();

    if (
        selectedType === null ||
        selectedType === undefined ||
        String(selectedType).trim() === ''
    ) {
        input.value = '';
        return;
    }

    const identificationTypes =
        Array.isArray(
            rapidSelectedCountry?.identificationTypes
        )
            ? rapidSelectedCountry.identificationTypes
            : [];

    const identificationType =
        identificationTypes.find(
            type =>
                String(type.id) ===
                String(selectedType)
        );

    if (!identificationType) {
        return;
    }

    const pattern =
        identificationType.validationPattern;

    if (!pattern) {
        return;
    }

    let value = input.value;

    /*
     * Buscar clases de caracteres dentro del patrón.
     *
     * Ejemplos:
     * [0-9]
     * [A-Z]
     * [A-Z0-9]
     * [A-Za-z0-9]
     */
    const characterClasses =
        [...pattern.matchAll(/\[([^\]]+)\]/g)]
            .map(match => match[1]);

    if (characterClasses.length === 0) {
        return;
    }

    let allowedCharacters = '';

    for (const characterClass of characterClasses) {

        if (characterClass.includes('0-9')) {
            allowedCharacters += '0-9';
        }

        if (characterClass.includes('A-Z')) {
            allowedCharacters += 'A-Z';
        }

        if (characterClass.includes('a-z')) {
            allowedCharacters += 'a-z';
        }
    }

    if (!allowedCharacters) {
        return;
    }

    const invalidCharacters =
        new RegExp(
            `[^${allowedCharacters}]`,
            'g'
        );

    value =
        value.replace(
            invalidCharacters,
            ''
        );

    /*
     * Si el patrón permite mayúsculas pero no minúsculas,
     * normalizamos automáticamente a mayúsculas.
     */
    if (
        allowedCharacters.includes('A-Z') &&
        !allowedCharacters.includes('a-z')
    ) {
        value = value.toUpperCase();
    }

    input.value = value;

}


// ==========================================================================
// ACTUALIZAR TIPOS DE IDENTIFICACIÓN SEGÚN EL PAÍS
// ==========================================================================

function rapidUpdateIdentificationTypes(country) {

    if (!rapidIdentificationTypeSelector) {
        return;
    }

    if (!country) {

        rapidIdentificationTypeSelector.setOptions([]);
        rapidIdentificationTypeSelector.setValue(null);
        rapidIdentificationTypeSelector.disable();

        const input =
            document.getElementById(
                'rapidIdentificationNumber'
            );

        if (input) {
            input.value = '';
            input.readOnly = true;
            input.placeholder =
                'Selecciona primero el tipo';
        }

        return;
    }

    const identificationTypes =
        Array.isArray(country.identificationTypes)
            ? country.identificationTypes
            : [];

    const options =
        identificationTypes.map(type => ({
            value: type.id,
            label:
                type.name ||
                type.code ||
                'Identificación'
        }));

    rapidIdentificationTypeSelector.setOptions(
        options
    );

    rapidIdentificationTypeSelector.setValue(
        null
    );

    const input =
        document.getElementById(
            'rapidIdentificationNumber'
        );

    if (input) {
        input.value = '';
        input.readOnly = true;
        input.placeholder =
            'Selecciona primero el tipo';
    }

    if (options.length > 0) {
        rapidIdentificationTypeSelector.enable();
    } else {
        rapidIdentificationTypeSelector.disable();
    }

}


// ==========================================================================
// SELECTOR — PAÍS
// ==========================================================================

async function rapidInitCountrySelector() {

    const container =
        document.getElementById(
            'rapidCountrySelector'
        );

    if (!container) {
        console.warn(
            '⚠️ No existe #rapidCountrySelector.'
        );

        return;
    }

    if (!window.AppSelector) {
        console.error(
            '❌ AppSelector no está disponible.'
        );

        return;
    }

    if (
        !window.appLocation ||
        typeof appLocation.getCountries !== 'function'
    ) {
        console.error(
            '❌ appLocation no está disponible.'
        );

        return;
    }

    try {

        rapidCountries =
            await appLocation.getCountries();

        const options =
            appLocation.countriesToOptions(
                rapidCountries
            );

        rapidCountrySelector =
            new AppSelector({
                container,
                placeholder: 'Seleccionar país...',
                value: null,
                options,
                onChange: rapidHandleCountryChange
            });

    } catch (error) {

        console.error(
            '❌ Error cargando países:',
            error
        );
    }
}


// ==========================================================================
// UBICACIÓN — CAMBIO DE PAÍS
// ==========================================================================

async function rapidHandleCountryChange(countryId) {

    const numericCountryId =
        Number(countryId);

    if (
        !Number.isInteger(numericCountryId)
    ) {

        rapidSelectedCountry = null;
        rapidSelectedDivisionPath = [];

        rapidClearDivisionSelectors();

        rapidUpdateIdentificationTypes(null);

        return;
    }

    rapidSelectedCountry =
        rapidCountries.find(
            country =>
                Number(country.id) ===
                numericCountryId
        ) || null;

    rapidSelectedDivisionPath = [];

    rapidClearDivisionSelectors();

    if (!rapidSelectedCountry) {

        rapidUpdateIdentificationTypes(null);

        return;
    }

    // ==============================================================
    // CARGAR INFORMACIÓN DETALLADA DEL PAÍS
    // ==============================================================

    try {

        if (
            rapidSelectedCountry.iso2 &&
            window.appLocation &&
            typeof appLocation.getCountry === 'function'
        ) {

            const detailedCountry =
                await appLocation.getCountry(
                    rapidSelectedCountry.iso2
                );

            if (detailedCountry) {

                rapidSelectedCountry =
                    detailedCountry;
            }
        }

    } catch (error) {

        console.error(
            '❌ Error cargando información detallada del país:',
            error
        );
    }


    // ==============================================================
    // ACTUALIZAR TIPOS DE IDENTIFICACIÓN
    // ==============================================================

    rapidUpdateIdentificationTypes(
        rapidSelectedCountry
    );


    // ==============================================================
    // CARGAR DIVISIONES ADMINISTRATIVAS
    // ==============================================================

    try {

        const result =
            await appLocation.getCountryDivisions(
                rapidSelectedCountry.iso2
            );

        rapidDivisionLevels =
            Array.isArray(result?.levels)
                ? result.levels
                : [];

        const firstLevelDivisions =
            Array.isArray(result?.items)
                ? result.items
                : [];

        // Crear todos los niveles
        rapidCreateDivisionSelectors();

        // Cargar solamente el primer nivel
        if (rapidDivisionSelectors[0]) {

            rapidDivisionSelectors[0].setOptions(
                appLocation.divisionsToOptions(
                    firstLevelDivisions
                )
            );

            rapidDivisionSelectors[0].enable();
        }

    } catch (error) {

        console.error(
            '❌ Error cargando niveles administrativos:',
            error
        );
    }

}


// ==========================================================================
// LIMPIAR DIVISIONES
// ==========================================================================

function rapidClearDivisionSelectors() {

    const container =
        document.getElementById(
            'rapidDivisions'
        );

    if (!container) {
        return;
    }

    container.innerHTML = '';

    rapidDivisionSelectors = [];
    rapidDivisionLevels = [];
}


// ==========================================================================
// CREAR TODOS LOS SELECTORES DE DIVISIÓN
// ==========================================================================

function rapidCreateDivisionSelectors() {

    const container =
        document.getElementById(
            'rapidDivisions'
        );

    if (!container) {
        return;
    }

    container.innerHTML = '';

    rapidDivisionSelectors = [];

    rapidDivisionLevels.forEach(
        (levelInfo, level) => {

            const field =
                document.createElement('div');

            field.className =
                'rapid-form-field rapid-division-field';

            const label =
                document.createElement('label');

            label.textContent =
                rapidFormatDivisionType(
                    levelInfo.type
                );

            const selectorContainer =
                document.createElement('div');

            selectorContainer.className =
                'rapid-form-selector';

            field.appendChild(label);
            field.appendChild(
                selectorContainer
            );

            container.appendChild(field);

            const selector =
                new AppSelector({
                    container:
                        selectorContainer,
                    placeholder:
                        'Seleccionar...',
                    value: null,
                    options: [],
                    disabled: level > 0,
                    onChange:
                        divisionId =>
                            rapidHandleDivisionChange(
                                divisionId,
                                level
                            )
                });

            rapidDivisionSelectors[level] =
                selector;
        }
    );
}


// ==========================================================================
// CAMBIO DE DIVISIÓN
// ==========================================================================

async function rapidHandleDivisionChange(
    divisionId,
    level
) {

    const numericDivisionId =
        Number(divisionId);

    if (
        !Number.isInteger(
            numericDivisionId
        ) ||
        numericDivisionId <= 0
    ) {

        rapidSelectedDivisionPath =
            rapidSelectedDivisionPath.slice(
                0,
                level
            );

        rapidClearDivisionSelectorsAfter(
            level
        );

        return;
    }

    // Guardar selección actual
    rapidSelectedDivisionPath =
        rapidSelectedDivisionPath.slice(
            0,
            level
        );

    rapidSelectedDivisionPath[level] =
        numericDivisionId;

    // Limpiar niveles posteriores
    rapidClearDivisionSelectorsAfter(level);

    const nextLevel =
        level + 1;

    // Ya estamos en el último nivel
    if (
        nextLevel >=
        rapidDivisionSelectors.length
    ) {
        return;
    }

    try {

        const children =
            await appLocation.getDivisionChildren(
                numericDivisionId
            );

        const nextSelector =
            rapidDivisionSelectors[nextLevel];

        if (!nextSelector) {
            return;
        }

        nextSelector.setOptions(
            appLocation.divisionsToOptions(
                children
            )
        );

        nextSelector.enable();

    } catch (error) {

        console.error(
            '❌ Error cargando subdivisiones:',
            error
        );
    }
}


// ==========================================================================
// LIMPIAR NIVELES POSTERIORES
// ==========================================================================

function rapidClearDivisionSelectorsAfter(level) {

    for (
        let index = level + 1;
        index <
        rapidDivisionSelectors.length;
        index++
    ) {

        const selector =
            rapidDivisionSelectors[index];

        if (!selector) {
            continue;
        }

        selector.setOptions([]);

        selector.setValue(null);

        selector.disable();
    }

    rapidSelectedDivisionPath =
        rapidSelectedDivisionPath.slice(
            0,
            level + 1
        );
}


// ==========================================================================
// ETIQUETA DEL NIVEL ADMINISTRATIVO
// ==========================================================================

function rapidFormatDivisionType(type) {

    const types = {

        STATE: 'Estado',
        REGION: 'Región',
        DEPARTMENT: 'Departamento',
        PROVINCE: 'Provincia',
        COUNTY: 'Condado',
        MUNICIPALITY: 'Municipio',
        DISTRICT: 'Distrito',
        PREFECTURE: 'Prefectura',
        GOVERNORATE: 'Gobernación',
        TERRITORY: 'Territorio',
        OTHER:
            'División administrativa'
    };

    return (
        types[type] ||
        'División administrativa'
    );
}


// ==========================================================================
// OBTENER DATOS
// ==========================================================================

function rapidGetData() {

    return {

        name:
            document
                .getElementById('rapidName')
                ?.value
                .trim() || '',

        document:
            document
                .getElementById('rapidDocument')
                ?.value
                .trim() || '',

        countryId:
            rapidCountrySelector
                ? Number(
                    rapidCountrySelector.getValue()
                )
                : null,

        divisionId:
            rapidSelectedDivisionPath.length > 0
                ? rapidSelectedDivisionPath[
                rapidSelectedDivisionPath.length - 1
                ]
                : null,

        neighborhood:
            document
                .getElementById('rapidZone')
                ?.value
                .trim() || '',

        postalCode:
            document
                .getElementById('rapidPostalCode')
                ?.value
                .trim() || '',

        email:
            document
                .getElementById('rapidEmail')
                ?.value
                .trim() || '',

        phone:
            document
                .getElementById('rapidPhone')
                ?.value
                .trim() || '',

        address:
            document
                .getElementById('rapidAddress')
                ?.value
                .trim() || ''
    };
}


// ==========================================================================
// VALIDAR Y OBTENER DATOS
// ==========================================================================

function rapidValidateAndGetData() {

    const errors = [];

    // ==============================================================
    // TIPO DE COMPROBANTE
    // ==============================================================

    const documentType =
        rapidDocumentType;

    if (
        documentType !== 'BOLETA' &&
        documentType !== 'FACTURA'
    ) {
        errors.push(
            'Debes seleccionar el tipo de comprobante.'
        );
    }


    // ==============================================================
    // DATOS SEGÚN COMPROBANTE
    // ==============================================================

    let firstName = '';
    let lastName = '';
    let businessName = '';
    let identificationTypeId = null;
    let identificationNumber = '';

    if (documentType === 'BOLETA') {

        firstName =
            document
                .getElementById('rapidFirstName')
                ?.value
                .trim() || '';

        lastName =
            document
                .getElementById('rapidLastName')
                ?.value
                .trim() || '';

        identificationTypeId =
            rapidIdentificationTypeSelector
                ? rapidIdentificationTypeSelector.getValue()
                : null;

        identificationNumber =
            document
                .getElementById(
                    'rapidIdentificationNumber'
                )
                ?.value
                .trim() || '';


        if (!firstName) {
            errors.push(
                'Los nombres son obligatorios.'
            );
        }

        if (!lastName) {
            errors.push(
                'Los apellidos son obligatorios.'
            );
        }

        if (
            identificationTypeId === null ||
            identificationTypeId === undefined ||
            String(identificationTypeId).trim() === ''
        ) {
            errors.push(
                'Debes seleccionar el tipo de identificación.'
            );
        }

        if (!identificationNumber) {
            errors.push(
                'El número de identificación es obligatorio.'
            );
        }

    }


    if (documentType === 'FACTURA') {

        businessName =
            document
                .getElementById('rapidBusinessName')
                ?.value
                .trim() || '';

        identificationNumber =
            document
                .getElementById('rapidRuc')
                ?.value
                .trim() || '';


        if (!businessName) {
            errors.push(
                'La razón social es obligatoria.'
            );
        }

        if (!identificationNumber) {
            errors.push(
                'El RUC es obligatorio.'
            );
        }

    }


    // ==============================================================
    // DATOS DE CONTACTO
    // ==============================================================

    const phone =
        document
            .getElementById('rapidPhone')
            ?.value
            .trim() || '';

    const email =
        document
            .getElementById('rapidEmail')
            ?.value
            .trim() || '';


    if (!phone) {
        errors.push(
            'El teléfono es obligatorio.'
        );
    }

    if (!email) {
        errors.push(
            'El correo electrónico es obligatorio.'
        );
    }


    // ==============================================================
    // PAÍS
    // ==============================================================

    const countryId =
        rapidCountrySelector
            ? Number(
                rapidCountrySelector.getValue()
            )
            : null;

    if (
        !Number.isInteger(countryId) ||
        countryId <= 0
    ) {
        errors.push(
            'Debes seleccionar un país.'
        );
    }


    // ==============================================================
    // DIVISIONES ADMINISTRATIVAS
    // ==============================================================

    if (
        !rapidDivisionSelectors.length
    ) {

        errors.push(
            'No se pudo cargar la ubicación administrativa.'
        );

    } else {

        rapidDivisionSelectors.forEach(
            (selector, index) => {

                if (!selector) {
                    return;
                }

                const value =
                    selector.getValue();

                const levelInfo =
                    rapidDivisionLevels[index];

                const label =
                    levelInfo
                        ? rapidFormatDivisionType(
                            levelInfo.type
                        )
                        : 'División administrativa';

                if (
                    value === null ||
                    value === undefined ||
                    String(value).trim() === ''
                ) {

                    errors.push(
                        `Debes seleccionar ${label.toLowerCase()}.`
                    );
                }

            }
        );
    }


    // ==============================================================
    // DATOS DE DIRECCIÓN
    // ==============================================================

    const neighborhood =
        document
            .getElementById('rapidZone')
            ?.value
            .trim() || '';

    const postalCode =
        document
            .getElementById('rapidPostalCode')
            ?.value
            .trim() || '';

    const address =
        document
            .getElementById('rapidAddress')
            ?.value
            .trim() || '';


    if (!address) {
        errors.push(
            'La dirección es obligatoria.'
        );
    }


    // ==============================================================
    // VALIDACIÓN DEL CORREO
    // ==============================================================

    if (email) {

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            errors.push(
                'El correo electrónico no tiene un formato válido.'
            );
        }
    }


    // ==============================================================
    // VALIDACIÓN DE IDENTIFICACIÓN — BOLETA
    // ==============================================================

    if (
        documentType === 'BOLETA' &&
        identificationTypeId &&
        identificationNumber
    ) {

        const identificationTypes =
            Array.isArray(
                rapidSelectedCountry?.identificationTypes
            )
                ? rapidSelectedCountry.identificationTypes
                : [];

        const identificationType =
            identificationTypes.find(
                type =>
                    String(type.id) ===
                    String(identificationTypeId)
            );

        if (!identificationType) {

            errors.push(
                'El tipo de identificación seleccionado no es válido para el país.'
            );

        } else {

            const length =
                identificationNumber.length;


            if (
                identificationType.minLength !== null &&
                identificationType.minLength !== undefined &&
                length <
                Number(
                    identificationType.minLength
                )
            ) {

                errors.push(
                    `El número de identificación debe tener como mínimo ${identificationType.minLength} caracteres.`
                );
            }


            if (
                identificationType.maxLength !== null &&
                identificationType.maxLength !== undefined &&
                length >
                Number(
                    identificationType.maxLength
                )
            ) {

                errors.push(
                    `El número de identificación debe tener como máximo ${identificationType.maxLength} caracteres.`
                );
            }


            if (
                identificationType.validationPattern
            ) {

                try {

                    const regex =
                        new RegExp(
                            identificationType.validationPattern
                        );

                    if (
                        !regex.test(
                            identificationNumber
                        )
                    ) {

                        errors.push(
                            `El número de identificación no tiene un formato válido para ${identificationType.name}.`
                        );
                    }

                } catch (error) {

                    console.error(
                        '❌ Patrón de identificación inválido:',
                        error
                    );

                    errors.push(
                        'No se pudo validar el formato del número de identificación.'
                    );
                }
            }

        }

    }


    // ==============================================================
    // VALIDACIÓN DE RUC — FACTURA
    // ==============================================================

    if (
        documentType === 'FACTURA' &&
        identificationNumber
    ) {

        if (!/^[0-9]{11}$/.test(identificationNumber)) {

            errors.push(
                'El RUC debe tener 11 dígitos.'
            );
        }

    }


    // ==============================================================
    // SI EXISTEN ERRORES
    // ==============================================================

    if (errors.length > 0) {

        return {
            valid: false,
            errors,
            data: null
        };
    }


    // ==============================================================
    // DATOS VÁLIDOS
    // ==============================================================

    return {

        valid: true,

        errors: [],

        data: {

            documentType,

            firstName:
                documentType === 'BOLETA'
                    ? firstName
                    : null,

            lastName:
                documentType === 'BOLETA'
                    ? lastName
                    : null,

            businessName:
                documentType === 'FACTURA'
                    ? businessName
                    : null,

            identificationTypeId:
                documentType === 'BOLETA'
                    ? Number(
                        identificationTypeId
                    )
                    : null,

            identificationNumber,

            countryId,

            divisionId:
                rapidSelectedDivisionPath.length > 0
                    ? rapidSelectedDivisionPath[
                    rapidSelectedDivisionPath.length - 1
                    ]
                    : null,

            neighborhood,

            postalCode,

            email,

            phone,

            address

        }

    };

}


// ==========================================================================
// LIMPIAR FORMULARIO
// ==========================================================================

function rapidReset() {

    const fields = [
        'rapidName',
        'rapidDocument',
        'rapidZone',
        'rapidPostalCode',
        'rapidEmail',
        'rapidPhone',
        'rapidAddress'
    ];

    fields.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.value = '';
        }
    });

    if (rapidCountrySelector) {
        rapidCountrySelector.setValue(null);
    }

    rapidSelectedCountry = null;
    rapidSelectedDivisionPath = [];

    rapidClearDivisionSelectors();
}


// ==========================================================================
// SELECCIONAR PAÍS PREDETERMINADO
// ==========================================================================

async function rapidSelectDefaultCountry() {

    if (!rapidCountrySelector) {
        return;
    }

    const defaultCountry =
        rapidCountries.find(
            country =>
                country.iso2 === 'PE'
        );

    if (!defaultCountry) {
        console.warn(
            '⚠️ No se encontró Perú en la lista de países.'
        );

        return;
    }

    rapidCountrySelector.setValue(
        Number(defaultCountry.id)
    );

    await rapidHandleCountryChange(
        Number(defaultCountry.id)
    );
}

// ==========================================================================
// ABRIR FORMULARIO EN CONTENEDOR
// ==========================================================================

async function rapidOpen(container) {

    if (!container) {
        return;
    }

    const form =
        document.getElementById(
            'rapidAddressForm'
        );

    if (!form) {
        console.warn(
            '⚠️ No se encontró #rapidAddressForm.'
        );

        return;
    }

    // --------------------------------------------------------------
    // INSERTAR FORMULARIO EN EL CONTENEDOR DE CHECKOUT
    // --------------------------------------------------------------

    container.innerHTML = '';

    container.appendChild(form);

    container.hidden = false;

    // --------------------------------------------------------------
    // ASEGURAR INICIALIZACIÓN DE RAPID FORM
    // --------------------------------------------------------------

    if (!rapidFormInitialized) {

        await rapidInit();
    }

    // --------------------------------------------------------------
    // RESTABLECER FORMULARIO
    // --------------------------------------------------------------

    rapidReset();

    // --------------------------------------------------------------
    // SELECCIONAR PERÚ Y CARGAR UBICACIONES
    // --------------------------------------------------------------

    await rapidSelectDefaultCountry();
}


// ==========================================================================
// API PÚBLICA
// ==========================================================================

window.rapidForm = {
    init: rapidInit,
    open: rapidOpen,
    getData: rapidGetData,
    validateAndGetData: rapidValidateAndGetData,
    reset: rapidReset
};