const jwt = require('jsonwebtoken');
const SECRET = 'onlyflans_secret';

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        req.user = jwt.verify(token, SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Token invalido' });
    }
}

function requireRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) return res.status(403).json({ error: 'Acceso denegado' });
        next();
    };
}

module.exports = { authMiddleware, requireRole, SECRET };
