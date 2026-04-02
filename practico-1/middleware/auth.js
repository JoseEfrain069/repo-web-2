function ensureAuth(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect('/login');
    }
    next();
}

function ensureRole(role) {
    return (req, res, next) => {
        if (!req.session.usuario) {
            return res.redirect('/login');
        }
        if (req.session.usuario.rol !== role) {
            return res.status(403).render('error', {
                titulo: 'Acceso denegado',
                mensaje: 'No tenes permisos para acceder a esta seccion.'
            });
        }
        next();
    };
}

module.exports = {
    ensureAuth,
    ensureRole
};
