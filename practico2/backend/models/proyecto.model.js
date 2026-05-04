const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Proyecto = sequelize.define('Proyecto', {
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        fechaCreacion: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: false
    });

    return Proyecto;
};
