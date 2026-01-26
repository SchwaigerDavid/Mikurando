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
    let name = null;
    let category = null;
    let area_code = null;
    let maxDistance = null;

    if (req.body) {
        ({ name, category, area_code, maxDistance } = req.body);
    }

    const userId = req.user.userId;

    try {
        const [user, candidates] = await Promise.all([
            userModel.getUserById(userId),
            restaurantModel.searchRestaurants({ name, category, area_code })
        ]);

        console.log(user)
        if (!user || !user.geo_lat || !user.geo_lng) {
            console.log("No location in profile")
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

                return /*insideDeliveryRadius &&*/ insideUserMaxDist;
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

exports.createDish = async (req, res) => {
    const { restaurantId } = req.params;
    const ownerId = req.user.userId;
    const { category_id, name, price} = req.body;

    try {
        const isOwner = await restaurantModel.checkOwnership(restaurantId, ownerId);
        if (!isOwner) {
            return res.status(404).json({ error: 'Access denied or restaurant not found.' });
        }

        const validCategory = await restaurantModel.verifyCategoryOwnership(category_id, restaurantId);
        if (!validCategory) {
            return res.status(400).json({ error: `Category ID ${category_id} does not belong to this restaurant.` });
        }

        const newDish = await restaurantModel.addDish(restaurantId, req.body);

        res.status(201).json(newDish);

    } catch (err) {
        if (err.code === '23503') {
            return res.status(400).json({ error: 'Invalid Category ID.' });
        }
        console.error('Create Dish Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateDish = async (req, res) => {
    const { restaurantId, dishId } = req.params;
    const ownerId = req.user.userId;
    const { category_id, name, price} = req.body;

    try {
        const isOwner = await restaurantModel.checkOwnership(restaurantId, ownerId);
        if (!isOwner) return res.status(404).json({ error: 'Access denied.' });

        const validCategory = await restaurantModel.verifyCategoryOwnership(category_id, restaurantId);
        if (!validCategory) {
            return res.status(400).json({ error: `Category ID ${category_id} does not belong to this restaurant.` });
        }

        const updatedDish = await restaurantModel.updateDish(dishId, restaurantId, ownerId, req.body);

        if (!updatedDish) {
            return res.status(404).json({ error: 'Dish not found.' });
        }

        res.status(200).json(updatedDish);

    } catch (err) {
        console.error('Update Dish Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteDish = async (req, res) => {
    const { restaurantId, dishId } = req.params;
    const ownerId = req.user.userId;

    try {
        const isOwner = await restaurantModel.checkOwnership(restaurantId, ownerId);
        if (!isOwner) return res.status(404).json({ error: 'Access denied.' });

        const deleted = await restaurantModel.deleteDish(dishId, restaurantId, ownerId);

        if (!deleted) {
            return res.status(404).json({ error: 'Dish not found.' });
        }

        res.status(200).json({ message: 'Dish deleted successfully.' });

    } catch (err) {
        // Error Code 23503: Foreign key is used in other table
        if (err.code === '23503') {
            return res.status(400).json({
                error: 'Cannot delete dish because it is part of past orders. Mark it as unavailable instead.'
            });
        }
        console.error('Delete Dish Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.setDishAvailability = async (req, res) => {
    const { restaurantId, dishId } = req.params;
    const ownerId = req.user.userId;
    const { available } = req.body;

    try {
        const isOwner = await restaurantModel.checkOwnership(restaurantId, ownerId);
        if (!isOwner) return res.status(403).json({ error: 'Access denied.' });

        const updated = await restaurantModel.setAvailability(dishId, restaurantId, available);

        if (!updated) {
            return res.status(404).json({ error: 'Dish not found.' });
        }

        res.status(200).json({
            message: `Dish is now ${updated.avaliable ? 'available' : 'unavailable'}.`,
            dish_id: updated.dish_id,
            available: updated.avaliable
        });

    } catch (err) {
        console.error('Patch Dish Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.getCategories = async (req, res) => {
    const { restaurantId } = req.params;
    const ownerId = req.user.userId;

    try {
        const isOwner = await restaurantModel.checkOwnership(restaurantId, ownerId);
        if (!isOwner) return res.status(403).json({ error: 'Access denied.' });

        const categories = await restaurantModel.getCategories(restaurantId);
        res.status(200).json(categories);

    } catch (err) {
        console.error('Get Categories Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.createCategory = async (req, res) => {
    const { restaurantId } = req.params;
    const ownerId = req.user.userId;
    const { category_name } = req.body;

    try {
        const isOwner = await restaurantModel.checkOwnership(restaurantId, ownerId);
        if (!isOwner) return res.status(403).json({ error: 'Access denied.' });

        const newCategory = await restaurantModel.addCategory(restaurantId, category_name);
        res.status(201).json(newCategory);

    } catch (err) {
        console.error('Create Category Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteCategory = async (req, res) => {
    const { restaurantId, categoryId } = req.params;
    const ownerId = req.user.userId;

    try {
        const isOwner = await restaurantModel.checkOwnership(restaurantId, ownerId);
        if (!isOwner) return res.status(403).json({ error: 'Access denied.' });

        const deleted = await restaurantModel.deleteCategory(categoryId, restaurantId);

        if (!deleted) {
            return res.status(404).json({ error: 'Category not found.' });
        }

        res.status(200).json({ message: 'Category deleted successfully.' });

    } catch (err) {
        //  Error 23503 (Foreign Key Violation)
        if (err.code === '23503') {
            return res.status(400).json({
                error: 'Cannot delete category because it still contains dishes. Please delete or move dishes first.'
            });
        }
        console.error('Delete Category Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};