const db = require('../models');
const { createError } = require('../utils/error.utils');

const userAttributes = ['id', 'nombre', 'email'];

exports.userHasAccess = async (usuarioId, proyectoId) => {
    const access = await db.proyectoUsuario.findOne({
        where: { usuarioId, proyectoId }
    });
    return !!access;
};

exports.createProject = async (usuarioId, data) => {
    const proyecto = await db.proyecto.create(data);
    await db.proyectoUsuario.create({
        usuarioId,
        proyectoId: proyecto.id
    });
    return proyecto;
};

exports.getProjectsByUser = async (usuarioId) => {
    return db.proyecto.findAll({
        include: [{
            model: db.usuario,
            where: { id: usuarioId },
            attributes: userAttributes,
            through: { attributes: [] }
        }],
        order: [['id', 'DESC']]
    });
};

exports.getProjectById = async (id) => {
    return db.proyecto.findByPk(id, {
        include: [{
            model: db.usuario,
            attributes: userAttributes,
            through: { attributes: [] }
        }]
    });
};

exports.getProjectForUser = async (usuarioId, proyectoId) => {
    const proyecto = await exports.getProjectById(proyectoId);
    if (!proyecto) {
        throw createError(404, 'Proyecto no encontrado');
    }

    const hasAccess = await exports.userHasAccess(usuarioId, proyectoId);
    if (!hasAccess) {
        throw createError(403, 'No tienes acceso a este proyecto');
    }

    return proyecto;
};

exports.updateProject = async (usuarioId, proyectoId, data) => {
    const proyecto = await exports.getProjectForUser(usuarioId, proyectoId);
    await proyecto.update(data);
    const proyectoactualizado = await this.getProjectById(proyectoId);
    return exports.getProjectById(proyectoId);
};

exports.addUserToProject = async (usuarioId, proyectoId, email) => {
    const proyecto = await exports.getProjectForUser(usuarioId, proyectoId);
    const usuario = await db.usuario.findOne({ where: { email } });

    if (!usuario) {
        throw createError(404, 'Usuario no encontrado');
    }

    const exists = await db.proyectoUsuario.findOne({
        where: {
            usuarioId: usuario.id,
            proyectoId
        }
    });

    if (!exists) {
        await db.proyectoUsuario.create({
            usuarioId: usuario.id,
            proyectoId
        });
    }

    return exports.getProjectById(proyecto.id);
};
