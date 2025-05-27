const procesarCompras = (compras) => {
    console.log('📦 Iniciando procesamiento de compras...');
    console.log('📦 Total de compras a procesar:', compras.length);

    return compras.map(compra => {
        console.log('📦 Procesando compra:', JSON.stringify(compra, null, 2));

        return {
            // Datos básicos
            tipoDocumento: compra.tipoDocumento,
            tipoDTEString: compra.tipoDTEString,
            tipoDTE: compra.tipoDTE,
            tipoCompra: compra.tipoCompra,
            folio: compra.folio,
            fechaEmision: new Date(compra.fechaEmision),
            fechaRecepcion: compra.fechaRecepcion ? new Date(compra.fechaRecepcion) : null,
            fechaAcuse: compra.fechaAcuse ? new Date(compra.fechaAcuse) : null,
            
            // Datos del proveedor
            rutProveedor: compra.rutProveedor,
            razonSocial: compra.razonSocial,
            
            // Montos
            montoExento: parseFloat(compra.montoExento || 0),
            montoNeto: parseFloat(compra.montoNeto || 0),
            montoIvaRecuperable: parseFloat(compra.montoIvaRecuperable || 0),
            montoIvaNoRecuperable: parseFloat(compra.montoIvaNoRecuperable || 0),
            codigoIvaNoRecuperable: parseFloat(compra.codigoIvaNoRecuperable || 0),
            montoTotal: parseFloat(compra.montoTotal || 0),
            montoNetoActivoFijo: parseFloat(compra.montoNetoActivoFijo || 0),
            ivaActivoFijo: parseFloat(compra.ivaActivoFijo || 0),
            ivaUsoComun: parseFloat(compra.ivaUsoComun || 0),
            impuestoSinDerechoCredito: parseFloat(compra.impuestoSinDerechoCredito || 0),
            ivaNoRetenido: parseFloat(compra.ivaNoRetenido || 0),
            
            // Impuestos específicos
            tabacosPuros: parseFloat(compra.tabacosPuros || 0),
            tabacosCigarrillos: parseFloat(compra.tabacosCigarrillos || 0),
            tabacosElaborados: parseFloat(compra.tabacosElaborados || 0),
            nceNdeFacturaCompra: parseFloat(compra.nceNdeFacturaCompra || 0),
            valorOtroImpuesto: compra.valorOtroImpuesto,
            tasaOtroImpuesto: compra.tasaOtroImpuesto,
            codigoOtroImpuesto: parseFloat(compra.codigoOtroImpuesto || 0),
            
            // Estado y fechas
            estado: compra.estado,
            acuseRecibo: compra.acuseRecibo
        };
    });
};

module.exports = procesarCompras; 