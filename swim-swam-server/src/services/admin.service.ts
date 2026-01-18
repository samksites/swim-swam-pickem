

import { query } from './dbService';
import { userQueries } from '../sql/user.queries';

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
  
}

export default new AdminService();