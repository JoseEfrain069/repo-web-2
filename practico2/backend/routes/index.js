module.exports = (app) => {
    app.use('/auth', require('./auth.routes'));
    app.use('/proyectos', require('./proyecto.routes'));
    app.use('/', require('./ticket.routes'));
};
