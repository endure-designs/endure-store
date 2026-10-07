/**
 * ENDURE — Auth Module
 * Handles Login & Register forms with API integration.
 */

// ─── DOM References ───
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authAlert = document.getElementById('authAlert');

// Email verification DOM References
const emailVerification = document.getElementById('emailVerification');
const verificationEmail = document.getElementById('verificationEmail');
const verificationCode = document.getElementById('verificationCode');
const verifyEmailButton = document.getElementById('verifyEmailButton');
const resendVerificationButton = document.getElementById('resendVerificationButton');
const resendMessage = document.getElementById('resendMessage');
const backToRegister = document.getElementById('backToRegister');

// Registration verification state
let pendingVerificationEmail = null;
let resendCountdownTimer = null;

const registrationSuccess = document.getElementById('registrationSuccess');
const successCountdown = document.getElementById('successCountdown');

let successCountdownTimer = null;

const goToRegister = document.getElementById('goToRegister');
const goToLogin = document.getElementById('goToLogin');

// Password Validation DOM References
const registerPasswordInput = document.getElementById('registerPassword');
const registerConfirmPasswordInput = document.getElementById('registerConfirmPassword');
const reqLength = document.getElementById('reqLength');
const reqUpper = document.getElementById('reqUpper');
const reqNumber = document.getElementById('reqNumber');
const reqSpecial = document.getElementById('reqSpecial');
const matchIndicator = document.getElementById('matchIndicator');


// Referencias a los contenedores
const passwordRequirements = document.getElementById('passwordRequirements');
const passwordValidIndicator = document.getElementById('passwordValidIndicator');

// ─── Tab / Form Toggling ───

/**
 * Switch the visible form between login and register.
 * @param {'login'|'register'} view - Which form to display.
 */
function switchView(view) {
    // Hide alert when switching
    hideAlert();

    if (view === 'register') {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        tabLogin.classList.remove('active');
        tabRegister.classList.add('active');
        // Re-trigger entrance animation
        registerForm.style.animation = 'none';
        registerForm.offsetHeight; // force reflow
        registerForm.style.animation = '';
    } else {
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        tabRegister.classList.remove('active');
        tabLogin.classList.add('active');
        loginForm.style.animation = 'none';
        loginForm.offsetHeight;
        loginForm.style.animation = '';
    }
}

// Tab click listeners
tabLogin.addEventListener('click', () => switchView('login'));
tabRegister.addEventListener('click', () => switchView('register'));

// Footer link listeners
goToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('register');
});

goToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('login');
});

// ─── Alert Helpers ───

/**
 * Display a styled alert message.
 * @param {string} message - The message to display.
 * @param {'error'|'success'} type - Alert type.
 */
function showAlert(message, type = 'error') {
    const icon = type === 'success'
        ? '<i class="fa-solid fa-circle-check"></i>'
        : '<i class="fa-solid fa-circle-exclamation"></i>';

    authAlert.innerHTML = `${icon}<span>${message}</span>`;
    authAlert.className = `auth-alert visible alert-${type}`;

    // Auto-hide after 6 seconds
    clearTimeout(authAlert._hideTimer);
    authAlert._hideTimer = setTimeout(() => hideAlert(), 6000);
}

function hideAlert() {
    authAlert.className = 'auth-alert';
    authAlert.innerHTML = '';
}

// ─── Loading State Helpers ───

/**
 * Toggle loading spinner on submit buttons.
 * @param {HTMLButtonElement} btn - The submit button.
 * @param {boolean} loading - Whether to show loading state.
 */
function setLoading(btn, loading) {
    const text = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.btn-loader');

    if (loading) {
        text.style.display = 'none';
        loader.style.display = 'inline-flex';
        btn.disabled = true;
        btn.style.opacity = '0.7';
    } else {
        text.style.display = 'inline';
        loader.style.display = 'none';
        btn.disabled = false;
        btn.style.opacity = '1';
    }
}

// ─── Toggle Password Visibility ───
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = btn.parentElement.querySelector('input');
        const icon = btn.querySelector('i');

        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
});

// ─── Password Strength and Matching Logic ───

/**
 * Evaluate password requirements and update visual indicators.
 * @param {string} password - The password value.
 * @returns {boolean} Whether all requirements are satisfied.
 */
