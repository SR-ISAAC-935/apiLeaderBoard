const { uploadTeams } = require('../controllers/leaderboardControllers');
const express = require('express');
const router = express.Router();
const { tokenTrueFalse } = require('../middleware/checkToken');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { createMatchPlayed, getTeams } = require('../controllers/teamsControllers');
const { updateScores, getPositions } = require('../controllers/ScoresControllers'); // ✅ un solo import

router.get('/', tokenTrueFalse, (req, res) => {
    res.json({ message: `Welcome to the leaderboard, ${req.user}!` });
});
router.post('/upload-teams', tokenTrueFalse, upload.array('images'), uploadTeams);
router.post('/create-matches', tokenTrueFalse, createMatchPlayed);
router.get('/getTeams', tokenTrueFalse, getTeams);
router.put('/update-scores', tokenTrueFalse, updateScores);
router.get('/positions/:season_id', getPositions); // ✅ sin token

module.exports = router;