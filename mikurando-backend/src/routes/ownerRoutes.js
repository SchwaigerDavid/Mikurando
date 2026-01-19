const express = require('express');
const router = express.Router();

// Middleware & Controller
const ownerController= require('../controllers/ownerController');
const JWTAuthentificationMiddleware = require('../middleware/JWTMiddleware')
const restaurantMiddleware = require('../middleware/restaurantMiddleware');
const requestParameterValidationMiddleware = require('../middleware/requestParameterValidationMiddleware')
const ownerMiddleware = require('../middleware/ownerMiddleware');

// Routes
router.get('',
    JWTAuthentificationMiddleware.authenticateToken,
    JWTAuthentificationMiddleware.requireOwner,
    ownerController.getRestaurants
)

router.post('',
    JWTAuthentificationMiddleware.authenticateToken,
    JWTAuthentificationMiddleware.requireOwner,
    ownerMiddleware.checkRestaurantCreation,
    ownerController.createRestaurant
)

// Exports
module.exports = router;
