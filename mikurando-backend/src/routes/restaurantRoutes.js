const express = require('express');
const router = express.Router();

// Middleware & Controller
const restaurantController = require('../controllers/restaurantController');
const requestParameterValidationMiddleware = require('../middleware/requestParameterValidationMiddleware');
const JWTAuthentificationMiddleware = require('../middleware/JWTMiddleware')
const restaurantMiddleware = require('../middleware/restaurantMiddleware');


// Routes
router.get('/:id',
    requestParameterValidationMiddleware.validateIdParameter,
    restaurantController.getRestaurantDetailsById
);

router.get('/:id/reviews',
    requestParameterValidationMiddleware.validateIdParameter,
    restaurantController.getRestaurantReviews
);

router.post('/:id/reviews',
    requestParameterValidationMiddleware.validateIdParameter, // check restaurant id
    JWTAuthentificationMiddleware.authenticateToken, // check User is logged in (valid JWT exists)
    JWTAuthentificationMiddleware.requireCustomer, // check if User is a Customer
    restaurantMiddleware.ratingIsValidNumber, // check that rating is a number from 1 to 5
    restaurantController.addRestaurantReview // check restaurant (and dish) exists + business logic
)

router.get('',
    JWTAuthentificationMiddleware.authenticateToken,
    restaurantController.searchRestaurants
)

// Exports
module.exports = router;