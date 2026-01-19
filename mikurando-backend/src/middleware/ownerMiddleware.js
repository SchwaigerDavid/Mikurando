const checkRestaurantCreation = (req, res, next) => {
    const {
        restaurant_name, description, address, area_code, customer_notes,
        min_order_value, delivery_radius, service_fee,
        image_data, geo_lat, geo_lng, category
    } = req.body;

    if (!restaurant_name || !description || !address || !area_code || !min_order_value
    || !delivery_radius || !service_fee || !image_data || !geo_lat || !geo_lng || !category) {
        return res.status(400).send({message: "Please fill out all the required fields"});
    }

    next();
}

module.exports = {
    checkRestaurantCreation
}