// ==========================================================================
// ENDURE — Account Addresses
// Gestión de direcciones del usuario
// ==========================================================================


let addresses = [];
let editingAddressId = null;
let initialized = false;
let addressTypeSelector = null;
let countrySelector = null;
let divisionSelectors = [];
let identificationTypeSelector = null;
let countries = [];
let selectedCountry = null;
let selectedDivisionPath = [];
let divisionLevels = [];
let addressFormContext = 'ACCOUNT';
let addressFormContainer = null;
let addressFormOriginalParent = null;




// ==========================================================================
// SELECTOR — TIPO DE DIRECCIÓN
// ==========================================================================

function initAddressTypeSelector() {

    const container =
        getElement('addressTypeSelector');

    if (!container) {
        console.warn(
            '⚠️ No existe el contenedor addressTypeSelector.'
        );

        return;
    }

    if (!window.AppSelector) {
        console.error(
            '❌ AppSelector no está disponible.'
        );

        return;
    }

    addressTypeSelector =
        new AppSelector({
            container,
            placeholder: 'Seleccionar tipo...',
            value: 'HOME',
            options: [
                {
                    value: 'HOME',
                    label: 'Casa',
                    icon: 'fa-solid fa-house'
                },
                {
                    value: 'WORK',
                    label: 'Trabajo',
                    icon: 'fa-solid fa-briefcase'
                },
                {
                    value: 'BUSINESS',
                    label: 'Negocio',
                    icon: 'fa-solid fa-building'
                },
                {
                    value: 'OTHER',
                    label: 'Otra',
                    icon: 'fa-solid fa-location-dot'
                }
            ]
        });
}

// ==========================================================================
// SELECTOR — TIPO DE IDENTIFICACIÓN
// ==========================================================================

function initIdentificationTypeSelector() {
    const container =
        getElement('addressIdentificationTypeSelector');

    if (!container) {
        console.warn(
            '⚠️ No existe el contenedor addressIdentificationTypeSelector.'
        );
        return;
    }

    if (!window.AppSelector) {
        console.error(
            '❌ AppSelector no está disponible.'
        );
        return;
    }

    identificationTypeSelector =
        new AppSelector({
            container,
            placeholder: 'Seleccionar...',
            value: null,
            options: [],
            onChange: handleIdentificationTypeChange
        });

    const input =
        getElement('addressIdentificationNumber');

    if (input) {
        input.addEventListener(
            'input',
            handleIdentificationNumberInput
        );
    }

    setIdentificationNumberState();
}


// ==========================================================================
// IDENTIFICACIÓN — CAMBIO DE TIPO
// ==========================================================================

function handleIdentificationTypeChange(typeId) {
    const input = getElement('addressIdentificationNumber');

    if (input) {
        input.value = '';
    }

    setIdentificationNumberState(typeId);
}


// ==========================================================================
// IDENTIFICACIÓN — ESTADO DEL NÚMERO
// ==========================================================================

function setIdentificationNumberState(typeId = null) {
    const input = getElement('addressIdentificationNumber');
    if (!input) return;

    const selectedType =
        typeId ?? identificationTypeSelector?.getValue();

    const hasType =
        selectedType !== null &&
        selectedType !== undefined &&
        String(selectedType).trim() !== '';

    // Eliminar restricciones anteriores
    input.removeAttribute('minlength');
    input.removeAttribute('maxlength');
    input.removeAttribute('pattern');

    if (!hasType) {
        input.readOnly = true;
        input.value = '';
        input.placeholder = 'Selecciona primero el tipo';
        input.inputMode = 'text';
        return;
    }

    input.readOnly = false;
    input.placeholder = 'Número de identificación';

    // Buscar el tipo seleccionado dentro de la metadata del país
    const identificationTypes =
        Array.isArray(selectedCountry?.identificationTypes)
            ? selectedCountry.identificationTypes
            : [];

    const identificationType = identificationTypes.find(
        type => String(type.id) === String(selectedType)
    );

    if (!identificationType) {
        input.inputMode = 'text';
        return;
    }

    // Longitud mínima
    if (
        identificationType.minLength !== null &&
        identificationType.minLength !== undefined
    ) {
        input.minLength = Number(identificationType.minLength);
    }

    // Longitud máxima
    if (
        identificationType.maxLength !== null &&
        identificationType.maxLength !== undefined
    ) {
        input.maxLength = Number(identificationType.maxLength);
    }

    // Patrón de validación
    if (identificationType.validationPattern) {
        input.setAttribute(
            'pattern',
            identificationType.validationPattern
        );
    }

    // Tipo de teclado
    if (
        identificationType.validationPattern &&
        identificationType.validationPattern.includes('[0-9]')
    ) {
        input.inputMode = 'numeric';
    } else {
        input.inputMode = 'text';
    }
}

