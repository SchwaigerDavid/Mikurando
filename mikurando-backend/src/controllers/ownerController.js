const ownerModel = require("../models/ownerModel");

exports.getRestaurants = async (req, res) => {
    const userId = req.user.userId;

    try {
        const orders = await ownerModel.getRestaurantsByOwnerId(userId);

        return res.status(200).send({message: "Success", data: orders});

    } catch (err) {
        console.error('Get my restaurants Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.createRestaurant = async (req, res) => {
    const ownerId = req.user.userId;

    const {
        restaurant_name, description, address, area_code, customer_notes,
        min_order_value, delivery_radius, service_fee,
        image_data, geo_lat, geo_lng, category
    } = req.body;

    try {
        const newRestaurant = await ownerModel.createRestaurant(ownerId, {
            restaurant_name, description, address, area_code, customer_notes,
            min_order_value, delivery_radius, service_fee,
            image_data, geo_lat, geo_lng, category
        });

        res.status(201).json({
            message: 'Restaurant created',
            restaurant: newRestaurant
        });

    } catch (err) {
        console.error('Create Restaurant Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}