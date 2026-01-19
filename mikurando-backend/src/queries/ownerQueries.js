const getRestaurantsByOwnerId = `
    SELECT
        restaurant_id,
        restaurant_name,
        description,
        address,
        min_order_value,
        delivery_radius,
        restaurant_image as image_data,
        geo_lat,
        geo_lng,
        is_active,
        category
    FROM "Restaurant"
    WHERE owner_id = $1
`;


const createRestaurant = `
    INSERT INTO "Restaurant" 
    (owner_id, restaurant_name, description, address, area_code, customer_notes, 
     min_order_value, delivery_radius, category, geo_lat, geo_lng, 
     restaurant_image, service_fee, approved, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, false, false)
    RETURNING *;
`

const getRestaurantDetails = `
    SELECT 
        restaurant_id,
        restaurant_name,
        description,
        address,
        min_order_value,
        delivery_radius,
        restaurant_image as image_data,
        geo_lat,
        geo_lng,
        is_active,
        category
    FROM "Restaurant"
    WHERE owner_id = $1
    AND restaurant_id = $2
`

module.exports = {
    getRestaurantsByOwnerId,
    createRestaurant,
    getRestaurantDetails
}