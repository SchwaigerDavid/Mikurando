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

const searchRestaurants = async (filters) => {
    const { name, category, area_code } = filters;

    const result = await db.query(queries.searchRestaurants, [
        name || null,
        category || null,
        area_code || null
    ]);

    return result.rows;
};

const updateOpeningHours = async (restaurantId, ownerId, schedule) => {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        const check = await client.query(queries.checkRestaurantOwnership, [restaurantId, ownerId]);
        if (check.rows.length === 0) {
            await client.query('ROLLBACK');
            return false; // Restaurant not found / not owned by ownerId
        }

        await client.query(queries.deleteOpeningHours, [restaurantId]);

        if (schedule && schedule.length > 0) {
            const days = schedule.map(s => s.day);
            const opens = schedule.map(s => s.open_from);
            const closes = schedule.map(s => s.open_till);

            await client.query(queries.insertOpeningHours, [
                restaurantId,
                days,
                opens,
                closes
            ]);
        }

        await client.query('COMMIT');
        return true;

    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

const addDish = async (restaurantId, dishData) => {
    const { category_id, name, description, price, available, image_data } = dishData;

    const result = await db.query(queries.addDish, [
        restaurantId,
        category_id,
        name,
        description,
        price,
        available,
        image_data || ''
    ]);
    return result.rows[0];
};

const updateDish = async (dishId, restaurantId, ownerId, dishData) => {
    const { category_id, name, description, price, available, image_data } = dishData;

    const result = await db.query(queries.updateDish, [
        name,
        description,
        price,
        image_data || '',
        available,
        category_id,
        dishId,
        restaurantId,
        ownerId
    ]);
    return result.rows[0];
};

const deleteDish = async (dishId, restaurantId, ownerId) => {
    const result = await db.query(queries.deleteDish, [dishId, restaurantId, ownerId]);
    return result.rows.length > 0;
};

const checkOwnership = async (restaurantId, ownerId) => {
    const res = await db.query(queries.checkRestaurantOwnership, [restaurantId, ownerId]);
    return res.rows.length > 0;
};

const setAvailability = async (dishId, restaurantId, isAvailable) => {
    const result = await db.query(queries.updateDishAvailability, [
        isAvailable,
        dishId,
        restaurantId
    ]);
    return result.rows[0];
};

const verifyCategoryOwnership = async (categoryId, restaurantId) => {
    const res = await db.query(queries.checkCategoryBelongsToRestaurant, [categoryId, restaurantId]);
    return res.rows.length > 0;
};

module.exports = {
    getRestaurantDetailsById,
    getRestaurantReviews,
    getRestaurantNameById,
    addRestaurantReview,
    getDishNameById,
    getDishesByIds,
    searchRestaurants,
    updateOpeningHours,
    addDish,
    updateDish,
    deleteDish,
    checkOwnership,
    setAvailability,
    verifyCategoryOwnership
};