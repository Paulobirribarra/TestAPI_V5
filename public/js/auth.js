//public/js/auth.js
document.getElementById('registerForm').addEventListener('submit', function(event) {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    // Limpiar mensajes de error anteriores
    document.getElementById('name-error').textContent = '';
    document.getElementById('email-error').textContent = '';
    document.getElementById('password-error').textContent = '';

    let hasError = false;

    // Validar nombre
    if (name.length < 2) {
        document.getElementById('name-error').textContent = 'El nombre debe tener al menos 2 caracteres.';
        hasError = true;
    }

    // Validar email (formato)
    if (!emailRegex.test(email)) {
        document.getElementById('email-error').textContent = 'Por favor, ingresa un correo electrónico válido.';
        hasError = true;
    }

    // Validar contraseña
    if (password.length < 8) {
        document.getElementById('password-error').textContent = 'La contraseña debe tener al menos 8 caracteres.';
        hasError = true;
    }

    // Si hay algún error, prevenir el envío del formulario
    if (hasError) {
        event.preventDefault();
    }
});

// Validación AJAX para el email en tiempo real
document.getElementById('email').addEventListener('input', async function() {
    const email = this.value.trim();
    const emailError = document.getElementById('email-error');
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    // Limpiar mensaje de error previo
    emailError.textContent = '';

    // Validar formato del email primero
    if (!emailRegex.test(email)) {
        emailError.textContent = 'Por favor, ingresa un correo electrónico válido.';
        return;
    }

    // Realizar solicitud AJAX para verificar si el email ya existe
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