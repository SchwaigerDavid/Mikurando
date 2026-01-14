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


module.exports = {
    createNewOrder,
    addOrderItems
}