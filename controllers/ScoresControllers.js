// controllers/scoresController.js
const { connectSQLServer, mssql } = require('../DB/databaseConfig');
const { redis } = require('../Helpers/redisHelper');

async function updateScores(req, res) {
    try {
        const { partidos, season_id } = req.body;

        if (!partidos || !Array.isArray(partidos) || partidos.length === 0) {
            return res.status(400).json({ message: 'No se recibieron partidos' });
        }

        if (!season_id) {
            return res.status(400).json({ message: 'season_id es requerido para invalidar caché' });
        }

        for (let i = 0; i < partidos.length; i++) {
            const p = partidos[i];
            if (!p.id || p.home_score === undefined || p.away_score === undefined) {
                return res.status(400).json({ 
                    message: `Partido ${i + 1} tiene datos incompletos` 
                });
            }
            if (p.home_score < 0 || p.away_score < 0) {
                return res.status(400).json({ 
                    message: `Partido ${i + 1}: los goles no pueden ser negativos` 
                });
            }
        }

        const pool = await connectSQLServer();

        // 1️⃣ Actualizar marcadores en BD
        await pool.request()
            .input('ScoresData', mssql.NVarChar(mssql.MAX), JSON.stringify(partidos.map(p => ({
                id:         p.id,
                home_score: p.home_score,
                away_score: p.away_score
            }))))
            .execute('sp_UpdateScores'); // actualiza matches + recalcula positions

        // 2️⃣ Invalidar caché de Redis
        const cacheKey = `positions:season:${season_id}`;
        await redis.del(cacheKey);
        console.log(`🗑️ Caché invalidado: ${cacheKey}`);

        return res.status(200).json({ message: 'Marcadores actualizados ✅' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: `Error: ${error.message}` });
    }
}

// ✅ GET positions — con caché Redis
async function getPositions(req, res) {
    try {
        const { season_id } = req.params;

        if (!season_id) {
            return res.status(400).json({ message: 'season_id es requerido' });
        }

        const cacheKey = `positions:season:${season_id}`;

        // 1️⃣ Buscar en Redis primero
        const cached = await redis.get(cacheKey);
        if (cached) {
            console.log('✅ Redis cache hit');
            return res.status(200).json({ 
                message: 'Posiciones encontradas', 
                data: cached,
                source: 'cache'     // útil para debug
            });
        }

        // 2️⃣ Si no está en caché, consultar BD
        console.log('🔄 Redis cache miss — consultando BD');
        const pool = await connectSQLServer();
        const result = await pool.request()
            .input('season_id', mssql.Int, season_id)
            .query(`
                SELECT 
                    p.id,
                    c.club_name,
                    c.logotipo,
                    p.matches_played,
                    p.points,
                    p.wins,
                    p.draws,
                    p.losses,
                    p.goals_for,
                    p.goals_against,
                    p.goals_for - p.goals_against AS goal_difference
                FROM dbo.positions p
                JOIN dbo.clubs c ON p.club_id = c.id
                JOIN dbo.jorney_season js ON p.journey = js.id
                WHERE js.season_journey = @season_id
                ORDER BY p.points DESC, goal_difference DESC, p.goals_for DESC
            `);

        // 3️⃣ Guardar en Redis por 5 minutos
        await redis.set(cacheKey, result.recordset, { ex: 300 });

        return res.status(200).json({ 
            message: 'Posiciones encontradas', 
            data: result.recordset,
            source: 'database'
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: `Error: ${error.message}` });
    }
}


module.exports = { updateScores 
    , getPositions
};