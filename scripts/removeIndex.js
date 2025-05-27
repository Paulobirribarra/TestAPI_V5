const mongoose = require('mongoose');
require('dotenv').config();

async function removeIndex() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/facturasDB');
        console.log('🟢 Conectado a MongoDB');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        
        for (const collection of collections) {
            if (collection.name === 'compras') {
                console.log('📦 Encontrada colección compras');
                const indexes = await db.collection('compras').indexes();
                console.log('📦 Índices actuales:', indexes);
                
                // Eliminar el índice de numero
                await db.collection('compras').dropIndex('numero_1');
                console.log('✅ Índice numero_1 eliminado');
                
                // Crear nuevo índice compuesto
                await db.collection('compras').createIndex(
                    { folio: 1, tipoDocumento: 1 },
                    { unique: true }
                );
                console.log('✅ Nuevo índice compuesto creado');
                
                // Verificar índices finales
                const finalIndexes = await db.collection('compras').indexes();
                console.log('📦 Índices finales:', finalIndexes);
            }
        }

        await mongoose.disconnect();
        console.log('🔴 Desconectado de MongoDB');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

removeIndex(); 