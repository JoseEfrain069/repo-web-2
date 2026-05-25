module.exports = (app) => {
    app.use('/api/auth',      require('./auth.routes'));
    app.use('/api/creators',  require('./creator.routes'));
    app.use('/api/followers', require('./follower.routes'));
};
