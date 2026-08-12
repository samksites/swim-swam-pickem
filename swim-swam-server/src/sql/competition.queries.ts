// SQL queries for competition operations
// Using PostgreSQL parameterized queries ($1, $2, etc.) for security

export const queryCompetitionInfoUsers = {

  // Get all competitions
  getAllCompetitions: `
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
    ORDER BY starts_on DESC
  `,
  // Get competition by ID
  getCompetitionById: `
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
    WHERE comp_id = $1
  `,

   // Get active competitions
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
    WHERE status IN ('upcoming', 'current')
      AND starts_on >= CURRENT_DATE
    ORDER BY starts_on ASC
  `,

  // Get competitions by status
  getCompetitionsByStatus: `
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
    WHERE status = $1
    ORDER BY starts_on DESC
  `,

  getCompetitionFullById: `
    SELECT
      c.comp_id,
      c.title,
      c.entries_open,
      c.status,
      c.starts_on,
      c.gender,
      c.meet_type,
      d.day_id,
      d.day_title,
      d.day_order,
      e.event_id,
      e.event_title,
      e.event_order,
      s.swimmer_id,
      s.swimmer_name,
      s.swimmer_time,
      s.place_finish
    FROM Competitions c
    LEFT JOIN CompetitionDays d ON d.comp_id = c.comp_id
    LEFT JOIN CompetitionEvent e ON e.day_id = d.day_id
    LEFT JOIN Swimmers s ON s.event_id = e.event_id
    WHERE c.comp_id = $1
    ORDER BY
      d.day_order ASC NULLS LAST,
      e.event_order ASC NULLS LAST,
      s.place_finish ASC NULLS LAST,
      s.swimmer_id ASC NULLS LAST
  `,

  

}

export const queryCompetitionInternalLogic = {
  // Additional internal queries can be added here
  getCompetitionDayAndEventIds: `
    SELECT d.day_id AS competition_day_id, e.event_id AS competition_event_id
  FROM Competitions c
  JOIN CompetitionDays d ON c.comp_id = d.comp_id
  JOIN CompetitionEvent e ON d.day_id = e.day_id
  WHERE c.comp_id = $1
  `,
}

export const buildCompetitionsFilterQueries = (
  conditions: string[],
  limitParamIndex: number,
  offsetParamIndex: number,
) => {
  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  return {
    dataQuery: `
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
      ${whereClause}
      ORDER BY starts_on DESC
      LIMIT $${limitParamIndex}
      OFFSET $${offsetParamIndex}
    `,
    countQuery: `
      SELECT COUNT(*)::int AS total_count
      FROM Competitions
      ${whereClause}
    `,
  };
};

export const competitionQueries = {

  // Upsert competition (insert or update on conflict)
  upsertCompetition: `
    INSERT INTO Competitions (comp_id, title, entries_open, status, starts_on, gender, meet_type)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (comp_id) DO UPDATE SET
      title = EXCLUDED.title,
      entries_open = EXCLUDED.entries_open,
      status = EXCLUDED.status,
      starts_on = EXCLUDED.starts_on,
      gender = EXCLUDED.gender,
      meet_type = EXCLUDED.meet_type
    RETURNING comp_id;
  `,
  insertCompetitionDay: `
    INSERT INTO CompetitionDays (day_id, comp_id, day_title, day_order)
    VALUES ($1, $2, $3, $4);
  `,
  upsertCompetitionDay: `
    INSERT INTO CompetitionDays (day_id, comp_id, day_title, day_order)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (day_id) DO UPDATE SET
      comp_id = EXCLUDED.comp_id,
      day_title = EXCLUDED.day_title,
      day_order = EXCLUDED.day_order;
  `,
  insertCompetitionEvent: `
    INSERT INTO CompetitionEvent (event_id, day_id, event_title, event_order)
    VALUES ($1, $2, $3, $4);
  `,
  upsertCompetitionEvent: `
    INSERT INTO CompetitionEvent (event_id, day_id, event_title, event_order)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (event_id) DO UPDATE SET
      day_id = EXCLUDED.day_id,
      event_title = EXCLUDED.event_title,
      event_order = EXCLUDED.event_order;
  `,
  insertSwimmerEntry: `
    INSERT INTO Swimmers (swimmer_id, event_id, swimmer_name, swimmer_time, place_finish)
    VALUES ($1, $2, $3, $4, $5);
  `,
  upsertSwimmerEntry: `
    INSERT INTO Swimmers (swimmer_id, event_id, swimmer_name, swimmer_time, place_finish)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (swimmer_id) DO UPDATE SET
      event_id = EXCLUDED.event_id,
      swimmer_name = EXCLUDED.swimmer_name,
      swimmer_time = EXCLUDED.swimmer_time,
      place_finish = EXCLUDED.place_finish;
  `,

  deleteMissingSwimmersForCompetition: `
    DELETE FROM Swimmers s
    USING CompetitionEvent e, CompetitionDays d
    WHERE s.event_id = e.event_id
      AND e.day_id = d.day_id
      AND d.comp_id = $1
      AND NOT (s.swimmer_id = ANY($2::int[]));
  `,

  deleteMissingEventsForCompetition: `
    DELETE FROM CompetitionEvent e
    USING CompetitionDays d
    WHERE e.day_id = d.day_id
      AND d.comp_id = $1
      AND NOT (e.event_id = ANY($2::int[]));
  `,

  deleteMissingDaysForCompetition: `
    DELETE FROM CompetitionDays d
    WHERE d.comp_id = $1
      AND NOT (d.day_id = ANY($2::int[]));
  `,

  getCompetitionMaxID: `
    SELECT MAX(comp_id) + 1 AS max_id FROM Competitions;
  `,

  getCompetitionDaysMaxID: `
    SELECT MAX(day_id) AS max_id FROM CompetitionDays;
  `,

  getCompetitionEventsMaxID: `
    SELECT MAX(event_id) AS max_id FROM CompetitionEvent;
  `,
  getMaxSwimmerID: `
    SELECT MAX(swimmer_id) AS max_id FROM Swimmers;
  `,

};

