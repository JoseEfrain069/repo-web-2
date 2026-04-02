const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require('./models');
const { sha1Encode } = require('./utils/text.utils');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'reserva-canchas-secret',
    resave: false,
    saveUninitialized: false,
}));

app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    res.locals.flash = req.session.flash || null;
    delete req.session.flash;
    next();
});

require('./controllers')(app, db);


db.sequelize.sync({
}).then(async () => {
    console.log('db resync');

    const adminEmail = 'admin@admin.com';
    const adminExists = await db.usuario.findOne({ where: { email: adminEmail } });
    const adminPassword = sha1Encode('admin1234');

    if (!adminExists) {
        await db.usuario.create({
            nombre: 'Administrador',
            email: adminEmail,
            contrasena: adminPassword,
            rol: 'admin'
        });
        console.log('Usuario admin inicial creado: admin@admin.com / admin1234');
    } else if (adminExists.contrasena !== adminPassword) {
        adminExists.contrasena = adminPassword;
        adminExists.rol = 'admin';
        await adminExists.save();
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
