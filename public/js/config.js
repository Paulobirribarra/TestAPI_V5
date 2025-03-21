document.addEventListener('DOMContentLoaded', () => {
    console.log('📜 Script config.js cargado');

    function togglePassword(fieldId) {
        const input = document.getElementById(fieldId);
        const toggle = document.getElementById(`toggle-${fieldId}`);
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

    function toggleEditMode() {
        const apiUser = document.getElementById('apiUser');
        const apiKey = document.getElementById('apiKey');
        const editBtn = document.getElementById('edit-btn');
        const saveBtn = document.getElementById('save-btn');

        if (apiUser.hasAttribute('readonly')) {
            apiUser.removeAttribute('readonly');
            apiKey.removeAttribute('readonly');
            editBtn.style.display = 'none';
            saveBtn.style.display = 'block';
            console.log('✏️ Modo edición activado');
        } else {
            apiUser.setAttribute('readonly', '');
            apiKey.setAttribute('readonly', '');
            editBtn.style.display = 'block';
            saveBtn.style.display = 'none';
            console.log('🔒 Modo edición desactivado');
        }
    }

    // Asociar eventos a toggles
    const togglePasswordSII = document.getElementById('toggle-passwordSII');
    if (togglePasswordSII) {
        togglePasswordSII.addEventListener('click', () => togglePassword('passwordSII'));
    }

    const toggleApiKey = document.getElementById('toggle-apiKey');
    if (toggleApiKey) {
        toggleApiKey.addEventListener('click', () => togglePassword('apiKey'));
    }

    // Asociar evento a botón de edición
    const editBtn = document.getElementById('edit-btn');
    if (editBtn) {
        editBtn.addEventListener('click', toggleEditMode);
    }

    const siiForm = document.getElementById('config-sii-form');
    if (siiForm) {
        console.log('✅ Formulario config-sii-form encontrado');
        siiForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('🚀 Evento submit disparado para config-sii-form');

            const rutUsuario = document.getElementById('rutUsuario').value;
            const passwordSII = document.getElementById('passwordSII').value;
            const rutEmpresa = document.getElementById('rutEmpresa').value;
            const ambiente = document.getElementById('ambiente').value;
            const detallado = document.getElementById('detallado').value === 'true';

            if (!validaRut(rutUsuario) || !validaRut(rutEmpresa)) {
                alert('Por favor, ingresa RUTs válidos (Ej: 12327554-3)');
                return;
            }

            const passwordRegex = /^[\w@#\$%^&*]{6,20}$/;
            if (!passwordRegex.test(passwordSII)) {
                alert('Contraseña SII inválida. Usa 6-20 caracteres alfanuméricos y @#$%^&*.');
                return;
            }

            const formData = new FormData(e.target);
            console.log('📤 Enviando config SII:', Object.fromEntries(formData));

            try {
                const response = await fetch('/configuracion/sii', {
                    method: 'POST',
                    body: formData
                });
                console.log('📥 Respuesta recibida:', response);

                if (response.ok && response.redirected) {
                    console.log('✅ Config SII enviada, redirigiendo a:', response.url);
                    window.location.href = response.url;
                } else {
                    const result = await response.json();
                    console.error('❌ Error al enviar config SII:', result);
                    document.getElementById('mensajeError').style.display = 'block';
                    document.getElementById('mensajeExito').style.display = 'none';
                }
            } catch (error) {
                console.error('❌ Error en fetch config SII:', error);
                document.getElementById('mensajeError').style.display = 'block';
                document.getElementById('mensajeExito').style.display = 'none';
            }
        });
    }

    const apiForm = document.getElementById('config-api-form');
    if (apiForm) {
        console.log('✅ Formulario config-api-form encontrado');
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => apiForm.requestSubmit());
        }

        apiForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const apiUser = document.getElementById('apiUser').value;
            const apiKey = document.getElementById('apiKey').value;

            const apiRegex = /^[\w-]{3,50}$/;
            if (!apiRegex.test(apiUser) || !apiRegex.test(apiKey)) {
                alert('Usuario API y API Key deben ser 3-50 caracteres alfanuméricos o guiones.');
                return;
            }

            const formData = new FormData(e.target);
            console.log('📤 Enviando config API:', Object.fromEntries(formData));

            try {
                const response = await fetch('/configuracion/api', {
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
                    }
                } else {
                    console.error('❌ Respuesta no exitosa:', response.status, response.statusText);
                }
            } catch (error) {
                console.error('❌ Error en fetch config API:', error);
                document.getElementById('mensajeError').style.display = 'block';
                document.getElementById('mensajeExito').style.display = 'none';
            }
        });
    }
});