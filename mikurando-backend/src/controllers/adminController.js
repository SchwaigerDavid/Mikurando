const adminModel = require('../models/adminModel');

function toInt(v) {
  const n = Number.parseInt(String(v), 10);
  return Number.isFinite(n) ? n : null;
}

function parseDateRange(req) {
  const start = req.query.start;
  const end = req.query.end;

  if (!start || !end) return null;
  if (Number.isNaN(Date.parse(start)) || Number.isNaN(Date.parse(end))) return null;

  return { start, end };
}

exports.getDashboard = async (req, res) => {
  try {
    const data = await adminModel.getDashboard();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Admin dashboard error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getPendingRestaurants = async (req, res) => {
  try {
    const rows = await adminModel.getPendingRestaurants();
    return res.status(200).json(rows);
  } catch (err) {
    console.error('Get pending restaurants error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.listRestaurants = async (req, res) => {
  try {
    const rows = await adminModel.listRestaurants();
    return res.status(200).json(rows);
  } catch (err) {
    console.error('List restaurants error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.approveRestaurant = async (req, res) => {
  const id = toInt(req.params.id);
  const { approved } = req.body || {};

  if (id === null) return res.status(400).json({ error: 'Invalid restaurant id' });
  if (typeof approved !== 'boolean') return res.status(400).json({ error: 'approved must be boolean' });

  try {
    const updated = await adminModel.setRestaurantApproved(id, approved);
    if (!updated) return res.status(404).json({ error: 'Restaurant not found' });
    return res.status(200).json({ message: 'Action processed' });
  } catch (err) {
    console.error('Approve restaurant error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const rows = await adminModel.listUsers();
    return res.status(200).json(rows);
  } catch (err) {
    console.error('List users error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.banUser = async (req, res) => {
  const userId = toInt(req.params.userId);
  const { is_banned } = req.body || {};

  if (userId === null) return res.status(400).json({ error: 'Invalid user id' });
  if (typeof is_banned !== 'boolean') return res.status(400).json({ error: 'is_banned must be boolean' });

  try {
    const updated = await adminModel.setUserActive(userId, !is_banned);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json({ message: 'User status updated' });
  } catch (err) {
    console.error('Ban user error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.listVouchers = async (req, res) => {
  try {
    const rows = await adminModel.listVouchers();
    return res.status(200).json(rows);
  } catch (err) {
    console.error('List vouchers error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.createVoucher = async (req, res) => {
  const { code, value, is_percent, valid_until } = req.body || {};

  if (!code || typeof code !== 'string') return res.status(400).json({ error: 'code is required' });
  if (typeof value !== 'number') return res.status(400).json({ error: 'value must be a number' });
  if (typeof is_percent !== 'boolean') return res.status(400).json({ error: 'is_percent must be boolean' });
  if (!valid_until || Number.isNaN(Date.parse(valid_until))) return res.status(400).json({ error: 'valid_until must be a date-time string' });

  try {
    const created = await adminModel.createVoucher({
      code,
      voucher_value: value,
      voucher_value_is_percentage: is_percent,
      valid_until,
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error('Create voucher error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteVoucher = async (req, res) => {
  const voucherId = toInt(req.params.voucherId);
  if (voucherId === null) return res.status(400).json({ error: 'Invalid voucher id' });

  try {
    const deleted = await adminModel.deleteVoucher(voucherId);
    if (!deleted) return res.status(404).json({ error: 'Voucher not found' });
    return res.status(200).json({ message: 'Voucher deleted successfully' });
  } catch (err) {
    console.error('Delete voucher error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const settings = await adminModel.getSettings();
    return res.status(200).json(settings);
  } catch (err) {
    console.error('Get settings error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateSettings = async (req, res) => {
  const { default_service_fee } = req.body || {};
  if (typeof default_service_fee !== 'number') {
    return res.status(400).json({ error: 'default_service_fee must be a number' });
  }

  try {
    const settings = await adminModel.updateSettings(default_service_fee);
    return res.status(200).json(settings);
  } catch (err) {
    console.error('Update settings error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.resetSettings = async (req, res) => {
  try {
    const settings = await adminModel.resetSettings();
    return res.status(200).json(settings);
  } catch (err) {
    console.error('Reset settings error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getDeliveryZones = async (req, res) => {
  try {
    const rows = await adminModel.getDeliveryZones();
    return res.status(200).json(rows);
  } catch (err) {
    console.error('Get delivery zones error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.createDeliveryZone = async (req, res) => {
  const { zone_name, max_radius_km } = req.body || {};

  if (!zone_name || typeof zone_name !== 'string') {
    return res.status(400).json({ error: 'zone_name is required' });
  }

  if (max_radius_km !== undefined && typeof max_radius_km !== 'number') {
    return res.status(400).json({ error: 'max_radius_km must be a number' });
  }

  if (typeof max_radius_km === 'number') {
    //numeric(5,2) => max absolute value < 1000
    if (!Number.isFinite(max_radius_km)) {
      return res.status(400).json({ error: 'max_radius_km must be a finite number' });
    }
    if (Math.abs(max_radius_km) >= 1000) {
      return res
        .status(400)
        .json({ error: 'max_radius_km must be less than 1000 (DB limit numeric(5,2))' });
    }
  }

  try {
    const created = await adminModel.createDeliveryZone({
      zone_name,
      max_radius_km: max_radius_km ?? null,
    });
    return res.status(201).json(created);
  } catch (err) {
    console.error('Create delivery zone error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteDeliveryZone = async (req, res) => {
  const id = toInt(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Invalid zone id' });

  try {
    const deleted = await adminModel.deleteDeliveryZone(id);
    if (!deleted) return res.status(404).json({ error: 'Zone not found' });
    return res.status(200).json({ message: 'Zone deleted successfully' });
  } catch (err) {
    console.error('Delete delivery zone error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.reportOrders = async (req, res) => {
  const range = parseDateRange(req);
  if (!range) return res.status(400).json({ error: 'start and end query params are required (ISO date)' });

  try {
    const rows = await adminModel.reportOrders(range.start, range.end);
    return res.status(200).json(rows);
  } catch (err) {
    console.error('Report orders error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.reportRevenue = async (req, res) => {
  const range = parseDateRange(req);
  if (!range) return res.status(400).json({ error: 'start and end query params are required (ISO date)' });

  try {
    const rows = await adminModel.reportRevenue(range.start, range.end);
    return res.status(200).json(rows);
  } catch (err) {
    console.error('Report revenue error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.reportUserActivity = async (req, res) => {
  const range = parseDateRange(req);
  if (!range) return res.status(400).json({ error: 'start and end query params are required (ISO date)' });

  try {
    const rows = await adminModel.reportUserActivity(range.start, range.end);
    return res.status(200).json(rows);
  } catch (err) {
    console.error('Report user activity error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