function checkPasswordStrength(password) {

    // 1. Ocultar si está vacío, mostrar si detecta al menos 1 carácter
    if (password.length > 0) {
        passwordRequirements.classList.add('is-visible');
    } else {
        passwordRequirements.classList.remove('is-visible');
    }

    // 2. Obtener la validación centralizada
    const validation =
        passwordValidation.validatePassword(password);

    // 3. Obtener el estado de cada requisito
    const hasMinLength =
        validation.requirements.minLength.valid;

    const hasUpper =
        validation.requirements.uppercase.valid;

    const hasNumber =
        validation.requirements.number.valid;

    const hasSpecial =
        validation.requirements.special.valid;

    // 4. Mantener la actualización visual de cada requisito
    updateReqItem(reqLength, hasMinLength);
    updateReqItem(reqUpper, hasUpper);
    updateReqItem(reqNumber, hasNumber);
    updateReqItem(reqSpecial, hasSpecial);

    // 5. Mantener la validación general
    const isAllValid = validation.isValid;

    // 6. Mantener exactamente los tres estados visuales originales
    if (password.length === 0) {

        // Estado 1: Campo vacío -> Oculta ambos
        passwordRequirements.classList.remove('is-visible');
        passwordValidIndicator.classList.remove('is-visible');

    } else if (isAllValid) {

        // Estado 2: Todo válido -> Oculta requisitos
        // y muestra "Contraseña válida"
        passwordRequirements.classList.remove('is-visible');
        passwordValidIndicator.classList.add('is-visible');

    } else {

        // Estado 3: Incompleto -> Muestra requisitos
        // y oculta "Contraseña válida"
        passwordRequirements.classList.add('is-visible');
        passwordValidIndicator.classList.remove('is-visible');
    }

    // 7. Mantener el mismo retorno que tenía la función original
    return isAllValid;
}

/**
 * Helper to toggle valid/invalid class and icon for a single requirement item.
 * @param {HTMLElement} element - The requirement list item.
 * @param {boolean} isValid - Whether rule is met.
 */
function updateReqItem(element, isValid) {
    const icon = element.querySelector('i');
    if (isValid) {
        element.classList.remove('invalid');
        element.classList.add('valid');
        icon.className = 'fa-solid fa-circle-check';
    } else {
        element.classList.remove('valid');
        element.classList.add('invalid');
        icon.className = 'fa-solid fa-circle-xmark';
    }
}

/**
 * Verify if password and confirm password inputs match and update indicator.
 * @returns {boolean} Whether they match.
 */
function checkPasswordsMatch() {
    const password = registerPasswordInput.value;
    const confirmPassword = registerConfirmPasswordInput.value;

    if (!confirmPassword) {
        matchIndicator.className = 'match-indicator';
        return false;
    }

    matchIndicator.className = 'match-indicator visible';
    const span = matchIndicator.querySelector('span');
    const icon = matchIndicator.querySelector('i');

    if (password === confirmPassword) {
        matchIndicator.className = 'match-indicator visible match-success';
        span.textContent = 'Las contraseñas coinciden';
        icon.className = 'fa-solid fa-circle-check';
        return true;
    } else {
        matchIndicator.className = 'match-indicator visible match-error';
        span.textContent = 'Las contraseñas no coinciden';
        icon.className = 'fa-solid fa-circle-xmark';
        return false;
    }
}

// Real-time Event Listeners
registerPasswordInput.addEventListener('input', () => {
    checkPasswordStrength(registerPasswordInput.value);
    if (registerConfirmPasswordInput.value) {
        checkPasswordsMatch();
    }
});

registerConfirmPasswordInput.addEventListener('input', checkPasswordsMatch);



// ─── EMAIL VERIFICATION ─────────────────────────────────────

function showEmailVerification(email) {
    pendingVerificationEmail = email;

    loginForm.style.display = 'none';
    registerForm.style.display = 'none';

    tabLogin.style.display = 'none';
    tabRegister.style.display = 'none';

    emailVerification.style.display = 'block';

    verificationEmail.textContent = email;
    verificationCode.value = '';

    resendVerificationButton.disabled = true;

    startResendCountdown(60);

    verificationCode.focus();
}

function hideEmailVerification() {
    clearInterval(resendCountdownTimer);

    emailVerification.style.display = 'none';

    tabLogin.style.display = '';
    tabRegister.style.display = '';

    pendingVerificationEmail = null;
}

function startResendCountdown(seconds) {
    clearInterval(resendCountdownTimer);

    let remaining = seconds;

    resendVerificationButton.disabled = true;

    resendMessage.textContent =
        `¿No recibiste el código? Puedes reenviarlo en ${remaining}s.`;

    resendCountdownTimer = setInterval(() => {
        remaining--;

        if (remaining <= 0) {
            clearInterval(resendCountdownTimer);

            resendVerificationButton.disabled = false;

            resendMessage.textContent =
                '¿No recibiste el código?';

            return;
        }

        resendMessage.textContent =
            `¿No recibiste el código? Puedes reenviarlo en ${remaining}s.`;
    }, 1000);
}


