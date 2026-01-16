const createNewOrder = `
    INSERT INTO "Order"
        (user_id, restaurant_id, status, created_at, total_price, service_fee, delivery_address, delivery_lat, delivery_lng, estimated_delivery_time)
    VALUES 
        ($1, $2, 'PLACED', $3, $4, $5, $6, $7, $8, $9)
    RETURNING 
        order_id
`

const addOrderItems = `
    INSERT INTO "Ordered_Items" 
        (order_id, dish_id, quantity, price)
    SELECT $1, unnest($2::int[]), unnest($3::int[]), unnest($4::numeric[]) 
`; // unnest unnests ;) the array of values into rows and inserts both rows

const addVouchersToOrder = 'INSERT INTO "Used_Vouchers" (order_id, voucher_id) VALUES ($1, $2)'

const getOrdersByUserId = `
    SELECT
    o.order_id,
        o.restaurant_id,
        r.restaurant_name,
        o.status,
        o.total_price,
        o.created_at
    FROM "Order" o
    JOIN "Restaurant" r ON o.restaurant_id = r.restaurant_id
    WHERE o.user_id = $1
    ORDER BY o.created_at DESC
`;

module.exports = {
    createNewOrder,
    addOrderItems,
    addVouchersToOrder,
    getOrdersByUserId
}

