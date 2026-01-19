
const ratingIsValidNumber = (req, res, next) => {
    const { rating } = req.body;

    if (isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
    }

    next();
}

const createOrderParametersAreComplete = (req, res, next) => {
    const {restaurant_id, items} = req.body;

    if (!restaurant_id ||restaurant_id <= 0) {
        return res.status(400).json({ error: 'Restaurant id invalid.' });
    }

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'No articles in shopping basket.' });
    }

    for (const item of items) {
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
            return res.status(400).json({ error: `Invalid Order Parameters, quantity must be > 0` });
        }
    }

    next();
}

const checkDishParameters = (req, res, next) => {
    const { category_id, name, price } = req.body;

    if (!name || !price || !category_id) {
        return res.status(400).json({ error: 'Name, Price and Category ID are required.' });
    }

    next();
}

const checkAvailabilityParameter = (req, res, next) => {
    const { available } = req.body;

    if (typeof available !== 'boolean') {
        return res.status(400).json({ error: 'Field "available" must be true or false.' });
    }

    next();

}

module.exports = {
    ratingIsValidNumber,
    createOrderParametersAreComplete,
    checkDishParameters,
    checkAvailabilityParameter
};