const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

exports.register = async (req, res) => {
    const {
        email, password, role, surname, name, address, area_code, profile_picture, geo_lat, geo_lng
    } = req.body;

    try {
        const existingUser = await userModel.getUserByEmail(email);

        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const new_user = await userModel.createUser({
            email, password_hash, role, surname, name, address, area_code, profile_picture, geo_lat, geo_lng
        })

        console.debug(`User created successfully (id: ${new_user.user_id})`);
        res.status(201).json({
            message: 'User successfully created!',
        })

    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({error: 'Internal Server Error'});
    }
};