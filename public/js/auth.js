//public/js/auth.js
document.addEventListener('DOMContentLoaded', () => {
    // Función para alternar visibilidad de contraseña
    function togglePassword() {
        const input = document.getElementById('password');
        const toggle = document.querySelector('.toggle-password');
        if (input.type === 'password') {
            input.type = 'text';
            toggle.textContent = 'Ocultar';
            console.log('👁️ Mostrando contraseña');
        } else {
            input.type = 'password';
            toggle.textContent = 'Mostrar';
            console.log('👁️ Ocultando contraseña');
        }
    }

    // Asociar evento al toggle de contraseña
    const toggleBtn = document.querySelector('.toggle-password');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', togglePassword);
        // Permitir activar el toggle con Enter o Espacio para accesibilidad
        toggleBtn.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                togglePassword();
            }
        });
    }

    // Función para obtener o crear un elemento de error
    function getOrCreateErrorElement(id, parentElement) {
        let errorElement = document.getElementById(id);
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.id = id;
            errorElement.className = 'error';
            errorElement.setAttribute('aria-live', 'polite');
            parentElement.appendChild(errorElement);
        }
        return errorElement;
    }

    // Función para limpiar un elemento de error si no tiene contenido
    function clearErrorElement(errorElement) {
        if (errorElement && errorElement.textContent === '') {
            errorElement.remove();
        }
    }

    // Validación del formulario de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
            const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/; // Solo letras y espacios, 2-50 caracteres

            // Obtener o crear los elementos de error
            const nameParent = document.getElementById('name').parentElement;
            const emailParent = document.getElementById('email').parentElement;
            const passwordParent = document.getElementById('password').parentElement.parentElement; // El padre del input es password-container

            const nameError = getOrCreateErrorElement('name-error', nameParent);
            const emailError = getOrCreateErrorElement('email-error', emailParent);
            const passwordError = getOrCreateErrorElement('password-error', passwordParent);

            // Limpiar errores anteriores
            nameError.textContent = '';
            emailError.textContent = '';
            passwordError.textContent = '';

            let hasError = false;

            // Validar nombre
            if (!nameRegex.test(name)) {
                nameError.textContent = 'El nombre debe tener 2-50 caracteres y solo letras o espacios.';
                document.getElementById('name').classList.add('is-invalid');
                document.getElementById('name').classList.remove('is-valid');
                hasError = true;
            } else {
                document.getElementById('name').classList.add('is-valid');
                document.getElementById('name').classList.remove('is-invalid');
                clearErrorElement(nameError);
            }

            // Validar email
            if (!emailRegex.test(email)) {
                emailError.textContent = 'Por favor, ingresa un correo electrónico válido.';
                document.getElementById('email').classList.add('is-invalid');
                document.getElementById('email').classList.remove('is-valid');
                hasError = true;
            } else {
                document.getElementById('email').classList.add('is-valid');
                document.getElementById('email').classList.remove('is-invalid');
                clearErrorElement(emailError);
            }

            // Validar contraseña
            if (password.length < 8) {
                passwordError.textContent = 'La contraseña debe tener al menos 8 caracteres.';
                document.getElementById('password').classList.add('is-invalid');
                document.getElementById('password').classList.remove('is-valid');
                hasError = true;
            } else {
                document.getElementById('password').classList.add('is-valid');
                document.getElementById('password').classList.remove('is-invalid');
                clearErrorElement(passwordError);
            }

            if (hasError) {
                event.preventDefault();
            }
        });
    }

    // Validación AJAX para el email en tiempo real (solo en el formulario de registro)
    const emailInput = document.getElementById('email');
    if (emailInput && emailInput.closest('#registerForm')) {
        emailInput.addEventListener('input', async function() {
            const email = this.value.trim();
            const emailParent = emailInput.parentElement;
            const emailError = getOrCreateErrorElement('email-error', emailParent);
            const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

            emailError.textContent = '';

            if (!emailRegex.test(email)) {
                emailError.textContent = 'Por favor, ingresa un correo electrónico válido.';
                emailInput.classList.add('is-invalid');
                emailInput.classList.remove('is-valid');
                return;
            }

            try {
                const response = await fetch(`/auth/check-email?email=${encodeURIComponent(email)}`);
                const data = await response.json();

                if (!data.available) {
                    emailError.textContent = data.message || 'El correo ya está registrado.';
                    emailInput.classList.add('is-invalid');
                    emailInput.classList.remove('is-valid');
                } else {
                    emailInput.classList.add('is-valid');
                    emailInput.classList.remove('is-invalid');
                    clearErrorElement(emailError);
                }
            } catch (error) {
                console.error('🚨 Error al verificar email:', error);
                emailError.textContent = 'Error al verificar el email. Intenta nuevamente.';
                emailInput.classList.add('is-invalid');
                emailInput.classList.remove('is-valid');
            }
        });
    }
});