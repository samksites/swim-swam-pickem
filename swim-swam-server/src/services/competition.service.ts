// Competition Service
// Handles all business logic for competition operations

import { buildCompetitionsFilterQueries, competitionQueries, queryCompetitionInfoUsers } from '../sql/competition.queries';
import { userQueries } from '../sql/user.queries';
import { getClient, query } from './dbService';
import { CompetitionData } from '../models/competition.model';
import { logLevels } from './logger';

const MS_IN_DAY = 24 * 60 * 60 * 1000;

export class CompetitionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CompetitionValidationError';
  }
}

type CompetitionStatus = 'incomplete' | 'upcoming' | 'current' | 'completed';
type CompetitionGender = 'M' | 'W' | 'B';
type MeetType = 'SCY' | 'SCM' | 'LCM';
type CompetitionListFilters = {
  statuses?: CompetitionStatus[];
  search?: string;
  page?: number;
  pageSize?: number;
};

type CompetitionListResult = {
  items: any[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

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

interface CompetitionFullRow {
  comp_id: number;
  title: string;
  entries_open: string | null;
  status: CompetitionStatus;
  starts_on: string | null;
  gender: CompetitionGender;
  meet_type: MeetType;
  day_id: number | null;
  day_title: string | null;
  day_order: number | null;
  event_id: number | null;
  event_title: string | null;
  event_order: number | null;
  swimmer_id: number | null;
  swimmer_name: string | null;
  swimmer_time: string | null;
  place_finish: number | null;
}

const toPersistedId = (value?: string): string => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : '-1';
};

const mapStatus = (status: CompetitionData['status']): CompetitionStatus => {
  if (typeof status === 'number') {
    if (status <= -1) return 'incomplete';
    if (status === 2) return 'completed';
    if (status === 1) return 'current';
    return 'upcoming';
  }

  if (status === 'incomplete' || status === 'upcoming' || status === 'current' || status === 'completed') {
    return status;
  }

  const normalized = String(status).trim().toLowerCase();
  if (normalized === 'uncomplete' || normalized === 'uncompleted' || normalized === 'uncompleate') {
    return 'incomplete';
  }
  if (normalized === 'complete' || normalized === 'compleate') {
    return 'completed';
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

const mapDbGenderToFrontend = (gender: CompetitionGender): 'm' | 'w' | 'c' => {
  if (gender === 'M') return 'm';
  if (gender === 'W') return 'w';
  return 'c';
};

const mapDbTypeToFrontend = (type: MeetType): 'scy' | 'scm' | 'lcm' => {
  if (type === 'SCM') return 'scm';
  if (type === 'LCM') return 'lcm';
  return 'scy';
};

const parseIsoDateOnly = (value: string): Date | null => {
  const candidate = String(value ?? '').trim();
  const match = candidate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, monthIndex, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== monthIndex ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed;
};

const formatIsoDateOnly = (value: Date): string => {
  return value.toISOString().slice(0, 10);
};

const addDaysUtc = (value: Date, days: number): Date => {
  return new Date(value.getTime() + days * MS_IN_DAY);
};

const getTodayUtcDateOnly = (): Date => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

const normalizeDbCompetitionDatesForEditor = (
  status: CompetitionStatus,
  entriesOpenRaw: string | null,
  startsOnRaw: string | null,
): { entriesOpen: string; startsOn: string } => {
  let entriesDate = parseIsoDateOnly(entriesOpenRaw ?? '');
  let startsOnDate = parseIsoDateOnly(startsOnRaw ?? '');

  if (status === 'incomplete') {
    const todayUtc = getTodayUtcDateOnly();
    const tomorrowUtc = addDaysUtc(todayUtc, 1);

    if (!entriesDate || entriesDate.getTime() <= todayUtc.getTime()) {
      entriesDate = tomorrowUtc;
    }

    if (!startsOnDate || startsOnDate.getTime() < entriesDate.getTime()) {
      startsOnDate = addDaysUtc(entriesDate, 1);
    }
  }

  return {
    entriesOpen: entriesDate ? formatIsoDateOnly(entriesDate) : (entriesOpenRaw ?? ''),
    startsOn: startsOnDate ? formatIsoDateOnly(startsOnDate) : (startsOnRaw ?? ''),
  };
};

const validateCompetitionDates = (entriesCloseDate: string, startDate: string): void => {
  const entriesDate = parseIsoDateOnly(entriesCloseDate);
  if (!entriesDate) {
    throw new CompetitionValidationError('Competition entries close date must be a valid date (YYYY-MM-DD).');
  }

  const competitionStartDate = parseIsoDateOnly(startDate);
  if (!competitionStartDate) {
    throw new CompetitionValidationError('Competition start date must be a valid date (YYYY-MM-DD).');
  }

  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const earliestEntriesDate = new Date(todayUtc.getTime() + MS_IN_DAY);
  const earliestStartDate = new Date(entriesDate.getTime() + MS_IN_DAY);

  if (entriesDate.getTime() < earliestEntriesDate.getTime()) {
    throw new CompetitionValidationError('Competition entries close date must be at least 1 day from today.');
  }

  if (competitionStartDate.getTime() < earliestStartDate.getTime()) {
    throw new CompetitionValidationError('Competition start date must be at least 1 day after entries close date.');
  }
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
   * Get full competition details needed by the editor (days, events, swimmers).
   */
  async getCompetitionEditorDataById(id: string): Promise<CompetitionData | null> {
    try {
      const result = await query(queryCompetitionInfoUsers.getCompetitionFullById, [id]);
      const rows = result.rows as CompetitionFullRow[];

      if (rows.length === 0) {
        return null;
      }

      const firstRow = rows[0];
      const normalizedDates = normalizeDbCompetitionDatesForEditor(
        firstRow.status,
        firstRow.entries_open,
        firstRow.starts_on,
      );
      const daysMap = new Map<number, CompetitionData['days'][number]>();
      const eventsMap = new Map<string, CompetitionData['days'][number]['events'][number]>();

      for (const row of rows) {
        if (row.day_id != null && !daysMap.has(row.day_id)) {
          daysMap.set(row.day_id, {
            id: String(row.day_id),
            title: row.day_title ?? '',
            day_id: String(row.day_id),
            day_title: row.day_title ?? '',
            day_order: row.day_order ?? 0,
            events: [],
          });
        }

        if (row.day_id != null && row.event_id != null) {
          const eventKey = `${row.day_id}:${row.event_id}`;
          if (!eventsMap.has(eventKey)) {
            const day = daysMap.get(row.day_id);
            if (!day) continue;

            const event = {
              id: String(row.event_id),
              title: row.event_title ?? '',
              index: row.event_order ?? 0,
              event_id: String(row.event_id),
              event_title: row.event_title ?? '',
              event_order: row.event_order ?? 0,
              swimmers: [],
            };

            day.events.push(event);
            eventsMap.set(eventKey, event);
          }

          if (row.swimmer_id != null) {
            const event = eventsMap.get(eventKey);
            if (!event) continue;

            event.swimmers.push({
              id: String(row.swimmer_id),
              name: row.swimmer_name ?? '',
              time: row.swimmer_time,
              swimmer_id: String(row.swimmer_id),
              swimmer_name: row.swimmer_name ?? '',
              swimmer_time: row.swimmer_time,
              place_finish: row.place_finish ?? undefined,
            });
          }
        }
      }

      const days = Array.from(daysMap.values()).sort((a, b) => (a.day_order ?? 0) - (b.day_order ?? 0));
      for (const day of days) {
        day.events.sort((a, b) => (a.event_order ?? 0) - (b.event_order ?? 0));
      }

      return {
        id: String(firstRow.comp_id),
        comp_id: String(firstRow.comp_id),
        title: firstRow.title,
        entriesCloseDate: normalizedDates.entriesOpen,
        entries_open: normalizedDates.entriesOpen,
        status: firstRow.status,
        startDate: normalizedDates.startsOn,
        starts_on: normalizedDates.startsOn,
        gender: mapDbGenderToFrontend(firstRow.gender),
        type: mapDbTypeToFrontend(firstRow.meet_type),
        meet_type: firstRow.meet_type,
        days,
      };
    } catch (error) {
      throw new Error(`Failed to get full competition data: ${error}`);
    }
  }

  /**
   * Get competitions by status
   */
  async getCompetitionsByStatus(status: CompetitionStatus) {
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
      const result = await query(userQueries.getActiveCompetitions);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get active competitions: ${error}`);
    }
  }

  /**
   * Get competitions using status and search filters.
   */
  async getCompetitionsByFilters(filters: CompetitionListFilters): Promise<CompetitionListResult> {
    try {
      const statuses = (filters.statuses ?? []).filter(Boolean);
      const search = String(filters.search ?? '').trim();
      const page = Math.max(1, Number(filters.page ?? 1));
      const pageSize = Math.max(1, Number(filters.pageSize ?? 10));
      const offset = (page - 1) * pageSize;

      const conditions: string[] = [];
      const params: Array<string[] | string> = [];

      if (statuses.length > 0) {
        params.push(statuses);
        conditions.push(`status = ANY($${params.length}::text[])`);
      }

      if (search.length > 0) {
        params.push(`%${search}%`);
        conditions.push(`title ILIKE $${params.length}`);
      }

      const limitParamIndex = params.length + 1;
      const offsetParamIndex = params.length + 2;
      const queries = buildCompetitionsFilterQueries(conditions, limitParamIndex, offsetParamIndex);

      const countResult = await query(queries.countQuery, params as any[]);
      const totalCount = Number(countResult.rows[0]?.total_count ?? 0);

      const dataParams = [...params, pageSize, offset];
      const dataResult = await query(queries.dataQuery, dataParams as any[]);

      return {
        items: dataResult.rows,
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      };
    } catch (error) {
      throw new Error(`Failed to get competitions by filters: ${error}`);
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
    validateCompetitionDates(normalizedData.entries_open, normalizedData.starts_on);
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
