const express = require('express'); 
const cors = require('cors'); // 👈 IMPORTANTE
const app = express();

// 🔥 CONFIGURACIÓN CORS
app.use(cors({
    origin: '*', // permite todos (dev)
}));

app.use(express.json()); 

// Rutas
const auth = require('./routes/auth');
const responses = require('./routes/responses');
const leaderboard = require('./routes/leaderboardsRoutes');
const { connectSQLServer } = require('./DB/databaseConfig');

app.use('/auth', auth);
app.use('/', responses);
app.use('/leaderboard', leaderboard);

// ⚠️ ESTE NO VA COMO MIDDLEWARE
// app.use(connectSQLServer); ❌

// Servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Server running`);
});