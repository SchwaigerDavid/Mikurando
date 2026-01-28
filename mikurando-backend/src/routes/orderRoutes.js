const express = require('express');
const router = express.Router();

// Middleware & Controller
const orderController = require('../controllers/orderController');
const JWTAuthentificationMiddleware = require('../middleware/JWTMiddleware')
const restaurantMiddleware = require('../middleware/restaurantMiddleware');
const requestParameterValidationMiddleware = require('../middleware/requestParameterValidationMiddleware')

// Routes
router.post('',
    restaurantMiddleware.createOrderParametersAreComplete,
    JWTAuthentificationMiddleware.authenticateToken,
    JWTAuthentificationMiddleware.requireCustomer,
    orderController.createOrder
);

router.get('',
    JWTAuthentificationMiddleware.authenticateToken,
    JWTAuthentificationMiddleware.requireCustomer,
    orderController.getOrderHistory
)

router.get('/:id',
    requestParameterValidationMiddleware.validateIdParameter,
    JWTAuthentificationMiddleware.authenticateToken,
    JWTAuthentificationMiddleware.requireCustomer,
    orderController.getOrderDetails
)

router.get(
    '/restaurant/:id',
    JWTAuthentificationMiddleware.authenticateToken,
    JWTAuthentificationMiddleware.requireOwner,
    requestParameterValidationMiddleware.validateIdParameter,
    orderController.getRestaurantOrders
);

router.patch(
    '/restaurant/:restaurantId/orders/:orderId',
    JWTAuthentificationMiddleware.authenticateToken,
    JWTAuthentificationMiddleware.requireOwner,
    orderController.updateStatus
);


// Exports
module.exports = router;
