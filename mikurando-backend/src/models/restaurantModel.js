const db = require('../database/db');
const queries = require('../queries/restaurantQueries');


const getRestaurantDetailsById = async (id) => {
    const result = await  db.query(queries.getRestaurantDetailsById, [id]);
    if (result.rows.length === 0) return null;
    return result.rows[0].json_build_object || result.rows[0].result;
}

const getRestaurantReviews = async (id) => {
    const result = await  db.query(queries.getRestaurantReviews, [id]);
    return result.rows;
}

const getRestaurantNameById = async (id) => {
    const result = await  db.query(queries.getRestaurantNameById, [id]);
    return result.rows[0];
}

const addRestaurantReview = async (restaurant_id, user_id, dish_id, created_at, rating, comment) => {
    await db.query(queries.addRestaurantReview, [restaurant_id, user_id, dish_id, created_at, rating, comment]);
}

const getDishNameById = async (dish_id, restaurant_id) => {
    const result = await  db.query(queries.getDishNameById, [dish_id, restaurant_id]);
    return result.rows[0];
}

const getDishesByIds = async (dishIds) => {
    const result = await db.query(queries.getDishesByIds, [dishIds]);
    return result.rows;
}

module.exports = {
    getRestaurantDetailsById,
    getRestaurantReviews,
    getRestaurantNameById,
    addRestaurantReview,
    getDishNameById,
    getDishesByIds
};