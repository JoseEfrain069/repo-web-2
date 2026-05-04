const Joi = require('joi');

const proyectoSchema = Joi.object({
    nombre: Joi.string().min(2).max(120).required(),
    descripcion: Joi.string().min(2).required()
});

const addUserSchema = Joi.object({
    email: Joi.string().email().required()
});

module.exports = {
    proyectoSchema,
    addUserSchema
};
