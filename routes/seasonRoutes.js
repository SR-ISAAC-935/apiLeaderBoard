const express = require('express');
const router = express.Router();
const { tokenTrueFalse } = require('../middleware/checkToken');
const { createSeason, getSeasons} = require('../controllers/seasonControllers')

router.get('/', tokenTrueFalse, getSeasons);
router.post('/create', tokenTrueFalse, createSeason);
module.exports = router;
