const express = require('express');
const router = express.Router();
const { createUser,getUser,logoutUser } = require('../controllers/authControllers');   

router.post('/login', getUser);
router.post('/register', createUser);
router.post('/logout', logoutUser);
module.exports = router;
