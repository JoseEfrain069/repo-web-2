module.exports = (sequelize, Sequelize) => {
    const Reserva = sequelize.define('reserva', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        estado: {
            type: Sequelize.ENUM('confirmada', 'cancelada'),
            allowNull: false,
            defaultValue: 'confirmada'
        }
    });

    return Reserva;
};