// ==========================================================================
// FILTRAR CARACTERES MIENTRAS SE ESCRIBE
// ==========================================================================
function handleIdentificationNumberInput(event) {
    const input = event.target;

    const selectedType =
        identificationTypeSelector?.getValue();

    if (
        selectedType === null ||
        selectedType === undefined ||
        String(selectedType).trim() === ''
    ) {
        input.value = '';
        return;
    }

    const identificationTypes =
        Array.isArray(selectedCountry?.identificationTypes)
            ? selectedCountry.identificationTypes
            : [];

    const identificationType = identificationTypes.find(
        type =>
            String(type.id) === String(selectedType)
    );

    if (!identificationType) return;

    const pattern =
        identificationType.validationPattern;

    if (!pattern) return;

    let value = input.value;

    /*
     * Detectar patrones que contienen una clase de
     * caracteres explícita, por ejemplo:
     *
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

    /*
     * Construir los caracteres permitidos a partir
     * de las clases encontradas.
     */
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

    /*
     * Escapar caracteres especiales para construir
     * dinámicamente la expresión regular.
     */
    const allowedRegex =
        new RegExp(`[^${allowedCharacters}]`, 'g');

    value = value.replace(allowedRegex, '');

    /*
     * Normalizar a mayúsculas cuando el patrón
     * utiliza letras mayúsculas.
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
// IDENTIFICACIÓN — ACTUALIZAR TIPOS SEGÚN PAÍS
// ==========================================================================

async function updateIdentificationTypes(country) {

    if (!identificationTypeSelector) {
        return;
    }

    // ----------------------------------------------------------------------
    // Sin país seleccionado
    // ----------------------------------------------------------------------

    if (!country) {
        identificationTypeSelector.setOptions([]);
        identificationTypeSelector.setValue(null);
        identificationTypeSelector.disable();

        const input = getElement('addressIdentificationNumber');
        if (input) {
            input.value = '';
        }

        setIdentificationNumberState(null);

        return;
    }

    try {

        let identificationTypes =
            Array.isArray(country.identificationTypes)
                ? country.identificationTypes
                : [];

        // ------------------------------------------------------------------
        // FALLBACK
        // Si /countries no trae identificationTypes,
        // intentamos obtener el país individual.
        // ------------------------------------------------------------------

        if (
            identificationTypes.length === 0 &&
            window.appLocation &&
            typeof appLocation.getCountry === 'function' &&
            country.iso2
        ) {

            const detailedCountry =
                await appLocation.getCountry(
                    country.iso2
                );

            if (detailedCountry) {

                selectedCountry =
                    detailedCountry;

                identificationTypes =
                    Array.isArray(
                        detailedCountry.identificationTypes
                    )
                        ? detailedCountry.identificationTypes
                        : [];
            }
        }

        // ------------------------------------------------------------------
        // Convertir a opciones del AppSelector
        // ------------------------------------------------------------------

        const options =
            identificationTypes.map(type => ({

                value: type.id,

                label:
                    type.name ||
                    type.code ||
                    'Identificación'

            }));

        identificationTypeSelector.setOptions(options);
        identificationTypeSelector.setValue(null);

        const input = getElement('addressIdentificationNumber');
        if (input) {
            input.value = '';
        }

        setIdentificationNumberState(null);

        if (options.length > 0) {
            identificationTypeSelector.enable();
        } else {
            identificationTypeSelector.disable();
        }

    } catch (error) {

        console.error(
            '❌ Error cargando tipos de identificación:',
            error
        );

        identificationTypeSelector.setOptions([]);
        identificationTypeSelector.setValue(null);
        identificationTypeSelector.disable();

        const input = getElement('addressIdentificationNumber');
        if (input) {
            input.value = '';
        }

        setIdentificationNumberState(null);
    }
}


// ==========================================================================
// SELECTOR — PAÍS
// ==========================================================================

async function initCountrySelector() {

    const container =
        getElement('addressCountrySelector');

    if (!container) {
        console.warn(
            '⚠️ No existe el contenedor addressCountrySelector.'
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

        countries =
            await appLocation.getCountries();

        const options =
            appLocation.countriesToOptions(countries);

        countrySelector =
            new AppSelector({
                container,
                placeholder: 'Seleccionar país...',
                value: null,
                options,
                onChange: handleCountryChange
            });

    } catch (error) {

        console.error(
            '🔴 ERROR REAL EN initCountrySelector():',
            error
        );

        console.error(
            '🔴 countries EN EL CATCH:',
            countries
        );

        showAlert({
            title: 'No se pudieron cargar los países',
            message:
                'Ocurrió un error al cargar la lista de países.',
            type: 'error'
        });
    }
}


// ==========================================================================
// UBICACIÓN — CAMBIO DE PAÍS
// ==========================================================================

async function handleCountryChange(countryId) {

    const numericCountryId =
        Number(countryId);

    if (!Number.isInteger(numericCountryId)) {

        selectedCountry = null;
        selectedDivisionPath = [];

        clearDivisionSelectors();
        updateCountryCode(null);

        await updateIdentificationTypes(null);

        return;
    }

    selectedCountry =
        countries.find(
            country =>
                Number(country.id) === numericCountryId
        ) || null;

    updateCountryCode(selectedCountry);

    selectedDivisionPath = [];

    clearDivisionSelectors();

    if (!selectedCountry) {
        return;
    }

    // ----------------------------------------------------------------------
    // TIPO DE IDENTIFICACIÓN
    // ----------------------------------------------------------------------

    await updateIdentificationTypes(
        selectedCountry
    );

    try {

        const result =
            await appLocation.getCountryDivisions(
                selectedCountry.iso2
            );

        divisionLevels =
            Array.isArray(result?.levels)
                ? result.levels
                : [];

        const firstLevelDivisions =
            Array.isArray(result?.items)
                ? result.items
                : [];

        // Crear todos los niveles inmediatamente
        createDivisionSelectors();

        // Cargar solamente el primer nivel
        if (divisionSelectors[0]) {

            divisionSelectors[0].setOptions(
                appLocation.divisionsToOptions(
                    firstLevelDivisions
                )
            );

            divisionSelectors[0].enable();
        }

    } catch (error) {

        console.error(
            '❌ Error cargando niveles administrativos:',
            error
        );

        showAlert({
            title: 'No se pudo cargar la ubicación',
            message:
                'Ocurrió un error al cargar las divisiones administrativas.',
            type: 'error'
        });
    }
}


// ==========================================================================
// CÓDIGO ISO2 DEL PAÍS
// ==========================================================================

function updateCountryCode(country) {

    const countryCodeElement = getElement('addressPhoneCountryCode');

    if (!countryCodeElement) return;

    if (!country) {
        countryCodeElement.textContent = '';
        return;
    }

    const phoneCode = country.phoneCodes?.[0]?.callingCode || '';

    countryCodeElement.textContent = phoneCode;
}


// ==========================================================================
// LIMPIAR DIVISIONES
// ==========================================================================

function clearDivisionSelectors() {

    const container =
        getElement('addressDivisions');

    if (!container) {
        return;
    }

    container.innerHTML = '';

    divisionSelectors = [];
    divisionLevels = [];
}


// ==========================================================================
// CREAR TODOS LOS SELECTORES DE DIVISIÓN
// ==========================================================================

function createDivisionSelectors() {

    const container =
        getElement('addressDivisions');

    if (!container) {
        return;
    }

    container.innerHTML = '';
    divisionSelectors = [];

    divisionLevels.forEach((levelInfo, level) => {

        const field =
            document.createElement('div');

        field.className =
            'address-form-field address-division-field';

        const label =
            document.createElement('label');

        label.textContent =
            formatDivisionType(levelInfo.type);

        const required =
            document.createElement('span');

        required.textContent = ' *';

        label.appendChild(required);

        const selectorContainer =
            document.createElement('div');

        selectorContainer.className =
            'address-division-selector';

        field.appendChild(label);
        field.appendChild(selectorContainer);

        container.appendChild(field);

        const selector =
            new AppSelector({
                container: selectorContainer,
                placeholder: 'Seleccionar...',
                value: null,
                options: [],
                disabled: level > 0,
                onChange: (divisionId) =>
                    handleDivisionChange(
                        divisionId,
                        level
                    )
            });

        divisionSelectors[level] =
            selector;
    });
}


// ==========================================================================
// CAMBIO DE DIVISIÓN
// ==========================================================================

async function handleDivisionChange(
    divisionId,
    level
) {

    const numericDivisionId =
        Number(divisionId);

    if (
        !Number.isInteger(numericDivisionId) ||
        numericDivisionId <= 0
    ) {
        selectedDivisionPath =
            selectedDivisionPath.slice(
                0,
                level
            );

        clearDivisionSelectorsAfter(level);

        return;
    }

    // Guardar selección actual
    selectedDivisionPath =
        selectedDivisionPath.slice(
            0,
            level
        );

    selectedDivisionPath[level] =
        numericDivisionId;

    // Limpiar niveles posteriores,
    // pero mantenerlos visibles.
    clearDivisionSelectorsAfter(level);

    const nextLevel =
        level + 1;

    // Si este era el último nivel,
    // no hay nada más que cargar.
    if (
        nextLevel >= divisionSelectors.length
    ) {
        return;
    }

    try {

        const children =
            await appLocation.getDivisionChildren(
                numericDivisionId
            );

        const nextSelector =
            divisionSelectors[nextLevel];

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

function clearDivisionSelectorsAfter(level) {

    for (
        let index = level + 1;
        index < divisionSelectors.length;
        index++
    ) {

        const selector =
            divisionSelectors[index];

        if (!selector) {
            continue;
        }

        selector.setOptions([]);

        selector.setValue(null);

        selector.disable();
    }

    selectedDivisionPath =
        selectedDivisionPath.slice(
            0,
            level + 1
        );
}


// ==========================================================================
// ETIQUETA DEL NIVEL ADMINISTRATIVO
// ==========================================================================

function formatDivisionType(type) {

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
        OTHER: 'División administrativa'
    };

    return types[type] || 'División administrativa';
}


// ==========================================================================
// HELPERS
// ==========================================================================

function getElement(id) {
    return document.getElementById(id);
}

function showAlert({
    title = 'Aviso',
    message = '',
    type = 'info'
} = {}) {

    if (
        window.alertModal &&
        typeof window.alertModal.show === 'function'
    ) {
        window.alertModal.show({
            title,
            message,
            type
        });

        return;
    }

    console[type === 'error' ? 'error' : 'log'](message);
}

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return '';
    }

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function normalizeOptionalValue(value) {

    if (value === null || value === undefined) {
        return null;
    }

    const trimmed = String(value).trim();

    return trimmed === '' ? null : trimmed;
}

function formatAddressType(type) {

    const types = {
        HOME: 'Casa',
        WORK: 'Trabajo',
        BUSINESS: 'Negocio',
        OTHER: 'Otra'
    };

    return types[type] || type || 'Dirección';
}

function formatDate(date) {

    if (!date) {
        return '';
    }

    const dateObj = new Date(date);

    if (Number.isNaN(dateObj.getTime())) {
        return '';
    }

    return dateObj.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}


// ==========================================================================
// ESTADOS DE LA INTERFAZ
// ==========================================================================

function setLoadingState(isLoading) {

    const loading = getElement('addressesLoading');
    const list = getElement('addressesList');

    if (loading) {
        loading.hidden = !isLoading;
    }

    if (list && isLoading) {
        list.hidden = true;
    }

    if (list && !isLoading) {
        list.hidden = false;
    }
}

function updateEmptyState() {

    const empty = getElement('addressesEmpty');
    const list = getElement('addressesList');

    if (!empty || !list) {
        return;
    }

    const hasAddresses = addresses.length > 0;

    empty.hidden = hasAddresses;
    list.hidden = !hasAddresses;

    const addAddressTopBtn = getElement('addAddressBtn');

    if (addAddressTopBtn) {
        addAddressTopBtn.hidden = !hasAddresses;
    }
}

// ==========================================================================
// CARGAR DIRECCIONES
// ==========================================================================

async function loadAddresses() {

    if (
        !window.accountAddressesApi ||
        typeof accountAddressesApi.listAddresses !== 'function'
    ) {
        console.error(
            '❌ accountAddressesApi no está disponible.'
        );
        return;
    }

    setLoadingState(true);

    try {

        addresses =
            await accountAddressesApi.listAddresses();

        if (!Array.isArray(addresses)) {
            addresses = [];
        }

        await renderAddresses();

    } catch (error) {

        console.error(
            '❌ Error cargando direcciones:',
            error
        );

        addresses = [];

        await renderAddresses();

        showAlert({
            title: 'No se pudieron cargar las direcciones',
            message:
                error.message ||
                'Ocurrió un error al obtener tus direcciones.',
            type: 'error'
        });

    } finally {

        setLoadingState(false);

    }
}


// ==========================================================================
// RENDERIZAR DIRECCIONES
// ==========================================================================

async function renderAddresses() {

    const list = getElement('addressesList');

    if (!list) {
        return;
    }

    list.innerHTML = '';

    const cards = await Promise.all(
        addresses.map(address =>
            createAddressCard(address)
        )
    );

    list.innerHTML = cards.join('');

    updateEmptyState();
}


async function getDivisionHierarchy(divisionId) {

    const hierarchy = [];

    let currentId = Number(divisionId);

    if (!Number.isInteger(currentId) || currentId <= 0) {
        return hierarchy;
    }

    while (currentId) {

        const division =
            await appLocation.getDivision(currentId);

        if (!division) {
            break;
        }

        hierarchy.push(division);

        // La API puede devolver parent como relación.
        // Usamos su ID para continuar subiendo.
        if (!division.parent?.id) {
            break;
        }

        currentId = Number(division.parent.id);
    }

    return hierarchy;
}


// ==========================================================================
// TARJETA DE DIRECCIÓN
// ==========================================================================
async function createAddressCard(address) {

    const id = Number(address.id);

    const alias =
        escapeHtml(address.alias || 'Dirección');

    const type =
        escapeHtml(formatAddressType(address.addressType));

    const typeIcon =
        getAddressTypeIcon(address.addressType);

    const recipientName =
        [
            address.firstName,
            address.lastName
        ]
            .filter(Boolean)
            .map(escapeHtml)
            .join(' ');

    const identificationType =
        escapeHtml(
            address.identificationType?.name ||
            address.identificationType?.code ||
            ''
        );

    const identificationNumber =
        escapeHtml(
            address.identificationNumber || ''
        );

    const companyName =
        escapeHtml(
            address.companyName || ''
        );

    const phone =
        escapeHtml(address.phone || '');

    const email =
        escapeHtml(address.email || '');

    // ----------------------------------------------------------------------
    // UBICACIÓN
    // ----------------------------------------------------------------------

    // La API devuelve las relaciones `country` y `division`.
    const country =
        escapeHtml(address.country?.name || '');

    const neighborhood =
        escapeHtml(address.neighborhood || '');

    const postalCode =
        escapeHtml(address.postalCode || '');

    const divisionHierarchy =
        await getDivisionHierarchy(address.division?.id);

    // ----------------------------------------------------------------------
    // DIRECCIÓN
    // ----------------------------------------------------------------------

    const street =
        escapeHtml(address.address || '');

    const addressNumber =
        escapeHtml(address.addressNumber || '');

    const building =
        escapeHtml(address.building || '');

    const floor =
        escapeHtml(address.floor || '');

    const unit =
        escapeHtml(address.unit || '');

    const reference =
        escapeHtml(address.reference || '');

    const deliveryInstructions =
        escapeHtml(address.deliveryInstructions || '');

    const isDefault =
        Boolean(address.isDefault);

    // ----------------------------------------------------------------------
    // CONSTRUIR PARTES DE LA DIRECCIÓN
    // ----------------------------------------------------------------------

    const locationParts = [
        street,
        addressNumber
    ].filter(Boolean);

    const secondaryLocationParts = [
        unit ? `Dpto. ${unit}` : '',
        floor ? `Piso ${floor}` : '',
        building
    ].filter(Boolean);

    const geographicParts = [
        neighborhood,
        postalCode,
        ...divisionHierarchy.map(
            division => formatDivisionName(division.name)
        )
    ].filter(Boolean);

    // ----------------------------------------------------------------------
    // HTML
    // ----------------------------------------------------------------------

    return `
        <article
            class="address-card ${isDefault ? 'is-default' : ''}"
            data-address-id="${id}"
        >

            <div class="address-card-header">

                <div class="address-card-title">

                    <div class="address-card-icon">
                        <i class="fa-solid ${typeIcon}"></i>
                    </div>

                    <div>

                        <div class="address-card-name-row">

                            <h3>
                                ${alias}
                            </h3>

                            <span class="address-type-badge">
                                ${type}
                            </span>

                            ${isDefault
            ? `
                                    <span class="address-default-badge">
                                        <i class="fa-solid fa-check"></i>
                                        Predeterminada
                                    </span>
                                `
            : ''
        }

                        </div>

                        <p>
                            ${recipientName || 'Sin destinatario'}
                        </p>

                        ${identificationType && identificationNumber
            ? `
                            <p class="address-card-identification">
                                ${identificationType}: ${identificationNumber}
                            </p>
                        `
            : ''
        }

                        ${companyName
            ? `
                            <p class="address-card-company">
                                Empresa / Razón Social: ${companyName}
                            </p>
                        `
            : ''
        }

                    </div>

                </div>

                <div class="address-card-actions">

                    <button
                        type="button"
                        class="address-action-btn address-edit-btn"
                        data-action="edit"
                        data-address-id="${id}"
                        title="Editar dirección"
                        aria-label="Editar dirección"
                    >
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button
                        type="button"
                        class="address-action-btn address-delete-btn"
                        data-action="delete"
                        data-address-id="${id}"
                        title="Eliminar dirección"
                        aria-label="Eliminar dirección"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </div>

            </div>

            <div class="address-card-body">

                ${locationParts.length
            ? `
                        <div class="address-card-line">
                            <i class="fa-solid fa-house"></i>

                            <span>
                                ${locationParts.join(' ')}
                            </span>
                        </div>
                    `
            : ''
        }

                ${secondaryLocationParts.length
            ? `
                        <div class="address-card-line">
                            <i class="fa-solid fa-building"></i>

                            <span>
                                ${secondaryLocationParts.join(' · ')}
                            </span>
                        </div>
                    `
            : ''
        }

                ${geographicParts.length || postalCode
            ? `
        <div class="address-card-line">

            <i class="fa-solid fa-map"></i>

            <span>
                ${geographicParts.join(', ')}
            </span>

        </div>
    `
            : ''
        }

                ${phone
            ? `
                        <div class="address-card-line">
                            <i class="fa-solid fa-phone"></i>

                            <span>
                                ${phone}
                            </span>
                        </div>
                    `
            : ''
        }

                ${email
            ? `
                        <div class="address-card-line">
                            <i class="fa-solid fa-envelope"></i>

                            <span>
                                ${email}
                            </span>
                        </div>
                    `
            : ''
        }

                ${reference
            ? `
                        <div class="address-card-reference">
                            <strong>
                                Referencia:
                            </strong>

                            <span>
                                ${reference}
                            </span>
                        </div>
                    `
            : ''
        }

            </div>

            ${deliveryInstructions
            ? `
                    <div class="address-card-delivery">

                        <i class="fa-solid fa-truck"></i>

                        <div>

                            <strong>
                                Instrucciones de entrega
                            </strong>

                            <p>
                                ${deliveryInstructions}
                            </p>

                        </div>

                    </div>
                `
            : ''
        }

            ${!isDefault
            ? `
                    <div class="address-card-footer">

                        <button
                            type="button"
                            class="address-default-btn"
                            data-action="default"
                            data-address-id="${id}"
                        >
                            <i class="fa-regular fa-star"></i>
                            Establecer como predeterminada
                        </button>

                    </div>
                `
            : ''
        }

        </article>
    `;
}


function getAddressTypeIcon(type) {

    const icons = {
        HOME: 'fa-house',
        WORK: 'fa-briefcase',
        BUSINESS: 'fa-building',
        OTHER: 'fa-location-dot'
    };

    return icons[type] || 'fa-location-dot';
}


// ==========================================================================
// ABRIR MODAL
// ==========================================================================

async function openAddressModal(address = null) {

    const modal = getElement('addressModal');
    const title = getElement('addressModalTitle');
    const subtitle = getElement('addressModalSubtitle');

    if (!modal) {
        return;
    }

    if (title) {
        title.textContent =
            address
                ? 'Editar dirección'
                : 'Agregar dirección';
    }

    if (subtitle) {
        subtitle.textContent =
            address
                ? 'Actualiza los datos de tu dirección.'
                : 'Completa los datos de tu dirección.';
    }

    await prepareAddressForm(address);

    modal.hidden = false;

    requestAnimationFrame(() => {
        modal.classList.add('open');
    });

    document.body.classList.add('address-modal-open');

    await addressMapService.initializeAddressMap();

    const aliasInput = getElement('addressAlias');

    if (aliasInput) {
        setTimeout(() => {
            aliasInput.focus();
        }, 50);
    }
}


// ==========================================================================
// CERRAR FORMULARIO DE DIRECCIÓN DESDE CHECKOUT
// ==========================================================================

function closeAddressFormFromCheckout() {

    if (
        !addressFormContainer ||
        !addressFormOriginalParent
    ) {
        return;
    }


    // ----------------------------------------------------------------------
    // DEVOLVER FORMULARIO A SU MODAL ORIGINAL
    // ----------------------------------------------------------------------

    addressFormContainer.classList.remove(
        'address-form-checkout'
    );

    addressFormOriginalParent.appendChild(
        addressFormContainer
    );


    // ----------------------------------------------------------------------
    // OCULTAR CONTENEDOR DE CHECKOUT
    // ----------------------------------------------------------------------

    const deliveryNewAddress =
        getElement(
            'checkoutDeliveryNewAddress'
        );

    const pickupNewAddress =
        getElement(
            'checkoutPickupNewAddressForm'
        );

    if (deliveryNewAddress) {
        deliveryNewAddress.hidden = true;
    }

    if (pickupNewAddress) {
        pickupNewAddress.hidden = true;
    }


    // ----------------------------------------------------------------------
    // MOSTRAR NUEVAMENTE SELECTOR Y BOTÓN DE DELIVERY
    // ----------------------------------------------------------------------

    const shippingSelector =
        getElement(
            'checkoutShippingAddressSelector'
        );

    const addShippingButton =
        getElement(
            'checkoutAddShippingAddress'
        );

    if (shippingSelector) {
        shippingSelector.hidden = false;
    }

    if (addShippingButton) {
        addShippingButton.hidden = false;
    }

    const shippingAddressHeader =
        document.querySelector(
            '#checkoutDeliveryAddress > .checkout-purchase-section-header'
        );

    if (shippingAddressHeader) {
        shippingAddressHeader.hidden = false;
    }

    const checkoutAddressHeader =
        document.querySelector(
            '.checkout-address-section > .checkout-purchase-section-header'
        );

    if (checkoutAddressHeader) {
        checkoutAddressHeader.style.marginBottom = '';
    }

    // ----------------------------------------------------------------------
    // RESTABLECER CONTEXTO
    // ----------------------------------------------------------------------

    addressFormContext =
        'ACCOUNT';

    editingAddressId =
        null;
}

// ==========================================================================
// CERRAR MODAL
// ==========================================================================

function closeAddressModal() {

    if (addressFormContext === 'CHECKOUT') {
        closeAddressFormFromCheckout();
        return;
    }

    const modal =
        getElement('addressModal');

    if (!modal) {
        return;
    }

    modal.classList.remove('open');

    document.body.classList.remove(
        'address-modal-open'
    );

    setTimeout(() => {
        modal.hidden = true;
    }, 200);

    editingAddressId = null;
}

function setAddressFieldValue(id, value) {

    const element = getElement(id);

    if (!element || value === undefined || value === null) {
        return;
    }

    element.value = String(value).trim();
}


// ==========================================================================
// RESET FORMULARIO
// ==========================================================================

async function resetAddressForm() {

    const form = getElement('addressForm');

    if (!form) {
        return;
    }

    form.reset();

    if (addressTypeSelector) {
        addressTypeSelector.setValue('HOME');
    }

    if (identificationTypeSelector) {
        identificationTypeSelector.setOptions([]);
        identificationTypeSelector.setValue(null);
        identificationTypeSelector.disable();
    }

    setIdentificationNumberState(null);

    // ----------------------------------------------------------------------
    // UBICACIÓN
    // ----------------------------------------------------------------------

    selectedCountry = null;
    selectedDivisionPath = [];

    clearDivisionSelectors();

    if (countrySelector) {
        countrySelector.setValue(null);
    }

    updateCountryCode(null);


    addressMapService.resetAddressMap();

    // ----------------------------------------------------------------------
    // ESTADO DE GUARDADO
    // ----------------------------------------------------------------------

    const saveText =
        getElement('addressSaveText');

    const saveLoader =
        getElement('addressSaveLoader');

    if (saveText) {
        saveText.hidden = false;
    }

    if (saveLoader) {
        saveLoader.hidden = true;
    }

    setAddressFormSaving(false);
}

async function getInitialAddressMapPosition() {

    // ==============================================================
    // 1. SI YA EXISTEN COORDENADAS GUARDADAS
    // ==============================================================

    const savedCoordinates =
        getAddressMapCoordinates();

    if (savedCoordinates) {

        return {
            position: savedCoordinates,
            zoom: 17,
            source: 'saved'
        };
    }

    // ==============================================================
    // 2. INTENTAR UBICACIÓN DEL DISPOSITIVO
    // ==============================================================

    if (
        'geolocation' in navigator
    ) {

        try {

            const position =
                await new Promise(
                    (resolve, reject) => {

                        navigator.geolocation.getCurrentPosition(
                            resolve,
                            reject,
                            {
                                enableHighAccuracy: true,

                                timeout: 10000,

                                maximumAge: 300000
                            }
                        );

                    }
                );

            return {
                position: {
                    lat:
                        position.coords.latitude,

                    lng:
                        position.coords.longitude
                },

                zoom: 17,

                source: 'device'
            };

        } catch (error) {

            console.warn(
                '⚠️ No se pudo obtener la ubicación del dispositivo:',
                error
            );
        }
    }

    // ==============================================================
    // 3. FALLBACK — LIMA
    // ==============================================================

    return {
        position: {
            lat: -12.0464,
            lng: -77.0428
        },

        zoom: 13,

        source: 'fallback'
    };
}

// ==========================================================================
// SELECCIONAR PAÍS
// ==========================================================================

async function selectCountry(countryId) {

    const numericCountryId =
        Number(countryId);

    if (!Number.isInteger(numericCountryId)) {
        return false;
    }

    const country =
        countries.find(
            item =>
                Number(item.id) === numericCountryId
        );

    if (!country) {
        return false;
    }

    selectedCountry = country;

    selectedDivisionPath = [];

    clearDivisionSelectors();

    if (countrySelector) {
        countrySelector.setValue(
            String(country.id)
        );
    }

    updateCountryCode(country);

    await handleCountryChange(country.id);

    return true;
}


// ==========================================================================
// SELECCIONAR PAÍS PREDETERMINADO
// ==========================================================================

async function selectDefaultCountry() {

    const peru =
        countries.find(
            country =>
                String(country.iso2).toUpperCase() === 'PE'
        );

    if (!peru) {

        console.warn(
            '⚠️ No se encontró Perú en la lista de países.'
        );

        return false;
    }

    return await selectCountry(peru.id);
}


// ==========================================================================
// RELLENAR FORMULARIO
// ==========================================================================

async function populateAddressForm(address) {

    const fieldMap = {
        addressAlias: address.alias,
        addressFirstName: address.firstName,
        addressLastName: address.lastName,
        addressCompanyName: address.companyName,
        addressPhone: address.phone,
        addressPhoneSecondary: address.phoneSecondary,
        addressEmail: address.email,
        addressNeighborhood: address.neighborhood,
        addressPostalCode: address.postalCode,
        addressStreet: address.address,
        addressNumber: address.addressNumber,
        addressBuilding: address.building,
        addressFloor: address.floor,
        addressUnit: address.unit,
        addressEntrance: address.entrance,
        addressReference: address.reference,
        addressDeliveryInstructions: address.deliveryInstructions,
        addressAccessInstructions: address.accessInstructions,
        addressLatitude: address.latitude,
        addressLongitude: address.longitude
    };

    Object.entries(fieldMap).forEach(([id, value]) => {
        const element = getElement(id);

        if (!element) {
            return;
        }

        element.value =
            value === null || value === undefined
                ? ''
                : value;
    });

    // ----------------------------------------------------------------------
    // TIPO DE DIRECCIÓN
    // ----------------------------------------------------------------------

    if (addressTypeSelector) {
        addressTypeSelector.setValue(
            address.addressType || 'HOME'
        );
    }

    // ----------------------------------------------------------------------
    // UBICACIÓN
    // ----------------------------------------------------------------------

    await selectCountry(address.countryId);

    // ----------------------------------------------------------------------
    // TIPO DE IDENTIFICACIÓN
    // ----------------------------------------------------------------------

    if (
        identificationTypeSelector &&
        address.identificationTypeId
    ) {
        identificationTypeSelector.setValue(
            String(address.identificationTypeId)
        );

        setIdentificationNumberState(
            address.identificationTypeId
        );

        // Restaurar el número DESPUÉS de seleccionar el tipo
        const identificationInput =
            getElement('addressIdentificationNumber');

        if (identificationInput) {
            identificationInput.value =
                address.identificationNumber || '';
        }
    }

    // ----------------------------------------------------------------------
    // CONTACTO SIN CONTACTO
    // ----------------------------------------------------------------------

    const contactless =
        getElement('addressContactlessDelivery');

    if (contactless) {
        contactless.checked =
            Boolean(address.contactlessDelivery);
    }

    // ----------------------------------------------------------------------
    // DIRECCIÓN PREDETERMINADA
    // ----------------------------------------------------------------------

    const isDefault =
        getElement('addressIsDefault');

    if (isDefault) {
        isDefault.checked =
            Boolean(address.isDefault);
    }

    console.log(
        '📍 Dirección cargada para editar:',
        address
    );

    console.log(
        '📍 countryId:',
        address.countryId
    );

    console.log(
        '📍 divisionId:',
        address.divisionId
    );

    // ----------------------------------------------------------------------
    // RESTAURAR DIVISIÓN ADMINISTRATIVA
    // ----------------------------------------------------------------------

    if (address.divisionId) {
        await restoreDivisionPath(
            address.divisionId
        );
    }
}


// ==========================================================================
// RESTAURAR JERARQUÍA DE DIVISIONES
// ==========================================================================

async function restoreDivisionPath(divisionId) {

    const numericDivisionId =
        Number(divisionId);

    if (
        !Number.isInteger(numericDivisionId) ||
        numericDivisionId <= 0
    ) {
        return;
    }

    if (!selectedCountry) {
        return;
    }

    try {

        // ==============================================================
        // 1. Obtener la división guardada
        // ==============================================================

        const division =
            await appLocation.getDivision(
                numericDivisionId
            );

        console.log('📍 División final obtenida:', division);

        if (!division) {
            return;
        }


        // ==============================================================
        // 2. Reconstruir la ruta completa
        // ==============================================================

        const path = [];

        let current = division;

        while (current) {

            path.unshift(current);

            // La API devuelve la relación como:
            // current.parent.id
            // y no necesariamente como current.parentId.

            if (!current.parent?.id) {
                break;
            }

            current =
                await appLocation.getDivision(
                    current.parent.id
                );
        }

        console.log('📍 Ruta administrativa reconstruida:', path);

        if (path.length === 0) {
            return;
        }


        // ==============================================================
        // 3. Guardar la ruta seleccionada
        // ==============================================================

        selectedDivisionPath =
            path.map(
                item => Number(item.id)
            );


        // ==============================================================
        // 4. Obtener nuevamente la estructura de niveles
        // ==============================================================

        const result =
            await appLocation.getCountryDivisions(
                selectedCountry.iso2
            );

        divisionLevels =
            Array.isArray(result?.levels)
                ? result.levels
                : [];


        const firstLevelDivisions =
            Array.isArray(result?.items)
                ? result.items
                : [];


        // ==============================================================
        // 5. Crear todos los selectores
        // ==============================================================

        createDivisionSelectors();


        if (divisionSelectors.length === 0) {
            return;
        }


        // ==============================================================
        // 6. Restaurar cada nivel
        // ==============================================================

        for (
            let level = 0;
            level < path.length;
            level++
        ) {

            const selector =
                divisionSelectors[level];

            if (!selector) {
                continue;
            }


            let divisions = [];


            // ----------------------------------------------------------
            // Primer nivel
            // ----------------------------------------------------------

            if (level === 0) {

                divisions =
                    firstLevelDivisions;

            }


            // ----------------------------------------------------------
            // Niveles posteriores
            // ----------------------------------------------------------

            else {

                const parentId =
                    Number(path[level - 1].id);

                divisions =
                    await appLocation.getDivisionChildren(
                        parentId
                    );
            }


            // ----------------------------------------------------------
            // CARGAR OPCIONES ANTES DE SELECCIONAR
            // ----------------------------------------------------------

            selector.setOptions(
                appLocation.divisionsToOptions(
                    divisions
                )
            );


            // ----------------------------------------------------------
            // SELECCIONAR VALOR GUARDADO
            // ----------------------------------------------------------

            console.log(
                `📍 Nivel ${level}:`,
                {
                    selector,
                    opciones: divisions,
                    valorASeleccionar: path[level].id
                }
            );

            selector.setValue(
                String(path[level].id)
            );


            // ----------------------------------------------------------
            // HABILITAR
            // ----------------------------------------------------------

            selector.enable();
        }


        // ==============================================================
        // 7. Los niveles posteriores quedan visibles pero vacíos
        // ==============================================================

        for (
            let level = path.length;
            level < divisionSelectors.length;
            level++
        ) {

            const selector =
                divisionSelectors[level];

            if (!selector) {
                continue;
            }

            selector.setOptions([]);
            selector.setValue(null);
            selector.disable();
        }

    } catch (error) {

        console.error(
            '❌ Error restaurando la jerarquía administrativa:',
            error
        );
    }
}


// ==========================================================================
// OBTENER DATOS DEL FORMULARIO
// ==========================================================================

function getAddressFormData() {

    const getValue = id => {
        const element = getElement(id);
        return element ? element.value.trim() : '';
    };

    const getCheckbox = id => {
        const element = getElement(id);
        return element ? element.checked : false;
    };

    return {

        alias:
            getValue('addressAlias'),

        addressType:
            addressTypeSelector
                ? addressTypeSelector.getValue()
                : 'HOME',

        firstName:
            getValue('addressFirstName'),

        lastName:
            getValue('addressLastName'),

        identificationTypeId:
            identificationTypeSelector?.getValue()
                ? Number(
                    identificationTypeSelector.getValue()
                )
                : null,

        identificationNumber:
            normalizeOptionalValue(
                getValue('addressIdentificationNumber')
            ),

        companyName:
            normalizeOptionalValue(
                getValue('addressCompanyName')
            ),

        phone:
            getValue('addressPhone'),

        phoneSecondary:
            normalizeOptionalValue(
                getValue('addressPhoneSecondary')
            ),

        email:
            normalizeOptionalValue(
                getValue('addressEmail')
            ),

        // ------------------------------------------------------------------
        // UBICACIÓN
        // ------------------------------------------------------------------

        countryId:
            countrySelector?.getValue()
                ? Number(countrySelector.getValue())
                : null,

        divisionId:
            selectedDivisionPath.length > 0
                ? selectedDivisionPath[
                selectedDivisionPath.length - 1
                ]
                : null,

        neighborhood:
            normalizeOptionalValue(
                getValue('addressNeighborhood')
            ),

        postalCode:
            normalizeOptionalValue(
                getValue('addressPostalCode')
            ),

        // ------------------------------------------------------------------
        // DIRECCIÓN
        // ------------------------------------------------------------------

        address:
            getValue('addressStreet'),

        addressNumber:
            normalizeOptionalValue(
                getValue('addressNumber')
            ),

        building:
            normalizeOptionalValue(
                getValue('addressBuilding')
            ),

        floor:
            normalizeOptionalValue(
                getValue('addressFloor')
            ),

        unit:
            normalizeOptionalValue(
                getValue('addressUnit')
            ),

        entrance:
            normalizeOptionalValue(
                getValue('addressEntrance')
            ),

        reference:
            normalizeOptionalValue(
                getValue('addressReference')
            ),

        deliveryInstructions:
            normalizeOptionalValue(
                getValue('addressDeliveryInstructions')
            ),

        accessInstructions:
            normalizeOptionalValue(
                getValue('addressAccessInstructions')
            ),

        contactlessDelivery:
            getCheckbox('addressContactlessDelivery'),

        latitude:
            normalizeCoordinateInput(
                getValue('addressLatitude')
            ),

        longitude:
            normalizeCoordinateInput(
                getValue('addressLongitude')
            ),

        isDefault:
            getCheckbox('addressIsDefault')
    };
}


// ==========================================================================
// NORMALIZAR COORDENADAS
// ==========================================================================

function normalizeCoordinateInput(value) {

    if (value === '') {
        return null;
    }

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : null;
}


function validateAddressForm(data) {

    if (!data.alias) {
        return 'El alias de la dirección es obligatorio.';
    }

    if (!data.firstName) {
        return 'Los nombres del destinatario son obligatorios.';
    }

    if (!data.lastName) {
        return 'Los apellidos del destinatario son obligatorios.';
    }

    if (!data.identificationTypeId) {
        return 'Debes seleccionar el tipo de identificación.';
    }

    if (!data.identificationNumber) {
        return 'El número de identificación es obligatorio.';
    }

    // ----------------------------------------------------------------------
    // VALIDACIÓN DE IDENTIFICACIÓN
    // ----------------------------------------------------------------------

    const identificationTypes =
        Array.isArray(selectedCountry?.identificationTypes)
            ? selectedCountry.identificationTypes
            : [];

    const identificationType =
        identificationTypes.find(
            type =>
                String(type.id) ===
                String(data.identificationTypeId)
        );

    if (!identificationType) {
        return 'El tipo de identificación seleccionado no es válido.';
    }

    const identificationNumber =
        data.identificationNumber.trim();

    // ----------------------------------------------------------------------
    // LONGITUD MÍNIMA
    // ----------------------------------------------------------------------

    if (
        identificationType.minLength !== null &&
        identificationType.minLength !== undefined &&
        identificationNumber.length <
        Number(identificationType.minLength)
    ) {
        return `El número de identificación debe tener como mínimo ${identificationType.minLength} caracteres.`;
    }

    // ----------------------------------------------------------------------
    // LONGITUD MÁXIMA
    // ----------------------------------------------------------------------

    if (
        identificationType.maxLength !== null &&
        identificationType.maxLength !== undefined &&
        identificationNumber.length >
        Number(identificationType.maxLength)
    ) {
        return `El número de identificación debe tener como máximo ${identificationType.maxLength} caracteres.`;
    }

    // ----------------------------------------------------------------------
    // FORMATO
    // ----------------------------------------------------------------------

    if (identificationType.validationPattern) {
        let regex;

        try {
            regex = new RegExp(
                identificationType.validationPattern
            );
        } catch (error) {
            console.error(
                '❌ Patrón de identificación inválido:',
                error
            );

            return 'No se pudo validar el formato de identificación.';
        }

        if (!regex.test(identificationNumber)) {
            return `El número de identificación no tiene un formato válido para ${identificationType.name}.`;
        }
    }

    // ----------------------------------------------------------------------
    // TELÉFONO
    // ----------------------------------------------------------------------

    if (!data.phone) {
        return 'El teléfono es obligatorio.';
    }

    // ----------------------------------------------------------------------
    // PAÍS
    // ----------------------------------------------------------------------

    if (!data.countryId) {
        return 'El país es obligatorio.';
    }

    // ----------------------------------------------------------------------
    // DIVISIONES ADMINISTRATIVAS
    // ----------------------------------------------------------------------

    if (
        divisionSelectors.length > 0 &&
        divisionSelectors.some(
            selector => !selector?.getValue()
        )
    ) {
        return 'Debes seleccionar todos los niveles administrativos.';
    }

    // ----------------------------------------------------------------------
    // DIRECCIÓN
    // ----------------------------------------------------------------------

    if (!data.address) {
        return 'La dirección es obligatoria.';
    }

    // Culqi exige que la dirección tenga entre 6 y 99 caracteres.
    if (data.address.length < 6) {
        return 'La dirección debe tener al menos 6 caracteres.';
    }

    if (data.address.length >= 100) {
        return 'La dirección debe tener menos de 100 caracteres.';
    }

    // ----------------------------------------------------------------------
    // LATITUD
    // ----------------------------------------------------------------------

    if (
        data.latitude !== null &&
        (
            data.latitude < -90 ||
            data.latitude > 90
        )
    ) {
        return 'La latitud no es válida.';
    }

    // ----------------------------------------------------------------------
    // LONGITUD
    // ----------------------------------------------------------------------

    if (
        data.longitude !== null &&
        (
            data.longitude < -180 ||
            data.longitude > 180
        )
    ) {
        return 'La longitud no es válida.';
    }

    return null;
}


// ==========================================================================
// ESTADO DE GUARDADO
// ==========================================================================

function setAddressFormSaving(isSaving) {

    const saveButton =
        getElement('addressSaveBtn');

    const saveText =
        getElement('addressSaveText');

    const saveLoader =
        getElement('addressSaveLoader');

    if (saveButton) {
        saveButton.disabled = isSaving;
    }

    if (saveText) {
        saveText.hidden = isSaving;
    }

    if (saveLoader) {
        saveLoader.hidden = !isSaving;
    }
}


// ==========================================================================
// GUARDAR DIRECCIÓN
// ==========================================================================

async function saveAddress(event) {

    event.preventDefault();

    if (
        !window.accountAddressesApi
    ) {
        showAlert({
            title: 'Error',
            message:
                'La API de direcciones no está disponible.',
            type: 'error'
        });

        return;
    }

    const data =
        getAddressFormData();

    const validationError =
        validateAddressForm(data);

    if (validationError) {

        showAlert({
            title: 'Datos incompletos',
            message: validationError,
            type: 'warning'
        });

        return;
    }

    setAddressFormSaving(true);

    try {

        let savedAddress = null;

        // ==================================================================
        // CREAR / ACTUALIZAR
        // ==================================================================

        if (editingAddressId) {

            savedAddress =
                await accountAddressesApi.updateAddress(
                    editingAddressId,
                    data
                );

            showAlert({
                title: 'Dirección actualizada',
                message:
                    'La dirección se actualizó correctamente.',
                type: 'success'
            });

        } else {

            savedAddress =
                await accountAddressesApi.createAddress(
                    data
                );

            showAlert({
                title: 'Dirección creada',
                message:
                    'La dirección se guardó correctamente.',
                type: 'success'
            });
        }

        // ==================================================================
        // CHECKOUT
        // ==================================================================

        if (addressFormContext === 'CHECKOUT') {

            // --------------------------------------------------------------
            // Actualizar la lista de direcciones de Cuenta
            // --------------------------------------------------------------

            await loadAddresses();


            // --------------------------------------------------------------
            // Actualizar el selector del Checkout
            // --------------------------------------------------------------

            if (
                window.accountCheckoutPurchase &&
                typeof window.accountCheckoutPurchase
                    .handleAddressSaved === 'function'
            ) {
                await window.accountCheckoutPurchase.handleAddressSaved(
                    savedAddress
                );
            }


            // --------------------------------------------------------------
            // Cerrar formulario incrustado en Checkout
            // --------------------------------------------------------------

            closeAddressFormFromCheckout();

            return;
        }

        // ==================================================================
        // CUENTA
        // ==================================================================

        closeAddressModal();

        await loadAddresses();

    } catch (error) {

        console.error(
            '❌ Error guardando dirección:',
            error
        );

        showAlert({
            title: 'No se pudo guardar la dirección',
            message:
                error.message ||
                'Ocurrió un error al guardar la dirección.',
            type: 'error'
        });

    } finally {

        setAddressFormSaving(false);
    }
}


// ==========================================================================
// EDITAR DIRECCIÓN
// ==========================================================================

async function editAddress(addressId) {

    const address =
        addresses.find(
            item => Number(item.id) === Number(addressId)
        );

    if (address) {
        await openAddressModal(address);
        return;
    }

    try {

        const remoteAddress =
            await accountAddressesApi.getAddress(
                addressId
            );

        if (!remoteAddress) {
            throw new Error(
                'No se encontró la dirección.'
            );
        }

        await openAddressModal(remoteAddress);

    } catch (error) {

        console.error(
            '❌ Error obteniendo dirección:',
            error
        );

        showAlert({
            title: 'No se pudo abrir la dirección',
            message:
                error.message ||
                'Ocurrió un error al obtener la dirección.',
            type: 'error'
        });
    }
}


// ==========================================================================
// ESTABLECER COMO PREDETERMINADA
// ==========================================================================

async function setDefaultAddress(addressId) {

    const address =
        addresses.find(
            item => Number(item.id) === Number(addressId)
        );

    if (!address) {
        return;
    }

    if (address.isDefault) {
        return;
    }

    try {

        await accountAddressesApi.setDefaultAddress(
            addressId
        );

        showAlert({
            title: 'Dirección predeterminada',
            message:
                `"${escapeHtml(address.alias)}" ahora es tu dirección predeterminada.`,
            type: 'success'
        });

        await loadAddresses();

    } catch (error) {

        console.error(
            '❌ Error estableciendo dirección predeterminada:',
            error
        );

        showAlert({
            title: 'No se pudo actualizar',
            message:
                error.message ||
                'No se pudo establecer la dirección como predeterminada.',
            type: 'error'
        });
    }
}


// ==========================================================================
// ELIMINAR DIRECCIÓN
// ==========================================================================

async function deleteAddress(addressId) {

    const address =
        addresses.find(
            item => Number(item.id) === Number(addressId)
        );

    if (!address) {
        return;
    }

    const confirmed =
        await confirmationModal.show({
            title: '¿Eliminar dirección?',
            message:
                `¿Deseas eliminar la dirección "${address.alias}"?`,
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });

    if (!confirmed) {
        return;
    }

    try {

        await accountAddressesApi.deleteAddress(
            addressId
        );

        showAlert({
            title: 'Dirección eliminada',
            message:
                'La dirección se eliminó correctamente.',
            type: 'success'
        });

        await loadAddresses();

    } catch (error) {

        console.error(
            '❌ Error eliminando dirección:',
            error
        );

        showAlert({
            title: 'No se pudo eliminar',
            message:
                error.message ||
                'Ocurrió un error al eliminar la dirección.',
            type: 'error'
        });
    }
}


// ==========================================================================
// EVENTOS DE LA LISTA
// ==========================================================================

function handleAddressListClick(event) {

    const button =
        event.target.closest(
            '[data-action][data-address-id]'
        );

    if (!button) {
        return;
    }

    const action =
        button.dataset.action;

    const addressId =
        Number(button.dataset.addressId);

    if (!Number.isInteger(addressId)) {
        return;
    }

    if (action === 'edit') {
        editAddress(addressId);
    }

    if (action === 'default') {
        setDefaultAddress(addressId);
    }

    if (action === 'delete') {
        deleteAddress(addressId);
    }
}


// ==========================================================================
// EVENTOS DEL MODAL
// ==========================================================================

function handleModalClose(event) {

    if (
        event.target.closest(
            '[data-address-modal-close]'
        )
    ) {
        closeAddressModal();
    }
}


// ==========================================================================
// TECLA ESC
// ==========================================================================

function handleEscape(event) {

    const modal =
        getElement('addressModal');

    if (
        event.key === 'Escape' &&
        modal &&
        !modal.hidden
    ) {
        closeAddressModal();
    }
}


// ==========================================================================
// MOVER MODAL AL BODY
// ==========================================================================

function moveAddressModalToBody() {

    const modal = getElement('addressModal');

    if (!modal) {
        return;
    }

    if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
    }
}


// ==========================================================================
// INICIALIZAR CONTENEDOR DEL FORMULARIO
// ==========================================================================

function initializeAddressFormContainer() {

    if (addressFormContainer) {
        return;
    }

    const modal =
        getElement('addressModal');

    if (!modal) {
        console.warn(
            '⚠️ No se encontró #addressModal.'
        );

        return;
    }

    addressFormContainer =
        modal.querySelector(
            '.address-modal-content'
        );

    if (!addressFormContainer) {
        console.warn(
            '⚠️ No se encontró .address-modal-content dentro de #addressModal.'
        );

        return;
    }

    addressFormOriginalParent =
        addressFormContainer.parentElement;
}


// ==========================================================================
// ABRIR FORMULARIO DE DIRECCIÓN EN CHECKOUT
// ==========================================================================

async function openAddressFormInCheckout(container) {

    if (!container) {
        return;
    }

    // ----------------------------------------------------------------------
    // ASEGURAR QUE LOS PAÍSES ESTÉN CARGADOS
    // ----------------------------------------------------------------------

    if (
        !Array.isArray(countries) ||
        countries.length === 0
    ) {
        await initCountrySelector();
    }

    // ----------------------------------------------------------------------
    // ASEGURAR SELECTORES DEL FORMULARIO
    // ----------------------------------------------------------------------

    if (!addressTypeSelector) {
        initAddressTypeSelector();
    }

    if (!identificationTypeSelector) {
        initIdentificationTypeSelector();
    }

    initializeAddressFormContainer();

    if (!addressFormContainer) {
        return;
    }

    addressFormContext =
        'CHECKOUT';


    // ----------------------------------------------------------------------
    // PREPARAR TÍTULO
    // ----------------------------------------------------------------------

    const title =
        getElement('addressModalTitle');

    const subtitle =
        getElement('addressModalSubtitle');

    if (title) {
        title.textContent =
            'Agregar dirección';
    }

    if (subtitle) {
        subtitle.textContent =
            'Completa los datos de tu dirección.';
    }


    // ----------------------------------------------------------------------
    // OCULTAR ELEMENTOS DE DELIVERY
    // ----------------------------------------------------------------------

    if (container.id === 'checkoutDeliveryNewAddress') {

        const shippingSelector =
            getElement(
                'checkoutShippingAddressSelector'
            );

        const addShippingButton =
            getElement(
                'checkoutAddShippingAddress'
            );

        if (shippingSelector) {
            shippingSelector.hidden = true;
        }

        if (addShippingButton) {
            addShippingButton.hidden = true;
        }

        const shippingAddressHeader =
            document.querySelector(
                '#checkoutDeliveryAddress > .checkout-purchase-section-header'
            );

        if (shippingAddressHeader) {
            shippingAddressHeader.hidden = true;
        }

        const checkoutAddressHeader =
            document.querySelector(
                '.checkout-address-section > .checkout-purchase-section-header'
            );

        if (checkoutAddressHeader) {
            checkoutAddressHeader.style.marginBottom = '0';
        }
    }


    // ----------------------------------------------------------------------
    // MOVER FORMULARIO
    // ----------------------------------------------------------------------

    container.innerHTML = '';

    container.appendChild(
        addressFormContainer
    );

    container.hidden = false;

    addressFormContainer.classList.add(
        'address-form-checkout'
    );

    initializeAddressFormEvents();


    // ----------------------------------------------------------------------
    // PREPARAR FORMULARIO
    // ----------------------------------------------------------------------

    await prepareAddressForm();

    await addressMapService.initializeAddressMap();


    const aliasInput =
        getElement('addressAlias');

    if (aliasInput) {

        setTimeout(() => {

            aliasInput.focus();

        }, 50);
    }
}


// ==========================================================================
// FORMAT DIVISION NAME
// ==========================================================================

function formatDivisionName(name) {

    if (!name) return '';

    const lowercaseWords = new Set([
        'a',
        'al',
        'de',
        'del',
        'en',
        'la',
        'las',
        'el',
        'los',
        'y',
        'e',
        'o',
        'u',
        'por',
        'para',
        'con',
        'sin'
    ]);

    return String(name)
        .trim()
        .toLocaleLowerCase('es-PE')
        .split(/\s+/)
        .map((word, index) => {

            // La primera palabra siempre lleva mayúscula inicial
            if (index === 0) {
                return word.charAt(0).toLocaleUpperCase('es-PE') +
                    word.slice(1);
            }

            // Preposiciones y palabras funcionales permanecen en minúscula
            if (lowercaseWords.has(word)) {
                return word;
            }

            // Palabras normales: primera letra mayúscula
            return word.charAt(0).toLocaleUpperCase('es-PE') +
                word.slice(1);
        })
        .join(' ');
}

// ==========================================================================
// EVENTOS DEL FORMULARIO DE DIRECCIÓN
// ==========================================================================

async function handleAddressMapSearch(event) {

    event?.preventDefault();

    const addressMapSearchButton =
        getElement('addressMapSearchButton');

    if (!addressMapSearchButton) {
        return;
    }

    if (addressMapSearchButton.disabled) {
        return;
    }

    const originalButtonContent =
        addressMapSearchButton.innerHTML;

    addressMapSearchButton.disabled = true;

    addressMapSearchButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Buscando...
    `;

    try {

        const getValue = id => {
            const element = getElement(id);

            return element
                ? element.value.trim()
                : '';
        };


        // ------------------------------------------------------------------
        // DIRECCIÓN + NÚMERO
        // ------------------------------------------------------------------

        const street =
            getValue('addressStreet');

        const number =
            getValue('addressNumber');

        const streetAndNumber = [
            street,
            number
        ]
            .filter(Boolean)
            .join(' ');


        // ------------------------------------------------------------------
        // DIVISIONES ADMINISTRATIVAS
        // ------------------------------------------------------------------

        const divisionIds =
            divisionSelectors
                .map(selector =>
                    selector?.getValue?.()
                )
                .filter(Boolean);

        const divisions = [];

        for (const divisionId of divisionIds) {

            const division =
                await appLocation.getDivision(
                    Number(divisionId)
                );

            if (division?.name) {

                divisions.push(
                    division.name
                );
            }
        }


        // ------------------------------------------------------------------
        // DATOS PARA EL SERVICIO DE MAPA
        // ------------------------------------------------------------------

        const addressData = {

            streetAndNumber,

            neighborhood:
                getValue('addressNeighborhood'),

            divisions,

            postalCode:
                getValue('addressPostalCode'),

            countryName:
                selectedCountry?.name || '',

            countryCode:
                selectedCountry?.iso2 || ''
        };


        console.log(
            '🗺️ Datos enviados al servicio de mapa:',
            addressData
        );


        // ------------------------------------------------------------------
        // VALIDAR SERVICIO
        // ------------------------------------------------------------------

        if (
            !window.addressMapService ||
            typeof addressMapService.searchAddressFromForm !==
            'function'
        ) {

            console.error(
                '❌ addressMapService no está disponible.'
            );

            return;
        }


        // ------------------------------------------------------------------
        // BUSCAR
        // ------------------------------------------------------------------

        await addressMapService.searchAddressFromForm(
            addressData
        );

    } catch (error) {

        console.error(
            '❌ Error buscando dirección:',
            error
        );

    } finally {

        addressMapSearchButton.disabled = false;

        addressMapSearchButton.innerHTML =
            originalButtonContent;
    }
}


// ==========================================================================
// INICIALIZAR EVENTOS DEL FORMULARIO
// ==========================================================================

function initializeAddressFormEvents() {

    const form =
        getElement('addressForm');

    const cancelButton =
        getElement('addressCancelBtn');

    const closeButton =
        getElement('addressModalCloseBtn');

    const addressMapSearchButton =
        getElement('addressMapSearchButton');


    // ----------------------------------------------------------------------
    // FORMULARIO
    // ----------------------------------------------------------------------

    if (
        form &&
        !form.dataset.eventsInitialized
    ) {

        form.addEventListener(
            'submit',
            saveAddress
        );

        form.dataset.eventsInitialized =
            'true';
    }


    // ----------------------------------------------------------------------
    // CANCELAR
    // ----------------------------------------------------------------------

    if (
        cancelButton &&
        !cancelButton.dataset.eventsInitialized
    ) {

        cancelButton.addEventListener(
            'click',
            closeAddressModal
        );

        cancelButton.dataset.eventsInitialized =
            'true';
    }


    // ----------------------------------------------------------------------
    // BOTÓN X — CERRAR MODAL
    // ----------------------------------------------------------------------

    if (
        closeButton &&
        !closeButton.dataset.eventsInitialized
    ) {

        closeButton.addEventListener(
            'click',
            closeAddressModal
        );

        closeButton.dataset.eventsInitialized =
            'true';
    }


    // ----------------------------------------------------------------------
    // BUSCAR DIRECCIÓN EN EL MAPA
    // ----------------------------------------------------------------------

    if (
        addressMapSearchButton &&
        !addressMapSearchButton.dataset.eventsInitialized
    ) {

        addressMapSearchButton.addEventListener(
            'click',
            handleAddressMapSearch
        );

        addressMapSearchButton.dataset.eventsInitialized =
            'true';
    }
}


// ==========================================================================
// INICIALIZAR EVENTOS DEL MODAL
// ==========================================================================

function initializeAddressModalEvents() {

    if (
        !document.documentElement.dataset.addressModalEvents
    ) {

        document.addEventListener(
            'click',
            handleModalClose
        );

        document.addEventListener(
            'keydown',
            handleEscape
        );

        document.documentElement.dataset.addressModalEvents =
            'true';
    }

    initializeAddressFormEvents();
}

// ==========================================================================
// INICIALIZACIÓN
// ==========================================================================

async function init() {

    // ==========================================================================
    // VALIDAR SERVICIO DE MAPA
    // ==========================================================================

    if (!window.addressMapService) {

        console.error(
            '❌ addressMapService no está disponible.'
        );

        return;
    }


    // ==========================================================================
    // EVITAR INICIALIZACIÓN DUPLICADA
    // ==========================================================================

    if (initialized) {

        await loadAddresses();

        return;
    }


    // ==========================================================================
    // PREPARAR MODAL Y SELECTORES
    // ==========================================================================

    moveAddressModalToBody();

    initAddressTypeSelector();

    initIdentificationTypeSelector();

    await initCountrySelector();


    // ==========================================================================
    // ELEMENTOS DE LA SECCIÓN DE DIRECCIONES
    // ==========================================================================

    const addButton =
        getElement('addAddressBtn');

    const addFirstButton =
        getElement('addFirstAddressBtn');

    const list =
        getElement('addressesList');


    // ==========================================================================
    // BOTÓN — AGREGAR DIRECCIÓN
    // ==========================================================================

    if (addButton) {

        addButton.addEventListener(
            'click',
            () => openAddressModal()
        );
    }


    // ==========================================================================
    // BOTÓN — AGREGAR PRIMERA DIRECCIÓN
    // ==========================================================================

    if (addFirstButton) {

        addFirstButton.addEventListener(
            'click',
            () => openAddressModal()
        );
    }


    // ==========================================================================
    // EVENTOS DE LA LISTA
    // ==========================================================================

    if (list) {

        list.addEventListener(
            'click',
            handleAddressListClick
        );
    }


    // ==========================================================================
    // EVENTOS DEL MODAL Y FORMULARIO
    // ==========================================================================

    initializeAddressModalEvents();


    // ==========================================================================
    // MARCAR COMO INICIALIZADO
    // ==========================================================================

    initialized = true;


    // ==========================================================================
    // CARGAR DIRECCIONES
    // ==========================================================================

    await loadAddresses();
}


async function prepareAddressForm(address = null) {

    editingAddressId =
        address ? Number(address.id) : null;

    await resetAddressForm();

    if (address) {
        await populateAddressForm(address);
    } else {
        await selectDefaultCountry();
    }
}


// ==========================================================================
// EXPORTS
// ==========================================================================

window.accountAddresses = {
    init,
    loadAddresses,
    renderAddresses,
    openAddressModal,
    closeAddressModal,
    editAddress,
    setDefaultAddress,
    deleteAddress,
    prepareAddressForm,
    openAddressFormInCheckout
};