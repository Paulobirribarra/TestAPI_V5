const Facturas = require('../models/Facturas');

const getHomePage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 51;
        const skip = (page - 1) * limit;
        const { busqueda, estado, fecha, cliente } = req.query;

        // Filtro base para facturas (tipo 33)
        let query = {
            $or: [
                { tipoDTENumber: 33 },
                { tipoDTE: '33' },
                { ingresadoManualmente: true }
            ]
        };

        // Aplicar filtros
        if (busqueda) {
            const busquedaNum = parseInt(busqueda);
            if (!isNaN(busquedaNum)) {
                // Si es un número, buscar en folio
                query.folio = busquedaNum;
            } else {
                // Si no es un número, buscar en correoContacto y contacto
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

        // Procesar el filtro de fecha (mes/año)
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

        // Excluir facturas anuladas por notas de crédito
        const notasDeCredito = await Facturas.find({ tipoDTENumber: 61 }, { folioDocReferencia: 1 });
        const foliosAnulados = notasDeCredito.map(nc => nc.folioDocReferencia).filter(Boolean);

        if (busqueda && !isNaN(parseInt(busqueda))) {
            query.folio = { $eq: parseInt(busqueda), $nin: foliosAnulados };
        } else {
            query.folio = { $nin: foliosAnulados };
        }

        const facturas = await Facturas.find(query)
            .sort({ fechaEmision: -1 })
            .skip(skip)
            .limit(limit);

        const hoy = new Date();
        facturas.forEach(factura => {
            factura.vencida = !factura.pagada && hoy > factura.fechaVencimiento;
        });

        const totalFacturas = await Facturas.countDocuments(query);
        const totalPages = Math.ceil(totalFacturas / limit);

        // Calcular sumatoria de facturas y notas de crédito para el mes seleccionado
        const filtroMesQuery = filtroMes ? { mes: parseInt(filtroMes) } : {};
        const filtroAnioQuery = filtroAnio ? { anio: parseInt(filtroAnio) } : {};
        const totalFacturasMes = await Facturas.aggregate([
            {
                $match: {
                    $or: [
                        { tipoDTENumber: 33 },
                        { tipoDTE: '33' },
                        { ingresadoManualmente: true }
                    ],
                    ...filtroMesQuery,
                    ...filtroAnioQuery
                }
            },
            { $group: { _id: null, total: { $sum: "$montoTotal" } } }
        ]);
        const totalNotasCreditoMes = await Facturas.aggregate([
            { $match: { tipoDTENumber: 61, ...filtroMesQuery, ...filtroAnioQuery } },
            { $group: { _id: null, total: { $sum: "$montoTotal" } } }
        ]);

        const montoTotalFacturas = totalFacturasMes.length > 0 ? totalFacturasMes[0].total : 0;
        const montoTotalNotasCredito = totalNotasCreditoMes.length > 0 ? totalNotasCreditoMes[0].total : 0;
        const montoNetoMes = montoTotalFacturas - montoTotalNotasCredito;

        // Pasar la variable success a la vista
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
            success: req.session.success || null
        });
        // Limpiar el mensaje de éxito después de renderizar
        req.session.success = null;
    } catch (error) {
        console.error('❌ Error en getHomePage:', error.message);
        res.status(500).json({ error: 'Error al obtener facturas' });
    }
};

module.exports = { getHomePage };