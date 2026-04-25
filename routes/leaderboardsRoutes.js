const { uploadTeams,matchestoday } = require('../controllers/leaderboardControllers');
const express = require('express');
const router = express.Router();
const { tokenTrueFalse } = require('../middleware/checkToken');
const { upload } = require('../Helpers/cloudinaryHelper');
const {getTeams}= require('../controllers/teamsControllers')

router.get('/', tokenTrueFalse, (req, res) => {
    res.json({ message: `Welcome to the leaderboard, ${req.user}!` });
});
router.post('/upload-teams', tokenTrueFalse, upload.array('images',15), uploadTeams);
router.post('/matches-today', tokenTrueFalse, matchestoday);
router.get('/getTeams',tokenTrueFalse,getTeams)
module.exports = router;
