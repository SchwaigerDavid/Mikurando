const userModel = require('../models/userModel');

exports.getUserProfile = async (req, res) => {
    const user_id = req.user.userId;

    try {
        const user = await userModel.getUserById(user_id)

        if (!user) {
            return res.status(404).send({error: "User not found"});
        }

        if (!user.is_active) {
            return res.status(403).send({error: "Forbidden, Account is banned"});
        }

        return res.status(200).send({
            message: 'Success',
            data: user
        })
    } catch (err) {
        console.error('Error when getting a user profile:', err);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

exports.updateProfile = async (req, res) => {
    const userId = req.user.userId;

    const {
        email,
        surname,
        name,
        address,
        area_code,
        geo_lat,
        geo_lng,
        profile_picture_data
    } = req.body;

    if (!email || !surname || !name) {
        return res.status(400).json({ error: 'Email, Vorname und Nachname sind Pflichtfelder.' });
    }

    try {
        const updatedUser = await userModel.updateUser(userId, {
            email,
            surname,
            name,
            address,
            area_code,
            geo_lat,
            geo_lng,
            profile_picture_data
        });

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found.' });
        }

        return res.status(200).json({
            message: 'Profil update succesfull',
            user: updatedUser
        });

    } catch (err) {
        if (err.code === '23505') {
            // PostgresSQL Error Code 23505 = Unique Violation (Email is the only field we update that has a unique constraint)
            return res.status(409).json({ error: 'This Email is already in use.' });
        }

        console.error('Update Profile Error:', err);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
};