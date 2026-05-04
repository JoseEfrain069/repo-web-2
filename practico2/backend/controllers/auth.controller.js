const userService = require('../services/user.service');
const { sha1Encode } = require('../utils/text.utils');
const { generateToken } = require('../utils/jwt.utils');

exports.register = async (req, res) => {
    const { nombre, email, password } = req.body;
    const existingUser = await userService.findUserByEmail(email);

    if (existingUser) {
        return res.status(400).json({ message: 'El email ya esta registrado' });
    }

    const user = await userService.createUser({
        nombre,
        email,
        password: sha1Encode(password)
    });

    res.status(201).json({
        message: 'Usuario registrado correctamente',
        usuario: {
            id: user.id,
            nombre: user.nombre,
            email: user.email
        }
    });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await userService.findUserByEmail(email);

    if (!user || user.password !== sha1Encode(password)) {
        return res.status(401).json({ message: 'Email o contrasena incorrectos' });
    }

    const token = generateToken({ id: user.id });

    res.json({
        token,
        usuario: {
            id: user.id,
            nombre: user.nombre,
            email: user.email
        }
    });
};
