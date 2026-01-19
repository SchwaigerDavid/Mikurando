const restaurantModel = require('../models/restaurantModel');
const userModel = require('../models/userModel');

const {calculateDistance} = require('../utils/locationUtils')

exports.getRestaurantDetailsById = async (req, res) => {
    const {id} = req.params;

    const idInt = parseInt(id, 10);

    try {
        const restaurant = await restaurantModel.getRestaurantDetailsById(idInt)

        if (!restaurant) {
            return res.status(404).send({"error": "Restaurant not found"});
        }

        return res.status(200).send({
            message: 'Success',
            data: restaurant
        })
    } catch (err) {
        console.error('Restaurant Request Error:', err);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

exports.getRestaurantReviews = async (req, res) => {
    const {id} = req.params;

    const idInt = parseInt(id, 10);

    try {
        const restaurantName = await restaurantModel.getRestaurantNameById(idInt);

        if (!restaurantName) {
            return res.status(404).send({"error": "Restaurant not found"});
        }

        const reviews = await restaurantModel.getRestaurantReviews(idInt)

        return res.status(200).send({
            message: 'Success',
            data: reviews
        })
    } catch (err) {
        console.error('Restaurant Request Error:', err);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

exports.addRestaurantReview = async (req, res) => {
    const {id} = req.params;
    const idInt = parseInt(id, 10);

    const {dish_id, rating, comment} = req.body;
    const user_id = req.user.userId;


    try {
        const restaurantName = await restaurantModel.getRestaurantNameById(idInt);

        if (!restaurantName) {
            return res.status(404).send({error: "Restaurant not found"});
        }

        if (dish_id){
            const dish_name = await restaurantModel.getDishNameById(dish_id, idInt);

            if (!dish_name) {
                return res.status(404).send({error: 'Dish not found'});
            }
        }

        // TODO: check if user has ordered dish at the restaurant

        const currentTime = new Date()

        await restaurantModel.addRestaurantReview(idInt, user_id, dish_id, currentTime, rating, comment)

        return res.status(201).send({
            message: 'Review created'
        })

    } catch (err) {
        console.error('Restaurant Request Error:', err);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

exports.searchRestaurants = async (req, res) => {
    const { name, category, area_code, maxDistance } = req.body;
    const userId = req.user.userId;

    try {
        const [user, candidates] = await Promise.all([
            userModel.getUserById(userId),
            restaurantModel.searchRestaurants({ name, category, area_code })
        ]);

        if (!user || !user.geo_lat || !user.geo_lng) {
            return res.status(400).json({
                error: 'Please add a location to your user profile in order to search for restaurants.'
            });
        }

        const userLat = parseFloat(user.geo_lat);
        const userLng = parseFloat(user.geo_lng);

        const userMaxDist = maxDistance ? parseFloat(maxDistance) : Infinity;

        const results = candidates
            .map(r => {
                const distKm = calculateDistance(
                    userLat, userLng,
                    parseFloat(r.geo_lat), parseFloat(r.geo_lng)
                );
                return { ...r, distance_km: distKm };
            })
            .filter(r => {
                const insideDeliveryRadius = r.distance_km <= r.delivery_radius;
                const insideUserMaxDist = r.distance_km <= userMaxDist;

                return insideDeliveryRadius && insideUserMaxDist;
            })
            .map(r => {
                const timeMin = Math.round(15 + (r.distance_km * 10));
                return {
                    ...r,
                    distance_km: parseFloat(r.distance_km.toFixed(2)),
                    estimated_time_min: timeMin
                };
            })
            .sort((a, b) => a.distance_km - b.distance_km);

        res.status(200).json(results);

    } catch (err) {
        console.error('Search Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateOpeningHours = async (req, res) => {
    const { restaurantId } = req.params;
    const { schedule } = req.body;
    const ownerId = req.user.userId;


    try {
        const success = await restaurantModel.updateOpeningHours(
            parseInt(restaurantId, 10),
            ownerId,
            schedule
        );

        if (!success) {
            return res.status(404).json({ error: 'Restaurant not found or permission denied.' });
        }

        res.status(200).json({ message: 'Hours updated successfully.' });

    } catch (err) {
        console.error('Update Hours Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};