module.exports = (db) => {
    const Usuario = db.usuario;
    const TipoCancha = db.tipoCancha;
    const Cancha = db.cancha;
    const Horario = db.horario;
    const Reserva = db.reserva;
    const Resena = db.resena;
    const hoy = () => new Date().toISOString().slice(0, 10);
    const normalizarHora = (hora) => (hora || '').slice(0, 5);

    return {
        adminHome: async (req, res) => {
            try {
                if (!req.session.usuario || req.session.usuario.rol !== 'admin') {
                    return res.redirect('/login');
                }

                const usuarios = await Usuario.count();
                const canchas = await Cancha.count();
                const reservas = await Reserva.count();

                res.render('admin/dashboard', {
                    resumen: { usuarios, canchas, reservas }
                });
            } catch (error) {
                res.status(500).render('error', {
                    titulo: 'Error en panel admin',
                    mensaje: error.message
                });
            }
        },

        listTipos: async (req, res) => {
            const tipos = await TipoCancha.findAll({ order: [['nombre', 'ASC']] });
            res.render('admin/tipos-list', { tipos });
        },

        newTipoForm: (req, res) => {
            res.render('admin/tipo-form', { tipo: null });
        },

        createTipo: async (req, res) => {
            const nombre = (req.body.nombre || '').trim();

            if (!nombre) {
                req.session.flash = { type: 'warning', message: 'El nombre es obligatorio.' };
                return res.redirect('/admin/tipos/nuevo');
            }

            const existente = await TipoCancha.findOne({ where: { nombre } });
            if (existente) {
                req.session.flash = { type: 'warning', message: 'Ese tipo ya existe.' };
                return res.redirect('/admin/tipos');
            }

            await TipoCancha.create({ nombre });
            req.session.flash = { type: 'success', message: 'Tipo creado.' };
            res.redirect('/admin/tipos');
        },

        editTipoForm: async (req, res) => {
            const tipo = await TipoCancha.findByPk(req.params.id);
            if (!tipo) {
                return res.redirect('/admin/tipos');
            }

            res.render('admin/tipo-form', { tipo });
        },

        updateTipo: async (req, res) => {
            const tipo = await TipoCancha.findByPk(req.params.id);
            if (!tipo) {
                return res.redirect('/admin/tipos');
            }

            const nombre = (req.body.nombre || '').trim();
            if (!nombre) {
                req.session.flash = { type: 'warning', message: 'El nombre es obligatorio.' };
                return res.redirect(`/admin/tipos/${req.params.id}/editar`);
            }

            const repetido = await TipoCancha.findOne({ where: { nombre } });
            if (repetido && repetido.id !== tipo.id) {
                req.session.flash = { type: 'warning', message: 'Ese tipo ya existe.' };
                return res.redirect('/admin/tipos');
            }

            tipo.nombre = nombre;
            await tipo.save();

            req.session.flash = { type: 'success', message: 'Tipo actualizado.' };
            res.redirect('/admin/tipos');
        },

        deleteTipo: async (req, res) => {
            const tipoEnUso = await Cancha.findOne({ where: { tipo_id: req.params.id } });
            if (tipoEnUso) {
                req.session.flash = { type: 'warning', message: 'Ese tipo esta en uso.' };
                return res.redirect('/admin/tipos');
            }

            await TipoCancha.destroy({ where: { id: req.params.id } });
            req.session.flash = { type: 'success', message: 'Tipo eliminado.' };
            res.redirect('/admin/tipos');
        },

        listCanchas: async (req, res) => {
            const canchas = await Cancha.findAll({
                include: [{ model: TipoCancha, as: 'tipo' }],
                order: [['nombre', 'ASC']]
            });

            res.render('admin/canchas-list', { canchas });
        },

        newCanchaForm: async (req, res) => {
            const tipos = await TipoCancha.findAll({ order: [['nombre', 'ASC']] });
            if (!tipos.length) {
                req.session.flash = { type: 'warning', message: 'Primero crea un tipo de cancha.' };
                return res.redirect('/admin/tipos');
            }

            res.render('admin/cancha-form', { cancha: null, tipos });
        },

        createCancha: async (req, res) => {
            const nombre = (req.body.nombre || '').trim();
            const tipo_id = req.body.tipo_id;
            const precio = Number(req.body.precio_por_hora);
            const estado = req.body.estado === 'inactiva' ? 'inactiva' : 'activa';

            const tipo = await TipoCancha.findByPk(tipo_id);
            if (!nombre || !tipo || Number.isNaN(precio) || precio < 0) {
                req.session.flash = { type: 'warning', message: 'Completa bien los datos.' };
                return res.redirect('/admin/canchas/nuevo');
            }

            await Cancha.create({
                nombre,
                tipo_id,
                precio_por_hora: precio,
                estado
            });

            req.session.flash = { type: 'success', message: 'Cancha creada.' };
            res.redirect('/admin/canchas');
        },

        editCanchaForm: async (req, res) => {
            const cancha = await Cancha.findByPk(req.params.id);
            const tipos = await TipoCancha.findAll({ order: [['nombre', 'ASC']] });

            if (!cancha) {
                return res.redirect('/admin/canchas');
            }

            res.render('admin/cancha-form', { cancha, tipos });
        },

        updateCancha: async (req, res) => {
            const cancha = await Cancha.findByPk(req.params.id);
            if (!cancha) {
                return res.redirect('/admin/canchas');
            }

            const nombre = (req.body.nombre || '').trim();
            const tipo_id = req.body.tipo_id;
            const precio = Number(req.body.precio_por_hora);
            const estado = req.body.estado === 'inactiva' ? 'inactiva' : 'activa';

            const tipo = await TipoCancha.findByPk(tipo_id);
            if (!nombre || !tipo || Number.isNaN(precio) || precio < 0) {
                req.session.flash = { type: 'warning', message: 'Completa bien los datos.' };
                return res.redirect(`/admin/canchas/${req.params.id}/editar`);
            }

            cancha.nombre = nombre;
            cancha.tipo_id = tipo_id;
            cancha.precio_por_hora = precio;
            cancha.estado = estado;
            await cancha.save();

            req.session.flash = { type: 'success', message: 'Cancha actualizada.' };
            res.redirect('/admin/canchas');
        },

        deleteCancha: async (req, res) => {
            const canchaId = req.params.id;
            const horariosRegistrados = await Horario.count({ where: { cancha_id: canchaId } });
            const resenasRegistradas = await Resena.count({ where: { cancha_id: canchaId } });

            if (horariosRegistrados > 0 || resenasRegistradas > 0) {
                req.session.flash = { type: 'warning', message: 'No se puede eliminar esa cancha.' };
                return res.redirect('/admin/canchas');
            }

            await Cancha.destroy({ where: { id: canchaId } });
            req.session.flash = { type: 'success', message: 'Cancha eliminada.' };
            res.redirect('/admin/canchas');
        },

        listHorarios: async (req, res) => {
            const where = {};
            if (req.query.cancha_id) {
                where.cancha_id = req.query.cancha_id;
            }
            if (req.query.fecha) {
                where.fecha = req.query.fecha;
            }

            const horarios = await Horario.findAll({
                where,
                include: [{ model: Cancha, as: 'cancha' }],
                order: [['fecha', 'ASC'], ['hora_inicio', 'ASC']]
            });

            const canchas = await Cancha.findAll({ order: [['nombre', 'ASC']] });

            res.render('admin/horarios-list', {
                horarios,
                canchas,
                filtros: req.query
            });
        },

        newHorarioForm: async (req, res) => {
            const canchas = await Cancha.findAll({
                where: { estado: 'activa' },
                order: [['nombre', 'ASC']]
            });

            if (!canchas.length) {
                req.session.flash = { type: 'warning', message: 'Primero crea una cancha activa.' };
                return res.redirect('/admin/canchas');
            }

            res.render('admin/horario-form', {
                canchas,
                hoy: hoy()
            });
        },

        createHorario: async (req, res) => {
            const cancha_id = req.body.cancha_id;
            const fecha = req.body.fecha;
            const hora_inicio = normalizarHora(req.body.hora_inicio);
            const hora_fin = normalizarHora(req.body.hora_fin);

            const cancha = await Cancha.findByPk(cancha_id);
            if (!cancha || cancha.estado !== 'activa' || !fecha || !hora_inicio || !hora_fin) {
                req.session.flash = { type: 'warning', message: 'Completa bien los datos.' };
                return res.redirect('/admin/horarios/nuevo');
            }

            if (hora_inicio >= hora_fin) {
                req.session.flash = { type: 'warning', message: 'La hora inicio debe ser menor que la hora fin.' };
                return res.redirect('/admin/horarios/nuevo');
            }

            const horariosDelDia = await Horario.findAll({
                where: { cancha_id, fecha }
            });

            const horarioSuperpuesto = horariosDelDia.find((horario) => {
                const inicioActual = normalizarHora(horario.hora_inicio);
                const finActual = normalizarHora(horario.hora_fin);

                return inicioActual < hora_fin && finActual > hora_inicio;
            });

            if (horarioSuperpuesto) {
                req.session.flash = { type: 'warning', message: 'Ese rango se cruza con otro horario.' };
                return res.redirect('/admin/horarios/nuevo');
            }

            await Horario.create({
                cancha_id,
                fecha,
                hora_inicio,
                hora_fin,
                disponible: true
            });

            req.session.flash = { type: 'success', message: 'Horario guardado.' };
            res.redirect('/admin/horarios');
        },

        deleteHorario: async (req, res) => {
            const horario = await Horario.findByPk(req.params.id);
            if (!horario) {
                return res.redirect('/admin/horarios');
            }

            const reservasAsociadas = await Reserva.count({
                where: { horario_id: req.params.id }
            });

            if (reservasAsociadas > 0) {
                req.session.flash = { type: 'warning', message: 'Ese horario ya tiene una reserva.' };
                return res.redirect('/admin/horarios');
            }

            await Horario.destroy({ where: { id: req.params.id } });
            req.session.flash = { type: 'success', message: 'Horario eliminado.' };
            res.redirect('/admin/horarios');
        },

        listReservas: async (req, res) => {
            const reservas = await Reserva.findAll({
                include: [
                    { model: Usuario, as: 'usuario', attributes: ['nombre', 'email'] },
                    {
                        model: Horario,
                        as: 'horario',
                        include: [{ model: Cancha, as: 'cancha' }]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            res.render('admin/reservas-list', { reservas });
        },

        updateReservaEstado: async (req, res) => {
            const reserva = await Reserva.findByPk(req.params.id, {
                include: [{ model: Horario, as: 'horario' }]
            });

            if (!reserva) {
                return res.redirect('/admin/reservas');
            }

            const estado = req.body.estado;
            if (estado !== 'confirmada' && estado !== 'cancelada') {
                return res.redirect('/admin/reservas');
            }

            reserva.estado = estado;
            await reserva.save();

            if (reserva.horario) {
                reserva.horario.disponible = estado === 'cancelada';
                await reserva.horario.save();
            }

            req.session.flash = { type: 'success', message: 'Reserva actualizada.' };
            res.redirect('/admin/reservas');
        },

        listResenas: async (req, res) => {
            const where = {};
            if (req.query.cancha_id) {
                where.cancha_id = req.query.cancha_id;
            }

            const resenas = await Resena.findAll({
                where,
                include: [
                    { model: Usuario, as: 'usuario', attributes: ['nombre', 'email'] },
                    { model: Cancha, as: 'cancha', attributes: ['nombre'] }
                ],
                order: [['createdAt', 'DESC']]
            });

            const canchas = await Cancha.findAll({ order: [['nombre', 'ASC']] });

            res.render('admin/resenas-list', {
                resenas,
                canchas,
                cancha_id: req.query.cancha_id || ''
            });
        }
    };
};
