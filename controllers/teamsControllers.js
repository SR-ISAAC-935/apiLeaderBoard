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
        // ❌ req.body|null no funciona en destructuring
        // ✅ simplemente usa req.body directo
        const {
            home_club_id,
            away_club_id,
            home_score,
            away_score,
            match_date,
            journey,  // ❌ tenías "jorney" (typo) mezclado con "journey"
            season
        } = req.body;

        // ❌ "awa_club_id" typo — faltaba la 'y'
        const homeIdClubs  = Array.isArray(home_club_id) ? home_club_id  : [home_club_id];
        const awayIdClubs  = Array.isArray(away_club_id) ? away_club_id  : [away_club_id];
        const goalsHome    = Array.isArray(home_score)   ? home_score    : [home_score];
        const goalsAway    = Array.isArray(away_score)   ? away_score    : [away_score];
        const match_dates  = Array.isArray(match_date)   ? match_date    : [match_date];
        const journeys     = Array.isArray(journey)      ? journey       : [journey];
        const seasons      = Array.isArray(season)       ? season        : [season];

        // ✅ Validación antes de continuar
        if (
            homeIdClubs.length !== awayIdClubs.length ||
            homeIdClubs.length !== goalsHome.length   ||
            homeIdClubs.length !== goalsAway.length   ||
            homeIdClubs.length !== journeys.length
        ) {
            return res.status(400).json({ message: 'Datos inconsistentes entre partidos' });
        }

        // ✅ Construir JSON para el SP (igual que hiciste con equipos)
        const matchesData = homeIdClubs.map((_, i) => ({
            home_club_id: homeIdClubs[i],
            away_club_id: awayIdClubs[i],
            home_score:   goalsHome[i],
            away_score:   goalsAway[i],
            match_date:   match_dates[i] || null,
            journey:      journeys[i],
            season:       seasons[i]
        }));

        console.log("Partidos a insertar:", matchesData);

        const jsonData = JSON.stringify(matchesData);

        const pool = await connectSQLServer();
        await pool.request()
            .input('MatchesData', mssql.NVarChar(mssql.MAX), jsonData)
            .execute('sp_InsertMatches'); // ✅ SP igual al patrón que ya usas

        return res.status(200).json({ message: 'Partidos guardados correctamente ✅' });

    } catch (error) {
        console.error('ERROR:', error);
        return res.status(500).json({ message: `Algo salió muy mal: ${error.message}` });
    }
}

module.exports={

    getTeams,
}
