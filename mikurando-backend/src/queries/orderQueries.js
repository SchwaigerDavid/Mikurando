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

const getOrderDetailsById = `
    WITH OrderItems AS (
        SELECT 
            oi.order_id,
            json_agg(json_build_object(
                'dish_id', oi.dish_id,
                'name', d.name,
                'quantity', oi.quantity,
                'price', oi.price
            )) as items_data
        FROM "Ordered_Items" oi
        JOIN "Dish" d ON oi.dish_id = d.dish_id
        WHERE oi.order_id = $1
        GROUP BY oi.order_id
    ),
    OrderVouchers AS (
        SELECT 
            uv.order_id,
            json_agg(json_build_object(
                'code', v.code,
                'value', v.voucher_value
            )) as voucher_data
        FROM "Used_Vouchers" uv
        JOIN "Voucher" v ON uv.voucher_id = v.voucher_id
        WHERE uv.order_id = $1
        GROUP BY uv.order_id
    )
    SELECT json_build_object(
        'order_id', o.order_id,
        'status', o.status,
        'total_price', o.total_price,
        'service_fee', o.service_fee,
        'created_at', o.created_at,
        'delivery_address', o.delivery_address,
        'estimated_delivery_time', o.estimated_delivery_time,
        'items', COALESCE(i.items_data, '[]'::json),
        'used_vouchers', COALESCE(v.voucher_data, '[]'::json) 
    ) as result
    FROM "Order" o
    LEFT JOIN OrderItems i ON o.order_id = i.order_id
    LEFT JOIN OrderVouchers v ON o.order_id = v.order_id
    WHERE o.order_id = $1 AND o.user_id = $2; 
`;

module.exports = {
    createNewOrder,
    addOrderItems,
    addVouchersToOrder,
    getOrdersByUserId,
    getOrderDetailsById
}

