const express = require('express');
const router = express.Router();

// Middleware & Controller
const ownerController= require('../controllers/ownerController');
const orderController = require('../controllers/orderController');
const JWTAuthentificationMiddleware = require('../middleware/JWTMiddleware')
const requestParameterValidationMiddleware = require('../middleware/requestParameterValidationMiddleware')
const enumValidation = require('../middleware/enumValidation')
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
    requestParameterValidationMiddleware.validateIdParameter,
    JWTAuthentificationMiddleware.authenticateToken,
    JWTAuthentificationMiddleware.requireOwner,
    ownerMiddleware.checkRestaurantCreationAndUpdate,
    ownerController.updateRestaurant
)

router.get('/:id/orders',
    requestParameterValidationMiddleware.validateIdParameter,
    JWTAuthentificationMiddleware.authenticateToken,
    JWTAuthentificationMiddleware.requireOwner,
    orderController.getRestaurantOrders
)


router.patch('/:restaurantId/orders/:orderId/status',
    requestParameterValidationMiddleware.validateIdParameter,
    JWTAuthentificationMiddleware.authenticateToken,
    JWTAuthentificationMiddleware.requireOwner,
    enumValidation.validateStatusEnum,
    orderController.updateStatus
)

// Exports
module.exports = router;
