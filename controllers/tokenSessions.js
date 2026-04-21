const jwt = require('jsonwebtoken');
require('dotenv').config();
function createTokenSesion(username){
    const token = jwt.sign(
        { username },
        process.env.SECRET,
        { expiresIn: '3h' }
    );
    console.log(`Token created for user ${username}: ${token}`);
    return token;
}

module.exports = {
    createTokenSesion,
};