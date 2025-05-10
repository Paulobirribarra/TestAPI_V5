$(document).ready(function () {
    $('#consultaForm').on('submit', function (e) {
        e.preventDefault();

        const fecha = $('#fecha').val();
        const mes = $('#mes').val();
        const anio = $('#anio').val();

        if (!fecha && (!mes || !anio)) {
            alert('Por favor, seleccione una fecha específica o mes y año');
            return;
        }

        $.ajax({
            url: '/api/compras',
            method: 'GET',
            data: { fecha, mes, anio },
            success: function (response) {
                if (response.consultaRealizada) {
                    mostrarResultados(response);
                } else {
                    alert('Error en la consulta: ' + response.error);
                }
            },
            error: function (xhr) {
                alert('Error en la consulta: ' + xhr.responseJSON?.error || 'Error desconocido');
            }
        });
    });

    function mostrarResultados(data) {
        $('#resultados').show();
        $('#totalDocumentos').text(data.totalCompras);

        let totalFacturas = 0;
        let totalNotasCredito = 0;

        const tbody = $('#tablaResultados');
        tbody.empty();

        data.compras.forEach(compra => {
            const row = $('<tr>');
            row.append(`<td>${compra.folio}</td>`);
            row.append(`<td>${compra.tipoDTE === 33 ? 'Factura' : 'Nota Crédito'}</td>`);
            row.append(`<td>${compra.fecha}</td>`);
            row.append(`<td>${compra.rutEmisor}</td>`);
            row.append(`<td>${compra.razonSocialEmisor}</td>`);
            row.append(`<td>${compra.montoNeto.toLocaleString('es-CL')}</td>`);
            row.append(`<td>${compra.iva.toLocaleString('es-CL')}</td>`);
            row.append(`<td>${compra.montoTotal.toLocaleString('es-CL')}</td>`);

            if (compra.tipoDTE === 33) {
                totalFacturas += compra.montoTotal;
            } else if (compra.tipoDTE === 61) {
                totalNotasCredito += compra.montoTotal;
            }

            tbody.append(row);
        });

        $('#totalFacturas').text(totalFacturas.toLocaleString('es-CL'));
        $('#totalNotasCredito').text(totalNotasCredito.toLocaleString('es-CL'));
    }
}); 