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

const getUserNameById = 'SELECT name FROM "User" WHERE user_id = $1';

const getUserByEmail =`
    SELECT 
        * 
    FROM "User"
    WHERE email = $1
`

const getUserById = `
    SELECT 
    user_id, email, role, surname, name, address, area_code, profile_picture, geo_lat, geo_lng, is_active
    FROM "User"
    WHERE user_id = $1
`

const updateUserProfile = `
    UPDATE "User"
    SET 
        email = $1,
        surname = $2,
        name = $3,
        address = $4,
        geo_lat = $5,
        geo_lng = $6,
        profile_picture = $7,
        area_code = $8        
    WHERE user_id = $9        
    RETURNING user_id, email, role, surname, name, address, area_code, geo_lat, geo_lng, profile_picture
`;


module.exports = {
    registerUser,
    checkEmailExists,
    getUserByEmail,
    getUserNameById,
    getUserById,
    updateUserProfile
}