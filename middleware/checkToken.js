const jwt = require('jsonwebtoken');
const { createTokenSesion } = require('../controllers/tokenSessions');
function tokenTrueFalse(req,res,next)
{
    const authHeader = req.headers['authorization'];
    console.log(`Authorization header: ${authHeader}`);
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }
    const token = authHeader.split(' ')[1];
    if(!token)
    {
        return res.status(401).json({ message: 'Token missing' });
    }
    try{
        const decoded= jwt.verify(token,'9DB5D136-7466-4621-96F6-AF21F417ECB6')
        console.log(decoded);
        req.user = decoded.username;
        next();
    }
    catch(error)
    {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

module.exports={
    tokenTrueFalse
}