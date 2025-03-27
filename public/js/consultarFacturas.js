// public/js/consultarFacturas.js
document.getElementById("tipoConsulta").addEventListener("change", function () {
    const tipo = this.value;
    document.getElementById("fecha-container").style.display = tipo === "dia" ? "block" : "none";
    document.getElementById("mes-container").style.display = tipo === "mes" ? "block" : "none";
    if (tipo === "dia") {
        document.getElementById("mes").value = "";
    } else {
        document.getElementById("fecha").value = "";
    }
});

async function fetchConTimeout(url, timeout = 120000) {//esperar 120 segundos para la consulta
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { signal: controller.signal, credentials: 'include' }); // Incluir cookies
        clearTimeout(id);
        return response;
    } catch (error) {
        console.error("🚨 Timeout o error de red:", error);
        throw new Error("La consulta tardó demasiado. Inténtalo de nuevo.");
    }
}

document.getElementById("consulta-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const tipo = document.getElementById("tipoConsulta").value;
    let url = "https://localhost:3000/api/consulta?";

    const params = new URLSearchParams();
    if (tipo === "dia") {
        const fecha = document.getElementById("fecha").value;
        if (!fecha) {
            alert("Por favor, selecciona una fecha.");
            return;
        }
        const [anio, mes, dia] = fecha.split("-");
        params.append("fecha", fecha); // Enviar fecha completa para procesarla en el backend
    } else if (tipo === "mes") {
        const mes = document.getElementById("mes").value;
        if (!mes) {
            alert("Por favor, selecciona un mes.");
            return;
        }
        const [anio, mesNum] = mes.split("-");
        params.append("mes", mesNum);
        params.append("anio", anio);
    } else {
        alert("Por favor, selecciona un tipo de consulta válido.");
        return;
    }

    url += params.toString();
    console.log("📋 URL generada para la consulta:", url);

    document.getElementById("loadingIcon").style.display = "block";
    document.getElementById("mensajeExito").style.display = "none";
    document.getElementById("mensajeError").style.display = "none";
    document.getElementById("resultado").innerHTML = "";
    document.getElementById("progressBar").style.width = "0";

    let progress = 0;
    const timeout = 60000;
    const progressInterval = setInterval(() => {
        progress += 100 / (timeout / 1000);
        if (progress > 100) progress = 100;
        document.getElementById("progressBar").style.width = `${progress}%`;
    }, 1000);

    try {
        const response = await fetchConTimeout(url, timeout);
        const data = await response.json();

        console.log("✅ Respuesta JSON recibida:", data);

        if (response.ok && data.consultaRealizada && data.facturas.length > 0) {
            document.getElementById("mensajeExito").style.display = "block";
            if (data.saveResult.saved) {
                document.getElementById("resultado").innerHTML = `
                    <div class="resultado-mensaje">
                        ✅ Se trajeron y guardaron ${data.saveResult.count} archivos nuevos exitosamente.
                    </div>
                `;
            } else {
                document.getElementById("resultado").innerHTML = `
                    <div class="resultado-mensaje info">
                        ℹ️ Todas las facturas (${data.facturas.length}) ya existen en la base de datos.
                    </div>
                `;
            }
        } else {
            throw new Error(data.error || "No se encontraron facturas.");
        }
    } catch (error) {
        console.error("❌ Error en la consulta:", error);
        console.error("🔍 Detalles del error:", {
            message: error.message,
            stack: error.stack,
            name: error.name,
            response: error.response
        });
        document.getElementById("mensajeError").style.display = "block";
        document.getElementById("resultado").innerHTML = `<p style="color: red;">${error.message}</p>`;
    } finally {
        clearInterval(progressInterval);
        document.getElementById("progressBar").style.width = "100%";
        setTimeout(() => {
            document.getElementById("loadingIcon").style.display = "none";
        }, 500);
    }
});