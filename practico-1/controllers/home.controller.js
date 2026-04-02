module.exports = (db) => {
    const Cancha = db.cancha;
    const TipoCancha = db.tipoCancha;
    const Horario = db.horario;
    const Resena = db.resena;
    const Usuario = db.usuario;

    return {
        redirectBySession: (req, res) => {
            if (!req.session.usuario) {
                return res.redirect('/login');
            }

            res.redirect('/dashboard');
        },

        dashboard: (req, res) => {
            if (req.session.usuario.rol === 'admin') {
                return res.redirect('/admin');
            }

            res.redirect('/canchas');
        },

        listCanchas: async (req, res) => {
            try {
                const canchas = await Cancha.findAll({
                    include: [{ model: TipoCancha, as: 'tipo' }],
                    where: { estado: 'activa' },
                    order: [['nombre', 'ASC']]
                });

                res.render('client/canchas', { canchas });
            } catch (error) {
                res.status(500).render('error', {
                    titulo: 'Error al listar canchas',
                    mensaje: error.message
                });
            }
        },

        showCanchaDetail: async (req, res) => {
            try {
                const cancha = await Cancha.findByPk(req.params.id, {
                    include: [{ model: TipoCancha, as: 'tipo' }]
                });

                if (!cancha) {
                    return res.status(404).render('error', {
                        titulo: 'Cancha no encontrada',
                        mensaje: 'No existe la cancha solicitada.'
                    });
                }

                if (cancha.estado !== 'activa') {
                    return res.status(404).render('error', {
                        titulo: 'Cancha no disponible',
                        mensaje: 'La cancha solicitada no esta activa.'
                    });
                }

                const hoy = new Date().toISOString().slice(0, 10);
                const fechaSeleccionada = req.query.fecha || hoy;

                const todosLosHorarios = await Horario.findAll({
                    where: {
                        cancha_id: cancha.id,
                        disponible: true
                    },
                    order: [['fecha', 'ASC'], ['hora_inicio', 'ASC']]
                });

                const horarios = todosLosHorarios.filter((horario) => horario.fecha === fechaSeleccionada);

                const fechasMap = {};
                for (const horario of todosLosHorarios) {
                    if (horario.fecha < hoy) {
                        continue;
                    }

                    if (!fechasMap[horario.fecha]) {
                        fechasMap[horario.fecha] = 0;
                    }

                    fechasMap[horario.fecha] += 1;
                }

                const fechasDisponibles = Object.keys(fechasMap)
                    .slice(0, 7)
                    .map((fecha) => ({
                        fecha,
                        cantidad: fechasMap[fecha]
                    }));

                const resenas = await Resena.findAll({
                    where: { cancha_id: cancha.id },
                    include: [{ model: Usuario, as: 'usuario', attributes: ['nombre'] }],
                    order: [['createdAt', 'DESC']]
                });

                res.render('client/cancha-detail', {
                    cancha,
                    fechaSeleccionada,
                    horarios,
                    fechasDisponibles,
                    hoy,
                    resenas
                });
            } catch (error) {
                res.status(500).render('error', {
                    titulo: 'Error al ver cancha',
                    mensaje: error.message
                });
            }
        }
    };
};
