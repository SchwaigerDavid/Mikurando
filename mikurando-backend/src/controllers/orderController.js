const orderModel = require("../models/orderModel");

exports.createOrder = async (req, res) => {
    const {restaurant_id, items, voucher_code, delivery_address, geo_lat, geo_lng} = req.body;
    const user_id = req.user.userId;



    try {

    } catch (err) {
        console.error('Order creation Error:', err);
        res.status(500).json({error: 'Internal Server Error'});
    }
}