// scripts/simulateInvoices.js
const mongoose = require('mongoose');
const Facturas = require('../models/Facturas');
const invoiceService = require('../services/invoiceService');
require('dotenv').config({ path: '.env' });

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('✅ Conectado a MongoDB para simulación'))
    .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

const generateFakeInvoice = (folio, tipoDTENumber) => ({
    folio,
    tipoDTENumber,
    razonSocial: `Cliente Ficticio ${folio}`,
    rutCliente: `12.345.678-${folio % 10}`,
    fechaEmision: new Date('2024-04-15'),
    montoTotal: Math.floor(Math.random() * 1000000) + 1000,
    estado: 'Emitido',
    periodo: '202404',
    createdAt: new Date(),
    updatedAt: new Date(),
});

const simulateInvoices = async (count = 10) => {
    try {
        // Generar un array de facturas ficticias
        const fakeInvoices = [];
        for (let i = 1; i <= count; i++) {
            fakeInvoices.push(generateFakeInvoice(i, 33)); // TipoDTE 33 es factura electrónica
        }
        console.log(`📋 Generando ${count} facturas ficticias para el mes 04/2024`);

        // Guardar las facturas usando la lógica de saveInvoices
        const saveResult = await invoiceService.saveInvoices(fakeInvoices);
        console.log(saveResult.message);
        console.log(saveResult.data)

        // Verificar el número total de facturas en la base de datos para el periodo
        const totalFacturas = await Facturas.countDocuments({ periodo: '202404' });
        console.log(`📊 Total de facturas en la base de datos para 04/2024: ${totalFacturas}`);
    } catch (error) {
        console.error('❌ Error en la simulación:', error.message);
    } finally {
        mongoose.connection.close();
        console.log('🔚 Conexión a MongoDB cerrada');
    }
};

// Ejecutar la simulación
simulateInvoices(10); // Genera 10 facturas ficticias por defecto