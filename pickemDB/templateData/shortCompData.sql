-- Short sample competition data for improved_schema.sql
-- Status values in this schema: incomplete, upcoming, open, current, completed

WITH competitions_input AS (
  SELECT *
  FROM (
    VALUES
      ('Incomplete Spring Splash', TIMESTAMP '2026-08-18 09:00:00', 'incomplete', TIMESTAMP '2026-08-20 09:00:00', 'B', 'SCY'),
      ('Incomplete Harbor Invite', TIMESTAMP '2026-08-22 10:00:00', 'incomplete', TIMESTAMP '2026-08-24 10:00:00', 'W', 'LCM'),
      ('Upcoming Metro Challenge', TIMESTAMP '2026-08-25 12:00:00', 'upcoming', TIMESTAMP '2026-08-27 08:00:00', 'M', 'SCM'),
      ('Upcoming River Classic', TIMESTAMP '2026-08-29 12:00:00', 'upcoming', TIMESTAMP '2026-08-31 08:30:00', 'B', 'SCY'),
      ('Open Lakefront Invite', TIMESTAMP '2026-08-01 09:00:00', 'open', TIMESTAMP '2026-08-20 08:15:00', 'W', 'SCY'),
      ('Open Regional Trials', TIMESTAMP '2026-08-02 09:30:00', 'open', TIMESTAMP '2026-08-21 08:45:00', 'M', 'LCM'),
      ('Active Summer Showdown', TIMESTAMP '2026-08-10 08:00:00', 'current', TIMESTAMP '2026-08-12 07:30:00', 'W', 'LCM'),
      ('Active City Championships', TIMESTAMP '2026-08-11 09:00:00', 'current', TIMESTAMP '2026-08-13 07:00:00', 'M', 'SCM'),
      ('Completed Winter Trials', TIMESTAMP '2026-07-01 10:00:00', 'completed', TIMESTAMP '2026-07-03 09:00:00', 'B', 'SCY'),
      ('Completed State Finals', TIMESTAMP '2026-06-10 10:00:00', 'completed', TIMESTAMP '2026-06-12 09:30:00', 'W', 'LCM')
  ) AS v(title, entries_open, status, starts_on, gender, meet_type)
),
inserted_competitions AS (
  INSERT INTO Competitions (
    title,
    created_on,
    entries_open,
    status,
    starts_on,
    gender,
    meet_type
  )
  SELECT
    title,
    NOW(),
    entries_open,
    status,
    starts_on,
    gender,
    meet_type
  FROM competitions_input
  RETURNING comp_id, title
),
inserted_days AS (
  INSERT INTO CompetitionDays (
    comp_id,
    day_title,
    day_order
  )
  SELECT
    comp_id,
    'Day 1',
    1
  FROM inserted_competitions
  RETURNING day_id
),
inserted_events AS (
  INSERT INTO CompetitionEvent (
    day_id,
    event_title,
    event_order
  )
  SELECT
    day_id,
    '50 Freestyle',
    1
  FROM inserted_days
  RETURNING event_id
)
INSERT INTO Swimmers (
  event_id,
  swimmer_name,
  swimmer_time,
  place_finish
)
SELECT
  event_id,
  'Sample Swimmer',
  '52.34',
  1
FROM inserted_events;

