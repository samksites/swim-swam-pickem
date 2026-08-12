export const userQueries = { 

    // Get user by ID
    getUserById: 'SELECT * FROM swimswam_user WHERE public_user_id = $1',

        // isAdmin field check
        isAdminUser: 'SELECT admin FROM swimswam_user WHERE public_user_id = $1',

        // Get only current competitions for admin live views
        getActiveCompetitions: `
            SELECT
                comp_id,
                title,
                created_on,
                entries_open,
                status,
                starts_on,
                gender,
                meet_type
            FROM Competitions
            WHERE status = 'current'
            ORDER BY starts_on ASC
        `

}