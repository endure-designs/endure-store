// ==========================================================================
// APP DROPDOWNS — Desplegables personalizados
// ==========================================================================

let activeSubfilterItem = null;
// ==========================================================================
// Posicionar subfiltro junto a la opción principal
// ==========================================================================

function positionSubfilters(item) {

    const container =
        document.getElementById('catalogSubfilters');

    if (!container || !item) return;

    activeSubfilterItem = item;

    const rect = item.getBoundingClientRect();

    const GAP = 8;

    container.style.top =
        `${rect.top}px`;

    container.style.left =
        `${rect.right + GAP}px`;
}


// ==========================================================================
// Mantener subselector anclado durante el scroll
// ==========================================================================

window.addEventListener('scroll', () => {

    if (!activeSubfilterItem) return;

    const container =
        document.getElementById('catalogSubfilters');

    if (!container ||
        !container.classList.contains('visible')) {
        return;
    }

    positionSubfilters(activeSubfilterItem);

}, { passive: true });


// ==========================================================================
// Inicializar todos los dropdowns
// ==========================================================================

function initCustomDropdowns() {

    const dropdowns = document.querySelectorAll('.custom-dropdown');

    dropdowns.forEach(dd => {

        const selectId = dd.getAttribute('data-select-id');
        const nativeSelect = document.getElementById(selectId);

        if (!nativeSelect) return;

        const list = document.createElement('div');
        list.classList.add('dropdown-list');

        Array.from(nativeSelect.options).forEach(opt => {

            const item = document.createElement('div');

            item.classList.add('dropdown-item');
            item.dataset.value = opt.value;
            item.textContent = opt.textContent;

            if (opt.selected) {
                item.classList.add('active');
            }

            // --------------------------------------------------------------
            // Click del elemento principal
            // --------------------------------------------------------------

            item.addEventListener('click', (e) => {

                e.stopPropagation();

                nativeSelect.value = opt.value;

                refreshCustomDropdown(selectId);

                dd.classList.remove('open');

                const event = new Event('change', {
                    bubbles: true
                });

                nativeSelect.dispatchEvent(event);
            });

            // --------------------------------------------------------------
            // Hover para subfiltros dinámicos
            // --------------------------------------------------------------

            item.addEventListener('mouseenter', () => {

                if (selectId === 'categorySelect' && opt.value !== 'all') {

                    catalogSubfilters.show(
                        'productType',
                        opt.value
                    );

                    positionSubfilters(item);

                    return;
                }

                if (selectId === 'collectionSelect' && opt.value !== 'all') {

                    catalogSubfilters.show(
                        'theme',
                        opt.value
                    );

                    positionSubfilters(item);

                    return;
                }

                // "Todos" no tiene subfiltros
                if (opt.value === 'all') {
                    catalogSubfilters.clear();
                }
            });

            list.appendChild(item);
        });

        const selectedDiv = document.createElement('div');

        selectedDiv.classList.add('selected');

        selectedDiv.textContent =
            nativeSelect.selectedOptions[0]?.textContent || '';

        dd.appendChild(selectedDiv);
        dd.appendChild(list);


        // ------------------------------------------------------------------
        // Abrir / cerrar dropdown
        // ------------------------------------------------------------------

        dd.addEventListener('click', (e) => {

            e.stopPropagation();

            document
                .querySelectorAll('.custom-dropdown.open')
                .forEach(openDd => {

                    if (openDd !== dd) {
                        openDd.classList.remove('open');
                    }
                });

            if (dd.classList.contains('open')) {
                dd.classList.remove('open');
                catalogSubfilters.clear();
            } else {
                document
                    .querySelectorAll('.custom-dropdown.open')
                    .forEach(openDd => {
                        openDd.classList.remove('open');
                    });

                dd.classList.add('open');
            }
        });


        // ------------------------------------------------------------------
        // Cerrar al hacer click fuera
        // ------------------------------------------------------------------

        document.addEventListener('click', () => {
            dd.classList.remove('open');
            catalogSubfilters.clear();
        });

    });
}


// ==========================================================================
// Reconstruir un dropdown después de cambiar sus opciones
// ==========================================================================

function rebuildCustomDropdown(selectId) {

    const dd = document.querySelector(
        `.custom-dropdown[data-select-id="${selectId}"]`
    );

    const nativeSelect = document.getElementById(selectId);

    if (!dd || !nativeSelect) return;

    const list = dd.querySelector('.dropdown-list');

    if (!list) return;

    list.innerHTML = '';


    Array.from(nativeSelect.options).forEach(opt => {

        const item = document.createElement('div');

        item.classList.add('dropdown-item');
        item.dataset.value = opt.value;
        item.textContent = opt.textContent;

        if (opt.selected) {
            item.classList.add('active');
        }


        // --------------------------------------------------------------
        // Click
        // --------------------------------------------------------------

        item.addEventListener('click', (e) => {

            e.stopPropagation();

            nativeSelect.value = opt.value;

            refreshCustomDropdown(selectId);

            dd.classList.remove('open');

            const event = new Event('change', {
                bubbles: true
            });

            nativeSelect.dispatchEvent(event);
        });


        // --------------------------------------------------------------
        // Hover para subfiltros dinámicos
        // --------------------------------------------------------------

        item.addEventListener('mouseenter', () => {

            if (selectId === 'categorySelect' && opt.value !== 'all') {

                catalogSubfilters.show(
                    'productType',
                    opt.value
                );

                positionSubfilters(item);

                return;
            }

            if (selectId === 'collectionSelect' && opt.value !== 'all') {

                catalogSubfilters.show(
                    'theme',
                    opt.value
                );

                positionSubfilters(item);

                return;
            }

            if (opt.value === 'all') {
                catalogSubfilters.clear();
            }
        });

        list.appendChild(item);
    });

    refreshCustomDropdown(selectId);
}


// ==========================================================================
// Actualizar estado visual del dropdown
// ==========================================================================

function refreshCustomDropdown(selectId, displayText = null) {

    const dd = document.querySelector(
        `.custom-dropdown[data-select-id="${selectId}"]`
    );

    const nativeSelect = document.getElementById(selectId);

    if (!dd || !nativeSelect) return;

    const selectedDiv = dd.querySelector('.selected');

    // ----------------------------------------------------------------------
    // Texto visible
    // ----------------------------------------------------------------------

    if (selectedDiv) {

        selectedDiv.textContent =
            displayText !== null
                ? displayText
                : nativeSelect.selectedOptions[0]?.textContent || '';

    }

    // ----------------------------------------------------------------------
    // Estado visual de las opciones principales
    // ----------------------------------------------------------------------

    dd.querySelectorAll('.dropdown-item').forEach(item => {

        // El valor del item corresponde al value del <option>
        const itemValue = item.dataset.value;

        if (itemValue === nativeSelect.value) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }

    });
}


// ==========================================================================
// API pública
// ==========================================================================

window.appDropdowns = {

    initCustomDropdowns,
    rebuildCustomDropdown,
    refreshCustomDropdown

};