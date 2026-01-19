const express = require('express');
const router = express.Router();

// Middleware & Controller
const ownerController= require('../controllers/ownerController');
const orderController = require('../controllers/orderController');
const restaurantController = require('../controllers/restaurantController');
const JWTAuthentificationMiddleware = require('../middleware/JWTMiddleware')
const requestParameterValidationMiddleware = require('../middleware/requestParameterValidationMiddleware')
const enumValidation = require('../middleware/enumValidation')
const ownerMiddleware = require('../middleware/ownerMiddleware');
const restaurantMiddleware = require('../middleware/restaurantMiddleware');

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

router.put('/:restaurantId/opening-hours',
    requestParameterValidationMiddleware.validateIdParameter,
    JWTAuthentificationMiddleware.authenticateToken,
    JWTAuthentificationMiddleware.requireOwner,
    enumValidation.validateScheduleFormat,
    enumValidation.validateScheduleDays,
    restaurantController.updateOpeningHours
)

router.post('/:restaurantId/dishes',
    requestParameterValidationMiddleware.validateIdParameter,
    JWTAuthentificationMiddleware.authenticateToken,
    JWTAuthentificationMiddleware.requireOwner,
    restaurantMiddleware.checkDishParameters,
    restaurantController.createDish
);

router.put('/:restaurantId/dishes/:dishId',
    requestParameterValidationMiddleware.validateIdParameter,
    JWTAuthentificationMiddleware.authenticateToken,
    JWTAuthentificationMiddleware.requireOwner,
    restaurantMiddleware.checkDishParameters,
    restaurantController.updateDish
);

router.delete('/:restaurantId/dishes/:dishId',
    requestParameterValidationMiddleware.validateIdParameter,
    JWTAuthentificationMiddleware.authenticateToken,
    JWTAuthentificationMiddleware.requireOwner,
    restaurantController.deleteDish
);

router.patch('/:restaurantId/dishes/:dishId',
    requestParameterValidationMiddleware.validateIdParameter,
    JWTAuthentificationMiddleware.authenticateToken,
    JWTAuthentificationMiddleware.requireOwner,
    restaurantMiddleware.checkAvailabilityParameter,
    restaurantController.setDishAvailability
);

// Exports
module.exports = router;
