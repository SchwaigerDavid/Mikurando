const ownerModel = require("../models/ownerModel");
const {geocodeAddress} = require("../utils/locationUtils");

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
    console.log('Create Restaurant Request Body:', req.body);
    const {
        restaurant_name, description, address, area_code, customer_notes,
        min_order_value, delivery_radius, service_fee,
        image_data, category
    } = req.body;
    let {
        geo_lat, geo_lng
    } = req.body

    const hasCoordinates = geo_lat && geo_lng && (geo_lat !== 0 || geo_lng !== 0);

    if (address && !hasCoordinates) {
        console.log(`Geocoding address: ${address} ${area_code || ''}`);
        
        const searchString = `${address}, ${area_code || ''}`;
        const coords = await geocodeAddress(searchString);

        if (coords) {
            geo_lat = coords.lat;
            geo_lng = coords.lng;
            console.log('Found coordinates:', coords);
        } else {
            console.warn('Address not found via Geocoding');
            return res.status(400).json({ error: 'Address not found via Geocoding.' });
        }
    }

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

exports.getRestaurantDetails = async (req, res) => {
    const ownerId = req.user.userId;
    const restaurantId = req.params.id;
    const restaurantIdInt = parseInt(req.params.id);


    try {
        const restaurantDetails = await ownerModel.getRestaurantDetails(ownerId, restaurantIdInt);

        if (!restaurantDetails) {
            return res.status(404).json({error: 'No restaurant found'});
        }

        if (/coffee/i.test(restaurantDetails.restaurant_name)) {
            if (Math.random() < 0.1) {
                return res.status(418).json({
                    error: "I'm a teapot",
                    message: "This restaurant refuses to brew coffee because it is, in fact, a teapot."
                });
            }
        }

        return res.status(200).send({message: "Success", data: restaurantDetails});

    } catch (err) {
        console.error('Get restaurant details owner Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.updateRestaurant = async (req, res) => {
    const { restaurant_name, description, address, area_code, customer_notes, min_order_value, delivery_radius,
        category, image_data, service_fee } = req.body;
    const ownerId = req.user.userId;
    const restaurantId = req.params.id;
    const restaurantIdInt = parseInt(req.params.id);

    let {
        geo_lat, geo_lng
    } = req.body

    const hasCoordinates = geo_lat && geo_lng && (geo_lat !== 0 || geo_lng !== 0);

    if (address && !hasCoordinates) {
        console.log(`Geocoding address: ${address} ${area_code || ''}`);

        const searchString = `${address}, ${area_code || ''}`;
        const coords = await geocodeAddress(searchString);

        if (coords) {
            geo_lat = coords.lat;
            geo_lng = coords.lng;
            console.log('Found coordinates:', coords);
        } else {
            console.warn('Address not found via Geocoding');
            return res.status(400).json({ error: 'Address not found via Geocoding.' });
        }
    }

    try {
        const updatedRestaurant = await ownerModel.updateRestaurant(ownerId, restaurantIdInt, {restaurant_name, description, address, area_code, customer_notes, min_order_value, delivery_radius,
            category, geo_lat, geo_lng, image_data, service_fee})

        if (!updatedRestaurant) {
            return res.status(404).json({ error: 'Restaurant not found.' });
        }

        return res.status(200).send({
            message: 'Restaurant update successful',
            data: updatedRestaurant
        });
    } catch (err) {
        console.error('Update restaurant details Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}