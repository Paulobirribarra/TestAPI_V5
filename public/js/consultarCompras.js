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

async function fetchConTimeout(url, timeout) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, {
            signal: controller.signal,
            credentials: 'include'
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

document.getElementById("consulta-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const tipoDocumento = document.getElementById("tipoDocumento").value;
    const tipo = document.getElementById("tipoConsulta").value;
    let url = "/api/consultar-compras?";

    const params = new URLSearchParams();
    if (tipo === "dia") {
        const fecha = document.getElementById("fecha").value;
        if (!fecha) {
            alert("Por favor, selecciona una fecha.");
            return;
        }
        params.append("fecha", fecha);
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

        if (response.ok && data.consultaRealizada) {
            document.getElementById("mensajeExito").style.display = "block";
            document.getElementById("resultado").innerHTML = `
                <div class="resultado-mensaje">
                    ✅ Se encontraron ${data.totalCompras} compras.
                </div>
            `;
        } else {
            throw new Error(data.error || "No se encontraron documentos.");
        }
    } catch (error) {
        console.error("❌ Error en la consulta:", error);
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