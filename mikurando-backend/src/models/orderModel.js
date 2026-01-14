const db = require('../database/db');
const queries = require('../queries/orderQueries');




const createNewOrder = async (orderData, items) => {
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
        const prices = items.map(i => i.price);

        await client.query(queries.addOrderItems, [
            order_id,
            dishIds,
            quantities,
            prices
        ]);

        await client.query('COMMIT');
        return orderId;

    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

module.exports = {
    createNewOrder
};