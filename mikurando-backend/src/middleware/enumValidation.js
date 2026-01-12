const VALID_ROLES = ['CUSTOMER', 'OWNER', 'MANAGER'];
const VALID_ORDER_STATUS = ['PLACED', 'ACCEPTED', 'DECLINED', 'PREPARING', 'READY', 'DISPATCHED', 'DELIVERED', 'CANCELED'];
const VALID_WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];


const validateRoleEnum = (req, res, next) => {
    const { role } = req.body;
    if (role && !VALID_ROLES.includes(role)) {
        return res.status(400).json({
            error: `Invalid Role. Valid Roles are: ${VALID_ROLES.join(', ')}`
        });
    }
    next(); // hand request over to next middleware / next controller
};

const validateStatusEnum = (req, res, next) => {
    const { status } = req.body;

    if (status && !VALID_ORDER_STATUS.includes(status)) {
        return res.status(400).json({
            error: `Invalid Status. Valid States: ${VALID_ORDER_STATUS.join(', ')}`
        });
    }
    next(); // hand request over to next middleware / next controller
};


const validateDayEnum = (req, res, next) => {
    const { day } = req.body;
    if (day && !VALID_WEEKDAYS.includes(day)) {
        return res.status(400).json({
            error: `Invalid weekday. Valid Weekdays: ${VALID_WEEKDAYS.join(', ')}`
        });
    }
    next(); // hand request over to next middleware / next controller
};

module.exports = {
    validateRoleEnum,
    validateStatusEnum,
    validateDayEnum
};