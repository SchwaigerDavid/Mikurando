const daysMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const checkRestaurantOpenStatus = (openingHours, date = new Date()) => {
    const currentDayName = daysMap[date.getDay()];
    const currentTimeString = date.toTimeString().split(' ')[0];
    const todaySchedule = openingHours.find(h => h.day === currentDayName);

    if (!todaySchedule) {
        return {
            isOpen: false,
            reason: `Restaurant is closed on ${currentDayName}.`
        };
    }

    if (currentTimeString < todaySchedule.open_from || currentTimeString > todaySchedule.open_till) {
        return {
            isOpen: false,
            reason: `Restaurant is currently closed. Opened today from: ${todaySchedule.open_from.slice(0,5)} till ${todaySchedule.open_till.slice(0,5)}.`
        };
    }

    return { isOpen: true, reason: null };
};

module.exports = { checkRestaurantOpenStatus };