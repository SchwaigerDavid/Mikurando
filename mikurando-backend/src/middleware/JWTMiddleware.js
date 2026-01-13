const jwt = require('jsonwebtoken')
const {router} = require("express/lib/application");

// Does a Valid JWT exist?
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied, please log in.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Access denied, login invalid.' });
        }

        req.user = decoded;

        next();
    })
}

// authenticateToken must run before this
const requireCustomer = (req, res, next) => {
    if (req.user.role !== 'CUSTOMER') {
        return res.status(403).json({ error: 'Forbidden, only customers are allowed to do that.' });
    }
    next();
};

// authenticateToken must run before this
const requireOwner = (req, res, next) => {
    if (req.user.role !== 'OWNER') {
        return res.status(403).json({ error: 'Forbidden, only Restaurant Owners are allowed to do that.' });
    }
    next();
};

// authenticateToken must run before this
const requireManager = (req, res, next) => {
    if (req.user.role !== 'MANAGER') {
        return res.status(403).json({ error: 'Forbidden, only Site Managers are allowed to do that.' });
    }
    next();
};
module.exports = {
    authenticateToken,
    requireCustomer,
    requireOwner,
    requireManager
};