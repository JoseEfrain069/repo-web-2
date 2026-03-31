module.exports = (sequelize, Sequelize) => {
    const Cancha = sequelize.define('cancha', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nombre: {
            type: Sequelize.STRING,
            allowNull: false
        },
        precio_por_hora: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0
            }
        },
        estado: {
            type: Sequelize.ENUM('activa', 'inactiva'),
            allowNull: false,
            defaultValue: 'activa'
        }
    });

    return Cancha;
};
