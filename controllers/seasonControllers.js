const { connectSQLServer, mssql } = require('../DB/databaseConfig');

// seasonController.js

async function createSeason(req, res) {
    try {
        const { current_season } = req.body;

        if (!current_season) {
            return res.status(400).json({ message: 'La temporada es requerida' });
        }

        // Validar formato "2025/26"
        const regex = /^\d{4}\/\d{2}$/;
        if (!regex.test(current_season)) {
            return res.status(400).json({ message: 'Formato inválido. Usa: 2025/26' });
        }

        const pool = await connectSQLServer();
        await pool.request()
            .input('current_season', mssql.NVarChar(7), current_season)
            .query(`
                IF NOT EXISTS (SELECT 1 FROM dbo.season WHERE current_season = @current_season)
                    INSERT INTO dbo.season (current_season) VALUES (@current_season)
                ELSE
                    RAISERROR('La temporada ya existe', 16, 1)
            `);

        return res.status(200).json({ message: `Temporada ${current_season} creada ✅` });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

async function getSeasons(req, res) {
    try {
        const pool = await connectSQLServer();
        const result = await pool.request()
            .query('SELECT id, current_season FROM dbo.season ORDER BY id DESC');

        return res.status(200).json({ result: result.recordset });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

module.exports = { createSeason, getSeasons };