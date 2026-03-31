module.exports = (db) => {
    const Reserva = db.reserva;
    const Horario = db.horario;
    const Cancha = db.cancha;
    const Resena = db.resena;

    const yaPasoReserva = (fecha, horaFin) => {
        const fin = new Date(`${fecha}T${horaFin}`);
        return fin < new Date();
    };

    return {
        myReservations: async (req, res) => {
            try {
                const usuario = req.session.usuario;
                if (!usuario) {
                    return res.redirect('/login');
                }

                const reservas = await Reserva.findAll({
                    where: { usuario_id: usuario.id },
                    include: [{
                        model: Horario,
                        as: 'horario',
                        include: [{ model: Cancha, as: 'cancha' }]
                    }],
                    order: [['createdAt', 'DESC']]
                });

                return res.render('client/mis-reservas', {
                    reservas,
                    yaPasoReserva
                });
            } catch (error) {
                return res.status(500).render('error', {
                    titulo: 'Error al listar reservas',
                    mensaje: error.message
                });
            }
        },

        createReservation: async (req, res) => {
            try {
                const usuario = req.session.usuario;
                if (!usuario) {
                    return res.redirect('/login');
                }

                const { horario_id } = req.body;
                const horario = await Horario.findByPk(horario_id, {
                    include: [{ model: Cancha, as: 'cancha' }]
                });

                if (!horario || !horario.disponible) {
                    return res.redirect('/canchas');
                }

                if (horario.cancha.estado !== 'activa') {
                    return res.redirect(`/canchas/${horario.cancha_id}`);
                }

                await Reserva.create({
                    usuario_id: usuario.id,
                    horario_id: horario.id,
                    estado: 'confirmada'
                });

                horario.disponible = false;
                await horario.save();

                return res.redirect('/mis-reservas');
            } catch (error) {
                return res.status(500).render('error', {
                    titulo: 'Error al crear reserva',
                    mensaje: error.message
                });
            }
        },

        cancelReservation: async (req, res) => {
            try {
                const usuario = req.session.usuario;
                if (!usuario) {
                    return res.redirect('/login');
                }

                const reserva = await Reserva.findByPk(req.params.id, {
                    include: [{ model: Horario, as: 'horario' }]
                });

                if (!reserva || reserva.usuario_id !== usuario.id) {
                    return res.redirect('/mis-reservas');
                }

                reserva.estado = 'cancelada';
                await reserva.save();

                if (reserva.horario) {
                    reserva.horario.disponible = true;
                    await reserva.horario.save();
                }

                return res.redirect('/mis-reservas');
            } catch (error) {
                return res.status(500).render('error', {
                    titulo: 'Error al cancelar reserva',
                    mensaje: error.message
                });
            }
        },

        createReview: async (req, res) => {
            try {
                const usuario = req.session.usuario;
                if (!usuario) {
                    return res.redirect('/login');
                }

                const { reserva_id, cancha_id, calificacion, comentario } = req.body;
                const reserva = await Reserva.findOne({
                    where: { id: reserva_id, usuario_id: usuario.id },
                    include: [{ model: Horario, as: 'horario' }]
                });

                if (!reserva || reserva.estado !== 'confirmada') {
                    return res.redirect('/mis-reservas');
                }

                if (!reserva.horario || reserva.horario.cancha_id !== Number(cancha_id)) {
                    return res.redirect('/mis-reservas');
                }

                if (!yaPasoReserva(reserva.horario.fecha, reserva.horario.hora_fin)) {
                    return res.redirect('/mis-reservas');
                }

                await Resena.create({
                    usuario_id: usuario.id,
                    cancha_id,
                    calificacion,
                    comentario
                });

                return res.redirect(`/canchas/${cancha_id}`);
            } catch (error) {
                return res.status(500).render('error', {
                    titulo: 'Error al crear reseña',
                    mensaje: error.message
                });
            }
        }
    };
};
