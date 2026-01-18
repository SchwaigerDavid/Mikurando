const db = require('../database/db');
const adminQueries = require('../queries/adminQueries');

exports.getDashboard = async () => {
  const { rows } = await db.query(adminQueries.dashboard);
  return rows[0] ?? {
    total_orders: 0,
    revenue: 0,
    active_restaurants: 0,
    user_activity: 0,
    pending_restaurants: 0,
  };
};

exports.getPendingRestaurants = async () => {
  const { rows } = await db.query(adminQueries.pendingRestaurants);
  return rows;
};

exports.listRestaurants = async () => {
  const { rows } = await db.query(adminQueries.restaurantsAll);
  return rows;
};

exports.setRestaurantApproved = async (restaurantId, approved) => {
  const res = await db.query(adminQueries.setRestaurantApproved, [approved, restaurantId]);
  return res.rowCount > 0;
};

exports.rejectRestaurant = async (restaurantId) => {
  const res = await db.query(adminQueries.rejectRestaurant, [restaurantId]);
  return res.rowCount > 0;
};

exports.listUsers = async () => {
  const { rows } = await db.query(adminQueries.listUsers);
  return rows;
};

exports.setUserActive = async (userId, isActive) => {
  const res = await db.query(adminQueries.setUserActive, [isActive, userId]);
  return res.rowCount > 0;
};

exports.warnUser = async (userId) => {
  const res = await db.query(adminQueries.warnUser, [userId]);
  return res.rows[0] ?? null; // { user_id, warnings }
};

exports.listVouchers = async () => {
  const { rows } = await db.query(adminQueries.listVouchers);
  return rows;
};

exports.createVoucher = async ({ code, voucher_value, voucher_value_is_percentage, valid_until }) => {
  const { rows } = await db.query(adminQueries.createVoucher, [
    code,
    voucher_value,
    voucher_value_is_percentage,
    valid_until,
  ]);
  return rows[0];
};

exports.deleteVoucher = async (voucherId) => {
  const res = await db.query(adminQueries.deleteVoucher, [voucherId]);
  return res.rowCount > 0;
};

exports.getSettings = async () => {
  const { rows } = await db.query(adminQueries.getSettings);
  return rows[0] ?? { default_service_fee: 0 };
};

exports.updateSettings = async (defaultServiceFee) => {
  const { rows } = await db.query(adminQueries.updateSettings, [defaultServiceFee]);
  return rows[0] ?? { default_service_fee: defaultServiceFee };
};

exports.resetSettings = async () => {
  const { rows } = await db.query(adminQueries.resetSettings);
  return rows[0] ?? { default_service_fee: 0 };
};

exports.getDeliveryZones = async () => {
  const { rows } = await db.query(adminQueries.getDeliveryZones);
  return rows;
};

exports.createDeliveryZone = async ({ zone_name, max_radius_km }) => {
  const { rows } = await db.query(adminQueries.createDeliveryZone, [zone_name, max_radius_km]);
  return rows[0];
};

exports.deleteDeliveryZone = async (id) => {
  const res = await db.query(adminQueries.deleteDeliveryZone, [id]);
  return res.rowCount > 0;
};

exports.reportOrders = async (start, end) => {
  const { rows } = await db.query(adminQueries.reportOrders, [start, end]);
  return rows;
};

exports.reportRevenue = async (start, end) => {
  const { rows } = await db.query(adminQueries.reportRevenue, [start, end]);
  return rows;
};

exports.reportUserActivity = async (start, end) => {
  const { rows } = await db.query(adminQueries.reportUserActivity, [start, end]);
  return rows;
};

exports.reportUserEvents = async (start, end) => {
  const { rows } = await db.query(adminQueries.reportUserEvents, [start, end]);
  return rows;
};
