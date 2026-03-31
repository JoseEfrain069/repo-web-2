module.exports = (db) => {
    const { Op } = db.Sequelize;
    const Usuario = db.usuario;
    const TipoCancha = db.tipoCancha;
    const Cancha = db.cancha;
    const Horario = db.horario;
    const Reserva = db.reserva;
    const Resena = db.resena;

    return {
        adminHome: async (req, res) => {
            try {
                if (!req.session.usuario || req.session.usuario.rol !== 'admin') {
                    return res.redirect('/login');
                }

                const [usuarios, canchas, reservas] = await Promise.all([
                    Usuario.count(),
                    Cancha.count(),
                    Reserva.count()
                ]);

                return res.render('admin/dashboard', {
                    resumen: { usuarios, canchas, reservas }
                });
            } catch (error) {
                return res.status(500).render('error', {
                    titulo: 'Error en panel admin',
                    mensaje: error.message
                });
            }
        },

        listTipos: async (req, res) => {
            const tipos = await TipoCancha.findAll({ order: [['nombre', 'ASC']] });
            return res.render('admin/tipos-list', { tipos });
        },

        newTipoForm: (req, res) => res.render('admin/tipo-form', { tipo: null }),

        createTipo: async (req, res) => {
            const { nombre } = req.body;
            if (!nombre) return res.redirect('/admin/tipos');
            await TipoCancha.create({ nombre });
            return res.redirect('/admin/tipos');
        },

        editTipoForm: async (req, res) => {
            const tipo = await TipoCancha.findByPk(req.params.id);
            if (!tipo) return res.redirect('/admin/tipos');
            return res.render('admin/tipo-form', { tipo });
        },

        updateTipo: async (req, res) => {
            const tipo = await TipoCancha.findByPk(req.params.id);
            if (!tipo) return res.redirect('/admin/tipos');
            tipo.nombre = req.body.nombre;
            await tipo.save();
            return res.redirect('/admin/tipos');
        },

        deleteTipo: async (req, res) => {
            const tipoEnUso = await Cancha.findOne({ where: { tipo_id: req.params.id } });
            if (tipoEnUso) return res.redirect('/admin/tipos');
            await TipoCancha.destroy({ where: { id: req.params.id } });
            return res.redirect('/admin/tipos');
        },

        listCanchas: async (req, res) => {
            const canchas = await Cancha.findAll({
                include: [{ model: TipoCancha, as: 'tipo' }],
                order: [['nombre', 'ASC']]
            });
            return res.render('admin/canchas-list', { canchas });
        },

        newCanchaForm: async (req, res) => {
            const tipos = await TipoCancha.findAll({ order: [['nombre', 'ASC']] });
            return res.render('admin/cancha-form', { cancha: null, tipos });
        },

        createCancha: async (req, res) => {
            const { nombre, tipo_id, precio_por_hora, estado } = req.body;
            await Cancha.create({ nombre, tipo_id, precio_por_hora, estado });
            return res.redirect('/admin/canchas');
        },

        editCanchaForm: async (req, res) => {
            const cancha = await Cancha.findByPk(req.params.id);
            const tipos = await TipoCancha.findAll({ order: [['nombre', 'ASC']] });
            if (!cancha) return res.redirect('/admin/canchas');
            return res.render('admin/cancha-form', { cancha, tipos });
        },

        updateCancha: async (req, res) => {
            const cancha = await Cancha.findByPk(req.params.id);
            if (!cancha) return res.redirect('/admin/canchas');

            const { nombre, tipo_id, precio_por_hora, estado } = req.body;
            cancha.nombre = nombre;
            cancha.tipo_id = tipo_id;
            cancha.precio_por_hora = precio_por_hora;
            cancha.estado = estado;
            await cancha.save();

            return res.redirect('/admin/canchas');
        },

        deleteCancha: async (req, res) => {
            await Cancha.destroy({ where: { id: req.params.id } });
            return res.redirect('/admin/canchas');
        },

        listHorarios: async (req, res) => {
            const where = {};
            if (req.query.cancha_id) where.cancha_id = req.query.cancha_id;
            if (req.query.fecha) where.fecha = req.query.fecha;

            const horarios = await Horario.findAll({
                where,
                include: [{ model: Cancha, as: 'cancha' }],
                order: [['fecha', 'ASC'], ['hora_inicio', 'ASC']]
            });

            const canchas = await Cancha.findAll({ order: [['nombre', 'ASC']] });

            return res.render('admin/horarios-list', {
                horarios,
                canchas,
                filtros: req.query
            });
        },

        newHorarioForm: async (req, res) => {
            const canchas = await Cancha.findAll({ where: { estado: 'activa' }, order: [['nombre', 'ASC']] });
            return res.render('admin/horario-form', { canchas });
        },

        createHorario: async (req, res) => {
            const { cancha_id, fecha, hora_inicio, hora_fin } = req.body;
            if (hora_inicio >= hora_fin) {
                return res.redirect('/admin/horarios/nuevo');
            }

            await Horario.create({
                cancha_id,
                fecha,
                hora_inicio,
                hora_fin,
                disponible: true
            });

            return res.redirect('/admin/horarios');
        },

        deleteHorario: async (req, res) => {
            const horario = await Horario.findByPk(req.params.id, {
                include: [{ model: Reserva, as: 'reserva', required: false }]
            });

            if (!horario) return res.redirect('/admin/horarios');
            if (horario.reserva && horario.reserva.estado === 'confirmada') {
                return res.redirect('/admin/horarios');
            }

            await Horario.destroy({ where: { id: req.params.id } });
            return res.redirect('/admin/horarios');
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

            return res.render('admin/reservas-list', { reservas });
        },

        updateReservaEstado: async (req, res) => {
            const reserva = await Reserva.findByPk(req.params.id, {
                include: [{ model: Horario, as: 'horario' }]
            });
            if (!reserva) return res.redirect('/admin/reservas');

            const { estado } = req.body;
            if (!['confirmada', 'cancelada'].includes(estado)) {
                return res.redirect('/admin/reservas');
            }

            reserva.estado = estado;
            await reserva.save();

            if (reserva.horario) {
                reserva.horario.disponible = estado === 'cancelada';
                await reserva.horario.save();
            }

            return res.redirect('/admin/reservas');
        },

        listResenas: async (req, res) => {
            const where = {};
            if (req.query.cancha_id) {
                where.cancha_id = req.query.cancha_id;
            }

            const [resenas, canchas] = await Promise.all([
                Resena.findAll({
                    where,
                    include: [
                        { model: Usuario, as: 'usuario', attributes: ['nombre', 'email'] },
                        { model: Cancha, as: 'cancha', attributes: ['nombre'] }
                    ],
                    order: [['createdAt', 'DESC']]
                }),
                Cancha.findAll({ order: [['nombre', 'ASC']] })
            ]);

            return res.render('admin/resenas-list', {
                resenas,
                canchas,
                cancha_id: req.query.cancha_id || ''
            });
        }
    };
};
