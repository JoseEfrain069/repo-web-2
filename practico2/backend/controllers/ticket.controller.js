const ticketService = require('../services/ticket.service');

exports.getTicketsByProject = async (req, res) => {
    const tickets = await ticketService.getTicketsByProject(req.user.id, req.params.proyectoId);
    res.json(tickets);
};

exports.createTicket = async (req, res) => {
    const ticket = await ticketService.createTicket(
        req.user.id,
        req.params.proyectoId,
        req.body
    );
    res.status(201).json(ticket);
};

exports.getTicketById = async (req, res) => {
    const ticket = await ticketService.getTicketForUser(req.user.id, req.params.id);
    res.json(ticket);
};

exports.updateTicket = async (req, res) => {
    const ticket = await ticketService.updateTicket(req.user.id, req.params.id, req.body);
    res.json(ticket);
};

exports.changeTicketStatus = async (req, res) => {
    const ticket = await ticketService.changeTicketStatus(
        req.user.id,
        req.params.id,
        req.body.estado
    );
    res.json(ticket);
};

exports.deleteTicket = async (req, res) => {
    await ticketService.deleteTicket(req.user.id, req.params.id);
    res.json({ message: 'Ticket eliminado correctamente' });
};
