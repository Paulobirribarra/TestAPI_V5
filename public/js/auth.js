// public/js/auth.js
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleText = document.querySelector('.toggle-password');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleText.textContent = 'Ocultar';
    } else {
        passwordInput.type = 'password';
        toggleText.textContent = 'Mostrar';
    }
}

document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
        const emailInput = this.querySelector('#email');
        const nameInput = this.querySelector('#name');
        
        if (emailInput) {
            const email = emailInput.value;
            const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
            if (!emailRegex.test(email)) {
                e.preventDefault();
                alert('Por favor, ingresa un correo válido (ejemplo: ventas@c-ram.cl)');
                return;
            }
        }
        
        if (nameInput && nameInput.value.length < 2) {
            e.preventDefault();
            alert('El nombre debe tener al menos 2 caracteres');
            return;
        }
    });
});