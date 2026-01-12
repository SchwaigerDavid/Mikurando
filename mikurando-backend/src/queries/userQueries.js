const registerUser =
    `
    INSERT INTO "User" 
        (email, password_hash, role, surname, name, address, area_code, profile_picture, geo_lat, geo_lng) 
    VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING 
        user_id
    `

const checkEmailExists = 'SELECT user_id FROM "User" WHERE email = $1';

const getUserByEmail =`
    SELECT 
        * 
    FROM "User"
    WHERE email = $1
`

module.exports = {
    registerUser,
    checkEmailExists,
    getUserByEmail
}