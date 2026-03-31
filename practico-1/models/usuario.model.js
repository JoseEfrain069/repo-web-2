module.exports = (sequelize, Sequelize) => {
    const Usuario = sequelize.define('usuario', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nombre: {
            type: Sequelize.STRING,
            allowNull: false
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        contrasena: {
            type: Sequelize.STRING,
            allowNull: false
        },
        rol: {
            type: Sequelize.ENUM('admin', 'cliente'),
            allowNull: false,
            defaultValue: 'cliente'
        }
    });

    return Usuario;
};
