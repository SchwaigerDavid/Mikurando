const VALID_ROLES = ['CUSTOMER', 'OWNER', 'MANAGER'];
const VALID_ORDER_STATUS = ['PLACED', 'ACCEPTED', 'DECLINED', 'PREPARING', 'READY', 'DISPATCHED', 'DELIVERED', 'CANCELED'];
const VALID_WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

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

const validateScheduleFormat = (req, res, next) => {
    const { schedule } = req.body;

    if (!Array.isArray(schedule)) {
        return res.status(400).json({ error: 'Schedule must be an array of objects.' });
    }

    for (let i = 0; i < schedule.length; i++) {
        const entry = schedule[i];

        if (!entry.day || !entry.open_from || !entry.open_till) {
            return res.status(400).json({
                error: `Entry at index ${i} is missing mandatory fields (day, open_from, open_till).`
            });
        }

        if (!timeRegex.test(entry.open_from) || !timeRegex.test(entry.open_till)) {
            return res.status(400).json({
                error: `Invalid time format in entry ${entry.day}. Use HH:MM (e.g., '09:00').`
            });
        }
    }

    next();
};

const validateScheduleDays = (req, res, next) => {
    const { schedule } = req.body;
    for (const entry of schedule) {
        if (!VALID_WEEKDAYS.includes(entry.day)) {
            return res.status(400).json({
                error: `Invalid weekday '${entry.day}'. Allowed: ${VALID_WEEKDAYS.join(', ')}`
            });
        }
    }

    next();
};
module.exports = {
    validateRoleEnum,
    validateStatusEnum,
    validateDayEnum,
    validateScheduleDays,
    validateScheduleFormat
};