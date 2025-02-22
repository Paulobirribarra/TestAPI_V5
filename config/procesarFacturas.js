const procesarFacturas = (detalleVentas) => {
    return detalleVentas.map(factura => ({
        folio: factura.folio,
        razonSocial: factura.razonSocial,
        rutCliente: factura.rutCliente,
        tipoDTENumber: factura.tipoDte,
        tipoDTEString: factura.tipoDTEString,
        folioDocReferencia: factura.folioDocReferencia,
        fechaEmision: new Date(factura.fechaEmision),
        estado: factura.estado || 'Pendiente',  
        montoNeto: factura.montoNeto,
        montoIVA: factura.montoIva,
        montoTotal: factura.montoTotal,
        montoIVARecuperable: factura.montoIvaRecuperable,
        idInterno: factura.numeroInterno || '',
        dia: new Date(factura.fechaEmision).getDate(),
        mes: new Date(factura.fechaEmision).getMonth() + 1,
        anio: new Date(factura.fechaEmision).getFullYear(),
        pagada: false,  
        fechaDePago: null,
        metodoDePago: '', 
        comentario: '', 
        numeroDeOperacion: factura.numeroInterno || 0
    }));
};

module.exports = procesarFacturas;
