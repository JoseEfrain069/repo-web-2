module.exports = (app, db) => {
    const authController = require('./auth.controller')(db);
    const homeController = require('./home.controller')(db);
    const reservaController = require('./reserva.controller')(db);
    const adminController = require('./admin.controller')(db);
    const { ensureAuth, ensureRole } = require('../middleware/auth');

    app.get('/', homeController.redirectBySession);

    // Auth
    app.get('/register', authController.showRegister);
    app.post('/register', authController.register);
    app.get('/login', authController.showLogin);
    app.post('/login', authController.login);
    app.post('/logout', authController.logout);

    // Cliente
    app.get('/dashboard', ensureAuth, homeController.dashboard);
    app.get('/canchas', ensureAuth, ensureRole('cliente'), homeController.listCanchas);
    app.get('/canchas/:id', ensureAuth, ensureRole('cliente'), homeController.showCanchaDetail);
    app.get('/mis-reservas', ensureAuth, ensureRole('cliente'), reservaController.myReservations);
    app.post('/reservas', ensureAuth, ensureRole('cliente'), reservaController.createReservation);
    app.post('/reservas/:id/cancelar', ensureAuth, ensureRole('cliente'), reservaController.cancelReservation);
    app.post('/resenas', ensureAuth, ensureRole('cliente'), reservaController.createReview);

    // Admin
    app.get('/admin', ensureAuth, ensureRole('admin'), adminController.adminHome);

    app.get('/admin/tipos', ensureAuth, ensureRole('admin'), adminController.listTipos);
    app.get('/admin/tipos/nuevo', ensureAuth, ensureRole('admin'), adminController.newTipoForm);
    app.post('/admin/tipos', ensureAuth, ensureRole('admin'), adminController.createTipo);
    app.get('/admin/tipos/:id/editar', ensureAuth, ensureRole('admin'), adminController.editTipoForm);
    app.post('/admin/tipos/:id/actualizar', ensureAuth, ensureRole('admin'), adminController.updateTipo);
    app.post('/admin/tipos/:id/eliminar', ensureAuth, ensureRole('admin'), adminController.deleteTipo);

    app.get('/admin/canchas', ensureAuth, ensureRole('admin'), adminController.listCanchas);
    app.get('/admin/canchas/nuevo', ensureAuth, ensureRole('admin'), adminController.newCanchaForm);
    app.post('/admin/canchas', ensureAuth, ensureRole('admin'), adminController.createCancha);
    app.get('/admin/canchas/:id/editar', ensureAuth, ensureRole('admin'), adminController.editCanchaForm);
    app.post('/admin/canchas/:id/actualizar', ensureAuth, ensureRole('admin'), adminController.updateCancha);
    app.post('/admin/canchas/:id/eliminar', ensureAuth, ensureRole('admin'), adminController.deleteCancha);

    app.get('/admin/horarios', ensureAuth, ensureRole('admin'), adminController.listHorarios);
    app.get('/admin/horarios/nuevo', ensureAuth, ensureRole('admin'), adminController.newHorarioForm);
    app.post('/admin/horarios', ensureAuth, ensureRole('admin'), adminController.createHorario);
    app.post('/admin/horarios/:id/eliminar', ensureAuth, ensureRole('admin'), adminController.deleteHorario);

    app.get('/admin/reservas', ensureAuth, ensureRole('admin'), adminController.listReservas);
    app.post('/admin/reservas/:id/estado', ensureAuth, ensureRole('admin'), adminController.updateReservaEstado);

    app.get('/admin/resenas', ensureAuth, ensureRole('admin'), adminController.listResenas);
};