function showRegistrationSuccess() {

    // Ocultar todo lo relacionado al registro/verificación
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    emailVerification.style.display = 'none';

    // Ocultar las pestañas Login / Registro
    tabLogin.style.display = 'none';
    tabRegister.style.display = 'none';

    // Mostrar pantalla de éxito
    registrationSuccess.style.display = 'block';

    let seconds = 5;
    successCountdown.textContent = seconds;

    clearInterval(successCountdownTimer);

    successCountdownTimer = setInterval(() => {

        seconds--;

        successCountdown.textContent = seconds;

        if (seconds <= 0) {

            clearInterval(successCountdownTimer);

            // Volver al login
            registrationSuccess.style.display = 'none';

            tabLogin.style.display = '';
            tabRegister.style.display = '';

            switchView('login');
        }

    }, 1000);
}



// ─── LOGIN Handler ───
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("defaultPrevented:", e.defaultPrevented);

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const submitBtn = document.getElementById('loginSubmit');

    // Basic client-side validation
    if (!email || !password) {
        showAlert('Por favor, completa todos los campos.', 'error');
        return;
    }

    setLoading(submitBtn, true);
    hideAlert();

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // 👈 OBLIGATORIO: Permite recibir e incluir cookies
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {

            showAlert('Acceso concedido. Redirigiendo...', 'success');

            // Redirect to home after a short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            // Show backend error message
            const errorMsg = data.message || data.error || 'Error al iniciar sesión.';
            showAlert(errorMsg, 'error');
        }
    } catch (err) {
        console.error('Login error:', err);
        showAlert('No se pudo conectar con el servidor. Inténtalo más tarde.', 'error');
    } finally {
        setLoading(submitBtn, false);
    }
});

// ─── REGISTER Handler ───

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstName =
        document.getElementById('registerFirstName').value.trim();

    const lastName =
        document.getElementById('registerLastName').value.trim();

    const email =
        document.getElementById('registerEmail').value.trim().toLowerCase();

    const password =
        registerPasswordInput.value;

    const confirmPassword =
        registerConfirmPasswordInput.value;

    const submitBtn =
        document.getElementById('registerSubmit');

    // Basic completeness validation
    if (
        !firstName ||
        !lastName ||
        !email ||
        !password ||
        !confirmPassword
    ) {
        showAlert(
            'Por favor, completa todos los campos.',
            'error'
        );

        return;
    }

    // Password strength check
    const isStrong =
        checkPasswordStrength(password);

    if (!isStrong) {
        showAlert(
            'La contraseña no cumple con todos los requisitos mínimos.',
            'error'
        );

        return;
    }

    // Password confirmation
    if (password !== confirmPassword) {
        showAlert(
            'Las contraseñas no coinciden.',
            'error'
        );

        return;
    }

    setLoading(submitBtn, true);
    hideAlert();

    try {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/register`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            showEmailVerification(email);

            showAlert(
                'Te enviamos un código de verificación.',
                'success'
            );

        } else {

            const errorMsg =
                data.message ||
                data.error ||
                'Error al iniciar el registro.';

            showAlert(
                errorMsg,
                'error'
            );
        }

    } catch (err) {

        console.error(
            'Register error:',
            err
        );

        showAlert(
            'No se pudo conectar con el servidor. Inténtalo más tarde.',
            'error'
        );

    } finally {

        setLoading(
            submitBtn,
            false
        );
    }
});

verifyEmailButton.addEventListener('click', async () => {

    const code =
        verificationCode.value.trim();

    if (!pendingVerificationEmail) {
        showAlert(
            'El proceso de verificación no es válido.',
            'error'
        );

        return;
    }

    if (!/^\d{6}$/.test(code)) {
        showAlert(
            'Ingresa el código de 6 dígitos.',
            'error'
        );

        verificationCode.focus();

        return;
    }

    setLoading(
        verifyEmailButton,
        true
    );

    hideAlert();

    try {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/verify-email`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    email: pendingVerificationEmail,
                    code
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            clearInterval(resendCountdownTimer);

            // Limpiar estado de verificación
            pendingVerificationEmail = null;

            // Limpiar formulario de registro
            registerForm.reset();

            // Resetear indicadores de contraseña
            checkPasswordStrength('');

            matchIndicator.className = 'match-indicator';

            // Mostrar pantalla de registro exitoso
            // La función se encarga del contador de 5 segundos
            // y de redirigir al login.
            showRegistrationSuccess();

        } else {

            const errorMsg =
                data.message ||
                data.error ||
                'Código de verificación incorrecto.';

            showAlert(
                errorMsg,
                'error'
            );
        }

    } catch (error) {

        console.error(
            'Email verification error:',
            error
        );

        showAlert(
            'No se pudo conectar con el servidor. Inténtalo más tarde.',
            'error'
        );

    } finally {

        setLoading(
            verifyEmailButton,
            false
        );
    }
});


