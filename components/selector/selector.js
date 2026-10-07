// ==========================================================================
// SELECTOR — Componente de selector reutilizable
// ==========================================================================

class AppSelector {

    constructor(options = {}) {

        this.container =
            typeof options.container === 'string'
                ? document.querySelector(options.container)
                : options.container;

        if (!this.container) {
            throw new Error(
                'AppSelector: no se encontró el contenedor.'
            );
        }

        this.options = {
            placeholder: 'Seleccionar...',
            options: [],
            value: null,
            disabled: false,
            searchable: false,
            multiple: false,
            ...options
        };

        this.value = this.options.value;
        this.isOpen = false;

        this.render();
        this.bindEvents();
        this.update();
    }

    // ======================================================================
    // RENDER
    // ======================================================================

    render() {

        this.container.innerHTML = `
            <div class="app-selector">

                <button
                    type="button"
                    class="app-selector-trigger"
                    aria-haspopup="listbox"
                    aria-expanded="false"
                >
                    <span class="app-selector-selected-icon"></span>

                    <span class="app-selector-label">
                        ${this.options.placeholder}
                    </span>

                    <i class="fa-solid fa-chevron-down app-selector-arrow"></i>
                </button>

                <div
                    class="app-selector-menu"
                    role="listbox"
                ></div>

            </div>
        `;

        this.element =
            this.container.querySelector('.app-selector');

        this.trigger =
            this.container.querySelector(
                '.app-selector-trigger'
            );

        this.label =
            this.container.querySelector(
                '.app-selector-label'
            );

        this.selectedIcon =
            this.container.querySelector(
                '.app-selector-selected-icon'
            );

        this.menu =
            this.container.querySelector(
                '.app-selector-menu'
            );
    }

    // ======================================================================
    // EVENTS
    // ======================================================================

    bindEvents() {

        this.trigger.addEventListener(
            'click',
            () => this.toggle()
        );

        document.addEventListener(
            'click',
            (event) => {

                if (!this.element.contains(event.target)) {
                    this.close();
                }

            }
        );

        this.menu.addEventListener(
            'click',
            (event) => {

                const option =
                    event.target.closest(
                        '.app-selector-option'
                    );

                if (!option || option.disabled) {
                    return;
                }

                this.select(option.dataset.value);
            }
        );
    }

    // ======================================================================
    // OPEN / CLOSE
    // ======================================================================

    open() {

        if (this.options.disabled) {
            return;
        }

        this.isOpen = true;

        this.element.classList.add('is-open');

        this.trigger.setAttribute(
            'aria-expanded',
            'true'
        );
    }

    close() {

        this.isOpen = false;

        this.element.classList.remove('is-open');

        this.trigger.setAttribute(
            'aria-expanded',
            'false'
        );
    }

    toggle() {

        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    // ======================================================================
    // OPTIONS
    // ======================================================================

    setOptions(options = []) {

        this.options.options = options;

        this.renderOptions();
        this.update();
    }

    renderOptions() {

        this.menu.innerHTML = '';

        this.options.options.forEach(option => {

            const element =
                document.createElement('button');

            element.type = 'button';

            element.className =
                'app-selector-option';

            element.dataset.value =
                String(option.value);

            element.disabled =
                option.disabled === true;

            element.setAttribute(
                'role',
                'option'
            );

            element.innerHTML = `

                ${option.icon
                    ? `
                            <span class="app-selector-option-icon">
                                <i class="${option.icon}"></i>
                            </span>
                        `
                    : ''
                }

                ${option.content
                    ? `
                            <span class="app-selector-option-content">
                                ${option.content}
                            </span>
                        `
                    : `
                            <span class="app-selector-option-label">
                                ${option.label ?? option.value}
                            </span>
                        `
                }

            `;

            this.menu.appendChild(element);
        });
    }

    // ======================================================================
    // VALUE
    // ======================================================================

    select(value) {

        this.value = value;

        this.update();

        this.close();

        const selectedOption =
            this.getSelectedOption();

        if (typeof this.options.onChange === 'function') {

            this.options.onChange(
                this.value,
                selectedOption
            );
        }
    }

    setValue(value) {

        this.value = value;

        this.update();
    }

    getValue() {

        return this.value;
    }

    getSelectedOption() {

        return this.options.options.find(
            option =>
                String(option.value) ===
                String(this.value)
        ) ?? null;
    }

    // ======================================================================
    // UI UPDATE
    // ======================================================================

    update() {

        this.renderOptions();

        const selectedOption =
            this.getSelectedOption();

        this.element.classList.toggle(
            'has-value',
            !!selectedOption
        );

        if (selectedOption) {

            // --------------------------------------------------------------
            // CONTENIDO DEL SELECTOR
            // --------------------------------------------------------------

            if (selectedOption.content) {

                this.label.innerHTML =
                    selectedOption.content;

                this.label.classList.add(
                    'has-content'
                );

            } else {

                this.label.textContent =
                    selectedOption.label ??
                    selectedOption.value;

                this.label.classList.remove(
                    'has-content'
                );
            }


            // --------------------------------------------------------------
            // ICONO
            // --------------------------------------------------------------

            if (this.selectedIcon) {

                if (selectedOption.icon) {

                    this.selectedIcon.innerHTML = `
                <i class="${selectedOption.icon}"></i>
            `;

                    this.selectedIcon.classList.add(
                        'has-icon'
                    );

                } else {

                    this.selectedIcon.innerHTML = '';

                    this.selectedIcon.classList.remove(
                        'has-icon'
                    );

                }
            }

        } else {

            this.label.textContent =
                this.options.placeholder;

            this.label.classList.remove(
                'has-content'
            );

            if (this.selectedIcon) {

                this.selectedIcon.innerHTML = '';

                this.selectedIcon.classList.remove(
                    'has-icon'
                );
            }
        }

        this.menu
            .querySelectorAll('.app-selector-option')
            .forEach(option => {

                const selected =
                    String(option.dataset.value) ===
                    String(this.value);

                option.classList.toggle(
                    'is-selected',
                    selected
                );

                option.setAttribute(
                    'aria-selected',
                    String(selected)
                );
            });

        this.trigger.disabled =
            this.options.disabled;
    }

    // ======================================================================
    // ENABLE / DISABLE
    // ======================================================================

    enable() {

        this.options.disabled = false;

        this.update();
    }

    disable() {

        this.options.disabled = true;

        this.close();

        this.update();
    }

    // ======================================================================
    // DESTROY
    // ======================================================================

    destroy() {

        this.close();

        this.container.innerHTML = '';
    }
}


// ==========================================================================
// FACTORY
// ==========================================================================

function createSelector(options = {}) {

    return new AppSelector(options);
}

window.AppSelector = AppSelector;
window.createSelector = createSelector;