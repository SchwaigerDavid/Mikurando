const express = require('express');
const router = express.Router();

// Middleware & Controller
const userController = require('../controllers/userController');
const JWTAuthentificationMiddleware = require('../middleware/JWTMiddleware')
const authenticationMiddleware = require('../middleware/authentificationMiddleware');


// Routes
router.get('/profile',
    JWTAuthentificationMiddleware.authenticateToken,
    userController.getUserProfile
);

router.put('/profile',
    authenticationMiddleware.validateUpdate,
    JWTAuthentificationMiddleware.authenticateToken,
    userController.updateProfile
)

// Exports
module.exports = router;