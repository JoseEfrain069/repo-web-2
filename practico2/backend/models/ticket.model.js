const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Ticket = sequelize.define('Ticket', {
        titulo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        estado: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Pendiente'
        },
        fechaCreacion: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        proyectoId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        usuarioAsignadoId: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        timestamps: false
    });

    return Ticket;
};
