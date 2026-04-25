const express = require('express'); 
const cors = require('cors'); // 👈 IMPORTANTE
const app = express();
const cookieparser=require('cookie-parser')
const cookieparser=require('cookie-parser')

const allowedOrigins = [
  'http://localhost:5173'   // dev
];

// 🔥 CONFIGURACIÓN CORS

const allowedOrigins = [
  'http://localhost:5173'   // dev
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));


app.use(cookieparser());
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(cookieparser());
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
