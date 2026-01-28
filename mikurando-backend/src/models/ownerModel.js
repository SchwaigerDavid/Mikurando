const db = require("../database/db");
const queries = require("../queries/ownerQueries");


const getRestaurantsByOwnerId = async (userId) => {
    const result = await db.query(queries.getRestaurantsByOwnerId, [userId]);
    return result.rows;
};

const createRestaurant = async (ownerId, data) => {
    console.log('Creating restaurant with data:', data);
    const {
        restaurant_name, description, address, area_code, customer_notes,
        min_order_value, delivery_radius, category, geo_lat, geo_lng,
        image_data, service_fee
    } = data;

    const result = await db.query(queries.createRestaurant, [
        ownerId, restaurant_name, description, address, area_code, customer_notes || "",
        min_order_value, delivery_radius, category, geo_lat, geo_lng,
        image_data, service_fee
    ]);

    return result.rows[0];
}

const getRestaurantDetails = async (ownerId, restaurantId) => {
    const result = await db.query(queries.getRestaurantDetails, [ownerId, restaurantId]);
    return result.rows[0];
}

const updateRestaurant = async (ownerId, restaurantId, data) => {
    const { restaurant_name, description, address, area_code, customer_notes, min_order_value, delivery_radius,
        category, geo_lat, geo_lng, image_data, service_fee } = data;
    const result = await db.query(queries.updateRestaurant, [
        restaurant_name, description, address, area_code, customer_notes  || "", min_order_value, delivery_radius,
        category, geo_lat, geo_lng, image_data, service_fee, ownerId, restaurantId
    ]);
    return result.rows[0];
}

module.exports = {
    getRestaurantsByOwnerId,
    createRestaurant,
    getRestaurantDetails,
    updateRestaurant
}
