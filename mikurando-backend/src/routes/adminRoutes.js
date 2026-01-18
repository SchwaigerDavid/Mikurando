const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const requestParameterValidationMiddleware = require('../middleware/requestParameterValidationMiddleware');
const JWTAuthentificationMiddleware = require('../middleware/JWTMiddleware');

// /admin routes require MANAGER-Role
router.use(JWTAuthentificationMiddleware.authenticateToken);
router.use(JWTAuthentificationMiddleware.requireManager);

//dashboard
router.get('/dashboard', adminController.getDashboard);

//restaurant moderation
router.get('/restaurants', adminController.listRestaurants);
router.get('/restaurants/pending', adminController.getPendingRestaurants);
router.patch(
  '/restaurants/:id/approve',
  requestParameterValidationMiddleware.validateIdParameter,
  adminController.approveRestaurant,
);
router.post(
  '/restaurants/:id/reject',
  requestParameterValidationMiddleware.validateIdParameter,
  adminController.rejectRestaurant,
);

//user moderation
router.get('/users', adminController.listUsers);
router.patch(
  '/users/:userId/ban',
  requestParameterValidationMiddleware.validateIdParameter,
  adminController.banUser,
);
router.patch(
  '/users/:userId/warn',
  requestParameterValidationMiddleware.validateIdParameter,
  adminController.warnUser,
);

//vouchers
router.get('/vouchers', adminController.listVouchers);
router.post('/vouchers', adminController.createVoucher);
router.delete(
  '/vouchers/:voucherId',
  requestParameterValidationMiddleware.validateIdParameter,
  adminController.deleteVoucher,
);

//global settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);
router.delete('/settings', adminController.resetSettings);

//delivery zones
router.get('/delivery-zones', adminController.getDeliveryZones);
router.post('/delivery-zones', adminController.createDeliveryZone);
router.delete(
  '/delivery-zones/:id',
  requestParameterValidationMiddleware.validateIdParameter,
  adminController.deleteDeliveryZone,
);

//reporting
router.get('/reports/orders', adminController.reportOrders);
router.get('/reports/revenue', adminController.reportRevenue);
router.get('/reports/user-activity', adminController.reportUserActivity);
router.get('/reports/user-events', adminController.reportUserEvents);

module.exports = router;
