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

            document.getElementById('name-error').textContent = '';
            document.getElementById('email-error').textContent = '';
            document.getElementById('password-error').textContent = '';

            let hasError = false;

            // Validar nombre
            if (!nameRegex.test(name)) {
                document.getElementById('name-error').textContent = 'El nombre debe tener 2-50 caracteres y solo letras o espacios.';
                hasError = true;
            }

            // Validar email
            if (!emailRegex.test(email)) {
                document.getElementById('email-error').textContent = 'Por favor, ingresa un correo electrónico válido.';
                hasError = true;
            }

            // Validar contraseña
            if (password.length < 8) {
                document.getElementById('password-error').textContent = 'La contraseña debe tener al menos 8 caracteres.';
                hasError = true;
            }

            if (hasError) {
                event.preventDefault();
            }
        });
    }

    // Validación AJAX para el email en tiempo real
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', async function() {
            const email = this.value.trim();
            const emailError = document.getElementById('email-error');
            const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

            emailError.textContent = '';

            if (!emailRegex.test(email)) {
                emailError.textContent = 'Por favor, ingresa un correo electrónico válido.';
                return;
            }

            try {
                const response = await fetch(`/auth/check-email?email=${encodeURIComponent(email)}`);
                const data = await response.json();

                if (!data.available) {
                    emailError.textContent = data.message || 'El correo ya está registrado.';
                }
            } catch (error) {
                console.error('🚨 Error al verificar email:', error);
                emailError.textContent = 'Error al verificar el email. Intenta nuevamente.';
            }
        });
    }
});