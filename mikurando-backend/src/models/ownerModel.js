const db = require("../database/db");
const queries = require("../queries/ownerQueries");


const getRestaurantsByOwnerId = async (userId) => {
    const result = await db.query(queries.getRestaurantsByOwnerId, [userId]);
    return result.rows;
};

const createRestaurant = async (ownerId, data) => {
    const {
        owner_id, restaurant_name, description, address, area_code, customer_notes,
        min_order_value, delivery_radius, category, geo_lat, geo_lng,
        image_data, service_fee
    } = data;

    const result = await db.query(queries.createRestaurant, [
        owner_id, restaurant_name, description, address, area_code, customer_notes || "",
        min_order_value, delivery_radius, category, geo_lat, geo_lng,
        image_data, service_fee
    ]);

    return result.rows[0];
}

module.exports = {
    getRestaurantsByOwnerId,
    createRestaurant
}
