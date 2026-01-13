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

router.get('/:id/reviews',
    requestParameterValidationMiddleware.validateIdParameter,
    restaurantController.getRestaurantReviews
);

// Exports
module.exports = router;