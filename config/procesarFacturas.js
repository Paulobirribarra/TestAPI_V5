const procesarFacturas = (detalleVentas) => {
    return detalleVentas.map(factura => {
        const pagada = (factura.tipoDocReferencia === 48);
        const fechaEmision = new Date(factura.fechaEmision);
        const fechaVencimiento = new Date(fechaEmision);
        fechaVencimiento.setDate(fechaEmision.getDate() + 30); // Sumar 30 días

        return {
            folio: factura.folio,
            razonSocial: factura.razonSocial,
            rutCliente: factura.rutCliente,
            tipoDTENumber: factura.tipoDte,
            tipoDTEString: factura.tipoDTEString,
            folioDocReferencia: factura.folioDocReferencia,
            fechaEmision: fechaEmision,
            estado: pagada ? 'Pagada' : 'Pendiente',
            montoNeto: factura.montoNeto,
            montoIVA: factura.montoIva,
            montoTotal: factura.montoTotal,
            montoIVARecuperable: factura.montoIvaRecuperable,
            idInterno: factura.numeroInterno || '',
            dia: fechaEmision.getDate(),
            mes: fechaEmision.getMonth() + 1,
            anio: fechaEmision.getFullYear(),
            pagada: pagada,
            metodoDePago: pagada ? 'contado' : '',
            comentario: '',
            numeroDeOperacion: pagada ? factura.folioDocReferencia : '',
            fechaVencimiento: fechaVencimiento, // Nuevo campo calculado
            contacto: '', // Vacío por defecto
            correoContacto: '', // Vacío por defecto
            sector: '' // Vacío por defecto
        };
    });
};

module.exports = procesarFacturas;