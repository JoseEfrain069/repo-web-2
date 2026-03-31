module.exports = (sequelize, Sequelize) => {
    const TipoCancha = sequelize.define('tipo_cancha', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nombre: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        }
    });

    return TipoCancha;
};
