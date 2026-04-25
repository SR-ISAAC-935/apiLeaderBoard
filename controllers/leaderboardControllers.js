const { connectSQLServer, mssql } = require('../DB/databaseConfig');
const { cloudinary } = require('../Helpers/cloudinaryHelper');

async function uploadTeams(req, res) {
    try {
        const files = req.files;
        console.log('Archivos recibidos:', files?.length);

        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No se recibieron imágenes' });
        }

        // ✅ CORREGIDO: files.map() directo, no [files.map](...)
        const uploadPromises = files.map(file => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'liga_guatemala_teams',
                        resource_type: 'image'
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                stream.end(file.buffer);
            });
        });

        const cloudinaryResults = await Promise.all(uploadPromises);

        // ✅ CORREGIDO: req.body.team directo, no [req.body.team](...)
        const teams = Array.isArray(req.body.team)
            ? req.body.team
            : [req.body.team];

        const stadiums = Array.isArray(req.body.stadium)
            ? req.body.stadium
            : [req.body.stadium];

        console.log("TEAMS:", teams.length);
        console.log("STADIUMS:", stadiums.length);
        console.log("FILES:", files.length);
        console.log("UPLOADS:", cloudinaryResults.length);

        if (
            teams.length !== stadiums.length ||
            teams.length !== cloudinaryResults.length
        ) {
            return res.status(400).json({
                message: 'Datos inconsistentes entre equipos, estadios e imágenes'
            });
        }

        // ✅ CORREGIDO: teams.map() directo
        const dataForSP = teams.map((team, i) => {
            if (!team || !stadiums[i] || !cloudinaryResults[i]) {
                throw new Error(`Datos incompletos en índice ${i}`);
            }
            return {
                club: team,
                stadium: stadiums[i],
                logo: cloudinaryResults[i].secure_url
            };
        });

        const jsonData = JSON.stringify(dataForSP);
        console.log("JSON para SP:", jsonData);

        const pool = await connectSQLServer();
        await pool.request()
            .input('StadiumClubs', mssql.NVarChar(mssql.MAX), jsonData)
            .execute('sp_InsertStadiumsAndClubs');

        return res.status(200).json({
            message: 'Equipos y estadios guardados correctamente 🚀'
        });

    } catch (error) {
        console.error('🔥 ERROR REAL:', error);
        return res.status(500).json({
            message: 'Error al procesar los equipos',
            error: error.message
        });
    }
}

module.exports = { uploadTeams };
