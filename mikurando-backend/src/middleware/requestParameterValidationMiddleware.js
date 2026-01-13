const validateIdParameter = (req, res, next) => {
    const { id } = req.params;

    const idInt = parseInt(id, 10);

    if (isNaN(idInt) || idInt <= 0) {
        return res.status(400).json({ error: 'Invalid ID supplied.' });
    }

    next();
}

module.exports = {
    validateIdParameter
};