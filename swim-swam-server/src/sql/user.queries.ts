export const userQueries = { 

    // Get user by ID
    getUserById: 'SELECT * FROM users WHERE id = $1',

    // isAdmin field check
    isAdminUser: 'SELECT admin FROM users WHERE user_id = $1'

}