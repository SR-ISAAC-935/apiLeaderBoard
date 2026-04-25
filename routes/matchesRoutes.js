const express = require('express');
const router = express.Router();
const { tokenTrueFalse } = require("../middleware/checkToken");
const {journeyByDate,journeyBySeason,matchByJourneyAndDate} =require('../controllers/matchControllers')

router.get('/journeys/:season_id',          tokenTrueFalse, journeyBySeason);
router.get('/dates/:journey_id',            tokenTrueFalse, journeyByDate);
router.get('/matches/:journey_id/:fecha',   tokenTrueFalse, matchByJourneyAndDate);
module.exports = router;
