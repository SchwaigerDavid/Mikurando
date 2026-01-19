const validateIdParameter = (req, res, next) => {
    for (const [key, value] of Object.entries(req.params)) {

        if (key === 'id' || key.endsWith('Id') || key.endsWith('_id')) {

            const idInt = parseInt(value, 10);

            if (isNaN(idInt) || idInt <= 0) {
                return res.status(400).json({
                    error: `Invalid ID supplied for parameter '${key}'. Expected a positive integer.`
                });
            }
        }
    }

    next();
};

module.exports = { validateIdParameter };

module.exports = {
    validateIdParameter
};