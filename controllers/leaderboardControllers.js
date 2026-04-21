const {connectSQLServer, mssql} = require('../DB/databaseConfig');
const { cloudinary, upload } = require('../Helpers/cloudinaryHelper');

async function uploadTeams(req, res) {
    try {
        const files = req.files;
        console.log('Archivos recibidos:', files);
        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No se recibieron imágenes' });
        }
        // 1. Mapeamos cada archivo del buffer para subirlo a Cloudinary
        const uploadPromises = files.map(file => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { 
                        folder: 'liga_guatemala_teams', // Carpeta en tu Cloudinary
                        resource_type: 'image'
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result); // 'result' es donde vive la METADATA
                    }
                );           
                // 2. Enviamos el buffer directamente a la nube
                stream.end(file.buffer);
            });
        });

        // 3. Esperamos a que todas las imágenes se suban
        const cloudinaryResults = await Promise.all(uploadPromises);
        const teamData={
            team: req.body.team,
            stadium: req.body.stadium,
            images: cloudinaryResults.map(img => img.secure_url) // Solo guardamos las URLs de las imágenes
        }
        console.log('Datos del equipo a insertar en DB:', teamData);
        var pool = await connectSQLServer();
    const result= await Promise.all(
    teamData.team.map((team, i) => {
        return pool.request()
            .input('club_name', mssql.NVarChar(50), team)
            .input('logotipo', mssql.NVarChar(255), teamData.images[i])
            .input('estadio', mssql.NVarChar(50), teamData.stadium[i])
            .query(`
                INSERT INTO clubs (club_name, logotipo, estadio) 
                VALUES (@club_name, @logotipo, @estadio)
            `);
    }));
    if(result.some(r => r.rowsAffected[0] === 0)) {
        return res.status(500).json({ message: 'Error al insertar datos en la base de datos' });
    }
    res.status(200).json({
        message: 'Equipo(s) subido(s) con éxito a Cloudinary y guardado(s) en la base de datos',
    });
    } catch (error) {
        console.error('Error en Cloudinary Upload:', error);
        res.status(500).json({ 
            message: 'Error al procesar las imágenes', 
            error: error.message 
        });
    }
}
async function matchestoday(req, res) {
    const matches = req.body;

    if (!Array.isArray(matches) || matches.length === 0) {
        return res.status(400).json({ message: 'No matches provided' });
    }

    for (const match of matches) {
        const { home_club_id, away_club_id, home_score, away_score, match_date } = match;

        if (
            home_club_id == null ||
            away_club_id == null ||
            home_score == null ||
            away_score == null ||
            !match_date
        ) {
            return res.status(400).json({ message: 'All match details are required for each match' });
        }
    }
    try {
        const pool = await connectSQLServer();
        const results = await Promise.all(matches.map(match => {
            return pool.request()
                .input('home_club_id', mssql.Int, match.home_club_id)
                .input('away_club_id', mssql.Int, match.away_club_id)
                .input('home_score', mssql.Int, match.home_score)
                .input('away_score', mssql.Int, match.away_score)
                .input('match_date', mssql.DateTime, match.match_date)
                .query(`
                    INSERT INTO matches (home_club_id, away_club_id, home_score, away_score, match_date)
                    VALUES (@home_club_id, @away_club_id, @home_score, @away_score, @match_date)
                `);
        }));
        if (results.some(result => result.rowsAffected[0] === 0)) {
            return res.status(500).json({ message: 'Error inserting matches into the database' });
        }
        return res.status(200).json({ message: 'Matches inserted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error fetching matches', error: error.message });
    }
}
async function updateLeaderboard(req, res) {
const matches = req.body;
    if (!Array.isArray(matches) || matches.length === 0) {
        return res.status(400).json({ message: 'No matches provided' });
    }
    for (const match of matches) {
        const { home_club_id, away_club_id, home_score, away_score, match_date } = match;
        if (
            home_club_id == null ||
            away_club_id == null ||
            home_score == null ||
            away_score == null ||
            !match_date
        ) {
            return res.status(400).json({ message: 'All match details are required for each match' });
        }
    }
    console.log('Received matches for leaderboard update:', matches);
    try {
        const pool = await connectSQLServer();
        const updatePromises = matches.map(async (match) => {

    // LOCAL
    await pool.request()
        .input('home_club_id', mssql.Int, match.home_club_id)
        .input('away_score', mssql.Int, match.away_score)
        .input('home_score', mssql.Int, match.home_score)
        .query(`UPDATE clubs set points = points + CASE 
            WHEN @home_score > @away_score THEN 3
            WHEN @home_score = @away_score THEN 1
            ELSE 0
        END
        goals_for = goals_for + @home_score,
        goals_against = goals_against + @away_score
        wins = wins + CASE 
            WHEN @home_score > @away_score THEN 1
            ELSE 0
        END,
        draws = draws + CASE 
            WHEN @home_score = @away_score THEN 1 else 0 end
        losses = losses + CASE
            WHEN @home_score < @away_score THEN 1 else 0 end
        WHERE club_id = @home_club_id`);

    // VISITANTE
    await pool.request()
        .input('away_club_id', mssql.Int, match.away_club_id)
        .input('home_score', mssql.Int, match.home_score)
        .input('away_score', mssql.Int, match.away_score)
        .query(`UPDATE clubs set points = points + CASE 
            WHEN @away_score > @home_score THEN 3
            WHEN @away_score = @home_score THEN 1
            ELSE 0
        END
        goals_for = goals_for + @away_score,
        goals_against = goals_against + @home_score
        wins = wins + CASE 
            WHEN @away_score > @home_score THEN 1
            ELSE 0
        END,
        draws = draws + CASE 
            WHEN @away_score = @home_score THEN 1 else 0 end
        losses = losses + CASE
            WHEN @away_score < @home_score THEN 1 else 0 end
        WHERE club_id = @away_club_id`);
});
    } catch (error) {
        console.error('Error updating leaderboard:', error);
        res.status(500).json({ message: 'Error updating leaderboard', error: error.message });
    }
}
module.exports = {
    uploadTeams,
    matchestoday,
    updateLeaderboard
};