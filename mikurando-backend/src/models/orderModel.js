const db = require('../database/db');
const queries = require('../queries/orderQueries');




const createNewOrder = async (orderData, items, voucherId = null) => {
    // since we have multiple inserts we want to do this with a Transaktion in order to eiter have a complete order saved in the DB or nothing at all
    const client = await db.pool.connect(); // for that we need a client

    try {
        await client.query('BEGIN');

        const order = await client.query(
            queries.createNewOrder,
            [
                orderData.user_id, orderData.restaurant_id, orderData.created_at, orderData.total_price,
                orderData.service_fee, orderData.delivery_address, orderData.delivery_lat, orderData.delivery_lng,
                orderData.estimated_delivery_time
            ]
        )
        const order_id = order.rows[0].order_id;

        const dishIds = items.map(i => i.dish_id);
        const quantities = items.map(i => i.quantity);
        const prices = items.map(i => i.price_at_order);

        await client.query(queries.addOrderItems, [
            order_id,
            dishIds,
            quantities,
            prices
        ]);

        if (voucherId) {
            await client.query(
                queries.addVouchersToOrder,
                [order_id, voucherId]
            );
        }

        await client.query('COMMIT');
        return order_id;

    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

const getOrdersByUserId = async (userId) => {
    const result = await db.query(queries.getOrdersByUserId, [userId]);
    return result.rows;
};

const getOrderDetails = async (orderId, userId) => {
    const result = await db.query(queries.getOrderDetailsById, [orderId, userId]);

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0].result;
};

const getOrdersByRestaurantId = async (restaurantId, ownerId) => {
    const result = await db.query(queries.getOrdersByRestaurantId, [restaurantId, ownerId]);
    return result.rows;
}

const getOrderStatus = async (orderId, restaurantId, ownerId) => {
    const result = await db.query(queries.getOrderStatus, [orderId, restaurantId, ownerId]);
    return result.rows[0];
};

const updateOrderStatus = async (orderId, newStatus) => {
    const result = await db.query(queries.updateOrderStatus, [newStatus, orderId]);
    return result.rows[0];
};


module.exports = {
    createNewOrder,
    getOrdersByUserId,
    getOrderDetails,
    getOrdersByRestaurantId,
    getOrderStatus,
    updateOrderStatus
};