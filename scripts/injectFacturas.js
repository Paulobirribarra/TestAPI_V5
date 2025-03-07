// scripts/injectFacturas.js
const mongoose = require('mongoose');
const Facturas = require('../models/Facturas');
require('dotenv').config({ path: '.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/facturasDB';

async function injectFacturas() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        // Datos simulados de facturas
        const facturasSimuladas = [
            // Julio 2024 - Facturas (tipo 33)
            {
                folio: 1001,
                razonSocial: 'Cliente A',
                rutCliente: '12.345.678-9',
                tipoDTENumber: 33,
                tipoDTEString: 'Factura Electrónica',
                fechaEmision: new Date('2024-07-01'),
                estado: 'Pendiente',
                montoNeto: 840000,
                montoIVA: 159600,
                montoTotal: 999600,
                dia: 1,
                mes: 7,
                anio: 2024,
                pagada: false,
                fechaVencimiento: new Date('2024-07-31'),
                periodo: '202407'
            },
            {
                folio: 1002,
                razonSocial: 'Cliente B',
                rutCliente: '98.765.432-1',
                tipoDTENumber: 33,
                tipoDTEString: 'Factura Electrónica',
                fechaEmision: new Date('2024-07-15'),
                estado: 'Pagada',
                montoNeto: 420000,
                montoIVA: 79800,
                montoTotal: 499800,
                dia: 15,
                mes: 7,
                anio: 2024,
                pagada: true,
                metodoDePago: 'contado',
                numeroDeOperacion: '2001',
                fechaVencimiento: new Date('2024-08-14'),
                periodo: '202407'
            },
            // Julio 2024 - Nota de Crédito (tipo 61)
            {
                folio: 2001,
                razonSocial: 'Cliente A',
                rutCliente: '12.345.678-9',
                tipoDTENumber: 61,
                tipoDTEString: 'Nota de Crédito Electrónica',
                folioDocReferencia: '1001',
                fechaEmision: new Date('2024-07-20'),
                estado: 'Pagada',
                montoNeto: 100000,
                montoIVA: 19000,
                montoTotal: 119000,
                dia: 20,
                mes: 7,
                anio: 2024,
                pagada: true,
                fechaVencimiento: new Date('2024-08-19'),
                periodo: '202407'
            },
            // Agosto 2024 - Facturas (tipo 33)
            {
                folio: 1003,
                razonSocial: 'Cliente C',
                rutCliente: '56.789.123-4',
                tipoDTENumber: 33,
                tipoDTEString: 'Factura Electrónica',
                fechaEmision: new Date('2024-08-05'),
                estado: 'Pendiente',
                montoNeto: 1260000,
                montoIVA: 239400,
                montoTotal: 1499400,
                dia: 5,
                mes: 8,
                anio: 2024,
                pagada: false,
                fechaVencimiento: new Date('2024-09-04'),
                periodo: '202408'
            },
            // Marzo 2025 - Facturas (tipo 33)
            {
                folio: 1004,
                razonSocial: 'Cliente D',
                rutCliente: '23.456.789-0',
                tipoDTENumber: 33,
                tipoDTEString: 'Factura Electrónica',
                fechaEmision: new Date('2025-03-10'),
                estado: 'Pendiente',
                montoNeto: 500000,
                montoIVA: 95000,
                montoTotal: 595000,
                dia: 10,
                mes: 3,
                anio: 2025,
                pagada: false,
                fechaVencimiento: new Date('2025-04-09'),
                periodo: '202503'
            },
            // Marzo 2025 - Nota de Crédito (tipo 61)
            {
                folio: 2002,
                razonSocial: 'Cliente D',
                rutCliente: '23.456.789-0',
                tipoDTENumber: 61,
                tipoDTEString: 'Nota de Crédito Electrónica',
                folioDocReferencia: '1004',
                fechaEmision: new Date('2025-03-15'),
                estado: 'Pagada',
                montoNeto: 50000,
                montoIVA: 9500,
                montoTotal: 59500,
                dia: 15,
                mes: 3,
                anio: 2025,
                pagada: true,
                fechaVencimiento: new Date('2025-04-14'),
                periodo: '202503'
            }
        ];

        // Verificar si ya existen facturas con esos folios y tipos
        const existingFolios = await Facturas.find({
            folio: { $in: facturasSimuladas.map(f => f.folio) },
            tipoDTENumber: { $in: facturasSimuladas.map(f => f.tipoDTENumber) }
        }, { folio: 1, tipoDTENumber: 1 });

        const existingMap = new Map();
        existingFolios.forEach(f => {
            existingMap.set(`${f.folio}-${f.tipoDTENumber}`, true);
        });

        // Filtrar facturas nuevas
        const newFacturas = facturasSimuladas.filter(f => !existingMap.has(`${f.folio}-${f.tipoDTENumber}`));

        if (newFacturas.length === 0) {
            console.log('ℹ️ Todas las facturas simuladas ya existen en la base de datos.');
            return;
        }

        // Insertar las facturas nuevas
        await Facturas.insertMany(newFacturas);
        console.log(`✅ Se insertaron ${newFacturas.length} facturas simuladas.`);

        // Opcional: Actualizar ResumenMensual después de la inserción
        const invoiceService = require('../services/invoiceService');
        await invoiceService.updateResumenMensual();
        console.log('✅ ResumenMensual actualizado con las nuevas facturas.');
    } catch (error) {
        console.error('❌ Error al inyectar facturas:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Conexión a MongoDB cerrada.');
    }
}

injectFacturas();