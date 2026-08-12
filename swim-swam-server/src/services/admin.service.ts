

import { query } from './dbService';
import { userQueries } from '../sql/user.queries';
import { adminQueries } from '../sql/admin.queries';

// src/services/admin.service.ts
// Admin Service
// This service handles any admin-specific operations
export class AdminService {

    /**
     * Verify if a user is an admin
     * @param userId The ID of the user to verify
     * @returns A promise that resolves to true if the user is an admin, false otherwise
     */
    async verifyAdminUser(userId: string): Promise<boolean> {
        try {
            const result = await query(userQueries.isAdminUser, [userId]);
            return result.rows[0]?.admin || false;
        } catch (error) {
            throw new Error(`Failed to verify admin user: ${error}`);
        }
    }

    /**
     * Search users by username.
     * @param name The username search text.
     * @returns Matching users with user_id, username, and admin status.
     */
    async searchUsersByName(name: string) {
        try {
            const searchValue = `%${String(name ?? '').trim()}%`;
            const result = await query(adminQueries.searchUsersByName, [searchValue]);
            return result.rows;
        } catch (error) {
            throw new Error(`Failed to search users: ${error}`);
        }
    }
  
}

export default new AdminService();