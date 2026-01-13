const express = require('express');
const router = express.Router();

// Middleware & Controller
const restaurantController = require('../controllers/restaurantController');
const requestParameterValidationMiddleware = require('../middleware/requestParameterValidationMiddleware');
const enumValidationMiddleware = require('../middleware/enumValidation');


// Routes
router.get('/:id',
    requestParameterValidationMiddleware.validateIdParameter,
    restaurantController.getRestaurantDetailsById
);


// Exports
module.exports = router;