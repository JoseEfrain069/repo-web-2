const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'onlyflans.db'
});

sequelize.authenticate()
    .then(() => console.log('Conexion a SQLite correcta'))
    .catch((err) => console.error('No se pudo conectar a SQLite:', err));

module.exports = { sequelize, Sequelize };
