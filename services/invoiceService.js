// services/invoiceService.js
const Facturas = require('../models/Facturas');

const saveInvoices = async (facturas) => {
    await Facturas.insertMany(facturas);
    console.log(`💾 Facturas guardadas: ${facturas.length}`);
};

const updatePaidInvoices = async () => {
    const facturas = await Facturas.find({ tipoDocReferencia: 48, pagada: false });
    for (const factura of facturas) {
        await Facturas.updateOne(
            { _id: factura._id },
            {
                pagada: true,
                estado: 'Pagada',
                metodoDePago: 'contado',
                pagadaAutomaticamente: true,
                numeroDeOperacion: factura.folioDocReferencia,
            }
        );
    }
    return facturas.length;
};

module.exports = { saveInvoices, updatePaidInvoices };