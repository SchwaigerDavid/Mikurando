const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const userEventModel = require('../models/userEventModel');

exports.register = async (req, res) => {
    const {
        email, password, role, surname, name, address, area_code, profile_picture, geo_lat, geo_lng
    } = req.body;

    try {
        const existingUser = await userModel.getUserIdByEmail(email);

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

exports.login = async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await userModel.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({error: 'Wrong email or password'});
        }

        const passwordMatches = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatches) {
            return res.status(401).json({error: 'Wrong email or password'});
        }
        delete user.password_hash;

        if (!user.is_active) {
            return res.status(403).json({error: 'Login Failed, Account is banned.'})
        }

        await userEventModel.recordEvent(user.user_id, 'LOGIN');

        // Login Successful, create JWT
        const jwt_token = jwt.sign(
            { // Token Payload
            userId: user.user_id,
            role: user.role,
            },
            process.env.JWT_SECRET, // Token Secret
            {expiresIn: process.env.JWT_TOKEN_DURATION} // Token lifetime
        )

        console.debug(`Login Successfful User ${user.user_id} logged in`);
        res.status(200).json({
            message: 'Login Successfull',
            token: jwt_token,
            user: user
        })
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({error: 'Internal Server Error'});
    }
}