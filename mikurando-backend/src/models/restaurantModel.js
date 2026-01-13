const db = require('../database/db');
const queries = require('../queries/restaurantQueries');


const getRestaurantDetailsById = async (id) => {
    const result = await  db.query(queries.getRestaurantDetailsById, [id]);
    return result.rows[0];
}

const getRestaurantReviews = async (id) => {
    const result = await  db.query(queries.getRestaurantReviews, [id]);
    return result.rows;
}

const getRestaurantNameById = async (id) => {
    const result = await  db.query(queries.getRestaurantNameById, [id]);
    return result.rows[0];
}

module.exports = {
    getRestaurantDetailsById,
    getRestaurantReviews,
    getRestaurantNameById
};