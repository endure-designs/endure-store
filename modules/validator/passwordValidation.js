// ==========================================================================
// ENDURE — Password Validation
// Validación centralizada de contraseñas
// ==========================================================================

function validatePassword(password = '') {

    const requirements = {
        minLength: {
            valid: password.length >= 8,
            message: 'Debe tener al menos 8 caracteres.'
        },

        uppercase: {
            valid: /[A-Z]/.test(password),
            message: 'Debe contener al menos una letra mayúscula.'
        },

        number: {
            valid: /[0-9]/.test(password),
            message: 'Debe contener al menos un número.'
        },

        special: {
            valid: /[#@$!%*?&]/.test(password),
            message: 'Debe contener al menos un carácter especial (#@$!%*?&).'
        }
    };

    const failedRequirements = Object.values(requirements)
        .filter(requirement => !requirement.valid);

    return {
        isValid: failedRequirements.length === 0,

        requirements,

        message: failedRequirements.length > 0
            ? failedRequirements[0].message
            : 'La contraseña cumple con todos los requisitos.'
    };
}


// ==========================================================================
// API GLOBAL
// ==========================================================================

window.passwordValidation = {
    validatePassword
};