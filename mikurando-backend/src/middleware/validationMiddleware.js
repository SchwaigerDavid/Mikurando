const validateRegistration = (req, res, next) => {
    const { email, password, name, surname, role } = req.body;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email || !password || !role || !surname) {
        return res.status(400).json({error: 'Please fill out all mandatory fields.'});
    }

    if (!emailRegex.test(email)) {
        return res.status(400).json({error: 'Invalid Email Format'});
    }
    next(); // hand request over to next middleware / next controller
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password || !password.length) {
        return res.status(400).json({error: 'Please fill out all mandatory fields.'});
    }

    next();
}

module.exports = {
    validateRegistration,
    validateLogin
};