const userService = require('../services/user.service');
const { verifyToken } = require('../utils/jwt.utils');

module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Token requerido' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Formato de token invalido' });
    }

    const payload = verifyToken(parts[1]);
    if (!payload || !payload.id) {
        return res.status(401).json({ message: 'Token invalido' });
    }

    const user = await userService.findUserById(payload.id);
    if (!user) {
        return res.status(401).json({ message: 'Usuario no autorizado' });
    }

    req.user = user;
    next();
};
