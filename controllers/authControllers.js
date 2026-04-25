const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectSQLServer,connectToDatabase,mssql } = require('../DB/databaseConfig');
const { createTokenSesion } = require('./tokenSessions');
const createUser = async (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const hashPassword = await bcrypt.hash(password, 11);
        const pool = await connectSQLServer();
        const result = await pool.request()
            .input('username', mssql.NVarChar(50), username)
            .input('password', mssql.NVarChar(123), hashPassword)
            .query(`INSERT INTO sessions (username, password) VALUES (@username, @password)`);

        if (result.rowsAffected[0] === 0) {
            return res.status(500).json({ message: 'Failed to create user' });
        }

        res.status(200).json({ message: 'User created successfully', username });

    } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(500).json({ message: `Internal server error ${error.message}` });
    }
};

const getUser = async (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const pool = await connectSQLServer();

        const result = await pool.request()
            .input('username', mssql.NVarChar(50), username)
            .query(`SELECT * FROM sessions WHERE username = @username`);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.recordset[0];

        // 🔥 VALIDACIÓN REAL (esto te faltaba)
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 🔥 generar token correctamente
       const token = createTokenSesion(username);

res.cookie('token', token, { 
  httpOnly: true,     // JS del frontend NO puede leerla (protege de XSS)
  secure: true,       // Solo HTTPS
  sameSite: 'Strict', // Protege de CSRF
  maxAge: 24 * 60 * 60 * 1000 // 1 día en ms (importante agregarlo!)
});

return res.status(200).json({
  message: 'Login successful',
    token,
  user: { username: user.username }
  // ❌ NO envíes el token en el body si ya va en cookie
});

    } catch (error) {
        console.error('Error fetching user:', error.message);
        res.status(500).json({ message: `Internal server error ${error.message}` });
    }
};
const logoutUser = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logout successful' });
};
module.exports = {
    createUser,
    getUser,
    logoutUser
};
