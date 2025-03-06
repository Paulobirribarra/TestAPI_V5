// config/procesarFacturas.js
const procesarFacturas = (detalleVentas) => {
    return detalleVentas.map(factura => {
        const pagada = (factura.tipoDocReferencia === 48);
        const fechaEmision = new Date(factura.fechaEmision);
        const fechaVencimiento = new Date(fechaEmision);
        fechaVencimiento.setDate(fechaEmision.getDate() + 30); // Sumar 30 días

        // Calcular periodo (YYYYMM)
        const anio = fechaEmision.getFullYear();
        const mes = String(fechaEmision.getMonth() + 1).padStart(2, '0'); // Mes con dos dígitos
        const periodo = `${anio}${mes}`;

        return {
            folio: factura.folio,
            razonSocial: factura.razonSocial,
            rutCliente: factura.rutCliente,
            tipoDTENumber: factura.tipoDte,
            tipoDTEString: factura.tipoDTEString,
            folioDocReferencia: factura.folioDocReferencia || '',
            fechaEmision: fechaEmision,
            estado: factura.estado || (pagada ? 'Pagada' : 'Pendiente'),
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
            fechaVencimiento: fechaVencimiento,
            contacto: '',
            correoContacto: '',
            sector: '',
            tipoVenta: factura.tipoVenta || '',
            fechaRecepcion: factura.fechaRecepcion ? new Date(factura.fechaRecepcion) : null,
            montoExento: factura.montoExento || 0,
            tipoDocReferencia: factura.tipoDocReferencia || 0,
            codigoOtroImpuesto: factura.codigoOtroImpuesto || 0,
            totalOtrosImpuestos: factura.totalOtrosImpuestos || 0,
            ivaRetenidoTotal: factura.ivaRetenidoTotal || 0,
            ivaRetenidoParcial: factura.ivaRetenidoParcial || 0,
            ivaNoRetenido: factura.ivaNoRetenido || 0,
            ivaPropio: factura.ivaPropio || 0,
            ivaTerceros: factura.ivaTerceros || 0,
            rutEmisorLiqFactura: factura.rutEmisorLiqFactura || '-',
            netoComisionLiqFactura: factura.netoComisionLiqFactura || 0,
            exentoComisionLiqFactura: factura.exentoComisionLiqFactura || 0,
            ivaComisionLiqFactura: factura.ivaComisionLiqFactura || 0,
            ivaFueraPlazo: factura.ivaFueraPlazo || 0,
            creditoEmpresaConstructora: factura.creditoEmpresaConstructora || 0,
            garantiaDepEnvases: factura.garantiaDepEnvases || 0,
            numeroInterno: factura.numeroInterno || '',
            nceNdeFacturaCompra: factura.nceNdeFacturaCompra || '',
            montoNoFacturable: factura.montoNoFacturable || 0,
            indicadorVentaSinCosto: factura.indicadorVentaSinCosto || 0,
            indicadorServicioPeriodico: factura.indicadorServicioPeriodico || 0,
            periodo: periodo, // Campo calculado añadido
        };
    });
};

module.exports = procesarFacturas;