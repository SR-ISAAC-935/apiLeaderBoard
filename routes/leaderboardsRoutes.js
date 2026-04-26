const { uploadTeams } = require('../controllers/leaderboardControllers');
const express = require('express');
const router = express.Router();
const { tokenTrueFalse } = require('../middleware/checkToken');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { createMatchPlayed, getTeams } = require('../controllers/teamsControllers')
const { updateScores } = require('../controllers/ScoresControllers')
// En leaderboard router agrega:
const { getPositions } = require('../controllers/ScoresControllers');
router.get('/positions/:season_id', tokenTrueFalse, getPositions);
router.get('/', tokenTrueFalse, (req, res) => {
    res.json({ message: `Welcome to the leaderboard, ${req.user}!` });
});
router.post(
    '/upload-teams',
    tokenTrueFalse,                    // tu JWT middleware
    upload.array('images'),            // 'images' debe coincidir con formData.append("images", ...)
    uploadTeams
);
router.post('/create-matches', tokenTrueFalse, createMatchPlayed);
router.get('/getTeams', tokenTrueFalse, getTeams)
router.put('/update-scores', tokenTrueFalse, updateScores);
module.exports = router;
