export const adminQueries = {
  searchUsersByName: `
    SELECT
      user_id,
      username,
      admin
    FROM swimswam_user
    WHERE username LIKE $1
    ORDER BY username ASC
  `,
};
