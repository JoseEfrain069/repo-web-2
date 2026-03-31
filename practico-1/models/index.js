const dbConfig = require('../config/db.config');

const db = {};

db.Sequelize = dbConfig.Sequelize;
db.sequelize = dbConfig.sequelize;

db.usuario = require('./usuario.model')(db.sequelize, db.Sequelize);
db.tipoCancha = require('./tipo_cancha.model')(db.sequelize, db.Sequelize);
db.cancha = require('./cancha.model')(db.sequelize, db.Sequelize);
db.horario = require('./horario.model')(db.sequelize, db.Sequelize);
db.reserva = require('./reserva.model')(db.sequelize, db.Sequelize);
db.resena = require('./resena.model')(db.sequelize, db.Sequelize);

// Relaciones
// Tipo de cancha -> canchas
db.tipoCancha.hasMany(db.cancha, { foreignKey: 'tipo_id', as: 'canchas' });
db.cancha.belongsTo(db.tipoCancha, { foreignKey: 'tipo_id', as: 'tipo' });

// Cancha -> horarios
db.cancha.hasMany(db.horario, { foreignKey: 'cancha_id', as: 'horarios' });
db.horario.belongsTo(db.cancha, { foreignKey: 'cancha_id', as: 'cancha' });

// Usuario -> reservas
db.usuario.hasMany(db.reserva, { foreignKey: 'usuario_id', as: 'reservas' });
db.reserva.belongsTo(db.usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Horario -> reserva (un horario solo puede tener una reserva activa)
db.horario.hasOne(db.reserva, { foreignKey: 'horario_id', as: 'reserva' });
db.reserva.belongsTo(db.horario, { foreignKey: 'horario_id', as: 'horario' });

// Usuario -> reseñas
db.usuario.hasMany(db.resena, { foreignKey: 'usuario_id', as: 'resenas' });
db.resena.belongsTo(db.usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Cancha -> reseñas
db.cancha.hasMany(db.resena, { foreignKey: 'cancha_id', as: 'resenas' });
db.resena.belongsTo(db.cancha, { foreignKey: 'cancha_id', as: 'cancha' });

module.exports = db;
