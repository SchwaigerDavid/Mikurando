const bcrypt = require('bcrypt');
const restaurantModel = require('../models/restaurantModel');
const userModel = require('../models/userModel');

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