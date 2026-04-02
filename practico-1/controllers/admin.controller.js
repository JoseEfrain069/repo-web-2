module.exports = (db) => {
    const { Op } = db.Sequelize;
    const Usuario = db.usuario;
    const TipoCancha = db.tipoCancha;
    const Cancha = db.cancha;
    const Horario = db.horario;
    const Reserva = db.reserva;
    const Resena = db.resena;
    const hoy = () => new Date().toISOString().slice(0, 10);

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
            const nombre = (req.body.nombre || '').trim();

            if (!nombre) {
                req.session.flash = { type: 'warning', message: 'El nombre del tipo es obligatorio.' };
                return res.redirect('/admin/tipos/nuevo');
            }

            const existente = await TipoCancha.findOne({ where: { nombre } });
            if (existente) {
                req.session.flash = { type: 'warning', message: 'Ese tipo de cancha ya existe.' };
                return res.redirect('/admin/tipos');
            }

            await TipoCancha.create({ nombre });
            req.session.flash = { type: 'success', message: 'Tipo de cancha creado.' };
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

            const nombre = (req.body.nombre || '').trim();

            if (!nombre) {
                req.session.flash = { type: 'warning', message: 'El nombre del tipo es obligatorio.' };
                return res.redirect(`/admin/tipos/${req.params.id}/editar`);
            }

            const repetido = await TipoCancha.findOne({
                where: {
                    nombre,
                    id: { [Op.ne]: tipo.id }
                }
            });

            if (repetido) {
                req.session.flash = { type: 'warning', message: 'Ya existe otro tipo con ese nombre.' };
                return res.redirect('/admin/tipos');
            }

            tipo.nombre = nombre;
            await tipo.save();
            req.session.flash = { type: 'success', message: 'Tipo de cancha actualizado.' };
            return res.redirect('/admin/tipos');
        },

        deleteTipo: async (req, res) => {
            const tipoEnUso = await Cancha.findOne({ where: { tipo_id: req.params.id } });
            if (tipoEnUso) {
                req.session.flash = {
                    type: 'warning',
                    message: 'No podes eliminar un tipo que esta siendo usado por una cancha.'
                };
                return res.redirect('/admin/tipos');
            }

            await TipoCancha.destroy({ where: { id: req.params.id } });
            req.session.flash = { type: 'success', message: 'Tipo de cancha eliminado.' };
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

            if (!tipos.length) {
                req.session.flash = {
                    type: 'warning',
                    message: 'Primero tenes que registrar al menos un tipo de cancha.'
                };
                return res.redirect('/admin/tipos');
            }

            return res.render('admin/cancha-form', { cancha: null, tipos });
        },

        createCancha: async (req, res) => {
            const { nombre, tipo_id, precio_por_hora, estado } = req.body;
            const nombreLimpio = (nombre || '').trim();
            const precio = Number(precio_por_hora);
            const tipo = await TipoCancha.findByPk(tipo_id);

            if (!nombreLimpio || !tipo || Number.isNaN(precio) || precio < 0) {
                req.session.flash = {
                    type: 'warning',
                    message: 'Completa correctamente los datos de la cancha.'
                };
                return res.redirect('/admin/canchas/nuevo');
            }

            await Cancha.create({
                nombre: nombreLimpio,
                tipo_id,
                precio_por_hora: precio,
                estado: estado === 'inactiva' ? 'inactiva' : 'activa'
            });

            req.session.flash = { type: 'success', message: 'Cancha creada.' };
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
            const nombreLimpio = (nombre || '').trim();
            const precio = Number(precio_por_hora);
            const tipo = await TipoCancha.findByPk(tipo_id);

            if (!nombreLimpio || !tipo || Number.isNaN(precio) || precio < 0) {
                req.session.flash = {
                    type: 'warning',
                    message: 'Completa correctamente los datos de la cancha.'
                };
                return res.redirect(`/admin/canchas/${req.params.id}/editar`);
            }

            cancha.nombre = nombreLimpio;
            cancha.tipo_id = tipo_id;
            cancha.precio_por_hora = precio;
            cancha.estado = estado === 'inactiva' ? 'inactiva' : 'activa';
            await cancha.save();

            req.session.flash = { type: 'success', message: 'Cancha actualizada.' };
            return res.redirect('/admin/canchas');
        },

        deleteCancha: async (req, res) => {
            const canchaId = req.params.id;

            const [horariosRegistrados, resenasRegistradas] = await Promise.all([
                Horario.count({ where: { cancha_id: canchaId } }),
                Resena.count({ where: { cancha_id: canchaId } })
            ]);

            if (horariosRegistrados > 0 || resenasRegistradas > 0) {
                req.session.flash = {
                    type: 'warning',
                    message: 'No podes eliminar una cancha que ya tiene horarios o resenas registradas.'
                };
                return res.redirect('/admin/canchas');
            }

            await Cancha.destroy({ where: { id: canchaId } });
            req.session.flash = { type: 'success', message: 'Cancha eliminada.' };
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
            const canchas = await Cancha.findAll({
                where: { estado: 'activa' },
                order: [['nombre', 'ASC']]
            });

            if (!canchas.length) {
                req.session.flash = {
                    type: 'warning',
                    message: 'Primero tenes que registrar una cancha activa.'
                };
                return res.redirect('/admin/canchas');
            }

            return res.render('admin/horario-form', {
                canchas,
                hoy: hoy()
            });
        },

        createHorario: async (req, res) => {
            const { cancha_id, fecha, hora_inicio, hora_fin } = req.body;
            const cancha = await Cancha.findByPk(cancha_id);

            if (!cancha || cancha.estado !== 'activa' || !fecha || !hora_inicio || !hora_fin) {
                req.session.flash = {
                    type: 'warning',
                    message: 'Completa correctamente los datos del horario.'
                };
                return res.redirect('/admin/horarios/nuevo');
            }

            if (hora_inicio >= hora_fin) {
                req.session.flash = {
                    type: 'warning',
                    message: 'La hora de inicio debe ser menor que la hora fin.'
                };
                return res.redirect('/admin/horarios/nuevo');
            }

            const horarioSuperpuesto = await Horario.findOne({
                where: {
                    cancha_id,
                    fecha,
                    hora_inicio: { [Op.lt]: hora_fin },
                    hora_fin: { [Op.gt]: hora_inicio }
                }
            });

            if (horarioSuperpuesto) {
                req.session.flash = {
                    type: 'warning',
                    message: 'Ya existe un horario que se cruza con ese rango.'
                };
                return res.redirect('/admin/horarios/nuevo');
            }

            await Horario.create({
                cancha_id,
                fecha,
                hora_inicio,
                hora_fin,
                disponible: true
            });

            req.session.flash = { type: 'success', message: 'Horario creado correctamente.' };
            return res.redirect('/admin/horarios');
        },

        deleteHorario: async (req, res) => {
            const horario = await Horario.findByPk(req.params.id);

            if (!horario) return res.redirect('/admin/horarios');

            const reservasAsociadas = await Reserva.count({
                where: { horario_id: req.params.id }
            });

            if (reservasAsociadas > 0) {
                req.session.flash = {
                    type: 'warning',
                    message: 'No podes eliminar un horario que ya tiene una reserva asociada.'
                };
                return res.redirect('/admin/horarios');
            }

            await Horario.destroy({ where: { id: req.params.id } });
            req.session.flash = { type: 'success', message: 'Horario eliminado.' };
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

            if (estado === 'confirmada') {
                const otraReservaActiva = await Reserva.findOne({
                    where: {
                        horario_id: reserva.horario_id,
                        estado: 'confirmada',
                        id: { [Op.ne]: reserva.id }
                    }
                });

                if (otraReservaActiva) {
                    req.session.flash = {
                        type: 'warning',
                        message: 'No se puede confirmar porque ya existe otra reserva activa para ese horario.'
                    };
                    return res.redirect('/admin/reservas');
                }
            }

            reserva.estado = estado;
            await reserva.save();

            if (reserva.horario) {
                reserva.horario.disponible = estado === 'cancelada';
                await reserva.horario.save();
            }

            req.session.flash = { type: 'success', message: 'Estado de la reserva actualizado.' };
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
