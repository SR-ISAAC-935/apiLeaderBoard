const { uploadTeams,matchestoday } = require('../controllers/leaderboardControllers');
const express = require('express');
const router = express.Router();
const { tokenTrueFalse } = require('../middleware/checkToken');
const { upload } = require('../Helpers/cloudinaryHelper');

router.get('/', tokenTrueFalse, (req, res) => {
    res.json({ message: `Welcome to the leaderboard, ${req.user}!` });
});
router.post('/upload-teams', tokenTrueFalse, upload.array('images', 10), uploadTeams);
router.post('/matches-today', tokenTrueFalse, matchestoday);
module.exports = router;