// Competition Service
// Handles all business logic for competition operations

import { competitionQueries, queryCompetitionInfoUsers } from '../sql/competition.queries';
import { getClient, query } from './dbService';
import { CompetitionData } from '../models/competition.model';
import { logLevels } from './logger';

type CompetitionStatus = 'upcoming' | 'current' | 'completed';
type CompetitionGender = 'M' | 'W' | 'B';
type MeetType = 'SCY' | 'SCM' | 'LCM';

interface PersistedSwimmer {
  swimmer_id: string;
  swimmer_name: string;
  swimmer_time: string | null;
  place_finish: number;
}

interface PersistedEvent {
  event_id: string;
  event_title: string;
  event_order: number;
  swimmers: PersistedSwimmer[];
}

interface PersistedDay {
  day_id: string;
  day_title: string;
  day_order: number;
  events: PersistedEvent[];
}

interface PersistedCompetition {
  title: string;
  entries_open: string;
  status: CompetitionStatus;
  starts_on: string;
  gender: CompetitionGender;
  meet_type: MeetType;
  days: PersistedDay[];
}

const toPersistedId = (value?: string): string => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : '-1';
};

const mapStatus = (status: CompetitionData['status']): CompetitionStatus => {
  if (typeof status === 'number') {
    if (status === 2) return 'completed';
    if (status === 1) return 'current';
    return 'upcoming';
  }

  if (status === 'completed' || status === 'current' || status === 'upcoming') {
    return status;
  }

  return 'upcoming';
};

const mapGender = (gender: string): CompetitionGender => {
  const normalized = String(gender).trim().toLowerCase();
  if (normalized === 'w') return 'W';
  if (normalized === 'm') return 'M';
  if (normalized === 'c' || normalized === 'b') return 'B';
  if (normalized === 'womens' || normalized === 'women') return 'W';
  if (normalized === 'mens' || normalized === 'men') return 'M';
  return 'B';
};

const mapMeetType = (type?: string): MeetType => {
  const normalized = String(type ?? '').trim().toLowerCase();
  if (normalized === 'scm') return 'SCM';
  if (normalized === 'lcm') return 'LCM';
  return 'SCY';
};

const normalizeCompetition = (input: CompetitionData): PersistedCompetition => {
  const entriesOpen = input.entries_open ?? input.entriesCloseDate ?? '';
  const startsOn = input.starts_on ?? input.startDate ?? '';
  const meetType = input.meet_type ?? input.type;

  const days = (input.days ?? []).map((day, dayIndex) => {
    const events = (day.events ?? []).map((event, eventIndex) => {
      const swimmers = (event.swimmers ?? []).map((swimmer, swimmerIndex) => ({
        swimmer_id: toPersistedId(swimmer.swimmer_id ?? swimmer.id),
        swimmer_name: swimmer.swimmer_name ?? swimmer.name ?? '',
        swimmer_time: swimmer.swimmer_time ?? swimmer.time ?? null,
        place_finish: swimmer.place_finish ?? swimmerIndex + 1,
      }));

      return {
        event_id: toPersistedId(event.event_id ?? event.id),
        event_title: event.event_title ?? event.title ?? '',
        event_order: event.event_order ?? event.index ?? eventIndex + 1,
        swimmers,
      };
    });

    return {
      day_id: toPersistedId(day.day_id ?? day.id),
      day_title: day.day_title ?? day.title ?? `Day ${dayIndex + 1}`,
      day_order: day.day_order ?? dayIndex + 1,
      events,
    };
  });

  return {
    title: input.title,
    entries_open: entriesOpen,
    status: mapStatus(input.status),
    starts_on: startsOn,
    gender: mapGender(input.gender),
    meet_type: mapMeetType(meetType),
    days,
  };
};

