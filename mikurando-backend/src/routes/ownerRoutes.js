const express = require('express');
const router = express.Router();

// Middleware & Controller
const ownerController= require('../controllers/ownerController');
const JWTAuthentificationMiddleware = require('../middleware/JWTMiddleware')
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
    ownerMiddleware.checkRestaurantCreationAndUpdate,
    ownerController.createRestaurant
)

router.get('/:id',
    requestParameterValidationMiddleware.validateIdParameter,
    JWTAuthentificationMiddleware.authenticateToken,
    JWTAuthentificationMiddleware.requireOwner,
    ownerController.getRestaurantDetails
)

router.put('/:id',
    JWTAuthentificationMiddleware.authenticateToken,
    JWTAuthentificationMiddleware.requireOwner,
    ownerMiddleware.checkRestaurantCreationAndUpdate,
    ownerController.updateRestaurant
)

// Exports
module.exports = router;
