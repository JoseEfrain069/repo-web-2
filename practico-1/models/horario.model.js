module.exports = (sequelize, Sequelize) => {
    const Horario = sequelize.define('horario', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        fecha: {
            type: Sequelize.DATEONLY,
            allowNull: false
        },
        hora_inicio: {
            type: Sequelize.TIME,
            allowNull: false
        },
        hora_fin: {
            type: Sequelize.TIME,
            allowNull: false
        },
        disponible: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    });

    return Horario;
};
