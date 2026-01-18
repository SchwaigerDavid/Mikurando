const validateIdParameter = (req, res, next) => {
    const idRaw =
        req.params.id ??
        req.params.userId ??
        req.params.voucherId ??
        req.params.restaurantId ??
        req.params.orderId;

    const idInt = parseInt(String(idRaw), 10);

    if (isNaN(idInt) || idInt <= 0) {
        return res.status(400).json({ error: 'Invalid ID supplied.' });
    }

    next();
}

module.exports = {
    validateIdParameter
};