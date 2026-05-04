const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
});

sequelize.authenticate()
    .then(() => {
        console.log('Conexion a SQLite correcta');
    })
    .catch((error) => {
        console.error('No se pudo conectar a SQLite:', error);
    });

module.exports = {
    sequelize,
    Sequelize
};
