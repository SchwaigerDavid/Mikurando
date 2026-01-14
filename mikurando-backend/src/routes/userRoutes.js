const express = require('express');
const router = express.Router();

// Middleware & Controller
const userController = require('../controllers/userController');
const JWTAuthentificationMiddleware = require('../middleware/JWTMiddleware')


// Routes
router.get('/profile',
    JWTAuthentificationMiddleware.authenticateToken,
    userController.getUserProfile
);

// Exports
module.exports = router;