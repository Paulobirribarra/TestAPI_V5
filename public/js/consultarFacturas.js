// public/js/consultarFacturas.js
document.getElementById("tipoConsulta").addEventListener("change", function () {
    const tipo = this.value;
    const fechaContainer = document.getElementById("fecha-container");
    const mesContainer = document.getElementById("mes-container");

    if (tipo === "dia") {
        fechaContainer.style.display = "block";
        mesContainer.style.display = "none";
    } else if (tipo === "mes") {
        fechaContainer.style.display = "none";
        mesContainer.style.display = "block";
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
    let url = "https://localhost:3000/api/consulta?";
    const loadingIcon = document.getElementById("loadingIcon");
    const mensajeExito = document.getElementById("mensajeExito");
    const mensajeError = document.getElementById("mensajeError");
    const resultado = document.getElementById("resultado");

    loadingIcon.style.display = "block";
    mensajeExito.style.display = "none";
    mensajeError.style.display = "none";
    resultado.innerHTML = "";

    try {
        if (tipo === "dia") {
            const fecha = document.getElementById("fecha").value;
            if (!fecha) {
                throw new Error("Por favor, selecciona una fecha");
            }
            const [anio, mes, dia] = fecha.split("-");
            url += `tipo=${tipoDocumento}&dia=${dia}&mes=${mes}&anio=${anio}`;
        } else if (tipo === "mes") {
            const mes = document.getElementById("mes").value;
            if (!mes) {
                throw new Error("Por favor, selecciona un mes");
            }
            const [anio, mesNum] = mes.split("-");
            url += `tipo=${tipoDocumento}&mes=${mesNum}&anio=${anio}`;
        } else {
            throw new Error("Por favor, selecciona un tipo de consulta válido");
        }

        console.log("📋 URL generada para la consulta:", url);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (response.ok && data.consultaRealizada) {
            mensajeExito.style.display = "block";
            mensajeExito.textContent = `✅ Consulta realizada con éxito. Se procesaron ${data.documentos.length} documentos.`;
        } else {
            throw new Error(data.error || `No se encontraron ${getTipoDocumentoNombre(tipoDocumento)}`);
        }
    } catch (error) {
        console.error("❌ Error en la consulta:", error);
        mensajeError.style.display = "block";
        mensajeError.textContent = `❌ ${error.message}`;
    } finally {
        loadingIcon.style.display = "none";
    }
});

function getTipoDocumentoNombre(tipo) {
    const tipos = {
        'ventas': 'Factura',
        'compras': 'Compra',
        'notas-credito': 'Nota de Crédito',
        'notas-debito': 'Nota de Débito'
    };
    return tipos[tipo] || 'Documento';
}