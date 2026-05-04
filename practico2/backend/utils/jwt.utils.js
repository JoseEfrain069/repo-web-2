const jwt = require('jsonwebtoken');

const getSecret = () => {
    return process.env.JWT_SECRET || 'clave_secreta_desarrollo';
};

exports.generateToken = (payload) => {
    return jwt.sign(payload, getSecret(), { expiresIn: '1d' });
};

exports.verifyToken = (token) => {
    try {
        return jwt.verify(token, getSecret());
    } catch (error) {
        return null;
    }
};
