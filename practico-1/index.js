const express = require('express')
const app = express()
const port = 3000
const session = require('express-session');
const bcrypt = require('bcryptjs');
const db = require('./models');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use(session({
    secret: 'reserva-canchas-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 4 }
}));

app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    next();
});

require('./controllers')(app, db);

// Para habilitar la BD
db.sequelize.sync({
    // force: true // drop tables and recreate
}).then(async () => {
    console.log('db resync');

    const adminEmail = 'admin@admin.com';
    const adminExists = await db.usuario.findOne({ where: { email: adminEmail } });

    if (!adminExists) {
        const hash = await bcrypt.hash('admin1234', 10);
        await db.usuario.create({
            nombre: 'Administrador',
            email: adminEmail,
            contrasena: hash,
            rol: 'admin'
        });
        console.log('Usuario admin inicial creado: admin@admin.com / admin1234');
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
