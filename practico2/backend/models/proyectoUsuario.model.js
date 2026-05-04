const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ProyectoUsuario = sequelize.define('ProyectoUsuario', {
        usuarioId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        proyectoId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: false
    });

    return ProyectoUsuario;
};
