const { Op } = require('sequelize');

module.exports = (db) => {
    const Cancha = db.cancha;
    const TipoCancha = db.tipoCancha;
    const Horario = db.horario;
    const Reserva = db.reserva;
    const Resena = db.resena;
    const Usuario = db.usuario;

    return {
        redirectBySession: (req, res) => {
            if (!req.session.usuario) {
                return res.redirect('/login');
            }
            return res.redirect('/dashboard');
        },

        dashboard: (req, res) => {
            if (!req.session.usuario) {
                return res.redirect('/login');
            }
            if (req.session.usuario.rol === 'admin') {
                return res.redirect('/admin');
            }
            return res.redirect('/canchas');
        },

        listCanchas: async (req, res) => {
            try {
                const canchas = await Cancha.findAll({
                    include: [{ model: TipoCancha, as: 'tipo' }],
                    where: { estado: 'activa' },
                    order: [['nombre', 'ASC']]
                });

                return res.render('client/canchas', {
                    canchas,
                    fecha: req.query.fecha || null
                });
            } catch (error) {
                return res.status(500).render('error', {
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

                const fechaSeleccionada = req.query.fecha || new Date().toISOString().slice(0, 10);

                const horarios = await Horario.findAll({
                    where: {
                        cancha_id: cancha.id,
                        fecha: fechaSeleccionada,
                        disponible: true
                    },
                    include: [{ model: Reserva, as: 'reserva', required: false, where: { estado: { [Op.ne]: 'confirmada' } } }],
                    order: [['hora_inicio', 'ASC']]
                });

                const resenas = await Resena.findAll({
                    where: { cancha_id: cancha.id },
                    include: [{ model: Usuario, as: 'usuario', attributes: ['nombre'] }],
                    order: [['createdAt', 'DESC']]
                });

                return res.render('client/cancha-detail', {
                    cancha,
                    fechaSeleccionada,
                    horarios,
                    resenas
                });
            } catch (error) {
                return res.status(500).render('error', {
                    titulo: 'Error al ver cancha',
                    mensaje: error.message
                });
            }
        }
    };
};
