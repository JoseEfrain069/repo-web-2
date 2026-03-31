module.exports = (sequelize, Sequelize) => {
    const Resena = sequelize.define('resena', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        calificacion: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        },
        comentario: {
            type: Sequelize.TEXT,
            allowNull: false
        }
    });

    return Resena;
};
