const Joi = require('joi');

const ticketCreateSchema = Joi.object({
    titulo: Joi.string().min(2).max(150).required(),
    descripcion: Joi.string().min(2).required(),
    usuarioAsignadoId: Joi.number().integer().allow(null)
});

const ticketUpdateSchema = Joi.object({
    titulo: Joi.string().min(2).max(150),
    descripcion: Joi.string().min(2),
    usuarioAsignadoId: Joi.number().integer().allow(null)
}).min(1);

const ticketEstadoSchema = Joi.object({
    estado: Joi.string().valid('Pendiente', 'En Progreso', 'Completado').required()
});

module.exports = {
    ticketCreateSchema,
    ticketUpdateSchema,
    ticketEstadoSchema
};
