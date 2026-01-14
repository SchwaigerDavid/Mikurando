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
