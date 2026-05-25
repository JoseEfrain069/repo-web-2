const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { SECRET } = require('../middleware/auth');

exports.register = async (req, res) => {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role)
        return res.status(400).json({ error: 'Faltan campos' });
    if (!['creator', 'follower'].includes(role))
        return res.status(400).json({ error: 'Rol invalido' });

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'El email ya esta registrado' });

    const hash = bcrypt.hashSync(password, 10);
    const user = await User.create({ username, email, password: hash, role });

    res.status(201).json({ message: 'Usuario registrado', id: user.id });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !bcrypt.compareSync(password, user.password))
        return res.status(401).json({ error: 'Credenciales incorrectas' });

    const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, SECRET, { expiresIn: '7d' });
    res.json({ token, role: user.role, username: user.username, id: user.id });
};
