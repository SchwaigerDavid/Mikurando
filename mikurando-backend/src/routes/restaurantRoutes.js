const express = require('express');
const router = express.Router();

// Middleware & Controller
const restaurantController = require('../controllers/restaurantController');
const requestParameterValidationMiddleware = require('../middleware/requestParameterValidationMiddleware');
const JWTAuthentificationMiddleware = require('../middleware/JWTMiddleware')
const restaurantMiddleware = require('../middleware/restaurantMiddleware');

router.use((req, res, next) => {
    console.log('thomas Restaurant route hit:', req.method, req.originalUrl);
    next();
});


router.post('/',
    JWTAuthentificationMiddleware.authenticateToken,
    JWTAuthentificationMiddleware.requireOwner,
    restaurantController.createRestaurant
);

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

router.get('/:id/orders', (req, res, next) => {
    console.log('Orders requested for restaurant', req.params.id, 'by user', req.user);
    next();
});


router.get('',
    JWTAuthentificationMiddleware.authenticateToken,
    restaurantController.searchRestaurants
)

// Exports
module.exports = router;