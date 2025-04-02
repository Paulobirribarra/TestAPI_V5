const Facturas = require('../models/Facturas');

// Mostrar formulario para agregar factura
exports.showAddFactura = async (req, res) => {
    try {
        res.render('facturas/add', {
            title: 'Agregar Factura',
            error: null,
            success: null,
            formData: {} // Agregamos formData vacío por defecto
        });
    } catch (error) {
        console.error('Error al mostrar formulario:', error);
        res.status(500).render('error', { error: 'Error interno del servidor' });
    }
};

// Procesar agregar factura
exports.addFactura = async (req, res) => {
    try {
        const {
            tipoDTE,
            folio,
            fechaEmision,
            fechaRecepcion,
            rutCliente,
            razonSocial,
            montoNeto,
            montoIva,
            montoTotal,
            estado
        } = req.body;

        // Validar que el folio no exista
        const facturaExistente = await Facturas.findOne({ folio });
        if (facturaExistente) {
            return res.render('facturas/add', {
                title: 'Agregar Factura',
                error: 'El folio ya existe en la base de datos',
                success: null,
                formData: req.body // Mantener los datos del formulario
            });
        }

        // Crear el periodo a partir de la fecha de emisión
        const fecha = new Date(fechaEmision);
        const periodo = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;

        // Crear nueva factura
        const nuevaFactura = new Facturas({
            tipoDTE,
            tipoDTENumber: 33, // Asignar el tipo 33 para factura electrónica
            folio,
            fechaEmision,
            fechaRecepcion,
            rutCliente,
            razonSocial,
            montoNeto,
            montoIva,
            montoTotal,
            estado: estado || 'Pendiente',
            ingresadoManualmente: true, // Marcar como ingresado manualmente
            periodo, // Agregar el campo periodo requerido
            pagada: estado === 'Pagada' // Establecer el estado de pago
        });

        await nuevaFactura.save();

        res.render('facturas/add', {
            title: 'Agregar Factura',
            error: null,
            success: 'Factura agregada exitosamente',
            formData: {} // Limpiar el formulario
        });

    } catch (error) {
        console.error('Error al agregar factura:', error);
        res.render('facturas/add', {
            title: 'Agregar Factura',
            error: 'Error al agregar la factura',
            success: null,
            formData: req.body // Mantener los datos del formulario
        });
    }
};

// Función para sincronizar con datos de la API
exports.syncWithAPI = async (apiData, folio) => {
    try {
        const facturaExistente = await Facturas.findOne({ folio });
        if (!facturaExistente) return null;

        // Si la factura fue ingresada manualmente, actualizar solo campos no críticos
        if (facturaExistente.ingresadoManualmente) {
            const camposActualizables = {
                fechaRecepcion: apiData.fechaRecepcion,
                montoNeto: apiData.montoNeto,
                montoIva: apiData.montoIva,
                montoTotal: apiData.montoTotal
            };

            // Actualizar solo si los valores son diferentes
            for (const [campo, valor] of Object.entries(camposActualizables)) {
                if (facturaExistente[campo] !== valor) {
                    facturaExistente[campo] = valor;
                }
            }

            await facturaExistente.save();
            return facturaExistente;
        }

        return null;
    } catch (error) {
        console.error('Error en sincronización:', error);
        return null;
    }
}; 