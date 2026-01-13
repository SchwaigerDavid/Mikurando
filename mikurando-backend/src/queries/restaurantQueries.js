const getRestaurantDetailsById = `
    WITH OpeningHous AS (SELECT o.restaurant_id,
                                json_agg(json_build_object(
                                        'day', o.day,
                                        'open_from', o.open_from,
                                        'open_till', o.open_till
                                         )) as opening_hours
                         FROM "OpenHours" o
                         WHERE o.restaurant_id = $1
                         GROUP BY o.restaurant_id),
         Dishes AS (SELECT d.category_id,
                           json_agg(json_build_object(
                                   'dish_id', d.dish_id,
                                   'name', d.name,
                                   'description', d.description,
                                   'price', d.price,
                                   'avaliable', d.avaliable,
                                   'image_data', d.dish_bytea,
                                   'category_id', d.category_id
                                    )) as dish_details
                    FROM "Dish" d
                    WHERE d."restaurant_id" = $1
                    GROUP BY d.category_id),
         Menu AS (SELECT c.restaurant_id,
                         json_agg(json_build_object(
                                 'category_id', c.category_id,
                                 'category_name', c.category_name,
                                 'dishes', COALESCE(dd.dish_details, '[]'::json)
                                  )) as menu_details
                  FROM "Categories" c
                           LEFT JOIN Dishes dd ON c.category_id = dd.category_id
                  WHERE c.restaurant_id = $1
                  GROUP BY c.restaurant_id)
    SELECT json_build_object(
                   'restaurant_id', r.restaurant_id,
                   'restaurant_name', r.restaurant_name,
                   'description', r.description,
                   'address', r.address,
                   'min_order_value', r.min_order_value,
                   'delivery_radius', r.delivery_radius,
                   'image_data', r.restaurant_image,
                   'geo_lat', r.geo_lat,
                   'geo_long', r.geo_lng,
                   'is_active', r.is_active,
                   'category', r.category,
                   'opening_hours', COALESCE(oo.opening_hours, '[]'::json),
                   'menu_categories', COALESCE(m.menu_details, '[]'::json)
           )
    FROM "Restaurant" r
             LEFT JOIN OpeningHous oo ON r.restaurant_id = oo.restaurant_id
             LEFT JOIN Menu m ON r.restaurant_id = m.restaurant_id
    WHERE r.restaurant_id = $1;
`;

module.exports = {
    getRestaurantDetailsById
};