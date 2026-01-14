const express = require('express');
const router = express.Router();

// Middleware & Controller
const orderController = require('../controllers/orderController');
const requestParameterValidationMiddleware = require('../middleware/requestParameterValidationMiddleware');
const JWTAuthentificationMiddleware = require('../middleware/JWTMiddleware')
const orderMiddleware = require('../middleware/orderMiddleware');


// Routes
router.get('/:id',
    requestParameterValidationMiddleware.validateIdParameter,
    restaurantController.getRestaurantDetailsById
);


// Exports
module.exports = router;
