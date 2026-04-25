const { connectSQLServer, mssql } = require('../DB/databaseConfig');

async function journeyBySeason(req, res) {
    try {
        // ❌ No estabas leyendo season_id del request
        const { season_id } = req.params; // ✅ viene de la URL /journey/:season_id

        if (!season_id) {
            return res.status(400).json({ message: 'season_id es requerido' });
        }

        const pool = await connectSQLServer();
        const response = await pool.request()
            .input('season_id', mssql.Int, season_id) // ✅ bind del parámetro
            .query(`
                SELECT js.id, js.journey 
                FROM dbo.jorney_season js
                WHERE js.season_journey = @season_id
                ORDER BY js.journey
            `);

        return res.status(200).json({ 
            message: 'Jornadas encontradas', 
            data: response.recordset // ✅ solo el array, no todo el objeto
        });

    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}` }); // ✅ 500 no 400
    }
}

async function journeyByDate(req, res) {
    try {
        // ❌ No estabas leyendo journey_id del request
        const { journey_id } = req.params; // ✅ viene de la URL /dates/:journey_id

        if (!journey_id) {
            return res.status(400).json({ message: 'journey_id es requerido' });
        }

        const pool = await connectSQLServer();
        const response = await pool.request()
            .input('journey_id', mssql.Int, journey_id) // ✅ bind del parámetro
            .query(`
                SELECT DISTINCT CAST(match_date AS DATE) AS fecha
                FROM dbo.matches
                WHERE journey = @journey_id
                ORDER BY fecha
            `);

        return res.status(200).json({ 
            message: 'Fechas encontradas', 
            data: response.recordset // ✅
        });

    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}` });
    }
}

async function matchByJourneyAndDate(req, res) {
    try {
        // ❌ No estabas leyendo ningún parámetro
        const { journey_id, fecha } = req.params; // ✅ /matches/:journey_id/:fecha

        if (!journey_id || !fecha) {
            return res.status(400).json({ message: 'journey_id y fecha son requeridos' });
        }

        const pool = await connectSQLServer();
        const response = await pool.request()
            .input('journey_id', mssql.Int,          journey_id) // ✅
            .input('fecha',      mssql.Date,          fecha)      // ✅
            .query(`
                SELECT 
                    m.id,
                    m.home_score,
                    m.away_score,
                    m.match_date,
                    local.id            AS home_club_id,
                    local.club_name     AS equipo_local,
                    local.logotipo      AS logo_local,
                    visitante.id        AS away_club_id,
                    visitante.club_name AS equipo_visitante,
                    visitante.logotipo  AS logo_visitante
                FROM dbo.matches m
                JOIN dbo.clubs local     ON m.home_club_id = local.id
                JOIN dbo.clubs visitante ON m.away_club_id = visitante.id
                WHERE m.journey = @journey_id
                AND CAST(m.match_date AS DATE) = @fecha
                ORDER BY m.match_date
            `);

        return res.status(200).json({ 
            message: 'Partidos encontrados', 
            data: response.recordset // ✅
        });

    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}` });
    }
}

// ❌ module.exports() — exports no es una función, no se llama con ()
// ✅ es un objeto
module.exports = {
    journeyBySeason,
    journeyByDate,
    matchByJourneyAndDate
};