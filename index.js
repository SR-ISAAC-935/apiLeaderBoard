const express = require('express'); 
const app = express();

// 1. Importaciones de rutas
const auth = require('./routes/auth');
const responses = require('./routes/responses');
const leaderboard = require('./routes/leaderboardsRoutes');
const { connectSQLServer } = require('./DB/databaseConfig');
// 2. Middlewares de configuración (SIEMPRE ANTES DE LAS RUTAS)
app.use(express.json()); 

// 3. Definición de rutas
app.use('/auth', auth);
app.use('/', responses);
app.use('/leaderboard', leaderboard);
app.use(connectSQLServer); // Middleware para conectar a la base de datos
// 4. Encendido del servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Server is running on: http://localhost:${port}/`);
});