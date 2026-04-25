const { uploadTeams } = require('../controllers/leaderboardControllers');
const express = require('express');
const router = express.Router();
const { tokenTrueFalse } = require('../middleware/checkToken');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const {getTeams}= require('../controllers/teamsControllers')

router.get('/', tokenTrueFalse, (req, res) => {
    res.json({ message: `Welcome to the leaderboard, ${req.user}!` });
});
router.post(
    '/upload-teams',
    tokenTrueFalse,                    // tu JWT middleware
    upload.array('images'),            // 'images' debe coincidir con formData.append("images", ...)
    uploadTeams
);
//router.post('/matches-today', tokenTrueFalse, matchestoday);
router.get('/getTeams',tokenTrueFalse,getTeams)
module.exports = router;
