// public/js/config.js

// Función para alternar visibilidad de contraseña
function togglePassword(fieldId) {
    const input = document.getElementById(fieldId);
    const toggle = input.nextElementSibling;
    if (input.type === 'password') {
        input.type = 'text';
        toggle.textContent = 'Ocultar';
        console.log(`👁️ Mostrando ${fieldId}`);
    } else {
        input.type = 'password';
        toggle.textContent = 'Mostrar';
        console.log(`👁️ Ocultando ${fieldId}`);
    }
}

// Función para validar RUT chileno
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

// Función para alternar modo edición en el formulario de Configuración API
function toggleEditMode() {
    const apiUser = document.getElementById('apiUser');
    const apiKey = document.getElementById('apiKey');
    const editBtn = document.getElementById('edit-btn');
    const saveBtn = document.getElementById('save-btn');

    if (apiUser.readOnly) {
        apiUser.readOnly = false;
        apiKey.readOnly = false;
        editBtn.style.display = 'none';
        saveBtn.style.display = 'block';
        console.log('✏️ Modo edición activado');
    } else {
        apiUser.readOnly = true;
        apiKey.readOnly = true;
        editBtn.style.display = 'block';
        saveBtn.style.display = 'none';
        console.log('🔒 Modo edición desactivado');
    }
}

// Configuración API - Manejo del formulario
console.log('📜 Script config.js cargado');

const siiForm = document.getElementById('config-sii-form');
if (siiForm) {
    console.log('✅ Formulario config-sii-form encontrado');
    siiForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('🚀 Evento submit disparado para config-sii-form');

        // Obtener los valores del formulario
        const rutUsuario = document.getElementById('rutUsuario').value;
        const passwordSII = document.getElementById('passwordSII').value;
        const rutEmpresa = document.getElementById('rutEmpresa').value;
        const ambiente = document.getElementById('ambiente').value;
        const detallado = document.getElementById('detallado').value === 'true';

        // Validar RUTs
        if (!validaRut(rutUsuario) || !validaRut(rutEmpresa)) {
            alert('Por favor, ingresa RUTs válidos (Ej: 12327554-3)');
            return;
        }

        // Validar contraseña
        if (!passwordSII) {
            alert('Por favor, ingresa una contraseña SII.');
            return;
        }

        // Preparar los datos del formulario
        const formData = new FormData(e.target);
        console.log('📤 Enviando config SII:', Object.fromEntries(formData));

        try {
            const response = await fetch('/configuracion/sii', { // Ajustado a la ruta correcta
                method: 'POST',
                body: formData
            });
            console.log('📥 Respuesta recibida:', response);

            if (response.ok && response.redirected) {
                console.log('✅ Config SII enviada, redirigiendo a:', response.url);
                window.location.href = response.url;
            } else {
                let result;
                try {
                    result = await response.json();
                    console.error('❌ Error al enviar config SII:', result);
                } catch (jsonError) {
                    console.error('❌ Respuesta no es JSON:', await response.text());
                    throw new Error('Error en la respuesta del servidor');
                }
                document.getElementById('mensajeError').style.display = 'block';
                document.getElementById('mensajeExito').style.display = 'none';
            }
        } catch (error) {
            console.error('❌ Error en fetch config SII:', error);
            document.getElementById('mensajeError').style.display = 'block';
            document.getElementById('mensajeExito').style.display = 'none';
        }
    });
} else {
    console.error('❌ Formulario config-sii-form no encontrado');
}

const apiForm = document.getElementById('config-api-form');
if (apiForm) {
    console.log('✅ Formulario config-api-form encontrado');
    apiForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        console.log('📤 Enviando config API:', Object.fromEntries(formData));

        try {
            const response = await fetch('/configuracion/api', { // Ajustado a la ruta correcta
                method: 'POST',
                body: formData
            });
            console.log('📥 Respuesta recibida:', response);

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    console.log('✅ Config API guardada con éxito');
                    document.getElementById('mensajeExito').style.display = 'block';
                    document.getElementById('mensajeError').style.display = 'none';
                    setTimeout(() => location.reload(), 2000);
                } else {
                    console.error('❌ Error al guardar config API:', result);
                    document.getElementById('mensajeError').style.display = 'block';
                    document.getElementById('mensajeExito').style.display = 'none';
                }
            } else {
                console.error('❌ Respuesta no exitosa:', response.status, response.statusText);
                const text = await response.text();
                console.error('❌ Contenido de la respuesta:', text);
                document.getElementById('mensajeError').style.display = 'block';
                document.getElementById('mensajeExito').style.display = 'none';
            }
        } catch (error) {
            console.error('❌ Error en fetch config API:', error);
            document.getElementById('mensajeError').style.display = 'block';
            document.getElementById('mensajeExito').style.display = 'none';
        }
    });
} else {
    console.error('❌ Formulario config-api-form no encontrado');
}