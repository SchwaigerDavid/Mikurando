const db = require('../database/db');
const queries = require('../queries/userQueries');


const getUserByEmail = async (email) => {
    const result = await db.query(queries.checkEmailExists, [email]);
    return result.rows[0];
};

const createUser = async (userData) => {
    const {email, password_hash, role, surname, name, address, area_code, profile_picture, geo_lat, geo_lng} = userData;

    const result = await db.query(queries.registerUser, [
        email, password_hash, role, surname, name, address, area_code, profile_picture, geo_lat, geo_lng
    ]);

    return result.rows[0];
}

module.exports = {
    getUserByEmail,
    createUser
};