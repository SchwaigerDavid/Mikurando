const express = require('express');
const router = express.Router();

// Middleware & Controller
const orderController = require('../controllers/orderController');
const JWTAuthentificationMiddleware = require('../middleware/JWTMiddleware')
const restaurantMiddleware = require('../middleware/restaurantMiddleware');


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

// Exports
module.exports = router;
