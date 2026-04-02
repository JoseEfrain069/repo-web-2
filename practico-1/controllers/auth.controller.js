const { sha1Encode } = require('../utils/text.utils');

module.exports = (db) => {
    const Usuario = db.usuario;

    return {
        showRegister: (req, res) => {
            if (req.session.usuario) {
                return res.redirect('/dashboard');
            }

            return res.render('auth/register', {
                error: null,
                valores: {}
            });
        },

        register: async (req, res) => {
            const nombre = (req.body.nombre || '').trim();
            const email = (req.body.email || '').trim().toLowerCase();
            const contrasena = req.body.contrasena || '';
            const valores = { nombre, email };

            try {
                if (!nombre || !email || !contrasena) {
                    return res.render('auth/register', {
                        error: 'Todos los campos son obligatorios.',
                        valores
                    });
                }

                if (contrasena.length < 4) {
                    return res.render('auth/register', {
                        error: 'La contrasena debe tener al menos 4 caracteres.',
                        valores
                    });
                }

                const usuarioExistente = await Usuario.findOne({
                    where: { email }
                });

                if (usuarioExistente) {
                    return res.render('auth/register', {
                        error: 'Ese email ya esta registrado.',
                        valores
                    });
                }

                await Usuario.create({
                    nombre,
                    email,
                    contrasena: sha1Encode(contrasena),
                    rol: 'cliente'
                });

                req.session.flash = {
                    type: 'success',
                    message: 'Cuenta creada correctamente. Ahora podes iniciar sesion.'
                };

                return res.redirect('/login');
            } catch (error) {
                return res.status(500).render('auth/register', {
                    error: 'No se pudo registrar el usuario.',
                    valores
                });
            }
        },

        showLogin: (req, res) => {
            if (req.session.usuario) {
                return res.redirect('/dashboard');
            }

            return res.render('auth/login', {
                error: null,
                valores: {}
            });
        },

        login: async (req, res) => {
            const email = (req.body.email || '').trim().toLowerCase();
            const contrasena = req.body.contrasena || '';

            try {
                const usuario = await Usuario.findOne({
                    where: { email }
                });

                if (!usuario) {
                    return res.render('auth/login', {
                        error: 'Email o contrasena incorrectos.',
                        valores: { email }
                    });
                }

                if (sha1Encode(contrasena) !== usuario.contrasena) {
                    return res.render('auth/login', {
                        error: 'Email o contrasena incorrectos.',
                        valores: { email }
                    });
                }

                req.session.usuario = {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol
                };

                if (usuario.rol === 'admin') {
                    return res.redirect('/admin');
                }

                return res.redirect('/canchas');
            } catch (error) {
                return res.status(500).render('auth/login', {
                    error: 'No se pudo iniciar sesion.',
                    valores: { email }
                });
            }
        },

        logout: (req, res) => {
            req.session.usuario = null;
            req.session.flash = {
                type: 'info',
                message: 'Sesion cerrada.'
            };
            return res.redirect('/login');
        }
    };
};
