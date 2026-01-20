const getVoucherByCode = `
    SELECT * FROM "Voucher" 
    WHERE UPPER(code) = UPPER($1)
`;
module.exports = {
    getVoucherByCode
};