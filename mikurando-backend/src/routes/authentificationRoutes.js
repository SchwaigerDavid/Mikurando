const express = require('express');
const router = express.Router();

// Middleware & Controller
const authentificationController = require('../controllers/authentificationController');
const enumValidationMiddleware = require('../middleware/enumValidation');
const authentificationMiddleware = require('../middleware/authentificationMiddleware');


// Routes
router.post('/register',
    enumValidationMiddleware.validateRoleEnum, // validate Role
    authentificationMiddleware.validateRegistration, // validate Registration Details
    authentificationController.register // register User
);

router.post('/login',
    authentificationMiddleware.validateLogin,
    authentificationController.login
)

// Exports
module.exports = router;