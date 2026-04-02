module.exports = (db) => {
    const Reserva = db.reserva;
    const Horario = db.horario;
    const Cancha = db.cancha;
    const Resena = db.resena;
    const normalizarHora = (hora) => (hora || '').slice(0, 5);

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

                res.render('client/mis-reservas', {
                    reservas,
                    yaPasoReserva
                });
            } catch (error) {
                res.status(500).render('error', {
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

                const cancha_id = Number(req.body.cancha_id);
                const fecha = req.body.fecha;
                const hora_inicio = normalizarHora(req.body.hora_inicio);
                const hora_fin = normalizarHora(req.body.hora_fin);

                if (!cancha_id || !fecha || !hora_inicio || !hora_fin || hora_inicio >= hora_fin) {
                    req.session.flash = { type: 'warning', message: 'Completa bien el horario de reserva.' };
                    return res.redirect(`/canchas/${cancha_id}?fecha=${fecha}`);
                }

                const cancha = await Cancha.findByPk(cancha_id);
                if (!cancha || cancha.estado !== 'activa') {
                    req.session.flash = { type: 'warning', message: 'La cancha no esta disponible.' };
                    return res.redirect('/canchas');
                }

                if (yaEmpezoHorario(fecha, hora_inicio)) {
                    req.session.flash = { type: 'warning', message: 'No podes reservar una hora que ya paso.' };
                    return res.redirect(`/canchas/${cancha_id}?fecha=${fecha}`);
                }

                const horariosDisponibles = await Horario.findAll({
                    where: {
                        cancha_id,
                        fecha,
                        disponible: true
                    },
                    order: [['hora_inicio', 'ASC']]
                });

                const horarioBase = horariosDisponibles.find((horario) => {
                    const inicioDisponible = normalizarHora(horario.hora_inicio);
                    const finDisponible = normalizarHora(horario.hora_fin);

                    return inicioDisponible <= hora_inicio && finDisponible >= hora_fin;
                });

                if (!horarioBase) {
                    req.session.flash = { type: 'warning', message: 'Ese rango no esta disponible.' };
                    return res.redirect(`/canchas/${cancha_id}?fecha=${fecha}`);
                }

                const inicioOriginal = normalizarHora(horarioBase.hora_inicio);
                const finOriginal = normalizarHora(horarioBase.hora_fin);
                let horarioReservado = horarioBase;

                if (hora_inicio === inicioOriginal && hora_fin === finOriginal) {
                    horarioBase.disponible = false;
                    await horarioBase.save();
                } else if (hora_inicio === inicioOriginal) {
                    horarioBase.hora_inicio = hora_fin;
                    await horarioBase.save();

                    horarioReservado = await Horario.create({
                        cancha_id,
                        fecha,
                        hora_inicio,
                        hora_fin,
                        disponible: false
                    });
                } else if (hora_fin === finOriginal) {
                    horarioBase.hora_fin = hora_inicio;
                    await horarioBase.save();

                    horarioReservado = await Horario.create({
                        cancha_id,
                        fecha,
                        hora_inicio,
                        hora_fin,
                        disponible: false
                    });
                } else {
                    horarioBase.hora_fin = hora_inicio;
                    await horarioBase.save();

                    await Horario.create({
                        cancha_id,
                        fecha,
                        hora_inicio: hora_fin,
                        hora_fin: finOriginal,
                        disponible: true
                    });

                    horarioReservado = await Horario.create({
                        cancha_id,
                        fecha,
                        hora_inicio,
                        hora_fin,
                        disponible: false
                    });
                }

                await Reserva.create({
                    usuario_id: usuario.id,
                    horario_id: horarioReservado.id,
                    estado: 'confirmada'
                });

                req.session.flash = {
                    type: 'success',
                    message: 'Reserva creada correctamente.'
                };
                res.redirect('/mis-reservas');
            } catch (error) {
                res.status(500).render('error', {
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
                    req.session.flash = { type: 'warning', message: 'No se encontro la reserva.' };
                    return res.redirect('/mis-reservas');
                }

                if (reserva.estado !== 'confirmada') {
                    req.session.flash = { type: 'warning', message: 'La reserva ya estaba cancelada.' };
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
                res.redirect('/mis-reservas');
            } catch (error) {
                res.status(500).render('error', {
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

                const reserva_id = req.body.reserva_id;
                const cancha_id = Number(req.body.cancha_id);
                const puntaje = Number(req.body.calificacion);
                const comentarioLimpio = (req.body.comentario || '').trim();

                const reserva = await Reserva.findOne({
                    where: { id: reserva_id, usuario_id: usuario.id },
                    include: [{ model: Horario, as: 'horario' }]
                });

                if (!reserva || reserva.estado !== 'confirmada') {
                    req.session.flash = { type: 'warning', message: 'No podes dejar una resena para esa reserva.' };
                    return res.redirect('/mis-reservas');
                }

                if (!reserva.horario || reserva.horario.cancha_id !== cancha_id) {
                    req.session.flash = { type: 'warning', message: 'La reserva no coincide con la cancha.' };
                    return res.redirect('/mis-reservas');
                }

                if (!yaPasoReserva(reserva.horario.fecha, reserva.horario.hora_fin)) {
                    req.session.flash = { type: 'warning', message: 'La reserva todavia no termino.' };
                    return res.redirect('/mis-reservas');
                }

                if (!comentarioLimpio || Number.isNaN(puntaje) || puntaje < 1 || puntaje > 5) {
                    req.session.flash = { type: 'warning', message: 'Completa bien la resena.' };
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
                res.redirect(`/canchas/${cancha_id}?fecha=${reserva.horario.fecha}`);
            } catch (error) {
                res.status(500).render('error', {
                    titulo: 'Error al crear resena',
                    mensaje: error.message
                });
            }
        }
    };
};
