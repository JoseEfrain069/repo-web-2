const { sequelize } = require('../config/db.config');

const usuario = require('./usuario.model')(sequelize);
const proyecto = require('./proyecto.model')(sequelize);
const proyectoUsuario = require('./proyectoUsuario.model')(sequelize);
const ticket = require('./ticket.model')(sequelize);

usuario.belongsToMany(proyecto, {
    through: proyectoUsuario,
    foreignKey: 'usuarioId',
    otherKey: 'proyectoId'
});

proyecto.belongsToMany(usuario, {
    through: proyectoUsuario,
    foreignKey: 'proyectoId',
    otherKey: 'usuarioId'
});

proyecto.hasMany(ticket, { foreignKey: 'proyectoId' });
ticket.belongsTo(proyecto, { foreignKey: 'proyectoId' });

usuario.hasMany(ticket, { foreignKey: 'usuarioAsignadoId' });
ticket.belongsTo(usuario, {
    as: 'usuarioAsignado',
    foreignKey: 'usuarioAsignadoId'
});

module.exports = {
    usuario,
    proyecto,
    proyectoUsuario,
    ticket,
    sequelize,
    Sequelize: sequelize.Sequelize
};
