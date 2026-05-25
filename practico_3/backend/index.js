require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

require('./routes')(app);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Error interno del servidor' });
});

sequelize.sync().then(() => {
    console.log('Base de datos sincronizada');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Backend corriendo en http://localhost:${PORT}`));
});
