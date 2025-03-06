//scripts/updateFacturas.js
const mongoose = require('mongoose');
const Facturas = require('../models/Facturas');
require('dotenv').config({ path: '.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/facturasDB';

async function updateFacturas() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        // Encontrar todas las facturas sin fechaVencimiento
        const facturas = await Facturas.find({ fechaVencimiento: { $exists: false } });

        if (facturas.length === 0) {
            console.log('ℹ️ No hay facturas que necesiten actualización.');
            return;
        }

        // Actualizar cada factura
        for (const factura of facturas) {
            const fechaVencimiento = new Date(factura.fechaEmision);
            fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

            await Facturas.updateOne(
                { _id: factura._id },
                { $set: { fechaVencimiento: fechaVencimiento } }
            );
            console.log(`✅ Actualizada factura con folio ${factura.folio}`);
        }

        console.log(`✅ Se actualizaron ${facturas.length} facturas.`);
    } catch (error) {
        console.error('❌ Error al actualizar facturas:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Conexión a MongoDB cerrada.');
    }
}

updateFacturas();