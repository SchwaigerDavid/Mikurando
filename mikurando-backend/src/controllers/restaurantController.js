const bcrypt = require('bcrypt');
const restaurantModel = require('../models/restaurantModel');

exports.getRestaurantDetailsById = async (req, res) => {
    const {id} = req.params;

    const idInt = parseInt(id, 10);

    try {
        const restaurant = await restaurantModel.getRestaurantDetailsById(idInt)

        if (!restaurant) {
            return res.status(404).send({"error": "Restaurant not found"});
        }

        return res.status(200).send({
            message: 'Restaurant found',
            data: restaurant
        })
    } catch (err) {
        console.error('Restaurant Request Error:', err);
        res.status(500).json({error: 'Internal Server Error'});
    }
}