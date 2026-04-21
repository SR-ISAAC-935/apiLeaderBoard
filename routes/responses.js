const express= require('express');
const router = express.Router();
const { tokenTrueFalse } = require('../middleware/checkToken');

router.get('/responses', tokenTrueFalse, (req, res) => {
    res.json({ message: 'This is the responses route' });
});
router.get('/', (req, res) => { 
res.json({ message: 'Welcome to the Real-Time Leaderboard API' });

});

module.exports = router;