resendVerificationButton.addEventListener(
    'click',
    async () => {

        if (!pendingVerificationEmail) {
            return;
        }

        resendVerificationButton.disabled = true;

        hideAlert();

        try {

            const response = await fetch(
                `${CONFIG.API_BASE_URL}/resend-verification`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        email: pendingVerificationEmail
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                verificationCode.value = '';

                showAlert(
                    'Se ha enviado un nuevo código.',
                    'success'
                );

                startResendCountdown(60);

                verificationCode.focus();

            } else {

                const errorMsg =
                    data.message ||
                    data.error ||
                    'No se pudo reenviar el código.';

                showAlert(
                    errorMsg,
                    'error'
                );

                /*
                 * Si el backend rechaza por cooldown,
                 * mantenemos el botón bloqueado unos segundos.
                 */
                if (
                    data.code === 'RESEND_COOLDOWN'
                ) {
                    startResendCountdown(60);
                } else {
                    resendVerificationButton.disabled = false;
                }
            }

        } catch (error) {

            console.error(
                'Resend verification error:',
                error
            );

            showAlert(
                'No se pudo conectar con el servidor.',
                'error'
            );

            resendVerificationButton.disabled = false;
        }
    }
);

backToRegister.addEventListener('click', () => {

    clearInterval(resendCountdownTimer);

    hideEmailVerification();

    tabLogin.style.display = '';
    tabRegister.style.display = '';

    switchView('register');
});


// ─── GOOGLE LOGIN ───────────────────────────────────────────────────────────

function initializeGoogleLogin() {

    const googleButton = document.getElementById('googleButton');

    if (!googleButton) {
        console.warn('No se encontró el contenedor del botón de Google.');
        return;
    }

    if (!window.google || !google.accounts || !google.accounts.id) {
        console.error('Google Identity Services no está disponible.');
        showAlert(
            'No se pudo cargar el inicio de sesión con Google.',
            'error'
        );
        return;
    }

    const clientId = CONFIG?.GOOGLE?.CLIENT_ID;

    if (!clientId) {
        console.error('No se encontró CONFIG.GOOGLE.CLIENT_ID.');
        showAlert(
            'La configuración de Google no está disponible.',
            'error'
        );
        return;
    }

    console.log('Google Client ID:', CONFIG.GOOGLE.CLIENT_ID);
    console.log('Google Origin:', window.location.origin);

    google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
        auto_select: false,
        use_fedcm_for_button: true
    });

    google.accounts.id.renderButton(
        googleButton,
        {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 150
        }
    );

    console.log('Google Login inicializado correctamente.');
}


async function handleGoogleCredential(response) {

    if (!response || !response.credential) {
        console.error('Google no devolvió una credential válida.');

        showAlert(
            'No se pudo obtener la información de Google.',
            'error'
        );

        return;
    }

    hideAlert();

    const googleButton = document.getElementById('googleButton');

    if (googleButton) {
        googleButton.style.pointerEvents = 'none';
        googleButton.style.opacity = '0.6';
    }

    try {

        console.log('Enviando credential de Google al backend...');

        const apiResponse =
            await window.authApi.loginWithGoogle(
                response.credential
            );

        const data = await apiResponse.json();

        if (apiResponse.ok) {

            console.log('Login con Google exitoso:', data);

            showAlert(
                'Acceso concedido. Redirigiendo...',
                'success'
            );

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);

        } else {

            console.error(
                'Error de login con Google:',
                data
            );

            const errorMsg =
                data.message ||
                data.error ||
                'No se pudo iniciar sesión con Google.';

            showAlert(errorMsg, 'error');
        }

    } catch (error) {

        console.error(
            'Google Login error:',
            error
        );

        showAlert(
            'No se pudo conectar con el servidor. Inténtalo más tarde.',
            'error'
        );

    } finally {

        if (googleButton) {
            googleButton.style.pointerEvents = 'auto';
            googleButton.style.opacity = '1';
        }
    }
}


// Inicializar Google cuando la página esté lista
function waitForGoogleIdentityServices() {

    if (
        window.google &&
        google.accounts &&
        google.accounts.id
    ) {

        initializeGoogleLogin();

        return;
    }

    setTimeout(
        waitForGoogleIdentityServices,
        100
    );
}

waitForGoogleIdentityServices();
