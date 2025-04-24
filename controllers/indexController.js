//controllers/indexController.ejs
const Facturas = require('../models/Facturas');

const getHomePage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 51;
        const skip = (page - 1) * limit;
        const { busqueda, estado, fecha, cliente } = req.query;

        // Filtro base para facturas (tipo 33)
        let query = { tipoDTENumber: 33 };

        // Aplicar filtros
        if (busqueda) {
            const busquedaNum = parseInt(busqueda);
            if (!isNaN(busquedaNum)) {
                query.folio = busquedaNum;
            } else {
                query.$or = [
                    { correoContacto: { $regex: new RegExp(busqueda, 'i') } },
                    { contacto: { $regex: new RegExp(busqueda, 'i') } }
                ];
            }
        }

        if (estado === 'pagada') {
            query.pagada = true;
        } else if (estado === 'pendiente') {
            query.pagada = false;
        }

        let filtroMes = '';
        let filtroAnio = '';
        if (fecha) {
            const [anio, mes] = fecha.split('-');
            const mesNum = parseInt(mes);
            const anioNum = parseInt(anio);
            if (!isNaN(mesNum) && mesNum >= 1 && mesNum <= 12) {
                query.mes = mesNum;
                filtroMes = mesNum;
            }
            if (!isNaN(anioNum) && anioNum >= 2020 && anioNum <= 2025) {
                query.anio = anioNum;
                filtroAnio = anioNum;
            }
        }

        if (cliente) {
            query.$or = [
                { rutCliente: { $regex: new RegExp(cliente.replace(/[\.\-]/g, ''), 'i') } },
                { razonSocial: { $regex: new RegExp(cliente, 'i') } }
            ];
        }

        const notasDeCredito = await Facturas.find({ tipoDTENumber: 61 }, { folioDocReferencia: 1 });
        const foliosAnulados = notasDeCredito.map(nc => nc.folioDocReferencia).filter(Boolean);

        if (busqueda && !isNaN(parseInt(busqueda))) {
            query.folio = { $eq: parseInt(busqueda), $nin: foliosAnulados };
        } else {
            query.folio = { $nin: foliosAnulados };
        }

        const facturas = await Facturas.find(query)
            .sort({ folio: -1 }) // Ordenar por folio en orden ascendente
            .skip(skip)
            .limit(limit);

        const hoy = new Date();
        facturas.forEach(factura => {
            factura.vencida = !factura.pagada && hoy > factura.fechaVencimiento;
        });

        const totalFacturas = await Facturas.countDocuments(query);
        const totalPages = Math.ceil(totalFacturas / limit);

        const filtroMesQuery = filtroMes ? { mes: parseInt(filtroMes) } : {};
        const filtroAnioQuery = filtroAnio ? { anio: parseInt(filtroAnio) } : {};
        const totalFacturasMes = await Facturas.aggregate([
            { $match: { tipoDTENumber: 33, ...filtroMesQuery, ...filtroAnioQuery } },
            { $group: { _id: null, total: { $sum: "$montoTotal" } } }
        ]);
        const totalNotasCreditoMes = await Facturas.aggregate([
            { $match: { tipoDTENumber: 61, ...filtroMesQuery, ...filtroAnioQuery } },
            { $group: { _id: null, total: { $sum: "$montoTotal" } } }
        ]);

        const montoTotalFacturas = totalFacturasMes.length > 0 ? totalFacturasMes[0].total : 0;
        const montoTotalNotasCredito = totalNotasCreditoMes.length > 0 ? totalNotasCreditoMes[0].total : 0;
        const montoNetoMes = montoTotalFacturas - montoTotalNotasCredito;

        // Guardar el mensaje de éxito en una variable temporal y limpiarlo inmediatamente
        const successMessage = req.session.success || null;
        req.session.success = null;
        req.session.error = null;

        res.render('index', {
            facturas,
            currentPage: page,
            totalPages,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            filtroBusqueda: busqueda || '',
            filtroCliente: cliente || '',
            filtroEstado: estado || '',
            filtroFecha: fecha || '',
            montoTotalFacturas,
            montoTotalNotasCredito,
            montoNetoMes,
            success: successMessage,
            user: req.user
        });
    } catch (error) {
        console.error('❌ Error en getHomePage:', error.message);
        res.status(500).json({ error: 'Error al obtener facturas' });
    }
};

const getAgregarFactura = async (req, res) => {
    // Obtener el último folio para sugerir el siguiente
    const ultimaFactura = await Facturas.findOne({ tipoDTENumber: 33 })
        .sort({ folio: -1 })
        .select('folio');
    const siguienteFolio = ultimaFactura ? ultimaFactura.folio + 1 : 1;

    // Guardar el mensaje de error en una variable temporal y limpiarlo
    const errorMessage = req.session.error || null;
    req.session.error = null;

    res.render('agregarFactura', {
        title: 'Agregar Factura Manual',
        error: errorMessage,
        user: req.user,
        siguienteFolio
    });
};

const postAgregarFactura = async (req, res) => {
    try {
        const { folio, razonSocial, rutCliente, fechaEmision, fechaVencimiento, montoTotal, estado, contacto, correoContacto } = req.body;

        // Validar folio
        const folioNum = parseInt(folio);
        if (isNaN(folioNum) || folioNum <= 0) {
            throw new Error('El folio debe ser un número positivo mayor a 0.');
        }
        const folioExistente = await Facturas.findOne({ folio: folioNum, tipoDTENumber: 33 });
        if (folioExistente) {
            throw new Error('El folio ya existe. Por favor, usa un folio diferente.');
        }

        // Validar montoTotal
        const montoTotalNum = parseFloat(montoTotal);
        if (isNaN(montoTotalNum) || montoTotalNum <= 0) {
            throw new Error('El monto total debe ser un número positivo mayor a 0.');
        }

        // Calcular montoNeto y montoIVA (asumiendo IVA 19%)
        const montoIVA = Math.round(montoTotalNum * 0.19);
        const montoNeto = Math.round(montoTotalNum - montoIVA);

        // Extraer mes, año y período de fechaEmision
        const fechaEm = new Date(fechaEmision);
        const mes = fechaEm.getMonth() + 1;
        const anio = fechaEm.getFullYear();
        const periodo = `${anio}-${mes.toString().padStart(2, '0')}`;

        const nuevaFactura = new Facturas({
            folio: folioNum,
            razonSocial,
            rutCliente,
            tipoDTENumber: 33,
            tipoDTEString: 'Factura Electrónica',
            fechaEmision: fechaEm,
            fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
            montoNeto,
            montoIVA,
            montoTotal: montoTotalNum,
            estado,
            pagada: estado === 'Pagada',
            contacto: contacto || '',
            correoContacto: correoContacto || '',
            mes,
            anio,
            periodo,
            fechaModificacion: new Date(),
            modificadoPor: req.user.username
        });

        await nuevaFactura.save();
        req.session.success = 'Factura agregada exitosamente';
        res.redirect('/');
    } catch (error) {
        console.error('❌ Error al agregar factura:', error.message);
        req.session.error = 'Error al agregar factura: ' + error.message;
        res.redirect('/agregarFactura');
    }
};

module.exports = { getHomePage, getAgregarFactura, postAgregarFactura };