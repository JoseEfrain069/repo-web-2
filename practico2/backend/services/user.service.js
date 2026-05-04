const db = require('../models');

exports.createUser = async (data) => {
    return db.usuario.create(data);
};

exports.findUserByEmail = async (email) => {
    return db.usuario.findOne({ where: { email } });
};

exports.findUserById = async (id) => {
    return db.usuario.findByPk(id, {
        attributes: ['id', 'nombre', 'email']
    });
};
