const express = require('express');
const router = express.Router();

// Middleware & Controller
const authentificationController = require('../controllers/authentificationController');
const enumValidationMiddleware = require('../middleware/enumValidation');
const validationMiddleware = require('../middleware/validationMiddleware');


// Routes
router.post('/register',
    enumValidationMiddleware.validateRoleEnum, // validate Role
    validationMiddleware.validateRegistration, // validate Registration Details
    authentificationController.register // register User
);


// Exports
module.exports = router;