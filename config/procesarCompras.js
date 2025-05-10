// config/procesarCompras.js
const formatFechaChilena = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
};

const procesarCompras = (detalleCompras) => {
    return detalleCompras.map(compra => {
        // Determinar si el documento es una nota de crédito
        const esNotaDeCredito = compra.tipoDTE === 61;

        // Extraer mes, año y período de fechaEmision
        const fechaEm = new Date(compra.fechaEmision);
        const mes = fechaEm.getMonth() + 1;
        const anio = fechaEm.getFullYear();
        const periodo = `${anio}${mes.toString().padStart(2, '0')}`;

        return {
            // Campos de caratula
            rutEmpresa: compra.rutEmpresa,
            nombreMes: compra.nombreMes,
            mes: mes,
            anio: anio,
            dia: fechaEm.getDate(),
            periodo: periodo,

            // Campos de detalle de compra
            tipoDTEString: compra.tipoDTEString,
            tipoDTE: compra.tipoDTE,
            tipoCompra: compra.tipoCompra,
            rutProveedor: compra.rutProveedor,
            razonSocial: compra.razonSocial,
            folio: compra.folio,
            fechaEmision: formatFechaChilena(compra.fechaEmision),
            fechaRecepcion: compra.fechaRecepcion ? formatFechaChilena(compra.fechaRecepcion) : '',
            acuseRecibo: compra.acuseRecibo,
            montoExento: compra.montoExento || 0,
            montoNeto: compra.montoNeto || 0,
            montoIvaRecuperable: compra.montoIvaRecuperable || 0,
            montoIvaNoRecuperable: compra.montoIvaNoRecuperable || 0,
            codigoIvaNoRecuperable: compra.codigoIvaNoRecuperable || 0,
            montoTotal: compra.montoTotal || 0,
            montoNetoActivoFijo: compra.montoNetoActivoFijo || 0,
            ivaActivoFijo: compra.ivaActivoFijo || 0,
            ivaUsoComun: compra.ivaUsoComun || 0,
            impuestoSinDerechoCredito: compra.impuestoSinDerechoCredito || 0,
            ivaNoRetenido: compra.ivaNoRetenido || 0,
            tabacosPuros: compra.tabacosPuros || 0,
            tabacosCigarrillos: compra.tabacosCigarrillos || 0,
            tabacosElaborados: compra.tabacosElaborados || 0,
            nceNdeFacturaCompra: compra.nceNdeFacturaCompra || 0,
            valorOtroImpuesto: compra.valorOtroImpuesto || '',
            tasaOtroImpuesto: compra.tasaOtroImpuesto || '',
            codigoOtroImpuesto: compra.codigoOtroImpuesto || 0,
            estado: compra.estado,
            fechaAcuse: compra.fechaAcuse ? formatFechaChilena(compra.fechaAcuse) : '',
            otrosImpuestos: compra.otrosImpuestos || [],

            // Campos adicionales para control interno
            pagada: false,
            metodoDePago: '',
            comentario: '',
            fechaModificacion: new Date(),
            modificadoPor: 'SISTEMA'
        };
    });
};

module.exports = procesarCompras; 