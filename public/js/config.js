// public/js/config.js
function togglePassword(fieldId) {
    const input = document.getElementById(fieldId);
    const toggleText = input.nextElementSibling;
    if (input.type === 'password') {
        input.type = 'text';
        toggleText.textContent = 'Ocultar';
    } else {
        input.type = 'password';
        toggleText.textContent = 'Mostrar';
    }
}

function validaRut(rut) {
    if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(rut)) return false;
    const [digits, dv] = rut.split('-');
    let sum = 0;
    let multi = 2;
    for (let i = digits.length - 1; i >= 0; i--) {
        sum += parseInt(digits[i]) * multi;
        multi = multi < 7 ? multi + 1 : 2;
    }
    const computedDv = 11 - (sum % 11);
    const finalDv = computedDv === 11 ? '0' : computedDv === 10 ? 'K' : computedDv.toString();
    return finalDv === dv.toUpperCase();
}

// Configuración API
document.getElementById('config-api-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const apiUser = document.getElementById('apiUser').value;
    const apiKey = document.getElementById('apiKey').value;

    console.log('📤 Datos enviados al guardar Configuración API:', { apiUser, apiKey });

    try {
        const response = await fetch('/configuracion/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiUser, apiKey })
        });

        if (response.ok) {
            document.getElementById('mensajeExito').style.display = 'block';
            document.getElementById('mensajeError').style.display = 'none';
            location.reload();
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
    } catch (error) {
        console.error('❌ Error al guardar Configuración API:', error);
        document.getElementById('mensajeExito').style.display = 'none';
        document.getElementById('mensajeError').style.display = 'block';
    }
});

// Configuración SII
document.getElementById('config-sii-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const rutUsuario = document.getElementById('rutUsuario').value;
    const passwordSII = document.getElementById('passwordSII').value;
    const rutEmpresa = document.getElementById('rutEmpresa').value;
    const ambiente = document.getElementById('ambiente').value;
    const detallado = document.getElementById('detallado').value === 'true';

    if (!validaRut(rutUsuario) || !validaRut(rutEmpresa)) {
        alert('Por favor, ingresa RUTs válidos (Ej: 12327554-3)');
        return;
    }

    console.log('📤 Datos enviados al guardar Configuración SII:', { rutUsuario, passwordSII, rutEmpresa, ambiente, detallado });

    try {
        const response = await fetch('/configuracion/sii', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rutUsuario, passwordSII, rutEmpresa, ambiente, detallado })
        });

        if (response.ok) {
            document.getElementById('mensajeExito').style.display = 'block';
            document.getElementById('mensajeError').style.display = 'none';
            location.reload();
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
    } catch (error) {
        console.error('❌ Error al guardar Configuración SII:', error);
        document.getElementById('mensajeExito').style.display = 'none';
        document.getElementById('mensajeError').style.display = 'block';
    }
});