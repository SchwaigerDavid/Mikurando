const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");
const restaurantModel = require("../models/restaurantModel");
const voucherModel = require("../models/voucherModel");

const { calculateDistance, calculateDeliveryTime } = require('../utils/locationUtils');
const { checkRestaurantOpenStatus } = require("../utils/timeUtils");

exports.createOrder = async (req, res) => {
    const {restaurant_id, items, voucher_code} = req.body;
    const user_id = req.user.userId;

    try {

        // verify user exists and grap delivery_adress / delivery_lat / delivery_lng from db
        // verify restaurant exists and grap service fee from db
        // verify ordered items exist and fetch price for each item from DB, replace in array
        const [user, restaurant, dishes] = await Promise.all([
            userModel.getUserById(user_id),
            restaurantModel.getRestaurantDetailsById(restaurant_id),
            restaurantModel.getDishesByIds(items.map(i => i.dish_id))
        ]);


        if (!user) return res.status(404).json({ error: 'User not found.' });
        if (!restaurant) return res.status(404).json({ error: 'Restaurant not found.' });

        if (!restaurant.is_active) {
            return res.status(400).json({ error: 'Dieses Restaurant ist derzeit inaktiv.' });
        }

        const openStatus = checkRestaurantOpenStatus(restaurant.opening_hours);

        if (!openStatus.isOpen) {
            return res.status(400).json({ error: openStatus.reason });
        }

        let subtotal = 0;
        const enrichedItems = [];

        for (const item of items) {
            const dbDish = dishes.find(d => d.dish_id === item.dish_id);

            if (!dbDish) {
                return res.status(404).json({ error: `Dish ${item.dish_id} not found.` });
            }
            if (!dbDish.avaliable) {
                return res.status(400).json({ error: `Dish "${dbDish.name}" is not avaliable.` });
            }
            if (dbDish.restaurant_id !== restaurant_id) {
                return res.status(400).json({ error: `Dish "${dbDish.name}" is not part of this restaurant.` });
            }

            const itemPrice = parseFloat(dbDish.price);
            const dishTotal = itemPrice * item.quantity;
            subtotal += dishTotal;

            enrichedItems.push({
                dish_id: item.dish_id,
                dish_name: dbDish.name,
                quantity: item.quantity,
                price_at_order: itemPrice
            });
        }


        if (!user.geo_lat || !user.geo_lng) {
            return res.status(400).json({ error: 'User has no valid address.' });
        }
        if (!restaurant.geo_lat || !restaurant.geo_lng) {
            return res.status(500).json({ error: `Restaurant has no valid address.`});
        }


        // verify delivery radius
        const distanceKm = calculateDistance(
            parseFloat(user.geo_lat), parseFloat(user.geo_lng),
            parseFloat(restaurant.geo_lat), parseFloat(restaurant.geo_lng)
        );

        if (distanceKm > restaurant.delivery_radius) {
            return res.status(400).json({
                error: `User is not in delivery Radius,.`
            });
        }

        // verify min order value
        if (subtotal < restaurant.min_order_value) {
            return res.status(400).json({
                error: `Min order value not reached.`
            });
        }

        const service_fee = restaurant.service_fee

        let discount = 0;
        let usedVoucherId = null;

        if (voucher_code) {
            const voucher = await voucherModel.getVoucherByCode(voucher_code);

            if (!voucher) {
                return res.status(404).json({ error: `Voucher "${voucher_code}" invalid.` });
            }

            if (new Date(voucher.valid_until) < new Date()) {
                return res.status(400).json({ error: `Voucher "${voucher_code}" is expired.` });
            }

            if (voucher.voucher_value_is_percentage) {
                discount = subtotal * (parseFloat(voucher.voucher_value) / 100);
            } else {
                discount = parseFloat(voucher.voucher_value);
            }

            if (discount > subtotal) {
                discount = subtotal;
            }

            usedVoucherId = voucher.voucher_id;
        }
        // add up prices to calculate total price
        let total_price = subtotal + service_fee - discount;
        if (total_price < 0) total_price = 0;

        // Calculate estimated_delivery_time, use map api
        const preparation_time = 15; // 15 min prep Time

        // API -> call
        let travel_time = await getTravelTime(
            userLat, userLng,
            parseFloat(restaurant.geo_lat), parseFloat(restaurant.geo_lng)
        );

        // API says impossible, we say, we run
        if (!travel_time) {
            console.log('No route found, we will run in a straight line for our customers');
            const speed = 10; // -> km/h
            travel_time = Math.ceil((distanceKm / speed) * 60);
        }

        const totalMinutes = preparation_time + travel_time;
        const estimated_delivery_time = new Date(Date.now() + totalMinutes * 60000);



        let orderData = {
            user_id: user_id,
            restaurant_id: restaurant_id,
            created_at: new Date(),
            total_price: total_price,
            service_fee: service_fee,
            delivery_address: user.address,
            delivery_lat: user.geo_lat,
            delivery_lng: user.geo_lng,
            estimated_delivery_time: estimated_delivery_time
        }



      //  console.log(enrichedItems);
    const order_id = await orderModel.createNewOrder(orderData, enrichedItems, usedVoucherId);
    return res.status(201).send({
        message: `Order ${order_id} created`,
        data: {
            order_id: order_id,
            status: "PLACED",
            total_price: parseFloat(total_price.toFixed(2)),
            service_fee: parseFloat(service_fee.toFixed(2)),
            created_at: orderData.created_at,
            delivery_address: orderData.delivery_address,
            items: enrichedItems,
            estimated_delivery_time: estimated_delivery_time
        }
    });


    } catch (err) {
        console.error('Order creation Error:', err);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

exports.getOrderHistory = async (req, res) => {
    const userId = req.user.userId;

    try {
        const orders = await orderModel.getOrdersByUserId(userId);

        return res.status(200).send({message: "Success", data: orders});

    } catch (err) {
        console.error('Get Order History Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.getOrderDetails = async (req, res) => {
    const {id} = req.params;
    const userId = req.user.userId;


    const idInt = parseInt(id, 10);

    try {
        const order = await orderModel.getOrderDetails(idInt, userId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found.' });
        }

        return res.status(200).send({
            message: 'Success',
            data: order
        })
    } catch (err) {
        console.error('Restaurant Request Error:', err);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

exports.getRestaurantOrders = async (req, res) => {
    const { id } = req.params;
    const ownerId = req.user.userId;
    const rId = parseInt(id, 10);

    try {
        const orders = await orderModel.getOrdersByRestaurantId(rId, ownerId);

        res.status(200).json(orders);

    } catch (err) {
        console.error('Get Orders Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


exports.updateStatus = async (req, res) => {
    const {restaurantId, orderId} = req.params;
    const ownerId = req.user.userId;
    const rId = parseInt(restaurantId, 10);
    const oId = parseInt(orderId, 10);
    let { status } = req.body;
    const newStatus = status;

    const allowedTransitions = {
        'PLACED':     ['ACCEPTED', 'DECLINED'],
        'ACCEPTED':   ['PREPARING', 'CANCELED'],
        'PREPARING':  ['READY', 'CANCELED'],
        'READY':      ['DISPATCHED', 'CANCELED'],
        'DISPATCHED': ['DELIVERED'],
        'DELIVERED':  [],
        'DECLINED':   [],
        'CANCELED':   []
    };

    try {
        const currentOrder = await orderModel.getOrderStatus(oId, rId, ownerId);

        if (!currentOrder) {
            return res.status(404).json({error: 'Order not found or access denied.'});
        }

        const currentStatus = currentOrder.status;

        const allowedNextSteps = allowedTransitions[currentStatus];

        if (!allowedNextSteps || !allowedNextSteps.includes(newStatus)) {
            return res.status(400).json({
                error: `Invalid status transition. Cannot go from ${currentStatus} to ${newStatus}.}`
            });
        }

        const updatedOrder = await orderModel.updateOrderStatus(oId, newStatus);

        res.status(200).json({
            message: 'Status updated successfully',
            order_id: updatedOrder.order_id,
            old_status: currentStatus,
            new_status: updatedOrder.status
        });
    } catch (err) {
        console.error('Update Status Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}