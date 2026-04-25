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
async function createMatchPlayed(req, res){
    try {
        const{home_club_id, away_club_id,home_score, away_score, match_date, jorney, season}=req.body|null;
        console.log(req.body);
        const homeIdClubs= Array.isArray(req.body.home_club_id)? req.body.home_club_id:[req.body.home_club_id]
        const awayIdClubs=Array.isArray(req.body.awa_club_id)? req.body.away_club_id:[req.body.awa_club_id]
        const goalsHome=Array.isArray(req.body.home_score)? req.body.home_score:[req.body.home_score]
        const goalsAway=Array.isArray(req.body.away_score)? req.body.away_score:[req.body.away_score]
        const match_dates= Array.isArray(req.body.match_date)? req.body.match_date:[req.body.match_date]
        const journey= Array.isArray(req.body.journey)? req.body.journey:[req.body.journey]
        const seasons = Array.isArray(req.body.season)? req.body.season:[req.body.season]
        const  journey_matches={home_club_id:homeIdClubs,
            away_club_id:awayIdClubs,
            home_score:goalsHome,
            away_score:goalsAway,
            match_date:match_dates,
            journey:jorney,
            season:seasons
        }
        console.log(journey_matches);
        const pool= await connectSQLServer();
        const result= await pool.request().query('');
    } catch (error) {
        
        return res.status(400).json({message: `algo salio muy mal ${error.message}`})
    }
}

module.exports={

    getTeams,
}
