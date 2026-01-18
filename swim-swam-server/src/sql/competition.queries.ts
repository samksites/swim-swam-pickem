// SQL queries for competition operations
// Using PostgreSQL parameterized queries ($1, $2, etc.) for security

export const queryCompetitionInfoUsers = {

  // Get all competitions
  getAllCompetitions: `
    SELECT 
      id,
      title,
      type,
      status,
      entries_close_date,
      start_date,
      gender,
      all_events,
      seed_times,
      created_at,
      updated_at
    FROM competitions
    ORDER BY start_date DESC
  `,
  // Get competition by ID
  getCompetitionById: `
    SELECT 
      id,
      title,
      type,
      status,
      entries_close_date,
      start_date,
      gender,
      all_events,
      seed_times,
      created_at,
      updated_at
    FROM competitions
    WHERE id = $1
  `,

   // Get active competitions (status = 1)
  getActiveCompetitions: `
    SELECT 
      id,
      title,
      type,
      entries_close_date,
      start_date,
      gender
    FROM competitions
    WHERE status = 1
    AND start_date >= CURRENT_DATE
    ORDER BY start_date ASC
  `,

  // Get competitions by status
  getCompetitionsByStatus: `
    SELECT 
      id,
      title,
      type,
      status,
      entries_close_date,
      start_date,
      gender
    FROM competitions
    WHERE status = $1
    ORDER BY start_date DESC
  `,

}

export const queryCompetitionInternalLogic = {
  // Additional internal queries can be added here
  getCompetitionDayAndEventIds: `
    SELECT d.day_id AS competition_day_id, e.event_id AS competition_event_id
  FROM Competitions c
  JOIN CompetitionDays d ON c.id = d.comp_id
  JOIN CompetitionEvents e ON d.day_id = e.day_comp_id
  WHERE c.id = $1
  `,
}

export const competitionQueries = {

  // Create new competition
  createCompetition: `
    INSERT INTO Competitions (event_name)
    VALUES ('')
    RETURNING comp_id;
  `,

  // Update competition
  updateCompetition: `
    UPDATE competitions
    SET 
      title = COALESCE($2, title),
      type = COALESCE($3, type),
      status = COALESCE($4, status),
      entries_close_date = COALESCE($5, entries_close_date),
      start_date = COALESCE($6, start_date),
      gender = COALESCE($7, gender),
      all_events = COALESCE($8, all_events),
      seed_times = COALESCE($9, seed_times),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `,
  
  // UPSERT competition days - Insert if not exists, Update if exists
  batchUpsertAndPruneCompetitionDays: `
    WITH incoming AS (
      SELECT $1::text AS comp_id, u.day_order, u.day_name
      FROM unnest($2::int[], $3::text[]) AS u(day_order, day_name)
    ),
    upserted AS (
      INSERT INTO CompetitionDays (comp_id, day_order, day_name)
      SELECT comp_id, day_order, day_name
      FROM incoming
      ON CONFLICT (comp_id, day_name)
      DO UPDATE SET
        day_order = EXCLUDED.day_order
      RETURNING
        day_id, comp_id, day_order, day_name,
        CASE WHEN xmax = 0 THEN 'inserted' ELSE 'updated' END AS operation
    ),
    pruned AS (
      DELETE FROM CompetitionDays cd
      WHERE cd.comp_id = $1
        AND cd.day_name NOT IN (SELECT day_name FROM incoming)
      RETURNING day_id, comp_id, day_order, day_name, 'deleted' AS operation
    )
    SELECT * FROM upserted
    UNION ALL
    SELECT * FROM pruned
    ORDER BY comp_id, day_order NULLS LAST, day_name;
  `,

  // Delete old competition days not in the provided list
  deleteOldCompetitionDays: `
    DELETE FROM CompetitionDays
    WHERE comp_id = $1
    AND day_name NOT IN (SELECT UNNEST(ARRAY[$2::text[]]))
  `,

  // Update existing competition days only (legacy - consider using upsert above)
  upsertSwimmer: `
    INSERT INTO Swimmers (swimmer_id, event_id, swimmer_name, place_finish, swimmer_time)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (swimmer_id)
    DO UPDATE SET
      event_id = COALESCE(EXCLUDED.event_id, Swimmers.event_id),
      swimmer_name = COALESCE(EXCLUDED.swimmer_name, Swimmers.swimmer_name),
      place_finish = COALESCE(EXCLUDED.place_finish, Swimmers.place_finish),
      swimmer_time = COALESCE(EXCLUDED.swimmer_time, Swimmers.swimmer_time),
      -- no updated_at in schema; add if needed
    RETURNING swimmer_id, event_id, swimmer_name, place_finish, swimmer_time, 'upsertSwimmer' AS operation
  `,

  // Delete competition
  deleteCompetition: `
    DELETE FROM competitions
    WHERE id = $1
    RETURNING id
  `,

  // Update competition status
  updateCompetitionStatus: `
    UPDATE competitions
    SET 
      status = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `,
};

