const db = require('../models');
const proyectoService = require('./proyecto.service');
const { createError } = require('../utils/error.utils');

const ESTADOS = ['Pendiente', 'En Progreso', 'Completado'];

const MOVIMIENTOS_PERMITIDOS = {
    Pendiente: ['En Progreso'],
    'En Progreso': ['Pendiente', 'Completado'],
    Completado: ['En Progreso']
};

const includeAssignedUser = {
    model: db.usuario,
    as: 'usuarioAsignado',
    attributes: ['id', 'nombre', 'email']
};

exports.ESTADOS = ESTADOS;

exports.getTicketsByProject = async (usuarioId, proyectoId) => {
    await proyectoService.getProjectForUser(usuarioId, proyectoId);
    return db.ticket.findAll({
        where: { proyectoId },
        include: [includeAssignedUser],
        order: [['id', 'DESC']]
    });
};

exports.getTicketById = async (id) => {
    return db.ticket.findByPk(id, {
        include: [includeAssignedUser]
    });
};

exports.getTicketForUser = async (usuarioId, ticketId) => {
    const ticket = await exports.getTicketById(ticketId);
    if (!ticket) {
        throw createError(404, 'Ticket no encontrado');
    }

    await proyectoService.getProjectForUser(usuarioId, ticket.proyectoId);
    return ticket;
};

exports.validateAssignedUser = async (proyectoId, usuarioAsignadoId) => {
    if (!usuarioAsignadoId) {
        return;
    }

    const usuario = await db.usuario.findByPk(usuarioAsignadoId);
    if (!usuario) {
        throw createError(400, 'El usuario asignado no existe');
    }

    const isMember = await proyectoService.userHasAccess(usuarioAsignadoId, proyectoId);
    if (!isMember) {
        throw createError(400, 'El usuario asignado no pertenece al proyecto');
    }
};

exports.createTicket = async (usuarioId, proyectoId, data) => {
    await proyectoService.getProjectForUser(usuarioId, proyectoId);
    await exports.validateAssignedUser(proyectoId, data.usuarioAsignadoId);

    return db.ticket.create({
        titulo: data.titulo,
        descripcion: data.descripcion,
        usuarioAsignadoId: data.usuarioAsignadoId || null,
        proyectoId,
        estado: 'Pendiente'
    });
};

exports.updateTicket = async (usuarioId, ticketId, data) => {
    const ticket = await exports.getTicketForUser(usuarioId, ticketId);

    if (data.usuarioAsignadoId !== undefined) {
        if (data.usuarioAsignadoId === null && ticket.estado !== 'Pendiente') {
            throw createError(400, 'No se puede quitar el responsable de un ticket iniciado');
        }
        await exports.validateAssignedUser(ticket.proyectoId, data.usuarioAsignadoId);
    }

    await ticket.update(data);
    return exports.getTicketById(ticketId);
};

exports.changeTicketStatus = async (usuarioId, ticketId, nuevoEstado) => {
    const ticket = await exports.getTicketForUser(usuarioId, ticketId);

    if (!ESTADOS.includes(nuevoEstado)) {
        throw createError(400, 'Estado no valido');
    }

    const movimientos = MOVIMIENTOS_PERMITIDOS[ticket.estado] || [];
    if (!movimientos.includes(nuevoEstado)) {
        throw createError(400, 'Movimiento de estado no permitido');
    }

    if (nuevoEstado === 'En Progreso' && !ticket.usuarioAsignadoId) {
        throw createError(400, 'No se puede iniciar un ticket sin responsable asignado');
    }

    await ticket.update({ estado: nuevoEstado });
    return exports.getTicketById(ticketId);
};

exports.deleteTicket = async (usuarioId, ticketId) => {
    const ticket = await exports.getTicketForUser(usuarioId, ticketId);
    await ticket.destroy();
};