const withCreateTemplate = (input: PersistedCompetition): PersistedCompetition => {
  if (input.days.length > 0) {
    return input;
  }

  return {
    ...input,
    days: [
      {
        day_id: '-1',
        day_title: 'Day 1',
        day_order: 1,
        events: [
        ],
      },
    ],
  };
};

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
  async getCompetitionsByStatus(status: 'upcoming' | 'current' | 'completed') {
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
   * Create or update competition
   */
  async updateCompetition(id: number, upDateData: CompetitionData, userId: string): Promise<number> {

    // Get client for transaction
    const client = await getClient();

    let competitionId: number = Number.isNaN(id) ? -1 : id;
    const normalizedData = normalizeCompetition(upDateData);
    const isCreate = competitionId < 0;
    const competitionDataToPersist = isCreate ? withCreateTemplate(normalizedData) : normalizedData;

    try {
      // Start transaction
      await client.query('BEGIN');


      if (isCreate) {
        logLevels.info(`Creating new competition`, { userId, timestamp: new Date().toISOString()});
        const maxIdResult = await client.query(competitionQueries.getCompetitionMaxID);
        competitionId = maxIdResult.rows[0].max_id || 1; // Start at 1 if no competitions exist
        logLevels.info(`Generated new competition ID`, {competitionId});
      }

        const result = await client.query(competitionQueries.upsertCompetition, [
          competitionId,
          competitionDataToPersist.title,
          competitionDataToPersist.entries_open,
          competitionDataToPersist.status,
          competitionDataToPersist.starts_on,
          competitionDataToPersist.gender,
          competitionDataToPersist.meet_type
        ]);

        /**
        * ###################################################################################
        * This section handles inserting new days and updating existing days for the competition. 
        * It builds batch insert and update queries using the SqlUtils helper functions, 
        * and executes them within the same transaction as the competition upsert. 
        * This ensures that all changes to the competition and its associated days are atomic - if any part fails, 
        * the entire transaction will be rolled back to maintain data integrity.
        * ###################################################################################
        */

        const maxDayIdResult = await client.query(competitionQueries.getCompetitionDaysMaxID, []);
        let maxDayId = (maxDayIdResult.rows[0]?.max_id ?? 0) + 1;

        const maxEventIdResult = await client.query(competitionQueries.getCompetitionEventsMaxID, []);
        let maxEventId = (maxEventIdResult.rows[0]?.max_id ?? 0) + 1;

        const maxSwimmerIdResult = await client.query(competitionQueries.getMaxSwimmerID, []);
        let maxSwimmerId = (maxSwimmerIdResult.rows[0]?.max_id ?? 0) + 1;

        const days = competitionDataToPersist.days || [];
        const compID = Number(result.rows[0].comp_id);
        const keepDayIds: number[] = [];
        const keepEventIds: number[] = [];
        const keepSwimmerIds: number[] = [];


        for (let i = 0; i < days.length; i++) {
          const day = days[i];
          const parsedDayId = Number(day.day_id);
          const dayID = Number.isFinite(parsedDayId) && parsedDayId > 0 ? parsedDayId : maxDayId++;
          keepDayIds.push(dayID);

          await client.query(competitionQueries.upsertCompetitionDay, [
            dayID,
            compID,
            day.day_title,
            day.day_order,
          ]);

          for (let j = 0; j < day.events.length; j++) {
            const event = day.events[j];
            const parsedEventId = Number(event.event_id);
            const eventID = Number.isFinite(parsedEventId) && parsedEventId > 0 ? parsedEventId : maxEventId++;
            keepEventIds.push(eventID);

            await client.query(competitionQueries.upsertCompetitionEvent, [
              eventID,
              dayID,
              event.event_title,
              event.event_order,
            ]);

            for (let k = 0; k < event.swimmers.length; k++) {
              const swimmer = event.swimmers[k];
              const parsedSwimmerId = Number(swimmer.swimmer_id);
              const swimmerID = Number.isFinite(parsedSwimmerId) && parsedSwimmerId > 0 ? parsedSwimmerId : maxSwimmerId++;
              keepSwimmerIds.push(swimmerID);

              await client.query(competitionQueries.upsertSwimmerEntry, [
                swimmerID,
                eventID,
                swimmer.swimmer_name,
                swimmer.swimmer_time,
                swimmer.place_finish,
              ]);
            }
          }
        }

        await client.query(competitionQueries.deleteMissingSwimmersForCompetition, [compID, keepSwimmerIds]);
        await client.query(competitionQueries.deleteMissingEventsForCompetition, [compID, keepEventIds]);
        await client.query(competitionQueries.deleteMissingDaysForCompetition, [compID, keepDayIds]);


      // Commit transaction
      await client.query('COMMIT');
      return competitionId;

    } catch (error) {
      logLevels.error(`Error during sql rolling back transaction`);
      // Rollback on error
      await client.query('ROLLBACK');
      logLevels.error(`Failed to ${id < 0 ? 'create' : 'update'} competition`, { 
        userId, 
        competitionData: upDateData,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error(`Failed to ${id < 0 ? 'create' : 'update'} competition: ${error}`);
    } finally {
      // Always release client back to pool
      client.release();
    }
  }

}


export default new CompetitionService();
