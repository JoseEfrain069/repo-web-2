const router = require('express').Router();
const controller = require('../controllers/ticket.controller');
const requireAuth = require('../middlewares/auth.middleware');
const schemaValidation = require('../middlewares/schemaValidation.middleware');
const asyncHandler = require('../middlewares/asyncHandler.middleware');
const {
    ticketCreateSchema,
    ticketUpdateSchema,
    ticketEstadoSchema
} = require('../validators/ticket.schema');

router.get('/proyectos/:proyectoId/tickets', requireAuth, asyncHandler(controller.getTicketsByProject));
router.post('/proyectos/:proyectoId/tickets', requireAuth, schemaValidation(ticketCreateSchema), asyncHandler(controller.createTicket));

router.get('/tickets/:id', requireAuth, asyncHandler(controller.getTicketById));
router.put('/tickets/:id', requireAuth, schemaValidation(ticketUpdateSchema), asyncHandler(controller.updateTicket));
router.patch('/tickets/:id/estado', requireAuth, schemaValidation(ticketEstadoSchema), asyncHandler(controller.changeTicketStatus));
router.delete('/tickets/:id', requireAuth, asyncHandler(controller.deleteTicket));

module.exports = router;
