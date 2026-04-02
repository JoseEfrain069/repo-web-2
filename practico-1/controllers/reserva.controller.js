module.exports = (db) => {
    const Reserva = db.reserva;
    const Horario = db.horario;
    const Cancha = db.cancha;
    const Resena = db.resena;

    const yaPasoReserva = (fecha, horaFin) => {
        const fin = new Date(`${fecha}T${horaFin}`);
        return fin < new Date();
    };

    const yaEmpezoHorario = (fecha, horaInicio) => {
        const inicio = new Date(`${fecha}T${horaInicio}`);
        return inicio <= new Date();
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

                if (!horario || !horario.cancha || !horario.disponible) {
                    req.session.flash = {
                        type: 'warning',
                        message: 'El horario ya no esta disponible.'
                    };
                    return res.redirect('/canchas');
                }

                if (horario.cancha.estado !== 'activa') {
                    req.session.flash = {
                        type: 'warning',
                        message: 'La cancha seleccionada no esta activa.'
                    };
                    return res.redirect('/canchas');
                }

                if (yaEmpezoHorario(horario.fecha, horario.hora_inicio)) {
                    req.session.flash = {
                        type: 'warning',
                        message: 'No podes reservar un horario que ya empezo o ya paso.'
                    };
                    return res.redirect(`/canchas/${horario.cancha_id}?fecha=${horario.fecha}`);
                }

                const reservaActiva = await Reserva.findOne({
                    where: {
                        horario_id: horario.id,
                        estado: 'confirmada'
                    }
                });

                if (reservaActiva) {
                    horario.disponible = false;
                    await horario.save();

                    req.session.flash = {
                        type: 'warning',
                        message: 'Otro usuario ya reservo ese horario.'
                    };
                    return res.redirect(`/canchas/${horario.cancha_id}?fecha=${horario.fecha}`);
                }

                await Reserva.create({
                    usuario_id: usuario.id,
                    horario_id: horario.id,
                    estado: 'confirmada'
                });

                horario.disponible = false;
                await horario.save();

                req.session.flash = {
                    type: 'success',
                    message: 'Reserva creada correctamente.'
                };
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
                    req.session.flash = {
                        type: 'warning',
                        message: 'No se encontro la reserva solicitada.'
                    };
                    return res.redirect('/mis-reservas');
                }

                if (reserva.estado !== 'confirmada') {
                    req.session.flash = {
                        type: 'warning',
                        message: 'La reserva ya estaba cancelada.'
                    };
                    return res.redirect('/mis-reservas');
                }

                reserva.estado = 'cancelada';
                await reserva.save();

                if (reserva.horario) {
                    reserva.horario.disponible = true;
                    await reserva.horario.save();
                }

                req.session.flash = {
                    type: 'success',
                    message: 'Reserva cancelada correctamente.'
                };
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
                const puntaje = Number(calificacion);
                const comentarioLimpio = (comentario || '').trim();

                const reserva = await Reserva.findOne({
                    where: { id: reserva_id, usuario_id: usuario.id },
                    include: [{ model: Horario, as: 'horario' }]
                });

                if (!reserva || reserva.estado !== 'confirmada') {
                    req.session.flash = {
                        type: 'warning',
                        message: 'No podes dejar una resena para esa reserva.'
                    };
                    return res.redirect('/mis-reservas');
                }

                if (!reserva.horario || reserva.horario.cancha_id !== Number(cancha_id)) {
                    req.session.flash = {
                        type: 'warning',
                        message: 'La reserva no coincide con la cancha indicada.'
                    };
                    return res.redirect('/mis-reservas');
                }

                if (!yaPasoReserva(reserva.horario.fecha, reserva.horario.hora_fin)) {
                    req.session.flash = {
                        type: 'warning',
                        message: 'Solo podes resenar una reserva que ya termino.'
                    };
                    return res.redirect('/mis-reservas');
                }

                if (!comentarioLimpio || Number.isNaN(puntaje) || puntaje < 1 || puntaje > 5) {
                    req.session.flash = {
                        type: 'warning',
                        message: 'Completa correctamente la calificacion y el comentario.'
                    };
                    return res.redirect('/mis-reservas');
                }

                await Resena.create({
                    usuario_id: usuario.id,
                    cancha_id,
                    calificacion: puntaje,
                    comentario: comentarioLimpio
                });

                req.session.flash = {
                    type: 'success',
                    message: 'Resena guardada correctamente.'
                };
                return res.redirect(`/canchas/${cancha_id}?fecha=${reserva.horario.fecha}`);
            } catch (error) {
                return res.status(500).render('error', {
                    titulo: 'Error al crear resena',
                    mensaje: error.message
                });
            }
        }
    };
};
