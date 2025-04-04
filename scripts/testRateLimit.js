const axios = require('axios');
const https = require('https');
const qs = require('querystring');

// Configuración para ignorar certificados SSL en desarrollo
const agent = new https.Agent({
    rejectUnauthorized: false
});

// Función para probar el rate limit
async function testRateLimit() {
    try {
        console.log('Iniciando prueba de rate limit...');

        // URL del endpoint de login
        const url = 'https://localhost:3000/auth/login';

        // Datos de prueba (credenciales incorrectas)
        const data = qs.stringify({
            email: 'test@test.com',
            password: 'wrongpassword'
        });

        // Realizar 6 intentos (el límite es 5)
        for (let i = 1; i <= 6; i++) {
            console.log(`\nIntento ${i} de 6...`);

            try {
                const response = await axios.post(url, data, {
                    httpsAgent: agent,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });

                console.log('Status:', response.status);
                console.log('Headers:', response.headers);

            } catch (error) {
                if (error.response) {
                    console.log('Status:', error.response.status);
                    console.log('Headers:', error.response.headers);

                    // Verificar si es un error de rate limit
                    if (error.response.status === 429) {
                        console.log('✅ Rate limit alcanzado!');
                        console.log('Tiempo de espera:', error.response.headers['x-ratelimit-reset']);
                        break;
                    }
                } else {
                    console.error('Error:', error.message);
                }
            }

            // Esperar 1 segundo entre intentos
            if (i < 6) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

    } catch (error) {
        console.error('Error en la prueba:', error.message);
    }
}

// Ejecutar la prueba
testRateLimit(); 