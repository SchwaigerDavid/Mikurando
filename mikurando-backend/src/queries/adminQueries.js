module.exports = {
  dashboard: `
    SELECT
      (SELECT COUNT(*)::int FROM "Order") AS total_orders,
      (SELECT COALESCE(SUM(total_price), 0)::numeric FROM "Order") AS revenue,
      (SELECT COUNT(*)::int FROM "Restaurant" WHERE is_active = true) AS active_restaurants,
      (SELECT COUNT(*)::int FROM "User" WHERE is_active = true) AS user_activity,
      (SELECT COUNT(*)::int FROM "Restaurant" WHERE application_status = 'PENDING') AS pending_restaurants
  `,

  restaurantsAll: `
    SELECT
      restaurant_id,
      restaurant_name,
      area_code,
      category,
      approved,
      is_active,
      application_status
    FROM "Restaurant"
    ORDER BY restaurant_id DESC
  `,

  pendingRestaurants: `
    SELECT
      restaurant_id,
      restaurant_name,
      area_code,
      category,
      approved,
      is_active,
      application_status
    FROM "Restaurant"
    WHERE application_status = 'PENDING'
    ORDER BY restaurant_id DESC
  `,

  setRestaurantApproved: `
    UPDATE "Restaurant"
    SET approved = $1,
        is_active = CASE WHEN $1 = true THEN true ELSE false END,
        application_status = CASE WHEN $1 = true THEN 'APPROVED'::restaurant_application_status ELSE 'PENDING'::restaurant_application_status END
    WHERE restaurant_id = $2
  `,

  rejectRestaurant: `
    UPDATE "Restaurant"
    SET approved = false,
        is_active = false,
        application_status = 'REJECTED'::restaurant_application_status
    WHERE restaurant_id = $1
  `,

  listUsers: `
    SELECT user_id, email, role, is_active, COALESCE(warnings, 0)::int AS warnings
    FROM "User"
    ORDER BY user_id DESC
  `,

  setUserActive: `
    UPDATE "User"
    SET is_active = $1
    WHERE user_id = $2
  `,

  warnUser: `
    UPDATE "User"
    SET warnings = COALESCE(warnings, 0) + 1
    WHERE user_id = $1
    RETURNING user_id, COALESCE(warnings, 0)::int AS warnings
  `,

  listVouchers: `
    SELECT voucher_id, code, voucher_value, voucher_value_is_percentage, valid_until
    FROM "Voucher"
    ORDER BY voucher_id DESC
  `,

  createVoucher: `
    INSERT INTO "Voucher" (code, voucher_value, voucher_value_is_percentage, valid_until)
    VALUES ($1, $2, $3, $4)
    RETURNING voucher_id, code, voucher_value, voucher_value_is_percentage, valid_until
  `,

  deleteVoucher: `
    DELETE FROM "Voucher"
    WHERE voucher_id = $1
  `,

  getSettings: `
    SELECT default_service_fee
    FROM "Global_Settings"
    WHERE id = 1
  `,

  updateSettings: `
    UPDATE "Global_Settings"
    SET default_service_fee = $1
    WHERE id = 1
    RETURNING default_service_fee
  `,

  resetSettings: `
    INSERT INTO "Global_Settings" (id, default_service_fee)
    VALUES (1, 0)
    ON CONFLICT (id)
    DO UPDATE SET default_service_fee = 0
    RETURNING default_service_fee
  `,

  getDeliveryZones: `
    SELECT id, zone_name, max_radius_km
    FROM "Delivery_Zone"
    ORDER BY zone_name ASC
  `,

  createDeliveryZone: `
    INSERT INTO "Delivery_Zone" (zone_name, max_radius_km)
    VALUES ($1, $2)
    RETURNING id, zone_name, max_radius_km
  `,

  deleteDeliveryZone: `
    DELETE FROM "Delivery_Zone"
    WHERE id = $1
  `,

  reportOrders: `
    SELECT
      to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date,
      COUNT(*)::int AS orders
    FROM "Order"
    WHERE created_at >= $1::timestamptz
      AND created_at < ($2::timestamptz + interval '1 day')
    GROUP BY 1
    ORDER BY 1 ASC
  `,

  reportRevenue: `
    SELECT
      to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date,
      COALESCE(SUM(total_price), 0)::numeric AS revenue
    FROM "Order"
    WHERE created_at >= $1::timestamptz
      AND created_at < ($2::timestamptz + interval '1 day')
    GROUP BY 1
    ORDER BY 1 ASC
  `,

  reportUserActivity: `
    SELECT
      to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date,
      COUNT(*)::int AS changes
    FROM "Order"
    WHERE created_at >= $1::timestamptz
      AND created_at < ($2::timestamptz + interval '1 day')
    GROUP BY 1
    ORDER BY 1 ASC
  `,

  reportUserEvents: `
    WITH bounds AS (
      SELECT
        $1::date AS start_day,
        $2::date AS end_day
    ),
    days AS (
      SELECT generate_series(
        (SELECT start_day FROM bounds),
        (SELECT end_day FROM bounds),
        interval '1 day'
      )::date AS day
    ),
    agg AS (
      SELECT
        (created_at AT TIME ZONE 'UTC')::date AS day,
        COUNT(*) FILTER (WHERE event_type = 'LOGIN')::int AS logins,
        COUNT(*) FILTER (WHERE event_type = 'PROFILE_UPDATE')::int AS changes
      FROM "User_Event"
      WHERE (created_at AT TIME ZONE 'UTC')::date >= (SELECT start_day FROM bounds)
        AND (created_at AT TIME ZONE 'UTC')::date <= (SELECT end_day FROM bounds)
      GROUP BY 1
    )
    SELECT
      to_char(days.day, 'YYYY-MM-DD') AS date,
      COALESCE(agg.logins, 0)::int AS logins,
      COALESCE(agg.changes, 0)::int AS changes
    FROM days
    LEFT JOIN agg ON agg.day = days.day
    ORDER BY days.day ASC
  `,
};