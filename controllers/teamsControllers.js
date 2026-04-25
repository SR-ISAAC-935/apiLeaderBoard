const {connectSQLServer ,mssql}= require('../DB/databaseConfig');
// En tu backend, donde está el getTeams
async function getTeams(req, res) {
    try {
        const pool = await connectSQLServer();
        const result = await pool.request().query(`
            SELECT 
                c.id,
                c.club_name,
                c.estadio,
                c.logotipo,
                s.nombreStadium    -- ✅ agregamos el nombre
            FROM dbo.clubs c
            LEFT JOIN dbo.stadiums s ON c.estadio = s.id_stadium
        `);

        return res.status(200).json({ result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}
async function getMatchesPlayed(req,res){

    try {
        const pool=await connectSQLServer();
        const result= await pool.request().query('select id, club_name from clubs left join matches on home_club_id, away_club_id where home_club_id=id  ')
    } catch (error) {
        
    }
}
async function createMatchPlayed(req, res) {
    try {
        // ✅ season_id y journey vienen UNA SOLA VEZ, no por partido
        const { season_id, journey, partidos } = req.body;

        // ✅ Validaciones básicas
        if (!season_id || !journey) {
            return res.status(400).json({ message: 'Temporada y jornada son requeridas' });
        }

        if (!Array.isArray(partidos) || partidos.length === 0) {
            return res.status(400).json({ message: 'No hay partidos para guardar' });
        }

        // ✅ Validar que cada partido tenga los campos necesarios
        for (let i = 0; i < partidos.length; i++) {
            const p = partidos[i];
            if (!p.home_club_id || !p.away_club_id || !p.match_date) {
                return res.status(400).json({ 
                    message: `Partido ${i + 1} tiene datos incompletos` 
                });
            }
            if (p.home_club_id === p.away_club_id) {
                return res.status(400).json({ 
                    message: `Partido ${i + 1}: el local y visitante no pueden ser el mismo equipo` 
                });
            }
        }

        const pool = await connectSQLServer();

        // ✅ Paso 1: Crear jornada si no existe y obtener su ID
        const jornadaResult = await pool.request()
            .input('journey',    mssql.Int,         journey)
            .input('season_id',  mssql.Int,          season_id)
            .query(`
                IF NOT EXISTS (
                    SELECT 1 FROM dbo.jorney_season 
                    WHERE journey = @journey AND season_journey = @season_id
                )
                    INSERT INTO dbo.jorney_season (journey, season_journey) 
                    VALUES (@journey, @season_id);

                SELECT id FROM dbo.jorney_season 
                WHERE journey = @journey AND season_journey = @season_id;
            `);

        const journey_id = jornadaResult.recordset[0].id;
        console.log("Jornada ID:", journey_id);

        // ✅ Paso 2: Construir JSON con el journey_id ya resuelto
        const matchesData = partidos.map(p => ({
            home_club_id: p.home_club_id,
            away_club_id: p.away_club_id,
            home_score:   p.home_score  ?? 0,
            away_score:   p.away_score  ?? 0,
            match_date:   p.match_date  || null,
            journey:      journey_id        // ✅ ID real de jorney_season
        }));

        console.log("Partidos a insertar:", matchesData);

        // ✅ Paso 3: Insertar partidos via SP
        await pool.request()
            .input('MatchesData', mssql.NVarChar(mssql.MAX), JSON.stringify(matchesData))
            .execute('sp_InsertMatches');

        return res.status(200).json({ 
            message: `Jornada ${journey} guardada con ${partidos.length} partidos ✅` 
        });

    } catch (error) {
        console.error('ERROR:', error);
        return res.status(500).json({ message: `Algo salió muy mal: ${error.message}` });
    }
}
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


module.exports={
    getTeams,
    createMatchPlayed,
    createSeason,
    getSeasons
}
