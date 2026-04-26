const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io'); // ✅ typo corregido
const cookieparser = require('cookie-parser');
const seasonRoutes = require('./routes/seasonRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [
            'https://mictlantable.netlify.app/', // dev
        ],
        methods: ['GET', 'POST', 'PUT']
    }
});

module.exports = { io }; // ✅ export nombrado

io.on('connection', (socket) => {
    console.log(`🟢 Cliente conectado: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`🔴 Cliente desconectado: ${socket.id}`);
    });
});

// CORS para HTTP normal
const allowedOrigins = ['https://mictlantable.netlify.app/'];
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
app.use(express.json());

// Rutas
const auth = require('./routes/auth');
const responses = require('./routes/responses');
const leaderboard = require('./routes/leaderboardsRoutes');
const matches = require('./routes/matchesRoutes');

app.use('/auth', auth);
app.use('/', responses);
app.use('/leaderboard', leaderboard);
app.use('/seasons', seasonRoutes);
app.use('/matches', matches);

// ✅ server.listen en vez de app.listen
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
