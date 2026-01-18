// Competition Service
// Handles all business logic for competition operations

import { competitionQueries, queryCompetitionInfoUsers, queryCompetitionInternalLogic } from '../sql/competition.queries';
import { getClient, query } from './dbService';
import { CompetitionData, Day, Event } from '../models/competition.model';

export class CompetitionService {
  

  //######################################################################
  // Query competition section
  //######################################################################
  /**
   * Get all competitions
   */
  async getAllCompetitions() {
    try {
      const result = await query(queryCompetitionInfoUsers.getAllCompetitions);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get competitions: ${error}`);
    }
  }

  /**
   * Get competition by ID
   */
  async getCompetitionById(id: string) {
    try {
      const result = await query(queryCompetitionInfoUsers.getCompetitionById, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to get competition: ${error}`);
    }
  }

  /**
   * Get competitions by status
   */
  async getCompetitionsByStatus(status: number) {
    try {
      const result = await query(queryCompetitionInfoUsers.getCompetitionsByStatus, [status]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get competitions by status: ${error}`);
    }
  }

    /**
   * Get active competitions
   */
  async getActiveCompetitions() {
    try {
      const result = await query(queryCompetitionInfoUsers.getActiveCompetitions);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get active competitions: ${error}`);
    }
  }


  //######################################################################
  // Mutation competition section
  //######################################################################

  /**
   * Create new competition
   */
  async createCompetition() {
    try {
      const result = await query(competitionQueries.createCompetition, []);
      return result.rows[0].comp_id;
    } catch (error) {
      throw new Error(`Failed to create competition: ${error}`);
    }
  }


  /**
   * Delete competition
   */
  async deleteCompetition(id: string) {
    try {
      const result = await query(competitionQueries.deleteCompetition, [id]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Failed to delete competition: ${error}`);
    }
  }


  /**
   * Update competition
   */
  async updateCompetition(id: string, upDateData: CompetitionData) {

    // Get client for transaction
    const client = await getClient();

    try {

      
      const competitionSettings = [
        upDateData.eventName,
        upDateData.type,
        upDateData.status,
        upDateData.eventsOpen,
        upDateData.startDate,
        upDateData.gender,
        upDateData.seedTimes];


      const daysData: Day[] = upDateData.days;
      
      // collets the day and event ids used for deletion later
      const eventAndDayRes = await query(queryCompetitionInternalLogic.getCompetitionDayAndEventIds, [id]);
      const dayIds = [...new Set(eventAndDayRes.rows.map(r => r.competition_day_id))];
      const eventIds = [...new Set(eventAndDayRes.rows.map(r => r.competition_event_id))];

      

     

    } catch (error) {
      throw new Error(`Failed to update competition: ${error}`);
    } finally {
      client.release();
    }
  }



  async rollBack(){


  }


}


export default new CompetitionService();
