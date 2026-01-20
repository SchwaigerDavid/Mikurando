const db = require('../database/db');
const queries = require('../queries/voucherQueries');

const getVoucherByCode = async (code) => {
    const result = await db.query(queries.getVoucherByCode, [code]);
    return result.rows[0];
};

module.exports = {
    getVoucherByCode
};