const procesarFacturas = (detalleVentas) => {
    return detalleVentas.map(factura => {
        const pagada = (factura.tipoDocReferencia === 48);
        return {
            folio: factura.folio,
            razonSocial: factura.razonSocial,
            rutCliente: factura.rutCliente,
            tipoDTENumber: factura.tipoDte,
            tipoDTEString: factura.tipoDTEString,
            folioDocReferencia: factura.folioDocReferencia,
            fechaEmision: new Date(factura.fechaEmision),
            estado: pagada ? 'Pagada' : 'Pendiente', // Estado automático
            montoNeto: factura.montoNeto,
            montoIVA: factura.montoIva,
            montoTotal: factura.montoTotal,
            montoIVARecuperable: factura.montoIvaRecuperable,
            idInterno: factura.numeroInterno || '',
            dia: new Date(factura.fechaEmision).getDate(),
            mes: new Date(factura.fechaEmision).getMonth() + 1,
            anio: new Date(factura.fechaEmision).getFullYear(),
            pagada: pagada, // Campo booleano para indicar si está pagada
            metodoDePago: pagada ? 'contado' : '', // Opcional, ajusta según necesites
            comentario: '',
            numeroDeOperacion: pagada ? factura.folioDocReferencia : ''
        };
    });
};

module.exports = procesarFacturas;